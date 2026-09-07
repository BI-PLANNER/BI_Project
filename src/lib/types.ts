// ============================================================
// TIPOS TYPESCRIPT PARA EL MODELO SUPABASE (21 TABLAS + 5 VISTAS)
// ============================================================

// --- 1. CATÁLOGOS BASE & ORGANIZACIÓN ---
export interface Empresa {
  empresa_id: number
  nombre_empresa: string
  abreviatura: string
  activo?: boolean
  creado_en?: string
}

export interface TipoInstitucion {
  tipo_institucion_id: number
  codigo: string
  descripcion: string
  activo?: boolean
}

export interface Cliente {
  cliente_id: number
  tipo_institucion_id?: number | null
  nombre_cliente: string
  direccion?: string | null
  telefono?: string | null
  contacto_nombre?: string | null
  contacto_email?: string | null
  activo?: boolean
  creado_en?: string
  // Joins
  tipo_institucion?: TipoInstitucion
}

export interface Area {
  area_id: number
  nombre_area: string
  descripcion?: string | null
  activo?: boolean
}

export interface Persona {
  persona_id: number
  area_id: number
  nombre_completo: string
  email?: string | null
  telefono?: string | null
  activo?: boolean
  creado_en?: string
  // Joins
  area?: Area
}

export interface Rol {
  rol_id: number
  nombre_rol: string
}

export interface Estatus {
  estatus_id: number
  nombre_estatus: string
}

export interface UserAuth {
  id: string
  email: string
  nombre: string
  apellido?: string | null
  rol_id?: string | null
  departamento?: string | null
  telefono?: string | null
  avatar_url?: string | null
  activo: boolean
  created_at?: string
  updated_at?: string
}

// --- 2. PRODUCTOS, MARCAS & ENTORNOS ---
export interface Marca {
  marca_id: number
  nombre_marca: string
  activo?: boolean
}

export interface ProductoEquipo {
  producto_equipo_id: number
  marca_id?: number | null
  codigo_sku: string
  nombre_producto_equipo: string
  descripcion?: string | null
  es_equipo: boolean
  unidad_medida?: string | null
  activo?: boolean
  creado_en?: string
  // Joins
  marca?: Marca
}

export interface Proceso {
  proceso_id: number
  nombre_proceso: string
}

export interface TipoDependiente {
  tipo_dependiente_id: number
  nombre_tipo: string
}

export interface Ubicacion {
  ubicacion_id: number
  nombre_ubicacion: string
}

export interface Situacion {
  situacion_id: number
  nombre_situacion: string
}

// --- 3. COMERCIAL, LICITACIONES & ENTREGAS ---
export interface LicitacionOferta {
  licitacion_oferta_id: number
  numero_oferta: string
  nombre_oferta: string
  empresa_id: number
  cliente_id: number
  fecha_presentacion: string
  mes_presentacion?: string | null
  estatus_id: number
  persona_id?: number | null
  observaciones?: string | null
  creado_en?: string
  actualizado_en?: string
  // Joins
  empresa?: Empresa
  cliente?: Cliente
  estatus?: Estatus
  responsable?: Persona
  items?: OfertaItem[]
}

export interface OfertaItem {
  oferta_item_id: number
  licitacion_oferta_id: number
  producto_equipo_id?: number | null
  renglon_numero?: number | null
  cantidad: number
  precio_unitario: number
  precio_total?: number
  es_adjudicado?: boolean
  creado_en?: string
  // Joins
  licitacion_oferta?: LicitacionOferta
  producto_equipo?: ProductoEquipo
  entregas?: EntregaProgramada[]
}

export interface EntregaProgramada {
  entrega_id: number
  oferta_item_id: number
  numero_entrega: number
  fecha_programada: string
  cantidad_programada: number
  estatus_id: number
  fecha_entrega_real?: string | null
  cantidad_entregada_real?: number | null
  numero_acta_recepcion?: string | null
  observaciones?: string | null
  creado_en?: string
  actualizado_en?: string
  // Joins
  oferta_item?: OfertaItem
  estatus?: Estatus
}

// --- 4. CONTRATOS, PROCESOS, RACI & INCIDENCIAS ---
export interface Contrato {
  contrato_id: number
  licitacion_oferta_id?: number | null
  cliente_id: number
  empresa_id: number
  numero_contrato: string
  nombre_contrato?: string | null
  fecha_adjudicacion?: string | null
  fecha_inicio?: string | null
  fecha_fin?: string | null
  monto_total?: number | null
  fianza_cumplimiento_estado?: string | null
  fianza_cumplimiento_poliza?: string | null
  fianza_buena_inversion_estado?: string | null
  fianza_buena_inversion_poliza?: string | null
  creado_en?: string
  actualizado_en?: string
  // Joins
  cliente?: Cliente
  empresa?: Empresa
  licitacion_oferta?: LicitacionOferta
  procesos?: ContratoProceso[]
  incidencias?: IncidenciaSeguimiento[]
}

export interface ContratoProceso {
  contrato_proceso_id: number
  contrato_id: number
  proceso_id: number
  numeral: string
  descripcion_solicitado?: string | null
  producto_equipo_id?: number | null
  tipo_dependiente_id?: number | null
  fecha_cumplimiento?: string | null
  estatus_id: number
  creado_en?: string
  // Joins
  contrato?: Contrato
  proceso?: Proceso
  producto_equipo?: ProductoEquipo
  tipo_dependiente?: TipoDependiente
  estatus?: Estatus
  asignaciones?: AsignacionProceso[]
}

export interface AsignacionProceso {
  asignacion_id: number
  contrato_proceso_id: number
  persona_id: number
  rol_id: number
  estatus_id: number
  comentario?: string | null
  fecha_asignacion?: string
  // Joins
  contrato_proceso?: ContratoProceso
  persona?: Persona
  rol?: Rol
  estatus?: Estatus
}

export interface IncidenciaSeguimiento {
  incidencia_id: number
  cliente_id: number
  contrato_id?: number | null
  situacion_id?: number | null
  persona_id?: number | null
  ubicacion_id?: number | null
  estatus_id: number
  fecha_registro: string
  fecha_cumplimiento?: string | null
  comentario?: string | null
  creado_en?: string
  actualizado_en?: string
  // Joins
  cliente?: Cliente
  contrato?: Contrato
  situacion?: Situacion
  persona?: Persona
  ubicacion?: Ubicacion
  estatus?: Estatus
}

// --- 5. VISTAS SQL ---
export interface VLicitacionesResumen {
  licitacion_oferta_id: number
  mes_presentacion?: string
  nombre_empresa?: string
  tipo_institucion?: string
  nombre_cliente?: string
  numero_oferta: string
  nombre_oferta?: string
  fecha_presentacion?: string
  codigo_sku?: string
  producto?: string
  marca?: string
  precio_unitario?: number
  cantidad?: number
  precio_total?: number
  estatus_oferta?: string
  numero_contrato?: string
  fecha_adjudicacion?: string
  fecha_inicio_contrato?: string
  fianza_1?: string
  fianza_2?: string
  responsable_comercial?: string
}

export interface VKPIsEfectividadComercial {
  nombre_empresa: string
  sector?: string
  total_ofertas_presentadas: number
  ofertas_adjudicadas: number
  ofertas_perdidas: number
  tasa_adjudicacion_pct: number
  monto_total_ofertado: number
  monto_total_adjudicado: number
}

export interface VMatrizRACIContrato {
  numero_contrato: string
  nombre_cliente: string
  numeral: string
  nombre_proceso: string
  descripcion_solicitado?: string
  producto_asociado?: string
  tipo_dependiente?: string
  fecha_cumplimiento?: string
  estatus_proceso: string
  persona_asignada?: string
  nombre_area?: string
  rol_raci?: string
  estatus_asignacion?: string
  comentario?: string
}

export interface VCronogramaEntregasPendientes {
  entrega_id: number
  numero_contrato?: string
  nombre_cliente?: string
  codigo_sku?: string
  producto?: string
  marca?: string
  numero_entrega: number
  fecha_programada: string
  cantidad_programada: number
  estado_entrega: string
  fecha_entrega_real?: string
  cantidad_entregada_real?: number
  dias_para_entrega?: number
  semaforo_logistico?: 'Verde' | 'Anaranjado' | 'Rojo' | string
}

export interface VMesaAyudaIncidencias {
  incidencia_id: number
  nombre_cliente: string
  numero_contrato?: string
  asunto_falla?: string
  lugar_laboratorio?: string
  tecnico_responsable?: string
  area_responsable?: string
  estado_incidencia: string
  fecha_registro: string
  fecha_cumplimiento?: string
  comentario?: string
}

// --- Helpers Visuales y Colores ---
export const SEMAFORO_COLORS = {
  Verde: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  Anaranjado: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' },
  Rojo: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' },
} as const

// --- Tipos de Compatibilidad para Contratos y Proyectos ---
export type EstadoMilestone = 'Pendiente' | 'En Proceso' | 'Completado' | 'Bloqueado' | string
export type EstadoProyecto = 'Planificacion' | 'En Ejecucion' | 'Finalizado' | 'Cancelado' | string

export interface User {
  id?: string | number
  nombre?: string
  apellido?: string
  name?: string
  email?: string
  role?: string
  rol?: string
  roles?: any
  avatar_url?: string
  [key: string]: any
}

export interface MilestoneContrato {
  id?: string | number
  milestone_id?: string | number
  nombre?: string
  titulo?: string
  estado?: EstadoMilestone
  fecha_limite?: string | null
  responsable?: string
  comentarios?: string | null
  [key: string]: any
}

export interface Project {
  id?: string | number
  nombre?: string
  codigo?: string
  cliente?: string
  estado?: EstadoProyecto
  [key: string]: any
}

