'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'
import LabMedLogo from '@/components/LabMedLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('jose.gomez@labandmed.com')
  const [password, setPassword] = useState('Password123!')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRegister, setIsRegister] = useState(false)
  const [nombre, setNombre] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nombre },
          },
        })
        if (signUpError) throw signUpError
        setError(null)
        alert('Revisa tu correo para confirmar tu cuenta.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de autenticación'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Ambient glows */}
      <div className="ambient-glow bg-indigo-500" style={{ top: '-10%', left: '-5%' }} />
      <div className="ambient-glow bg-violet-500" style={{ bottom: '-10%', right: '-5%' }} />
      <div className="ambient-glow bg-cyan-500" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px' }} />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo Hub */}
        <div className="text-center mb-8 animate-fade-in flex flex-col items-center">
          <LabMedLogo size={76} showText={false} glowing={true} className="mb-4" />
          <h1 className="text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-teal-300 bg-clip-text text-transparent tracking-wide font-sans">
            LAB & MED
          </h1>
          <p className="text-xs font-mono font-bold text-cyan-400 mt-1 uppercase tracking-widest">
            Control Planner Pro
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 animate-scale-in">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Correo electrónico
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@empresa.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {isRegister ? 'Crear Cuenta' : 'Ingresar'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(null) }}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--brand-primary)' }}
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          © 2026 Labandmed SV — Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
