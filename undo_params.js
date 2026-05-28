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
    } else if (file.endsWith('route.ts') || file.endsWith('page.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src/app'));

let modified = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Revert function signature params: Promise<{ id: string }> to params: { id: string }
  content = content.replace(/\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*Promise<\{\s*id\s*:\s*string\s*\}>\s*\}/g, '{ params }: { params: { id: string } }');
  
  // Revert (await params).id to params.id
  content = content.replace(/\(await params\)\.id/g, 'params.id');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Reverted ${file}`);
    modified++;
  }
});

console.log(`Reverted ${modified} files.`);
