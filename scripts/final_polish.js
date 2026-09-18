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
        .replace(/border-slate-800/g, 'border-slate-200')
        .replace(/border-gray-800/g, 'border-gray-200')
        .replace(/shadow-lg/g, 'shadow-sm')
        .replace(/shadow-md/g, 'shadow-sm') // Flatten it out completely
        // The table headers in the screenshot looked like a dark blue. Let's make sure the dark theme objects are replaced.
        .replace(/bg-blue-950\/40/g, 'bg-blue-50')
        .replace(/bg-purple-950\/40/g, 'bg-purple-50')
        .replace(/bg-amber-950\/40/g, 'bg-amber-50')
        .replace(/bg-emerald-950\/40/g, 'bg-emerald-50')
        .replace(/bg-pink-950\/40/g, 'bg-pink-50')
        .replace(/bg-cyan-950\/40/g, 'bg-cyan-50')
        .replace(/bg-white\/60/g, 'bg-white')
        
        // Remove text colors from badges to make them cleaner
        .replace(/text-blue-300/g, 'text-blue-700')
        .replace(/text-purple-300/g, 'text-purple-700')
        .replace(/text-amber-300/g, 'text-amber-700')
        .replace(/text-emerald-300/g, 'text-emerald-700')
        .replace(/text-pink-300/g, 'text-pink-700')
        .replace(/text-cyan-300/g, 'text-cyan-700')
        .replace(/text-indigo-300/g, 'text-indigo-700')
        .replace(/text-rose-300/g, 'text-rose-700')
        
        // Fix weird text colors
        .replace(/text-gray-100/g, 'text-gray-900')
        .replace(/text-gray-200/g, 'text-gray-800')
        .replace(/text-slate-100/g, 'text-slate-900')
        .replace(/text-slate-200/g, 'text-slate-800')
        
        // Backgrounds on the data table
        .replace(/bg-indigo-950\/80/g, 'bg-indigo-50')
        .replace(/via-slate-900/g, 'via-white')
        .replace(/to-indigo-950\/80/g, 'to-indigo-50')
        
        // Any remaining text-white that shouldn't be there on light backgrounds
        // (Wait, some buttons use text-white, let's leave text-white alone)
        ;

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Final Polish:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
console.log('Final polish applied.');
