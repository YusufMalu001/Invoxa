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
  let original = content;

  // Replace function signature
  const sigRegex = /export async function (GET|POST|PATCH|DELETE|PUT)\((.*?),\s*\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*id\s*:\s*string\s*\}\s*\}\s*\)\s*\{/g;
  content = content.replace(sigRegex, 'export async function $1($2, { params }: { params: Promise<{ id: string }> }) {');

  // Replace params.id with (await params).id inside route blocks
  // Only replace if the signature was changed
  if (content !== original) {
    content = content.replace(/params\.id/g, '(await params).id');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    modified++;
  }
});

console.log(`Updated ${modified} files.`);
