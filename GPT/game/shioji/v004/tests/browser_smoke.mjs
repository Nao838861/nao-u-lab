import assert from 'node:assert/strict';
import fs from 'node:fs';

const CDP = process.env.SHIOJI_CDP ?? 'http://127.0.0.1:9226';
const GAME = process.env.SHIOJI_URL ?? 'http://localhost:8420/game/shioji/v004/';
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

class Page {
  constructor(webSocketUrl) {
    this.socket = new WebSocket(webSocketUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.errors = [];
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      } else if (message.method === 'Runtime.exceptionThrown') {
        this.errors.push(message.params.exceptionDetails.exception?.description
          ?? message.params.exceptionDetails.text);
      }
    });
    await this.send('Page.enable');
    await this.send('Runtime.enable');
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    const promise = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression, awaitPromise: true, returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }
    return result.result.value;
  }

  async screenshot(path) {
    const result = await this.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(path, Buffer.from(result.data, 'base64'));
  }

  close() {
    this.socket.close();
  }
}

async function newPage(width, height, mobile) {
  const target = await fetch(`${CDP}/json/new?${encodeURIComponent('about:blank')}`, {
    method: 'PUT',
  }).then(response => response.json());
  const page = new Page(target.webSocketDebuggerUrl);
  await page.connect();
  await page.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
  await page.send('Page.navigate', { url: GAME });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await wait(100);
    if (await page.evaluate("document.readyState === 'complete' && Boolean(window.__SHIOJI_V004__)")) {
      return page;
    }
  }
  throw new Error(`v004 did not load: ${page.errors.join(' | ') || 'no runtime error reported'}`);
}

async function checkViewport(width, height, mobile) {
  const page = await newPage(width, height, mobile);
  assert.equal(await page.evaluate('document.title'), 'CHARTER ISLE — 潮路の島 v004');
  assert.equal(await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  assert.deepEqual(await page.evaluate(`({
    width: window.__SHIOJI_V004__.model.width,
    height: window.__SHIOJI_V004__.model.height,
  })`), { width: 48, height: 40 });
  assert.equal(await page.evaluate("Boolean(document.querySelector('#hud'))"), true);
  const controlBounds = await page.evaluate(`(() => {
    const rect = element => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      hud: rect(document.querySelector('#hud')),
      speed: rect(document.querySelector('#speed-controls')),
      buttons: [...document.querySelectorAll('#speed-controls button')].map(rect),
    };
  })()`);
  for (const bounds of [controlBounds.hud, controlBounds.speed, ...controlBounds.buttons]) {
    assert.ok(bounds.left >= 0 && bounds.right <= controlBounds.viewport.width, JSON.stringify(controlBounds));
    assert.ok(bounds.top >= 0 && bounds.bottom <= controlBounds.viewport.height, JSON.stringify(controlBounds));
  }

  const cameraBefore = await page.evaluate(`({
    x: window.__SHIOJI_V004__.camera.panX,
    y: window.__SHIOJI_V004__.camera.panY,
    zoom: window.__SHIOJI_V004__.camera.zoom,
  })`);
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: width / 2, y: height / 2, button: 'left', clickCount: 1 });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: width / 2 + 45, y: height / 2 + 22, button: 'left', buttons: 1 });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: width / 2 + 45, y: height / 2 + 22, button: 'left', clickCount: 1 });
  const cameraAfterDrag = await page.evaluate(`({
    x: window.__SHIOJI_V004__.camera.panX,
    y: window.__SHIOJI_V004__.camera.panY,
  })`);
  assert.notDeepEqual(cameraAfterDrag, { x: cameraBefore.x, y: cameraBefore.y });
  await page.send('Input.dispatchMouseEvent', {
    type: 'mouseWheel', x: width / 2, y: height / 2, deltaX: 0, deltaY: -80,
  });
  assert.notEqual(await page.evaluate('window.__SHIOJI_V004__.camera.zoom'), cameraBefore.zoom);

  await page.evaluate('window.__SHIOJI_V004__.setSpeed(0)');
  const timeBefore = await page.evaluate(`({
    day: window.__SHIOJI_V004__.model.day,
    tick: window.__SHIOJI_V004__.model.tick,
  })`);
  await page.evaluate("document.querySelector('#step-day').click()");
  assert.deepEqual(await page.evaluate(`({
    day: window.__SHIOJI_V004__.model.day,
    tick: window.__SHIOJI_V004__.model.tick,
  })`), { day: timeBefore.day + 1, tick: timeBefore.tick + 30 });
  await page.screenshot(`/tmp/shioji_v004_browser_${mobile ? 'mobile' : 'desktop'}.png`);
  assert.deepEqual(page.errors, []);
  page.close();
}

await checkViewport(1440, 900, false);
await checkViewport(390, 844, true);
console.log('CHARTER ISLE v004 browser smoke: PASS');
