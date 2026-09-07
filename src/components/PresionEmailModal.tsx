'use client'

import { useState } from 'react'
import { Zap, Send, Mail, AlertTriangle, CheckCircle2, X } from 'lucide-react'

interface PresionModalProps {
  isOpen: boolean
  onClose: () => void
  tarea?: {
    id: string
    descripcion: string
    responsableNombre: string
    responsableEmail: string
    responsableRol: string
    proyectoNombre: string
    cliente: string
    fechaCumplimiento: string
    diasRestantes: number
    numeral?: string
  }
  task?: any
}

export default function PresionEmailModal({ isOpen, onClose, tarea, task }: PresionModalProps) {
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [urgencia, setUrgencia] = useState<'URGENTE' | 'CRITICO' | 'RECORDATORIO'>('URGENTE')

  if (!isOpen) return null

  const activeTask = tarea || task || {
    id: '1',
    descripcion: 'Cumplimiento contractual',
    responsableNombre: 'Responsable',
    responsableEmail: 'contacto@labymed.com.sv',
    responsableRol: 'Operaciones',
    proyectoNombre: 'Contrato Institucional',
    cliente: 'Cliente',
    fechaCumplimiento: '2026-12-31',
    diasRestantes: 30
  }

  const asunto = `[COMPRASAL ALERTA ${urgencia}] Plazo Crítico: ${(activeTask.descripcion || '').slice(0, 45)}... — ${activeTask.cliente}`
  
  const cuerpo = `Estimado(a) ${activeTask.responsableNombre} (${activeTask.responsableRol}),

Por medio del presente se le notifica que la siguiente obligación contractual se encuentra en estado CRÍTICO DE CUMPLIMIENTO según el sistema COMPRASAL:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 PROYECTO: ${activeTask.proyectoNombre}
🏛️ CLIENTE GUBERNAMENTAL: ${activeTask.cliente}
📋 ACTIVIDAD: ${activeTask.descripcion}
${activeTask.numeral ? `🔢 NUMERAL CONTRACTUAL: ${activeTask.numeral}\n` : ''}📅 FECHA LÍMITE: ${activeTask.fechaCumplimiento}
⏱️ PLAZO RESTANTE: ${activeTask.diasRestantes <= 0 ? '¡VENCIDO!' : `${activeTask.diasRestantes} días`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ADVERTENCIA:
El incumplimiento en la fecha estipulada genera riesgo inminente de MULTAS contractuales e infracciones bajo la Ley de Compras Públicas (LCP) aplicables a la empresa.

Favor actualizar el porcentaje de avance o reportar cualquier bloqueo de inmediato a Planificación Estratégica.

Atentamente,
José Lenny Gómez Henríquez
Planner Estratégico — COMPRASAL / LAB&MED
(Con copia a Gerencia General y PM)`

  const handleEnviar = async () => {
    setEnviando(true)
    // Simulación de envío de correo y log
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setEnviando(false)
    setEnviado(true)
    setTimeout(() => {
      setEnviado(false)
      onClose()
    }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-xl p-6 animate-scale-in border-l-4 border-l-red-500 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-400">
                Enviar Correo de Presión / Alerta Automática
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Exclusivo para el Planner — Recordatorio de alta prioridad institucional
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {enviado ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-emerald-400">
              ¡Correo de Presión Enviado con Éxito!
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Se ha notificado a {activeTask.responsableNombre} ({activeTask.responsableEmail}) con copia a Gerencia.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Destinatario */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Destinatario Asignado:</span>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {activeTask.responsableNombre} &lt;{activeTask.responsableEmail}&gt;
                </p>
                <span className="badge bg-violet-500/15 text-violet-400 text-[10px] mt-0.5">
                  {activeTask.responsableRol}
                </span>
              </div>
              <div className="text-right">
                <span className="badge bg-red-500/15 text-red-400 text-xs">
                  {activeTask.diasRestantes <= 0 ? 'VENCIDO' : `${activeTask.diasRestantes} días restantes`}
                </span>
              </div>
            </div>

            {/* Nivel de Urgencia */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Nivel de Presión / Severidad:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['RECORDATORIO', 'URGENTE', 'CRITICO'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgencia(lvl)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      urgencia === lvl
                        ? lvl === 'CRITICO'
                          ? 'bg-red-600 border-red-500 text-white shadow-lg'
                          : lvl === 'URGENTE'
                          ? 'bg-amber-600 border-amber-500 text-white shadow-lg'
                          : 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Vista previa del correo */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Asunto del Correo:
              </label>
              <input
                type="text"
                readOnly
                value={asunto}
                className="input-field text-xs font-mono text-amber-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Cuerpo del Correo (Generado Automáticamente):
              </label>
              <textarea
                readOnly
                value={cuerpo}
                className="input-field font-mono text-xs h-36 resize-none bg-black/40 text-gray-300 leading-relaxed"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEnviar}
                disabled={enviando}
                className="btn-primary !bg-red-600 hover:!bg-red-500 flex-1 text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
              >
                {enviando ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Enviar Presión Ahora
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
