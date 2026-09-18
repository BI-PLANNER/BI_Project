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
        .replace(/border-slate-200/g, 'border-slate-300')
        .replace(/border-gray-200/g, 'border-slate-300')
        .replace(/divide-slate-200/g, 'divide-slate-300')
        .replace(/divide-gray-200/g, 'divide-slate-300')
        // Also increase border radius for a slightly nicer card look if desired, but let's just stick to borders.
        // For tables that use hover:bg-white/[0.02], let's change to hover:bg-slate-100 for better contrast on hover.
        .replace(/hover:bg-white\/\[0\.02\]/g, 'hover:bg-slate-100');

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Darkened borders:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
console.log('Borders darkened.');
