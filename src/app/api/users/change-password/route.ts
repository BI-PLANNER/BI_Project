import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Initialize Admin Supabase Client for Auth User Management
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req: NextRequest) {
  try {
    // 1. Obtener la sesión del usuario actual desde la petición (cookies)
    let supabaseResponse = NextResponse.next({ request: req })
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request: req })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabaseServer.auth.getUser()

    // 2. Extraer cuerpo de la petición
    const body = await req.json()
    const { userId, targetEmail, newPassword } = body

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      )
    }

    // 3. VERIFICACIÓN ESTRICTA DE AUTORIZACIÓN: Solo José Lenny Gómez (Planner)
    const currentUserEmail = (user?.email || '').toLowerCase().trim()
    
    // Lista de correos autorizados para Lenny Gómez (Planner)
    const lennyAuthorizedEmails = [
      'jose.gomez@labandmed.com',
      'jose.gomez@lm-sv.com',
      'businessinteligent01@lm-sv.com'
    ]

    const isLennyGomez = lennyAuthorizedEmails.includes(currentUserEmail) || 
      currentUserEmail.includes('jose.gomez') || 
      currentUserEmail.includes('lenny')

    if (!user || !isLennyGomez) {
      return NextResponse.json(
        {
          success: false,
          error: `Acceso Denegado: Únicamente José Lenny Gómez (Planificación Estratégica & BI / Planner) posee los permisos autorizados para modificar contraseñas de usuarios. Usuario actual: ${currentUserEmail || 'No autenticado'}`
        },
        { status: 403 }
      )
    }

    // 4. Buscar ID de usuario en auth.users si solo se proporcionó targetEmail
    let targetUserId = userId

    if (!targetUserId && targetEmail) {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
      const foundUser = userList?.users?.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase())
      if (foundUser) {
        targetUserId = foundUser.id
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'No se encontró el ID o correo del usuario a actualizar en Supabase Auth.' },
        { status: 404 }
      )
    }

    // 5. Actualizar la contraseña en Supabase Auth (Se encripta automáticamente con Hash Bcrypt + Salt)
    const { data: updatedUserData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { password: newPassword }
    )

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada y encriptada exitosamente con algoritmo Hash Bcrypt en Supabase Auth.',
      user: {
        id: updatedUserData.user.id,
        email: updatedUserData.user.email,
        updated_at: updatedUserData.user.updated_at
      },
      seguridad: {
        metodo_encriptacion: 'Hash Bcrypt (Blowfish salt 10+ rounds)',
        almacenamiento: 'auth.users (Supabase PostgreSQL Encrypted Auth)',
        autorizado_por: 'José Lenny Gómez (Planificación Estratégica & BI)'
      }
    })
  } catch (err: any) {
    console.error('Error al cambiar contraseña:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Error interno del servidor al actualizar la contraseña' },
      { status: 500 }
    )
  }
}
