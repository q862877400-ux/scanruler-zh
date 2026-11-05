// 把 i18n/ 里的词表与 src/runtime.js 打包成两个可直接使用的产物：
//   dist/scanruler-zh.js       —— <script> 引入（自建部署用）
//   dist/scanruler-zh.user.js  —— 油猴脚本（scanruler.com 或任何自建部署）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.join(root, 'i18n');
const distDir = path.join(root, 'dist');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const files = fs.readdirSync(i18nDir).filter((f) => f.endsWith('.json')).sort();
const dict = {};
const perFile = {};
for (const f of files) {
  const part = JSON.parse(fs.readFileSync(path.join(i18nDir, f), 'utf8'));
  let added = 0;
  for (const [k, v] of Object.entries(part)) {
    if (!v) continue;
    // 先到的文件说了算：zh-00-core.json 是人工精校的高频界面词，不被批量文件覆盖
    if (dict[k] !== undefined) continue;
    dict[k] = v;
    added++;
  }
  perFile[f] = { entries: Object.keys(part).length, added };
}
// 固定顺序，产物可比对
const sorted = {};
for (const k of Object.keys(dict).sort()) sorted[k] = dict[k];

const runtime = fs.readFileSync(path.join(root, 'src/runtime.js'), 'utf8');
const banner =
  `/* ScanRuler 简体中文语言包 v${pkg.version} — AGPL-3.0-only\n` +
  ` * 上游：https://github.com/CNCKitchen/ScanRuler\n` +
  ` * 词表 ${Object.keys(sorted).length} 条。Alt+Shift+L 切换中英文。\n` +
  ` */\n`;
const dictSrc = `window.__SCANRULER_ZH_DICT = ${JSON.stringify(sorted)};\n`;
const bundle = banner + dictSrc + runtime;

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, 'scanruler-zh.js'), bundle, 'utf8');

const meta = `// ==UserScript==
// @name         ScanRuler 简体中文
// @namespace    https://github.com/q862877400-ux/scanruler-zh
// @version      ${pkg.version}
// @description  ScanRuler（CNC Kitchen）界面简体中文语言包：运行时替换，不修改上游代码
// @author       scanruler-zh contributors
// @license      AGPL-3.0-only
// @match        https://scanruler.com/*
// @match        http://localhost/*
// @match        http://127.0.0.1/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
`;
fs.writeFileSync(path.join(distDir, 'scanruler-zh.user.js'), meta + bundle, 'utf8');

fs.writeFileSync(path.join(root, 'dict.json'), JSON.stringify(sorted, null, 1), 'utf8');

const bytes = (p) => fs.statSync(p).size;
console.log(`词表 ${Object.keys(sorted).length} 条（来源 ${files.length} 个文件）`);
for (const [f, s] of Object.entries(perFile)) console.log(`  ${f}: ${s.entries} 条，新增 ${s.added}`);
console.log(`dist/scanruler-zh.js      ${(bytes(path.join(distDir, 'scanruler-zh.js')) / 1024).toFixed(1)} KB`);
console.log(`dist/scanruler-zh.user.js ${(bytes(path.join(distDir, 'scanruler-zh.user.js')) / 1024).toFixed(1)} KB`);
