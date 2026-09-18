const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content
        .replace(/divide-white\/\d+/g, 'divide-slate-300')
        .replace(/border-white\/\d+/g, 'border-slate-300');

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Fixed divide/border white opacity:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
console.log('Table divides fixed.');
