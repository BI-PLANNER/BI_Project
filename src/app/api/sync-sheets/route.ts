import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const res = await fetch('https://n8n.cyberedu.my/webhook/sync-sheets-supabase', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })

    const rawText = await res.text()
    let data: any = {}

    if (rawText && rawText.trim().length > 0) {
      try {
        data = JSON.parse(rawText)
      } catch (parseErr) {
        data = { raw: rawText }
      }
    }

    if (!res.ok) {
      const errMsg = data?.message || data?.error || res.statusText || 'Error en el servidor de automatización'
      throw new Error(`Error en n8n webhook (${res.status}): ${errMsg}`)
    }

    return NextResponse.json({ success: true, ...data })
  } catch (err: any) {
    console.error('Sync error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Error al ejecutar sincronización en n8n' },
      { status: 500 }
    )
  }
}
