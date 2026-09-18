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
      
      // Replace hardcoded dark minimal colors with light minimal colors
      let newContent = content
        .replace(/bg-\[\#111\]/g, 'bg-white')
        .replace(/bg-\[\#222\]/g, 'bg-gray-100')
        .replace(/border-\[\#333\]/g, 'border-gray-200')
        .replace(/text-slate-950/g, 'text-white') // in case we used this for dark text on buttons, wait we didn't add this in script but just in case
        
        // Let's also fix text colors that might be white text on light backgrounds now
        .replace(/text-white/g, 'text-gray-900') 
        .replace(/text-gray-100/g, 'text-gray-800')
        .replace(/text-gray-200/g, 'text-gray-700')
        .replace(/text-gray-300/g, 'text-gray-600')
        .replace(/text-gray-400/g, 'text-gray-500');

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated to light:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
console.log('Light Minimalist colors applied.');
