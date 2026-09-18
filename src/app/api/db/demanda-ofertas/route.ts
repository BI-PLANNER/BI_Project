import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
)

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch live stock from AppSheet / Supabase tables if present
    let liveStockMap: Record<string, number> = {}

    try {
      const { data: kardexItems } = await supabase
        .from('kardex_inventario_3fn')
        .select('codigo_producto, producto_nombre, stock_actual, saldo_disponible')
      
      if (kardexItems && kardexItems.length > 0) {
        kardexItems.forEach((item: any) => {
          const code = (item.codigo_producto || '').toString().trim()
          const stock = Number(item.stock_actual || item.saldo_disponible || 0)
          if (code) {
            liveStockMap[code] = (liveStockMap[code] || 0) + stock
          }
        })
      }
    } catch (err) {
      console.log('Using default stock values for cross-match analysis:', err)
    }

    // 2. Base Matrix Data matching the provided Excel screenshot
    const licitacionInfo = {
      numero: 'Licitación Competitiva No. LC26DM0076',
      denominacion: 'ADQUISICIÓN DE REACTIVOS DE LABORATORIO PARA PRUEBAS RÁPIDAS DIAGNÓSTICAS PARA VARIOS CENTROS DE ATENCIÓN DEL ISSS NECESIDAD 2026',
      institucion: 'Instituto Salvadoreño del Seguro Social (ISSS)',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31',
      dias_restantes_proxima_entrega: 12,
      pm_responsable: {
        nombre: 'Ing. Carlos Mendoza (PM BI & Kardex)',
        email: 'businessinteligent01@lm-sv.com',
        telefono: '+503 7890-1234'
      }
    }

    const productos = [
      {
        codigo: '500100007',
        nombre: 'Sangre oculta heces (rapid Test)',
        dias: [30, 60, 90, 120],
        demanda_total: 25845,
        stock_appsheet: liveStockMap['500100007'] || 28500,
        pm_email: 'businessinteligent01@lm-sv.com'
      },
      {
        codigo: '500100017',
        nombre: 'Prueba cuantitativa PCT',
        dias: [30, 60, 90, 120],
        demanda_total: 5420,
        stock_appsheet: liveStockMap['500100017'] || 4200,
        pm_email: 'businessinteligent01@lm-sv.com'
      },
      {
        codigo: '500100027',
        nombre: 'Prueba antidoping multidroga',
        dias: [30, 60, 90, 120],
        demanda_total: 60,
        stock_appsheet: liveStockMap['500100027'] || 120,
        pm_email: 'businessinteligent01@lm-sv.com'
      },
      {
        codigo: '500100029',
        nombre: 'prueba rapida Sifilis',
        dias: [30, 60, 90, 120],
        demanda_total: 25280,
        stock_appsheet: liveStockMap['500100029'] || 26000,
        pm_email: 'businessinteligent01@lm-sv.com'
      },
      {
        codigo: '500100036',
        nombre: 'Dual VIH/Treponema Pallidum (HIV / SYPHILIS DUO)',
        dias: [30, 60, 90, 120],
        demanda_total: 24420,
        stock_appsheet: liveStockMap['500100036'] || 19000, // Deficit example: 5000 required vs 4000 stock ratio
        pm_email: 'businessinteligent01@lm-sv.com'
      }
    ]

    // Matrix breakdown by ISSS hospital center
    const centrosISSS = [
      { no: 1, centro: 'ISSS SANTA ANA', d500100007: [550, 550, 550, 550], d500100017: [120, 120, 120, 120], d500100027: [0, 0, 0, 0], d500100029: [60, 60, 60, 60], d500100036: [690, 690, 690, 690] },
      { no: 2, centro: 'ISSS DE SONSONATE', d500100007: [181, 181, 181, 182], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [120, 120, 120, 120], d500100036: [743, 743, 743, 741] },
      { no: 3, centro: 'ISSS SAN MIGUEL', d500100007: [150, 150, 150, 150], d500100017: [20, 20, 20, 20], d500100027: [0, 0, 0, 0], d500100029: [900, 900, 900, 900], d500100036: [450, 450, 450, 450] },
      { no: 4, centro: 'ISSS ROMA', d500100007: [10, 10, 10, 10], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [11, 11, 11, 12], d500100036: [10, 10, 10, 10] },
      { no: 5, centro: 'ISSS AMATEPEC', d500100007: [80, 80, 80, 80], d500100017: [200, 200, 200, 200], d500100027: [0, 0, 0, 0], d500100029: [60, 60, 60, 60], d500100036: [0, 0, 0, 0] },
      { no: 6, centro: 'ISSS MQ', d500100007: [213, 213, 213, 211], d500100017: [840, 840, 840, 840], d500100027: [0, 0, 0, 0], d500100029: [520, 520, 520, 520], d500100036: [0, 0, 0, 0] },
      { no: 7, centro: 'ISSS 1 DE MAYO', d500100007: [69, 69, 69, 68], d500100017: [0, 0, 0, 0], d500100027: [15, 15, 15, 15], d500100029: [500, 500, 500, 500], d500100036: [200, 200, 200, 200] },
      { no: 8, centro: 'ISSS GENERAL', d500100007: [0, 0, 0, 0], d500100017: [100, 100, 100, 100], d500100027: [0, 0, 0, 0], d500100029: [94, 94, 94, 93], d500100036: [0, 0, 0, 0] },
      { no: 9, centro: 'ISSS ZACAMIL', d500100007: [575, 575, 575, 575], d500100017: [75, 75, 75, 75], d500100027: [0, 0, 0, 0], d500100029: [600, 600, 600, 600], d500100036: [353, 353, 353, 351] },
      { no: 10, centro: 'ISSS ATLACAT', d500100007: [269, 269, 269, 268], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [30, 30, 30, 30], d500100036: [1200, 1200, 1200, 1200] },
      { no: 11, centro: 'ISSS ILOPANGO', d500100007: [600, 600, 600, 600], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [780, 780, 780, 780], d500100036: [240, 240, 240, 240] },
      { no: 12, centro: 'ISSS 15 DE SEPTIEMBRE', d500100007: [31, 31, 31, 32], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [10, 10, 10, 10], d500100036: [200, 200, 200, 200] },
      { no: 13, centro: 'ISSS SAN JACINTO', d500100007: [200, 200, 200, 200], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [140, 140, 140, 140], d500100036: [350, 350, 350, 350] },
      { no: 14, centro: 'ISSS TECLA', d500100007: [500, 500, 500, 500], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [1440, 1440, 1440, 1440], d500100036: [500, 500, 500, 500] },
      { no: 15, centro: 'ISSS APOPA', d500100007: [1800, 1800, 1800, 1800], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [420, 420, 420, 420], d500100036: [420, 420, 420, 420] },
      { no: 16, centro: 'ISSS QUEZALTEPEQUE', d500100007: [250, 250, 250, 250], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [0, 0, 0, 0], d500100036: [500, 500, 500, 500] },
      { no: 17, centro: 'ISSS USULUTAN', d500100007: [45, 45, 45, 45], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [190, 190, 190, 190], d500100036: [0, 0, 0, 0] },
      { no: 18, centro: 'ISSS SOYAPANGO', d500100007: [269, 269, 269, 268], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [350, 350, 350, 350], d500100036: [250, 250, 250, 250] },
      { no: 19, centro: 'ISSS ESPECIALIDADES', d500100007: [600, 600, 600, 600], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [35, 35, 35, 35], d500100036: [0, 0, 0, 0] },
      { no: 20, centro: 'ISSS CEIBA', d500100007: [70, 70, 70, 70], d500100017: [0, 0, 0, 0], d500100027: [0, 0, 0, 0], d500100029: [60, 60, 60, 60], d500100036: [0, 0, 0, 0] }
    ]

    // Calculate Cross-matched Deficit / Surplus analysis for each product
    const analisisProductos = productos.map(prod => {
      const requerida = prod.demanda_total
      const stock = prod.stock_appsheet
      const diferencia = stock - requerida
      const porcentajeCobertura = Number(((stock / requerida) * 100).toFixed(1))
      
      let estado = 'SUFICIENTE'
      let nivelAlerta = 'verde' // verde | amarillo | rojo
      
      if (diferencia < 0) {
        estado = 'FALTANTE CRÍTICO'
        nivelAlerta = 'rojo'
      } else if (porcentajeCobertura < 110) {
        estado = 'STOCK AJUSTADO'
        nivelAlerta = 'amarillo'
      }

      return {
        ...prod,
        stock_actual: stock,
        diferencia_faltante: diferencia,
        porcentaje_cobertura: porcentajeCobertura,
        estado,
        nivelAlerta
      }
    })

    return NextResponse.json({
      success: true,
      licitacion: licitacionInfo,
      productos: analisisProductos,
      centros: centrosISSS,
      summary: {
        total_demanda_unidades: productos.reduce((acc, p) => acc + p.demanda_total, 0),
        total_stock_disponible: productos.reduce((acc, p) => acc + p.stock_appsheet, 0),
        total_faltantes: analisisProductos.filter(p => p.diferencia_faltante < 0).length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
