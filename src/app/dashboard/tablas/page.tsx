'use client'

import React, { useState, useEffect, useCallback, Fragment } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Database,
  Building2,
  Users,
  Briefcase,
  Layers,
  Cpu,
  AlertTriangle,
  MapPin,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderKanban,
  ShieldAlert,
  Calendar,
  Sparkles,
  Tag,
  Boxes,
  Truck,
  FileText,
  UserCheck,
  Zap,
  HelpCircle,
  Bookmark,
  PieChart as PieIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import PresionEmailModal from '@/components/PresionEmailModal'
import ExcelUploadModal from '@/components/ExcelUploadModal'
import { dbInsert, dbUpdate, dbDelete, dbSelect } from '@/lib/api_3fn'

// Definition of 21 Tables organized into 4 logical groups
const TABLE_GROUPS = [
  {
    groupName: '1. Catálogos Organizacionales & Clientes',
    badge: 'Maestros',
    tables: [
      { id: 'empresas', name: 'Empresas del Grupo', icon: Building2, desc: 'Entidades jurídicas del grupo (Labandmed, etc.)', primaryKey: 'empresa_id' },
      { id: 'tipos_institucion', name: 'Tipos de Institución', icon: Tag, desc: 'Clasificación de entidades (ISSS, MINSAL, Autónomas)', primaryKey: 'tipo_institucion_id' },
      { id: 'clientes', name: 'Clientes / Instituciones', icon: Building2, desc: 'Catálogo oficial de clientes vinculados a tipo', primaryKey: 'cliente_id' },
      { id: 'areas', name: 'Áreas Organizacionales', icon: Briefcase, desc: 'Departamentos operativos (PM, IT, Aplicaciones, CAST, etc.)', primaryKey: 'area_id' },
      { id: 'personas', name: 'Personas & Colaboradores', icon: Users, desc: 'Equipo de trabajo con área, correo y teléfono', primaryKey: 'persona_id' },
      { id: 'roles', name: 'Roles Operativos / RACI', icon: UserCheck, desc: 'Roles del proceso (EJECUTOR, SUPERVISOR, RESPONSABLE)', primaryKey: 'rol_id' },
      { id: 'estatus', name: 'Catálogo de Estatus', icon: Bookmark, desc: 'Estatus del flujo (PENDIENTE, COMPLETADO, EN PROGRESO, etc.)', primaryKey: 'estatus_id' },
      { id: 'users', name: 'Usuarios del Sistema', icon: Users, desc: 'Cuentas de usuario de la plataforma', primaryKey: 'id' }
    ]
  },
  {
    groupName: '2. Productos, Marcas & Entornos',
    badge: 'Catálogo Técnico',
    tables: [
      { id: 'marcas', name: 'Marcas Comerciales', icon: Tag, desc: 'Marcas de equipos y reactivos representados', primaryKey: 'marca_id' },
      { id: 'productos_equipo', name: 'Productos / Equipos / SKU', icon: Cpu, desc: 'Inventario de analizadores, reactivos y consumibles', primaryKey: 'producto_equipo_id' },
      { id: 'procesos', name: 'Catálogo de Procesos', icon: Layers, desc: 'Nombres de procesos contractuales y técnicos', primaryKey: 'proceso_id' },
      { id: 'tipos_dependiente', name: 'Tipos de Dependencia', icon: Layers, desc: 'Clasificación (Contrato, Visita, Instalación)', primaryKey: 'tipo_dependiente_id' },
      { id: 'ubicaciones', name: 'Ubicaciones Físicas', icon: MapPin, desc: 'Laboratorios, salas y bodegas de entrega', primaryKey: 'ubicacion_id' },
      { id: 'situaciones', name: 'Situaciones / Problemáticas', icon: AlertTriangle, desc: 'Catálogo de contingencias y bloqueos', primaryKey: 'situacion_id' }
    ]
  },
  {
    groupName: '3. Licitaciones, Ofertas & Logística',
    badge: 'Comercial & Entregas',
    tables: [
      { id: 'licitaciones_ofertas', name: 'Ofertas de Licitación', icon: FileText, desc: 'Ofertas comerciales presentadas a instituciones', primaryKey: 'licitacion_oferta_id' },
      { id: 'ofertas_items', name: 'Renglones / Ítems Ofertados', icon: Boxes, desc: 'Detalle de productos ofertados con precios y cantidades', primaryKey: 'oferta_item_id' },
      { id: 'entregas_programadas', name: 'Cronograma de Entregas', icon: Truck, desc: 'Envíos programados por renglón con seguimiento de actas', primaryKey: 'entrega_id' }
    ]
  },
  {
    groupName: '4. Contratos, RACI & Mesa de Ayuda',
    badge: 'Operación & Kardex',
    tables: [
      { id: 'contratos', name: 'Contratos Formalizados', icon: FolderKanban, desc: 'Contratos con fianzas, fechas y montos', primaryKey: 'contrato_id' },
      { id: 'contrato_procesos', name: 'Procesos de Contrato (Numerales)', icon: FileSpreadsheet, desc: 'Obligaciones contractuales por numeral', primaryKey: 'contrato_proceso_id' },
      { id: 'asignaciones_proceso', name: 'Matriz RACI por Proceso', icon: UserCheck, desc: 'Asignación de Ejecutor y Supervisor a cada numeral', primaryKey: 'asignacion_id' },
      { id: 'incidencias_seguimiento', name: 'Mesa de Ayuda / Incidencias', icon: ShieldAlert, desc: 'Kardex de seguimiento de problemáticas operativas', primaryKey: 'incidencia_id' }
    ]
  }
]

// Table column schemas for form rendering
const TABLE_CONFIGS: Record<string, {
  pk: string
  label: string
  fields: { key: string, label: string, type: 'text' | 'number' | 'date' | 'boolean' | 'select', relation?: string, relKey?: string, relLabel?: string, required?: boolean }[]
}> = {
  empresas: {
    pk: 'empresa_id',
    label: 'Empresa',
    fields: [
      { key: 'nombre_empresa', label: 'Nombre de la Empresa', type: 'text', required: true },
      { key: 'abreviatura', label: 'Abreviatura / Código', type: 'text', required: true },
      { key: 'activo', label: 'Activo', type: 'boolean' }
    ]
  },
  tipos_institucion: {
    pk: 'tipo_institucion_id',
    label: 'Tipo de Institución',
    fields: [
      { key: 'codigo', label: 'Código (ej: ISSS, MINSAL)', type: 'text', required: true },
      { key: 'descripcion', label: 'Descripción / Nombre Completo', type: 'text', required: true },
      { key: 'activo', label: 'Activo', type: 'boolean' }
    ]
  },
  clientes: {
    pk: 'cliente_id',
    label: 'Cliente',
    fields: [
      { key: 'nombre_cliente', label: 'Nombre de la Institución / Cliente', type: 'text', required: true },
      { key: 'tipo_institucion_id', label: 'Tipo de Institución', type: 'select', relation: 'tipos_institucion', relKey: 'tipo_institucion_id', relLabel: 'codigo' },
      { key: 'direccion', label: 'Dirección', type: 'text' },
      { key: 'telefono', label: 'Teléfono', type: 'text' },
      { key: 'contacto_nombre', label: 'Nombre del Contacto', type: 'text' },
      { key: 'contacto_email', label: 'Email del Contacto', type: 'text' },
      { key: 'activo', label: 'Activo', type: 'boolean' }
    ]
  },
  areas: {
    pk: 'area_id',
    label: 'Área',
    fields: [
      { key: 'nombre_area', label: 'Nombre del Área / Departamento', type: 'text', required: true },
      { key: 'descripcion', label: 'Descripción de Funciones', type: 'text' },
      { key: 'activo', label: 'Activo', type: 'boolean' }
    ]
  },
  personas: {
    pk: 'persona_id',
    label: 'Persona / Colaborador',
    fields: [
      { key: 'nombre_completo', label: 'Nombre Completo', type: 'text', required: true },
      { key: 'area_id', label: 'Área Perteneciente', type: 'select', relation: 'areas', relKey: 'area_id', relLabel: 'nombre_area', required: true },
      { key: 'email', label: 'Correo Electrónico', type: 'text' },
      { key: 'telefono', label: 'Teléfono / Extensión', type: 'text' },
      { key: 'activo', label: 'Activo', type: 'boolean' }
    ]
  },
  roles: {
    pk: 'rol_id',
    label: 'Rol',
    fields: [
      { key: 'nombre_rol', label: 'Nombre del Rol (ej: EJECUTOR, SUPERVISOR)', type: 'text', required: true }
    ]
  },
  estatus: {
    pk: 'estatus_id',
    label: 'Estatus',
    fields: [
      { key: 'nombre_estatus', label: 'Nombre del Estatus (ej: PENDIENTE, COMPLETADO)', type: 'text', required: true }
    ]
  },
  users: {
    pk: 'id',
    label: 'Usuario',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'apellido', label: 'Apellido', type: 'text' },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'departamento', label: 'Departamento', type: 'text' },
      { key: 'telefono', label: 'Teléfono', type: 'text' },
      { key: 'activo', label: 'Activo', type: 'boolean' }
    ]
  },
  marcas: {
    pk: 'marca_id',
    label: 'Marca',
    fields: [
      { key: 'nombre_marca', label: 'Nombre de la Marca', type: 'text', required: true },
      { key: 'activo', label: 'Activa', type: 'boolean' }
    ]
  },
  productos_equipo: {
    pk: 'producto_equipo_id',
    label: 'Producto / Equipo',
    fields: [
      { key: 'codigo_sku', label: 'Código SKU / Referencia', type: 'text', required: true },
      { key: 'nombre_producto_equipo', label: 'Nombre del Producto o Equipo', type: 'text', required: true },
      { key: 'marca_id', label: 'Marca', type: 'select', relation: 'marcas', relKey: 'marca_id', relLabel: 'nombre_marca' },
      { key: 'es_equipo', label: '¿Es Equipo Biomédico / Analizador?', type: 'boolean' },
      { key: 'unidad_medida', label: 'Unidad de Medida (ej: Kit, Unidad, Prueba)', type: 'text' },
      { key: 'descripcion', label: 'Descripción Técnica', type: 'text' },
      { key: 'activo', label: 'Activo', type: 'boolean' }
    ]
  },
  procesos: {
    pk: 'proceso_id',
    label: 'Proceso',
    fields: [
      { key: 'nombre_proceso', label: 'Nombre del Proceso / Requerimiento', type: 'text', required: true }
    ]
  },
  tipos_dependiente: {
    pk: 'tipo_dependiente_id',
    label: 'Tipo Dependiente',
    fields: [
      { key: 'nombre_tipo', label: 'Nombre del Tipo (ej: Contrato, Visita)', type: 'text', required: true }
    ]
  },
  ubicaciones: {
    pk: 'ubicacion_id',
    label: 'Ubicación',
    fields: [
      { key: 'nombre_ubicacion', label: 'Nombre de Ubicación / Laboratorio', type: 'text', required: true }
    ]
  },
  situaciones: {
    pk: 'situacion_id',
    label: 'Situación / Problemática',
    fields: [
      { key: 'nombre_situacion', label: 'Nombre de la Situación o Bloqueo', type: 'text', required: true }
    ]
  },
  licitaciones_ofertas: {
    pk: 'licitacion_oferta_id',
    label: 'Oferta de Licitación',
    fields: [
      { key: 'numero_oferta', label: 'Número de Oferta / LP', type: 'text', required: true },
      { key: 'nombre_oferta', label: 'Nombre / Título de la Licitación', type: 'text', required: true },
      { key: 'empresa_id', label: 'Empresa Ofertante', type: 'select', relation: 'empresas', relKey: 'empresa_id', relLabel: 'nombre_empresa', required: true },
      { key: 'cliente_id', label: 'Cliente Institucional', type: 'select', relation: 'clientes', relKey: 'cliente_id', relLabel: 'nombre_cliente', required: true },
      { key: 'fecha_presentacion', label: 'Fecha de Presentación', type: 'date', required: true },
      { key: 'mes_presentacion', label: 'Mes de Presentación', type: 'text' },
      { key: 'estatus_id', label: 'Estatus de la Oferta', type: 'select', relation: 'estatus', relKey: 'estatus_id', relLabel: 'nombre_estatus', required: true },
      { key: 'persona_id', label: 'Responsable Comercial', type: 'select', relation: 'personas', relKey: 'persona_id', relLabel: 'nombre_completo' },
      { key: 'observaciones', label: 'Observaciones / Notas', type: 'text' }
    ]
  },
  ofertas_items: {
    pk: 'oferta_item_id',
    label: 'Renglón Ofertado',
    fields: [
      { key: 'licitacion_oferta_id', label: 'Oferta de Licitación', type: 'select', relation: 'licitaciones_ofertas', relKey: 'licitacion_oferta_id', relLabel: 'numero_oferta', required: true },
      { key: 'producto_equipo_id', label: 'Producto / Equipo', type: 'select', relation: 'productos_equipo', relKey: 'producto_equipo_id', relLabel: 'nombre_producto_equipo' },
      { key: 'renglon_numero', label: 'Número de Renglón', type: 'number' },
      { key: 'cantidad', label: 'Cantidad Ofertada', type: 'number', required: true },
      { key: 'precio_unitario', label: 'Precio Unitario ($)', type: 'number', required: true },
      { key: 'precio_total', label: 'Precio Total ($)', type: 'number' },
      { key: 'es_adjudicado', label: '¿Renglón Adjudicado?', type: 'boolean' }
    ]
  },
  entregas_programadas: {
    pk: 'entrega_id',
    label: 'Entrega Programada',
    fields: [
      { key: 'oferta_item_id', label: 'Ítem de Oferta', type: 'select', relation: 'ofertas_items', relKey: 'oferta_item_id', relLabel: 'oferta_item_id', required: true },
      { key: 'numero_entrega', label: 'Número de Entrega (1, 2, 3...)', type: 'number', required: true },
      { key: 'fecha_programada', label: 'Fecha Programada', type: 'date', required: true },
      { key: 'cantidad_programada', label: 'Cantidad Programada', type: 'number', required: true },
      { key: 'estatus_id', label: 'Estatus de Entrega', type: 'select', relation: 'estatus', relKey: 'estatus_id', relLabel: 'nombre_estatus', required: true },
      { key: 'fecha_entrega_real', label: 'Fecha Real Entregada', type: 'date' },
      { key: 'cantidad_entregada_real', label: 'Cantidad Real Entregada', type: 'number' },
      { key: 'numero_acta_recepcion', label: 'No. Acta de Recepción', type: 'text' },
      { key: 'observaciones', label: 'Observaciones', type: 'text' }
    ]
  },
  contratos: {
    pk: 'contrato_id',
    label: 'Contrato',
    fields: [
      { key: 'numero_contrato', label: 'Número de Contrato', type: 'text', required: true },
      { key: 'nombre_contrato', label: 'Nombre / Objeto del Contrato', type: 'text' },
      { key: 'cliente_id', label: 'Cliente Institucional', type: 'select', relation: 'clientes', relKey: 'cliente_id', relLabel: 'nombre_cliente', required: true },
      { key: 'empresa_id', label: 'Empresa Titular', type: 'select', relation: 'empresas', relKey: 'empresa_id', relLabel: 'nombre_empresa', required: true },
      { key: 'licitacion_oferta_id', label: 'Licitación Origen', type: 'select', relation: 'licitaciones_ofertas', relKey: 'licitacion_oferta_id', relLabel: 'numero_oferta' },
      { key: 'fecha_adjudicacion', label: 'Fecha de Adjudicación', type: 'date' },
      { key: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
      { key: 'fecha_fin', label: 'Fecha de Fin / Vencimiento', type: 'date' },
      { key: 'monto_total', label: 'Monto Total Contratado ($)', type: 'number' },
      { key: 'fianza_cumplimiento_estado', label: 'Fianza de Cumplimiento (Estado)', type: 'text' },
      { key: 'fianza_cumplimiento_poliza', label: 'Póliza Fianza Cumplimiento', type: 'text' },
      { key: 'fianza_buena_inversion_estado', label: 'Fianza Buena Inversión (Estado)', type: 'text' },
      { key: 'fianza_buena_inversion_poliza', label: 'Póliza Fianza Buena Inversión', type: 'text' }
    ]
  },
  contrato_procesos: {
    pk: 'contrato_proceso_id',
    label: 'Proceso de Contrato',
    fields: [
      { key: 'contrato_id', label: 'Contrato', type: 'select', relation: 'contratos', relKey: 'contrato_id', relLabel: 'numero_contrato', required: true },
      { key: 'numeral', label: 'Numeral Contractual (ej: 1.1, 2.3)', type: 'text', required: true },
      { key: 'proceso_id', label: 'Proceso / Requerimiento', type: 'select', relation: 'procesos', relKey: 'proceso_id', relLabel: 'nombre_proceso', required: true },
      { key: 'descripcion_solicitado', label: 'Descripción de lo Solicitado', type: 'text' },
      { key: 'producto_equipo_id', label: 'Producto / Equipo Vinculado', type: 'select', relation: 'productos_equipo', relKey: 'producto_equipo_id', relLabel: 'nombre_producto_equipo' },
      { key: 'tipo_dependiente_id', label: 'Tipo Dependiente', type: 'select', relation: 'tipos_dependiente', relKey: 'tipo_dependiente_id', relLabel: 'nombre_tipo' },
      { key: 'fecha_cumplimiento', label: 'Fecha Límite de Cumplimiento', type: 'date' },
      { key: 'estatus_id', label: 'Estatus del Numeral', type: 'select', relation: 'estatus', relKey: 'estatus_id', relLabel: 'nombre_estatus', required: true }
    ]
  },
  asignaciones_proceso: {
    pk: 'asignacion_id',
    label: 'Asignación RACI',
    fields: [
      { key: 'contrato_proceso_id', label: 'Proceso de Contrato', type: 'select', relation: 'contrato_procesos', relKey: 'contrato_proceso_id', relLabel: 'numeral', required: true },
      { key: 'persona_id', label: 'Persona Asignada', type: 'select', relation: 'personas', relKey: 'persona_id', relLabel: 'nombre_completo', required: true },
      { key: 'rol_id', label: 'Rol RACI (Ejecutor/Supervisor)', type: 'select', relation: 'roles', relKey: 'rol_id', relLabel: 'nombre_rol', required: true },
      { key: 'estatus_id', label: 'Estatus de la Asignación', type: 'select', relation: 'estatus', relKey: 'estatus_id', relLabel: 'nombre_estatus', required: true },
      { key: 'comentario', label: 'Comentario / Justificación', type: 'text' }
    ]
  },
  incidencias_seguimiento: {
    pk: 'incidencia_id',
    label: 'Incidencia / Seguimiento',
    fields: [
      { key: 'cliente_id', label: 'Cliente Institucional', type: 'select', relation: 'clientes', relKey: 'cliente_id', relLabel: 'nombre_cliente', required: true },
      { key: 'contrato_id', label: 'Contrato Asociado', type: 'select', relation: 'contratos', relKey: 'contrato_id', relLabel: 'numero_contrato' },
      { key: 'situacion_id', label: 'Situación / Asunto', type: 'select', relation: 'situaciones', relKey: 'situacion_id', relLabel: 'nombre_situacion' },
      { key: 'persona_id', label: 'Técnico / Responsable', type: 'select', relation: 'personas', relKey: 'persona_id', relLabel: 'nombre_completo' },
      { key: 'ubicacion_id', label: 'Ubicación / Laboratorio', type: 'select', relation: 'ubicaciones', relKey: 'ubicacion_id', relLabel: 'nombre_ubicacion' },
      { key: 'fecha_registro', label: 'Fecha de Registro', type: 'date', required: true },
      { key: 'fecha_cumplimiento', label: 'Fecha de Cumplimiento / Límite', type: 'date' },
      { key: 'estatus_id', label: 'Estatus', type: 'select', relation: 'estatus', relKey: 'estatus_id', relLabel: 'nombre_estatus', required: true },
      { key: 'comentario', label: 'Detalle / Comentario de la Falla', type: 'text' }
    ]
  }
}

export default function GestionTablasPage() {
  const supabase = createClient()
  const [selectedTable, setSelectedTable] = useState('empresas')
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Catalogs cache for dropdown relations
  const [relCatalogs, setRelCatalogs] = useState<Record<string, any[]>>({})

  // Modal / Form state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<any>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isRestrictedGerente, setIsRestrictedGerente] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Presion Email Modal state
  const [presionModalOpen, setPresionModalOpen] = useState(false)
  const [selectedTaskForPressure, setSelectedTaskForPressure] = useState<any>(null)

  // Expandable row state for licitaciones_ofertas sub-table
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null)
  const [offerItemsMap, setOfferItemsMap] = useState<Record<string, any[]>>({})
  const [loadingItems, setLoadingItems] = useState(false)

  const toggleExpandOffer = async (offerId: string) => {
    if (expandedOfferId === offerId) {
      setExpandedOfferId(null)
      return
    }
    setExpandedOfferId(offerId)
    if (!offerItemsMap[offerId]) {
      setLoadingItems(true)
      try {
        const { data: items } = await supabase
          .from('ofertas_items')
          .select(`
            *,
            productos_equipo (
              nombre_producto_equipo,
              descripcion,
              marcas (nombre_marca)
            )
          `)
          .eq('licitacion_oferta_id', offerId)
          .order('renglon_numero', { ascending: true })

        setOfferItemsMap(prev => ({ ...prev, [offerId]: items || [] }))
      } catch (err) {
        console.warn('Error fetching items for offer:', err)
      } finally {
        setLoadingItems(false)
      }
    }
  }

  useEffect(() => {
    async function checkUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          const email = user.email.toLowerCase()
          if (email.includes('aaltunaher')) {
            setIsRestrictedGerente(true)
          }
        }
      } catch (err) {
        console.warn('Error checking user role in tablas:', err)
      }
    }
    checkUserRole()
  }, [supabase])

  const config = TABLE_CONFIGS[selectedTable] || {
    pk: 'id',
    label: selectedTable,
    fields: []
  }

  // Load all relation catalogs for dropdowns
  const loadCatalogs = useCallback(async () => {
    const catalogTables = [
      'empresas', 'tipos_institucion', 'clientes', 'areas', 'personas',
      'roles', 'estatus', 'marcas', 'productos_equipo', 'procesos',
      'tipos_dependiente', 'ubicaciones', 'situaciones', 'contratos',
      'licitaciones_ofertas', 'ofertas_items', 'contrato_procesos'
    ]
    const cache: Record<string, any[]> = {}
    for (const t of catalogTables) {
      try {
        const data = await dbSelect(t)
        cache[t] = data || []
      } catch (err) {
        console.warn('Error fetching catalog ' + t, err)
      }
    }
    setRelCatalogs(cache)
  }, [])

  // Load table records
  const loadTableData = useCallback(async (tableId: string) => {
    setLoading(true)
    try {
      const data = await dbSelect(tableId, { limit: 500 })
      setTableData(data || [])
    } catch (err: any) {
      console.error('Error loading ' + tableId, err)
      setNotification({ type: 'error', message: `Error cargando ${tableId}: ${err.message}` })
      setTableData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCatalogs()
  }, [loadCatalogs])

  useEffect(() => {
    loadTableData(selectedTable)
  }, [selectedTable, loadTableData])

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingId(null)
    const initial: Record<string, any> = {}
    config.fields.forEach(f => {
      if (f.type === 'boolean') initial[f.key] = true
      else if (f.type === 'date' && f.key === 'fecha_registro') initial[f.key] = new Date().toISOString().split('T')[0]
      else initial[f.key] = ''
    })
    setFormData(initial)
    setShowModal(true)
  }

  // Open Edit Form
  const handleOpenEdit = (item: any) => {
    setEditingId(item[config.pk])
    const current: Record<string, any> = {}
    config.fields.forEach(f => {
      current[f.key] = item[f.key] !== null && item[f.key] !== undefined ? item[f.key] : ''
    })
    setFormData(current)
    setShowModal(true)
  }

  // Save (Insert or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Record<string, any> = {}
      config.fields.forEach(f => {
        const val = formData[f.key]
        if (f.type === 'number') {
          payload[f.key] = val === '' || val === null ? null : Number(val)
        } else if (f.type === 'boolean') {
          payload[f.key] = Boolean(val)
        } else if (f.type === 'select') {
          payload[f.key] = val === '' || val === null ? null : Number(val)
        } else {
          payload[f.key] = val === '' ? null : val
        }
      })

      if (editingId) {
        // UPDATE VIA BACKEND ADMIN API (BYPASS RLS)
        await dbUpdate(selectedTable, editingId, config.pk, payload)
        setNotification({ type: 'success', message: 'Registro actualizado correctamente' })
      } else {
        // INSERT VIA BACKEND ADMIN API (BYPASS RLS)
        await dbInsert(selectedTable, payload)
        setNotification({ type: 'success', message: 'Nuevo registro guardado con éxito' })
      }

      setShowModal(false)
      loadTableData(selectedTable)
      loadCatalogs()
    } catch (err: any) {
      console.error(err)
      setNotification({ type: 'error', message: `Error al guardar: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  // Delete
  const handleDelete = async (pkValue: any) => {
    if (!confirm(`¿Está seguro de eliminar este registro de ${config.label}?`)) return
    setLoading(true)
    try {
      await dbDelete(selectedTable, pkValue, config.pk)
      setNotification({ type: 'success', message: 'Registro eliminado' })
      loadTableData(selectedTable)
      loadCatalogs()
    } catch (err: any) {
      setNotification({ type: 'error', message: `Error al eliminar: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  // Filtered rows
  const filteredData = tableData.filter(row => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return Object.values(row).some(v => String(v || '').toLowerCase().includes(q))
  })

  // Helper for displaying relation labels
  const getRelationLabel = (field: any, val: any) => {
    if (val === null || val === undefined || val === '') return '-'
    if (!field.relation || !field.relKey || !field.relLabel) return String(val)
    const list = relCatalogs[field.relation] || []
    const match = list.find(item => item[field.relKey] == val)
    return match ? match[field.relLabel] : `#${val}`
  }

  if (isRestrictedGerente) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-16 text-center space-y-6">
        <div className="glass-card p-10 rounded-3xl border border-white/10 shadow-2xl space-y-5 bg-slate-950/80">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Módulo Operativo Restringido</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Tu perfil de <strong className="text-amber-300">Gerente General</strong> está configurado con acceso exclusivo a los <strong>Dashboards Estratégicos y de Obligaciones</strong>.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/obligaciones"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-lg shadow-indigo-600/30"
            >
              <PieIcon className="w-4 h-4" />
              <span>Ir al Dashboard de Obligaciones</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Gestor Integral de Base de Datos • 21 Tablas 3FN</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Gestión y Llenado de Datos Maestros
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Administración centralizada con integridad referencial, dropdowns automáticos y validación completa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { loadTableData(selectedTable); loadCatalogs(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Registro en {config.label}</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-medium border animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* 4 Logical Groups Tab Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {TABLE_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 truncate">{group.groupName}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                {group.badge}
              </span>
            </div>
            <div className="space-y-1 flex-1">
              {group.tables.map(t => {
                const isSelected = selectedTable === t.id
                const IconComponent = t.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTable(t.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-indigo-200 font-bold border border-indigo-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="truncate">{t.name}</span>
                    </div>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Table Content & Search */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Header toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Tabla: <span className="text-indigo-300 font-mono">`{selectedTable}`</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
              {filteredData.length} registros
            </span>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Buscar en ${config.label}...`}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-950/90 backdrop-blur border-b border-slate-800 text-slate-400 font-semibold z-10">
              <tr>
                <th className="p-3 w-16">PK</th>
                {config.fields.map(f => (
                  <th key={f.key} className="p-3 whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="p-3 text-right w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={config.fields.length + 2} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Cargando registros de `{selectedTable}`...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={config.fields.length + 2} className="p-8 text-center text-slate-500">
                    <p className="font-semibold text-slate-400">No hay registros en esta tabla</p>
                    <p className="text-[11px] text-slate-500 mt-1">Haz clic en &quot;Nuevo Registro&quot; para agregar datos.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => {
                  const pkVal = row[config.pk]
                  const isLicitacionesTable = selectedTable === 'licitaciones_ofertas'
                  const isExpanded = expandedOfferId === String(pkVal)
                  const subItems = offerItemsMap[String(pkVal)] || []

                  return (
                    <Fragment key={idx}>
                      <tr className="hover:bg-slate-800/40 transition group">
                        <td className="p-3 font-mono text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                          {isLicitacionesTable && (
                            <button
                              onClick={() => toggleExpandOffer(String(pkVal))}
                              className="p-1 rounded bg-slate-800 hover:bg-indigo-600/30 text-indigo-400 transition"
                              title="Desplegar Renglones Ofertados"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <span>#{pkVal}</span>
                        </td>
                        {config.fields.map(f => {
                          const rawVal = row[f.key]
                          return (
                            <td key={f.key} className="p-3 max-w-xs truncate">
                              {f.type === 'boolean' ? (
                                rawVal ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    🟢 Sí / Adjudicada
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    🔴 No / Perdida
                                  </span>
                                )
                              ) : f.type === 'select' ? (
                                <span className="font-medium text-indigo-300">
                                  {getRelationLabel(f, rawVal)}
                                </span>
                              ) : f.type === 'number' && f.key.includes('precio') ? (
                                <span className="font-mono text-emerald-400 font-semibold">
                                  ${Number(rawVal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                              ) : (
                                <span>{rawVal !== null && rawVal !== undefined && rawVal !== '' ? String(rawVal) : '-'}</span>
                              )}
                            </td>
                          )
                        })}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isLicitacionesTable && (
                              <button
                                onClick={() => toggleExpandOffer(String(pkVal))}
                                className="px-2 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[11px] font-bold transition flex items-center gap-1 border border-indigo-500/30"
                              >
                                {isExpanded ? 'Ocultar Items' : 'Ver Renglones'}
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEdit(row)}
                              title="Editar"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(pkVal)}
                              title="Eliminar"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Sub-tabla Expandible de Renglones / Ítems */}
                      {isLicitacionesTable && isExpanded && (
                        <tr className="bg-slate-950/90 border-b border-indigo-500/30">
                          <td colSpan={config.fields.length + 2} className="p-4 bg-slate-950/60">
                            <div className="space-y-3 p-3 bg-slate-900/90 rounded-2xl border border-indigo-500/30 shadow-inner">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                                  <Boxes className="w-4 h-4 text-indigo-400" />
                                  Detalle de Renglones Ofertados (Oferta #{pkVal}: {row.numero_oferta})
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 font-mono">
                                  {subItems.length} renglones registrados
                                </span>
                              </div>

                              {loadingItems ? (
                                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                                  <span>Cargando renglones del servidor...</span>
                                </div>
                              ) : subItems.length === 0 ? (
                                <p className="text-xs text-slate-500 italic p-2">No se encontraron renglones registrados para esta oferta.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                      <tr>
                                        <th className="p-2">Renglón</th>
                                        <th className="p-2">Producto Ofertado</th>
                                        <th className="p-2">Marca</th>
                                        <th className="p-2 text-right">Cantidad</th>
                                        <th className="p-2 text-right">P. Unitario</th>
                                        <th className="p-2 text-right">Total Ofertado</th>
                                        <th className="p-2 text-center">Estado Renglón</th>
                                        <th className="p-2">Ganador / Competencia</th>
                                        <th className="p-2">Contrato / Detalle</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                      {subItems.map((item, itemIdx) => {
                                        const prodName = item.productos_equipo?.nombre_producto_equipo || 'Producto'
                                        const brandName = item.productos_equipo?.marcas?.nombre_marca || 'N/A'
                                        const desc = item.productos_equipo?.descripcion || ''

                                        const isDesierta = desc.toLowerCase().includes('desierta')
                                        const isAdjudicada = Boolean(item.es_adjudicado)
                                        const isPerdida = !isAdjudicada && !isDesierta

                                        // Parse adjudicated info from description string
                                        let adjWinner = 'N/A'
                                        let adjPrice = '-'
                                        let contratoNum = '-'

                                        const adjMatch = desc.match(/Adjudicado:\s*([^($]+)(?:\(\$([^)]+)\))?/)
                                        if (adjMatch) {
                                          adjWinner = adjMatch[1].trim()
                                          if (adjMatch[2]) adjPrice = `$${adjMatch[2].trim()}`
                                        }

                                        const contractMatch = desc.match(/Contrato:\s*([^|]+)/)
                                        if (contractMatch) contratoNum = contractMatch[1].trim()

                                        const totalOfertado = (Number(item.cantidad || 0) * Number(item.precio_unitario || 0))

                                        return (
                                          <tr key={itemIdx} className="hover:bg-slate-800/60 transition">
                                            <td className="p-2 font-mono font-bold text-slate-400">
                                              #{item.renglon_numero || itemIdx + 1}
                                            </td>
                                            <td className="p-2 font-bold text-white max-w-xs truncate">
                                              {prodName}
                                            </td>
                                            <td className="p-2 font-semibold text-indigo-300">
                                              {brandName}
                                            </td>
                                            <td className="p-2 text-right font-mono">
                                              {Number(item.cantidad || 0).toLocaleString()}
                                            </td>
                                            <td className="p-2 text-right font-mono text-emerald-300">
                                              ${Number(item.precio_unitario || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-2 text-right font-mono text-emerald-400 font-bold">
                                              ${totalOfertado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-2 text-center">
                                              {isAdjudicada ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                  🟢 ADJUDICADA
                                                </span>
                                              ) : isDesierta ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                  🟡 DESIERTA
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                                  🔴 PERDIDA
                                                </span>
                                              )}
                                            </td>
                                            <td className="p-2">
                                              {isPerdida ? (
                                                <span className="text-rose-300 font-medium">
                                                  {adjWinner} {adjPrice !== '-' ? `(${adjPrice})` : ''}
                                                </span>
                                              ) : isAdjudicada ? (
                                                <span className="text-emerald-300 font-semibold">LABYMED</span>
                                              ) : (
                                                <span className="text-amber-300 font-medium">Sin Adjudicatario</span>
                                              )}
                                            </td>
                                            <td className="p-2 text-slate-400 font-mono text-[10px] truncate max-w-xs">
                                              {contratoNum !== '-' ? contratoNum : desc.slice(0, 50)}
                                            </td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form for Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingId ? `Editar ${config.label} (#${editingId})` : `Nuevo ${config.label}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">Tabla `{selectedTable}`</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
              {config.fields.map(f => {
                const val = formData[f.key]
                return (
                  <div key={f.key} className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      {f.label} {f.required && <span className="text-rose-400">*</span>}
                    </label>

                    {f.type === 'select' ? (
                      <select
                        value={val || ''}
                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        required={f.required}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                      >
                        <option value="">-- Seleccionar {f.label} --</option>
                        {(relCatalogs[f.relation || ''] || []).map(item => {
                          const relKeyVal = item[f.relKey || 'id']
                          const relLabelVal = item[f.relLabel || 'nombre']
                          return (
                            <option key={relKeyVal} value={relKeyVal}>
                              {relLabelVal} (#{relKeyVal})
                            </option>
                          )
                        })}
                      </select>
                    ) : f.type === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={e => setFormData({ ...formData, [f.key]: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-0"
                        />
                        <span className="text-xs text-slate-300">Habilitado / Activo</span>
                      </label>
                    ) : f.type === 'date' ? (
                      <input
                        type="date"
                        value={val || ''}
                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        required={f.required}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                      />
                    ) : f.type === 'number' ? (
                      <input
                        type="number"
                        step="any"
                        value={val || ''}
                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        required={f.required}
                        placeholder={`Ingresar ${f.label}...`}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                      />
                    ) : (
                      <input
                        type="text"
                        value={val || ''}
                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        required={f.required}
                        placeholder={`Ingresar ${f.label}...`}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                      />
                    )}
                  </div>
                )
              })}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pressure Email Modal */}
      {selectedTaskForPressure && (
        <PresionEmailModal
          isOpen={presionModalOpen}
          onClose={() => setPresionModalOpen(false)}
          task={selectedTaskForPressure}
        />
      )}
    </div>
  )
}
