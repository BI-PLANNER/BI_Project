'use client'

import React, { useState } from 'react'
import { KeyRound, ShieldCheck, Lock, Eye, EyeOff, X, CheckCircle2, AlertCircle } from 'lucide-react'

interface CambiarPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  userEmail?: string
  userName?: string
  onSuccess?: () => void
}

export default function CambiarPasswordModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  userName,
  onSuccess
}: CambiarPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    if (newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Las contraseñas ingresadas no coinciden.' })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          targetEmail: userEmail,
          newPassword
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al cambiar la contraseña')
      }

      setStatusMessage({
        type: 'success',
        text: '🔒 Contraseña actualizada y almacenada encriptada mediante Hash Bcrypt en Supabase Auth exitosamente.'
      })

      setNewPassword('')
      setConfirmPassword('')

      if (onSuccess) onSuccess()

      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error al procesar la actualización de contraseña'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Cambiar Contraseña de Usuario
              </h3>
              <p className="text-xs text-slate-400">
                Encriptación Hash (Bcrypt) en Supabase Auth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Info Banner */}
        <div className="px-5 py-3 bg-cyan-950/40 border-b border-cyan-500/20 text-xs text-cyan-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Permiso Exclusivo:</span> Reservado únicamente para <strong className="text-white">José Lenny Gómez (Planner)</strong>. La contraseña nunca se guardará en texto plano y se encriptará automáticamente con Hash Bcrypt.
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {userEmail && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <span className="text-slate-400 block font-semibold mb-0.5">Usuario Objetivo:</span>
              <strong className="text-white font-mono text-sm">{userName || 'Colaborador'}</strong> ({userEmail})
            </div>
          )}

          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                placeholder="Ingresa la nueva contraseña"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                placeholder="Repite la nueva contraseña"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  Actualizar y Encriptar Contraseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
