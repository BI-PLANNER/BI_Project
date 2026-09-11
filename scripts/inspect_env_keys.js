const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const keys = [];
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    keys.push(line.substring(0, idx).trim());
  }
});
console.log('Keys in .env.local:', keys);
