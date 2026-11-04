import { chromium } from '/root/data/workspaces/default_1905469884_FriendMessage_58A810F08DFB31E82F0F0E04FE27B2C9/hydwind-web/node_modules/playwright-core/index.mjs';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const outDir = '/root/data/workspaces/default_1905469884_FriendMessage_58A810F08DFB31E82F0F0E04FE27B2C9/shots/promo';
fs.mkdirSync(outDir, { recursive: true });
const exe = path.join(os.homedir(), '.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });

const pages = [
  ['/', 'home'],
  ['/guides/', 'guides'],
  ['/guides/join/', 'join'],
  ['/people/', 'people'],
];

for (const [view, size, mobile] of [
  ['desktop', { width: 1280, height: 800 }, false],
  ['mobile', { width: 390, height: 844 }, true],
]) {
  const context = await browser.newContext({ viewport: size, deviceScaleFactor: 2, isMobile: mobile });
  const page = await context.newPage();
  for (const [url, name] of pages) {
    await page.goto(`http://127.0.0.1:4331${url}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(900);
    const file = path.join(outDir, `${name}-${view}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`${name}-${view} ok`);
  }
  await context.close();
}
await browser.close();
