import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Admin Supabase Client with Service Role Key to bypass RLS
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
    const body = await req.json()
    const { action, table, payload, id, pk = 'id' } = body

    if (!table) {
      return NextResponse.json({ error: 'Falta especificar la tabla' }, { status: 400 })
    }

    const admin: any = supabaseAdmin

    switch (action) {
      case 'insert': {
        let finalPayload = { ...payload }

        // Si la tabla es users, sincronizar con auth.users y asignar rol_id
        if (table === 'users') {
          finalPayload.rol_id = finalPayload.rol_id || '43b02f0d-ad63-4acb-bddf-ea38406f11b6'
          if (finalPayload.activo === undefined) finalPayload.activo = true

          if (!finalPayload.id && finalPayload.email) {
            try {
              // 1. Verificar si ya existe en auth.users
              const { data: userList } = await admin.auth.admin.listUsers()
              const existingAuthUser = userList?.users?.find(
                (u: any) => u.email?.toLowerCase() === finalPayload.email?.toLowerCase()
              )

              if (existingAuthUser) {
                finalPayload.id = existingAuthUser.id
              } else {
                // 2. Crear en auth.users
                const { data: newAuthUser, error: authErr } = await admin.auth.admin.createUser({
                  email: finalPayload.email,
                  password: payload.password || 'LabMed2026!',
                  email_confirm: true,
                  user_metadata: {
                    nombre: finalPayload.nombre,
                    apellido: finalPayload.apellido,
                    departamento: finalPayload.departamento
                  }
                })

                if (!authErr && newAuthUser?.user?.id) {
                  finalPayload.id = newAuthUser.user.id
                } else if (authErr) {
                  console.error('Error creating auth user:', authErr)
                  throw new Error(`Error en autenticación: ${authErr.message}`)
                }
              }
            } catch (authError: any) {
              console.error('Auth user sync error:', authError)
              throw authError
            }
          }
        }

        const { data, error } = await admin
          .from(table)
          .insert(finalPayload)
          .select('*')
        if (error) throw error
        return NextResponse.json({ success: true, data }, { status: 201 })
      }

      case 'upsert': {
        const { onConflict } = body
        const { data, error } = await admin
          .from(table)
          .upsert(payload, onConflict ? { onConflict } : undefined)
          .select('*')
        if (error) throw error
        return NextResponse.json({ success: true, data }, { status: 200 })
      }

      case 'update': {
        if (id === undefined || id === null) {
          return NextResponse.json({ error: 'Falta especificar el ID para actualizar' }, { status: 400 })
        }
        const { data, error } = await admin
          .from(table)
          .update(payload)
          .eq(pk, id)
          .select('*')
        if (error) throw error
        return NextResponse.json({ success: true, data }, { status: 200 })
      }

      case 'delete': {
        if (id === undefined || id === null) {
          return NextResponse.json({ error: 'Falta especificar el ID para eliminar' }, { status: 400 })
        }
        const { error } = await admin
          .from(table)
          .delete()
          .eq(pk, id)
        if (error) throw error

        // Si es usuario, eliminar también de auth.users si es posible
        if (table === 'users') {
          try {
            await admin.auth.admin.deleteUser(String(id))
          } catch (authDelErr) {
            console.warn('Auth user deletion warning:', authDelErr)
          }
        }

        return NextResponse.json({ success: true }, { status: 200 })
      }

      case 'select': {
        const { select = '*', limit = 500, range, order, ascending = true } = body
        if (limit > 1000 && table === 'productos_equipo') {
          // Fetch all pages up to limit
          const [p1, p2] = await Promise.all([
            admin.from(table).select(select).range(0, 999).order(order || 'nombre_producto_equipo', { ascending }),
            admin.from(table).select(select).range(1000, 1999).order(order || 'nombre_producto_equipo', { ascending })
          ])
          if (p1.error) throw p1.error
          const combined = [...(p1.data || []), ...(p2.data || [])]
          return NextResponse.json({ success: true, data: combined }, { status: 200 })
        }
        
        let query = admin.from(table).select(select)
        if (range && Array.isArray(range) && range.length === 2) {
          query = query.range(range[0], range[1])
        } else if (limit) {
          query = query.limit(limit)
        }
        if (order) query = query.order(order, { ascending })
        const { data, error } = await query
        if (error) throw error
        return NextResponse.json({ success: true, data }, { status: 200 })
      }

      default:
        return NextResponse.json({ error: `Acción no soportada: ${action}` }, { status: 400 })
    }
  } catch (err: any) {
    console.error('API DB Error:', err)
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor en la base de datos' },
      { status: 500 }
    )
  }
}
