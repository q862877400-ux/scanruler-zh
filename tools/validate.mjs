// 校验词表：覆盖、占位符、残留英文、术语一致性。返回非 0 退出码表示有硬错误。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const i18nDir = path.join(root, 'i18n');
const dict = JSON.parse(fs.readFileSync(path.join(root, 'dict.json'), 'utf8'));
const source = JSON.parse(fs.readFileSync(path.join(root, 'tools/strings.json'), 'utf8'));

// 可以保留英文的词
const ALLOW = [
  'STL', 'STEP', '3MF', 'PLY', 'OBJ', 'IGES', 'GD&T', 'ABS', 'PLA', 'TPU', 'PETG', 'mm',
  'ScanRuler', 'CNC', 'Kitchen', 'GitHub', 'Ko-fi', 'PayPal', 'PNG', 'JPEG', 'SVG', 'DXF',
  'CSV', 'CAD', 'PDF', 'API', 'URL', 'MCP', 'AI', 'WebGL', 'Chrome', 'Edge', 'Firefox',
  'Node', 'Windows', 'macOS', 'Linux', 'SpaceMouse', 'Ctrl', 'Shift', 'Alt', 'Esc', 'Enter',
  'Space', 'Tab', 'STORE', 'x', 'y', 'z', 'u', 'v', 'mm²', 'B-spline', 'Open', 'CASCADE',
  'AGPL-3.0-only', 'HTTPS', 'JSON', 'HTML', 'CSS', 'JS', 'TypeScript', 'Wi-Fi', 'USB',
  'IMPRESSUM', 'DATENSCHUTZERKLÄRUNG', 'Das', 'Data', 'Imp', 'mm', 'µm', 'deg', 'ET',
];

const errors = [];
const warnings = [];

// 1. 覆盖
const missing = source.filter((s) => dict[s] === undefined);
if (missing.length) {
  warnings.push(`未覆盖 ${missing.length} 条（先看前 20）：\n  ` + missing.slice(0, 20).join('\n  '));
}

// 2. 占位符
const phRe = /\{\d+\}/g;
for (const [k, v] of Object.entries(dict)) {
  const a = (k.match(phRe) || []).sort().join(',');
  const b = (v.match(phRe) || []).sort().join(',');
  if (a !== b) errors.push(`占位符不一致：%{k}% -> %{v}%`.replaceAll('%{k}%', k).replaceAll('%{v}%', v));
}

// 3. 残留英文（允许词表之外不应出现）
const wordRe = /[A-Za-z][A-Za-z'’-]{1,}/g;
for (const [k, v] of Object.entries(dict)) {
  if (!v || !/[A-Za-z]/.test(v)) continue;
  const words = (v.match(wordRe) || []).filter((w) => !ALLOW.includes(w));
  if (words.length) warnings.push(`残留英文：${k} → ${v}  [${[...new Set(words)].join(', ')}]`);
}

// 4. 术语一致性：同一英文词根必须落到同一个中文词
const TERMS = [
  ['fit', /拟合/, /[适配]合|匹配|嵌合/],
  ['fillet', /圆角/, /倒圆|圆边/],
  ['chamfer', /倒角/, /斜切|削角/],
  ['deviation', /偏差/, /误差|差异|偏离/],
  ['tolerance', /公差/, /容差|允差/],
  ['section', /剖面/, /截面|断面/],
  ['extrude', /拉伸/, /挤出|挤压/],
  ['revolve', /旋转/, /回转|旋转体/],
  ['fillet/shell', /抽壳/, /掏空|空心/],
  ['thickness', /厚度/, /厚薄/],
  ['mesh', /网格/, /网面|网纹/],
  ['element', /元素/, /要素|元件/],
  ['datum', /基准/, /datum|参考基准/],
];
for (const [term, ok, bad] of TERMS) {
  const hits = [];
  for (const [k, v] of Object.entries(dict)) {
    if (!new RegExp(`\\b${term.split('/')[0]}`, 'i').test(k)) continue;
    if (!ok.test(v) && bad.test(v)) hits.push(`${k} → ${v}`);
  }
  if (hits.length) warnings.push(`术语「${term}」疑似用了同义词：\n  ` + hits.slice(0, 12).join('\n  '));
}

console.log(`词表 ${Object.keys(dict).length} 条；源字符串 ${source.length} 条；覆盖 ${source.length - missing.length}/${source.length}`);
for (const w of warnings.slice(0, 30)) console.log('WARN ' + w);
console.log(`警告 ${warnings.length} 条，错误 ${errors.length} 条`);
for (const e of errors.slice(0, 20)) console.log('ERR ' + e);
if (errors.length) process.exit(1);
