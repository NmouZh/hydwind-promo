// 把 film/index.html 逐帧渲染成 PNG 序列。
// 用法：node film/render.mjs [fps] [duration]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { chromium } from '/root/data/workspaces/default_1905469884_FriendMessage_58A810F08DFB31E82F0F0E04FE27B2C9/hydwind-web/node_modules/playwright-core/index.mjs';

const ROOT = '/root/data/workspaces/default_1905469884_FriendMessage_58A810F08DFB31E82F0F0E04FE27B2C9';
const FILM = path.join(ROOT, 'hydwind-promo/film');
const WEB = path.join(ROOT, 'hydwind-web');
const SHOTS = path.join(ROOT, 'hydwind-promo/assets/shots');
const OUT = path.join(ROOT, 'hydwind-promo/out/frames');

const FPS = Number(process.argv[2] || 30);
const DURATION = Number(process.argv[3] || 15);
const W = 1280;
const H = 720;
const DSF = 1.5;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.otf': 'font/otf',
  '.svg': 'image/svg+xml',
};

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  if (clean.startsWith('/styles/')) return path.join(WEB, 'src', clean);
  if (clean.startsWith('/fonts/')) return path.join(WEB, 'public', clean);
  if (clean.startsWith('/fonts-extra/')) {
    return '/root/data/plugins/astrbot_plugin_bili_scroll/assets/fonts/NotoSansSC-VF.otf';
  }
  if (clean.startsWith('/shots/')) return path.join(SHOTS, clean.replace('/shots/', ''));
  if (clean === '/' || clean === '') return path.join(FILM, 'index.html');
  return path.join(FILM, clean);
}

const server = http.createServer((req, res) => {
  const file = resolve(req.url);
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
});

await new Promise((r) => server.listen(4335, '127.0.0.1', r));

const exe = path.join(
  os.homedir(),
  '.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell',
);
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--force-color-profile=srgb'] });
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: DSF,
  reducedMotion: 'no-preference',
});
const page = await context.newPage();
page.on('pageerror', (e) => console.error('[page error]', e.message));
page.on('requestfailed', (r) => console.error('[404?]', r.url()));
await page.goto('http://127.0.0.1:4335/', { waitUntil: 'networkidle', timeout: 30000 });
await page.evaluate(() => window.__ready());

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const total = Math.round(FPS * DURATION);
const t0 = Date.now();
for (let i = 0; i < total; i += 1) {
  const t = i / FPS;
  await page.evaluate((time) => window.__renderAt(time), t);
  await page.screenshot({
    path: path.join(OUT, `f${String(i).padStart(5, '0')}.png`),
    animations: 'disabled',
    caret: 'hide',
  });
  if (i % 90 === 0) console.log(`frame ${i}/${total}`);
}
console.log(`rendered ${total} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

await browser.close();
server.close();
