// 把语言包接到一份 ScanRuler 构建里：复制 scanruler-zh.js 到 dist/，并在 index.html
// 的 </body> 前插入一个 <script>。原始 index.html 备份为 index.html.orig，可随时撤销。
//
//   node apply.mjs <ScanRuler 目录或 dist 目录>          # 安装
//   node apply.mjs <ScanRuler 目录或 dist 目录> --undo   # 撤销
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const TAG = '<script src="/scanruler-zh.js"></script>';

const args = process.argv.slice(2);
const undo = args.includes('--undo');
const target = args.find((a) => !a.startsWith('--'));
if (!target) {
  console.error('用法：node apply.mjs <ScanRuler 目录或 dist 目录> [--undo]');
  process.exit(1);
}

// 优先装进构建产物 dist/；只有在没有 dist/ 时才退回仓库根目录的 index.html
// （那种情况是给 npm run dev 的本地开发服务器用的）。
function resolveDist(target) {
  const built = path.join(target, 'dist');
  if (fs.existsSync(path.join(built, 'index.html'))) return built;
  if (fs.existsSync(path.join(target, 'index.html'))) return target;
  return null;
}

const dist = resolveDist(target);
if (!dist) {
  console.error(`在 ${target} 下既找不到 dist/index.html，也找不到 index.html：先在上游仓库跑一次 npm run build`);
  process.exit(1);
}
const indexPath = path.join(dist, 'index.html');
const backupPath = path.join(dist, 'index.html.orig');
const scriptPath = path.join(dist, 'scanruler-zh.js');

if (!fs.existsSync(indexPath)) {
  console.error(`找不到 ${indexPath}：先在上游仓库跑一次 npm run build`);
  process.exit(1);
}

if (undo) {
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, indexPath);
    fs.unlinkSync(backupPath);
    console.log('已恢复原来的 index.html');
  } else {
    const html = fs.readFileSync(indexPath, 'utf8');
    const next = html.replace(TAG, '');
    if (next !== html) fs.writeFileSync(indexPath, next, 'utf8');
    console.log('没有备份文件，已就地移除 <script> 标签');
  }
  if (fs.existsSync(scriptPath)) { fs.unlinkSync(scriptPath); console.log('已删除 scanruler-zh.js') }
  process.exit(0);
}

const src = path.join(here, 'dist', 'scanruler-zh.js');
if (!fs.existsSync(src)) {
  console.error('缺少 dist/scanruler-zh.js：先运行 npm run build');
  process.exit(1);
}
fs.copyFileSync(src, scriptPath);

let html = fs.readFileSync(indexPath, 'utf8');
if (!fs.existsSync(backupPath)) fs.copyFileSync(indexPath, backupPath);
if (html.includes(TAG)) {
  console.log('index.html 里已经有语言包，只更新了脚本文件');
} else {
  const injected = html.includes('</body>')
    ? html.replace('</body>', `  ${TAG}\n  </body>`)
    : html + `\n${TAG}\n`;
  fs.writeFileSync(indexPath, injected, 'utf8');
  console.log('已把语言包插入 index.html');
}
console.log(`安装到：${dist}`);
console.log('刷新浏览器即可看到中文界面；Alt+Shift+L 切换中英文。');
