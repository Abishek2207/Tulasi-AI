const fs = require('fs');
const lines = fs.readFileSync('lint_final.txt', 'utf8').split('\n');
let currentFile = '';
for (let line of lines) {
  if (line.match(/^[C-Z]:[\\\/]/i) || line.startsWith('/')) {
    currentFile = line.trim().split(/[\\\/]/).pop();
  } else if (line.includes('error  ')) {
    console.log(`${currentFile}: ${line.trim()}`);
  }
}
