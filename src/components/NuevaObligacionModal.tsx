'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit3, X, CheckCircle2, Building2, Calendar, FileText, User, Tag, MapPin, AlertCircle, Save } from 'lucide-react'
import { IncidenciaEvento } from '@/app/dashboard/planner/page'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (record: Partial<IncidenciaEvento>) => void
  initialData?: IncidenciaEvento | null
}

const AREAS_DISPONIBLES = ['LOGISTICA', 'APLICACIONES', 'PM', 'GI', 'SOPORTE', 'IT', 'LICITACIONES']
const CLIENTES_DISPONIBLES = ['HOSPITAL BLOOM', 'HOSPITAL MILITAR', 'ISSS', 'MINSAL', 'SAN JUAN DE DIOS DE SANTA ANA', 'HOSPITAL SALDAÑA', 'ISBM']
const ESTATUS_DISPONIBLES = [
  { label: '🔴 Rojo (Crítico / Vencido)', value: 'Rojo' },
  { label: '🟡 Anaranjado (En Proceso / Advertencia)', value: 'Anaranjado' },
  { label: '🟢 Verde (En Plazo / Cumplido)', value: 'Verde' }
]

export default function NuevaObligacionModal({ isOpen, onClose, onSave, initialData }: ModalProps) {
  const [formData, setFormData] = useState<Partial<IncidenciaEvento>>({
    cliente: 'HOSPITAL BLOOM',
    numero_contrato: '',
    tipo_pendiente: 'CONTRATO',
    situacion: '',
    area: 'IT',
    responsable: '',
    responsableEmail: '',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: new Date().toISOString().split('T')[0],
    estatus: 'Rojo',
    comentario: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData })
    } else {
      setFormData({
        cliente: 'HOSPITAL BLOOM',
        numero_contrato: 'N° ' + (Math.floor(Math.random() * 90) + 10) + '/2026',
        tipo_pendiente: 'CONTRATO',
        situacion: '',
        area: 'IT',
        responsable: '',
        responsableEmail: '',
        ubicacion: 'LABORATORIO',
        fecha_cumplimiento: new Date().toISOString().split('T')[0],
        estatus: 'Rojo',
        comentario: ''
      })
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cliente || !formData.situacion || !formData.responsable) {
      alert('Por favor complete los campos requeridos: Cliente, Situación y Responsable.')
      return
    }

    setSaving(true)
    try {
      // 1. Send to Supabase via API
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert_incidencia',
          table: 'incidencias_seguimiento',
          payload: {
            ...formData,
            fecha_cumplimiento: formData.fecha_cumplimiento || new Date().toISOString().split('T')[0]
          }
        })
      })
    } catch (e) {
      console.log('Guardado en estado local:', e)
    } finally {
      setSaving(false)
      onSave(formData)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              {initialData ? <Edit3 size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {initialData ? 'Editar Obligación / Registro' : 'Agregar Nueva Obligación'}
              </h3>
              <p className="text-xs text-slate-500">
                {initialData ? 'Actualice las propiedades y el estado del registro' : 'Ingrese los detalles para registrar una nueva obligación en la matriz'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Cliente */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Cliente / Institución *</label>
              <select
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CLIENTES_DISPONIBLES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Número de Contrato */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">N° de Contrato / Referencia</label>
              <input
                type="text"
                placeholder="ej. N° 68/2026 o 13-BS-2026"
                value={formData.numero_contrato || ''}
                onChange={(e) => setFormData({ ...formData, numero_contrato: e.target.value })}
                className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Tipo Pendiente */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Pendiente</label>
              <select
                value={formData.tipo_pendiente}
                onChange={(e) => setFormData({ ...formData, tipo_pendiente: e.target.value })}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CONTRATO">CONTRATO OFICIAL</option>
                <option value="VISITA - LUIS">VISITA / TERRENO - LUIS</option>
                <option value="COMPROMISO SEGUIMIENTO">COMPROMISO SEGUIMIENTO</option>
              </select>
            </div>

            {/* Área Operativa */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Área Responsable *</label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {AREAS_DISPONIBLES.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Responsable Nombre */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Persona Responsable *</label>
              <input
                type="text"
                placeholder="ej. RICARDO VILLANUEVA"
                value={formData.responsable || ''}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Email Responsable */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico del Responsable</label>
              <input
                type="email"
                placeholder="ej. ricardo.villanueva@lm-sv.com"
                value={formData.responsableEmail || ''}
                onChange={(e) => setFormData({ ...formData, responsableEmail: e.target.value })}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ubicación / Servicio</label>
              <input
                type="text"
                placeholder="ej. LABORATORIO, ALMACÉN, BODEGA"
                value={formData.ubicacion || ''}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Fecha de Cumplimiento */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Fecha de Cumplimiento / Límite</label>
              <input
                type="date"
                value={formData.fecha_cumplimiento || ''}
                onChange={(e) => setFormData({ ...formData, fecha_cumplimiento: e.target.value })}
                className="w-full text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>

          {/* Situación / Obligación */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Situación / Tarea Obligatoria *</label>
            <input
              type="text"
              placeholder="ej. Sistema informático SIS / Capacitación controles de calidad"
              value={formData.situacion || ''}
              onChange={(e) => setFormData({ ...formData, situacion: e.target.value })}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Semáforo Estatus */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Estado de Semáforo</label>
            <select
              value={formData.estatus}
              onChange={(e) => setFormData({ ...formData, estatus: e.target.value })}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ESTATUS_DISPONIBLES.map(est => (
                <option key={est.value} value={est.value}>{est.label}</option>
              ))}
            </select>
          </div>

          {/* Comentario / Bitácora */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Comentario / Bitácora Detallada</label>
            <textarea
              rows={3}
              placeholder="Ingrese notas detalladas sobre avances, respuestas del MINSAL/ISSS o justificaciones..."
              value={formData.comentario || ''}
              onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              <Save size={15} className={saving ? 'animate-spin' : ''} />
              {saving ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Registro')}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
