import { supabase } from './supabase/client'
import type {
  Empresa,
  TipoInstitucion,
  Cliente,
  Area,
  Persona,
  Rol,
  Estatus,
  Marca,
  ProductoEquipo,
  Proceso,
  TipoDependiente,
  Ubicacion,
  Situacion,
  LicitacionOferta,
  OfertaItem,
  EntregaProgramada,
  Contrato,
  ContratoProceso,
  AsignacionProceso,
  IncidenciaSeguimiento,
  VLicitacionesResumen,
  VKPIsEfectividadComercial,
  VMatrizRACIContrato,
  VCronogramaEntregasPendientes,
  VMesaAyudaIncidencias
} from './types'

// ============================================================
// MUTACIONES SEGURAS (BYPASS RLS VIA API BACKEND)
// ============================================================

export async function dbInsert(table: string, payload: Record<string, any>) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'insert', table, payload })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al insertar en la base de datos')
  return data.data
}

export async function dbUpdate(table: string, id: any, pk: string, payload: Record<string, any>) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', table, id, pk, payload })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al actualizar en la base de datos')
  return data.data
}

export async function dbDelete(table: string, id: any, pk: string) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', table, id, pk })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al eliminar en la base de datos')
  return data
}

export async function dbSelect(table: string, options: { select?: string, limit?: number, order?: string, ascending?: boolean } = {}) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'select', table, ...options })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al consultar la tabla ' + table)
  return data.data || []
}

// ============================================================
// CONSULTAS DE CATÁLOGOS BASE
// ============================================================

export async function fetchEmpresas(): Promise<Empresa[]> {
  const { data, error } = await supabase.from('empresas').select('*').order('nombre_empresa')
  if (error) console.error('Error fetching empresas:', error.message)
  return data || []
}

export async function fetchTiposInstitucion(): Promise<TipoInstitucion[]> {
  const { data, error } = await supabase.from('tipos_institucion').select('*').order('codigo')
  if (error) console.error('Error fetching tipos_institucion:', error.message)
  return data || []
}

export async function fetchClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase.from('clientes').select('*, tipo_institucion:tipos_institucion(*)').order('nombre_cliente')
  if (error) console.error('Error fetching clientes:', error.message)
  return data || []
}

export async function fetchAreas(): Promise<Area[]> {
  const { data, error } = await supabase.from('areas').select('*').order('nombre_area')
  if (error) console.error('Error fetching areas:', error.message)
  return data || []
}

export async function fetchPersonas(): Promise<Persona[]> {
  const { data, error } = await supabase.from('personas').select('*, area:areas(*)').order('nombre_completo')
  if (error) console.error('Error fetching personas:', error.message)
  return data || []
}

export async function fetchRoles(): Promise<Rol[]> {
  const { data, error } = await supabase.from('roles').select('*').order('nombre_rol')
  if (error) console.error('Error fetching roles:', error.message)
  return data || []
}

export async function fetchEstatus(): Promise<Estatus[]> {
  const { data, error } = await supabase.from('estatus').select('*').order('nombre_estatus')
  if (error) console.error('Error fetching estatus:', error.message)
  return data || []
}

export async function fetchMarcas(): Promise<Marca[]> {
  const { data, error } = await supabase.from('marcas').select('*').order('nombre_marca')
  if (error) console.error('Error fetching marcas:', error.message)
  return data || []
}

export async function fetchProductosEquipo(): Promise<ProductoEquipo[]> {
  const { data, error } = await supabase.from('productos_equipo').select('*, marca:marcas(*)').order('nombre_producto_equipo')
  if (error) console.error('Error fetching productos_equipo:', error.message)
  return data || []
}

export async function fetchProcesos(): Promise<Proceso[]> {
  const { data, error } = await supabase.from('procesos').select('*').order('nombre_proceso')
  if (error) console.error('Error fetching procesos:', error.message)
  return data || []
}

export async function fetchTiposDependiente(): Promise<TipoDependiente[]> {
  const { data, error } = await supabase.from('tipos_dependiente').select('*').order('nombre_tipo')
  if (error) console.error('Error fetching tipos_dependiente:', error.message)
  return data || []
}

export async function fetchUbicaciones(): Promise<Ubicacion[]> {
  const { data, error } = await supabase.from('ubicaciones').select('*').order('nombre_ubicacion')
  if (error) console.error('Error fetching ubicaciones:', error.message)
  return data || []
}

export async function fetchSituaciones(): Promise<Situacion[]> {
  const { data, error } = await supabase.from('situaciones').select('*').order('nombre_situacion')
  if (error) console.error('Error fetching situaciones:', error.message)
  return data || []
}

// ============================================================
// CONSULTAS TRANSACCIONALES
// ============================================================

export async function fetchLicitaciones(): Promise<LicitacionOferta[]> {
  const { data, error } = await supabase
    .from('licitaciones_ofertas')
    .select(`
      *,
      empresa:empresas(*),
      cliente:clientes(*),
      estatus:estatus(*),
      responsable:personas(*),
      items:ofertas_items(*, producto_equipo:productos_equipo(*))
    `)
    .order('fecha_presentacion', { ascending: false })
  if (error) console.error('Error fetching licitaciones:', error.message)
  return data || []
}

export async function fetchContratos(): Promise<Contrato[]> {
  const { data, error } = await supabase
    .from('contratos')
    .select(`
      *,
      cliente:clientes(*),
      empresa:empresas(*),
      licitacion_oferta:licitaciones_ofertas(*),
      procesos:contrato_procesos(
        *,
        proceso:procesos(*),
        producto_equipo:productos_equipo(*),
        tipo_dependiente:tipos_dependiente(*),
        estatus:estatus(*),
        asignaciones:asignaciones_proceso(*, persona:personas(*), rol:roles(*), estatus:estatus(*))
      )
    `)
    .order('contrato_id', { ascending: true })
  if (error) console.error('Error fetching contratos:', error.message)
  return data || []
}

export async function fetchIncidencias(): Promise<IncidenciaSeguimiento[]> {
  const { data, error } = await supabase
    .from('incidencias_seguimiento')
    .select(`
      *,
      cliente:clientes(*),
      contrato:contratos(*),
      situacion:situaciones(*),
      persona:personas(*, area:areas(*)),
      ubicacion:ubicaciones(*),
      estatus:estatus(*)
    `)
    .order('fecha_cumplimiento', { ascending: true })
  if (error) console.error('Error fetching incidencias:', error.message)
  return data || []
}

export async function fetchEntregasProgramadas(): Promise<EntregaProgramada[]> {
  const { data, error } = await supabase
    .from('entregas_programadas')
    .select(`
      *,
      estatus:estatus(*),
      oferta_item:ofertas_items(*, producto_equipo:productos_equipo(*), licitacion_oferta:licitaciones_ofertas(*))
    `)
    .order('fecha_programada', { ascending: true })
  if (error) console.error('Error fetching entregas:', error.message)
  return data || []
}

// ============================================================
// CONSULTAS DE VISTAS SQL
// ============================================================

export async function fetchVLicitacionesResumen(): Promise<VLicitacionesResumen[]> {
  const { data, error } = await supabase.from('v_licitaciones_resumen').select('*')
  if (error) console.error('Error fetching v_licitaciones_resumen:', error.message)
  return data || []
}

export async function fetchVKPIsEfectividad(): Promise<VKPIsEfectividadComercial[]> {
  const { data, error } = await supabase.from('v_kpis_efectividad_comercial').select('*')
  if (error) console.error('Error fetching v_kpis_efectividad_comercial:', error.message)
  return data || []
}

export async function fetchVMatrizRACI(): Promise<VMatrizRACIContrato[]> {
  const { data, error } = await supabase.from('v_matriz_raci_contrato').select('*')
  if (error) console.error('Error fetching v_matriz_raci_contrato:', error.message)
  return data || []
}

export async function fetchVCronogramaEntregas(): Promise<VCronogramaEntregasPendientes[]> {
  const { data, error } = await supabase.from('v_cronograma_entregas_pendientes').select('*')
  if (error) console.error('Error fetching v_cronograma_entregas_pendientes:', error.message)
  return data || []
}

export async function fetchVMesaAyuda(): Promise<VMesaAyudaIncidencias[]> {
  const { data, error } = await supabase.from('v_mesa_ayuda_incidencias').select('*')
  if (error) console.error('Error fetching v_mesa_ayuda_incidencias:', error.message)
  return data || []
}

// ============================================================
// HELPERS DE SEMÁFORO
// ============================================================
export function calcularSemaforoFecha(fechaStr?: string | null): {
  color: 'Verde' | 'Anaranjado' | 'Rojo' | 'Gris'
  dias: number
  label: string
} {
  if (!fechaStr) {
    return { color: 'Gris', dias: 0, label: 'Sin fecha' }
  }
  const target = new Date(fechaStr)
  const hoy = new Date()
  const diffTime = target.getTime() - hoy.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 7) {
    return { color: 'Rojo', dias: diffDays, label: `${diffDays <= 0 ? 'Vencido (' + Math.abs(diffDays) + 'd)' : 'Urgente (' + diffDays + 'd)'}` }
  }
  if (diffDays <= 14) {
    return { color: 'Anaranjado', dias: diffDays, label: `Próximo (${diffDays}d)` }
  }
  return { color: 'Verde', dias: diffDays, label: `A tiempo (${diffDays}d)` }
}
