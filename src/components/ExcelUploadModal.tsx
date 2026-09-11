'use client'

import { useState, useRef } from 'react'
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, RefreshCw, X, FileText, Database } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ExcelUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ExcelUploadModal({ isOpen, onClose, onSuccess }: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [stats, setStats] = useState<{ rowsCount: number, licsCount: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setStatusMsg(null)
      setStats(null)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (dropped && (dropped.name.endsWith('.xlsx') || dropped.name.endsWith('.xls') || dropped.name.endsWith('.csv'))) {
      setFile(dropped)
      setStatusMsg(null)
      setStats(null)
    } else {
      setStatusMsg({ type: 'error', text: 'Por favor arrastra un archivo de Excel (.xlsx, .xls) o CSV válido.' })
    }
  }

  async function processAndSyncExcel() {
    if (!file) return
    setUploading(true)
    setStatusMsg({ type: 'info', text: 'Leyendo y procesando celdas del archivo Excel...' })

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

      if (!rawRows || rawRows.length === 0) {
        throw new Error('El archivo Excel está vacío o no contiene filas de datos.')
      }

      setStatusMsg({ type: 'info', text: `Normalizando ${rawRows.length} renglones e insertando en Supabase...` })

      // Mapear campos desde las celdas del Excel
      const licitaciones = rawRows.map((r: any) => ({
        no_oferta: String(r['No. Oferta'] || r['No Oferta'] || r['Oferta'] || r['NO. OFERTA'] || '').trim(),
        nombre_oferta: String(r['Nombre Oferta'] || r['Nombre de Oferta'] || r['NOMBRE OFERTA'] || '').trim(),
        cliente: String(r['Cliente'] || r['CLIENTE'] || '').trim(),
        institucion: String(r['INST.'] || r['INST'] || r['INSTITUCION'] || 'MINSAL').trim(),
        empresa: String(r['EMPR'] || r['EMPRESA'] || r['Empresa'] || 'LABYMED').trim(),
        tipo_proceso: String(r['TIPO DE PROCESO '] || r['TIPO DE PROCESO'] || 'LICITACION COMPETITIVA').trim(),
        anio: String(r['AÑO'] || r['ANO'] || '2025').trim(),
        mes: String(r['Mes'] || r['MES'] || 'ENERO').trim().toUpperCase(),
        presentacion: r['Presentación de oferta (Fecha)'] || r['Presentación'] || r['PRESENTACION'] || '',
        producto: String(r['Producto'] || r['PRODUCTO'] || '').trim(),
        marca: String(r['Marca'] || r['MARCA'] || '').trim(),
        precio_unitario: r['Precio (unitario)'] !== undefined ? r['Precio (unitario)'] : (r['Precio'] || 0),
        cantidad: r['Cantidad (unitaria)'] !== undefined ? r['Cantidad (unitaria)'] : (r['Cantidad'] || 1),
        total_ofertado: r['Total Ofertado'] !== undefined ? r['Total Ofertado'] : 0,
        estatus_item: String(r['Estatus'] || r['ESTADO'] || r['ESTATUS'] || '').trim(),
        precio_adjudicado: r['Precio adjudicado '] !== undefined ? r['Precio adjudicado '] : (r['Precio adjudicado'] || 0),
        empresa_adjudicada: String(r['Empresa adjudicada'] || r['Empresa adjudicada '] || '').trim(),
        razon: String(r['Razon'] || r['Razon '] || '').trim(),
        no_contrato: String(r['No. De Contrato'] || r['No. Contrato'] || '').trim(),
        observaciones: String(r['Observaciones'] || r['OBSERVACIONES'] || '').trim()
      })).filter(i => i.no_oferta || i.nombre_oferta || i.producto)

      const uniqueLics = new Set(licitaciones.map(i => i.no_oferta || i.nombre_oferta))

      // Enviar payload al backend /api/db para upsert idempotente
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_excel_licitaciones',
          licitaciones
        })
      })

      const resData = await res.json()

      if (!res.ok || !resData.success) {
        throw new Error(resData.error || resData.message || 'Error al guardar en Supabase')
      }

      setStats({
        rowsCount: licitaciones.length,
        licsCount: uniqueLics.size
      })

      setStatusMsg({
        type: 'success',
        text: `¡Éxito! Se sincronizaron ${licitaciones.length} renglones y ${uniqueLics.size} licitaciones directamente en Supabase.`
      })

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    } catch (err: any) {
      console.error('Excel upload error:', err)
      setStatusMsg({
        type: 'error',
        text: err.message || 'Error al procesar el archivo Excel.'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Sincronizador Directo de Excel / CSV</h2>
              <p className="text-xs text-slate-400">Carga inmediata de cualquier hoja o celda hacia Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Dropzone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
              file ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-700 hover:border-indigo-500 bg-slate-950/40 hover:bg-slate-950/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB • Haz clic para cambiar archivo</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Arrastra aquí tu archivo Excel (.xlsx) o CSV</p>
                  <p className="text-xs text-slate-400 mt-1">O haz clic para explorar en tus carpetas locales</p>
                </div>
              </>
            )}
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className={`p-4 rounded-xl text-xs font-medium flex items-start gap-2.5 border ${
              statusMsg.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' :
              statusMsg.type === 'error' ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' :
              'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
            }`}>
              {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />}
              {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />}
              {statusMsg.type === 'info' && <RefreshCw className="w-4 h-4 shrink-0 text-indigo-400 animate-spin mt-0.5" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Licitaciones Procesadas</span>
                <p className="text-lg font-black text-white font-mono">{stats.licsCount}</p>
              </div>
              <div className="text-center border-l border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Renglones Guardados</span>
                <p className="text-lg font-black text-emerald-400 font-mono">{stats.rowsCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancelar
          </button>
          <button
            onClick={processAndSyncExcel}
            disabled={!file || uploading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-lg ${
              file && !uploading
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sincronizando a Supabase...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Sincronizar a Supabase en Vivo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
