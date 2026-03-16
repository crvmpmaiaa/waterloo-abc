import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3001';
const scrollY = parseInt(process.argv[3] || '0');
const label = process.argv[4] || 'section';

const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter(f => f.startsWith('screenshot-'));
const num = existing.length + 1;
const filename = `screenshot-${num}-${label}.png`;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await page.waitForFunction(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 2000));
if (scrollY > 0) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await new Promise(r => setTimeout(r, 800));
}
await page.screenshot({ path: path.join(dir, filename), fullPage: false });
console.log(`Saved: ${path.join('temporary screenshots', filename)}`);
await browser.close();
