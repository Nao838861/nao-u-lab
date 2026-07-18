import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CDP = process.env.CHARTER_CDP || 'http://127.0.0.1:9225';
const GAME = process.env.CHARTER_URL || 'http://localhost:8420/game/shioji/v002/';
const artifacts = path.join(path.dirname(fileURLToPath(import.meta.url)), 'artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

class Page {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 1;
    this.pending = new Map();
    this.errors = [];
  }
  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', event => {
      const msg = JSON.parse(event.data);
      if (msg.id) {
        const p = this.pending.get(msg.id);
        if (!p) return;
        this.pending.delete(msg.id);
        msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') this.errors.push(msg.params.exceptionDetails.text);
    });
    await this.send('Page.enable');
    await this.send('Runtime.enable');
  }
  send(method, params = {}) {
    const id = this.id++;
    const promise = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return promise;
  }
  async eval(expression) {
    const out = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (out.exceptionDetails) throw new Error(out.exceptionDetails.text);
    return out.result.value;
  }
  async screenshot(file) {
    const out = await this.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(path.join(artifacts, file), Buffer.from(out.data, 'base64'));
  }
  async click(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }
  close() { this.ws.close(); }
}

async function newPage(width, height, mobile = false) {
  const target = await fetch(`${CDP}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then(r => r.json());
  const page = new Page(target.webSocketDebuggerUrl);
  await page.connect();
  await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile, screenWidth: width, screenHeight: height });
  await page.send('Page.navigate', { url: GAME });
  for (let i = 0; i < 50; i++) {
    await wait(100);
    if (await page.eval("document.readyState === 'complete' && Boolean(window.__CHARTER__)")) return page;
  }
  throw new Error('game did not load');
}

const BASE = [
  ['fisher', 23, 32], ['fisher', 27, 32], ['veg', 22, 30], ['wheat', 21, 28],
  ['logger', 27, 26], ['woodshop', 24, 30], ['charburner', 26, 29], ['saltworks', 26, 31],
];

async function desktop() {
  const page = await newPage(1440, 900);
  assert.equal(await page.eval('document.title'), 'CHARTER ISLE — 潮路の島');
  assert.equal(await page.eval("getComputedStyle(document.querySelector('#opening')).display !== 'none'"), true);
  assert.equal(await page.eval('document.documentElement.scrollWidth <= innerWidth'), true);
  await page.screenshot('opening-desktop.png');
  await page.eval("document.querySelector('#begin-button').click()");
  await wait(300);
  assert.equal(await page.eval("document.querySelector('#opening').hidden"), true);
  assert.equal(await page.eval('window.__CHARTER__.ship.state'), 'departing');

  const point = await page.eval('window.__CHARTER__.renderer.project(23,32)');
  await page.eval("document.querySelector('[data-tool=fisher]').click()");
  await page.click(point.x, point.y);
  assert.equal(await page.eval("window.__CHARTER__.world.zones.some(z => z.job === 'fisher' && z.x === 23 && z.y === 32)"), true, 'canvas click places a zone');
  await page.eval(`(() => {
    const c = window.__CHARTER__;
    const base = ${JSON.stringify(BASE.slice(1))};
    for (const [job,x,y] of base) c.placeBuilding(job,x,y);
    c.planRoadLine([25,32],[27,26]);
    for (let i=0;i<16;i++) c.world.step();
    for (let i=0;i<100;i++) c.ship.update(.1,c.world.day);
    c.updateHud();
  })()`);
  await wait(500);
  assert.ok(await page.eval('window.__CHARTER__.world.pop() > 0'));
  assert.equal(await page.eval('window.__CHARTER__.ship.state'), 'docked');
  assert.equal(await page.eval("document.body.innerText.includes('デナリ')"), false, '不自然な通貨接尾辞を表示しない');
  assert.match(await page.eval("document.querySelector('#money-value').textContent"), /\d/);
  assert.equal(await page.eval("document.querySelector('#opening').hidden && document.querySelector('#letter-view').hidden"), true, '船の入港で強制モーダルを出さない');
  await page.screenshot('settlement-desktop.png');
  await page.eval(`(() => {
    const c = window.__CHARTER__;
    for (let i=0;i<150;i++) {
      if (c.world.order) c.world.stockTgt[c.world.order.g] = Math.max(c.world.stockTgt[c.world.order.g] || 0, Math.ceil((c.world.stock[c.world.order.g] || 0) + c.world.order.left));
      c.world.stockTgt.wheat = Math.max(c.world.stockTgt.wheat || 0, Math.round(c.world.pop() * 2));
      c.world.step();
      c.ship.update(.4,c.world.day);
    }
    c.renderer.focus(c.world.market.x,c.world.market.y,true);
    c.updateHud();
  })()`);
  await wait(700);
  assert.ok(await page.eval('window.__CHARTER__.world.pop() >= 40'), '成長後に40人以上が暮らす');
  assert.ok(await page.eval(`Object.values(window.__CHARTER__.world.stalls).reduce((n,a)=>n+a.length,0) > 0`), '市場に現物在庫が並ぶ');
  await page.screenshot('flow-desktop.png');
  assert.deepEqual(page.errors, []);
  page.close();
}

async function mobile() {
  const page = await newPage(390, 844, true);
  assert.equal(await page.eval('document.documentElement.scrollWidth <= innerWidth'), true, 'opening fits mobile width');
  const openingRect = await page.eval(`(() => { const r=document.querySelector('.opening-card').getBoundingClientRect(); return {left:r.left,right:r.right,width:r.width}; })()`);
  assert.ok(openingRect.left >= 0 && openingRect.right <= 390, JSON.stringify(openingRect));
  await page.screenshot('opening-mobile.png');
  await page.eval("document.querySelector('#begin-button').click()");
  await wait(350);
  assert.equal(await page.eval("document.querySelector('#build-dock').getBoundingClientRect().right <= innerWidth"), true);
  assert.equal(await page.eval("document.querySelector('#hud').getBoundingClientRect().right <= innerWidth"), true);
  assert.ok(await page.eval("document.querySelector('[data-tool=fisher]').getBoundingClientRect().height >= 44"));
  await page.screenshot('game-mobile.png');
  assert.deepEqual(page.errors, []);
  page.close();
}

await desktop();
await mobile();
console.log('CHARTER ISLE browser smoke: PASS');
