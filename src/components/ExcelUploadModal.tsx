'use client'

import { useState, useRef } from 'react'
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, RefreshCw, X, FileText, Database } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ExcelUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultTargetTable?: 'licitaciones_ofertas' | 'incidencias_seguimiento'
}

export default function ExcelUploadModal({ isOpen, onClose, onSuccess, defaultTargetTable = 'incidencias_seguimiento' }: ExcelUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [targetTable, setTargetTable] = useState<'licitaciones_ofertas' | 'incidencias_seguimiento'>(defaultTargetTable)
  const [uploading, setUploading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [stats, setStats] = useState<{ rowsCount: number, mainCount: number, labelMain: string } | null>(null)
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

      setStatusMsg({ type: 'info', text: `Normalizando ${rawRows.length} filas e insertando en la tabla ${targetTable}...` })

      if (targetTable === 'incidencias_seguimiento') {
        // Mapear filas para incidencias_seguimiento
        const incidencias = rawRows.map((r: any) => ({
          cliente: String(r['Cliente'] || r['CLIENTE'] || r['Institución'] || r['INSTITUCION'] || r['Hospital'] || r['INS'] || '').trim(),
          contrato: String(r['Contrato'] || r['CONTRATO'] || r['No. Contrato'] || r['NO. CONTRATO'] || r['Numero Contrato'] || '').trim(),
          situacion: String(r['Situación'] || r['SITUACION'] || r['Situacion'] || r['Problemática'] || r['PROBLEMATICA'] || r['Falla'] || r['FALLA'] || r['Incidencia'] || r['INCIDENCIA'] || '').trim(),
          persona: String(r['Responsable'] || r['RESPONSABLE'] || r['Persona'] || r['PERSONA'] || r['Encargado'] || r['ENCARGADO'] || '').trim(),
          estatus: String(r['Estatus'] || r['ESTATUS'] || r['Estado'] || r['ESTADO'] || 'PENDIENTE').trim(),
          comentario: String(r['Comentario'] || r['COMENTARIO'] || r['Observaciones'] || r['OBSERVACIONES'] || r['Detalle'] || r['DETALLE'] || r['Detalle Falla'] || '').trim(),
          fecha_registro: r['Fecha Registro'] || r['FECHA REGISTRO'] || r['Fecha'] || r['FECHA'] || '',
          fecha_cumplimiento: r['Fecha Cumplimiento'] || r['FECHA CUMPLIMIENTO'] || r['Fecha Límite'] || r['FECHA LIMITE'] || r['Vencimiento'] || ''
        })).filter(i => i.cliente || i.situacion || i.comentario)

        if (incidencias.length === 0) {
          throw new Error('No se pudieron extraer columnas válidas para la tabla incidencias_seguimiento. Revisa la fila de encabezados en tu Excel.')
        }

        const res = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync_excel_incidencias',
            incidencias
          })
        })

        const resData = await res.json()
        if (!res.ok || !resData.success) {
          throw new Error(resData.error || resData.message || 'Error al guardar incidencias en Supabase')
        }

        setStats({
          rowsCount: incidencias.length,
          mainCount: resData.total_incidencias_sincronizadas || incidencias.length,
          labelMain: 'Incidencias Insertadas'
        })

        setStatusMsg({
          type: 'success',
          text: `¡Éxito! Se actualizaron e insertaron ${resData.total_incidencias_sincronizadas || incidencias.length} registros en la tabla incidencias_seguimiento.`
        })
      } else {
        // Mapear campos para licitaciones_ofertas
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
          mainCount: uniqueLics.size,
          labelMain: 'Licitaciones Procesadas'
        })

        setStatusMsg({
          type: 'success',
          text: `¡Éxito! Se sincronizaron ${licitaciones.length} renglones y ${uniqueLics.size} licitaciones directamente en Supabase.`
        })
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-300 w-full max-w-xl rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-300 bg-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center border border-slate-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Sincronizador Directo de Excel / CSV</h2>
              <p className="text-xs text-slate-700">Carga inmediata de cualquier hoja o celda hacia Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-700 hover:text-gray-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Target Table Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Tabla / Módulo de Destino en Supabase:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-300">
              <button
                type="button"
                onClick={() => { setTargetTable('incidencias_seguimiento'); setStatusMsg(null); setStats(null); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  targetTable === 'incidencias_seguimiento'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>🚨 Incidencias de Seguimiento</span>
              </button>
              <button
                type="button"
                onClick={() => { setTargetTable('licitaciones_ofertas'); setStatusMsg(null); setStats(null); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  targetTable === 'licitaciones_ofertas'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>📋 Licitaciones & Ofertas</span>
              </button>
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
              file ? 'border-slate-300 bg-emerald-50' : 'border-slate-700 hover:border-indigo-500 bg-white hover:bg-gray-100'
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
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{file.name}</p>
                  <p className="text-xs text-slate-700">{(file.size / 1024).toFixed(1)} KB • Haz clic para cambiar archivo</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Arrastra aquí tu archivo Excel (.xlsx) o CSV con datos de {targetTable === 'incidencias_seguimiento' ? 'Incidencias' : 'Licitaciones'}
                  </p>
                  <p className="text-xs text-slate-700 mt-1">O haz clic para explorar en tus carpetas locales</p>
                </div>
              </>
            )}
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div className={`p-4 rounded-xl text-xs font-medium flex items-start gap-2.5 border ${
              statusMsg.type === 'success' ? 'bg-emerald-50 border-slate-300 text-emerald-700' :
              statusMsg.type === 'error' ? 'bg-rose-50 border-slate-300 text-rose-700' :
              'bg-indigo-50 border-slate-300 text-indigo-700'
            }`}>
              {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />}
              {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-700 mt-0.5" />}
              {statusMsg.type === 'info' && <RefreshCw className="w-4 h-4 shrink-0 text-indigo-700 animate-spin mt-0.5" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-300">
              <div className="text-center">
                <span className="text-[10px] text-slate-700 uppercase font-semibold">Filas Procesadas</span>
                <p className="text-lg font-black text-gray-900 font-mono">{stats.rowsCount}</p>
              </div>
              <div className="text-center border-l border-slate-300">
                <span className="text-[10px] text-slate-700 uppercase font-semibold">{stats.labelMain}</span>
                <p className="text-lg font-black text-emerald-700 font-mono">{stats.mainCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-300 bg-slate-500 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-gray-900 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={processAndSyncExcel}
            disabled={!file || uploading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-gray-900 transition shadow-sm ${
              file && !uploading
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-500 cursor-not-allowed'
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
