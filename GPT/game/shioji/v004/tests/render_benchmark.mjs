import assert from 'node:assert/strict';
import fs from 'node:fs';

const CDP = process.env.CHARTER_CDP || 'http://127.0.0.1:9226';
const GAME = process.env.CHARTER_URL || 'http://127.0.0.1:8420/game/shioji/v004/?mode=test';
const FRAMES = 240;
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
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
      } else if (message.method === 'Runtime.exceptionThrown') {
        this.errors.push(message.params.exceptionDetails.exception?.description
          || message.params.exceptionDetails.text);
      }
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

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression, awaitPromise: true, returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result.value;
  }
}

const pages = await fetch(`${CDP}/json/list`).then(response => response.json());
const target = [...pages].reverse().find(page => page.type === 'page')
  || await fetch(`${CDP}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })
    .then(response => response.json());
const page = new Page(target.webSocketDebuggerUrl);
await page.connect();
await page.send('Emulation.setDeviceMetricsOverride', {
  width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
  screenWidth: 1440, screenHeight: 900,
});
await page.send('Page.navigate', { url: GAME });
for (let attempt = 0; attempt < 100; attempt += 1) {
  await wait(100);
  if (await page.evaluate('Boolean(window.__SHIOJI_V004__?.renderer)')) break;
}
assert.equal(await page.evaluate('Boolean(window.__SHIOJI_V004__?.renderer)'), true, 'game did not load');
await page.evaluate(`window.__SHIOJI_V004__.advanceTicks(3600, { animate: false })`);
const result = await page.evaluate(`(() => {
  const game = window.__SHIOJI_V004__;
  for (let index = 0; index < 30; index += 1) game.renderer.render(game.displayModel, 1 / 60);
  const samples = [];
  for (let run = 0; run < 5; run += 1) {
    const started = performance.now();
    for (let index = 0; index < ${FRAMES}; index += 1) {
      game.renderer.render(game.displayModel, 1 / 60);
    }
    samples.push(performance.now() - started);
  }
  samples.sort((left, right) => left - right);
  return {
    build: document.querySelector('#build-version')?.textContent,
    frames: ${FRAMES},
    buildings: game.displayModel.buildings.length,
    carriers: game.displayModel.carriers.length,
    visibleStock: game.displayModel.totalVisibleStock,
    medianTotalMs: samples[Math.floor(samples.length / 2)],
    medianFrameMs: samples[Math.floor(samples.length / 2)] / ${FRAMES},
    samples,
  };
})()`);
assert.equal(page.errors.length, 0, page.errors.join(' | '));
console.log(JSON.stringify(result));
const screenshot = await page.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
fs.writeFileSync('/tmp/shioji_v004_visible_logistics.png', Buffer.from(screenshot.data, 'base64'));
page.ws.close();
