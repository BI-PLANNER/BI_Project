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

    // Handler Especial para Sincronización Diaria desde Microsoft Excel 365 (SharePoint)
    if (action === 'sync_excel_licitaciones' || accion === 'SYNC_EXCEL_LICITACIONES' || table === 'sync_excel_licitaciones') {
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

      // 2. Obtener licitaciones ya existentes para no duplicar
      const { data: existingLics } = await admin.from('licitaciones_ofertas').select('licitacion_oferta_id, numero_oferta')
      const existingMap = new Map<string, string>()
      existingLics?.forEach((l: any) => {
        if (l.numero_oferta) existingMap.set(l.numero_oferta.toLowerCase().trim(), l.licitacion_oferta_id)
      })

      const monthMap: Record<string, string> = {
        'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04', 'MAYO': '05', 'JUNIO': '06',
        'JULIO': '07', 'AGOSTO': '08', 'SEPTIEMBRE': '09', 'OCTUBRE': '10', 'NOVIEMBRE': '11', 'DICIEMBRE': '12'
      }

      let insertedCount = 0
      let updatedCount = 0

      for (const lic of itemsToSync) {
        const numOferta = (lic.no_oferta || lic.numero_oferta || lic['No. Oferta'] || '').toString().trim()
        const nomOferta = (lic.nombre_oferta || lic['Nombre Oferta'] || 'Licitación Suministro').toString().trim()
        const rawCliente = (lic.cliente || lic.institucion || lic['Cliente'] || lic['INS'] || 'MINSAL').toString().trim()
        const rawMes = (lic.mes || lic['Mes'] || 'MARZO').toString().toUpperCase().trim()
        const rawAnio = (lic.anio || lic.año || lic['AÑO'] || '2026').toString().trim()
        const tipoProceso = (lic.tipo_proceso || lic['TIPO DE PROCESO'] || 'LICITACIÓN').toString().trim()
        const presentacion = (lic.presentacion || lic['Presentación'] || '').toString().trim()

        if (!numOferta && !nomOferta) continue

        // Resolver o registrar cliente
        let clienteId = clientesMap.get(rawCliente.toLowerCase())
        if (!clienteId) {
          // Buscar coincidencia parcial (ej. ISSS, MINSAL)
          for (const [name, id] of clientesMap.entries()) {
            if (rawCliente.toLowerCase().includes(name) || name.includes(rawCliente.toLowerCase())) {
              clienteId = id
              break
            }
          }
          if (!clienteId) {
            // Crear nuevo cliente institucional
            const { data: newCli } = await admin.from('clientes').insert({
              nombre_cliente: rawCliente,
              tipo_institucion_id: 1,
              activo: true
            }).select('cliente_id').single()
            if (newCli) {
              clienteId = newCli.cliente_id
              clientesMap.set(rawCliente.toLowerCase(), clienteId)
            } else {
              clienteId = 13 // Fallback ISSS
            }
          }
        }

        const mesNum = monthMap[rawMes] || '03'
        const fechaPresentacion = `${rawAnio}-${mesNum}-01`

        const observaciones = `TIPO: ${tipoProceso} | Presentación: ${presentacion || 'N/A'} | Fuente: Excel 365 SharePoint`

        const existingId = existingMap.get(numOferta.toLowerCase())

        if (existingId) {
          // Actualizar registro existente
          await admin.from('licitaciones_ofertas').update({
            nombre_oferta: nomOferta,
            cliente_id: clienteId,
            empresa_id: defaultEmpresaId,
            fecha_presentacion: fechaPresentacion,
            observaciones,
            actualizado_en: new Date().toISOString()
          }).eq('licitacion_oferta_id', existingId)
          updatedCount++
        } else {
          // Insertar nuevo registro
          const { data: inserted } = await admin.from('licitaciones_ofertas').insert({
            numero_oferta: numOferta,
            nombre_oferta: nomOferta,
            empresa_id: defaultEmpresaId,
            cliente_id: clienteId,
            fecha_presentacion: fechaPresentacion,
            estatus_id: defaultEstatusId,
            persona_id: defaultPersonaId,
            observaciones
          }).select('licitacion_oferta_id').single()

          if (inserted) {
            existingMap.set(numOferta.toLowerCase(), inserted.licitacion_oferta_id)
            insertedCount++
          }
        }
      }

      return NextResponse.json({
        success: true,
        tabla_destino: 'licitaciones_ofertas',
        total_recibidos: itemsToSync.length,
        nuevos_insertados: insertedCount,
        actualizados: updatedCount,
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
