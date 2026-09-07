'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  BarChart3,
  Table as TableIcon,
  Calendar,
  Filter,
  Download,
  Search,
  Layers,
  Sparkles,
  TrendingUp,
  Boxes,
  CheckCircle2,
  X,
  PieChart as PieIcon,
  ArrowUpDown,
  RefreshCw,
  Cpu,
  Tag,
  Database,
  Info,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers3,
  SlidersHorizontal
} from 'lucide-react'

export interface DemandRecord {
  id?: string | number
  anio: number
  mes: string
  mesNumero: number
  producto: string
  sku?: string
  marca?: string
  qty: number
}

interface MasterProduct {
  producto_equipo_id: number
  codigo_sku: string
  nombre_producto_equipo: string
  descripcion?: string
  es_equipo: boolean
  unidad_medida?: string
  activo: boolean
  marca_nombre?: string
  marca_id?: number
}

interface Props {
  className?: string
  customData?: DemandRecord[]
}

const PRODUCT_COLORS: Record<string, string> = {
  'ANA-8': '#1e3a8a',
  'CARTUCHO DE 100': '#2563eb',
  'CARTUCHO GEM 3.5K 300 PRUEBAS': '#0f766e',
  'CARTUCHO GEM 3.5K 600 PRUEBAS': '#10b981',
  'CHAGAS AB': '#047857',
  'CHORUS BETA 2-GLYCOPROTEIN-M': '#0284c7',
  'CHORUS CARDIOLIPINA IGG': '#1e293b',
  'CHORUS CARDIOLIPINA IgM': '#059669',
  'CHORUS PR3 36 TETS': '#06b6d4',
  'CHORUS SS-A': '#fda4af',
  'FOB RAPID TEST': '#38bdf8',
  'H. PYLORI ANTIGEN RAPID TEST': '#475569',
  'HBsAg (hepatitis B)': '#f43f5e',
  'HCV (hepatitis C)': '#fbbf24',
  'POWER SUPPLY (DRIVER); I4 MICROSCOPE': '#94a3b8',
  'PREGNANCY (HCG) ENHANCED SENSITIVITY RAPID TEST': '#7dd3fc',
  'STANDARD F TNL FIA': '#fb923c',
  'STANDARD Q COVID-19AG 25 TEST': '#c084fc',
  'SYPHILIS 3.0': '#0d9488',
  'TRANSPONDER DE 500 PRUEBAS': '#9a3412',
  'T3 TOTAL': '#8b5cf6',
  'T4 TOTAL': '#ec4899',
  'TSH': '#f59e0b'
}

const COLOR_PALETTE_FALLBACK = [
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#14b8a6', '#6366f1', '#a855f7',
  '#e11d48', '#d97706', '#059669', '#0284c7', '#4f46e5'
]

function getProductColor(productName: string, index: number): string {
  const match = Object.keys(PRODUCT_COLORS).find(k =>
    productName.toUpperCase().includes(k.toUpperCase())
  )
  if (match) return PRODUCT_COLORS[match]
  return COLOR_PALETTE_FALLBACK[index % COLOR_PALETTE_FALLBACK.length]
}

const MESES_ORDEN: Record<string, number> = {
  'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
  'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
  'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
}

export default function DynamicMonthlyDemandAnalytics({ className = '', customData }: Props) {
  // Dataset base dinámico oficial de Entregas (Cruzado exactamente con Power BI: 176,681 reactivos)
  const defaultData: DemandRecord[] = useMemo(() => [
    // 1. Entregas Base / Iniciales (Octubre 2025): 6,868
    { anio: 2025, mes: 'octubre', mesNumero: 10, producto: 'ANTIGEN PROSTATICO TOTAL (PSA)', marca: 'STANDARD DIAGNOSTICS', qty: 180 },
    { anio: 2025, mes: 'octubre', mesNumero: 10, producto: 'PREGNANCY (HCG) ENHANCED SENSITIVITY RAPID TEST', marca: 'STANDARD DIAGNOSTICS', qty: 2500 },
    { anio: 2025, mes: 'octubre', mesNumero: 10, producto: 'T3 TOTAL', marca: 'DIESSE', qty: 396 },
    { anio: 2025, mes: 'octubre', mesNumero: 10, producto: 'T4 TOTAL', marca: 'DIESSE', qty: 396 },
    { anio: 2025, mes: 'octubre', mesNumero: 10, producto: 'TRANSPONDER DE 500 PRUEBAS', marca: 'STANDARD DIAGNOSTICS', qty: 3000 },
    { anio: 2025, mes: 'octubre', mesNumero: 10, producto: 'TSH', marca: 'DIESSE', qty: 396 },

    // 2. 2025 Noviembre: 115,481 (Abbott: 50,925 + Standard Diagnostics: 61,800 + Diesse + Alltest + Optimedical)
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'CHAGAS AB', marca: 'ABBOTT', qty: 46975 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'HBsAg (hepatitis B)', marca: 'ABBOTT', qty: 600 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'HCV (hepatitis C)', marca: 'ABBOTT', qty: 800 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'SYPHILIS 3.0', marca: 'ABBOTT', qty: 2550 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'PREGNANCY (HCG) ENHANCED SENSITIVITY RAPID TEST', marca: 'STANDARD DIAGNOSTICS', qty: 56800 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'TRANSPONDER DE 500 PRUEBAS', marca: 'STANDARD DIAGNOSTICS', qty: 4600 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'STANDARD F TNL FIA', marca: 'STANDARD DIAGNOSTICS', qty: 200 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'STANDARD Q COVID-19AG 25 TEST', marca: 'STANDARD DIAGNOSTICS', qty: 200 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'CHORUS CARDIOLIPINA IGG', marca: 'DIESSE', qty: 216 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'CHORUS CARDIOLIPINA IgM', marca: 'DIESSE', qty: 216 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'CARTUCHO GEM 3.5K 300 PRUEBAS', marca: 'OPTIMEDICAL', qty: 2 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'CARTUCHO GEM 3.5K 600 PRUEBAS', marca: 'OPTIMEDICAL', qty: 2 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'FOB RAPID TEST', marca: 'ALLTEST', qty: 1260 },
    { anio: 2025, mes: 'noviembre', mesNumero: 11, producto: 'H. PYLORI ANTIGEN RAPID TEST', marca: 'ALLTEST', qty: 1060 },

    // 3. 2025 Diciembre: 19,772 (Exacto a la tabla de Power BI de tu compañero)
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'ANA-8', marca: 'DIESSE', qty: 144 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'CARTUCHO DE 100', marca: 'OPTIMEDICAL', qty: 4 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'CARTUCHO GEM 3.5K 300 PRUEBAS', marca: 'OPTIMEDICAL', qty: 2 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'CARTUCHO GEM 3.5K 600 PRUEBAS', marca: 'OPTIMEDICAL', qty: 2 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'CHORUS BETA 2-GLYCOPROTEIN-M', marca: 'DIESSE', qty: 180 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'CHORUS PR3 36 TETS', marca: 'DIESSE', qty: 180 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'CHORUS SS-A', marca: 'DIESSE', qty: 180 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'FOB RAPID TEST', marca: 'ALLTEST', qty: 2290 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'H. PYLORI ANTIGEN RAPID TEST', marca: 'ALLTEST', qty: 2160 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'POWER SUPPLY (DRIVER); I4 MICROSCOPE', marca: 'LW SCIENTIFIC, INC', qty: 2 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'PREGNANCY (HCG) ENHANCED SENSITIVITY RAPID TEST', marca: 'STANDARD DIAGNOSTICS', qty: 6068 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'TRANSPONDER DE 500 PRUEBAS', marca: 'STANDARD DIAGNOSTICS', qty: 4600 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'T3 TOTAL', marca: 'DIESSE', qty: 1320 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'T4 TOTAL', marca: 'DIESSE', qty: 1320 },
    { anio: 2025, mes: 'diciembre', mesNumero: 12, producto: 'TSH', marca: 'DIESSE', qty: 1320 },

    // 4. 2026 Enero: 6,920
    { anio: 2026, mes: 'enero', mesNumero: 1, producto: 'FOB RAPID TEST', marca: 'ALLTEST', qty: 1260 },
    { anio: 2026, mes: 'enero', mesNumero: 1, producto: 'H. PYLORI ANTIGEN RAPID TEST', marca: 'ALLTEST', qty: 1060 },
    { anio: 2026, mes: 'enero', mesNumero: 1, producto: 'TRANSPONDER DE 500 PRUEBAS', marca: 'STANDARD DIAGNOSTICS', qty: 4600 },

    // 5. 2026 Febrero: 6,920
    { anio: 2026, mes: 'febrero', mesNumero: 2, producto: 'FOB RAPID TEST', marca: 'ALLTEST', qty: 1260 },
    { anio: 2026, mes: 'febrero', mesNumero: 2, producto: 'H. PYLORI ANTIGEN RAPID TEST', marca: 'ALLTEST', qty: 1060 },
    { anio: 2026, mes: 'febrero', mesNumero: 2, producto: 'TRANSPONDER DE 500 PRUEBAS', marca: 'STANDARD DIAGNOSTICS', qty: 4600 },

    // 6. 2026 Marzo: 6,920
    { anio: 2026, mes: 'marzo', mesNumero: 3, producto: 'FOB RAPID TEST', marca: 'ALLTEST', qty: 1260 },
    { anio: 2026, mes: 'marzo', mesNumero: 3, producto: 'H. PYLORI ANTIGEN RAPID TEST', marca: 'ALLTEST', qty: 1060 },
    { anio: 2026, mes: 'marzo', mesNumero: 3, producto: 'TRANSPONDER DE 500 PRUEBAS', marca: 'STANDARD DIAGNOSTICS', qty: 4600 },

    // 7. 2026 Abril: 4,600
    { anio: 2026, mes: 'abril', mesNumero: 4, producto: 'TRANSPONDER DE 500 PRUEBAS', marca: 'STANDARD DIAGNOSTICS', qty: 4600 },

    // 8. 2026 Mayo: 4,600
    { anio: 2026, mes: 'mayo', mesNumero: 5, producto: 'TRANSPONDER DE 500 PRUEBAS', marca: 'STANDARD DIAGNOSTICS', qty: 4600 },

    // 9. 2026 Junio: 4,600
    { anio: 2026, mes: 'junio', mesNumero: 6, producto: 'TRANSPONDER DE 500 PRUEBAS', marca: 'STANDARD DIAGNOSTICS', qty: 4600 }
  ], [])

  const rawRecords = customData && customData.length > 0 ? customData : defaultData

  // View Mode: 'entregas' vs 'catalogo_global'
  const [analyticsViewMode, setAnalyticsViewMode] = useState<'entregas' | 'catalogo_global'>('entregas')

  // Catálogo Maestro cargado desde Supabase
  const [masterCatalog, setMasterCatalog] = useState<MasterProduct[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true)

  // Slicers & Filtros interactivos
  const [selectedAnio, setSelectedAnio] = useState<string>('TODOS')
  const [selectedMes, setSelectedMes] = useState<string>('TODOS')
  const [selectedMarca, setSelectedMarca] = useState<string>('TODAS')
  const [searchProduct, setSearchProduct] = useState<string>('')
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [hoveredBarDetail, setHoveredBarDetail] = useState<any | null>(null)

  // Paginación para vista Catálogo Maestro
  const [catalogPage, setCatalogPage] = useState<number>(1)
  const catalogPageSize = 15

  // Carga del Catálogo Maestro desde Supabase
  useEffect(() => {
    async function loadMasterCatalog() {
      setLoadingCatalog(true)
      try {
        const res = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'select',
            table: 'productos_equipo',
            limit: 2500,
            select: 'producto_equipo_id,codigo_sku,nombre_producto_equipo,descripcion,es_equipo,unidad_medida,activo,marcas(marca_id,nombre_marca)'
          })
        })
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          const formatted: MasterProduct[] = json.data.map((item: any) => ({
            producto_equipo_id: item.producto_equipo_id,
            codigo_sku: item.codigo_sku || 'N/A',
            nombre_producto_equipo: item.nombre_producto_equipo || 'Sin nombre',
            descripcion: item.descripcion || '',
            es_equipo: Boolean(item.es_equipo),
            unidad_medida: item.unidad_medida || 'Kit',
            activo: item.activo !== false,
            marca_nombre: item.marcas?.nombre_marca || 'Sin Marca',
            marca_id: item.marcas?.marca_id
          }))
          setMasterCatalog(formatted)
        }
      } catch (err) {
        console.error('Error loading master catalog for analytics:', err)
      } finally {
        setLoadingCatalog(false)
      }
    }
    loadMasterCatalog()
  }, [])

  // Extraer Años y Meses dinámicos presentes en la data de entregas
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(rawRecords.map(r => r.anio))).sort((a, b) => a - b)
    return ['TODOS', ...years.map(String)]
  }, [rawRecords])

  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(rawRecords.map(r => r.mes.toLowerCase())))
    months.sort((a, b) => (MESES_ORDEN[a] || 0) - (MESES_ORDEN[b] || 0))
    return ['TODOS', ...months]
  }, [rawRecords])

  // Lista consolidada de marcas (Entregas + 51 Marcas de Supabase)
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>()
    rawRecords.forEach(r => { if (r.marca) brandSet.add(r.marca) })
    masterCatalog.forEach(p => {
      if (p.marca_nombre) {
        const clean = p.marca_nombre.replace(/\s+(Reactivo|Equipo|Reactivos|Equipos|Reac|Equ|Rdx)$/i, '').trim()
        if (clean) brandSet.add(clean)
        brandSet.add(p.marca_nombre)
      }
    })
    const sorted = Array.from(brandSet).filter(Boolean).sort((a, b) => a.localeCompare(b))
    return ['TODAS', ...sorted]
  }, [rawRecords, masterCatalog])

  // Filtrado de Entregas Programadas en tiempo real
  const filteredRecords = useMemo(() => {
    return rawRecords.filter(r => {
      const matchYear = selectedAnio === 'TODOS' || String(r.anio) === selectedAnio
      const matchMonth = selectedMes === 'TODOS' || r.mes.toLowerCase() === selectedMes.toLowerCase()
      
      let matchBrand = selectedMarca === 'TODAS'
      if (!matchBrand && r.marca) {
        const rBrandUpper = r.marca.toUpperCase()
        const sBrandUpper = selectedMarca.toUpperCase()
        matchBrand = rBrandUpper.includes(sBrandUpper) || sBrandUpper.includes(rBrandUpper)
      }

      const matchSearch =
        !searchProduct ||
        r.producto.toLowerCase().includes(searchProduct.toLowerCase()) ||
        (r.sku && r.sku.toLowerCase().includes(searchProduct.toLowerCase()))
      return matchYear && matchMonth && matchBrand && matchSearch
    })
  }, [rawRecords, selectedAnio, selectedMes, selectedMarca, searchProduct])

  // Filtrado de Catálogo Maestro Global en tiempo real (1,496 productos)
  const filteredCatalog = useMemo(() => {
    return masterCatalog.filter(p => {
      let matchBrand = selectedMarca === 'TODAS'
      if (!matchBrand && p.marca_nombre) {
        const pBrandUpper = p.marca_nombre.toUpperCase()
        const sBrandUpper = selectedMarca.toUpperCase()
        matchBrand = pBrandUpper.includes(sBrandUpper) || sBrandUpper.includes(pBrandUpper)
      }

      const matchSearch =
        !searchProduct ||
        p.nombre_producto_equipo.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.codigo_sku.toLowerCase().includes(searchProduct.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchProduct.toLowerCase()))

      return matchBrand && matchSearch
    })
  }, [masterCatalog, selectedMarca, searchProduct])

  // Auto-switch inteligente: Si el usuario selecciona una marca sin entregas (ej. SIEMENS, DIRUI, MINDRAY), cambiar automáticamente a la vista de Catálogo Maestro
  const brandHasDeliveries = filteredRecords.length > 0
  const brandCatalogCount = filteredCatalog.length

  const handleBrandChange = (newMarca: string) => {
    setSelectedMarca(newMarca)
    setCatalogPage(1)
    
    if (newMarca !== 'TODAS') {
      // Verificar si tiene entregas
      const testDeliveries = rawRecords.filter(r => {
        if (!r.marca) return false
        const rUpper = r.marca.toUpperCase()
        const mUpper = newMarca.toUpperCase()
        return rUpper.includes(mUpper) || mUpper.includes(rUpper)
      })
      if (testDeliveries.length === 0) {
        // Marca del Catálogo Maestro sin entregas de contrato -> Auto activar vista Catálogo
        setAnalyticsViewMode('catalogo_global')
      } else {
        // Marca con entregas de contrato -> Auto activar vista Entregas
        setAnalyticsViewMode('entregas')
      }
    } else {
      setAnalyticsViewMode('entregas')
    }
  }

  // Paginación del Catálogo Maestro
  const totalCatalogPages = Math.max(1, Math.ceil(filteredCatalog.length / catalogPageSize))
  const paginatedCatalog = useMemo(() => {
    const start = (catalogPage - 1) * catalogPageSize
    return filteredCatalog.slice(start, start + catalogPageSize)
  }, [filteredCatalog, catalogPage, catalogPageSize])

  // Reset page when filter changes
  useEffect(() => {
    setCatalogPage(1)
  }, [selectedMarca, searchProduct])

  // Agrupación dinámica de entregas: Año -> Mes -> Producto -> Sum(Qty)
  const hierarchicalData = useMemo(() => {
    const tree: Record<number, Record<string, { totalMes: number, productos: { producto: string, qty: number, marca: string }[] }>> = {}

    filteredRecords.forEach(r => {
      if (!tree[r.anio]) tree[r.anio] = {}
      const mesKey = r.mes.toLowerCase()
      if (!tree[r.anio][mesKey]) {
        tree[r.anio][mesKey] = { totalMes: 0, productos: [] }
      }

      tree[r.anio][mesKey].totalMes += r.qty

      const existingProd = tree[r.anio][mesKey].productos.find(p => p.producto === r.producto)
      if (existingProd) {
        existingProd.qty += r.qty
      } else {
        tree[r.anio][mesKey].productos.push({
          producto: r.producto,
          qty: r.qty,
          marca: r.marca || 'General'
        })
      }
    })

    return tree
  }, [filteredRecords])

  // Gran Total Global de QTY de Entregas
  const grandTotalQTY = useMemo(() => {
    return filteredRecords.reduce((acc, r) => acc + r.qty, 0)
  }, [filteredRecords])

  // Gráfico de Barras Apiladas
  const stackedBarData = useMemo(() => {
    const monthBucketsMap: Record<string, { anio: number, mes: string, mesNumero: number, label: string, items: { producto: string, qty: number, color: string }[], total: number }> = {}

    filteredRecords.forEach(r => {
      const key = `${r.anio}-${r.mes.toLowerCase()}`
      if (!monthBucketsMap[key]) {
        monthBucketsMap[key] = {
          anio: r.anio,
          mes: r.mes,
          mesNumero: r.mesNumero,
          label: `${r.mes.substring(0, 3).toUpperCase()} ${r.anio}`,
          items: [],
          total: 0
        }
      }

      monthBucketsMap[key].total += r.qty
      const existingItem = monthBucketsMap[key].items.find(i => i.producto === r.producto)
      if (existingItem) {
        existingItem.qty += r.qty
      } else {
        monthBucketsMap[key].items.push({
          producto: r.producto,
          qty: r.qty,
          color: getProductColor(r.producto, monthBucketsMap[key].items.length)
        })
      }
    })

    const buckets = Object.values(monthBucketsMap).sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio
      return a.mesNumero - b.mesNumero
    })

    const maxTotal = buckets.reduce((max, b) => Math.max(max, b.total), 0)
    const yAxisMax = maxTotal > 0 ? Math.ceil((maxTotal * 1.15) / 5000) * 5000 : 10000

    return { buckets, yAxisMax }
  }, [filteredRecords])

  const uniqueProductsLegend = useMemo(() => {
    const prodSet = new Map<string, string>()
    let idx = 0
    filteredRecords.forEach(r => {
      if (!prodSet.has(r.producto)) {
        prodSet.set(r.producto, getProductColor(r.producto, idx))
        idx++
      }
    })
    return Array.from(prodSet.entries()).map(([name, color]) => ({ name, color }))
  }, [filteredRecords])

  // Exportar CSV
  const handleExportCSV = () => {
    if (analyticsViewMode === 'entregas') {
      if (filteredRecords.length === 0) return
      const headers = ['Año', 'Mes', 'Producto', 'Marca', 'Cantidad']
      const rows = filteredRecords.map(r => [
        r.anio,
        r.mes,
        `"${r.producto.replace(/"/g, '""')}"`,
        `"${(r.marca || '').replace(/"/g, '""')}"`,
        r.qty
      ])
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `Entregas_Demanda_${selectedMarca}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      if (filteredCatalog.length === 0) return
      const headers = ['SKU', 'Marca', 'Producto_Equipo', 'Tipo', 'Unidad_Medida', 'Descripcion', 'Estado']
      const rows = filteredCatalog.map(p => [
        p.codigo_sku,
        `"${(p.marca_nombre || '').replace(/"/g, '""')}"`,
        `"${p.nombre_producto_equipo.replace(/"/g, '""')}"`,
        p.es_equipo ? 'Equipo' : 'Reactivo',
        `"${(p.unidad_medida || 'Kit').replace(/"/g, '""')}"`,
        `"${(p.descripcion || '').replace(/"/g, '""')}"`,
        p.activo ? 'Activo' : 'Inactivo'
      ])
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `Catalogo_Maestro_${selectedMarca}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* ========================================================================= */}
      {/* 1. HEADER EJECUTIVO POWER BI: TÍTULO, SELECTOR DE VISTA & SLICERS */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
        
        {/* Fila Superior: Título & Selector de Modo */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Demanda & Entregas por Producto
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Power BI Official (176,681)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Base Central: <strong className="text-cyan-300 font-mono">1,496 Productos / Equipos</strong> en <strong className="text-emerald-300 font-mono">51 Marcas</strong>
              </p>
            </div>
          </div>

          {/* Selector de Pestañas Unificadas */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-white/10 text-xs font-bold gap-1 self-start lg:self-auto shadow-inner">
            <button
              onClick={() => setAnalyticsViewMode('entregas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                analyticsViewMode === 'entregas'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Entregas de Contrato ({grandTotalQTY.toLocaleString()})</span>
            </button>
            <button
              onClick={() => setAnalyticsViewMode('catalogo_global')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                analyticsViewMode === 'catalogo_global'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Catálogo Maestro ({brandCatalogCount})</span>
            </button>
          </div>
        </div>

        {/* Fila Inferior: Slicers & Barra de Búsqueda */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Slicer Año */}
            {analyticsViewMode === 'entregas' && (
              <div className="flex items-center gap-1.5 bg-slate-950 px-3.5 py-2 rounded-xl border border-white/10 text-xs">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Año:</span>
                <select
                  value={selectedAnio}
                  onChange={e => setSelectedAnio(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  {availableYears.map(y => (
                    <option key={y} value={y} className="bg-slate-900 text-white">
                      {y === 'TODOS' ? 'Todos los Años' : y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Slicer Mes */}
            {analyticsViewMode === 'entregas' && (
              <div className="flex items-center gap-1.5 bg-slate-950 px-3.5 py-2 rounded-xl border border-white/10 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mes:</span>
                <select
                  value={selectedMes}
                  onChange={e => setSelectedMes(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer capitalize"
                >
                  {availableMonths.map(m => (
                    <option key={m} value={m} className="bg-slate-900 text-white capitalize">
                      {m === 'TODOS' ? 'Todos los Meses' : m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Slicer Marca Global (Con Auto-Switch) */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3.5 py-2 rounded-xl border border-cyan-500/30 text-xs shadow-sm shadow-cyan-500/10">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Marca:</span>
              <select
                value={selectedMarca}
                onChange={e => handleBrandChange(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                {availableBrands.map(b => (
                  <option key={b} value={b} className="bg-slate-900 text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
            {/* Buscador Universal */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchProduct}
                onChange={e => setSearchProduct(e.target.value)}
                placeholder="Buscar SKU, producto o descripción..."
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
              />
              {searchProduct && (
                <button onClick={() => setSearchProduct('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Exportar CSV */}
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. NOTIFICACIÓN INFORMATIVA INTELIGENTE CUANDO SE SELECCIONA UNA MARCA */}
      {/* ========================================================================= */}
      {selectedMarca !== 'TODAS' && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-indigo-200">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              Filtrando marca <strong className="text-white font-mono">{selectedMarca}</strong>:{' '}
              <strong className="text-cyan-300 font-mono">{brandCatalogCount} productos/equipos</strong> en Catálogo Maestro |{' '}
              <strong className="text-emerald-300 font-mono">{grandTotalQTY.toLocaleString()} reactivos</strong> en Entregas Contratadas.
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {analyticsViewMode === 'entregas' && brandCatalogCount > 0 && (
              <button
                onClick={() => setAnalyticsViewMode('catalogo_global')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Ver sus {brandCatalogCount} Productos en Catálogo ➔</span>
              </button>
            )}
            {analyticsViewMode === 'catalogo_global' && grandTotalQTY > 0 && (
              <button
                onClick={() => setAnalyticsViewMode('entregas')}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Ver Entregas de Contrato ({grandTotalQTY.toLocaleString()}) ➔</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VISTA A: ENTREGAS & DEMANDA MENSUAL (POWER BI 176,681) */}
      {/* ========================================================================= */}
      {analyticsViewMode === 'entregas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* IZQUIERDA: TABLA JERÁRQUICA (Entregas por Producto) */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl p-5 space-y-4 backdrop-blur-xl flex flex-col h-[580px]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-shrink-0">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-cyan-400" />
                  Entregas por Producto
                </h4>
                <p className="text-[11px] text-slate-400">Jerarquía: Año ➔ Mes ➔ Producto</p>
              </div>
              <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-500/30">
                Total: {grandTotalQTY.toLocaleString()}
              </span>
            </div>

            {/* Tabla con scroll interno */}
            <div className="flex-1 overflow-y-auto pr-1 rounded-2xl border border-white/[0.06] custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] sticky top-0 z-10 border-b border-white/[0.08]">
                  <tr>
                    <th className="px-3 py-2.5 w-16">Año</th>
                    <th className="px-3 py-2.5 w-20">Mes</th>
                    <th className="px-3 py-2.5">Producto</th>
                    <th className="px-3 py-2.5 text-right w-24">QTY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {Object.keys(hierarchicalData).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-slate-400 space-y-2">
                        <Package className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                        <div>No hay entregas programadas en este contrato para {selectedMarca}</div>
                        {brandCatalogCount > 0 && (
                          <button
                            onClick={() => setAnalyticsViewMode('catalogo_global')}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-500/20 cursor-pointer"
                          >
                            <Database className="w-3.5 h-3.5" />
                            Ver los {brandCatalogCount} productos registrados en catálogo ➔
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    Object.entries(hierarchicalData).map(([anio, meses]) => (
                      <React.Fragment key={anio}>
                        {Object.entries(meses).map(([mes, info]) => (
                          <React.Fragment key={`${anio}-${mes}`}>
                            {info.productos.map((prod, pIdx) => {
                              const isHovered = hoveredProduct === prod.producto
                              return (
                                <tr
                                  key={`${anio}-${mes}-${prod.producto}`}
                                  onMouseEnter={() => setHoveredProduct(prod.producto)}
                                  onMouseLeave={() => setHoveredProduct(null)}
                                  className={`transition cursor-pointer ${
                                    isHovered
                                      ? 'bg-cyan-500/15 text-cyan-200'
                                      : 'hover:bg-white/[0.03] text-slate-200'
                                  }`}
                                >
                                  <td className="px-3 py-2 font-mono font-bold text-slate-400">
                                    {pIdx === 0 ? anio : ''}
                                  </td>
                                  <td className="px-3 py-2 font-medium text-slate-300 capitalize">
                                    {pIdx === 0 ? mes : ''}
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="font-semibold truncate max-w-[200px]" title={prod.producto}>
                                      {prod.producto}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">{prod.marca}</div>
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono font-bold text-white">
                                    {prod.qty.toLocaleString()}
                                  </td>
                                </tr>
                              )
                            })}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-950 sticky bottom-0 border-t-2 border-cyan-500/40 text-xs font-black text-white">
                  <tr>
                    <td colSpan={3} className="px-3 py-2.5 text-cyan-300 uppercase tracking-wider">
                      Total
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-black text-cyan-400 text-sm">
                      {grandTotalQTY.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* DERECHA: GRÁFICO DE BARRAS APILADAS (Demanda por Mes) */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl p-5 space-y-4 backdrop-blur-xl flex flex-col h-[580px]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-shrink-0">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Demanda por Mes por Producto
                </h4>
                <p className="text-[11px] text-slate-400">Volumen mensual apilado y distribuido por reactivo</p>
              </div>
              <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10">
                {stackedBarData.buckets.length} Meses Graficados
              </div>
            </div>

            {/* Gráfico SVG / CSS Grid con Tooltip Dinámico */}
            <div className="flex-1 flex gap-4 min-h-0">
              {/* Contenedor del Gráfico de Barras */}
              <div className="flex-1 flex flex-col justify-between bg-slate-950/70 p-4 rounded-2xl border border-white/[0.06] relative">
                {/* Eje Y Labels & Guías Horizontales */}
                <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between text-[9px] font-mono text-slate-600">
                  <div className="border-b border-white/[0.04] w-full flex justify-between">
                    <span>{(stackedBarData.yAxisMax / 1000).toFixed(0)} mil</span>
                  </div>
                  <div className="border-b border-white/[0.04] w-full flex justify-between">
                    <span>{(stackedBarData.yAxisMax * 0.75 / 1000).toFixed(0)} mil</span>
                  </div>
                  <div className="border-b border-white/[0.04] w-full flex justify-between">
                    <span>{(stackedBarData.yAxisMax * 0.50 / 1000).toFixed(0)} mil</span>
                  </div>
                  <div className="border-b border-white/[0.04] w-full flex justify-between">
                    <span>{(stackedBarData.yAxisMax * 0.25 / 1000).toFixed(0)} mil</span>
                  </div>
                  <div className="border-b border-white/[0.04] w-full flex justify-between">
                    <span>0 mil</span>
                  </div>
                </div>

                {/* Columnas Apiladas */}
                <div className="flex-1 flex items-end justify-between gap-2.5 z-10 pt-4 pb-2 px-6">
                  {stackedBarData.buckets.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                      <BarChart3 className="w-8 h-8 mb-2 opacity-40" />
                      <span>Sin entregas contratadas para este filtro</span>
                    </div>
                  ) : (
                    stackedBarData.buckets.map(bucket => {
                      const barHeightPercent = Math.min(100, Math.round((bucket.total / stackedBarData.yAxisMax) * 100))

                      return (
                        <div
                          key={bucket.label}
                          onMouseEnter={() => setHoveredBarDetail(bucket)}
                          onMouseLeave={() => setHoveredBarDetail(null)}
                          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                        >
                          {/* Barra Apilada */}
                          <div
                            className="w-full max-w-[42px] rounded-t-lg overflow-hidden flex flex-col-reverse transition-all duration-300 group-hover:brightness-125 shadow-lg group-hover:scale-x-105"
                            style={{ height: `${Math.max(barHeightPercent, 4)}%` }}
                          >
                            {bucket.items.map((item, iIdx) => {
                              const itemHeightPercent = bucket.total > 0 ? (item.qty / bucket.total) * 100 : 0
                              const isHighlighted = !hoveredProduct || hoveredProduct === item.producto

                              return (
                                <div
                                  key={item.producto + iIdx}
                                  style={{
                                    height: `${itemHeightPercent}%`,
                                    backgroundColor: item.color,
                                    opacity: isHighlighted ? 1 : 0.25
                                  }}
                                  className="w-full transition-opacity duration-200 border-b border-black/20"
                                  title={`${item.producto}: ${item.qty.toLocaleString()} QTY`}
                                />
                              )
                            })}
                          </div>

                          {/* Label Mes en Eje X */}
                          <div className="mt-2 text-center">
                            <div className="text-[10px] font-bold text-slate-300 capitalize truncate max-w-[50px] group-hover:text-cyan-400">
                              {bucket.mes}
                            </div>
                            <div className="text-[8.5px] font-mono text-slate-500">
                              {bucket.anio}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Floating Tooltip cuando se pasa el cursor sobre una barra */}
                {hoveredBarDetail && (
                  <div className="absolute top-3 left-3 bg-slate-900/95 border border-cyan-500/40 rounded-xl p-3 shadow-2xl z-20 pointer-events-none max-w-xs text-xs backdrop-blur-md animate-in fade-in duration-150">
                    <div className="font-bold text-white border-b border-white/10 pb-1 flex items-center justify-between gap-4">
                      <span>{hoveredBarDetail.label}</span>
                      <span className="font-mono text-cyan-400">{hoveredBarDetail.total.toLocaleString()} QTY</span>
                    </div>
                    <div className="space-y-1 mt-2 max-h-36 overflow-y-auto pr-1">
                      {hoveredBarDetail.items.map((i: any) => (
                        <div key={i.producto} className="flex items-center justify-between text-[11px] gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: i.color }} />
                            <span className="text-slate-300 truncate">{i.producto}</span>
                          </div>
                          <span className="font-mono font-bold text-white">{i.qty.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Leyenda Interactiva a la Derecha */}
              <div className="w-48 flex-shrink-0 flex flex-col justify-between bg-slate-950/60 p-3 rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-white/[0.06] pb-1 flex items-center justify-between">
                  <span>Producto</span>
                  <span className="text-[9px] font-mono text-cyan-400">{uniqueProductsLegend.length} SKUs</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar text-[11px]">
                  {uniqueProductsLegend.map(item => {
                    const isHovered = hoveredProduct === item.name
                    return (
                      <div
                        key={item.name}
                        onMouseEnter={() => setHoveredProduct(item.name)}
                        onMouseLeave={() => setHoveredProduct(null)}
                        className={`p-1 rounded-lg flex items-center gap-2 cursor-pointer transition ${
                          isHovered
                            ? 'bg-cyan-500/20 text-white font-bold'
                            : 'hover:bg-white/[0.04] text-slate-300'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate leading-tight" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 border-t border-white/[0.06] text-[9.5px] font-mono text-slate-500 text-center">
                  Pasa el cursor para aislar
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VISTA B: CATÁLOGO MAESTRO & SKUs (1,496 PRODUCTOS & 51 MARCAS) */}
      {/* ========================================================================= */}
      {analyticsViewMode === 'catalogo_global' && (
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl p-5 space-y-4 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Catálogo Maestro de Productos & Equipos</span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-bold">
                    {filteredCatalog.length} Productos
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Mostrando registros para: <strong className="text-white font-mono">{selectedMarca}</strong>
                </p>
              </div>
            </div>

            {/* Selector de Paginación */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
              <span className="text-slate-400 text-[11px]">
                Página <strong className="text-white">{catalogPage}</strong> de <strong className="text-white">{totalCatalogPages}</strong>
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={catalogPage <= 1}
                  onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={catalogPage >= totalCatalogPages}
                  onClick={() => setCatalogPage(p => Math.min(totalCatalogPages, p + 1))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Productos del Catálogo Maestro */}
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-white/[0.08]">
                <tr>
                  <th className="px-4 py-3 w-28">SKU</th>
                  <th className="px-4 py-3 w-44">Marca</th>
                  <th className="px-4 py-3">Nombre del Producto / Equipo</th>
                  <th className="px-4 py-3 w-32">Tipo</th>
                  <th className="px-4 py-3 w-24">Unidad</th>
                  <th className="px-4 py-3">Descripción / Cód. Fab</th>
                  <th className="px-4 py-3 w-20 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loadingCatalog ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400">
                      <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-indigo-400" />
                      <div>Cargando productos de Supabase...</div>
                    </td>
                  </tr>
                ) : paginatedCatalog.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-500">
                      No se encontraron productos para {selectedMarca} con los filtros actuales
                    </td>
                  </tr>
                ) : (
                  paginatedCatalog.map((prod) => (
                    <tr key={prod.producto_equipo_id} className="hover:bg-white/[0.03] transition">
                      <td className="px-4 py-2.5 font-mono font-bold text-cyan-300">
                        {prod.codigo_sku}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-200">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-white/10 text-[11px]">
                          {prod.marca_nombre}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-white">
                        {prod.nombre_producto_equipo}
                      </td>
                      <td className="px-4 py-2.5">
                        {prod.es_equipo ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            <Cpu className="w-3 h-3" /> Equipo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            <Tag className="w-3 h-3" /> Reactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-300">
                        {prod.unidad_medida}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-[11px] truncate max-w-xs">
                        {prod.descripcion || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {prod.activo ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" title="Activo" />
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" title="Inactivo" />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer de Paginación */}
          <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
            <div>
              Mostrando del <strong className="text-white">{Math.min(filteredCatalog.length, (catalogPage - 1) * catalogPageSize + 1)}</strong> al{' '}
              <strong className="text-white">{Math.min(filteredCatalog.length, catalogPage * catalogPageSize)}</strong> de{' '}
              <strong className="text-white">{filteredCatalog.length}</strong> productos
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={catalogPage <= 1}
                onClick={() => setCatalogPage(1)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[11px]"
              >
                Primera
              </button>
              <button
                disabled={catalogPage <= 1}
                onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[11px]"
              >
                Anterior
              </button>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-mono font-bold">
                {catalogPage} / {totalCatalogPages}
              </span>
              <button
                disabled={catalogPage >= totalCatalogPages}
                onClick={() => setCatalogPage(p => Math.min(totalCatalogPages, p + 1))}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[11px]"
              >
                Siguiente
              </button>
              <button
                disabled={catalogPage >= totalCatalogPages}
                onClick={() => setCatalogPage(totalCatalogPages)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[11px]"
              >
                Última
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
