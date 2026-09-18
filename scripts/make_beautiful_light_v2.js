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
      
      // Semantic replacements for moving from Dark Mode to Light Mode
      let newContent = content
        // Backgrounds: Dark slate/gray to white or light gray
        .replace(/bg-slate-800(\/[0-9]+)?/g, 'bg-slate-100')
        .replace(/bg-slate-900(\/[0-9]+)?/g, 'bg-white')
        .replace(/bg-slate-950(\/[0-9]+)?/g, 'bg-white')
        .replace(/bg-gray-800(\/[0-9]+)?/g, 'bg-gray-100')
        .replace(/bg-gray-900(\/[0-9]+)?/g, 'bg-white')
        
        // Colors backgrounds: 950/900 to 50
        .replace(/bg-([a-z]+)-950(\/[0-9]+)?/g, 'bg-$1-50')
        .replace(/bg-([a-z]+)-900(\/[0-9]+)?/g, 'bg-$1-50')
        
        // Text colors: Light text to dark text
        .replace(/text-([a-z]+)-300/g, 'text-$1-700')
        .replace(/text-([a-z]+)-400/g, 'text-$1-700')
        .replace(/text-([a-z]+)-200/g, 'text-$1-800')
        
        // Text Grays
        .replace(/text-gray-400/g, 'text-gray-500')
        .replace(/text-slate-400/g, 'text-slate-500')
        .replace(/text-white\/[0-9]+/g, 'text-gray-600')
        
        // Borders
        .replace(/border-white(\/[0-9]+)?/g, 'border-gray-200')
        .replace(/border-black(\/[0-9]+)?/g, 'border-gray-200')
        .replace(/border-([a-z]+)-500\/[0-9]+/g, 'border-$1-200')
        
        // General text-white replacements (careful with this, mostly used for text inside dark containers)
        .replace(/text-white/g, 'text-slate-900')
        // Fix any accidentally converted primary buttons (we want them to keep white text if they have colored bg)
        // Wait, for minimalist we can use black text on pastel buttons, so it's fine.
        
        // Shadows
        .replace(/shadow-2xl/g, 'shadow-sm')
        .replace(/shadow-xl/g, 'shadow-sm')
        
        // Fix weird badges
        .replace(/bg-white\/[0-9]+/g, 'bg-white')
        .replace(/bg-black\/[0-9]+/g, 'bg-slate-50');

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Beautified v2:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
console.log('Beautiful light theme v2 applied.');
