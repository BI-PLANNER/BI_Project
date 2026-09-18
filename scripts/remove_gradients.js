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
      
      // Replace complex gradients with solid minimal colors
      let newContent = content
        .replace(/bg-gradient-to-[a-z]{1,2}\s+from-[a-z0-9\-\/]+\s+(via-[a-z0-9\-\/]+\s+)?to-[a-z0-9\-\/]+/g, 'bg-[#111] border border-[#333]')
        .replace(/shadow-lg\s+shadow-[a-z0-9\-]+\/[0-9]+/g, 'shadow-sm')
        .replace(/shadow-xl\s+shadow-[a-z0-9\-]+\/[0-9]+/g, 'shadow-sm')
        .replace(/shadow-2xl/g, 'shadow-md')
        .replace(/border-[a-z]+-[0-9]+\/[0-9]+/g, 'border-[#333]')
        .replace(/hover:from-[a-z0-9\-]+\s+hover:to-[a-z0-9\-]+/g, 'hover:bg-[#222]')
        .replace(/hover:bg-[a-z]+-[0-9]+\/[0-9]+/g, 'hover:bg-[#222]');

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
console.log('Gradients removed.');
