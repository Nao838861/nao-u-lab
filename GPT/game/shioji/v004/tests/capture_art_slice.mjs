import assert from 'node:assert/strict';
import fs from 'node:fs';

const CDP = process.env.SHIOJI_CDP ?? 'http://127.0.0.1:9226';
const BASE = process.env.SHIOJI_URL ?? 'http://localhost:8420/game/shioji/v004/';
const OUTPUT = new URL('../art_slice_comparison/', import.meta.url);
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

class Page {
  constructor(webSocketUrl, targetId) {
    this.socket = new WebSocket(webSocketUrl);
    this.targetId = targetId;
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
    await this.send('Network.enable');
    await this.send('Network.setCacheDisabled', { cacheDisabled: true });
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
      screenWidth: 1440, screenHeight: 900,
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const result = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return result;
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression, awaitPromise: true, returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }

  async screenshot(path) {
    const result = await this.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(path, Buffer.from(result.data, 'base64'));
  }

  async close() {
    this.socket.close();
    await fetch(`${CDP}/json/close/${this.targetId}`, {
      signal: AbortSignal.timeout(1000),
    }).catch(() => null);
  }
}

async function capture(mode) {
  const target = await fetch(`${CDP}/json/new?${encodeURIComponent('about:blank')}`, {
    method: 'PUT',
  }).then(response => response.json());
  const page = new Page(target.webSocketDebuggerUrl, target.id);
  await page.connect();
  const url = new URL(BASE);
  url.searchParams.set('mode', 'sandbox');
  url.searchParams.set('art-slice', mode);
  url.searchParams.set('capture', Date.now().toString(36));
  await page.send('Page.navigate', { url: url.href });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    await wait(100);
    if (await page.evaluate("document.readyState === 'complete' && Boolean(window.__SHIOJI_V004__)")) break;
  }
  await wait(mode === 'after' ? 3200 : 600);
  const state = await page.evaluate(`({
    ready: Boolean(window.__SHIOJI_V004__),
    mode: document.body.className,
    width: innerWidth,
    height: innerHeight,
    artSlice: window.__SHIOJI_V004__?.renderer.lastFrameMetrics.artSlice ?? false,
    uiVisible: [...document.querySelectorAll('body > :not(canvas):not(script)')]
      .some(node => getComputedStyle(node).display !== 'none' && node.getBoundingClientRect().height > 0),
  })`);
  assert.equal(state.ready, true, JSON.stringify(state));
  assert.deepEqual([state.width, state.height], [1440, 900]);
  assert.equal(state.uiVisible, false, JSON.stringify(state));
  assert.equal(state.artSlice, mode === 'after', JSON.stringify(state));
  assert.deepEqual(page.errors, []);
  fs.mkdirSync(OUTPUT, { recursive: true });
  const path = new URL(`mother_port_${mode}_1440x900.png`, OUTPUT);
  await page.screenshot(path);
  let motionChanged = null;
  if (mode === 'after') {
    const firstFrame = fs.readFileSync(path);
    await wait(900);
    const motionPath = new URL('mother_port_after_motion_1440x900.png', OUTPUT);
    await page.screenshot(motionPath);
    motionChanged = !firstFrame.equals(fs.readFileSync(motionPath));
    assert.equal(motionChanged, true, '船・隊商・鳥の別時刻フレームが変化する');
  }
  await page.close();
  return { mode, path: path.pathname, state, motionChanged };
}

const before = await capture('before');
const after = await capture('after');
console.log(JSON.stringify({ before, after }, null, 2));
