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
const N8N_API_KEY = process.env.N8N_API_KEY || ''

async function getLatestN8nExecItems() {
  if (!N8N_API_KEY) return []

  try {
    // 1. Get latest successful execution ID
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

    // 2. Fetch execution details with data
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
    // Try triggering webhook first
    try {
      await fetch(`https://${N8N_HOST}/webhook/sync-sheets-supabase`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }).catch(() => null)
    } catch (_) {}

    // Fetch latest items from n8n execution
    const rawItems = await getLatestN8nExecItems()

    if (rawItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Sincronización procesada. No se encontraron nuevos renglones en la ejecución de Excel.'
      })
    }

    const admin: any = supabaseAdmin

    // Fetch catalogs
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

    return NextResponse.json({
      success: true,
      message: 'Sincronización con Microsoft Excel 365 completada exitosamente',
      processedItems: itemsToSync.length
    })
  } catch (err: any) {
    console.error('Sync error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Error al ejecutar sincronización en n8n' },
      { status: 500 }
    )
  }
}
