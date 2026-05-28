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

  // Change Request to NextRequest
  content = content.replace(/export async function (GET|POST|PATCH|DELETE|PUT)\((req|request): Request,/g, 'export async function $1($2: NextRequest,');
  content = content.replace(/export async function (GET|POST|PATCH|DELETE|PUT)\((req|request): Request\)/g, 'export async function $1($2: NextRequest)');

  if (content !== original) {
    // Make sure NextRequest is imported
    if (!content.includes('NextRequest')) {
      if (content.includes("import { NextResponse } from 'next/server';")) {
        content = content.replace("import { NextResponse } from 'next/server';", "import { NextRequest, NextResponse } from 'next/server';");
      } else {
        content = "import { NextRequest } from 'next/server';\n" + content;
      }
    } else {
        // If NextRequest is in the file, ensure it's in the import if NextResponse is there
        if (content.includes("import { NextResponse } from 'next/server';") && !content.includes("import { NextRequest, NextResponse }")) {
            content = content.replace("import { NextResponse } from 'next/server';", "import { NextRequest, NextResponse } from 'next/server';");
        }
    }
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    modified++;
  }
});

console.log(`Updated ${modified} files.`);
