'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Package,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Truck,
  FileCheck,
  Boxes,
  Layers,
  AlertCircle,
  RefreshCw,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react'
import { dbInsert, dbUpdate } from '@/lib/api_3fn'

export default function EntregasYPedidosPage() {
  const supabase = createClient()
  const [entregas, setEntregas] = useState<any[]>([])
  const [ofertasItems, setOfertasItems] = useState<any[]>([])
  const [estatusList, setEstatusList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Form
  const [formData, setFormData] = useState({
    oferta_item_id: '',
    numero_entrega: 1,
    fecha_programada: new Date().toISOString().split('T')[0],
    cantidad_programada: 1,
    estatus_id: '1',
    numero_acta_recepcion: '',
    observaciones: ''
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch entregas_programadas
      const { data: entData, error } = await supabase
        .from('entregas_programadas')
        .select(`
          *,
          estatus:estatus(*),
          oferta_item:ofertas_items(
            *,
            producto_equipo:productos_equipo(*, marca:marcas(*)),
            licitacion_oferta:licitaciones_ofertas(*, cliente:clientes(*), empresa:empresas(*))
          )
        `)
        .order('fecha_programada', { ascending: false })

      if (error) throw error

      // Fetch items for form selector
      const { data: itData } = await supabase
        .from('ofertas_items')
        .select(`
          *,
          producto_equipo:productos_equipo(*),
          licitacion_oferta:licitaciones_ofertas(*, cliente:clientes(*))
        `)

      const { data: esData } = await supabase.from('estatus').select('*').order('nombre_estatus')

      setEntregas(entData || [])
      setOfertasItems(itData || [])
      setEstatusList(esData || [])
    } catch (err: any) {
      console.error('Error loading entregas:', err)
      setNotification({ type: 'error', message: 'Error cargando entregas: ' + err.message })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        oferta_item_id: Number(formData.oferta_item_id),
        numero_entrega: Number(formData.numero_entrega),
        fecha_programada: formData.fecha_programada,
        cantidad_programada: Number(formData.cantidad_programada),
        estatus_id: Number(formData.estatus_id || 1),
        numero_acta_recepcion: formData.numero_acta_recepcion || null,
        observaciones: formData.observaciones || null
      }

      await dbInsert('entregas_programadas', payload)

      setNotification({ type: 'success', message: 'Entrega programada registrada en Supabase exitosamente.' })
      setShowModal(false)
      loadData()
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Error al registrar: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarEntregado = async (entregaId: number, cantidad: number) => {
    const acta = prompt('Ingresa el número de acta de recepción:')
    if (acta === null) return
    setLoading(true)
    try {
      const estCompletado = estatusList.find(e => e.nombre_estatus.toUpperCase().includes('COMPLETADO'))
      await dbUpdate('entregas_programadas', entregaId, 'entrega_id', {
        estatus_id: estCompletado ? estCompletado.estatus_id : 2,
        fecha_entrega_real: new Date().toISOString().split('T')[0],
        cantidad_entregada_real: cantidad,
        numero_acta_recepcion: acta
      })

      setNotification({ type: 'success', message: 'Entrega actualizada a Completada en Supabase.' })
      loadData()
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Error al actualizar: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const filteredEntregas = entregas.filter(ent => {
    if (search) {
      const q = search.toLowerCase()
      const prod = ent.oferta_item?.producto_equipo?.nombre_producto_equipo || ''
      const cli = ent.oferta_item?.licitacion_oferta?.cliente?.nombre_cliente || ''
      const acta = ent.numero_acta_recepcion || ''
      if (!prod.toLowerCase().includes(q) && !cli.toLowerCase().includes(q) && !acta.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Logística & Despacho • Tabla `entregas_programadas`</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Control de Pedidos & Entregas Programadas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro, actas de recepción de laboratorio y seguimiento de cumplimiento físico de reactivos y equipos en Supabase.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              oferta_item_id: ofertasItems[0]?.oferta_item_id ? String(ofertasItems[0].oferta_item_id) : '',
              numero_entrega: 1,
              fecha_programada: new Date().toISOString().split('T')[0],
              cantidad_programada: 1,
              estatus_id: estatusList[0]?.estatus_id ? String(estatusList[0].estatus_id) : '1',
              numero_acta_recepcion: '',
              observaciones: ''
            })
            setShowModal(true)
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Nueva Entrega</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-medium border animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por producto, cliente o acta..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-xs font-mono text-slate-400 font-semibold">
          {filteredEntregas.length} Envíos
        </span>
      </div>

      {/* Entregas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-400" />
            Cargando entregas desde Supabase...
          </div>
        ) : filteredEntregas.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p className="font-bold text-slate-300">No hay entregas programadas registradas</p>
            <p className="text-xs text-slate-500 mt-1">Usa el botón &quot;Programar Nueva Entrega&quot; para registrar un envío.</p>
          </div>
        ) : (
          filteredEntregas.map(ent => {
            const isCompletado = ent.estatus?.nombre_estatus === 'COMPLETADO' || ent.fecha_entrega_real

            return (
              <div
                key={ent.entrega_id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold font-mono text-indigo-300">
                      Entrega #{ent.numero_entrega} • Programada: {ent.fecha_programada}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      isCompletado
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {ent.estatus?.nombre_estatus || (isCompletado ? 'COMPLETADO' : 'PROGRAMADA')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {ent.oferta_item?.producto_equipo?.nombre_producto_equipo || 'Reactivo / Equipo'}
                  </h3>

                  <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <p>🏢 Cliente: <span className="text-white font-semibold">{ent.oferta_item?.licitacion_oferta?.cliente?.nombre_cliente || 'Institución'}</span></p>
                    <p>📦 Cantidad Programada: <span className="font-mono text-emerald-400 font-bold">{ent.cantidad_programada}</span> unidades</p>
                    {ent.numero_acta_recepcion && (
                      <p>📋 No. Acta Recepción: <span className="font-mono text-indigo-300 font-semibold">{ent.numero_acta_recepcion}</span></p>
                    )}
                    {ent.observaciones && (
                      <p className="text-slate-400 text-[11px] pt-1">Notas: {ent.observaciones}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
                  {!isCompletado && (
                    <button
                      onClick={() => handleMarcarEntregado(ent.entrega_id, ent.cantidad_programada)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Registrar Acta & Completar</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-bold text-white">Programar Entrega de Ítem</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ítem / Producto Ofertado *</label>
                <select
                  value={formData.oferta_item_id}
                  onChange={e => setFormData({ ...formData, oferta_item_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="">-- Seleccionar Producto --</option>
                  {ofertasItems.map(it => (
                    <option key={it.oferta_item_id} value={it.oferta_item_id}>
                      {it.producto_equipo?.nombre_producto_equipo} ({it.licitacion_oferta?.cliente?.nombre_cliente || 'Oferta'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. Entrega *</label>
                  <input
                    type="number"
                    value={formData.numero_entrega}
                    onChange={e => setFormData({ ...formData, numero_entrega: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad *</label>
                  <input
                    type="number"
                    value={formData.cantidad_programada}
                    onChange={e => setFormData({ ...formData, cantidad_programada: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Programada *</label>
                <input
                  type="date"
                  value={formData.fecha_programada}
                  onChange={e => setFormData({ ...formData, fecha_programada: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={2}
                  placeholder="Instrucciones de embalaje, cadena de frío o entrega..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                >
                  Guardar en Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
