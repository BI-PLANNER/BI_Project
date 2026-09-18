const fs = require('fs');
const path = require('path');

const pageFilePath = path.join(__dirname, '../src/app/dashboard/fases/page.tsx');
let content = fs.readFileSync(pageFilePath, 'utf8');

const blockStart = `{vistaActiva === 'ENTREGAS_HOSPITAL' && currentContrato.matrizEntregas && (`;
const blockEndMarker = `      {/* 3. VISTA NUMERALES & PROCESOS CON CHECKLIST "COMPLETED" */}`;

if (!content.includes(blockStart) || !content.includes(blockEndMarker)) {
  console.log("Could not find boundaries.");
  process.exit(1);
}

const beforeBlock = content.substring(0, content.indexOf(blockStart));
const afterBlock = content.substring(content.indexOf(blockEndMarker));

const newBlock = `{vistaActiva === 'ENTREGAS_HOSPITAL' && currentContrato.matrizEntregas && (
        <div className="space-y-6 animate-fade-in">
          {/* Selector de Contratos en Fases */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {contratos.map(c => (
              <button
                key={c.id}
                onClick={() => setCurrentContratoId(c.id)}
                className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all \${
                  currentContratoId === c.id 
                  ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-sm'
                  : 'bg-white text-gray-600 border border-slate-300 hover:bg-slate-100'
                }\`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="font-mono font-bold text-amber-700">{c.contrato_num}</span>
                <span>| {c.cliente.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div className="glass-card overflow-hidden border border-slate-300 shadow-sm overflow-x-auto">
            <div className="bg-emerald-50 px-6 py-4 border-b border-slate-300 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-700">
                  {currentContrato.cliente.toUpperCase()}
                </p>
                <h3 className="text-base font-bold text-gray-900">
                  {currentContrato.matrizEntregas.licitacion_ref}
                </h3>
                <p className="text-xs text-emerald-700/80 italic mt-0.5">
                  {currentContrato.matrizEntregas.objeto}
                </p>
              </div>
            </div>

            <div className="min-w-max">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-900 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-4 border-r border-slate-300 bg-white" rowSpan={4}>No.</th>
                    <th className="py-2.5 px-4 border-r border-slate-300 bg-white min-w-[220px] text-left" rowSpan={4}>CENTROS DE ATENCIÓN</th>
                    {currentContrato.matrizEntregas.productos.map((p, pIdx) => (
                      <th key={pIdx} colSpan={p.entregas.length} className="py-1.5 px-2 border-r border-slate-300 border-b border-slate-300 text-xs font-mono bg-emerald-50 text-emerald-800">
                        CÓDIGO: {p.codigo_producto}
                      </th>
                    ))}
                    <th className="py-2.5 px-4 bg-amber-50 text-amber-800" rowSpan={4}>TOTAL HOSPITAL</th>
                  </tr>
                  <tr className="bg-emerald-100/50 font-bold border-b border-slate-300">
                    {currentContrato.matrizEntregas.productos.map((p, pIdx) => (
                      <th key={pIdx} colSpan={p.entregas.length} className="py-1.5 px-2 border-r border-slate-300 text-xs text-emerald-900">
                        {p.nombre_producto}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300">
                    {currentContrato.matrizEntregas.productos.map((p, pIdx) => (
                      <th key={pIdx} colSpan={p.entregas.length} className="py-1 px-2 border-r border-slate-300 text-[10px] text-gray-600 tracking-wider">
                        DÍAS CALEN.
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-slate-50 font-bold border-b border-slate-300 shadow-sm">
                    {currentContrato.matrizEntregas.productos.map((p, pIdx) => (
                      p.entregas.map((ent, eIdx) => (
                        <th key={\`\${pIdx}-\${eIdx}\`} className="py-2 px-3 border-r border-slate-300 text-indigo-700 w-16">
                          {ent.dias}
                        </th>
                      ))
                    ))}
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-slate-300 text-gray-700">
                  {currentContrato.matrizEntregas.hospitales.map((h, hIdx) => {
                    let totalHospital = 0;
                    currentContrato.matrizEntregas!.productos.forEach((p, pIdx) => {
                       p.entregas.forEach((ent, eIdx) => {
                         if (h.cantidades_por_producto && h.cantidades_por_producto[pIdx]) {
                           totalHospital += h.cantidades_por_producto[pIdx][eIdx] || 0;
                         }
                       })
                    });

                    return (
                      <tr key={hIdx} className="hover:bg-slate-100 font-mono transition-colors">
                        <td className="py-2.5 px-4 border-r border-slate-300 font-bold bg-white text-gray-500">{hIdx + 1}</td>
                        <td className="py-2.5 px-4 border-r border-slate-300 text-left font-semibold text-gray-900 bg-white">
                          {h.nombre}
                        </td>
                        {currentContrato.matrizEntregas!.productos.map((p, pIdx) => (
                          p.entregas.map((ent, eIdx) => (
                            <td key={\`val-\${hIdx}-\${pIdx}-\${eIdx}\`} className="py-2.5 px-3 border-r border-slate-300 bg-white/[0.2]">
                              {h.cantidades_por_producto && h.cantidades_por_producto[pIdx] && h.cantidades_por_producto[pIdx][eIdx] > 0 
                                ? h.cantidades_por_producto[pIdx][eIdx].toLocaleString()
                                : ''}
                            </td>
                          ))
                        ))}
                        <td className="py-2.5 px-4 font-bold text-amber-700 bg-amber-50">
                           {totalHospital.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                  
                  {/* Fila de Totales por Entrega */}
                  <tr className="bg-slate-100 font-bold border-t border-slate-300 text-sm">
                    <td colSpan={2} className="py-3 px-4 text-right uppercase text-slate-700 border-r border-slate-300">
                      Total por Entrega
                    </td>
                    {currentContrato.matrizEntregas.productos.map((p, pIdx) => (
                      p.entregas.map((ent, eIdx) => {
                        let sum = 0;
                        currentContrato.matrizEntregas!.hospitales.forEach(h => {
                          if (h.cantidades_por_producto && h.cantidades_por_producto[pIdx]) {
                            sum += h.cantidades_por_producto[pIdx][eIdx] || 0;
                          }
                        });
                        return (
                          <td key={\`sum-\${pIdx}-\${eIdx}\`} className="py-3 px-3 border-r border-slate-300 text-gray-900 font-mono">
                            {sum > 0 ? sum.toLocaleString() : ''}
                          </td>
                        );
                      })
                    ))}
                    <td className="bg-slate-200 border-r border-slate-300"></td>
                  </tr>
                  
                  {/* Fila de Total Global por Producto */}
                  <tr className="bg-emerald-50 font-black border-t-2 border-emerald-300 text-base">
                    <td colSpan={2} className="py-4 px-4 text-right uppercase text-emerald-900 border-r border-slate-300">
                      Total General
                    </td>
                    {currentContrato.matrizEntregas.productos.map((p, pIdx) => {
                      let globalSum = 0;
                      p.entregas.forEach((ent, eIdx) => {
                        currentContrato.matrizEntregas!.hospitales.forEach(h => {
                          if (h.cantidades_por_producto && h.cantidades_por_producto[pIdx]) {
                            globalSum += h.cantidades_por_producto[pIdx][eIdx] || 0;
                          }
                        });
                      });
                      return (
                        <td key={\`global-\${pIdx}\`} colSpan={p.entregas.length} className="py-4 px-3 border-r border-slate-300 text-emerald-800 text-center font-mono">
                          {globalSum.toLocaleString()}
                        </td>
                      );
                    })}
                    <td className="bg-emerald-100 border-r border-slate-300 text-emerald-900 text-center font-mono py-4">
                       {/* Gran Total */}
                       {(() => {
                         let granTotal = 0;
                         currentContrato.matrizEntregas!.hospitales.forEach(h => {
                           currentContrato.matrizEntregas!.productos.forEach((p, pIdx) => {
                             p.entregas.forEach((ent, eIdx) => {
                               if (h.cantidades_por_producto && h.cantidades_por_producto[pIdx]) {
                                 granTotal += h.cantidades_por_producto[pIdx][eIdx] || 0;
                               }
                             });
                           });
                         });
                         return granTotal.toLocaleString();
                       })()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

`;

fs.writeFileSync(pageFilePath, beforeBlock + newBlock + afterBlock, 'utf8');
console.log('UI updated for Multi-product Matrix.');
