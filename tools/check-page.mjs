// Check the Chinese patch in the running deployment: count what it replaced,
// list what it missed, and grab a screenshot.
import fs from 'node:fs';

const PORT = 9333;
const APP = 'http://127.0.0.1:4180/';
const OUT = process.argv[2] || '.';
const SHOT = process.argv[3] || 'zh.png';

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
const errs = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    return;
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    errs.push(String(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text).slice(0, 260));
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
const evaluate = async (expression, awaitPromise = false) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise, userGesture: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300));
  return r.result?.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: APP });
await sleep(10000);

const info = await evaluate(`JSON.stringify({
  loaded: !!window.__scanrulerZhLoaded,
  lang: window.scanrulerZh && window.scanrulerZh.lang,
  size: window.scanrulerZh && window.scanrulerZh.size,
  title: document.title,
  langAttr: document.documentElement.lang,
})`);
console.log('status:', info);
const missing = await evaluate(`JSON.stringify(window.scanrulerZh ? window.scanrulerZh.missing() : [])`);
const miss = JSON.parse(missing || '[]');
console.log('missing on this screen:', miss.length);
fs.writeFileSync(`${OUT}/missing-${SHOT}.json`, JSON.stringify(miss, null, 1), 'utf8');
if (miss.length) console.log(miss.slice(0, 25).map((s) => '  ' + s.slice(0, 90)).join('\n'));
console.log('js errors:', errs.slice(0, 3).join(' | ') || '(none)');

const shot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(`${OUT}/${SHOT}`, Buffer.from(shot.data, 'base64'));
console.log('screenshot:', SHOT);
ws.close();
