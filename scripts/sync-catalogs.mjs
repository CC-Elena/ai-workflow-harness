import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Walk directory to get all ts/tsx files
function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Regex to capture JSDoc and the exported function/const name
// Group 1: The JSDoc block (optional)
// Group 2: The exported name
const exportRegex = /(?:\/\*\*([\s\S]*?)\*\/\s*)?export\s+(?:default\s+)?(?:async\s+)?(?:function|const)\s+([A-Za-z0-9_]+)/g;

function cleanJSDoc(rawComment) {
  if (!rawComment) return '';
  return rawComment
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, '').trim())
    .join(' ')
    .trim();
}

function generateCatalogs() {
  const files = walkDir(srcDir);

  const components = [];
  const hooks = [];
  const apis = [];

  for (const file of files) {
    const relativePath = path.relative(rootDir, file);
    const content = fs.readFileSync(file, 'utf-8');
    
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const description = cleanJSDoc(match[1]);
      const name = match[2];

      const item = {
        name,
        path: relativePath,
        description: description || 'No description provided'
      };

      // Classification
      if (relativePath.includes('services/') || relativePath.includes('api/')) {
        apis.push(item);
      } else if (name.startsWith('use')) {
        hooks.push(item);
      } else if (name[0] === name[0].toUpperCase() && file.endsWith('.tsx')) {
        components.push(item);
      }
    }
  }

  // Write files
  fs.writeFileSync(path.join(rootDir, 'components-catalog.json'), JSON.stringify(components, null, 2));
  fs.writeFileSync(path.join(rootDir, 'hooks-catalog.json'), JSON.stringify(hooks, null, 2));
  fs.writeFileSync(path.join(rootDir, 'api-catalog.json'), JSON.stringify(apis, null, 2));

  console.log('Catalogs synced successfully!');
}

generateCatalogs();
