const w = require('./live_Data_BI_SHEETS_workflow.json');
console.log('=== WORKFLOW:', w.name, '===');
console.log('Nodes:');
w.nodes.forEach(n => {
  console.log(`  [${n.id}] ${n.name} | Type: ${n.type} | Pos: ${n.position}`);
});
console.log('\nConnections:');
Object.entries(w.connections || {}).forEach(([from, out]) => {
  Object.values(out).forEach(arr => {
    arr.forEach(targets => {
      targets.forEach(t => {
        console.log(`  ${from} -> ${t.node}`);
      });
    });
  });
});
