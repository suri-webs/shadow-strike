const fs = require('fs');
const path = require('path');

const dir = './';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') || f.endsWith('.html') || f.endsWith('.css'));

const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2500}-\u{257F}]+/gu;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  content = content.replace(/^\s*\/\/.*$/gm, '');

  content = content.replace(/\/\*[\s\S]*?\*\//g, '');

  content = content.replace(/ \/\/.*$/gm, '');

  if (f.endsWith('.html')) {
     content = content.replace(/<!--[\s\S]*?-->/g, '');
  }

  content = content.replace(emojiRegex, '');

  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  fs.writeFileSync(f, content);
});

console.log('Cleanup complete.');
