const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

let replacedCount = 0;

walkDir(path.join(__dirname, '..', 'frontend', 'src'), (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace `next-auth/react` with `@/hooks/useSession`
  content = content.replace(/'next-auth\/react'/g, '"@/hooks/useSession"');
  content = content.replace(/"next-auth\/react"/g, '"@/hooks/useSession"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    replacedCount++;
    console.log(`Updated ${filePath}`);
  }
});

console.log(`Finished migrating ${replacedCount} files.`);
