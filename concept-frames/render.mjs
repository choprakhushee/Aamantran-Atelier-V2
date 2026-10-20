// Renders each concept frame HTML to PNG.
// Usage: node render.mjs [spec ...], where spec is name[?query][@WxH], e.g. A-parat-v2?shot=2 or A-parat-v2?shot=1@390x844
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.json':'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(0);
const port = server.address().port;

const names = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(path.join(root, 'frames')).filter(f => f.endsWith('.html')).map(f => f.replace('.html', ''));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
fs.mkdirSync(path.join(root, 'out'), { recursive: true });
for (const spec of names) {
  const [, name, query = '', w = 1600, h = 900] = spec.match(/^([^?@]+)(\?[^@]*)?(?:@(\d+)x(\d+))?$/);
  const out = name + query.replace(/[?&=]/g, '-') + (spec.includes('@') ? `-${w}x${h}` : '');
  const mobile = +w < 800;
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: mobile ? 2 : 1 });
  page.on('console', m => console.log(`[${name}]`, m.text()));
  page.on('pageerror', e => console.log(`[${name}] ERROR`, e.message));
  await page.goto(`http://localhost:${port}/frames/${name}.html${query}`);
  await page.waitForFunction('window.__ready === true', null, { timeout: 120000 });
  await page.screenshot({ path: path.join(root, 'out', `${out}.png`) });
  console.log('rendered', out);
  await page.close();
}
await browser.close();
server.close();
