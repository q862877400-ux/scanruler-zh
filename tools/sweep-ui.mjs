// 中文界面下按中文标签切换工作区，收集仍然残留英文的字符串。
// 每个工作区里再把左侧工具磁贴挨个点开，让隐藏的参数面板也渲染出来。
import fs from 'node:fs';

const PORT = 9333;
const APP = 'http://127.0.0.1:4180/';
const OUT = process.argv[2] || '.';

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  }
});
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true });
  ws.addEventListener('error', rej, { once: true });
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, userGesture: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 200));
  return r.result?.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const missing = new Set();
const harvest = async (tag) => {
  const arr = JSON.parse(await evaluate(`JSON.stringify(window.scanrulerZh ? window.scanrulerZh.missing() : [])`));
  let fresh = 0;
  for (const s of arr) if (!missing.has(s)) { missing.add(s); fresh++ }
  if (fresh) console.log(`  ${tag}: +${fresh} → ${missing.size}`);
};

const clickText = (pattern) => evaluate(`(() => {
  const re = ${pattern};
  const el = [...document.querySelectorAll('button,[role=button],[role=tab],a')]
    .find(b => re.test((b.getAttribute('aria-label') || b.textContent || '')));
  if (!el) return 'no';
  el.click();
  return 'ok';
})()`);

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: APP });
await sleep(3000);
await evaluate(`localStorage.setItem('scanruler.lang','zh')`);
await send('Page.reload');
await sleep(9000);
await harvest('start');

// 恢复本地存档（若有），让工作区带内容
await clickText('/^恢复$/');
await sleep(9000);
await harvest('restored');

// 打开示例，作为没有存档时的兜底
await clickText('/打开示例扫描件/');
await sleep(15000);
await harvest('sample');

const tabs = ['/^3D 测量/', '/表面偏差/', '/^壁厚/', '/^2D 测量/', '/逆向工程/', '/网格工具/'];
for (const t of tabs) {
  const r = await clickText(t);
  await sleep(3000);
  await harvest(`tab${t}(${r})`);
  // 把左侧工具磁贴挨个点开
  for (let i = 0; i < 10; i++) {
    const clicked = await evaluate(`(() => {
      const els = [...document.querySelectorAll('aside button, [class*=panel] button, [class*=rail] button, button')]
        .filter(b => b.offsetParent && b.dataset.zhTool !== '1');
      const el = els[${i}];
      if (!el) return 'no';
      el.dataset.zhTool = '1';
      el.click();
      return 'ok';
    })()`);
    await sleep(900);
    await harvest(`tool${i}`);
    await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}))`);
    await sleep(300);
  }
}

const rows = [...missing].sort();
fs.writeFileSync(`${OUT}/missing-sweep2.json`, JSON.stringify(rows, null, 1), 'utf8');
console.log('missing total:', rows.length);
ws.close();
