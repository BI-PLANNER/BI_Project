import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import localData from '@/data/licitaciones_data.json'

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

export async function GET() {
  try {
    let items = localData

    // Query live Supabase items joined with licitaciones, productos y marcas
    try {
      const { data: dbItems, error } = await supabaseAdmin
        .from('ofertas_items')
        .select(`
          oferta_item_id,
          renglon_numero,
          cantidad,
          precio_unitario,
          precio_total,
          es_adjudicado,
          razon_perdida,
          licitaciones_ofertas (
            licitacion_oferta_id,
            numero_oferta,
            nombre_oferta,
            fecha_presentacion,
            mes_presentacion,
            observaciones,
            clientes ( cliente_id, nombre_cliente ),
            empresas ( empresa_id, nombre_empresa )
          ),
          productos_equipo (
            producto_equipo_id,
            nombre_producto_equipo,
            marcas ( marca_id, nombre_marca )
          )
        `)
        .order('renglon_numero', { ascending: true })

      if (!error && dbItems && dbItems.length > 0) {
        items = dbItems.map((row: any) => {
          const lic = row.licitaciones_ofertas
          const prod = row.productos_equipo
          const marca = prod?.marcas?.nombre_marca || 'S/M'
          const clientName = lic?.clientes?.nombre_cliente || 'MINSAL'
          const upperClient = clientName.toUpperCase()
          const institucion = upperClient.includes('ISSS') || upperClient.includes('SEGURO SOCIAL') ? 'ISSS' : (upperClient.includes('ISBM') ? 'ISBM' : 'MINSAL')
          const anio = lic?.fecha_presentacion ? lic.fecha_presentacion.slice(0, 4) : '2025'
          const qty = Number(row.cantidad || 1)
          const pUnit = Number(row.precio_unitario || 0)
          const totalVal = Number(row.precio_total || (qty * pUnit) || 0)
          const estatus = row.es_adjudicado ? 'ADJUDICADA' : (row.razon_perdida ? 'PERDIDA' : 'PENDIENTE')

          return {
            id: row.oferta_item_id,
            renglon: row.renglon_numero,
            anio,
            mes: lic?.mes_presentacion || 'ENERO',
            empresa: lic?.empresas?.nombre_empresa || 'LABYMED',
            institucion,
            cliente: clientName,
            noOferta: lic?.numero_oferta || 'S/N',
            nombreOferta: lic?.nombre_oferta || '',
            fecha: lic?.fecha_presentacion || '2025-01-01',
            producto: prod?.nombre_producto_equipo || 'PRODUCTO GENERAL',
            marca,
            precioUnitario: pUnit,
            cantidad: qty,
            total: totalVal,
            estatus,
            razon: row.razon_perdida || '',
            esAdjudicado: row.es_adjudicado
          }
        })
      }
    } catch (dbErr) {
      console.warn('Fallback to localData in /api/analytics/licitaciones:', dbErr)
    }

    // Precalculate KPIs & Aggregations
    let totalOfertado = 0
    let totalAdjudicado = 0
    let totalPerdido = 0
    let totalPendiente = 0

    const byYearMap: Record<string, { year: string, Adjudicado: number, Perdido: number, Pendiente: number, Total: number }> = {}
    const byEstatusMap: Record<string, { name: string, value: number, count: number, color: string }> = {
      ADJUDICADA: { name: 'Adjudicada', value: 0, count: 0, color: '#10b981' },
      PERDIDA: { name: 'Perdida', value: 0, count: 0, color: '#f43f5e' },
      PENDIENTE: { name: 'Pendiente', value: 0, count: 0, color: '#f59e0b' }
    }
    const byClientMap: Record<string, { name: string, adjudicado: number, total: number, count: number }> = {}
    const byBrandMap: Record<string, { name: string, adjudicado: number, total: number, count: number }> = {}
    const byProductMap: Record<string, { name: string, adjudicado: number, total: number, count: number }> = {}

    items.forEach((it: any) => {
      const val = Number(it.total || 0)
      const est = (it.estatus || 'PENDIENTE').toUpperCase()
      const anio = it.anio || '2025'

      totalOfertado += val
      if (est === 'ADJUDICADA') totalAdjudicado += val
      else if (est === 'PERDIDA') totalPerdido += val
      else totalPendiente += val

      // By Year
      if (!byYearMap[anio]) {
        byYearMap[anio] = { year: anio, Adjudicado: 0, Perdido: 0, Pendiente: 0, Total: 0 }
      }
      byYearMap[anio].Total += val
      if (est === 'ADJUDICADA') byYearMap[anio].Adjudicado += val
      else if (est === 'PERDIDA') byYearMap[anio].Perdido += val
      else byYearMap[anio].Pendiente += val

      // By Estatus
      if (byEstatusMap[est]) {
        byEstatusMap[est].value += val
        byEstatusMap[est].count += 1
      }

      // By Client
      const cli = it.cliente || 'MINSAL'
      if (!byClientMap[cli]) byClientMap[cli] = { name: cli, adjudicado: 0, total: 0, count: 0 }
      byClientMap[cli].total += val
      byClientMap[cli].count += 1
      if (est === 'ADJUDICADA') byClientMap[cli].adjudicado += val

      // By Brand
      const bra = it.marca || 'S/M'
      if (!byBrandMap[bra]) byBrandMap[bra] = { name: bra, adjudicado: 0, total: 0, count: 0 }
      byBrandMap[bra].total += val
      byBrandMap[bra].count += 1
      if (est === 'ADJUDICADA') byBrandMap[bra].adjudicado += val

      // By Product
      const prod = it.producto || 'General'
      if (!byProductMap[prod]) byProductMap[prod] = { name: prod, adjudicado: 0, total: 0, count: 0 }
      byProductMap[prod].total += val
      byProductMap[prod].count += 1
      if (est === 'ADJUDICADA') byProductMap[prod].adjudicado += val
    })

    const winRate = totalOfertado > 0 ? (totalAdjudicado / totalOfertado) * 100 : 0
    const byYear = Object.values(byYearMap).sort((a, b) => a.year.localeCompare(b.year))
    const byEstatus = Object.values(byEstatusMap)

    const topClients = Object.values(byClientMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    const topBrands = Object.values(byBrandMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    const topProducts = Object.values(byProductMap)
      .sort((a, b) => b.adjudicado - a.adjudicado)
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      kpis: {
        totalOfertado,
        totalAdjudicado,
        totalPerdido,
        totalPendiente,
        winRate,
        countItems: items.length
      },
      byYear,
      byEstatus,
      topClients,
      topBrands,
      topProducts,
      items
    })
  } catch (error: any) {
    console.error('Error in /api/analytics/licitaciones:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
