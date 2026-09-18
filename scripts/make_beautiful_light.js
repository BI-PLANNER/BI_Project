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
      
      // Remove all the ugly hardcoded black/dark colors and replace with premium light colors
      let newContent = content
        // Convert the dark #111 backgrounds to clean white cards with subtle borders
        .replace(/bg-\[\#111\]/g, 'bg-white')
        .replace(/border-\[\#333\]/g, 'border-slate-200')
        // Convert other dark backgrounds
        .replace(/bg-slate-900\/95/g, 'bg-white')
        .replace(/bg-slate-900/g, 'bg-white')
        .replace(/bg-slate-950/g, 'bg-white')
        .replace(/bg-\[\#222\]/g, 'bg-slate-50')
        // Fix text colors on these formerly dark surfaces
        .replace(/text-gray-100/g, 'text-slate-800')
        .replace(/text-gray-200/g, 'text-slate-700')
        .replace(/text-gray-300/g, 'text-slate-600')
        .replace(/text-gray-400/g, 'text-slate-500')
        // Fix some specific Tailwind colors that look bad in light mode
        .replace(/border-white\/10/g, 'border-slate-200')
        .replace(/border-white\/20/g, 'border-slate-200')
        .replace(/bg-white\/5/g, 'bg-slate-50')
        .replace(/bg-white\/10/g, 'bg-slate-100');

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Beautified:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
console.log('Beautiful light theme applied.');
