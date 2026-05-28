const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('route.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src/app/api'));

let modified = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes("export const dynamic = 'force-dynamic';")) {
    content = "export const dynamic = 'force-dynamic';\n" + content;
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    modified++;
  }
});

console.log(`Updated ${modified} files.`);
