import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { chromium } from '/root/data/workspaces/default_1905469884_FriendMessage_58A810F08DFB31E82F0F0E04FE27B2C9/hydwind-web/node_modules/playwright-core/index.mjs';

const ROOT = '/root/data/workspaces/default_1905469884_FriendMessage_58A810F08DFB31E82F0F0E04FE27B2C9';
const FILM = path.join(ROOT, 'hydwind-promo/film');
const WEB = path.join(ROOT, 'hydwind-web');
const SHOTS = path.join(ROOT, 'hydwind-promo/assets/shots');
const MIME = { '.html': 'text/html;charset=utf-8', '.js': 'text/javascript;charset=utf-8', '.css': 'text/css;charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2', '.otf': 'font/otf' };
function resolve(u) {
  const c = decodeURIComponent(u.split('?')[0]);
  if (c.startsWith('/styles/')) return path.join(WEB, 'src', c);
  if (c.startsWith('/fonts/')) return path.join(WEB, 'public', c);
  if (c.startsWith('/fonts-extra/')) return '/root/data/plugins/astrbot_plugin_bili_scroll/assets/fonts/NotoSansSC-VF.otf';
  if (c.startsWith('/shots/')) return path.join(SHOTS, c.replace('/shots/', ''));
  if (c === '/' || c === '') return path.join(FILM, 'index.html');
  return path.join(FILM, c);
}
const server = http.createServer((req, res) => {
  fs.readFile(resolve(req.url), (e, b) => {
    if (e) return res.writeHead(404).end('404');
    res.writeHead(200, { 'content-type': MIME[path.extname(resolve(req.url))] || 'application/octet-stream' });
    res.end(b);
  });
});
await new Promise((r) => server.listen(4336, '127.0.0.1', r));
const exe = path.join(os.homedir(), '.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })).newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto('http://127.0.0.1:4336/', { waitUntil: 'networkidle' });
await page.evaluate(() => window.__ready());

const report = await page.evaluate(() => {
  const out = { overflows: [], fonts: {}, boxes: [] };
  const faces = ['Rubik', 'MiSans'];
  faces.forEach((f) => { out.fonts[f] = document.fonts.check(`16px "${f}"`, '氢风'); });
  const check = (t) => {
    window.__renderAt(t);
    return Array.from(document.querySelectorAll('.scene')).map((s) => {
      const r = s.getBoundingClientRect();
      const kids = Array.from(s.querySelectorAll('p,h1,h2,span,div,img')).map((k) => {
        const b = k.getBoundingClientRect();
        return { tag: k.tagName, cls: k.className || '', text: (k.textContent || '').slice(0, 18), w: Math.round(b.width), h: Math.round(b.height), right: Math.round(b.right), bottom: Math.round(b.bottom), op: Number(getComputedStyle(k).opacity) };
      });
      return { id: s.id, visible: Number(getComputedStyle(s).opacity) > 0.1, box: { w: Math.round(r.width), h: Math.round(r.height) }, kids };
    }).filter((s) => s.visible).flatMap((s) => s.kids.map((k) => ({ ...k, scene: s.id })));
  };
  [1.5, 4.6, 8.0, 11.0, 14.0].forEach((t) => out.boxes.push(...check(t)));
  out.overflows = out.boxes.filter((b) => b.right > 1281 || b.bottom > 721 || b.w === 0 && b.text);
  return out;
});

console.log('fonts:', JSON.stringify(report.fonts));
console.log('overflow count:', report.overflows.length);
report.overflows.slice(0, 12).forEach((b) => console.log('  !', b.scene, b.tag, b.cls, b.text, b.w, b.right, b.bottom));
for (const t of [1.5, 4.6, 8.0, 11.0, 14.0]) {
  const rows = report.boxes.filter((b) => b.scene === (t < 3 ? 's1' : t < 6.2 ? 's2' : t < 9.6 ? 's3' : t < 12.4 ? 's4' : 's5'));
  console.log(`t=${t}`, rows.filter((r) => r.text).map((r) => `${r.tag}.${r.cls}:${r.text}(${r.w}x${r.h})`).join(' | ').slice(0, 400));
}
await browser.close();
server.close();
