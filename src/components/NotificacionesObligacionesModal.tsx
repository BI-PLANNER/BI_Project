'use client'

import { useState } from 'react'
import {
  Send,
  Mail,
  AlertTriangle,
  CheckCircle2,
  X,
  Zap,
  Users,
  Clock,
  Eye,
  Copy,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  RefreshCw
} from 'lucide-react'

interface NotificacionesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificacionesObligacionesModal({ isOpen, onClose }: NotificacionesModalProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<any | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Cargar lista de correos preparados al abrir
  const loadNotificationData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notificaciones/enviar?dryRun=true')
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (err) {
      console.error('Error fetching notification data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Trigger load on modal open if no data
  if (isOpen && !data && !loading) {
    loadNotificationData()
  }

  if (!isOpen) return null

  // Disparar envío masivo
  const handleSendAll = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notificaciones/enviar', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setData(json)
        setSentSuccess(true)
        setTimeout(() => setSentSuccess(false), 4000)
      }
    } catch (err) {
      console.error('Error sending all notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  // Copiar texto para WhatsApp
  const handleCopyWhatsApp = (persona: any, index: number) => {
    let text = `🚨 *ALERTA INSTITUCIONAL DE CUMPLIMIENTO — LAB&MED*\n`
    text += `👤 *Responsable:* ${persona.nombre}\n`
    text += `📋 *Obligaciones Asignadas:* ${persona.totalTareas} (Críticas: ${persona.criticas})\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `Favor revisar las obligaciones pendientes en la plataforma oficial:\n`
    text += `👉 https://control-planner.vercel.app/dashboard/obligaciones\n\n`
    text += `_Con copia a Gerencia General y Planificación Estratégica._`

    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-4xl p-6 md:p-8 animate-scale-in border border-white/10 shadow-2xl rounded-3xl bg-slate-950/95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
                  Flujo Automatizado de Correos a Encargados
                </h3>
                <span className="badge bg-indigo-500/20 text-indigo-300 font-mono text-[10px] border border-indigo-500/30">
                  COMPRASAL / VERCEL
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Envío de notificaciones y cartas de cumplimiento contractual a los responsables con copia a Gerencia General.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {sentSuccess && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-fade-in text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>¡Flujo ejecutado con éxito! Se han preparado y despachado los recordatorios a los 9 encargados.</span>
          </div>
        )}

        {/* Resumen Superior */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 font-mono">Encargados</p>
              <p className="text-lg font-black text-white">{data?.totalEncargadosNotificados || 9} personas</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 font-mono">CC a Gerencia</p>
              <p className="text-xs font-bold text-emerald-300">jose.gomez • aaltunaher</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 font-mono">Obligaciones Activas</p>
              <p className="text-lg font-black text-amber-400">26 hitos monitoreados</p>
            </div>
          </div>
        </div>

        {/* Lista de Encargados */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading && !data ? (
            <div className="p-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Preparando plantillas y agrupando obligaciones...</span>
            </div>
          ) : (
            data?.resultados?.map((persona: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-indigo-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                    {persona.nombre.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{persona.nombre}</span>
                      <span className="text-[10px] font-mono text-gray-400">{persona.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="badge bg-white/5 text-gray-300 text-[9px] px-1.5 font-mono">
                        {persona.totalTareas} {persona.totalTareas === 1 ? 'obligación' : 'obligaciones'}
                      </span>
                      {persona.criticas > 0 && (
                        <span className="badge bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] px-1.5 font-mono font-bold">
                          🔴 {persona.criticas} críticas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setSelectedPersona(persona)
                      setPreviewOpen(true)
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-medium flex items-center gap-1.5 transition"
                    title="Ver vista previa del correo HTML"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Ver Correo</span>
                  </button>

                  <button
                    onClick={() => handleCopyWhatsApp(persona, idx)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-medium flex items-center gap-1.5 border border-emerald-500/30 transition"
                    title="Copiar formato para WhatsApp / Telegram"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedIndex === idx ? '¡Copiado!' : 'WhatsApp'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-gray-400">
            <span>Servicio de notificaciones con copia a Gerencia General</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-semibold"
            >
              Cerrar
            </button>
            <button
              onClick={handleSendAll}
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${loading ? 'animate-bounce' : ''}`} />
              <span>{loading ? 'Disparando Flujo...' : '🚀 Enviar Notificaciones a Todos (9)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa HTML */}
      {previewOpen && selectedPersona && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="glass-card w-full max-w-3xl p-6 rounded-3xl border border-white/20 shadow-2xl bg-slate-900 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Vista Previa del Correo: {selectedPersona.nombre}
                </h4>
                <p className="text-[11px] text-gray-400">{selectedPersona.previewSubject}</p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 p-4 rounded-2xl bg-slate-950 border border-white/10">
              <div
                dangerouslySetInnerHTML={{ __html: selectedPersona.previewHtml }}
                className="prose prose-invert max-w-none text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewOpen(false)}
                className="btn-primary px-4 py-2 text-xs font-bold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
