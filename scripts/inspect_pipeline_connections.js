const fs = require('fs');
const wf = JSON.parse(fs.readFileSync('scripts/live_Data_BI_SHEETS_workflow.json', 'utf8'));

console.log('--- Nodos y sus tipos ---');
wf.nodes.forEach(n => {
  console.log(`[${n.name}] (id: ${n.id}, type: ${n.type})`);
});

console.log('\n--- Conexiones ---');
console.log(JSON.stringify(wf.connections, null, 2));
