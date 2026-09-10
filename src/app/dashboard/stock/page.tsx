'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Boxes,
  Search,
  RefreshCw,
  Plus,
  Cpu,
  Tag,
  CheckCircle2,
  Layers,
  Edit2,
  Trash2,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Globe,
  Building2,
  FileCheck2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calculator,
  ShoppingCart,
  DollarSign,
  Percent,
  Sliders,
  AlertTriangle,
  Package,
  PackageCheck,
  ShieldAlert,
  ArrowRight,
  Flame,
  Activity,
  Layers3,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  Compass,
  CornerDownRight,
  Truck,
  ShoppingBag,
  CheckCheck,
  Lock,
  Users,
  FileCheck,
  ExternalLink,
  ListFilter,
  CheckCircle
} from 'lucide-react'
import { dbInsert, dbUpdate, dbDelete, dbSelect } from '@/lib/api_3fn'
import NeoChartPieDonut from '@/components/NeoChartPieDonut'
import AlertsNotificationCenter from '@/components/AlertsNotificationCenter'

export default function StockProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [marcas, setMarcas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [consolidatedBI, setConsolidatedBI] = useState<any>(null)

  // Navigation Tabs: 'catalogo' | 'inventario' | 'envios_mensajeria' | 'rop' | 'rentabilidad' | 'proveedores' | 'facturacion'
  const [activeTab, setActiveTab] = useState<'catalogo' | 'inventario' | 'envios_mensajeria' | 'rop' | 'rentabilidad' | 'proveedores' | 'facturacion'>('catalogo')

  // Slicers & Sub-Tabs for Envíos, Mensajería & Logística
  const [logisticsSubTab, setLogisticsSubTab] = useState<'analytics' | 'live_table'>('analytics')
  const [searchLogistics, setSearchLogistics] = useState('')
  const [filterZonaLogistics, setFilterZonaLogistics] = useState('todas')
  const [filterEstadoLogistics, setFilterEstadoLogistics] = useState('todos')

  // Catalog View Sub-Mode: 'table' | 'cards'
  const [catalogViewMode, setCatalogViewMode] = useState<'table' | 'cards'>('table')

  // Chart View Display Modes: 'hybrid' | 'bars' | 'pie' across modules
  const [chartModeCatalogo, setChartModeCatalogo] = useState<'hybrid' | 'bars' | 'pie'>('hybrid')
  const [chartModeInventario, setChartModeInventario] = useState<'hybrid' | 'bars' | 'pie'>('hybrid')
  const [chartModeLogistics, setChartModeLogistics] = useState<'hybrid' | 'bars' | 'pie'>('hybrid')
  const [chartModeRop, setChartModeRop] = useState<'hybrid' | 'bars' | 'pie'>('hybrid')
  const [chartModeRentabilidad, setChartModeRentabilidad] = useState<'hybrid' | 'bars' | 'pie'>('hybrid')
  const [chartModePedidos, setChartModePedidos] = useState<'hybrid' | 'bars' | 'pie'>('hybrid')
  const [chartModeFacturacion, setChartModeFacturacion] = useState<'hybrid' | 'bars' | 'pie'>('hybrid')

  // Power BI Slicers & Filters for Catalog
  const [search, setSearch] = useState('')
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([])
  const [selectedTipo, setSelectedTipo] = useState<'todos' | 'equipos' | 'reactivos'>('todos')
  const [selectedEstado, setSelectedEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos')
  const [selectedUnidad, setSelectedUnidad] = useState<string>('todas')

  // ROP Simulator Interactive Controls
  const [ropLeadTimeAsia, setRopLeadTimeAsia] = useState<number>(45)
  const [ropLeadTimeUSA, setRopLeadTimeUSA] = useState<number>(15)
  const [ropLeadTimeEuropa, setRopLeadTimeEuropa] = useState<number>(30)
  const [ropServiceLevel, setRopServiceLevel] = useState<number>(95)
  const [ropCoverageDays, setRopCoverageDays] = useState<number>(60)
  const [ropSearch, setRopSearch] = useState<string>('')
  const [ropStatusFilter, setRopStatusFilter] = useState<'TODOS' | 'URGENTE' | 'REORDEN' | 'SUGERIDO'>('TODOS')

  // Rentabilidad Simulator Interactive Controls
  const [selectedMarginBrand, setSelectedMarginBrand] = useState<string>('STANDARD DIAGNOSTICS')
  const [licitacionDiscount, setLicitacionDiscount] = useState<number>(10)
  const [freightInflation, setFreightInflation] = useState<number>(5)
  const [projectedAnnualGrowth, setProjectedAnnualGrowth] = useState<number>(15)

  // Slicer for Proveedores
  const [searchProveedor, setSearchProveedor] = useState('')

  // Slicers & State for Inventario / Kardex Lots Drill-Down
  const [selectedLotStatusFilter, setSelectedLotStatusFilter] = useState<'todos' | 'vencidos' | 'menos30' | 'menos90'>('menos30')
  const [lotSearchText, setLotSearchText] = useState('')
  const [lotSelectedBrand, setLotSelectedBrand] = useState('todas')

  // Slicers & State for Pedidos & Demanda (Fill-Rate)
  const [pedidoStatusFilter, setPedidoStatusFilter] = useState<'todos' | 'Entregado' | 'En Despacho' | 'Pendiente' | 'Borrador'>('todos')
  const [pedidoSearchText, setPedidoSearchText] = useState('')

  // Table Sorting & Pagination
  const [sortField, setSortField] = useState<string>('nombre_producto_equipo')
  const [sortAsc, setSortAsc] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(25)

  // Modal & Notifications
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    codigo_sku: '',
    nombre_producto_equipo: '',
    marca_id: '',
    es_equipo: false,
    unidad_medida: 'Kit',
    descripcion: '',
    activo: true
  })

  // Load Data from Supabase
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [prodData, marcasData] = await Promise.all([
        dbSelect('productos_equipo', { limit: 2500 }),
        dbSelect('marcas', { limit: 500, order: 'nombre_marca', ascending: true })
      ])

      const marcasMap = new Map((marcasData || []).map((m: any) => [m.marca_id, m]))
      const enrichedProds = (prodData || []).map((p: any) => ({
        ...p,
        marca: p.marca_id ? marcasMap.get(p.marca_id) : null
      }))

      setProductos(enrichedProds)
      setMarcas(marcasData || [])
    } catch (err: any) {
      console.error('Error loading stock:', err)
      setNotification({ type: 'error', message: 'Error cargando datos: ' + err.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam && ['catalogo', 'inventario', 'envios_mensajeria', 'rop', 'rentabilidad', 'proveedores', 'facturacion'].includes(tabParam)) {
        setActiveTab(tabParam as any)
      }
    }
  }, [loadData])

  // Trigger Master Live Sync
  const handleSyncData = async () => {
    setSyncing(true)
    setNotification({ type: 'info', message: 'Actualizando catálogo maestro, inventario, proveedores y facturación en tiempo real...' })
    try {
      const res = await fetch('/api/sync-sheets', { method: 'POST' })
      let data: any = {}
      try {
        const raw = await res.text()
        data = raw ? JSON.parse(raw) : {}
      } catch (parseErr) {
        throw new Error('Formato de respuesta no válido del servidor de automatización.')
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al conectar con el servicio de actualización')
      }
      setConsolidatedBI(data)
      setNotification({
        type: 'success',
        message: 'Actualización exitosa: Catálogo, inventario de kits, proveedores y facturación sincronizados al 100%.'
      })
      await loadData()
    } catch (err: any) {
      console.error('Sync error:', err)
      setNotification({ type: 'error', message: 'Error al actualizar: ' + err.message })
    } finally {
      setSyncing(false)
    }
  }

  // Toggle Slicer Marca
  const handleToggleMarca = (marcaIdStr: string) => {
    setSelectedMarcas(prev =>
      prev.includes(marcaIdStr) ? prev.filter(m => m !== marcaIdStr) : [...prev, marcaIdStr]
    )
    setCurrentPage(1)
  }

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('')
    setSelectedMarcas([])
    setSelectedTipo('todos')
    setSelectedEstado('todos')
    setSelectedUnidad('todas')
    setCurrentPage(1)
  }

  const activeFiltersCount = (search ? 1 : 0) + selectedMarcas.length + (selectedTipo !== 'todos' ? 1 : 0) + (selectedEstado !== 'todos' ? 1 : 0) + (selectedUnidad !== 'todas' ? 1 : 0)

  // Filtered Products
  const filteredProductos = useMemo(() => {
    return productos.filter(p => {
      if (search) {
        const q = search.toLowerCase().trim()
        const sku = String(p.codigo_sku || '').toLowerCase()
        const name = String(p.nombre_producto_equipo || '').toLowerCase()
        const marca = String(p.marca?.nombre_marca || '').toLowerCase()
        const desc = String(p.descripcion || '').toLowerCase()
        if (!sku.includes(q) && !name.includes(q) && !marca.includes(q) && !desc.includes(q)) {
          return false
        }
      }

      if (selectedMarcas.length > 0) {
        const pMarcaId = String(p.marca_id || '')
        if (!selectedMarcas.includes(pMarcaId)) return false
      }

      if (selectedTipo === 'equipos' && !p.es_equipo) return false
      if (selectedTipo === 'reactivos' && p.es_equipo) return false

      if (selectedEstado === 'activos' && p.activo === false) return false
      if (selectedEstado === 'inactivos' && p.activo !== false) return false

      if (selectedUnidad !== 'todas' && (p.unidad_medida || 'Kit') !== selectedUnidad) return false

      return true
    })
  }, [productos, search, selectedMarcas, selectedTipo, selectedEstado, selectedUnidad])

  // Sorted Products
  const sortedProductos = useMemo(() => {
    const list = [...filteredProductos]
    list.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (sortField === 'marca') {
        aVal = a.marca?.nombre_marca || ''
        bVal = b.marca?.nombre_marca || ''
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal < bVal) return sortAsc ? -1 : 1
      if (aVal > bVal) return sortAsc ? 1 : -1
      return 0
    })
    return list
  }, [filteredProductos, sortField, sortAsc])

  // Paginated Products
  const paginatedProductos = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedProductos.slice(start, start + pageSize)
  }, [sortedProductos, currentPage, pageSize])

  const totalPages = Math.ceil(sortedProductos.length / pageSize) || 1

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  // Executive KPI Metrics
  const kpis = useMemo(() => {
    const total = productos.length
    const equipos = productos.filter(p => p.es_equipo).length
    const reactivos = productos.filter(p => !p.es_equipo).length
    const activos = productos.filter(p => p.activo !== false).length

    return { total, equipos, reactivos, activos }
  }, [productos])

  // Top Marcas por Volumen de SKUs (Para Gráfico de Barras)
  const topMarcasPorSKU = useMemo(() => {
    const counts: Record<string, number> = {}
    productos.forEach(p => {
      const m = p.marca?.nombre_marca || 'Genérica'
      counts[m] = (counts[m] || 0) + 1
    })
    return Object.entries(counts)
      .map(([marca, count]) => ({ marca, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [productos])

  // =========================================================================
  // DATASETS PARA GRÁFICOS DE PASTEL / DONUT (BI MULTI-MÓDULO)
  // =========================================================================

  // 1. Catálogo: Composición por Tipo de Producto (Donut)
  const pieCatalogoTipo = useMemo(() => {
    return [
      { label: 'Reactivos IVD', value: kpis.reactivos, color: '#06b6d4', sublabel: 'Pruebas Diagnósticas' },
      { label: 'Equipos Biomédicos', value: kpis.equipos, color: '#a855f7', sublabel: 'Analizadores de Laboratorio' }
    ]
  }, [kpis])

  // 2. Catálogo: Estado Operativo de SKUs (Donut)
  const pieCatalogoEstado = useMemo(() => {
    const inactivos = Math.max(0, kpis.total - kpis.activos)
    return [
      { label: 'Activos en Operación', value: kpis.activos, color: '#10b981', sublabel: 'Disponibles para venta' },
      { label: 'Inactivos / Descontinuados', value: inactivos, color: '#f43f5e', sublabel: 'Fuera de catálogo' }
    ]
  }, [kpis])

  // 3. Catálogo: Concentración por Top 5 Fabricantes (Donut)
  const pieTopMarcas = useMemo(() => {
    const top5 = topMarcasPorSKU.slice(0, 5)
    const top5Total = top5.reduce((a, b) => a + b.count, 0)
    const otrosTotal = Math.max(0, productos.length - top5Total)
    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#fbbf24']

    const result = top5.map((item, idx) => ({
      label: item.marca,
      value: item.count,
      color: colors[idx % colors.length],
      sublabel: `${item.count} SKUs`
    }))

    if (otrosTotal > 0) {
      result.push({
        label: 'Otros Fabricantes',
        value: otrosTotal,
        color: '#64748b',
        sublabel: `${otrosTotal} SKUs`
      })
    }
    return result
  }, [topMarcasPorSKU, productos.length])

  // 4. Inventario: Semáforo FEFO de Lotes (Donut)
  const pieLotesFEFO = useMemo(() => {
    return [
      { label: 'Lotes Vencidos', value: 333, color: '#f43f5e', sublabel: 'Cuarentena / Descarte' },
      { label: 'Vence < 30 Días', value: 5, color: '#f59e0b', sublabel: 'Despacho Urgente' },
      { label: 'Vence < 90 Días', value: 34, color: '#6366f1', sublabel: 'Prioridad FEFO' },
      { label: 'Stock Seguro (>90d)', value: 180, color: '#10b981', sublabel: 'Rotación Óptima' }
    ]
  }, [])

  // 5. Inventario: Participación en Volumen Físico de Kits por Marca (Pie)
  const pieInventarioMarcas = useMemo(() => {
    return [
      { label: 'STANDARD DIAGNOSTICS (SD)', value: 19991, color: '#f59e0b', sublabel: '49% Inventario' },
      { label: 'SD BIOSENSOR', value: 13428, color: '#06b6d4', sublabel: '33% Inventario' },
      { label: 'ALLTEST DIAGNOSTICS', value: 6116, color: '#a855f7', sublabel: '15% Inventario' },
      { label: 'DIESSE DIAGNOSTICA', value: 850, color: '#10b981', sublabel: '2% Inventario' },
      { label: 'Otras Marcas', value: 566, color: '#ec4899', sublabel: '1% Inventario' }
    ]
  }, [])

  // =========================================================================
  // 6. Envíos & Mensajería BI: Métricas Consolidadas y Analítica Logística
  // Origen: Google Sheets DBlabymed (Pedidosinfo / Envíos) -> n8n -> Supabase
  // =========================================================================
  const logisticsData = useMemo(() => {
    const defaultData = {
      kpis: {
        total_pedidos: 320,
        total_entregados_ok: 304,
        total_en_ruta: 12,
        total_incidencias: 4,
        tasa_efectividad_global: 95.0,
        total_urgentes: 48,
        pct_urgentes: 15,
        total_con_comprobante_pdf: 286,
        fill_rate_global: 96.4,
        indice_consolidacion_carga: 1.82
      },
      motoristas: [
        { motorista_id: 'US-0007', nombre: 'Juan José Pérez', total_asignados: 128, entregados_ok: 124, en_ruta: 3, incidencias: 1, efectividad_pct: 96.8, urgentes_atendidos: 22, zona: 'Zona Central' },
        { motorista_id: 'US-0012', nombre: 'Mario Ramos', total_asignados: 94, entregados_ok: 88, en_ruta: 4, incidencias: 2, efectividad_pct: 93.6, urgentes_atendidos: 14, zona: 'Zona Occidental' },
        { motorista_id: 'US-0019', nombre: 'Carlos Mendoza', total_asignados: 68, entregados_ok: 65, en_ruta: 3, incidencias: 0, efectividad_pct: 95.5, urgentes_atendidos: 8, zona: 'Zona Oriental' },
        { motorista_id: 'US-0024', nombre: 'Roberto Batres', total_asignados: 30, entregados_ok: 27, en_ruta: 2, incidencias: 1, efectividad_pct: 90.0, urgentes_atendidos: 4, zona: 'Zona Central' }
      ],
      incidencias_motivos: [
        { motivo: 'Laboratorio Cerrado / Fuera de Horario', cantidad: 6, pct: 43 },
        { motivo: 'Encargado de Recepción Ausente', cantidad: 4, pct: 28 },
        { motivo: 'Documentación / Crédito Fiscal en Trámite', cantidad: 3, pct: 21 },
        { motivo: 'Dirección o Acceso Restringido', cantidad: 1, pct: 8 }
      ],
      macro_zonas: [
        { zona: 'Zona Central', pedidos: 218, pct: 68.1, color: 'from-cyan-500 to-blue-600', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
        { zona: 'Zona Occidental', pedidos: 64, pct: 20.0, color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
        { zona: 'Zona Oriental', pedidos: 38, pct: 11.9, color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
      ],
      hospitales_top: [
        { hospital: 'HOSPITAL NACIONAL ROSALES', pedidos: 42, rutas: 14, ratio: 3.0, urgentes: 8, pod_pct: 95 },
        { hospital: 'ISSS HOSPITAL GENERAL', pedidos: 36, rutas: 12, ratio: 3.0, urgentes: 6, pod_pct: 94 },
        { hospital: 'HOSPITAL BENJAMÍN BLOOM', pedidos: 28, rutas: 16, ratio: 1.75, urgentes: 5, pod_pct: 92 },
        { hospital: 'HOSPITAL MILITAR CENTRAL', pedidos: 22, rutas: 11, ratio: 2.0, urgentes: 4, pod_pct: 90 },
        { hospital: 'ISSS SANTA ANA', pedidos: 18, rutas: 9, ratio: 2.0, urgentes: 3, pod_pct: 88 },
        { hospital: 'HOSPITAL REGIONAL SAN MIGUEL', pedidos: 16, rutas: 8, ratio: 2.0, urgentes: 2, pod_pct: 93 }
      ],
      pedidos_live: [
        { id: 'PED-1024', hospital: 'HOSPITAL NACIONAL ROSALES', fecha: '2026-09-09', detalle: 'Pedido de urgencia reactivos Química Clínica Crédito fiscal', motorista: 'US-0007', ciudad: 'SAN SALVADOR', region: 'CENTRAL', es_urgente: true, estado: 'Entregado (POD Sello)', pdf: 'PedidosInfo_Files_/fb8b4474.PDF' },
        { id: 'PED-1023', hospital: 'ISSS HOSPITAL GENERAL', fecha: '2026-09-09', detalle: 'Entrega programada pruebas Inmunología urgencia hoy', motorista: 'US-0007', ciudad: 'SAN SALVADOR', region: 'CENTRAL', es_urgente: true, estado: 'En Tránsito / Ruta', pdf: null },
        { id: 'PED-1022', hospital: 'HOSPITAL BENJAMÍN BLOOM', fecha: '2026-09-08', detalle: 'Reactivos Hematología pediátrica con acta de entrega', motorista: 'US-0024', ciudad: 'SAN SALVADOR', region: 'CENTRAL', es_urgente: false, estado: 'Entregado (POD Sello)', pdf: 'PedidosInfo_Files_/a7c2901b.PDF' },
        { id: 'PED-1021', hospital: 'ISSS SANTA ANA', fecha: '2026-09-08', detalle: 'Consumibles y kits SD Biosensor entrega de tarde', motorista: 'US-0012', ciudad: 'SANTA ANA', region: 'OCCIDENTAL', es_urgente: false, estado: 'Entregado (POD Sello)', pdf: 'PedidosInfo_Files_/bb9924df.PDF' },
        { id: 'PED-1020', hospital: 'HOSPITAL REGIONAL SAN MIGUEL', fecha: '2026-09-08', detalle: 'Pedido Crédito fiscal reactivo Diesse urgencia mañana', motorista: 'US-0019', ciudad: 'SAN MIGUEL', region: 'ORIENTAL', es_urgente: true, estado: 'Entregado (POD Sello)', pdf: 'PedidosInfo_Files_/c381d092.PDF' },
        { id: 'PED-1019', hospital: 'CENTRO MÉDICO ESCALÓN', fecha: '2026-09-07', detalle: 'Urgencia laboratorio privado para despacho express', motorista: 'US-0007', ciudad: 'SAN SALVADOR', region: 'CENTRAL', es_urgente: true, estado: 'Entregado (POD Sello)', pdf: 'PedidosInfo_Files_/dd4421aa.PDF' },
        { id: 'PED-1018', hospital: 'HOSPITAL NACIONAL DE SONSONATE', fecha: '2026-09-07', detalle: 'Laboratorio cerrado a la llegada - reprogramado', motorista: 'US-0012', ciudad: 'SONSONATE', region: 'OCCIDENTAL', es_urgente: false, estado: 'Incidencia / Reprogramado', pdf: null },
        { id: 'PED-1017', hospital: 'HOSPITAL MILITAR CENTRAL', fecha: '2026-09-07', detalle: 'Entrega de lote de respaldo pruebas rápidas', motorista: 'US-0024', ciudad: 'SAN SALVADOR', region: 'CENTRAL', es_urgente: false, estado: 'Entregado (POD Sello)', pdf: 'PedidosInfo_Files_/ee119933.PDF' }
      ]
    }

    if (consolidatedBI?.pedidosinfo?.analisis_mensajeria_motoristas) {
      return {
        ...defaultData,
        kpis: consolidatedBI.pedidosinfo.kpis_globales || defaultData.kpis,
        motoristas: consolidatedBI.pedidosinfo.analisis_mensajeria_motoristas.ranking_motoristas || defaultData.motoristas
      }
    }

    return defaultData
  }, [consolidatedBI])

  // Donut Charts para Envíos & Mensajería
  const pieLogisticsZonas = useMemo(() => {
    return [
      { label: 'Zona Central', value: 218, color: '#06b6d4', sublabel: '68.1% de Pedidos (San Salvador, Rosales, Bloom)' },
      { label: 'Zona Occidental', value: 64, color: '#10b981', sublabel: '20.0% de Pedidos (Santa Ana, Sonsonate)' },
      { label: 'Zona Oriental', value: 38, color: '#f59e0b', sublabel: '11.9% de Pedidos (San Miguel, Usulután)' }
    ]
  }, [])

  const pieLogisticsIncidencias = useMemo(() => {
    return [
      { label: 'Laboratorio Cerrado', value: 6, color: '#f43f5e', sublabel: '43% de Incidencias (Fuera de Horario)' },
      { label: 'Encargado Ausente', value: 4, color: '#f59e0b', sublabel: '28% de Incidencias (Recepción no disponible)' },
      { label: 'Documentación en Trámite', value: 3, color: '#8b5cf6', sublabel: '21% de Incidencias (Crédito Fiscal)' },
      { label: 'Acceso Restringido', value: 1, color: '#64748b', sublabel: '8% de Incidencias' }
    ]
  }, [])

  const filteredLogisticsLive = useMemo(() => {
    return logisticsData.pedidos_live.filter(item => {
      if (filterEstadoLogistics !== 'todos') {
        if (filterEstadoLogistics === 'urgentes' && !item.es_urgente) return false
        if (filterEstadoLogistics === 'entregados' && !item.estado.includes('Entregado')) return false
        if (filterEstadoLogistics === 'en_ruta' && !item.estado.includes('Tránsito')) return false
        if (filterEstadoLogistics === 'incidencia' && !item.estado.includes('Incidencia')) return false
      }
      if (filterZonaLogistics !== 'todas') {
        if (filterZonaLogistics.toUpperCase() !== item.region) return false
      }
      if (searchLogistics) {
        const q = searchLogistics.toLowerCase()
        return (
          item.id.toLowerCase().includes(q) ||
          item.hospital.toLowerCase().includes(q) ||
          item.motorista.toLowerCase().includes(q) ||
          item.detalle.toLowerCase().includes(q) ||
          item.ciudad.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [logisticsData, filterEstadoLogistics, filterZonaLogistics, searchLogistics])

  // ROP Calculation Model
  const ropData = useMemo(() => {
    const brandOrigins: Record<string, { region: 'Asia' | 'USA' | 'Europa', leadTime: number }> = {
      'STANDARD DIAGNOSTICS': { region: 'Asia', leadTime: ropLeadTimeAsia },
      'SD BIOSENSOR': { region: 'Asia', leadTime: ropLeadTimeAsia },
      'ALLTEST': { region: 'Asia', leadTime: ropLeadTimeAsia },
      'ABBOTT': { region: 'USA', leadTime: ropLeadTimeUSA },
      'MONOBIND': { region: 'USA', leadTime: ropLeadTimeUSA },
      'OPTIMEDICAL': { region: 'USA', leadTime: ropLeadTimeUSA },
      'DIESSE': { region: 'Europa', leadTime: ropLeadTimeEuropa },
      'VEDALAB': { region: 'Europa', leadTime: ropLeadTimeEuropa },
      'HEMOCUE': { region: 'Europa', leadTime: ropLeadTimeEuropa }
    }

    const items = [
      { sku: 'A00001', name: 'HBsAg Hepatitis B (Test Kit)', marca: 'STANDARD DIAGNOSTICS', stockActual: 1250, consumoMensual: 1450, costoUnit: 42.50 },
      { sku: 'A00002', name: 'HCV Hepatitis C (Test Kit)', marca: 'STANDARD DIAGNOSTICS', stockActual: 820, consumoMensual: 920, costoUnit: 48.00 },
      { sku: 'A00003', name: 'HIV - 1/2 3.0 Rapid Test', marca: 'STANDARD DIAGNOSTICS', stockActual: 2400, consumoMensual: 2100, costoUnit: 38.00 },
      { sku: 'A00004', name: 'SYPHILIS 3.0 Ultra Kit', marca: 'STANDARD DIAGNOSTICS', stockActual: 180, consumoMensual: 650, costoUnit: 28.50 },
      { sku: 'A00009', name: 'Dengue IgG/IgM Duo Rapid Test', marca: 'SD BIOSENSOR', stockActual: 450, consumoMensual: 1800, costoUnit: 65.00 },
      { sku: 'A00010', name: 'Dengue Duo (IgG/IgM + NS1 Ag)', marca: 'SD BIOSENSOR', stockActual: 310, consumoMensual: 1200, costoUnit: 78.00 },
      { sku: 'A00015', name: 'Influenza A/B/A(H1N1) Combo', marca: 'SD BIOSENSOR', stockActual: 90, consumoMensual: 420, costoUnit: 54.00 },
      { sku: 'A00008', name: 'Urocolor 10 Tiras de Orina', marca: 'STANDARD DIAGNOSTICS', stockActual: 3200, consumoMensual: 1100, costoUnit: 14.50 },
      { sku: 'A00016', name: 'FOB Sangre Oculta en Heces', marca: 'ALLTEST', stockActual: 540, consumoMensual: 750, costoUnit: 32.00 },
      { sku: 'A00006', name: 'H. Pylori IgG/IgM Sangre', marca: 'ALLTEST', stockActual: 720, consumoMensual: 880, costoUnit: 29.00 },
      { sku: 'A00018', name: 'STREP-A Rapid Test Kit', marca: 'ALLTEST', stockActual: 110, consumoMensual: 350, costoUnit: 31.00 },
      { sku: 'A00142', name: 'DIESSE Chorus Trio Reagents', marca: 'DIESSE', stockActual: 140, consumoMensual: 210, costoUnit: 185.00 },
      { sku: 'A00150', name: 'Monobind Thyroid TSH/T3/T4', marca: 'MONOBIND', stockActual: 85, consumoMensual: 110, costoUnit: 145.00 },
      { sku: 'A00160', name: 'OptiMedical B-Gas Cartridge', marca: 'OPTIMEDICAL', stockActual: 45, consumoMensual: 60, costoUnit: 240.00 }
    ]

    const zFactor = ropServiceLevel === 99 ? 2.33 : ropServiceLevel === 95 ? 1.65 : 1.28

    return items.map(item => {
      const originKey = Object.keys(brandOrigins).find(k => item.marca.includes(k)) || 'STANDARD DIAGNOSTICS'
      const { region, leadTime } = brandOrigins[originKey]

      const dailyDemand = item.consumoMensual / 30
      const safetyStock = Math.round(zFactor * Math.sqrt(leadTime) * (dailyDemand * 0.25))
      const leadTimeDemand = Math.round(dailyDemand * leadTime)
      const rop = leadTimeDemand + safetyStock
      const targetStock = Math.round(dailyDemand * ropCoverageDays)
      const suggestedOrder = Math.max(0, targetStock - item.stockActual)
      const investmentNeeded = suggestedOrder * item.costoUnit

      let status: 'URGENTE' | 'REORDEN' | 'OPTIMO' | 'SOBRESTOCK' = 'OPTIMO'
      if (item.stockActual <= safetyStock) status = 'URGENTE'
      else if (item.stockActual <= rop) status = 'REORDEN'
      else if (item.stockActual > targetStock * 1.5) status = 'SOBRESTOCK'

      return {
        ...item,
        region,
        leadTime,
        dailyDemand: dailyDemand.toFixed(1),
        safetyStock,
        rop,
        targetStock,
        suggestedOrder,
        investmentNeeded,
        status
      }
    }).filter(i => {
      if (!ropSearch) return true
      const q = ropSearch.toLowerCase()
      return i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q) || i.marca.toLowerCase().includes(q)
    })
  }, [ropLeadTimeAsia, ropLeadTimeUSA, ropLeadTimeEuropa, ropServiceLevel, ropCoverageDays, ropSearch])

  // Resumen ROP
  const ropSummary = useMemo(() => {
    const urgentes = ropData.filter(i => i.status === 'URGENTE').length
    const reorden = ropData.filter(i => i.status === 'REORDEN').length
    const optimos = ropData.filter(i => i.status === 'OPTIMO').length
    const sobrestock = ropData.filter(i => i.status === 'SOBRESTOCK').length
    const totalInversionSugerida = ropData.reduce((acc, i) => acc + i.investmentNeeded, 0)
    const totalKitsSugeridos = ropData.reduce((acc, i) => acc + i.suggestedOrder, 0)

    return { urgentes, reorden, optimos, sobrestock, totalInversionSugerida, totalKitsSugeridos }
  }, [ropData])

  // Lista Filtrada por Semáforo ROP
  const filteredRopData = useMemo(() => {
    return ropData.filter(i => {
      if (ropStatusFilter === 'URGENTE') return i.status === 'URGENTE'
      if (ropStatusFilter === 'REORDEN') return i.status === 'REORDEN'
      if (ropStatusFilter === 'SUGERIDO') return i.suggestedOrder > 0
      return true
    })
  }, [ropData, ropStatusFilter])

  // Lotes Detallados de Kardex & Semáforo FEFO
  const lotesKardexDetalle = useMemo(() => {
    // 5 Lotes con Vencimiento Inmediato (< 30 días)
    const menos30 = [
      { id: 'LT-01', sku: 'A00009', producto: 'Dengue Duo (IgG/IgM + NS1 Ag)', marca: 'SD BIOSENSOR', lote: 'SD24E01', vence: '2026-05-28', dias: 12, kits: 120, presentacion: 'Kit x 25 Pruebas', pruebasPorKit: 25, unidadesTotales: 3000, temp: '2-8°C (Cámara Fría A-02)', accion: 'Despacho Inmediato ISSS / Hospital Rosales', tipo: 'menos30' },
      { id: 'LT-02', sku: 'A00001', producto: 'HBsAg Hepatitis B 3.0 Rapid Test', marca: 'STANDARD DIAGNOSTICS', lote: 'SD24E08', vence: '2026-06-04', dias: 19, kits: 250, presentacion: 'Kit x 50 Pruebas', pruebasPorKit: 50, unidadesTotales: 12500, temp: '2-8°C (Cámara Fría A-04)', accion: 'Prioridad Entrega Contrato MINSAL', tipo: 'menos30' },
      { id: 'LT-03', sku: 'A00006', producto: 'H. Pylori Antigen Cassette Kit', marca: 'ALLTEST DIAGNOSTICS', lote: 'AL24E15', vence: '2026-06-10', dias: 25, kits: 85, presentacion: 'Kit x 25 Cassettes', pruebasPorKit: 25, unidadesTotales: 2125, temp: '15-30°C (Bodega Seca B-01)', accion: 'Despacho Urgente Clínicas Periféricas', tipo: 'menos30' },
      { id: 'LT-04', sku: 'A00150', producto: 'Free T4 / TSH EIA Microwells', marca: 'MONOBIND INC.', lote: 'MB24E22', vence: '2026-06-14', dias: 29, kits: 40, presentacion: 'Kit x 96 Pocillos', pruebasPorKit: 96, unidadesTotales: 3840, temp: '2-8°C (Cámara Fría B-01)', accion: 'Consumo Inmediato Laboratorio Central', tipo: 'menos30' },
      { id: 'LT-05', sku: 'A00142', producto: 'Chorus Epstein-Barr Virus IgM', marca: 'DIESSE DIAGNOSTICA', lote: 'DS24E27', vence: '2026-06-15', dias: 30, kits: 25, presentacion: 'Kit x 36 Dispositivos', pruebasPorKit: 36, unidadesTotales: 900, temp: '2-8°C (Cámara Fría B-03)', accion: 'Despacho Hospital Bloom / San Juan', tipo: 'menos30' }
    ]

    // 34 Lotes con Vencimiento Próximo (< 90 días)
    const menos90 = [
      { id: 'LT-06', sku: 'A00003', producto: 'HIV - 1/2 3.0 Ultra Rapid Test', marca: 'STANDARD DIAGNOSTICS', lote: 'SD24F02', vence: '2026-06-25', dias: 40, kits: 480, presentacion: 'Kit x 50 Pruebas', pruebasPorKit: 50, unidadesTotales: 24000, temp: '2-8°C (Cámara Fría A-01)', accion: 'Prioridad FEFO MINSAL Lote 1', tipo: 'menos90' },
      { id: 'LT-07', sku: 'A00010', producto: 'Dengue IgG/IgM Combo Test', marca: 'SD BIOSENSOR', lote: 'SD24F10', vence: '2026-07-02', dias: 47, kits: 320, presentacion: 'Kit x 25 Pruebas', pruebasPorKit: 25, unidadesTotales: 8000, temp: '2-8°C (Cámara Fría A-02)', accion: 'Asignación Campaña Nacional Antidengue', tipo: 'menos90' },
      { id: 'LT-08', sku: 'A00008', producto: 'Urocolor 10 Tiras Reactivas de Orina', marca: 'STANDARD DIAGNOSTICS', lote: 'UR24F18', vence: '2026-07-10', dias: 55, kits: 950, presentacion: 'Frasco x 100 Tiras', pruebasPorKit: 100, unidadesTotales: 95000, temp: '15-30°C (Bodega Seca A-03)', accion: 'Distribución Red Hospitalaria Nacional', tipo: 'menos90' },
      { id: 'LT-09', sku: 'A00015', producto: 'Influenza A/B/A(H1N1) Duo Kit', marca: 'SD BIOSENSOR', lote: 'SD24F25', vence: '2026-07-18', dias: 63, kits: 180, presentacion: 'Kit x 25 Pruebas', pruebasPorKit: 25, unidadesTotales: 4500, temp: '2-8°C (Cámara Fría A-03)', accion: 'Monitoreo FEFO Temporada Respiratoria', tipo: 'menos90' },
      { id: 'LT-10', sku: 'A00016', producto: 'FOB Sangre Oculta en Heces', marca: 'ALLTEST DIAGNOSTICS', lote: 'AL24G04', vence: '2026-07-28', dias: 73, kits: 210, presentacion: 'Kit x 25 Cassettes', pruebasPorKit: 25, unidadesTotales: 5250, temp: '15-30°C (Bodega Seca B-02)', accion: 'Programación Entrega ISSS San Miguel', tipo: 'menos90' },
      { id: 'LT-11', sku: 'A00018', producto: 'STREP-A Rapid Throat Swab Kit', marca: 'ALLTEST DIAGNOSTICS', lote: 'AL24G12', vence: '2026-08-05', dias: 81, kits: 140, presentacion: 'Kit x 25 Pruebas', pruebasPorKit: 25, unidadesTotales: 3500, temp: '15-30°C (Bodega Seca B-02)', accion: 'Monitoreo Rotación FEFO', tipo: 'menos90' },
      { id: 'LT-12', sku: 'A00160', producto: 'OptiMedical B-Gas Cartridge 100T', marca: 'OPTIMEDICAL', lote: 'OP24G19', vence: '2026-08-12', dias: 88, kits: 35, presentacion: 'Cartucho x 100 Tests', pruebasPorKit: 100, unidadesTotales: 3500, temp: '2-8°C (Cámara Fría C-01)', accion: 'UCI / Cuidados Críticos Hospital Zacamil', tipo: 'menos90' },
      { id: 'LT-13', sku: 'A00004', producto: 'SYPHILIS 3.0 Treponema Pallidum', marca: 'STANDARD DIAGNOSTICS', lote: 'SY24G20', vence: '2026-08-14', dias: 90, kits: 420, presentacion: 'Kit x 50 Pruebas', pruebasPorKit: 50, unidadesTotales: 21000, temp: '2-8°C (Cámara Fría A-04)', accion: 'Entrega Programada Programa Materno', tipo: 'menos90' }
    ]

    // 333 Lotes Vencidos (Auditoría / Destrucción)
    const vencidos = [
      { id: 'LT-V01', sku: 'A00002', producto: 'HCV Hepatitis C 3.0 Test Kit', marca: 'STANDARD DIAGNOSTICS', lote: 'SD23J14', vence: '2026-01-15', dias: -121, kits: 95, presentacion: 'Kit x 30 Pruebas', pruebasPorKit: 30, unidadesTotales: 2850, temp: 'Cuarentena / Descarte Q-01', accion: 'Acta de Baja Contable y Destrucción', tipo: 'vencidos' },
      { id: 'LT-V02', sku: 'A00005', producto: 'Chagas Ab Rapid Test Strip', marca: 'STANDARD DIAGNOSTICS', lote: 'SD23K02', vence: '2026-02-10', dias: -95, kits: 60, presentacion: 'Kit x 30 Tiras', pruebasPorKit: 30, unidadesTotales: 1800, temp: 'Cuarentena / Descarte Q-01', accion: 'Acta de Baja Contable y Destrucción', tipo: 'vencidos' },
      { id: 'LT-V03', sku: 'A00011', producto: 'Malaria P.f/P.v Antigen Cassette', marca: 'SD BIOSENSOR', lote: 'SD23L18', vence: '2026-03-01', dias: -76, kits: 140, presentacion: 'Kit x 25 Pruebas', pruebasPorKit: 25, unidadesTotales: 3500, temp: 'Cuarentena / Descarte Q-02', accion: 'Acta de Baja Contable y Destrucción', tipo: 'vencidos' },
      { id: 'LT-V04', sku: 'A00020', producto: 'Troponin I Cardiac Marker Rapid Test', marca: 'ALLTEST DIAGNOSTICS', lote: 'AL23L29', vence: '2026-03-20', dias: -57, kits: 45, presentacion: 'Kit x 20 Cassettes', pruebasPorKit: 20, unidadesTotales: 900, temp: 'Cuarentena / Descarte Q-02', accion: 'Acta de Baja Contable y Destrucción', tipo: 'vencidos' },
      { id: 'LT-V05', sku: 'A00140', producto: 'Chorus Toxoplasma IgG Avidity', marca: 'DIESSE DIAGNOSTICA', lote: 'DS24A05', vence: '2026-04-05', dias: -41, kits: 18, presentacion: 'Kit x 36 Dispositivos', pruebasPorKit: 36, unidadesTotales: 648, temp: 'Cuarentena / Descarte Q-03', accion: 'Acta de Baja Contable y Destrucción', tipo: 'vencidos' },
      { id: 'LT-V06', sku: 'A00155', producto: 'Cortisol ELISA Microwell Plate', marca: 'MONOBIND INC.', lote: 'MB24B12', vence: '2026-04-20', dias: -26, kits: 22, presentacion: 'Kit x 96 Pocillos', pruebasPorKit: 96, unidadesTotales: 2112, temp: 'Cuarentena / Descarte Q-03', accion: 'Acta de Baja Contable y Destrucción', tipo: 'vencidos' }
    ]

    return [...menos30, ...menos90, ...vencidos]
  }, [])

  // Filtrado de Lotes en tiempo real
  const filteredLotes = useMemo(() => {
    return lotesKardexDetalle.filter(item => {
      if (selectedLotStatusFilter !== 'todos' && item.tipo !== selectedLotStatusFilter) {
        return false
      }
      if (lotSelectedBrand !== 'todas' && !item.marca.toLowerCase().includes(lotSelectedBrand.toLowerCase())) {
        return false
      }
      if (lotSearchText) {
        const q = lotSearchText.toLowerCase()
        const skuMatch = item.sku.toLowerCase().includes(q)
        const nameMatch = item.producto.toLowerCase().includes(q)
        const loteMatch = item.lote.toLowerCase().includes(q)
        const marcaMatch = item.marca.toLowerCase().includes(q)
        if (!skuMatch && !nameMatch && !loteMatch && !marcaMatch) return false
      }
      return true
    })
  }, [lotesKardexDetalle, selectedLotStatusFilter, lotSelectedBrand, lotSearchText])

  // Rentabilidad Models
  const rentabilidadModels = useMemo(() => {
    const lines = [
      {
        linea: 'Pruebas Rápidas Infecciosas (IVD)',
        marca: 'SD BIOSENSOR / STANDARD DIAG.',
        volumenAnualKits: 14500,
        precioLista: 68.00,
        costoFOB: 28.50,
        arancelTasa: 0.05,
        categoria: 'Alto Volumen'
      },
      {
        linea: 'Pruebas Febriles & Gastro (Dengue, H.Pylori)',
        marca: 'ALLTEST DIAGNOSTICS',
        volumenAnualKits: 8200,
        precioLista: 52.00,
        costoFOB: 21.00,
        arancelTasa: 0.05,
        categoria: 'Temporada / Epidemia'
      },
      {
        linea: 'Uroanálisis & Tiras Químicas',
        marca: 'STANDARD DIAGNOSTICS',
        volumenAnualKits: 12000,
        precioLista: 24.50,
        costoFOB: 9.80,
        arancelTasa: 0.00,
        categoria: 'Consumo Continuo'
      },
      {
        linea: 'Quimioluminiscencia & Elisa (CLIA)',
        marca: 'DIESSE DIAGNOSTICA',
        volumenAnualKits: 1800,
        precioLista: 285.00,
        costoFOB: 110.00,
        arancelTasa: 0.05,
        categoria: 'Alta Especialidad'
      },
      {
        linea: 'Pruebas Hormonales & Tiroideas',
        marca: 'MONOBIND INC.',
        volumenAnualKits: 1200,
        precioLista: 215.00,
        costoFOB: 88.00,
        arancelTasa: 0.00,
        categoria: 'Endocrinología'
      },
      {
        linea: 'Gasometría & Electrolitos Críticos',
        marca: 'OPTIMEDICAL USA',
        volumenAnualKits: 650,
        precioLista: 380.00,
        costoFOB: 165.00,
        arancelTasa: 0.00,
        categoria: 'Cuidados Intensivos'
      }
    ]

    return lines.map(item => {
      const baseFreightRate = 0.08 * (1 + freightInflation / 100)
      const costoCIF = item.costoFOB * (1 + baseFreightRate + item.arancelTasa)
      const precioEfectivo = item.precioLista * (1 - licitacionDiscount / 100)
      const margenBrutoUnit = precioEfectivo - costoCIF
      const margenPorcentaje = (margenBrutoUnit / precioEfectivo) * 100

      const volumenSimulado = Math.round(item.volumenAnualKits * (1 + projectedAnnualGrowth / 100))
      const ingresosTotales = volumenSimulado * precioEfectivo
      const costoTotalVentas = volumenSimulado * costoCIF
      const utilidadBrutaTotal = ingresosTotales - costoTotalVentas

      return {
        ...item,
        costoCIF: costoCIF.toFixed(2),
        precioEfectivo: precioEfectivo.toFixed(2),
        margenBrutoUnit: margenBrutoUnit.toFixed(2),
        margenPorcentaje: margenPorcentaje.toFixed(1),
        volumenSimulado,
        ingresosTotales,
        costoTotalVentas,
        utilidadBrutaTotal
      }
    })
  }, [licitacionDiscount, freightInflation, projectedAnnualGrowth])

  const rentabilidadSummary = useMemo(() => {
    const ingresosTotales = rentabilidadModels.reduce((acc, i) => acc + i.ingresosTotales, 0)
    const utilidadTotal = rentabilidadModels.reduce((acc, i) => acc + i.utilidadBrutaTotal, 0)
    const margenPromedio = (utilidadTotal / (ingresosTotales || 1)) * 100
    const volumenTotal = rentabilidadModels.reduce((acc, i) => acc + i.volumenSimulado, 0)

    return { ingresosTotales, utilidadTotal, margenPromedio, volumenTotal }
  }, [rentabilidadModels])

  // 6. ROP: Diagnóstico de Estado de Inventario (Donut)
  const pieRopStatus = useMemo(() => {
    return [
      { label: 'Peligro de Quiebre (Urgente)', value: ropSummary.urgentes, color: '#f43f5e', sublabel: 'Bajo Stock Seguridad' },
      { label: 'En Punto de Reorden', value: ropSummary.reorden, color: '#f59e0b', sublabel: 'Generar Orden Compra' },
      { label: 'Stock Óptimo', value: ropSummary.optimos, color: '#10b981', sublabel: 'Cobertura Correcta' },
      { label: 'Sobrestock', value: ropSummary.sobrestock, color: '#8b5cf6', sublabel: 'Exceso de Cobertura' }
    ]
  }, [ropSummary])

  // 7. ROP: Presupuesto CIF Sugerido por Región de Origen (Pie)
  const pieRopRegionInversion = useMemo(() => {
    const regionTotals: Record<string, number> = { Asia: 0, USA: 0, Europa: 0 }
    ropData.forEach(item => {
      const reg = item.region || 'Asia'
      if (regionTotals[reg] !== undefined) {
        regionTotals[reg] += item.investmentNeeded
      }
    })
    return [
      { label: 'Asia (Marítimo)', value: Math.round(regionTotals.Asia || 0), color: '#06b6d4', sublabel: `Lead Time ${ropLeadTimeAsia}d` },
      { label: 'USA (Aéreo / Mar)', value: Math.round(regionTotals.USA || 0), color: '#a855f7', sublabel: `Lead Time ${ropLeadTimeUSA}d` },
      { label: 'Europa (Aéreo)', value: Math.round(regionTotals.Europa || 0), color: '#6366f1', sublabel: `Lead Time ${ropLeadTimeEuropa}d` }
    ]
  }, [ropData, ropLeadTimeAsia, ropLeadTimeUSA, ropLeadTimeEuropa])

  // 8. Rentabilidad: Participación en Utilidad por Línea Diagnóstica (Donut)
  const pieRentabilidadUtilidad = useMemo(() => {
    const colors = ['#10b981', '#06b6d4', '#818cf8', '#c084fc', '#fbbf24', '#f43f5e']
    return rentabilidadModels.map((item, idx) => ({
      label: item.linea.split('(')[0].trim(),
      value: Math.round(item.utilidadBrutaTotal),
      color: colors[idx % colors.length],
      sublabel: `${item.margenPorcentaje}% Margen`
    }))
  }, [rentabilidadModels])

  // 9. Rentabilidad: Estructura de Costos vs Utilidad (Pie)
  const pieEstructuraCostos = useMemo(() => {
    const totalIngresos = rentabilidadSummary.ingresosTotales || 1000000
    const totalUtilidad = rentabilidadSummary.utilidadTotal || 450000
    const totalFOB = totalIngresos * 0.42
    const totalFlete = totalIngresos * (0.08 * (1 + freightInflation / 100))
    const totalAranceles = totalIngresos * 0.03

    return [
      { label: 'Utilidad Bruta Operativa', value: Math.round(totalUtilidad), color: '#10b981', sublabel: 'Margen Labandmed' },
      { label: 'Costo FOB Fabricante', value: Math.round(totalFOB), color: '#64748b', sublabel: 'Precio de Fábrica' },
      { label: 'Fletes y Logística Int.', value: Math.round(totalFlete), color: '#f59e0b', sublabel: 'Flete Marítimo/Aéreo' },
      { label: 'Aranceles e Impuestos', value: Math.round(totalAranceles), color: '#8b5cf6', sublabel: 'Derechos Aduaneros' }
    ]
  }, [rentabilidadSummary, freightInflation])

  // Pedidos & Demanda (Fill-Rate) Analytics
  const pedidosAnalytics = useMemo(() => {
    const raw = consolidatedBI?.pedidosinfo || {
      total_pedidos: 84,
      total_kits_solicitados: 18450,
      total_kits_despachados: 17790,
      fill_rate_global: '96.4',
      backorders_kits: 660,
      estados: {
        'Entregado': 58,
        'En Despacho': 14,
        'Pendiente': 8,
        'Borrador': 4
      },
      clientes_top: {
        'HOSPITAL NACIONAL ROSALES': { pedidos: 24, kits: 6800 },
        'ISSS HOSPITAL GENERAL': { pedidos: 19, kits: 4500 },
        'HOSPITAL BENJAMÍN BLOOM': { pedidos: 15, kits: 3200 },
        'HOSPITAL MILITAR CENTRAL': { pedidos: 12, kits: 2150 },
        'ISBM POLICLÍNICA CENTRAL': { pedidos: 8, kits: 1100 },
        'HOSPITAL REGIONAL SAN MIGUEL': { pedidos: 6, kits: 700 }
      },
      pedidos_recientes: [
        { pedido_id: 'PED-2026-084', cliente: 'HOSPITAL NACIONAL ROSALES', fecha: '08/05/2026', fecha_entrega: '15/05/2026', sku: 'A00009', producto: 'Dengue Duo (IgG/IgM + NS1)', qty_solicitada: 600, qty_despachada: 600, fill_rate_pedido: 100, estado: 'Entregado', total_monto: 39000.00 },
        { pedido_id: 'PED-2026-083', cliente: 'ISSS HOSPITAL GENERAL', fecha: '07/05/2026', fecha_entrega: '14/05/2026', sku: 'A00001', producto: 'HBsAg Hepatitis B 3.0 Test Kit', qty_solicitada: 450, qty_despachada: 450, fill_rate_pedido: 100, estado: 'Entregado', total_monto: 19125.00 },
        { pedido_id: 'PED-2026-082', cliente: 'HOSPITAL BENJAMÍN BLOOM', fecha: '07/05/2026', fecha_entrega: '16/05/2026', sku: 'A00015', producto: 'Influenza A/B/A(H1N1) Combo', qty_solicitada: 300, qty_despachada: 250, fill_rate_pedido: 83, estado: 'En Despacho', total_monto: 16200.00 },
        { pedido_id: 'PED-2026-081', cliente: 'HOSPITAL MILITAR CENTRAL', fecha: '06/05/2026', fecha_entrega: '18/05/2026', sku: 'A00008', producto: 'Urocolor 10 Tiras de Orina', qty_solicitada: 800, qty_despachada: 800, fill_rate_pedido: 100, estado: 'Entregado', total_monto: 11600.00 },
        { pedido_id: 'PED-2026-080', cliente: 'ISSS HOSPITAL GENERAL', fecha: '05/05/2026', fecha_entrega: '20/05/2026', sku: 'A00003', producto: 'HIV - 1/2 3.0 Ultra Rapid Test', qty_solicitada: 500, qty_despachada: 500, fill_rate_pedido: 100, estado: 'Entregado', total_monto: 19000.00 },
        { pedido_id: 'PED-2026-079', cliente: 'ISBM SANTA ANA', fecha: '05/05/2026', fecha_entrega: '22/05/2026', sku: 'A00006', producto: 'H. Pylori IgG/IgM Sangre', qty_solicitada: 200, qty_despachada: 150, fill_rate_pedido: 75, estado: 'En Despacho', total_monto: 5800.00 },
        { pedido_id: 'PED-2026-078', cliente: 'HOSPITAL REGIONAL SAN MIGUEL', fecha: '04/05/2026', fecha_entrega: '25/05/2026', sku: 'A00004', producto: 'SYPHILIS 3.0 Ultra Kit', qty_solicitada: 350, qty_despachada: 0, fill_rate_pedido: 0, estado: 'Pendiente', total_monto: 9975.00 },
        { pedido_id: 'PED-2026-077', cliente: 'HOSPITAL NACIONAL ZACAMIL', fecha: '03/05/2026', fecha_entrega: '26/05/2026', sku: 'A00160', producto: 'OptiMedical B-Gas Cartridge', qty_solicitada: 40, qty_despachada: 40, fill_rate_pedido: 100, estado: 'Entregado', total_monto: 9600.00 }
      ]
    }

    const filtered = (raw.pedidos_recientes || []).filter((p: any) => {
      if (pedidoStatusFilter !== 'todos' && p.estado !== pedidoStatusFilter) return false
      if (pedidoSearchText) {
        const q = pedidoSearchText.toLowerCase()
        const idMatch = (p.pedido_id || '').toLowerCase().includes(q)
        const clienteMatch = (p.cliente || '').toLowerCase().includes(q)
        const prodMatch = (p.producto || '').toLowerCase().includes(q)
        const skuMatch = (p.sku || '').toLowerCase().includes(q)
        if (!idMatch && !clienteMatch && !prodMatch && !skuMatch) return false
      }
      return true
    })

    return { ...raw, pedidos_filtrados: filtered }
  }, [consolidatedBI, pedidoStatusFilter, pedidoSearchText])

  // Proveedores filtrados
  const proveedoresList = useMemo(() => {
    const raw = consolidatedBI?.proveedores || [
      { id: 'P000001', nombre: 'SD BIOSENSOR', pais: 'KOREA', telefono: '+82-31-300-0400', email: 'sales@sdbiosensor.com' },
      { id: 'P000002', nombre: 'ABBOTT DIAGNOSTICS', pais: 'ITALIA / USA', telefono: '+1-800-222-6883', email: 'orders@abbott.com' },
      { id: 'P000003', nombre: 'BERIGHT / ALLTEST', pais: 'UNITED STATES / CHINA', telefono: '+1-619-338-0809', email: 'info@alltests.com.cn' },
      { id: 'P000004', nombre: 'DIESSE DIAGNOSTICA', pais: 'ITALIA', telefono: '+39-0577-587111', email: 'customercare@diesse.it' },
      { id: 'P000005', nombre: 'MONOBIND INC.', pais: 'UNITED STATES', telefono: '+1-949-951-2665', email: 'info@monobind.com' },
      { id: 'P000006', nombre: 'HEMOCUE AB', pais: 'SUECIA', telefono: '+46-431-45-82-00', email: 'info@hemocue.se' },
      { id: 'P000007', nombre: 'OPTIMEDICAL', pais: 'UNITED STATES', telefono: '+1-770-510-4444', email: 'support@optimedical.com' },
      { id: 'P000008', nombre: 'VEDALAB', pais: 'FRANCIA', telefono: '+33-2-43-08-59-97', email: 'contact@vedalab.com' }
    ]

    if (!searchProveedor) return raw
    const q = searchProveedor.toLowerCase()
    return raw.filter((p: any) =>
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.pais || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    )
  }, [consolidatedBI, searchProveedor])

  // Facturas DTE
  const facturacionData = useMemo(() => {
    return consolidatedBI?.facturacion || {
      total_facturas: 128,
      distribucion_zonas: {
        'SAN SALVADOR': 48,
        'LA LIBERTAD': 26,
        'SANTA ANA': 18,
        'SAN MIGUEL': 14,
        'SONSONATE': 11,
        'CHALATENANGO': 6,
        'USULUTAN': 5
      },
      ultimas_facturas: [
        { factura_id: '4e824d54', numero: 'DTE-0953', zona: 'SAN SALVADOR', fecha: '05/05/2026', archivo_pdf: 'DTE-0953.pdf' },
        { factura_id: '1bc5202e', numero: 'DTE-0959', zona: 'CHALATENANGO', fecha: '06/05/2026', archivo_pdf: 'DTE-0959.pdf' },
        { factura_id: '5446d9a8', numero: 'DTE-0964', zona: 'USULUTAN', fecha: '07/05/2026', archivo_pdf: 'DTE-0964.pdf' },
        { factura_id: '89ac34f1', numero: 'DTE-0972', zona: 'SANTA ANA', fecha: '08/05/2026', archivo_pdf: 'DTE-0972.pdf' },
        { factura_id: 'b1209e76', numero: 'DTE-0985', zona: 'SAN SALVADOR', fecha: '09/05/2026', archivo_pdf: 'DTE-0985.pdf' }
      ]
    }
  }, [consolidatedBI])

  // 10. Pedidos: Estado de Cumplimiento de Órdenes (Donut)
  const piePedidosEstados = useMemo(() => {
    const estados = pedidosAnalytics.estados || { 'Entregado': 58, 'En Despacho': 14, 'Pendiente': 8, 'Borrador': 4 }
    return [
      { label: 'Entregados (OTD)', value: estados['Entregado'] || 58, color: '#10b981', sublabel: 'Cumplimiento 100%' },
      { label: 'En Despacho Activo', value: estados['En Despacho'] || 14, color: '#f59e0b', sublabel: 'Ruta Hospitalaria' },
      { label: 'Pendientes Backorder', value: estados['Pendiente'] || 8, color: '#6366f1', sublabel: 'En Preparación' },
      { label: 'Borrador / Pre-orden', value: estados['Borrador'] || 4, color: '#64748b', sublabel: 'Validación' }
    ]
  }, [pedidosAnalytics])

  // 11. Pedidos: Concentración de Demanda por Red Hospitalaria (Donut)
  const piePedidosClientes = useMemo(() => {
    const top = pedidosAnalytics.clientes_top || {}
    const colors = ['#06b6d4', '#6366f1', '#a855f7', '#10b981', '#fbbf24', '#f43f5e']
    return Object.entries(top).map(([cliente, stats]: any, idx) => ({
      label: cliente.replace('HOSPITAL ', 'HOSP. '),
      value: stats.kits,
      color: colors[idx % colors.length],
      sublabel: `${stats.pedidos} pedidos`
    }))
  }, [pedidosAnalytics])

  // 12. Facturación: Distribución Regional DTE por Zonas de El Salvador (Donut)
  const pieFacturacionZonas = useMemo(() => {
    const zonas = facturacionData.distribucion_zonas || {}
    const colors = ['#a855f7', '#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8']
    return Object.entries(zonas).map(([zona, count]: any, idx) => ({
      label: zona,
      value: count,
      color: colors[idx % colors.length],
      sublabel: `${count} DTEs emitidos`
    }))
  }, [facturacionData])

  // Export to CSV
  const handleExportCSV = () => {
    if (sortedProductos.length === 0) return
    const headers = ['SKU', 'Nombre_Producto', 'Marca', 'Tipo', 'Unidad_Medida', 'Estado', 'Descripcion']
    const rows = sortedProductos.map(p => [
      `"${p.codigo_sku || ''}"`,
      `"${(p.nombre_producto_equipo || '').replace(/"/g, '""')}"`,
      `"${(p.marca?.nombre_marca || '').replace(/"/g, '""')}"`,
      `"${p.es_equipo ? 'EQUIPO' : 'REACTIVO'}"`,
      `"${p.unidad_medida || 'Kit'}"`,
      `"${p.activo !== false ? 'Activo' : 'Inactivo'}"`,
      `"${(p.descripcion || '').replace(/"/g, '""')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `catalogo_maestro_bi_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Create & Edit Handlers
  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({
      codigo_sku: '',
      nombre_producto_equipo: '',
      marca_id: marcas[0]?.marca_id ? String(marcas[0].marca_id) : '',
      es_equipo: false,
      unidad_medida: 'Kit',
      descripcion: '',
      activo: true
    })
    setShowModal(true)
  }

  const handleOpenEdit = (p: any) => {
    setEditingId(p.producto_equipo_id)
    setFormData({
      codigo_sku: p.codigo_sku || '',
      nombre_producto_equipo: p.nombre_producto_equipo || '',
      marca_id: p.marca_id ? String(p.marca_id) : '',
      es_equipo: Boolean(p.es_equipo),
      unidad_medida: p.unidad_medida || 'Kit',
      descripcion: p.descripcion || '',
      activo: p.activo !== false
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        codigo_sku: formData.codigo_sku,
        nombre_producto_equipo: formData.nombre_producto_equipo,
        marca_id: formData.marca_id ? Number(formData.marca_id) : null,
        es_equipo: Boolean(formData.es_equipo),
        unidad_medida: formData.unidad_medida || null,
        descripcion: formData.descripcion || null,
        activo: Boolean(formData.activo)
      }

      if (editingId) {
        await dbUpdate('productos_equipo', editingId, 'producto_equipo_id', payload)
        setNotification({ type: 'success', message: 'Producto actualizado exitosamente en el catálogo.' })
      } else {
        await dbInsert('productos_equipo', payload)
        setNotification({ type: 'success', message: 'Nuevo producto registrado en el catálogo.' })
      }

      setShowModal(false)
      loadData()
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Error al guardar: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este producto del catálogo?')) return
    setLoading(true)
    try {
      await dbDelete('productos_equipo', id, 'producto_equipo_id')
      setNotification({ type: 'success', message: 'Producto eliminado del catálogo.' })
      loadData()
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Error al eliminar: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const availableUnidades = useMemo(() => {
    const set = new Set(productos.map(p => p.unidad_medida).filter(Boolean))
    return Array.from(set)
  }, [productos])

  return (
    <div className="relative min-h-screen text-slate-100 p-4 md:p-6 max-w-[1750px] mx-auto space-y-6 font-sans">
      {/* Dynamic Ambient Mesh Glow Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Main Glassmorphic Container */}
      <div className="relative z-10 space-y-6">
        {/* Futuristic Hero Header (Neo-Glassmorphism Pro Max) */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950/90 border border-white/[0.08] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-2xl">
          {/* Subtle Accent Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent" />

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-semibold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 -ml-3" />
                <span>LAB & MED CONTROL PLANNER PRO • INTELLIGENCE SUITE</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">ONLINE LIVE</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex flex-wrap items-center gap-3">
                Gestión Inteligente de Inventario & ROP
                <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-950/80 text-cyan-300 border border-cyan-500/30 font-bold shadow-inner">
                  {productos.length} SKUs Catalogados
                </span>
              </h1>

              <p className="text-xs md:text-sm text-slate-400 max-w-3xl leading-relaxed">
                Plataforma analítica con algoritmos predictivos de Punto de Reorden (ROP), simulación de sensibilidad financiera para licitaciones y monitoreo de inventario hospitalario.
              </p>
            </div>

            {/* Action Buttons Hub */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSyncData}
                disabled={syncing}
                className={`relative group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition duration-300 shadow-xl overflow-hidden ${
                  syncing
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 cursor-wait'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-white/[0.08] hover:border-cyan-500/50 hover:shadow-cyan-500/10'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-amber-400' : 'text-cyan-400 group-hover:rotate-180 transition duration-500'}`} />
                <span>{syncing ? 'Sincronizando Base...' : 'Actualizar Catálogo Maestro'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/[0.08] hover:border-purple-500/50 text-xs font-bold transition shadow-xl hover:shadow-purple-500/10"
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Futuristic Floating Segmented Dock (Modules) */}
        <div className="relative p-1.5 rounded-2xl bg-slate-950/80 border border-white/[0.08] backdrop-blur-2xl shadow-2xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'catalogo', label: 'Catálogo & Slicers BI', icon: Boxes, badge: `${productos.length}`, isLocked: false },
              { id: 'inventario', label: 'Inventario & Lotes', icon: TrendingUp, badge: '40.9K Kits', isLocked: false },
              { id: 'envios_mensajeria', label: 'Envíos & Mensajería BI', icon: Truck, badge: `${logisticsData.kpis.total_pedidos} Envíos`, isLocked: false },
              { id: 'rop', label: 'Simulador ROP & Compras', icon: ShoppingCart, badge: 'Smart AI', isLocked: true, versionTag: 'v2.0' },
              { id: 'rentabilidad', label: 'Rentabilidad & Márgenes', icon: Calculator, badge: 'Sensibilidad', isLocked: true, versionTag: 'v2.0' },
              { id: 'proveedores', label: 'Directorio Proveedores', icon: Building2, badge: `${proveedoresList.length}`, isLocked: true, versionTag: 'v2.0' },
              { id: 'facturacion', label: 'Facturación DTE', icon: FileCheck2, badge: 'DTE Live', isLocked: true, versionTag: 'v2.0' }
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isLocked = tab.isLocked

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (isLocked) {
                      setNotification({
                        type: 'info',
                        message: `🔒 Módulo "${tab.label}" bloqueado para el lanzamiento de futuras versiones (${tab.versionTag}). Actualmente disponibles: Catálogo & Slicers BI, Inventario & Lotes y Envíos & Mensajería BI.`
                      })
                      return
                    }
                    setActiveTab(tab.id as any)
                  }}
                  title={isLocked ? `🔒 Módulo bloqueado para lanzamiento en versión ${tab.versionTag}` : `Abrir ${tab.label}`}
                  className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 group ${
                    isLocked
                      ? 'bg-slate-900/30 text-slate-500 border border-white/[0.04] hover:border-amber-500/40 hover:bg-amber-500/[0.04] cursor-not-allowed opacity-75 hover:opacity-100'
                      : isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/30 cursor-pointer'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent cursor-pointer'
                  }`}
                >
                  {isLocked ? (
                    <div className="relative flex items-center">
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                      <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
                    </div>
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-indigo-400'}`} />
                  )}

                  <span className={isLocked ? 'text-slate-400 group-hover:text-slate-300' : ''}>{tab.label}</span>

                  {isLocked ? (
                    <span className="flex items-center gap-1 text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:border-amber-500/40 transition">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{tab.versionTag}</span>
                    </span>
                  ) : (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-black/30 text-cyan-200' : 'bg-slate-900 text-slate-400 border border-white/[0.06]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {activeTab === 'catalogo' && (
            <div className="flex items-center bg-slate-900/90 border border-white/[0.08] rounded-xl p-1 ml-auto">
              <button
                onClick={() => setCatalogViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  catalogViewMode === 'table' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Matriz</span>
              </button>
              <button
                onClick={() => setCatalogViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  catalogViewMode === 'cards' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold border backdrop-blur-xl animate-fade-in shadow-2xl ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-emerald-500/5'
              : notification.type === 'error'
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-rose-500/5'
              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-indigo-500/5'
          }`}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {notification.type === 'info' && <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: CATÁLOGO & SLICERS BI */}
        {/* ========================================================================= */}
        {activeTab === 'catalogo' && (
          <div className="space-y-6">
            {/* Bento Grid Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl backdrop-blur-xl group hover:border-cyan-500/40 transition duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 transition" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catálogo Total</span>
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"><Boxes className="w-4 h-4" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-white font-mono">{kpis.total.toLocaleString()}</div>
                  <div className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {kpis.activos} activos en operación
                  </div>
                  <div className="text-[9.5px] font-mono text-cyan-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Origen:</span> COUNT(productos_equipo) en BD Normalizada (3FN)
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl backdrop-blur-xl group hover:border-purple-500/40 transition duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 group-hover:opacity-100 transition" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Equipos Biomédicos</span>
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400"><Cpu className="w-4 h-4" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-purple-300 font-mono">{kpis.equipos.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Analizadores de Laboratorio</div>
                  <div className="text-[9.5px] font-mono text-purple-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Fórmula:</span> COUNT(*) WHERE es_equipo = TRUE
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl backdrop-blur-xl group hover:border-indigo-500/40 transition duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 group-hover:opacity-100 transition" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reactivos & Insumos</span>
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"><Tag className="w-4 h-4" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-indigo-300 font-mono">{kpis.reactivos.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Pruebas Diagnósticas IVD</div>
                  <div className="text-[9.5px] font-mono text-indigo-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Fórmula:</span> COUNT(*) WHERE es_equipo = FALSE
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl backdrop-blur-xl group hover:border-emerald-500/40 transition duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 group-hover:opacity-100 transition" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marcas Oficiales</span>
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><Globe className="w-4 h-4" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-emerald-300 font-mono">{marcas.length}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Fabricantes Autorizados</div>
                  <div className="text-[9.5px] font-mono text-emerald-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Origen:</span> COUNT(DISTINCT marca_id) en tabla marcas
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Analytics Hub: Hybrid Bar & Pie/Donut Suite */}
            <div className="space-y-4">
              {/* Chart Mode Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/[0.06] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Analítica Visual del Catálogo
                    </h3>
                    <p className="text-[11px] text-slate-400">Distribución de marcas, tipología y estados</p>
                  </div>
                </div>

                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/[0.06] text-xs font-bold">
                  <button
                    onClick={() => setChartModeCatalogo('hybrid')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      chartModeCatalogo === 'hybrid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers3 className="w-3.5 h-3.5" />
                    <span>Vista Híbrida</span>
                  </button>
                  <button
                    onClick={() => setChartModeCatalogo('bars')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      chartModeCatalogo === 'bars' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Barras</span>
                  </button>
                  <button
                    onClick={() => setChartModeCatalogo('pie')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      chartModeCatalogo === 'pie' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PieChartIcon className="w-3.5 h-3.5" />
                    <span>Pastel & Donut</span>
                  </button>
                </div>
              </div>

              {/* Gráficos de Barras (cuando mode es 'hybrid' o 'bars') */}
              {(chartModeCatalogo === 'hybrid' || chartModeCatalogo === 'bars') && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                          Gráfico de Barras: Top Fabricantes por Cantidad de SKUs
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Total: {productos.length} SKUs</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {topMarcasPorSKU.map((item, idx) => {
                        const totalCatalog = productos.length || 1
                        const rawPercent = (item.count / totalCatalog) * 100
                        const percent = Math.round(rawPercent)
                        const barWidth = Math.max(parseFloat(rawPercent.toFixed(1)), 2)
                        const colors = [
                          'from-cyan-500 to-blue-600',
                          'from-indigo-500 to-violet-600',
                          'from-purple-500 to-pink-600',
                          'from-emerald-500 to-teal-600',
                          'from-amber-500 to-orange-600',
                          'from-blue-500 to-cyan-600',
                          'from-rose-500 to-red-600',
                          'from-teal-500 to-emerald-600'
                        ]
                        const barColor = colors[idx % colors.length]

                        return (
                          <div key={item.marca} className="space-y-1 group">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 truncate max-w-[280px]">
                                <span className="w-4 text-[10px] font-mono text-slate-500 font-bold">#{idx + 1}</span>
                                <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition truncate">{item.marca}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-slate-400">({percent}%)</span>
                                <span className="font-mono font-bold text-white px-2 py-0.5 rounded-md bg-slate-950 border border-white/[0.06] text-xs">
                                  {item.count} SKUs
                                </span>
                              </div>
                            </div>

                            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/[0.06] flex">
                              <div
                                className={`bg-gradient-to-r ${barColor} h-full rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all duration-500 group-hover:brightness-125`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Gráfico de Barras: Comparativa de Tipo & Estado */}
                  <div className="lg:col-span-4 rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-4">
                    <div className="border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                          Mix de Catálogo
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Distribución porcentual</p>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-indigo-400" /> Reactivos IVD
                          </span>
                          <span className="font-mono font-bold text-indigo-300">
                            {kpis.reactivos} ({Math.round((kpis.reactivos / (kpis.total || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.06]">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                            style={{ width: `${Math.round((kpis.reactivos / (kpis.total || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-purple-400" /> Equipos Biomédicos
                          </span>
                          <span className="font-mono font-bold text-purple-300">
                            {kpis.equipos} ({Math.round((kpis.equipos / (kpis.total || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.06]">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                            style={{ width: `${Math.max(Math.round((kpis.equipos / (kpis.total || 1)) * 100), 4)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Productos Activos
                          </span>
                          <span className="font-mono font-bold text-emerald-300">
                            {kpis.activos} ({Math.round((kpis.activos / (kpis.total || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.06]">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                            style={{ width: `${Math.round((kpis.activos / (kpis.total || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Cobertura de catálogo:</span>
                      <strong className="text-cyan-400 font-mono font-bold">100% Sincronizado</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Gráficos de Pastel & Donut (cuando mode es 'hybrid' o 'pie') */}
              {(chartModeCatalogo === 'hybrid' || chartModeCatalogo === 'pie') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <NeoChartPieDonut
                    data={pieCatalogoTipo}
                    title="Gráfico Donut: Composición por Tipo"
                    subtitle="Reactivos IVD vs Equipos Biomédicos"
                    type="donut"
                    centerLabel="Catálogo"
                    centerValue={`${kpis.total.toLocaleString()} SKUs`}
                    badge="100% Cobertura"
                    formatValue={v => `${v.toLocaleString()} SKUs`}
                  />

                  <NeoChartPieDonut
                    data={pieTopMarcas}
                    title="Gráfico Pastel: Concentración de Marcas"
                    subtitle="Top 5 Fabricantes vs Resto del Catálogo"
                    type="donut"
                    centerLabel="Fabricantes"
                    centerValue={`${marcas.length} Marcas`}
                    badge="Top 5 Focus"
                    formatValue={v => `${v.toLocaleString()} SKUs`}
                  />

                  <NeoChartPieDonut
                    data={pieCatalogoEstado}
                    title="Gráfico Donut: Estado Operativo"
                    subtitle="Disponibilidad comercial de productos"
                    type="donut"
                    centerLabel="Estado"
                    centerValue={`${Math.round((kpis.activos / (kpis.total || 1)) * 100)}% Activo`}
                    badge="Vigencia"
                    formatValue={v => `${v.toLocaleString()} SKUs`}
                  />
                </div>
              )}
            </div>

            {/* Slicers + Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Slicers Sidebar */}
              <div className="lg:col-span-3 space-y-4">
                <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-2xl backdrop-blur-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                      <Filter className="w-4 h-4 text-cyan-400" />
                      <span>Slicers de Filtrado</span>
                    </div>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={handleResetFilters}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-bold transition flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Limpiar ({activeFiltersCount})
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Búsqueda Rápida</label>
                      <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">Filtro LIKE</span>
                    </div>
                    <p className="text-[9.5px] font-mono text-slate-400 mb-1.5">Búsqueda en SKU, Nombre, Fabricante y Descripción</p>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="SKU, nombre, fabricante..."
                        className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                      />
                      {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">✕</button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Tipo de Producto</label>
                      <span className="text-[9px] font-mono text-purple-400/80 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/20">es_equipo (BOOL)</span>
                    </div>
                    <p className="text-[9.5px] font-mono text-slate-400 mb-2">Reactivos (FALSE) vs Equipos / Analizadores (TRUE)</p>
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-white/[0.06]">
                      <button
                        onClick={() => { setSelectedTipo('todos'); setCurrentPage(1); }}
                        className={`py-1.5 rounded-xl text-xs font-bold transition text-center ${
                          selectedTipo === 'todos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => { setSelectedTipo('reactivos'); setCurrentPage(1); }}
                        className={`py-1.5 rounded-xl text-xs font-bold transition text-center ${
                          selectedTipo === 'reactivos' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Reactivos
                      </button>
                      <button
                        onClick={() => { setSelectedTipo('equipos'); setCurrentPage(1); }}
                        className={`py-1.5 rounded-xl text-xs font-bold transition text-center ${
                          selectedTipo === 'equipos' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Equipos
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Estado Operativo</label>
                      <span className="text-[9px] font-mono text-emerald-400/80 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">activo (1 / 0)</span>
                    </div>
                    <p className="text-[9.5px] font-mono text-slate-400 mb-2">Vigentes en catálogo vs Descontinuados / Inactivos</p>
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-white/[0.06]">
                      <button
                        onClick={() => { setSelectedEstado('todos'); setCurrentPage(1); }}
                        className={`py-1.5 rounded-xl text-xs font-bold transition text-center ${
                          selectedEstado === 'todos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => { setSelectedEstado('activos'); setCurrentPage(1); }}
                        className={`py-1.5 rounded-xl text-xs font-bold transition text-center ${
                          selectedEstado === 'activos' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Activos
                      </button>
                      <button
                        onClick={() => { setSelectedEstado('inactivos'); setCurrentPage(1); }}
                        className={`py-1.5 rounded-xl text-xs font-bold transition text-center ${
                          selectedEstado === 'inactivos' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Inactivos
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Marcas Oficiales</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">marcas.marca_id</span>
                        {selectedMarcas.length > 0 && (
                          <span className="text-[10px] font-bold text-cyan-400">({selectedMarcas.length})</span>
                        )}
                      </div>
                    </div>
                    <p className="text-[9.5px] font-mono text-slate-400 mb-2">Filtro relacional 3FN por fabricante autorizado</p>

                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {marcas.map(m => {
                        const mIdStr = String(m.marca_id)
                        const isSelected = selectedMarcas.includes(mIdStr)
                        const prodCount = productos.filter(p => String(p.marca_id) === mIdStr).length

                        return (
                          <button
                            key={m.marca_id}
                            onClick={() => handleToggleMarca(mIdStr)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition text-left ${
                              isSelected
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                                : 'bg-slate-950/60 hover:bg-slate-800/60 text-slate-300 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border text-[10px] ${
                                isSelected ? 'bg-cyan-500 border-cyan-400 text-black' : 'border-slate-700 bg-slate-900'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{m.nombre_marca}</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/[0.04]">
                              {prodCount}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Table or Cards Display */}
              <div className="lg:col-span-9 space-y-4">
                {activeFiltersCount > 0 && (
                  <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-3 flex flex-wrap items-center gap-2 text-xs backdrop-blur-xl">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Filtros Activos:
                    </span>

                    {search && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono">
                        Búsqueda: &quot;{search}&quot;
                        <button onClick={() => setSearch('')} className="hover:text-white">✕</button>
                      </span>
                    )}

                    {selectedTipo !== 'todos' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono">
                        Tipo: {selectedTipo.toUpperCase()}
                        <button onClick={() => setSelectedTipo('todos')} className="hover:text-white">✕</button>
                      </span>
                    )}

                    {selectedMarcas.map(mId => {
                      const mObj = marcas.find(m => String(m.marca_id) === mId)
                      return (
                        <span key={mId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono">
                          Marca: {mObj?.nombre_marca || mId}
                          <button onClick={() => handleToggleMarca(mId)} className="hover:text-white">✕</button>
                        </span>
                      )
                    })}

                    <button
                      onClick={handleResetFilters}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold ml-auto"
                    >
                      Restablecer Todo
                    </button>
                  </div>
                )}

                {catalogViewMode === 'table' ? (
                  <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px] border-b border-white/[0.06] sticky top-0 z-10 backdrop-blur-md">
                          <tr>
                            <th onClick={() => handleSort('codigo_sku')} className="px-4 py-3.5 cursor-pointer hover:text-white transition select-none">
                              <div className="flex items-center gap-1.5">
                                <span>Código SKU</span>
                                {sortField === 'codigo_sku' ? (sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />) : <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />}
                              </div>
                            </th>

                            <th onClick={() => handleSort('nombre_producto_equipo')} className="px-4 py-3.5 cursor-pointer hover:text-white transition select-none">
                              <div className="flex items-center gap-1.5">
                                <span>Nombre del Producto / Reactivo</span>
                                {sortField === 'nombre_producto_equipo' ? (sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />) : <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />}
                              </div>
                            </th>

                            <th onClick={() => handleSort('marca')} className="px-4 py-3.5 cursor-pointer hover:text-white transition select-none">
                              <div className="flex items-center gap-1.5">
                                <span>Marca Oficial</span>
                                {sortField === 'marca' ? (sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />) : <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />}
                              </div>
                            </th>

                            <th onClick={() => handleSort('es_equipo')} className="px-4 py-3.5 cursor-pointer hover:text-white transition select-none text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span>Tipo</span>
                                {sortField === 'es_equipo' ? (sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> : <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />) : <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />}
                              </div>
                            </th>

                            <th className="px-4 py-3.5">Presentación</th>
                            <th className="px-4 py-3.5 text-center">Estado</th>
                            <th className="px-4 py-3.5 text-right">Acciones</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/[0.04] font-medium">
                          {loading ? (
                            <tr>
                              <td colSpan={7} className="p-16 text-center text-slate-500">
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-400" />
                                Cargando catálogo en tiempo real...
                              </td>
                            </tr>
                          ) : paginatedProductos.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-16 text-center text-slate-500">
                                <p className="font-bold text-slate-300">No hay productos que coincidan con los filtros seleccionados.</p>
                                <button onClick={handleResetFilters} className="text-xs text-cyan-400 hover:underline mt-2">
                                  Restablecer todos los filtros
                                </button>
                              </td>
                            </tr>
                          ) : (
                            paginatedProductos.map((p, idx) => (
                              <tr key={p.producto_equipo_id} className="hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200">
                                <td className="px-4 py-3.5">
                                  <span className="font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 text-xs">
                                    {p.codigo_sku}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="font-bold text-white text-xs leading-snug">{p.nombre_producto_equipo}</div>
                                  {p.descripcion && <div className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">{p.descripcion}</div>}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-white/[0.06] text-xs font-semibold">
                                    {p.marca?.nombre_marca || 'Genérica'}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono border ${
                                    p.es_equipo ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                  }`}>
                                    {p.es_equipo ? 'EQUIPO' : 'REACTIVO'}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 font-mono text-slate-300 text-xs">{p.unidad_medida || 'Kit'}</td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${p.activo !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${p.activo !== false ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                                    {p.activo !== false ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button onClick={() => handleOpenEdit(p)} className="p-1.5 rounded-xl bg-slate-950 hover:bg-cyan-600 hover:text-white text-slate-300 transition border border-white/[0.06]">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(p.producto_equipo_id)} className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-900/50 hover:text-rose-300 text-slate-300 transition border border-white/[0.06]">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 border-t border-white/[0.06] bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                      <div className="text-slate-400 flex items-center gap-2">
                        <span>Mostrando {paginatedProductos.length} de {sortedProductos.length} resultados filtrados</span>
                        <span>•</span>
                        <select
                          value={pageSize}
                          onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                          className="px-2.5 py-1 bg-slate-900 border border-white/[0.08] rounded-xl text-xs text-white"
                        >
                          <option value={25}>25 por pág.</option>
                          <option value={50}>50 por pág.</option>
                          <option value={100}>100 por pág.</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-white/[0.06]"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-mono text-slate-300 px-3 font-bold">
                          Página {currentPage} de {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-white/[0.06]"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedProductos.map(p => (
                      <div key={p.producto_equipo_id} className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 backdrop-blur-xl group">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                              {p.codigo_sku}
                            </span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono border ${
                              p.es_equipo ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                            }`}>
                              {p.es_equipo ? 'EQUIPO' : 'REACTIVO'}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white leading-snug group-hover:text-cyan-300 transition duration-300">{p.nombre_producto_equipo}</h3>

                          <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                            <p className="flex items-center gap-1.5">
                              <span className="text-slate-500">Marca:</span>
                              <strong className="text-slate-200">{p.marca?.nombre_marca || 'Genérica'}</strong>
                            </p>
                            <p className="flex items-center gap-1.5 font-mono text-xs">
                              <span className="text-slate-500">Presentación:</span>
                              <span className="text-slate-300">{p.unidad_medida || 'Kit'}</span>
                            </p>
                            {p.descripcion && <p className="text-slate-500 text-xs line-clamp-2 pt-1 border-t border-white/[0.04]">{p.descripcion}</p>}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                          <span className={`font-bold text-xs flex items-center gap-1.5 ${p.activo !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.activo !== false ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                            {p.activo !== false ? 'Activo' : 'Inactivo'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleOpenEdit(p)} className="p-1.5 rounded-xl bg-slate-950 hover:bg-cyan-600 hover:text-white text-slate-300 transition border border-white/[0.06]">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(p.producto_equipo_id)} className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 transition border border-white/[0.06]">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INVENTARIO & LOTES */}
        {/* ========================================================================= */}
        {activeTab === 'inventario' && (
          <div className="space-y-6">
            {/* Visual Mode Selector for Inventario */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/[0.06] backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Analítica Visual de Inventario Físico & Caducidades
                  </h3>
                  <p className="text-[11px] text-slate-400">Control de volumen físico, semáforos FEFO y marcas</p>
                </div>
              </div>

              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/[0.06] text-xs font-bold">
                <button
                  onClick={() => setChartModeInventario('hybrid')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    chartModeInventario === 'hybrid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers3 className="w-3.5 h-3.5" />
                  <span>Vista Híbrida</span>
                </button>
                <button
                  onClick={() => setChartModeInventario('bars')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    chartModeInventario === 'bars' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Barras</span>
                </button>
                <button
                  onClick={() => setChartModeInventario('pie')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    chartModeInventario === 'pie' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PieChartIcon className="w-3.5 h-3.5" />
                  <span>Pastel & Donut</span>
                </button>
              </div>
            </div>

            {/* Gráficos de Barras y Semáforos (cuando mode es 'hybrid' o 'bars') */}
            {(chartModeInventario === 'hybrid' || chartModeInventario === 'bars') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl space-y-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-400" />
                        Volumen de Kits Disponibles por Fabricante
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Consolidado en tiempo real de inventario físico</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      40,950+ Kits Totales
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { marca: 'STANDARD DIAGNOSTICS (SD)', kits: 19991, percent: 49, color: 'from-amber-500 to-amber-300' },
                      { marca: 'SD BIOSENSOR', kits: 13428, percent: 33, color: 'from-cyan-500 to-cyan-300' },
                      { marca: 'ALLTEST DIAGNOSTICS', kits: 6116, percent: 15, color: 'from-purple-500 to-purple-300' },
                      { marca: 'DIESSE DIAGNOSTICA', kits: 850, percent: 2, color: 'from-emerald-500 to-emerald-300' },
                      { marca: 'MONOBIND INC.', kits: 222, percent: 1, color: 'from-indigo-500 to-indigo-300' },
                      { marca: 'VEDALAB FRANCE', kits: 133, percent: 0.5, color: 'from-pink-500 to-pink-300' },
                      { marca: 'OPTIMEDICAL', kits: 93, percent: 0.3, color: 'from-teal-500 to-teal-300' },
                      { marca: 'HEMOCUE SWEDEN', kits: 58, percent: 0.2, color: 'from-rose-500 to-rose-300' }
                    ].map(item => (
                      <div key={item.marca} className="space-y-1.5 p-2.5 rounded-2xl bg-slate-950/60 border border-white/[0.04]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{item.marca}</span>
                          <span className="font-mono text-slate-300 font-bold">{item.kits.toLocaleString()} kits ({item.percent}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.06] flex">
                          <div className={`bg-gradient-to-r ${item.color} h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: `${Math.max(item.percent, 3)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl space-y-5 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Clock className="w-5 h-5 text-rose-400" />
                          Semáforo de Caducidad de Lotes (Kardex)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Control preventivo FEFO (First Expired, First Out)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3.5 mt-5">
                      <button
                        onClick={() => setSelectedLotStatusFilter('vencidos')}
                        className={`p-4 rounded-2xl border text-center transition-all duration-300 relative group cursor-pointer ${
                          selectedLotStatusFilter === 'vencidos'
                            ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] scale-[1.02]'
                            : 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/15'
                        }`}
                      >
                        <div className="text-3xl font-black text-rose-400 font-mono">333</div>
                        <div className="text-xs font-bold text-rose-300 mt-1">Lotes Vencidos</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Baja contable</div>
                        <div className="text-[9px] font-mono text-rose-300/80 bg-rose-950/60 px-1.5 py-0.5 rounded mt-2 border border-rose-500/20">
                          (Vence - Hoy) &lt; 0d
                        </div>
                        <div className="mt-1 text-[10px] font-bold text-rose-300 underline opacity-0 group-hover:opacity-100 transition">Ver desglose →</div>
                      </button>

                      <button
                        onClick={() => setSelectedLotStatusFilter('menos30')}
                        className={`p-4 rounded-2xl border text-center transition-all duration-300 relative group cursor-pointer ${
                          selectedLotStatusFilter === 'menos30'
                            ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02]'
                            : 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15'
                        }`}
                      >
                        <div className="text-3xl font-black text-amber-400 font-mono">5</div>
                        <div className="text-xs font-bold text-amber-300 mt-1">Vence &lt; 30 Días</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Despacho urgente</div>
                        <div className="text-[9px] font-mono text-amber-300/80 bg-amber-950/60 px-1.5 py-0.5 rounded mt-2 border border-amber-500/20">
                          0d ≤ (Vence - Hoy) ≤ 30d
                        </div>
                        <div className="mt-1 text-[10px] font-bold text-amber-300 underline opacity-0 group-hover:opacity-100 transition">Ver desglose →</div>
                      </button>

                      <button
                        onClick={() => setSelectedLotStatusFilter('menos90')}
                        className={`p-4 rounded-2xl border text-center transition-all duration-300 relative group cursor-pointer ${
                          selectedLotStatusFilter === 'menos90'
                            ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[1.02]'
                            : 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/15'
                        }`}
                      >
                        <div className="text-3xl font-black text-indigo-400 font-mono">34</div>
                        <div className="text-xs font-bold text-indigo-300 mt-1">Vence &lt; 90 Días</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Prioridad FEFO</div>
                        <div className="text-[9px] font-mono text-indigo-300/80 bg-indigo-950/60 px-1.5 py-0.5 rounded mt-2 border border-indigo-500/20">
                          31d ≤ (Vence - Hoy) ≤ 90d
                        </div>
                        <div className="mt-1 text-[10px] font-bold text-indigo-300 underline opacity-0 group-hover:opacity-100 transition">Ver desglose →</div>
                      </button>
                    </div>

                    <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-white/[0.06] space-y-2">
                      <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Total Transacciones Registradas:</span>
                        <span className="font-mono text-cyan-400 font-bold">1,384 movimientos</span>
                      </div>
                      <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Productos Únicos en Kardex:</span>
                        <span className="font-mono text-purple-400 font-bold">236 productos</span>
                      </div>
                      <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Marcas con Stock Activo:</span>
                        <span className="font-mono text-emerald-400 font-bold">17 marcas</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                    <span>Estado de inventario: <strong className="text-emerald-400 font-bold">● Actualizado en Tiempo Real</strong></span>
                    <button onClick={handleSyncData} className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" /> Re-sincronizar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Gráficos de Pastel & Donut para Inventario (cuando mode es 'hybrid' o 'pie') */}
            {(chartModeInventario === 'hybrid' || chartModeInventario === 'pie') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NeoChartPieDonut
                  data={pieLotesFEFO}
                  title="Gráfico Donut: Semáforo FEFO de Caducidad de Lotes"
                  subtitle="Distribución crítica de lotes según tiempo de vida remanente"
                  type="donut"
                  centerLabel="Lotes Auditados"
                  centerValue="552 Lotes"
                  badge="Protocolo FEFO"
                  formatValue={v => `${v} Lotes`}
                />

                <NeoChartPieDonut
                  data={pieInventarioMarcas}
                  title="Gráfico Pastel: Participación en Volumen Físico de Kits"
                  subtitle="Concentración del stock total (40,950+ kits) por fabricante"
                  type="donut"
                  centerLabel="Inventario"
                  centerValue="40.9K Kits"
                  badge="Kardex Live"
                  formatValue={v => `${v.toLocaleString()} kits`}
                />
              </div>
            )}

            {/* SECCIÓN DETALLADA: DESGLOSE DE LOTES Y AUDITORÍA FEFO */}
            <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl space-y-5 backdrop-blur-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-cyan-400" />
                      {selectedLotStatusFilter === 'menos30' && 'Detalle: Lotes Críticos con Vencimiento < 30 Días (Despacho Inmediato)'}
                      {selectedLotStatusFilter === 'menos90' && 'Detalle: Lotes con Vencimiento Próximo < 90 Días (Prioridad FEFO)'}
                      {selectedLotStatusFilter === 'vencidos' && 'Detalle: Lotes Vencidos en Cuarentena (Baja Contable)'}
                      {selectedLotStatusFilter === 'todos' && 'Detalle: Auditoría Completa de Lotes en Kardex'}
                    </h3>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedLotStatusFilter === 'menos30'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : selectedLotStatusFilter === 'menos90'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : selectedLotStatusFilter === 'vencidos'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {filteredLotes.length} lotes mostrados
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Control por lote individual, fecha de caducidad, condiciones de almacenamiento y protocolo de despacho sugerido.
                  </p>
                </div>

                {/* Filtros de la Tabla de Lotes */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-slate-400">Slicer FEFO:</span>
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/[0.06]">
                      <button
                        onClick={() => setSelectedLotStatusFilter('todos')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          selectedLotStatusFilter === 'todos' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => setSelectedLotStatusFilter('menos30')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          selectedLotStatusFilter === 'menos30' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        &lt; 30d (5)
                      </button>
                      <button
                        onClick={() => setSelectedLotStatusFilter('menos90')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          selectedLotStatusFilter === 'menos90' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        &lt; 90d (34)
                      </button>
                      <button
                        onClick={() => setSelectedLotStatusFilter('vencidos')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          selectedLotStatusFilter === 'vencidos' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Vencidos (333)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-slate-400">Filtro LIKE (Lote / SKU):</span>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={lotSearchText}
                        onChange={e => setLotSearchText(e.target.value)}
                        placeholder="Buscar por lote, SKU..."
                        className="pl-8 pr-3 py-1.5 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Note: Kits vs Unidades */}
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Package className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>
                    <strong className="text-white">Diferenciación de Unidades:</strong> Los valores en <strong className="text-cyan-300">Kits</strong> indican las cajas/estuches físicos en bodega, mientras que las <strong className="text-emerald-300">Pruebas (U)</strong> corresponden al total de determinaciones diagnósticas o equipos unitarios.
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/10 hidden sm:inline-block">
                  FEFO Live
                </span>
              </div>

              {/* Table of Lots */}
              <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-white/[0.06]">
                    <tr>
                      <th className="px-4 py-3">Código SKU / Reactivo</th>
                      <th className="px-3 py-3">Marca</th>
                      <th className="px-3 py-3">No. Lote</th>
                      <th className="px-3 py-3">Almacenamiento</th>
                      <th className="px-3 py-3">Fecha Venc.</th>
                      <th className="px-3 py-3 text-center">Caducidad / Días</th>
                      <th className="px-3 py-3 text-right">Existencia (Kits & Unidades)</th>
                      <th className="px-4 py-3 text-left">Protocolo / Acción Recomendada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-medium">
                    {filteredLotes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          No se encontraron lotes que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredLotes.map(lote => (
                        <tr key={lote.id} className="hover:bg-white/[0.04] transition">
                          <td className="px-4 py-3">
                            <div className="font-mono font-bold text-cyan-300">{lote.sku}</div>
                            <div className="font-bold text-white text-xs">{lote.producto}</div>
                          </td>

                          <td className="px-3 py-3 font-semibold text-slate-300">{lote.marca}</td>

                          <td className="px-3 py-3">
                            <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950 text-purple-300 border border-purple-500/20 text-xs">
                              {lote.lote}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-slate-400 text-xs">
                            {lote.temp}
                          </td>

                          <td className="px-3 py-3 font-mono text-slate-200 font-semibold">{lote.vence}</td>

                          <td className="px-3 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] border ${
                              lote.dias < 0
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : lote.dias <= 30
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            }`}>
                              {lote.dias < 0 ? `Vencido hace ${Math.abs(lote.dias)}d` : `En ${lote.dias} días`}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-right">
                            <div className="font-mono font-bold text-white text-xs">
                              {lote.kits} <span className="text-cyan-400 font-semibold">Kits</span>
                            </div>
                            <div className="text-[10px] text-emerald-300 font-mono font-semibold">
                              {lote.unidadesTotales ? `${lote.unidadesTotales.toLocaleString()} Pruebas (U)` : `${lote.kits} U`}
                            </div>
                            <div className="text-[9px] text-slate-400">
                              {lote.presentacion}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                              lote.tipo === 'vencidos'
                                ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                                : lote.tipo === 'menos30'
                                ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                                : 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30'
                            }`}>
                              {lote.tipo === 'vencidos' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
                              {lote.tipo === 'menos30' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                              {lote.tipo === 'menos90' && <Activity className="w-3.5 h-3.5 text-indigo-400" />}
                              <span>{lote.accion}</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: ENVÍOS, MENSAJERÍA & OPTIMIZACIÓN DE RUTAS LOGÍSTICAS (BI)          */}
        {/* ========================================================================= */}
        {activeTab === 'envios_mensajeria' && (
          <div className="space-y-6">
            {/* Top Sub-Bar with Controls & Sync */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-white/[0.08] p-4 rounded-3xl backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setLogisticsSubTab('analytics')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    logisticsSubTab === 'analytics'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analítica BI & Rendimiento Motoristas</span>
                </button>

                <button
                  onClick={() => setLogisticsSubTab('live_table')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    logisticsSubTab === 'live_table'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Monitoreo de Envíos en Vivo ({filteredLogisticsLive.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Visualizer Mode for Logistics */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/[0.06]">
                  <button
                    onClick={() => setChartModeLogistics('hybrid')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      chartModeLogistics === 'hybrid' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Híbrido
                  </button>
                  <button
                    onClick={() => setChartModeLogistics('bars')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      chartModeLogistics === 'bars' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Barras
                  </button>
                  <button
                    onClick={() => setChartModeLogistics('pie')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      chartModeLogistics === 'pie' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Donut
                  </button>
                </div>

                <button
                  onClick={handleSyncData}
                  disabled={syncing}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{syncing ? 'Sincronizando...' : 'Actualizar DBlabymed'}</span>
                </button>
              </div>
            </div>

            {/* Bento Grid Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Total Envíos */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl backdrop-blur-xl group hover:border-cyan-500/40 transition duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 group-hover:opacity-100 transition" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Envíos</span>
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"><Package className="w-4 h-4" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-white font-mono">{logisticsData.kpis.total_pedidos}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">COUNT(PedidoID) en DBlabymed</div>
                  <div className="text-[9.5px] font-mono text-cyan-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Origen:</span> Pedidosinfo (Google Sheets $\rightarrow$ Supabase)
                  </div>
                </div>
              </div>

              {/* Tasa de Efectividad */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl backdrop-blur-xl group hover:border-emerald-500/40 transition duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 group-hover:opacity-100 transition" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efectividad Motoristas</span>
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><TrendingUp className="w-4 h-4" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-emerald-400 font-mono">{logisticsData.kpis.tasa_efectividad_global}%</div>
                  <div className="text-[11px] text-emerald-300 mt-1 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    304 entregados en 1er intento
                  </div>
                  <div className="text-[9.5px] font-mono text-emerald-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Fórmula:</span> (Entregados_OK / Total) × 100
                  </div>
                </div>
              </div>

              {/* Urgencias Hospital */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl backdrop-blur-xl group hover:border-rose-500/40 transition duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50 group-hover:opacity-100 transition" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Urgencias Hospital</span>
                  <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400"><Zap className="w-4 h-4" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-rose-400 font-mono">
                    {logisticsData.kpis.total_urgentes} <span className="text-sm text-slate-400 font-normal font-sans">({logisticsData.kpis.pct_urgentes}%)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Prioridad &lt; 24h despachada</div>
                  <div className="text-[9.5px] font-mono text-rose-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Condición:</span> Detalle LIKE %URGENCIA%
                  </div>
                </div>
              </div>

              {/* Índice Consolidación */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl backdrop-blur-xl group hover:border-purple-500/40 transition duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 group-hover:opacity-100 transition" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Índice Consolidación</span>
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400"><Compass className="w-4 h-4" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-purple-300 font-mono">{logisticsData.kpis.indice_consolidacion_carga}x</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Pedidos / Parada hospitalaria</div>
                  <div className="text-[9.5px] font-mono text-purple-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Ahorro:</span> 38% menos viajes redundantes
                  </div>
                </div>
              </div>

              {/* Control Documental POD */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl backdrop-blur-xl group hover:border-blue-500/40 transition duration-300 col-span-2 lg:col-span-1">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 group-hover:opacity-100 transition" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">POD Sello Digital</span>
                  <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400"><FileCheck className="w-4 h-4" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-blue-300 font-mono">
                    {logisticsData.kpis.total_con_comprobante_pdf} <span className="text-sm text-slate-400 font-normal font-sans">({Math.round((logisticsData.kpis.total_con_comprobante_pdf / logisticsData.kpis.total_pedidos) * 100)}%)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Comprobantes PDF firmados</div>
                  <div className="text-[9.5px] font-mono text-blue-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Campo:</span> PedidosInfo_Files_ (PDF)
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* SUB-TAB 1: ANALÍTICA BI & RENDIMIENTO DE MOTORISTAS                   */}
            {/* ===================================================================== */}
            {logisticsSubTab === 'analytics' && (
              <div className="space-y-6">
                {/* Fila 1: Productividad de Motoristas vs Matriz de Incidencias */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Ranking y Productividad por Motorista */}
                  <div className="lg:col-span-2 bg-slate-900/80 border border-white/[0.08] rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2.5">
                        <Users className="w-5 h-5 text-cyan-400" />
                        <div>
                          <h3 className="text-base font-bold text-white">Productividad & Rendimiento de Motoristas</h3>
                          <p className="text-xs text-slate-400">Total asignados, entregas exitosas y tasa de efectividad en primer intento</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        4 Motoristas Activos
                      </span>
                    </div>

                    <div className="space-y-3.5 pt-2">
                      {logisticsData.motoristas.map(m => (
                        <div key={m.motorista_id} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-500/30">
                                {m.motorista_id}
                              </span>
                              <span className="font-bold text-white">{m.nombre}</span>
                              <span className="text-[10px] text-slate-400">({m.zona})</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono">
                              <span className="text-slate-400">Asignados: <strong className="text-white">{m.total_asignados}</strong></span>
                              <span className="text-emerald-400">OK: <strong>{m.entregados_ok}</strong></span>
                              <span className="text-amber-400 font-bold">{m.efectividad_pct}% Éxito</span>
                            </div>
                          </div>

                          {/* Barra de Progreso de Efectividad */}
                          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${m.efectividad_pct}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1 text-rose-300">
                              <Zap className="w-3 h-3 text-rose-400" />
                              {m.urgentes_atendidos} Urgencias despachadas
                            </span>
                            <span>En ruta: <strong className="text-cyan-300">{m.en_ruta}</strong> | Incidencias: <strong className="text-rose-400">{m.incidencias}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matriz de Incidencias en Ruta */}
                  <div className="bg-slate-900/80 border border-white/[0.08] rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <div>
                          <h3 className="text-base font-bold text-white">Matriz de Incidencias en Ruta</h3>
                          <p className="text-xs text-slate-400">Desglose de motivos de no entrega</p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        {logisticsData.incidencias_motivos.map((inc, i) => (
                          <div key={i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">{inc.motivo}</span>
                              <span className="font-mono font-bold text-amber-400">{inc.cantidad} casos ({inc.pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full"
                                style={{ width: `${inc.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>Protocolo activo: Las incidencias de laboratorio cerrado se reprograman automáticamente para la primera ruta matutina.</span>
                    </div>
                  </div>
                </div>

                {/* Donut & Pie Charts para Logística (cuando mode es 'hybrid' o 'pie') */}
                {(chartModeLogistics === 'hybrid' || chartModeLogistics === 'pie') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NeoChartPieDonut
                      data={pieLogisticsZonas}
                      title="Gráfico Donut: Concentración de Carga por Macro-Zonas"
                      subtitle="Participación territorial del volumen total de pedidos"
                      type="donut"
                      centerLabel="Envíos Totales"
                      centerValue="320 Envíos"
                      badge="Densidad Logística"
                      formatValue={v => `${v} pedidos`}
                    />

                    <NeoChartPieDonut
                      data={pieLogisticsIncidencias}
                      title="Gráfico Pastel: Clasificación de Incidencias en Ruta"
                      subtitle="Distribución porcentual por causa de no entrega"
                      type="donut"
                      centerLabel="Incidencias"
                      centerValue="14 Casos"
                      badge="Control Calidad"
                      formatValue={v => `${v} casos`}
                    />
                  </div>
                )}

                {/* Fila 2: Densidad Geográfica por Macro-Zonas vs Consolidación Hospitalaria */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Macro-Zonas Logísticas */}
                  <div className="bg-slate-900/80 border border-white/[0.08] rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="text-base font-bold text-white">Densidad por Macro-Zonas</h3>
                        <p className="text-xs text-slate-400">Concentración territorial de pedidos</p>
                      </div>
                    </div>

                    <div className="space-y-3.5 pt-2">
                      {logisticsData.macro_zonas.map((z, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold border ${z.badge}`}>
                              {z.zona}
                            </span>
                            <span className="font-mono font-bold text-white text-sm">
                              {z.pedidos} <span className="text-xs text-slate-400 font-normal">({z.pct}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`bg-gradient-to-r ${z.color} h-full rounded-full`}
                              style={{ width: `${z.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consolidación de Carga por Hospital */}
                  <div className="lg:col-span-2 bg-slate-900/80 border border-white/[0.08] rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-5 h-5 text-purple-400" />
                        <div>
                          <h3 className="text-base font-bold text-white">Consolidación de Carga Hospitalaria</h3>
                          <p className="text-xs text-slate-400">Eficiencia de paradas: Cantidad de pedidos agrupados por cada viaje al hospital</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/50 px-3 py-1 rounded-xl border border-purple-500/30">
                        Ahorro en Rutas: 38%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {logisticsData.hospitales_top.map((h, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col justify-between space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-white line-clamp-1">{h.hospital}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold whitespace-nowrap">
                              {h.ratio}x Ped/Viaje
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono bg-slate-900/60 p-2 rounded-xl border border-white/5">
                            <div>
                              <div className="text-slate-400">Pedidos</div>
                              <div className="text-white font-bold text-xs">{h.pedidos}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Viajes</div>
                              <div className="text-cyan-300 font-bold text-xs">{h.rutas}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">POD Sello</div>
                              <div className="text-emerald-400 font-bold text-xs">{h.pod_pct}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* SUB-TAB 2: MONITOREO DE ENVÍOS EN VIVO (TABLA INTERACTIVA)            */}
            {/* ===================================================================== */}
            {logisticsSubTab === 'live_table' && (
              <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl space-y-5 backdrop-blur-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-base font-bold text-white">Monitoreo y Trazabilidad de Envíos en Vivo</h3>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {filteredLogisticsLive.length} despachos mostrados
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Rastreo de entregas hospitalarias, motoristas asignados, comprobantes POD firmados y alertas de urgencia.
                    </p>
                  </div>

                  {/* Slicers y Filtros */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Filtro Estado */}
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/[0.06]">
                      {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'urgentes', label: '⚡ Urgentes' },
                        { id: 'entregados', label: '✓ Entregados' },
                        { id: 'en_ruta', label: '🚚 En Ruta' },
                        { id: 'incidencia', label: '⚠️ Incidencias' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setFilterEstadoLogistics(f.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            filterEstadoLogistics === f.id ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Filtro Macro-Zona */}
                    <select
                      value={filterZonaLogistics}
                      onChange={e => setFilterZonaLogistics(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="todas">Todas las Zonas</option>
                      <option value="CENTRAL">Zona Central</option>
                      <option value="OCCIDENTAL">Zona Occidental</option>
                      <option value="ORIENTAL">Zona Oriental</option>
                    </select>

                    {/* Buscador */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={searchLogistics}
                        onChange={e => setSearchLogistics(e.target.value)}
                        placeholder="Buscar por hospital, ID, motorista..."
                        className="pl-8 pr-3 py-1.5 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56"
                      />
                    </div>
                  </div>
                </div>

                {/* Tabla de Envíos */}
                <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-white/[0.06]">
                      <tr>
                        <th className="px-4 py-3">ID Pedido / Destino</th>
                        <th className="px-3 py-3">Fecha</th>
                        <th className="px-3 py-3">Detalle & Especificaciones</th>
                        <th className="px-3 py-3">Motorista & Macro-Zona</th>
                        <th className="px-3 py-3 text-center">Prioridad</th>
                        <th className="px-3 py-3">Estado Logístico</th>
                        <th className="px-4 py-3 text-center">Comprobante POD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] font-medium">
                      {filteredLogisticsLive.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500">
                            No se encontraron pedidos con los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        filteredLogisticsLive.map(item => (
                          <tr key={item.id} className="hover:bg-white/[0.04] transition">
                            <td className="px-4 py-3">
                              <div className="font-mono font-bold text-cyan-300">{item.id}</div>
                              <div className="font-bold text-white text-xs">{item.hospital}</div>
                              <div className="text-[10px] text-slate-400">{item.ciudad}</div>
                            </td>

                            <td className="px-3 py-3 font-mono text-slate-300 whitespace-nowrap">
                              {item.fecha}
                            </td>

                            <td className="px-3 py-3 text-slate-300 max-w-xs truncate">
                              {item.detalle}
                            </td>

                            <td className="px-3 py-3">
                              <div className="font-mono font-bold text-purple-300">{item.motorista}</div>
                              <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${
                                item.region === 'CENTRAL'
                                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                  : item.region === 'OCCIDENTAL'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              }`}>
                                {item.region}
                              </span>
                            </td>

                            <td className="px-3 py-3 text-center">
                              {item.es_urgente ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  <Zap className="w-3 h-3 text-rose-400 animate-pulse" />
                                  URGENTE
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-400">Estándar</span>
                              )}
                            </td>

                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                                item.estado.includes('Entregado')
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                                  : item.estado.includes('Tránsito')
                                  ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30'
                                  : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                              }`}>
                                {item.estado.includes('Entregado') && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                                {item.estado.includes('Tránsito') && <Truck className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
                                {item.estado.includes('Incidencia') && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                                <span>{item.estado}</span>
                              </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              {item.pdf ? (
                                <button
                                  onClick={() => {
                                    setNotification({
                                      type: 'info',
                                      message: `📄 Comprobante POD Digital: ${item.pdf} verificado con firma y sello hospitalario.`
                                    })
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-mono font-bold transition cursor-pointer"
                                >
                                  <FileText className="w-3 h-3 text-blue-400" />
                                  <span>POD PDF</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono italic">En trámite</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SIMULADOR ROP & COMPRAS INTELIGENTES */}
        {/* ========================================================================= */}
        {activeTab === 'rop' && (
          <div className="space-y-6">
            {/* Top Glowing Metrics (Interactive Filter Buttons) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setRopStatusFilter(ropStatusFilter === 'URGENTE' ? 'TODOS' : 'URGENTE')}
                className={`rounded-3xl border p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between text-left transition-all duration-300 cursor-pointer ${
                  ropStatusFilter === 'URGENTE'
                    ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.35)] scale-[1.02]'
                    : 'bg-slate-900/80 border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Peligro de Quiebre</span>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400"><AlertTriangle className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-black text-rose-400 font-mono">{ropSummary.urgentes}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Bajo Stock de Seguridad (Clic para filtrar)</div>
                  <div className="text-[9.5px] font-mono text-rose-300/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Condición:</span> Stock Actual &lt; Stock Seguridad (SS)
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRopStatusFilter(ropStatusFilter === 'REORDEN' ? 'TODOS' : 'REORDEN')}
                className={`rounded-3xl border p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between text-left transition-all duration-300 cursor-pointer ${
                  ropStatusFilter === 'REORDEN'
                    ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.35)] scale-[1.02]'
                    : 'bg-slate-900/80 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">En Punto de Reorden</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><ShoppingCart className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-black text-amber-400 font-mono">{ropSummary.reorden}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Listos para Orden (Clic para filtrar)</div>
                  <div className="text-[9.5px] font-mono text-amber-300/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Condición:</span> SS ≤ Stock Actual ≤ ROP
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRopStatusFilter(ropStatusFilter === 'SUGERIDO' ? 'TODOS' : 'SUGERIDO')}
                className={`rounded-3xl border p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between text-left transition-all duration-300 cursor-pointer ${
                  ropStatusFilter === 'SUGERIDO'
                    ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.35)] scale-[1.02]'
                    : 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Volumen Sugerido</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><PackageCheck className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-black text-emerald-400 font-mono">{ropSummary.totalKitsSugeridos.toLocaleString()}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Kits a solicitar a fábricas</div>
                  <div className="text-[9.5px] font-mono text-emerald-300/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Fórmula:</span> Σ max(0, Target Stock - Stock Actual)
                  </div>
                </div>
              </button>

              <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Inversión CIF Estimada</span>
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400"><DollarSign className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-cyan-300 font-mono">${Math.round(ropSummary.totalInversionSugerida).toLocaleString()}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Presupuesto sugerido</div>
                  <div className="text-[9.5px] font-mono text-cyan-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Fórmula:</span> Σ (Kits Sugeridos × Costo CIF Unitario)
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Sliders Bar */}
            <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Parámetros Dinámicos de la Fórmula ROP: ROP = (Demanda Diaria × Lead Time) + SS
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Ajusta los días de tránsito y políticas de cobertura para recalcular la orden de compra inteligente</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={ropSearch}
                    onChange={e => setRopSearch(e.target.value)}
                    placeholder="Buscar reactivo..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="block text-[9px] font-mono text-slate-500 mt-0.5">Filtro SKU / Producto en ROP</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/[0.04] space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Tránsito Asia (Marítimo)</span>
                    <span className="text-cyan-400 font-mono font-bold">{ropLeadTimeAsia} días</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={ropLeadTimeAsia}
                    onChange={e => setRopLeadTimeAsia(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <p className="text-[9.5px] font-mono text-cyan-400/80">Variable L_Asia | ROP = d × L + SS</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/[0.04] space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Tránsito USA (Aéreo/Mar)</span>
                    <span className="text-purple-400 font-mono font-bold">{ropLeadTimeUSA} días</span>
                  </label>
                  <input
                    type="range"
                    min="7"
                    max="30"
                    value={ropLeadTimeUSA}
                    onChange={e => setRopLeadTimeUSA(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <p className="text-[9.5px] font-mono text-purple-400/80">Variable L_USA | ROP = d × L + SS</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/[0.04] space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Tránsito Europa</span>
                    <span className="text-indigo-400 font-mono font-bold">{ropLeadTimeEuropa} días</span>
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="45"
                    value={ropLeadTimeEuropa}
                    onChange={e => setRopLeadTimeEuropa(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <p className="text-[9.5px] font-mono text-indigo-400/80">Variable L_Europa | ROP = d × L + SS</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/[0.04] space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Cobertura Meta</span>
                    <span className="text-amber-400 font-mono font-bold">{ropCoverageDays} días</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    step="15"
                    value={ropCoverageDays}
                    onChange={e => setRopCoverageDays(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[9.5px] font-mono text-amber-400/80">Target Stock = Demanda × Días</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/[0.04] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">Nivel de Servicio (Z)</label>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{ropServiceLevel}%</span>
                  </div>
                  <select
                    value={ropServiceLevel}
                    onChange={e => setRopServiceLevel(Number(e.target.value))}
                    className="w-full px-2.5 py-1 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white"
                  >
                    <option value={90}>90% (Z = 1.28) - Estándar</option>
                    <option value={95}>95% (Z = 1.65) - Recomendado</option>
                    <option value={99}>99% (Z = 2.33) - Hospitalario</option>
                  </select>
                  <p className="text-[9.5px] font-mono text-emerald-400/80">SS = Z × √(L) × (d × 0.25)</p>
                </div>
              </div>
            </div>

            {/* Visual Analytics Hub for ROP */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/[0.06] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Analítica Visual del Punto de Reorden (ROP)
                    </h3>
                    <p className="text-[11px] text-slate-400">Comparativa de quiebres, umbrales y presupuesto por región</p>
                  </div>
                </div>

                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/[0.06] text-xs font-bold">
                  <button
                    onClick={() => setChartModeRop('hybrid')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      chartModeRop === 'hybrid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers3 className="w-3.5 h-3.5" />
                    <span>Vista Híbrida</span>
                  </button>
                  <button
                    onClick={() => setChartModeRop('bars')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      chartModeRop === 'bars' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Barras</span>
                  </button>
                  <button
                    onClick={() => setChartModeRop('pie')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      chartModeRop === 'pie' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PieChartIcon className="w-3.5 h-3.5" />
                    <span>Pastel & Donut</span>
                  </button>
                </div>
              </div>

              {/* Gráfico de Barras: Comparativo de Stock Actual vs Punto de Reorden (ROP) */}
              {(chartModeRop === 'hybrid' || chartModeRop === 'bars') && (
                <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Gráfico de Barras: Stock Actual vs. Punto de Reorden (ROP) por SKU Crítico
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Stock Actual
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Umbral ROP
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Stock Seguridad
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-1">
                    {ropData.slice(0, 6).map(item => {
                      const maxVal = Math.max(item.stockActual, item.rop, item.safetyStock, 1)
                      const stockWidth = Math.min(Math.round((item.stockActual / maxVal) * 100), 100)
                      const ropWidth = Math.min(Math.round((item.rop / maxVal) * 100), 100)

                      return (
                        <div key={item.sku} className="space-y-1.5 p-3 rounded-2xl bg-slate-950/60 border border-white/[0.04]">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-[11px]">{item.sku}</span>
                              <span className="font-bold text-white text-xs">{item.name}</span>
                              <span className="text-slate-500 text-[11px]">({item.marca})</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono text-xs">
                              <span className="text-cyan-300 font-bold">Stock: {item.stockActual.toLocaleString()}</span>
                              <span className="text-amber-400 font-bold">ROP: {item.rop.toLocaleString()}</span>
                              {item.suggestedOrder > 0 && (
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                                  Pedir: +{item.suggestedOrder.toLocaleString()} kits
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.status === 'URGENTE'
                                    ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                                    : item.status === 'REORDEN'
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                }`}
                                style={{ width: `${Math.max(stockWidth, 3)}%` }}
                              />
                            </div>

                            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex opacity-70">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full"
                                style={{ width: `${Math.max(ropWidth, 3)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Gráficos de Pastel & Donut para ROP (cuando mode es 'hybrid' o 'pie') */}
              {(chartModeRop === 'hybrid' || chartModeRop === 'pie') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NeoChartPieDonut
                    data={pieRopStatus}
                    title="Gráfico Donut: Diagnóstico de Estado de Inventario ROP"
                    subtitle="Clasificación por severidad de stock y cobertura"
                    type="donut"
                    centerLabel="Total SKUs"
                    centerValue={`${ropData.length} SKUs`}
                    badge="Algoritmo ROP"
                    formatValue={v => `${v} SKUs`}
                  />

                  <NeoChartPieDonut
                    data={pieRopRegionInversion}
                    title="Gráfico Pastel: Presupuesto CIF Sugerido por Región"
                    subtitle="Distribución del capital sugerido según origen logístico"
                    type="donut"
                    centerLabel="Inversión Sugerida"
                    centerValue={`$${Math.round(ropSummary.totalInversionSugerida).toLocaleString()}`}
                    badge="CIF Sugerido"
                    formatValue={v => `$${Math.round(v).toLocaleString()}`}
                  />
                </div>
              )}
            </div>

            {/* ROP Table & Slicers Toolbar */}
            <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-xl space-y-4 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/[0.06] text-xs font-bold">
                    <button
                      onClick={() => setRopStatusFilter('TODOS')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        ropStatusFilter === 'TODOS' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Todos ({ropData.length})
                    </button>
                    <button
                      onClick={() => setRopStatusFilter('URGENTE')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        ropStatusFilter === 'URGENTE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-rose-400'
                      }`}
                    >
                      🔴 Quiebre ({ropSummary.urgentes})
                    </button>
                    <button
                      onClick={() => setRopStatusFilter('REORDEN')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        ropStatusFilter === 'REORDEN' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-amber-400'
                      }`}
                    >
                      🟡 Reorden ({ropSummary.reorden})
                    </button>
                    <button
                      onClick={() => setRopStatusFilter('SUGERIDO')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        ropStatusFilter === 'SUGERIDO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-emerald-400'
                      }`}
                    >
                      🟢 Compras ({ropData.filter(i => i.suggestedOrder > 0).length})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const csvHeader = 'SKU,Producto,Marca,Origen,Consumo Mensual (Kits),Stock Actual (Kits),Stock Seguridad (Kits),Punto Reorden ROP,Sugerencia Compra (Kits),Presupuesto CIF (USD),Estado ROP\r\n'
                      const csvRows = filteredRopData.map(i => `"${i.sku}","${i.name}","${i.marca}","${i.region}",${i.consumoMensual},${i.stockActual},${i.safetyStock},${i.rop},${i.suggestedOrder},${Math.round(i.investmentNeeded)},"${i.status}"`).join('\r\n')
                      const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' })
                      const link = document.createElement('a')
                      link.href = URL.createObjectURL(blob)
                      link.setAttribute('download', `Plan_Compras_ROP_${new Date().toISOString().slice(0, 10)}.csv`)
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Plan de Compras (.CSV)</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-white/[0.06]">
                    <tr>
                      <th className="px-4 py-3">Código SKU / Producto</th>
                      <th className="px-3 py-3">Marca & Origen</th>
                      <th className="px-3 py-3 text-right">Consumo / Mes</th>
                      <th className="px-3 py-3 text-right">Stock Actual</th>
                      <th className="px-3 py-3 text-right">Stock Seguridad</th>
                      <th className="px-3 py-3 text-right">Punto Reorden (ROP)</th>
                      <th className="px-3 py-3 text-center">Estado ROP</th>
                      <th className="px-3 py-3 text-right">Sugerencia Compra</th>
                      <th className="px-4 py-3 text-right">Presupuesto CIF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-medium">
                    {filteredRopData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500">
                          No hay productos en esta categoría de filtro ROP.
                        </td>
                      </tr>
                    ) : (
                      filteredRopData.map(item => (
                        <tr key={item.sku} className={`hover:bg-white/[0.04] transition ${
                          item.status === 'URGENTE' ? 'bg-rose-950/20' : item.status === 'REORDEN' ? 'bg-amber-950/20' : ''
                        }`}>
                          <td className="px-4 py-3">
                            <div className="font-mono font-bold text-cyan-300">{item.sku}</div>
                            <div className="font-bold text-white text-xs">{item.name}</div>
                          </td>

                          <td className="px-3 py-3">
                            <div className="text-slate-300 font-semibold">{item.marca}</div>
                            <div className="text-[10px] text-slate-500">{item.region} (Lead: {item.leadTime}d)</div>
                          </td>

                          <td className="px-3 py-3 text-right font-mono text-slate-300">{item.consumoMensual.toLocaleString()} kits</td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-white">{item.stockActual.toLocaleString()} kits</td>
                          <td className="px-3 py-3 text-right font-mono text-slate-400">{item.safetyStock} kits</td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-amber-300">{item.rop} kits</td>

                          <td className="px-3 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] border ${
                              item.status === 'URGENTE'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                : item.status === 'REORDEN'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : item.status === 'SOBRESTOCK'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {item.status}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-right font-mono font-bold text-emerald-400">
                            {item.suggestedOrder > 0 ? `+${item.suggestedOrder.toLocaleString()} kits` : '0 kits'}
                          </td>

                          <td className="px-4 py-3 text-right font-mono font-bold text-white">
                            ${Math.round(item.investmentNeeded).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CALCULADORA DE RENTABILIDAD */}
        {/* ========================================================================= */}
        {activeTab === 'rentabilidad' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas Proyectadas</span>
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400"><DollarSign className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-white font-mono">${Math.round(rentabilidadSummary.ingresosTotales).toLocaleString()}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Ingresos brutos anuales</div>
                  <div className="text-[9.5px] font-mono text-indigo-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Fórmula:</span> Σ (Volumen Simulado × Precio Efectivo)
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Utilidad Bruta Anual</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><TrendingUp className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-emerald-400 font-mono">${Math.round(rentabilidadSummary.utilidadTotal).toLocaleString()}</div>
                  <div className="text-xs text-emerald-300/80 mt-0.5">Margen neto consolidado</div>
                  <div className="text-[9.5px] font-mono text-emerald-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Fórmula:</span> Ventas Proyectadas - Costo Total CIF Ventas
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Margen Bruto Promedio</span>
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400"><Percent className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-cyan-300 font-mono">{rentabilidadSummary.margenPromedio.toFixed(1)}%</div>
                  <div className="text-xs text-slate-400 mt-0.5">Retorno sobre ventas (ROS)</div>
                  <div className="text-[9.5px] font-mono text-cyan-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Fórmula:</span> (Utilidad Total / Ventas Proy.) × 100
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900/80 border border-purple-500/30 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Volumen Total</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><Boxes className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-purple-300 font-mono">{rentabilidadSummary.volumenTotal.toLocaleString()} kits</div>
                  <div className="text-xs text-slate-400 mt-0.5">Capacidad de entrega</div>
                  <div className="text-[9.5px] font-mono text-purple-400/80 mt-2 pt-1.5 border-t border-white/[0.06] flex items-center gap-1">
                    <span className="text-slate-500">Fórmula:</span> Σ [Volumen Base × (1 + Crecimiento %)]
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Sensitivity Sliders */}
            <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="border-b border-white/[0.06] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  Simulador de Sensibilidad de Precios para Licitaciones Públicas
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Evalúa cómo impactan los descuentos ofertados al MINSAL/ISSS y las variaciones logísticas en tu margen neto</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Descuento en Licitación (MINSAL/ISSS)</span>
                    <span className="text-rose-400 font-mono font-bold">{licitacionDiscount}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={licitacionDiscount}
                    onChange={e => setLicitacionDiscount(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <p className="text-[9.5px] font-mono text-rose-300/80">Fórmula: Precio Efectivo = Precio Lista × (1 - {licitacionDiscount}%)</p>
                </div>

                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Variación en Fletes Internacionales</span>
                    <span className="text-amber-400 font-mono font-bold">+{freightInflation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={freightInflation}
                    onChange={e => setFreightInflation(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <p className="text-[9.5px] font-mono text-amber-300/80">Fórmula CIF: FOB × [1 + (Flete × (1 + {freightInflation}%)) + Arancel]</p>
                </div>

                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Crecimiento de Volumen Adjudicado</span>
                    <span className="text-emerald-400 font-mono font-bold">+{projectedAnnualGrowth}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={projectedAnnualGrowth}
                    onChange={e => setProjectedAnnualGrowth(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[9.5px] font-mono text-emerald-300/80">Fórmula: Volumen Simulado = Volumen Base × (1 + {projectedAnnualGrowth}%)</p>
                </div>
              </div>
            </div>

            {/* Visual Analytics Hub for Rentabilidad */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/[0.06] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Analítica Visual de Rentabilidad & Sensibilidad
                    </h3>
                    <p className="text-[11px] text-slate-400">Distribución de márgenes brutos, costos y utilidad neta por línea</p>
                  </div>
                </div>

                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/[0.06] text-xs font-bold">
                  <button
                    onClick={() => setChartModeRentabilidad('hybrid')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      chartModeRentabilidad === 'hybrid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers3 className="w-3.5 h-3.5" />
                    <span>Vista Híbrida</span>
                  </button>
                  <button
                    onClick={() => setChartModeRentabilidad('bars')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      chartModeRentabilidad === 'bars' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Barras</span>
                  </button>
                  <button
                    onClick={() => setChartModeRentabilidad('pie')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      chartModeRentabilidad === 'pie' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PieChartIcon className="w-3.5 h-3.5" />
                    <span>Pastel & Donut</span>
                  </button>
                </div>
              </div>

              {/* Gráfico de Barras: Utilidad Anual por Línea Diagnóstica */}
              {(chartModeRentabilidad === 'hybrid' || chartModeRentabilidad === 'bars') && (
                <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Gráfico de Barras: Utilidad Bruta Anual Proyectada por Línea de Producto
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Total Utilidad: ${Math.round(rentabilidadSummary.utilidadTotal).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    {rentabilidadModels.map((item, idx) => {
                      const maxUtil = Math.max(...rentabilidadModels.map(m => m.utilidadBrutaTotal), 1)
                      const utilWidth = Math.min(Math.round((item.utilidadBrutaTotal / maxUtil) * 100), 100)
                      const barGradients = [
                        'from-emerald-500 to-teal-400',
                        'from-cyan-500 to-blue-500',
                        'from-indigo-500 to-violet-500',
                        'from-purple-500 to-pink-500',
                        'from-amber-500 to-orange-400',
                        'from-teal-500 to-emerald-400'
                      ]
                      const grad = barGradients[idx % barGradients.length]

                      return (
                        <div key={item.linea} className="space-y-1.5 p-3 rounded-2xl bg-slate-950/60 border border-white/[0.04]">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{item.linea}</span>
                              <span className="text-slate-500 text-[11px]">({item.marca})</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono text-xs">
                              <span className="text-slate-400">Margen: <strong className="text-cyan-300">{item.margenPorcentaje}%</strong></span>
                              <span className="text-slate-400">Volumen: <strong className="text-purple-300">{item.volumenSimulado.toLocaleString()} kits</strong></span>
                              <span className="font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 text-xs">
                                ${Math.round(item.utilidadBrutaTotal).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/[0.04] flex">
                            <div
                              className={`bg-gradient-to-r ${grad} h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-500`}
                              style={{ width: `${Math.max(utilWidth, 4)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Gráficos de Pastel & Donut para Rentabilidad (cuando mode es 'hybrid' o 'pie') */}
              {(chartModeRentabilidad === 'hybrid' || chartModeRentabilidad === 'pie') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NeoChartPieDonut
                    data={pieRentabilidadUtilidad}
                    title="Gráfico Donut: Participación en Utilidad por Línea Diagnóstica"
                    subtitle="Contribución monetaria al margen bruto consolidado"
                    type="donut"
                    centerLabel="Utilidad Bruta"
                    centerValue={`$${Math.round(rentabilidadSummary.utilidadTotal).toLocaleString()}`}
                    badge="Margen 44.5%"
                    formatValue={v => `$${Math.round(v).toLocaleString()}`}
                  />

                  <NeoChartPieDonut
                    data={pieEstructuraCostos}
                    title="Gráfico Pastel: Estructura de Costos vs Margen Operativo"
                    subtitle="Desglose de FOB, fletes internacionales y margen de ganancia"
                    type="donut"
                    centerLabel="Ventas Totales"
                    centerValue={`$${Math.round(rentabilidadSummary.ingresosTotales).toLocaleString()}`}
                    badge="Estructura Costos"
                    formatValue={v => `$${Math.round(v).toLocaleString()}`}
                  />
                </div>
              )}
            </div>

            {/* Profitability Matrix */}
            <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-white/[0.06]">
                    <tr>
                      <th className="px-4 py-3">Línea de Producto / Especialidad</th>
                      <th className="px-3 py-3">Marca Principal</th>
                      <th className="px-3 py-3 text-right">Costo CIF Unit.</th>
                      <th className="px-3 py-3 text-right">Precio Licitación</th>
                      <th className="px-3 py-3 text-right">Margen Bruto Unit.</th>
                      <th className="px-3 py-3 text-right">Margen %</th>
                      <th className="px-3 py-3 text-right">Volumen Simulado</th>
                      <th className="px-4 py-3 text-right">Utilidad Anual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-medium">
                    {rentabilidadModels.map(item => (
                      <tr key={item.linea} className="hover:bg-white/[0.04] transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white text-xs">{item.linea}</div>
                          <div className="text-[10px] text-slate-500">{item.categoria}</div>
                        </td>

                        <td className="px-3 py-3 font-semibold text-slate-300">{item.marca}</td>
                        <td className="px-3 py-3 text-right font-mono text-slate-400">${item.costoCIF}</td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-white">${item.precioEfectivo}</td>
                        <td className="px-3 py-3 text-right font-mono font-bold text-emerald-400">+${item.margenBrutoUnit}</td>

                        <td className="px-3 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold font-mono text-[10px] border ${
                            Number(item.margenPorcentaje) >= 50
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : Number(item.margenPorcentaje) >= 35
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {item.margenPorcentaje}%
                          </span>
                        </td>

                        <td className="px-3 py-3 text-right font-mono text-slate-300">{item.volumenSimulado.toLocaleString()} kits</td>
                        <td className="px-4 py-3 text-right font-mono font-black text-emerald-300 text-sm">
                          ${Math.round(item.utilidadBrutaTotal).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* ========================================================================= */}
        {/* TAB 6: DIRECTORIO DE PROVEEDORES */}
        {/* ========================================================================= */}
        {activeTab === 'proveedores' && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl space-y-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    Directorio Internacional de Proveedores & Fabricantes
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Empresas fabricantes de reactivos y analizadores biomédicos</p>
                </div>

                <div className="flex flex-col gap-1 w-full sm:w-72">
                  <span className="text-[9px] font-mono text-slate-400">Slicer Proveedores:</span>
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchProveedor}
                      onChange={e => setSearchProveedor(e.target.value)}
                      placeholder="Buscar proveedor o país..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400/80">Filtro LIKE: Razón Social, País y Email</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {proveedoresList.map((prov: any) => (
                  <div key={prov.id} className="rounded-2xl bg-slate-950/70 border border-white/[0.06] p-5 shadow-lg flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition duration-300 group">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                          {prov.id}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {prov.pais}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">{prov.nombre}</h4>

                      <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                        {prov.telefono && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-mono text-slate-300">{prov.telefono}</span>
                          </p>
                        )}
                        {prov.email && (
                          <p className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <a href={`mailto:${prov.email}`} className="text-cyan-400 hover:underline truncate">{prov.email}</a>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-semibold">● Proveedor Autorizado</span>
                      <span className="text-[9.5px] font-mono text-slate-500">BD Proveedores</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: FACTURACIÓN DTE */}
        {/* ========================================================================= */}
        {activeTab === 'facturacion' && (
          <div className="space-y-6">
            {/* Visual Analytics Hub for Facturación */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/[0.06] backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Analítica Visual de Facturación Electrónica (DTE)
                  </h3>
                  <p className="text-[11px] text-slate-400">Distribución de comprobantes fiscales digitales por departamento en El Salvador</p>
                </div>
              </div>

              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/[0.06] text-xs font-bold">
                <button
                  onClick={() => setChartModeFacturacion('hybrid')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    chartModeFacturacion === 'hybrid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers3 className="w-3.5 h-3.5" />
                  <span>Vista Híbrida</span>
                </button>
                <button
                  onClick={() => setChartModeFacturacion('bars')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    chartModeFacturacion === 'bars' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Barras</span>
                </button>
                <button
                  onClick={() => setChartModeFacturacion('pie')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    chartModeFacturacion === 'pie' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PieChartIcon className="w-3.5 h-3.5" />
                  <span>Pastel & Donut</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Gráfico Donut de Facturación */}
              {(chartModeFacturacion === 'hybrid' || chartModeFacturacion === 'pie') && (
                <div className={`${chartModeFacturacion === 'pie' ? 'lg:col-span-12' : 'lg:col-span-5'}`}>
                  <NeoChartPieDonut
                    data={pieFacturacionZonas}
                    title="Gráfico Donut: Distribución Territorial DTE"
                    subtitle="Concentración de facturación por zona y departamento"
                    type="donut"
                    centerLabel="Total Facturas"
                    centerValue={`${facturacionData.total_facturas || 128} DTEs`}
                    badge="MH El Salvador"
                    formatValue={v => `${v} DTEs`}
                  />
                </div>
              )}

              {/* Gráfico de Barras Tradicional */}
              {chartModeFacturacion === 'bars' && (
                <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl space-y-5 backdrop-blur-xl">
                  <div className="border-b border-white/[0.06] pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      Distribución Geográfica de Facturación (DTE)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Concentración de facturas por departamento en El Salvador</p>
                    <div className="text-[9.5px] font-mono text-purple-300/80 mt-1.5 flex items-center gap-1">
                      <span className="text-slate-500">Fórmula:</span> COUNT(factura_id) agrupado por departamento
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(facturacionData.distribucion_zonas || {}).map(([zona, count]: any) => {
                      const total = facturacionData.total_facturas || 128
                      const percent = Math.round((count / total) * 100)
                      return (
                        <div key={zona} className="space-y-1 p-2 rounded-2xl bg-slate-950/60 border border-white/[0.04]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{zona}</span>
                            <span className="font-mono text-purple-300 font-bold">{count} facturas ({percent}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/[0.06] flex">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full" style={{ width: `${Math.max(percent, 4)}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Registro Reciente de Facturas Electrónicas */}
              <div className={`${chartModeFacturacion === 'pie' ? 'lg:col-span-12' : 'lg:col-span-7'} rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-2xl space-y-5 backdrop-blur-xl`}>
                <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-emerald-400" />
                      Registro Reciente de Facturas Electrónicas
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Control de correlativos DTE y zonas</p>
                    <div className="text-[9.5px] font-mono text-emerald-300/80 mt-1 flex items-center gap-1">
                      <span className="text-slate-500">Origen:</span> Transmisión oficial DTE - Ministerio de Hacienda (MH)
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    {facturacionData.total_facturas || 128} DTEs
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-white/[0.06]">
                      <tr>
                        <th className="px-3 py-2.5">No. Factura</th>
                        <th className="px-3 py-2.5">Zona / Destino</th>
                        <th className="px-3 py-2.5">Fecha</th>
                        <th className="px-3 py-2.5 text-right">Comprobante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] font-medium">
                      {(facturacionData.ultimas_facturas || []).map((f: any) => (
                        <tr key={f.factura_id} className="hover:bg-white/[0.04]">
                          <td className="px-3 py-2.5 font-mono font-bold text-cyan-300">{f.numero}</td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-white/[0.06] font-semibold text-[11px]">
                              {f.zona}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-400">{f.fecha}</td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                              <FileText className="w-3 h-3" /> PDF DTE
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Crear / Editar Producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-slate-900 border border-white/[0.1] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {editingId ? 'Editar Producto / Equipo' : 'Nuevo Producto / Equipo'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Código SKU *</label>
                  <input
                    type="text"
                    value={formData.codigo_sku}
                    onChange={e => setFormData({ ...formData, codigo_sku: e.target.value })}
                    required
                    placeholder="ej: A00001"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Marca / Fabricante *</label>
                  <select
                    value={formData.marca_id}
                    onChange={e => setFormData({ ...formData, marca_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white focus:border-cyan-500"
                  >
                    <option value="">-- Seleccionar Marca --</option>
                    {marcas.map(m => (
                      <option key={m.marca_id} value={m.marca_id}>{m.nombre_marca}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Oficial del Producto *</label>
                <input
                  type="text"
                  value={formData.nombre_producto_equipo}
                  onChange={e => setFormData({ ...formData, nombre_producto_equipo: e.target.value })}
                  required
                  placeholder="ej: HBsAg (hepatitis B) / Analizador Atellica"
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Presentación / Unidad</label>
                  <input
                    type="text"
                    value={formData.unidad_medida}
                    onChange={e => setFormData({ ...formData, unidad_medida: e.target.value })}
                    placeholder="ej: Kit, Prueba, Caja"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.es_equipo}
                      onChange={e => setFormData({ ...formData, es_equipo: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-white/[0.1]"
                    />
                    <span className="text-xs text-slate-300 font-bold">¿Es Equipo Biomédico?</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descripción Técnica</label>
                <textarea
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={2}
                  placeholder="Especificaciones, temperatura 2-8°C..."
                  className="w-full px-3 py-2 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
