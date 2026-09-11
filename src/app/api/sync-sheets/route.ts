import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

const N8N_HOST = 'n8n.cyberedu.my'
const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZDk5YWZiMi02NjczLTQ2MjctYTI0ZS0zNmI2MDU4YTgzODUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMzA0ZTgzMGUtZGJlNC00NDg1LWI3OTUtODMzYTlmMzM1ZDc5IiwiaWF0IjoxNzg4OTkxMTQ0fQ.AI8bX7_X8dGOYFHd8TTlIz_pri1yZAea6qh38XE6NwY'

async function getLatestN8nExecItems() {
  if (!N8N_API_KEY) return []

  try {
    const listRes = await fetch(`https://${N8N_HOST}/api/v1/executions?limit=10`, {
      headers: {
        'Accept': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      },
      cache: 'no-store'
    })

    if (!listRes.ok) return []
    const listData = await listRes.json()
    const successExecs = listData.data?.filter((e: any) => e.status === 'success') || []
    const latestId = successExecs[0]?.id || '1040'

    const detailRes = await fetch(`https://${N8N_HOST}/api/v1/executions/${latestId}?includeData=true`, {
      headers: {
        'Accept': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      },
      cache: 'no-store'
    })

    if (!detailRes.ok) return []
    const detail = await detailRes.json()
    const runData = detail.data?.resultData?.runData || {}

    let excelNode = runData['Microsoft Excel 365: REPORTE DE LICITACIONES'] || runData['Mapear Licitaciones Excel 365 (3FN)']
    if (!excelNode) {
      for (const k of Object.keys(runData)) {
        if (k.toLowerCase().includes('excel') || k.toLowerCase().includes('mapear') || k.toLowerCase().includes('licitaciones')) {
          excelNode = runData[k]
          break
        }
      }
    }

    const rawItems = excelNode?.[0]?.data?.main?.[0] || []
    return rawItems
  } catch (err) {
    console.error('Error fetching n8n execution data:', err)
    return []
  }
}

export async function POST() {
  try {
    // 1. Trigger webhook if available
    try {
      await fetch(`https://${N8N_HOST}/webhook/sync-sheets-supabase`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }).catch(() => null)
    } catch (_) {}

    // 2. Fetch raw items from latest n8n execution
    const rawItems = await getLatestN8nExecItems()

    if (rawItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Sincronización procesada. No se encontraron nuevos renglones en la ejecución de Excel.'
      })
    }

    const admin: any = supabaseAdmin

    // 3. Fetch catalogs
    const [clientesRes, empresasRes, estatusRes, personasRes, prodsRes, marcasRes] = await Promise.all([
      admin.from('clientes').select('cliente_id, nombre_cliente'),
      admin.from('empresas').select('empresa_id, nombre_empresa'),
      admin.from('estatus').select('estatus_id, nombre_estatus'),
      admin.from('personas').select('persona_id, nombre_completo'),
      admin.from('productos_equipo').select('producto_equipo_id, nombre_producto_equipo'),
      admin.from('marcas').select('marca_id, nombre_marca')
    ])

    const clientesMap = new Map<string, number>()
    clientesRes.data?.forEach((c: any) => clientesMap.set(c.nombre_cliente.toLowerCase().trim(), c.cliente_id))

    const prodsMap = new Map<string, number>()
    prodsRes.data?.forEach((p: any) => {
      if (p.nombre_producto_equipo) prodsMap.set(p.nombre_producto_equipo.toLowerCase().trim(), p.producto_equipo_id)
    })

    const marcasMap = new Map<string, number>()
    marcasRes.data?.forEach((m: any) => marcasMap.set(m.nombre_marca.toLowerCase().trim(), m.marca_id))

    function getMarcaId(brandStr: string): number {
      if (!brandStr) return 1
      const b = brandStr.toLowerCase().trim()
      if (marcasMap.has(b)) return marcasMap.get(b)!
      for (const [name, id] of marcasMap.entries()) {
        if (b.includes(name) || name.includes(b)) return id
      }
      return 1
    }

    const defaultEmpresaId = empresasRes.data?.[0]?.empresa_id || 1
    const defaultEstatusId = estatusRes.data?.find((e: any) => e.nombre_estatus.toLowerCase().includes('pendiente') || e.nombre_estatus.toLowerCase().includes('en progreso'))?.estatus_id || 5
    const defaultPersonaId = personasRes.data?.[0]?.persona_id || 1

    const itemsToSync = rawItems.map((item: any) => {
      const r = item.json?.licitaciones ? item.json : (item.json || {})
      if (r.licitaciones && Array.isArray(r.licitaciones)) return r.licitaciones

      return {
        no_oferta: String(r['No. Oferta'] || r['No Oferta'] || r['Oferta'] || '').trim(),
        nombre_oferta: String(r['Nombre Oferta'] || r['Nombre de Oferta'] || '').trim(),
        cliente: String(r['Cliente'] || r['CLIENTE'] || '').trim(),
        institucion: String(r['INST.'] || 'MINSAL').trim(),
        empresa: String(r['EMPR'] || 'LABYMED').trim(),
        tipo_proceso: String(r['TIPO DE PROCESO '] || r['TIPO DE PROCESO'] || 'LICITACION COMPETITIVA').trim(),
        anio: String(r['AÑO'] || '2025').trim(),
        mes: String(r['Mes'] || 'ENERO').trim().toUpperCase(),
        presentacion: r['Presentación de oferta (Fecha)'] || r['Presentación'] || '',
        producto: String(r['Producto'] || '').trim(),
        marca: String(r['Marca'] || '').trim(),
        precio_unitario: r['Precio (unitario)'] !== undefined ? r['Precio (unitario)'] : 0,
        cantidad: r['Cantidad (unitaria)'] !== undefined ? r['Cantidad (unitaria)'] : 1,
        total_ofertado: r['Total Ofertado'] !== undefined ? r['Total Ofertado'] : 0,
        estatus_item: String(r['Estatus'] || r['ESTADO'] || '').trim(),
        precio_adjudicado: r['Precio adjudicado '] !== undefined ? r['Precio adjudicado '] : (r['Precio adjudicado'] || 0),
        empresa_adjudicada: String(r['Empresa adjudicada'] || r['Empresa adjudicada '] || '').trim(),
        razon: String(r['Razon'] || r['Razon '] || '').trim(),
        no_contrato: String(r['No. De Contrato'] || r['No. Contrato'] || '').trim(),
        observaciones: String(r['Observaciones'] || '').trim()
      }
    }).flat().filter((i: any) => i.no_oferta || i.nombre_oferta || i.producto)

    // Pre-create missing clients
    const neededClients = new Set<string>()
    for (const lic of itemsToSync) {
      const rawCli = (lic.cliente || lic.institucion || 'MINSAL').toString().trim()
      if (rawCli && !clientesMap.has(rawCli.toLowerCase())) {
        let found = false
        for (const [name] of clientesMap.entries()) {
          if (rawCli.toLowerCase().includes(name) || name.includes(rawCli.toLowerCase())) {
            found = true
            break
          }
        }
        if (!found) neededClients.add(rawCli)
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

    // Pre-create missing products
    const neededProducts = new Set<string>()
    for (const lic of itemsToSync) {
      const prodName = (lic.producto || lic.nombre_oferta || '').toString().trim()
      if (prodName && !prodsMap.has(prodName.toLowerCase())) {
        neededProducts.add(prodName)
      }
    }

    if (neededProducts.size > 0) {
      const newProdRows = Array.from(neededProducts).map((name, idx) => ({
        nombre_producto_equipo: (name || 'Producto').slice(0, 140),
        codigo_sku: `EX-${Date.now().toString().slice(-6)}-${idx + 1}`,
        marca_id: 1,
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

    // Sync licitaciones_ofertas (Master)
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
      const numOferta = (lic.no_oferta || '').toString().trim()
      const nomOferta = (lic.nombre_oferta || 'Licitación Suministro').toString().trim()
      const rawCliente = (lic.cliente || lic.institucion || 'MINSAL').toString().trim()
      const rawMes = (lic.mes || 'ENERO').toString().toUpperCase().trim()
      const rawAnio = (lic.anio || '2025').toString().trim()
      const tipoProceso = (lic.tipo_proceso || 'LICITACIÓN').toString().trim()
      const presentacion = (lic.presentacion || '').toString().trim()
      const empRaw = (lic.empresa || 'LABYMED').toString().toUpperCase().trim()

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
        if (!clienteId) clienteId = 13
      }

      let empresaId = 3 // LABYMED default
      let empFinal = 'LABYMED'
      if (empRaw.includes('LAB&MED') || empRaw.includes('LAB & MED') || empRaw.includes('LABANDMED')) {
        empresaId = 1
        empFinal = 'LAB&MED'
      } else if (empRaw.includes('DIAGNOSAL') || nomOferta.toUpperCase().includes('DIAGNOSAL') || nomOferta.toUpperCase().includes('BAJA CUANTIA')) {
        empresaId = 4
        empFinal = 'DIAGNOSAL'
      }

      const mesNum = monthMap[rawMes] || '01'
      const fechaPresentacion = `${rawAnio}-${mesNum}-01`
      const observaciones = `TIPO: ${tipoProceso} | Empresa: ${empFinal} | Presentación: ${presentacion || 'N/A'} | Fuente: Microsoft Excel 365`

      const existingId = numOferta ? existingMap.get(numOferta.toLowerCase()) : null

      if (existingId) {
        toUpdate.push({
          id: existingId,
          payload: {
            nombre_oferta: nomOferta,
            cliente_id: clienteId,
            empresa_id: empresaId,
            fecha_presentacion: fechaPresentacion,
            observaciones,
            actualizado_en: new Date().toISOString()
          }
        })
      } else {
        toInsert.push({
          numero_oferta: numOferta || `OF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nombre_oferta: nomOferta,
          empresa_id: empresaId,
          cliente_id: clienteId,
          fecha_presentacion: fechaPresentacion,
          estatus_id: defaultEstatusId,
          persona_id: defaultPersonaId,
          observaciones
        })
      }
    }

    if (toInsert.length > 0) {
      for (let i = 0; i < toInsert.length; i += 100) {
        const chunk = toInsert.slice(i, i + 100)
        await admin.from('licitaciones_ofertas').insert(chunk)
      }
    }

    if (toUpdate.length > 0) {
      for (let i = 0; i < toUpdate.length; i += 20) {
        const chunk = toUpdate.slice(i, i + 20)
        await Promise.all(chunk.map(item =>
          admin.from('licitaciones_ofertas').update(item.payload).eq('licitacion_oferta_id', item.id)
        ))
      }
    }

    // Refresh masterMap
    const { data: allLics } = await admin.from('licitaciones_ofertas').select('licitacion_oferta_id, numero_oferta')
    const masterMap = new Map<string, string>()
    allLics?.forEach((l: any) => {
      if (l.numero_oferta) masterMap.set(l.numero_oferta.toLowerCase().trim(), l.licitacion_oferta_id)
    })

    // Sync ofertas_items (Child Detail)
    const activeMasterIds = Array.from(masterMap.values())
    if (activeMasterIds.length > 0) {
      for (let i = 0; i < activeMasterIds.length; i += 100) {
        const chunk = activeMasterIds.slice(i, i + 100)
        await admin.from('ofertas_items').delete().in('licitacion_oferta_id', chunk)
      }
    }

    const defaultProductId = prodsRes.data?.[0]?.producto_equipo_id || 1
    const childRowsToInsert: any[] = []

    itemsToSync.forEach((lic: any, idx: number) => {
      const numOferta = (lic.no_oferta || '').toString().trim()
      const masterId = numOferta ? masterMap.get(numOferta.toLowerCase()) : null
      if (!masterId) return

      const prodName = (lic.producto || lic.nombre_oferta || '').toString().trim()
      let prodId = prodsMap.get(prodName.toLowerCase())
      if (!prodId) {
        for (const [name, id] of prodsMap.entries()) {
          if (prodName.toLowerCase().includes(name) || name.includes(prodName.toLowerCase())) {
            prodId = id
            break
          }
        }
        if (!prodId) prodId = defaultProductId
      }

      const qty = Number(lic.cantidad) || 1
      const pu = Number(lic.precio_unitario) || 0
      const totalOfertado = Number(lic.total_ofertado) || (qty * pu)
      const st = (lic.estatus_item || '').toString().toUpperCase().trim()
      const esAdjudicado = st.includes('ADJUDICADA') || st.includes('GANADA') || st === 'ADJUDICADO'
      const pa = Number(lic.precio_adjudicado) || 0
      const empWinner = (lic.empresa_adjudicada || '').toString().trim()

      let extraDesc = `Mes: ${lic.mes || 'ENERO'}`
      if (empWinner) extraDesc += ` | Adjudicado: ${empWinner}`
      if (pa > 0) extraDesc += ` ($${pa})`
      if (lic.razon) extraDesc += ` | Razón: ${lic.razon}`
      if (lic.no_contrato) extraDesc += ` | Contrato: ${lic.no_contrato}`

      childRowsToInsert.push({
        licitacion_oferta_id: masterId,
        producto_equipo_id: prodId,
        renglon_numero: idx + 1,
        cantidad: qty,
        precio_unitario: pu,
        precio_total: totalOfertado,
        es_adjudicado: esAdjudicado,
        creado_en: new Date().toISOString()
      })
    })

    if (childRowsToInsert.length > 0) {
      for (let i = 0; i < childRowsToInsert.length; i += 100) {
        const chunk = childRowsToInsert.slice(i, i + 100)
        await admin.from('ofertas_items').insert(chunk)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sincronización completa con Microsoft Excel 365 procesada exitosamente en Supabase',
      syncedLicitaciones: masterMap.size,
      syncedItems: childRowsToInsert.length
    })
  } catch (err: any) {
    console.error('Sync error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Error al ejecutar sincronización en n8n' },
      { status: 500 }
    )
  }
}
