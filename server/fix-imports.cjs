const fs = require('fs');
const path = require('path');

const folder = './dist';

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fixImports(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/from "(.*)"/g, (match, p1) => {
        if (p1.startsWith('.') && !p1.endsWith('.js')) {
          return `from "${p1}.js"`;
        }
        return match;
      });
      fs.writeFileSync(fullPath, content);
    }
  }
}

fixImports(folder);
