import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cdpqrxvsiejjbrjquoxm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function GET(request: Request) {
  return handleNotificationWorkflow(request)
}

export async function POST(request: Request) {
  return handleNotificationWorkflow(request)
}

async function handleNotificationWorkflow(request: Request) {
  try {
    const url = new URL(request.url)
    const targetEmail = url.searchParams.get('email')
    const dryRun = url.searchParams.get('dryRun') === 'true'

    // 1. Obtener todas las obligaciones e incidencias
    const { data: incidencias, error: incErr } = await supabaseAdmin
      .from('incidencias_seguimiento')
      .select(`
        incidencia_id,
        fecha_cumplimiento,
        comentario,
        cliente:clientes(nombre_cliente),
        contrato:contratos(contrato_id, numero_contrato, nombre_contrato),
        situacion:situaciones(nombre_situacion),
        persona:personas(persona_id, nombre_completo, email, area:areas(nombre_area)),
        estatus:estatus(nombre_estatus)
      `)
      .order('fecha_cumplimiento')

    if (incErr) {
      return NextResponse.json({ success: false, error: incErr.message }, { status: 500 })
    }

    const { data: personas } = await supabaseAdmin
      .from('personas')
      .select('*, area:areas(*)')

    const today = new Date('2026-09-08')

    // 2. Agrupar obligaciones por persona/email
    const groupedByPersona: Record<string, {
      personaId?: number
      nombre: string
      email: string
      area: string
      tareas: Array<{
        id: number | string
        cliente: string
        contrato: string
        situacion: string
        comentario: string
        fechaCumplimiento: string
        diasRestantes: number
        estado: string
        semaforo: 'rojo' | 'naranja' | 'verde'
      }>
    }> = {}

    // Inicializar personas registradas
    personas?.forEach(p => {
      const email = p.email || `${p.nombre_completo.toLowerCase().replace(/\s+/g, '.')}@lm-sv.com`
      groupedByPersona[email] = {
        personaId: p.persona_id,
        nombre: p.nombre_completo,
        email: email,
        area: p.area?.nombre_area || 'Operaciones',
        tareas: []
      }
    })

    // Asignar tareas
    incidencias?.forEach((inc: any, idx: number) => {
      const email = inc.persona?.email || 'operaciones@lm-sv.com'
      const nombre = inc.persona?.nombre_completo || 'Responsable Asignado'
      const area = inc.persona?.area?.nombre_area || 'Operaciones'

      if (!groupedByPersona[email]) {
        groupedByPersona[email] = {
          nombre,
          email,
          area,
          tareas: []
        }
      }

      const fechaStr = inc.fecha_cumplimiento || '2026-09-30'
      const fechaObj = new Date(fechaStr)
      const diffTime = fechaObj.getTime() - today.getTime()
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let semaforo: 'rojo' | 'naranja' | 'verde' = 'verde'
      if (diasRestantes <= 0 || inc.estatus?.nombre_estatus?.toUpperCase() === 'CRITICO') {
        semaforo = 'rojo'
      } else if (diasRestantes <= 15) {
        semaforo = 'naranja'
      }

      groupedByPersona[email].tareas.push({
        id: inc.incidencia_id || idx + 1,
        cliente: inc.cliente?.nombre_cliente || 'Institución Hospitalaria',
        contrato: inc.contrato?.numero_contrato || 'Contrato Oficial',
        situacion: inc.situacion?.nombre_situacion || 'Cumplimiento Técnico',
        comentario: inc.comentario || '',
        fechaCumplimiento: fechaStr,
        diasRestantes,
        estado: inc.estatus?.nombre_estatus || 'PENDIENTE',
        semaforo
      })
    })

    // 3. Filtrar personas con tareas pendientes
    const personasConTareas = Object.values(groupedByPersona).filter(p => p.tareas.length > 0)

    // Configurar transporte SMTP si existen variables
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || '587')
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    let transporter: any = null
    if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass }
      })
    }

    const emailResults: Array<{
      email: string
      nombre: string
      totalTareas: number
      criticas: number
      status: string
      previewSubject: string
      previewHtml: string
    }> = []

    for (const p of personasConTareas) {
      if (targetEmail && p.email.toLowerCase() !== targetEmail.toLowerCase()) {
        continue
      }

      const criticas = p.tareas.filter(t => t.semaforo === 'rojo').length
      const advertencias = p.tareas.filter(t => t.semaforo === 'naranja').length

      const subject = `[COMPRASAL ALERTA] ${criticas > 0 ? '🔴 URGENTE' : '⚠️ SEGUIMIENTO'}: ${p.tareas.length} Obligaciones Contractuales Pendientes — ${p.nombre}`

      const rowsHtml = p.tareas.map((t, i) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold; color: #1e293b;">#${i + 1}</td>
          <td style="padding: 10px; color: #0f172a;">
            <strong>${t.cliente}</strong><br/>
            <span style="font-size: 11px; color: #64748b;">${t.contrato}</span>
          </td>
          <td style="padding: 10px; color: #334155;">
            <strong>${t.situacion}</strong>
            ${t.comentario ? `<br/><span style="font-size: 11px; color: #64748b;">${t.comentario}</span>` : ''}
          </td>
          <td style="padding: 10px; text-align: center; color: #0f172a; font-family: monospace; font-weight: bold;">
            ${t.fechaCumplimiento}
          </td>
          <td style="padding: 10px; text-align: center;">
            <span style="display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; ${
              t.semaforo === 'rojo'
                ? 'background-color: #fee2e2; color: #991b1b; border: 1px solid #f87171;'
                : t.semaforo === 'naranja'
                ? 'background-color: #ffedd5; color: #9a3412; border: 1px solid #fb923c;'
                : 'background-color: #dcfce7; color: #166534; border: 1px solid #4ade80;'
            }">
              ${t.diasRestantes <= 0 ? '¡VENCIDO!' : `${t.diasRestantes} días`}
            </span>
          </td>
        </tr>
      `).join('')

      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
            .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; padding: 24px; text-align: left; border-bottom: 3px solid #06b6d4; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
            .header p { margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }
            .content { padding: 24px; }
            .saludo { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
            .badge-bar { display: flex; gap: 8px; margin-bottom: 20px; }
            .alert-box { background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 14px; border-radius: 8px; font-size: 12px; color: #881337; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { background-color: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; }
            .footer { background-color: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LAB & MED — Control Planner Pro</h1>
              <p>SISTEMA DE GESTIÓN Y CUMPLIMIENTO DE OBLIGACIONES CONTRACTUALES</p>
            </div>
            <div class="content">
              <div class="saludo">Estimado(a) ${p.nombre} (${p.area}),</div>
              <p style="font-size: 13px; line-height: 1.6; color: #475569;">
                Por medio del presente sistema de supervisión estratégica, se le notifica que tiene <strong>${p.tareas.length} obligación(es) asignadas</strong> bajo su responsabilidad en los contratos y licitaciones institucionales:
              </p>
              
              ${criticas > 0 ? `
              <div class="alert-box">
                <strong>⚠️ ATENCIÓN URGENTE:</strong> Se identificaron <strong>${criticas} hito(s) en estado CRÍTICO o vencido</strong>. El incumplimiento en la fecha estipulada genera riesgo de penalizaciones económicas y multas bajo la Ley de Compras Públicas.
              </div>` : ''}

              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Institución / Contrato</th>
                    <th>Obligación / Situación</th>
                    <th style="text-align:center;">Límite</th>
                    <th style="text-align:center;">Plazo</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <div style="margin-top: 24px; padding: 14px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; font-size: 12px; color: #166534;">
                <strong>📌 Acciones Requeridas:</strong>
                <ol style="margin: 6px 0 0 0; padding-left: 18px; line-height: 1.5;">
                  <li>Gestionar las actividades de cumplimiento de cada numeral asignado.</li>
                  <li>Reportar de inmediato a Planificación Estratégica cualquier bloqueo o requerimiento especial.</li>
                  <li>Ingresar a la plataforma para actualizar el avance: <a href="https://control-planner.vercel.app" style="color: #0284c7; font-weight: bold;">control-planner.vercel.app</a></li>
                </ol>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0; font-weight: 600;">Planificación Estratégica & Gerencia General — LAB&MED S.A. DE C.V.</p>
              <p style="margin: 4px 0 0 0;">Copia automática a: jose.gomez@labandmed.com • aaltunaher@labandmed.com</p>
            </div>
          </div>
        </body>
        </html>
      `

      let sendStatus = 'PREPARADO (Simulación / Sin SMTP)'

      if (transporter && !dryRun) {
        try {
          await transporter.sendMail({
            from: `"Control Planner LAB&MED" <${smtpUser}>`,
            to: p.email,
            cc: ['jose.gomez@labandmed.com', 'aaltunaher@labandmed.com'],
            subject,
            html: htmlBody
          })
          sendStatus = 'ENVIADO_SMTP_OK'
        } catch (mailErr: any) {
          console.error(`Error sending email to ${p.email}:`, mailErr)
          sendStatus = `ERROR_SMTP: ${mailErr.message}`
        }
      }

      emailResults.push({
        email: p.email,
        nombre: p.nombre,
        totalTareas: p.tareas.length,
        criticas,
        status: sendStatus,
        previewSubject: subject,
        previewHtml: htmlBody
      })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalEncargadosNotificados: emailResults.length,
      smtpConfigurado: Boolean(transporter),
      resultados: emailResults
    })
  } catch (error: any) {
    console.error('Error in notification workflow:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
