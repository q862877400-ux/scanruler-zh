// 从打包产物里还原某个片段所在的字符串字面量（用于取出未翻译的整句原文）。
import fs from 'node:fs';

const file = 'D:/Agent-Studio/Deepseek-Harness/DSH-Oss-Research-and-Deployments/scanruler/dist/assets/index-D_hshijg.js';
const src = fs.readFileSync(file, 'utf8');
const QUOTES = new Set(['`', '"', "'"]);

for (const needle of process.argv.slice(2)) {
  const i = src.indexOf(needle);
  if (i < 0) {
    console.log(`NOT FOUND: ${needle}`);
    continue;
  }
  let start = i;
  while (start > 0 && !QUOTES.has(src[start - 1])) start--;
  let end = i + needle.length;
  while (end < src.length && !QUOTES.has(src[end])) end++;
  const literal = src.slice(start, end);
  console.log(`=== ${needle} (${literal.length} chars) ===`);
  console.log(literal.slice(0, 2000));
  console.log();
}
