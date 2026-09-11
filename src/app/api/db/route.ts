import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Admin Supabase Client with Service Role Key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, accion, table, payload, id, pk = 'id', licitaciones } = body

    const admin: any = supabaseAdmin

    const act = String(action || accion || '').toLowerCase().trim()
    // Handler Especial para Sincronización Diaria desde Microsoft Excel 365 (SharePoint)
    if (act === 'sync_excel_licitaciones' || table === 'sync_excel_licitaciones' || table === 'licitaciones_ofertas_sync') {
      const itemsToSync = licitaciones || payload || []
      if (!Array.isArray(itemsToSync) || itemsToSync.length === 0) {
        return NextResponse.json({ success: true, message: 'No hay licitaciones para sincronizar', synced: 0 })
      }

      // 1. Obtener Catálogos Maestros para Foreign Keys
      const [clientesRes, empresasRes, estatusRes, personasRes] = await Promise.all([
        admin.from('clientes').select('cliente_id, nombre_cliente'),
        admin.from('empresas').select('empresa_id, nombre_empresa'),
        admin.from('estatus').select('estatus_id, nombre_estatus'),
        admin.from('personas').select('persona_id, nombre_completo')
      ])

      const clientesMap = new Map<string, number>()
      clientesRes.data?.forEach((c: any) => clientesMap.set(c.nombre_cliente.toLowerCase().trim(), c.cliente_id))

      const defaultEmpresaId = empresasRes.data?.[0]?.empresa_id || 1
      const defaultEstatusId = estatusRes.data?.find((e: any) => e.nombre_estatus.toLowerCase().includes('pendiente') || e.nombre_estatus.toLowerCase().includes('en progreso'))?.estatus_id || 5
      const defaultPersonaId = personasRes.data?.[0]?.persona_id || 1

      // 2. Pre-identificar clientes nuevos necesarios y crearlos en batch
      const neededClients = new Set<string>()
      for (const lic of itemsToSync) {
        const rawCli = (lic.cliente || lic.institucion || lic['Cliente'] || lic['INS'] || 'MINSAL').toString().trim()
        if (rawCli && !clientesMap.has(rawCli.toLowerCase())) {
          let found = false
          for (const [name] of clientesMap.entries()) {
            if (rawCli.toLowerCase().includes(name) || name.includes(rawCli.toLowerCase())) {
              found = true
              break
            }
          }
          if (!found) {
            neededClients.add(rawCli)
          }
        }
      }

      if (neededClients.size > 0) {
        const newClientRows = Array.from(neededClients).map(name => ({
          nombre_cliente: name,
          tipo_institucion_id: 1,
          activo: true
        }))
        const { data: createdClients } = await admin.from('clientes').insert(newClientRows).select('cliente_id, nombre_cliente')
        createdClients?.forEach((c: any) => clientesMap.set(c.nombre_cliente.toLowerCase().trim(), c.cliente_id))
      }

      // 3. Obtener licitaciones ya existentes para no duplicar
      const { data: existingLics } = await admin.from('licitaciones_ofertas').select('licitacion_oferta_id, numero_oferta')
      const existingMap = new Map<string, string>()
      existingLics?.forEach((l: any) => {
        if (l.numero_oferta) existingMap.set(l.numero_oferta.toLowerCase().trim(), l.licitacion_oferta_id)
      })

      const monthMap: Record<string, string> = {
        'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04', 'MAYO': '05', 'JUNIO': '06',
        'JULIO': '07', 'AGOSTO': '08', 'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12'
      }

      const toInsert: any[] = []
      const toUpdate: { id: string; payload: any }[] = []
      const seenInBatch = new Set<string>()

      for (const lic of itemsToSync) {
        const numOferta = (lic.no_oferta || lic.numero_oferta || lic['No. Oferta'] || '').toString().trim()
        const nomOferta = (lic.nombre_oferta || lic['Nombre Oferta'] || 'Licitación Suministro').toString().trim()
        const rawCliente = (lic.cliente || lic.institucion || lic['Cliente'] || lic['INS'] || 'MINSAL').toString().trim()
        const rawMes = (lic.mes || lic['Mes'] || 'MARZO').toString().toUpperCase().trim()
        const rawAnio = (lic.anio || lic.año || lic['AÑO'] || '2026').toString().trim()
        const tipoProceso = (lic.tipo_proceso || lic['TIPO DE PROCESO'] || 'LICITACIÓN').toString().trim()
        const presentacion = (lic.presentacion || lic['Presentación'] || '').toString().trim()

        if (!numOferta && !nomOferta) continue

        const key = (numOferta || nomOferta).toLowerCase()
        if (seenInBatch.has(key)) continue
        seenInBatch.add(key)

        let clienteId = clientesMap.get(rawCliente.toLowerCase())
        if (!clienteId) {
          for (const [name, id] of clientesMap.entries()) {
            if (rawCliente.toLowerCase().includes(name) || name.includes(rawCliente.toLowerCase())) {
              clienteId = id
              break
            }
          }
          if (!clienteId) clienteId = 13 // Fallback ISSS
        }

        const mesNum = monthMap[rawMes] || '03'
        const fechaPresentacion = `${rawAnio}-${mesNum}-01`
        const observaciones = `TIPO: ${tipoProceso} | Presentación: ${presentacion || 'N/A'} | Fuente: Excel 365 SharePoint`

        const existingId = numOferta ? existingMap.get(numOferta.toLowerCase()) : null

        if (existingId) {
          toUpdate.push({
            id: existingId,
            payload: {
              nombre_oferta: nomOferta,
              cliente_id: clienteId,
              empresa_id: defaultEmpresaId,
              fecha_presentacion: fechaPresentacion,
              observaciones,
              actualizado_en: new Date().toISOString()
            }
          })
        } else {
          toInsert.push({
            numero_oferta: numOferta || `OF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            nombre_oferta: nomOferta,
            empresa_id: defaultEmpresaId,
            cliente_id: clienteId,
            fecha_presentacion: fechaPresentacion,
            estatus_id: defaultEstatusId,
            persona_id: defaultPersonaId,
            observaciones
          })
        }
      }

      // 4. Ejecutar inserciones en bulk y actualizaciones en lotes concurrentes
      let insertedCount = 0
      let updatedCount = 0

      if (toInsert.length > 0) {
        // Inserción en bloques de 100
        for (let i = 0; i < toInsert.length; i += 100) {
          const chunk = toInsert.slice(i, i + 100)
          const { error: insErr } = await admin.from('licitaciones_ofertas').insert(chunk)
          if (!insErr) {
            insertedCount += chunk.length
          } else {
            console.error('Error en batch insert licitaciones:', insErr)
          }
        }
      }

      if (toUpdate.length > 0) {
        // Actualizaciones concurrentes en bloques de 20
        for (let i = 0; i < toUpdate.length; i += 20) {
          const chunk = toUpdate.slice(i, i + 20)
          await Promise.all(chunk.map(item =>
            admin.from('licitaciones_ofertas').update(item.payload).eq('licitacion_oferta_id', item.id)
          ))
          updatedCount += chunk.length
        }
      }

      // 5. SINCRONIZACIÓN HIJA EN TABLA 'ofertas_items' (445+ Renglones/Productos)
      // Refrescar mapa de licitaciones maestras
      const { data: allLics } = await admin.from('licitaciones_ofertas').select('licitacion_oferta_id, numero_oferta')
      const masterMap = new Map<string, string>()
      allLics?.forEach((l: any) => {
        if (l.numero_oferta) masterMap.set(l.numero_oferta.toLowerCase().trim(), l.licitacion_oferta_id)
      })

      // Pre-crear productos faltantes en bulk con columnas correctas
      const neededProducts = new Set<string>()
      for (const lic of itemsToSync) {
        const prodName = (lic.producto || lic.nombre_oferta || '').toString().trim()
        if (prodName && !prodsMap.has(prodName.toLowerCase())) {
          let found = false
          for (const [name] of prodsMap.entries()) {
            if (prodName.toLowerCase().includes(name) || name.includes(prodName.toLowerCase())) {
              found = true
              break
            }
          }
          if (!found) neededProducts.add(prodName)
        }
      }

      if (neededProducts.size > 0) {
        const newProdRows = Array.from(neededProducts).map((name, idx) => ({
          nombre_producto_equipo: (name || 'Producto').slice(0, 140),
          codigo_sku: `EX-${Date.now().toString().slice(-6)}-${idx + 1}`,
          marca_id: 1, // STANDARD DIAG
          es_equipo: false,
          unidad_medida: 'Unidad',
          activo: true
        }))

        for (let i = 0; i < newProdRows.length; i += 100) {
          const chunk = newProdRows.slice(i, i + 100)
          const { data: createdProds } = await admin.from('productos_equipo').insert(chunk).select('producto_equipo_id, nombre_producto_equipo')
          createdProds?.forEach((p: any) => prodsMap.set(p.nombre_producto_equipo.toLowerCase().trim(), p.producto_equipo_id))
        }
      }

      const defaultProductId = 1

      // Limpiar ofertas_items anteriores de estas licitaciones para sincronización idempotente
      const activeMasterIds = Array.from(masterMap.values())
      if (activeMasterIds.length > 0) {
        for (let i = 0; i < activeMasterIds.length; i += 50) {
          const chunkIds = activeMasterIds.slice(i, i + 50)
          await admin.from('ofertas_items').delete().in('licitacion_oferta_id', chunkIds)
        }
      }

      const ofertaProductSeen = new Map<string, boolean>()
      const ofertaRenglonCounter = new Map<string, number>()
      const itemsToInsert: any[] = []
      const extraProductsToCreate: any[] = []

      for (const lic of itemsToSync) {
        const numOferta = (lic.no_oferta || lic.numero_oferta || lic['No. Oferta'] || '').toString().trim()
        const licId = masterMap.get(numOferta.toLowerCase())
        if (!licId) continue

        const currentRenglon = (ofertaRenglonCounter.get(licId) || 0) + 1
        ofertaRenglonCounter.set(licId, currentRenglon)

        let prodName = (lic.producto || lic['Producto'] || lic.nombre_oferta || `Producto Renglón ${currentRenglon}`).toString().trim()
        let prodId = prodsMap.get(prodName.toLowerCase())

        if (!prodId) {
          for (const [name, id] of prodsMap.entries()) {
            if (prodName.toLowerCase().includes(name) || name.includes(prodName.toLowerCase())) {
              prodId = id
              break
            }
          }
        }
        if (!prodId) prodId = defaultProductId

        const pairKey = `${licId}_${prodId}`
        if (ofertaProductSeen.has(pairKey)) {
          extraProductsToCreate.push({
            licId,
            currentRenglon,
            prodName: `${prodName} (Rngl. ${currentRenglon} - ${numOferta})`.slice(0, 140),
            lic
          })
          continue
        }

        ofertaProductSeen.set(pairKey, true)

        const rawQty = lic.cantidad || lic['Cantidad (unitaria)'] || lic['Cantidad'] || 1
        const cleanQty = typeof rawQty === 'number' ? rawQty : (parseFloat(String(rawQty).replace(/[^0-9.-]+/g, '')) || 1)

        const rawPrice = lic.precio_unitario || lic['Precio (unitario)'] || lic['Precio unitario'] || 0
        const cleanPrice = typeof rawPrice === 'number' ? rawPrice : (parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, '')) || 0)

        const rawStatus = (lic.estatus_item || lic['Estatus'] || lic['ESTADO'] || '').toString().toLowerCase()
        const esAdjudicado = rawStatus.includes('adjudicad') || rawStatus.includes('ganad')

        itemsToInsert.push({
          licitacion_oferta_id: licId,
          producto_equipo_id: prodId,
          renglon_numero: currentRenglon,
          cantidad: Math.max(1, cleanQty),
          precio_unitario: Math.max(0, cleanPrice),
          es_adjudicado: esAdjudicado
        })
      }

      if (extraProductsToCreate.length > 0) {
        const extraRows = extraProductsToCreate.map((e, idx) => ({
          nombre_producto_equipo: e.prodName,
          codigo_sku: `EX-D-${Date.now().toString().slice(-6)}-${idx + 1}`,
          marca_id: 1,
          es_equipo: false,
          unidad_medida: 'Unidad',
          activo: true
        }))

        const { data: createdExtra } = await admin.from('productos_equipo').insert(extraRows).select('producto_equipo_id')
        if (createdExtra) {
          createdExtra.forEach((p: any, idx: number) => {
            const itemContext = extraProductsToCreate[idx]
            const rawQty = itemContext.lic.cantidad || itemContext.lic['Cantidad (unitaria)'] || 1
            const cleanQty = typeof rawQty === 'number' ? rawQty : (parseFloat(String(rawQty).replace(/[^0-9.-]+/g, '')) || 1)
            const rawPrice = itemContext.lic.precio_unitario || itemContext.lic['Precio (unitario)'] || 0
            const cleanPrice = typeof rawPrice === 'number' ? rawPrice : (parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, '')) || 0)
            const rawStatus = (itemContext.lic.estatus_item || itemContext.lic['Estatus'] || '').toString().toLowerCase()

            itemsToInsert.push({
              licitacion_oferta_id: itemContext.licId,
              producto_equipo_id: p.producto_equipo_id,
              renglon_numero: itemContext.currentRenglon,
              cantidad: Math.max(1, cleanQty),
              precio_unitario: Math.max(0, cleanPrice),
              es_adjudicado: rawStatus.includes('adjudicad') || rawStatus.includes('ganad')
            })
          })
        }
      }

      let itemsInsertedCount = 0
      if (itemsToInsert.length > 0) {
        for (let i = 0; i < itemsToInsert.length; i += 100) {
          const chunk = itemsToInsert.slice(i, i + 100)
          const { error: itemErr } = await admin.from('ofertas_items').insert(chunk)
          if (!itemErr) {
            itemsInsertedCount += chunk.length
          } else {
            console.error('Error insertando ofertas_items:', itemErr)
          }
        }
      }

      return NextResponse.json({
        success: true,
        estructura: 'Maestro-Detalle (3FN)',
        tabla_maestra: 'licitaciones_ofertas',
        total_maestras: activeMasterIds.length,
        tabla_detalle: 'ofertas_items',
        total_items_ofertados: itemsInsertedCount,
        total_recibidos: itemsToSync.length,
        timestamp: new Date().toISOString()
      }, { status: 200 })
    }

    if (!table) {
      return NextResponse.json({ error: 'Falta especificar la tabla' }, { status: 400 })
    }

    switch (action) {
      case 'insert': {
        let finalPayload = { ...payload }

        // Si la tabla es users, sincronizar con auth.users y asignar rol_id
        if (table === 'users') {
          finalPayload.rol_id = finalPayload.rol_id || '43b02f0d-ad63-4acb-bddf-ea38406f11b6'
          if (finalPayload.activo === undefined) finalPayload.activo = true

          if (!finalPayload.id && finalPayload.email) {
            try {
              // 1. Verificar si ya existe en auth.users
              const { data: userList } = await admin.auth.admin.listUsers()
              const existingAuthUser = userList?.users?.find(
                (u: any) => u.email?.toLowerCase() === finalPayload.email?.toLowerCase()
              )

              if (existingAuthUser) {
                finalPayload.id = existingAuthUser.id
              } else {
                // 2. Crear en auth.users
                const { data: newAuthUser, error: authErr } = await admin.auth.admin.createUser({
                  email: finalPayload.email,
                  password: payload.password || 'LabMed2026!',
                  email_confirm: true,
                  user_metadata: {
                    nombre: finalPayload.nombre,
                    apellido: finalPayload.apellido,
                    departamento: finalPayload.departamento
                  }
                })

                if (!authErr && newAuthUser?.user?.id) {
                  finalPayload.id = newAuthUser.user.id
                } else if (authErr) {
                  console.error('Error creating auth user:', authErr)
                  throw new Error(`Error en autenticación: ${authErr.message}`)
                }
              }
            } catch (authError: any) {
              console.error('Auth user sync error:', authError)
              throw authError
            }
          }
        }

        const { data, error } = await admin
          .from(table)
          .insert(finalPayload)
          .select('*')
        if (error) throw error
        return NextResponse.json({ success: true, data }, { status: 201 })
      }

      case 'upsert': {
        const { onConflict } = body
        const { data, error } = await admin
          .from(table)
          .upsert(payload, onConflict ? { onConflict } : undefined)
          .select('*')
        if (error) throw error
        return NextResponse.json({ success: true, data }, { status: 200 })
      }

      case 'update': {
        if (id === undefined || id === null) {
          return NextResponse.json({ error: 'Falta especificar el ID para actualizar' }, { status: 400 })
        }
        const { data, error } = await admin
          .from(table)
          .update(payload)
          .eq(pk, id)
          .select('*')
        if (error) throw error
        return NextResponse.json({ success: true, data }, { status: 200 })
      }

      case 'delete': {
        if (id === undefined || id === null) {
          return NextResponse.json({ error: 'Falta especificar el ID para eliminar' }, { status: 400 })
        }
        const { error } = await admin
          .from(table)
          .delete()
          .eq(pk, id)
        if (error) throw error

        // Si es usuario, eliminar también de auth.users si es posible
        if (table === 'users') {
          try {
            await admin.auth.admin.deleteUser(String(id))
          } catch (authDelErr) {
            console.warn('Auth user deletion warning:', authDelErr)
          }
        }

        return NextResponse.json({ success: true }, { status: 200 })
      }

      case 'select': {
        const { select = '*', limit = 500, range, order, ascending = true } = body
        if (limit > 1000 && table === 'productos_equipo') {
          // Fetch all pages up to limit
          const [p1, p2] = await Promise.all([
            admin.from(table).select(select).range(0, 999).order(order || 'nombre_producto_equipo', { ascending }),
            admin.from(table).select(select).range(1000, 1999).order(order || 'nombre_producto_equipo', { ascending })
          ])
          if (p1.error) throw p1.error
          const combined = [...(p1.data || []), ...(p2.data || [])]
          return NextResponse.json({ success: true, data: combined }, { status: 200 })
        }
        
        let query = admin.from(table).select(select)
        if (range && Array.isArray(range) && range.length === 2) {
          query = query.range(range[0], range[1])
        } else if (limit) {
          query = query.limit(limit)
        }
        if (order) query = query.order(order, { ascending })
        const { data, error } = await query
        if (error) throw error
        return NextResponse.json({ success: true, data }, { status: 200 })
      }

      default:
        return NextResponse.json({ error: `Acción no soportada: ${action}` }, { status: 400 })
    }
  } catch (err: any) {
    console.error('API DB Error:', err)
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor en la base de datos' },
      { status: 500 }
    )
  }
}
