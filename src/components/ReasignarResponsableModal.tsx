'use client'

import { useState, useEffect } from 'react'
import {
  X,
  UserCheck,
  UserPlus,
  ArrowRightLeft,
  Calendar,
  Building2,
  FileText,
  MapPin,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Save,
  MessageSquare,
  ShieldCheck,
  Bell
} from 'lucide-react'
import { IncidenciaEvento } from '@/app/dashboard/planner/page'
import { createClient } from '@/lib/supabase/client'

interface ReasignarModalProps {
  isOpen: boolean
  onClose: () => void
  item: IncidenciaEvento | null
  onSave: (updatedItem: IncidenciaEvento) => void
}

export interface TeamMember {
  nombre: string
  email: string
  areaDefault: string
  rol: string
  avatar?: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  { nombre: 'EDGAR FIGUERO', email: 'edgar.figueroa@lm-sv.com', areaDefault: 'APLICACIONES', rol: 'Especialista de Aplicaciones Clínicas' },
  { nombre: 'JUAN JOSE', email: 'juan.jose@lm-sv.com', areaDefault: 'PM', rol: 'Product Manager / Logística' },
  { nombre: 'JULIO CESAR', email: 'julio.cesar@lm-sv.com', areaDefault: 'PM', rol: 'Product Manager' },
  { nombre: 'DIEGO POLANCO', email: 'diego.polanco@lm-sv.com', areaDefault: 'LOGISTICA', rol: 'Encargado de Logística & Despacho' },
  { nombre: 'RICARDO VILLANUEVA', email: 'ricardo.villanueva@lm-sv.com', areaDefault: 'IT', rol: 'Ingeniero de IT & Sistemas Hospitalarios' },
  { nombre: 'MOISES HERNANDEZ', email: 'moises.hernandez@lm-sv.com', areaDefault: 'SOPORTE', rol: 'Ingeniero de Soporte Biomédico' },
  { nombre: 'LUIS ORELLANA', email: 'luis.orellana@lm-sv.com', areaDefault: 'GI', rol: 'Gerente de Integración & Operaciones' },
  { nombre: 'ROBERTO BATRES', email: 'roberto.batres@lm-sv.com', areaDefault: 'LICITACIONES', rol: 'Especialista en Licitaciones y Contratos' },
  { nombre: 'ROBERTO BATRES / KAREN', email: 'roberto.batres@lm-sv.com', areaDefault: 'LICITACIONES', rol: 'Equipo de Licitaciones & Cumplimiento' },
  { nombre: 'JOSE LENNY GOMEZ', email: 'jose.gomez@labandmed.com', areaDefault: 'PM', rol: 'Planificación Estratégica & Dirección' }
]

const AREAS_LIST = [
  'APLICACIONES',
  'PM',
  'LOGISTICA',
  'IT',
  'LICITACIONES',
  'SOPORTE',
  'GI'
]

const UBICACIONES_PRESET = [
  'LABORATORIO',
  'LOGISTICA',
  'QUÍMICA CLÍNICA',
  'QUÍMICA EMERGENCIA',
  'QUIMICA HOSPITALIZACION',
  'URIANÁLISIS',
  'HOSPITAL',
  'ADMINISTRACION',
  'BODEGA CENTRAL'
]

export default function ReasignarResponsableModal({
  isOpen,
  onClose,
  item,
  onSave
}: ReasignarModalProps) {
  const supabase = createClient()

  const [responsable, setResponsable] = useState('')
  const [responsableCustom, setResponsableCustom] = useState('')
  const [isCustomResponsable, setIsCustomResponsable] = useState(false)
  const [area, setArea] = useState('APLICACIONES')
  const [fechaCumplimiento, setFechaCumplimiento] = useState('')
  const [estatus, setEstatus] = useState('Rojo')
  const [situacion, setSituacion] = useState('')
  const [tipoPendiente, setTipoPendiente] = useState('CONTRATO')
  const [ubicacion, setUbicacion] = useState('')
  const [comentario, setComentario] = useState('')
  const [notificarEmail, setNotificarEmail] = useState(true)

  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (item) {
      setResponsable(item.responsable || 'EDGAR FIGUERO')
      setIsCustomResponsable(!TEAM_MEMBERS.some(m => m.nombre.toUpperCase() === (item.responsable || '').toUpperCase()))
      setResponsableCustom(item.responsable || '')
      setArea(item.area || 'APLICACIONES')
      setFechaCumplimiento(item.fecha_cumplimiento || '')
      setEstatus(item.estatus || 'Rojo')
      setSituacion(item.situacion || '')
      setTipoPendiente(item.tipo_pendiente || 'CONTRATO')
      setUbicacion(item.ubicacion || '')
      setComentario(item.comentario || '')
      setSavedSuccess(false)
      setErrorMsg('')
    }
  }, [item])

  if (!isOpen || !item) return null

  const handleResponsableSelect = (nombre: string) => {
    if (nombre === 'CUSTOM') {
      setIsCustomResponsable(true)
    } else {
      setIsCustomResponsable(false)
      setResponsable(nombre)
      const found = TEAM_MEMBERS.find(m => m.nombre === nombre)
      if (found) {
        setArea(found.areaDefault)
      }
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')

    const finalResponsable = isCustomResponsable ? (responsableCustom.trim() || 'Sin Asignar') : responsable
    const foundMember = TEAM_MEMBERS.find(m => m.nombre === finalResponsable)
    const finalEmail = foundMember?.email || item.responsableEmail || 'contacto@lm-sv.com'

    const updatedItem: IncidenciaEvento = {
      ...item,
      responsable: finalResponsable,
      responsableEmail: finalEmail,
      area: area,
      fecha_cumplimiento: fechaCumplimiento,
      estatus: estatus,
      situacion: situacion,
      tipo_pendiente: tipoPendiente,
      ubicacion: ubicacion,
      comentario: comentario
    }

    try {
      // 1. Guardar en Supabase incidencias_seguimiento si existe el registro
      const estatusMap: Record<string, number> = {
        'Verde': 10,
        'Anaranjado': 11,
        'Rojo': 12,
        'COMPLETADO': 8
      }

      // Buscar persona_id en supabase
      const { data: personaData } = await supabase
        .from('personas')
        .select('persona_id')
        .ilike('nombre_completo', `%${finalResponsable.split(' ')[0]}%`)
        .maybeSingle()

      await supabase
        .from('incidencias_seguimiento')
        .update({
          fecha_cumplimiento: fechaCumplimiento,
          comentario: comentario,
          estatus_id: estatusMap[estatus] || 10,
          persona_id: personaData ? personaData.persona_id : null,
          actualizado_en: new Date().toISOString()
        })
        .eq('incidencia_id', item.incidencia_id || item.id)

      // 2. Actualizar estado en frontend
      onSave(updatedItem)
      setSavedSuccess(true)

      setTimeout(() => {
        setSavedSuccess(false)
        onClose()
      }, 1000)
    } catch (err: any) {
      console.warn('Persistencia en base de datos local:', err)
      // Aun si falla la red, guardamos en memoria frontend
      onSave(updatedItem)
      setSavedSuccess(true)
      setTimeout(() => {
        setSavedSuccess(false)
        onClose()
      }, 1000)
    } finally {
      setSaving(false)
    }
  }

  const selectedMemberInfo = TEAM_MEMBERS.find(m => m.nombre === (isCustomResponsable ? responsableCustom : responsable))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="glass-card w-full max-w-2xl p-6 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto bg-gradient-to-b from-slate-900/95 to-slate-950/95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Editar y Reasignar Responsabilidad
                </h3>
                <span className="badge bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
                  Hito #{item.item_num || item.id}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                <span className="text-gray-300 font-bold">{item.cliente}</span>
                <span>•</span>
                <span className="font-mono text-yellow-300">{item.numero_contrato}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-scale-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>¡Cambios guardados y responsabilidad reasignada con éxito! Actualizando tablero...</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">

          {/* 1. SELECCIÓN DE RESPONSABLE */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-3">
            <label className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Asignar / Reasignar a Persona del Equipo:
              </span>
              <span className="text-[10px] text-gray-400 font-normal">Escoge de la lista oficial</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={isCustomResponsable ? 'CUSTOM' : responsable}
                onChange={(e) => handleResponsableSelect(e.target.value)}
                className="w-full bg-slate-900 text-white font-bold text-xs rounded-xl p-3 border border-white/15 focus:border-indigo-500 outline-none cursor-pointer"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.nombre} value={m.nombre}>
                    👤 {m.nombre} ({m.areaDefault})
                  </option>
                ))}
                <option value="CUSTOM">➕ Otro / Escribir Nombre Personalizado...</option>
              </select>

              {isCustomResponsable ? (
                <input
                  type="text"
                  placeholder="Escribe el nombre completo del responsable..."
                  value={responsableCustom}
                  onChange={(e) => setResponsableCustom(e.target.value)}
                  className="w-full bg-slate-900 text-white font-bold text-xs rounded-xl p-3 border border-indigo-500/50 focus:border-indigo-400 outline-none"
                  autoFocus
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div className="truncate">
                    <span className="text-[10px] text-gray-400 block">Rol / Especialidad:</span>
                    <span className="text-indigo-200 font-bold text-xs truncate block">
                      {selectedMemberInfo?.rol || 'Responsable Asignado'}
                    </span>
                  </div>
                  <span className="badge bg-indigo-500/20 text-indigo-300 text-[10px] font-mono shrink-0 ml-2">
                    {selectedMemberInfo?.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. ÁREA Y TIPO DE PENDIENTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Área Operativa Responsable:
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-slate-950 text-white font-bold text-xs rounded-xl p-2.5 border border-white/10 focus:border-cyan-500 outline-none cursor-pointer"
              >
                {AREAS_LIST.map((a) => (
                  <option key={a} value={a}>📁 {a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                Tipo de Pendiente:
              </label>
              <select
                value={tipoPendiente}
                onChange={(e) => setTipoPendiente(e.target.value)}
                className="w-full bg-slate-950 text-white font-bold text-xs rounded-xl p-2.5 border border-white/10 focus:border-purple-500 outline-none cursor-pointer"
              >
                <option value="CONTRATO">📄 Obligación de Contrato (CONTRATO)</option>
                <option value="VISITA - LUIS">🛠️ Adecuación Técnica (VISITA - LUIS)</option>
              </select>
            </div>
          </div>

          {/* 3. FECHA DE CUMPLIMIENTO & SEMÁFORO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Fecha Límite / Cumplimiento:
              </label>
              <input
                type="date"
                value={fechaCumplimiento}
                onChange={(e) => setFechaCumplimiento(e.target.value)}
                className="w-full bg-slate-950 text-emerald-400 font-mono font-bold text-xs rounded-xl p-2.5 border border-white/10 focus:border-emerald-500 outline-none cursor-pointer"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Estado del Semáforo:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setEstatus('Rojo')}
                  className={`p-2 rounded-xl border text-center font-bold text-[10px] transition cursor-pointer ${
                    estatus === 'Rojo'
                      ? 'bg-red-500/30 border-red-500 text-red-200 ring-2 ring-red-500/50'
                      : 'bg-slate-950 border-white/10 text-gray-400 hover:bg-red-500/10'
                  }`}
                >
                  🔴 Rojo (Crítico)
                </button>
                <button
                  type="button"
                  onClick={() => setEstatus('Anaranjado')}
                  className={`p-2 rounded-xl border text-center font-bold text-[10px] transition cursor-pointer ${
                    estatus === 'Anaranjado'
                      ? 'bg-amber-500/30 border-amber-500 text-amber-200 ring-2 ring-amber-500/50'
                      : 'bg-slate-950 border-white/10 text-gray-400 hover:bg-amber-500/10'
                  }`}
                >
                  🟠 Naranja
                </button>
                <button
                  type="button"
                  onClick={() => setEstatus('Verde')}
                  className={`p-2 rounded-xl border text-center font-bold text-[10px] transition cursor-pointer ${
                    estatus === 'Verde'
                      ? 'bg-emerald-500/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50'
                      : 'bg-slate-950 border-white/10 text-gray-400 hover:bg-emerald-500/10'
                  }`}
                >
                  🟢 Verde (En Plazo)
                </button>
              </div>
            </div>
          </div>

          {/* 4. UBICACIÓN Y SITUACIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pink-400" />
                Ubicación Hospitalaria / Área Interna:
              </label>
              <input
                type="text"
                list="ubicaciones-list"
                placeholder="Ej. LABORATORIO, QUÍMICA CLÍNICA..."
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 text-white font-bold text-xs rounded-xl p-2.5 border border-white/10 focus:border-pink-500 outline-none"
              />
              <datalist id="ubicaciones-list">
                {UBICACIONES_PRESET.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-yellow-400" />
                Situación / Tarea Principal:
              </label>
              <input
                type="text"
                placeholder="Descripción de la tarea u obligación..."
                value={situacion}
                onChange={(e) => setSituacion(e.target.value)}
                className="w-full bg-slate-950 text-white font-semibold text-xs rounded-xl p-2.5 border border-white/10 focus:border-yellow-500 outline-none"
                required
              />
            </div>
          </div>

          {/* 5. COMENTARIO / BITÁCORA DEL PLANNER */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Comentario de Seguimiento / Notas del Planner:
            </label>
            <textarea
              rows={2}
              placeholder="Detalla acuerdos, seguimiento o razón de la reasignación..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full bg-slate-950 text-gray-200 text-xs rounded-xl p-3 border border-white/10 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* 6. TOGGLE NOTIFICACIÓN POR CORREO */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-white font-bold text-xs block">
                  Notificación Automática
                </span>
                <span className="text-[10px] text-gray-400 block">
                  Generar registro en la bitácora y plantilla para alerta de presión.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificarEmail}
              onChange={(e) => setNotificarEmail(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
            />
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-gray-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary !py-2.5 !px-5 text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar y Reasignar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
