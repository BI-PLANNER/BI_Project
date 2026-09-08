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

      const subject = `📋 Obligaciones Pendientes — ${p.nombre} (${p.tareas.length} pendientes)`

      const rowsHtml = p.tareas.map((t, i) => `
        <tr style="border-bottom: 1px solid #e2e8f0; ${i % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
          <td style="padding: 12px 10px; font-weight: 700; color: #475569; text-align: center; vertical-align: top;">
            ${i + 1}
          </td>
          <td style="padding: 12px; vertical-align: top;">
            <div style="font-weight: 700; color: #0f172a; font-size: 13px;">
              ${t.cliente}
            </div>
            <div style="font-size: 11px; color: #0284c7; font-weight: 600; margin-top: 2px;">
              ${t.contrato}
            </div>
          </td>
          <td style="padding: 12px; vertical-align: top;">
            <div style="font-weight: 700; color: #1e293b; font-size: 13px; margin-bottom: 3px;">
              ${t.situacion}
            </div>
            <div style="font-size: 12px; color: #475569; line-height: 1.4;">
              ${t.comentario}
            </div>
          </td>
          <td style="padding: 12px 10px; text-align: center; vertical-align: top; white-space: nowrap;">
            <div style="font-family: 'Consolas', 'Courier New', monospace; font-weight: 700; font-size: 12px; color: #0f172a;">
              ${t.fechaCumplimiento}
            </div>
          </td>
          <td style="padding: 12px 10px; text-align: center; vertical-align: top; white-space: nowrap;">
            <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; ${
              t.diasRestantes <= 0
                ? 'background-color: #fef2f2; color: #b91c1c; border: 1px solid #f87171;'
                : 'background-color: #fffbeb; color: #b45309; border: 1px solid #fcd34d;'
            }">
              ${t.diasRestantes <= 0 ? '🚨 PENDIENTE (VENCIDO)' : '⚠️ PENDIENTE'}
            </span>
          </td>
        </tr>
      `).join('')

      const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Obligaciones Pendientes</title>
</head>
<body style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 720px; background-color: #ffffff; border-radius: 12px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- HEADER CORPORATIVO -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 24px 32px; color: #ffffff;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">
                LAB & MED S.A. DE C.V.
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                Control de Obligaciones Pendientes
              </h1>
            </td>
          </tr>

          <!-- CUERPO DEL CORREO -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
                Estimado(a) ${p.nombre},
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0 0 18px 0;">
                A continuación se detalla lo que se encuentra <strong>pendiente</strong> bajo su responsabilidad:
              </p>

              <!-- TABLA DE LO QUE ESTÁ PENDIENTE -->
              <table role="presentation" width="100%" style="border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                <thead>
                  <tr style="background-color: #0f172a; color: #ffffff;">
                    <th style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: center; width: 5%;">#</th>
                    <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: left; width: 30%;">Institución / Contrato</th>
                    <th style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: left; width: 40%;">¿Qué está pendiente?</th>
                    <th style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: center; width: 13%;">Fecha Límite</th>
                    <th style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: center; width: 12%;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <!-- BOTÓN DE ACCESO DIRECTO -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 6px 0 16px 0;">
                    <a href="https://control-planner.vercel.app/dashboard/obligaciones" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 28px; border-radius: 6px; text-align: center;">
                      Ver en el Sistema
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER INSTITUCIONAL -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center;">
              <div style="font-weight: 600; font-size: 11px; color: #64748b;">
                LAB & MED S.A. DE C.V. &bull; Planificación Estratégica & Gerencia General
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `

      let sendStatus = 'PREPARADO (Simulación / Sin SMTP)'

      if (transporter && !dryRun) {
        try {
          await transporter.sendMail({
            from: `"José Gómez — Planificación Estratégica" <${smtpUser}>`,
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
