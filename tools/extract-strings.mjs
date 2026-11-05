// Extract user-facing English strings from the built ScanRuler bundles.
// Template literals keep their interpolations as {0}, {1}, … so the runtime
// patch can rebuild them with live values.
import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] || 'dist';
const OUT = process.argv[3] || 'strings.json';

// Library chunks carry the OCCT/manifold error catalogues, not interface text.
const LIBRARY_CHUNK = /(occt|kernel|manifold|meshstep|meshoptimizer|three|__vite-browser-external)/i;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.js$/.test(e.name) && !/\.map$/.test(e.name) && !LIBRARY_CHUNK.test(e.name)) files.push(p);
  }
})(DIST);
const perFile = new Map();

const counts = new Map();
const push = (s) => {
  if (!s) return;
  counts.set(s, (counts.get(s) || 0) + 1);
};

function decode(str) {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

// Scan a JS source for string literals, honouring escapes. Template literals
// have ${…} replaced by {0}, {1}, … in order.
function scan(src) {
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      let j = i + 1;
      let buf = '';
      let tpl = 0;
      let ok = false;
      while (j < n) {
        const d = src[j];
        if (d === '\\') {
          buf += src.slice(j, j + 2);
          j += 2;
          continue;
        }
        if (d === quote) {
          ok = true;
          break;
        }
        if (quote === '`' && d === '$' && src[j + 1] === '{') {
          let depth = 1;
          let k = j + 2;
          while (k < n && depth > 0) {
            if (src[k] === '{') depth++;
            else if (src[k] === '}') depth--;
            k++;
          }
          if (depth !== 0) break;
          buf += `{${tpl++}}`;
          j = k;
          continue;
        }
        if (d === '\n' && quote !== '`') break;
        buf += d;
        j++;
      }
      if (ok) {
        push(decode(buf));
        i = j + 1;
        continue;
      }
    }
    i++;
  }
}

for (const f of files) scan(fs.readFileSync(f, 'utf8'));

// Keep only things that read as interface text.
const CODEISH = [
  /^[a-z][a-z0-9_.:/-]*$/,           // identifiers, paths, css values (lowercase only)
  /^#?[0-9a-f]{3,8}$/i,              // colours, hashes
  /^[0-9.,%°\s+-]+$/,                // pure numbers
  /^[\w-]+\.[a-z0-9]{2,5}$/i,        // file names
  /^(M|L|C|Q|A|Z|H|V)[0-9 .,-]+/,    // svg path data
  /rgba?\(|hsla?\(|translate|matrix/,
  /^[-+]?(m|px|%|mm|deg)/,
];
const hasLetters = (s) => /[A-Za-z]{2}/.test(s);
const hasWord = (s) => /[A-Za-z]{2}/.test(s) && /\s/.test(s.trim());

const kept = [];
for (const [s, c] of counts) {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length < 2 || t.length > 1600) continue;
  if (!hasLetters(t)) continue;
  if (CODEISH.some((re) => re.test(t))) continue;
  if (/^[a-z][a-zA-Z0-9]*$/.test(t) && t.length < 12) continue; // camelCase identifiers
  if (/^(https?:|\/|\.\/|@)/.test(t)) continue;
  // A single capitalised word may still be a label ("Sphere") — keep those.
  const words = t.split(' ');
  if (words.length === 1 && !/^[A-Z][a-z]{2,}$/.test(t)) continue;
  if (words.length === 1 && t.length < 3) continue;
  if (!hasWord(t) && words.length === 1 && !/^[A-Z][A-Za-z]+$/.test(t)) continue;
  kept.push({ s: t, n: c });
}

kept.sort((a, b) => b.n - a.n || a.s.localeCompare(b.s));
fs.writeFileSync(OUT, JSON.stringify(kept, null, 1), 'utf8');
const multi = kept.filter((k) => k.s.includes(' ')).length;
const single = kept.length - multi;
console.log(`files=${files.length} literals=${counts.size} kept=${kept.length} (multi-word=${multi}, single=${single})`);
console.log('sample:', kept.slice(0, 25).map((k) => k.s).join(' | '));
