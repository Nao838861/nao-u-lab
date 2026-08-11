import assert from 'node:assert/strict';

const CDP = process.env.CHARTER_CDP || 'http://127.0.0.1:9226';
const ROOT = process.env.CHARTER_URL || 'http://127.0.0.1:8420/game/shioji/v004/';
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
    const result = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return result;
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

  async navigate(url) {
    await this.send('Page.navigate', { url });
    for (let attempt = 0; attempt < 120; attempt += 1) {
      await wait(100);
      if (await this.evaluate('Boolean(window.__SHIOJI_V004__)')) return;
    }
    throw new Error(`game did not load: ${url}`);
  }
}

async function openViewport(width, height, mobile) {
  const target = await fetch(`${CDP}/json/new?${encodeURIComponent('about:blank')}`, {
    method: 'PUT',
  }).then(response => response.json());
  const page = new Page(target.webSocketDebuggerUrl);
  await page.connect();
  await page.send('Network.enable');
  await page.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: mobile ? 2 : 1, mobile,
    screenWidth: width, screenHeight: height,
  });
  return page;
}

async function checkViewport(width, height, mobile) {
  const page = await openViewport(width, height, mobile);
  const sandboxUrl = `${ROOT}?mode=sandbox&acceptance=${mobile ? 'mobile' : 'pc'}`;
  await page.navigate(sandboxUrl);
  const fresh = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const markets = game.model.marketNetwork.markets;
    const main = markets.find(market => market.id === 'main');
    const fishery = markets.find(market => market.id === 'fishery');
    const projected = Object.fromEntries([main, fishery].map(market => [
      market.id, game.camera.project(market.entrance.x + 0.5, market.entrance.y + 0.5),
    ]));
    return {
      version: game.version,
      mode: game.startMode,
      size: [game.model.width, game.model.height],
      markets: markets.map(market => market.name),
      zoom: game.camera.zoom,
      mainAtCenter: Math.abs(projected.main.x - innerWidth / 2) < 2
        && Math.abs(projected.main.y - innerHeight / 2) < 2,
      fisheryVisible: projected.fishery.x >= 0 && projected.fishery.x <= innerWidth
        && projected.fishery.y >= 0 && projected.fishery.y <= innerHeight,
      bootFailure: document.querySelector('#boot-status')?.dataset.state === 'failed',
    };
  })()`);
  assert.equal(fresh.version, 'v004.47.0-playable-96x64', JSON.stringify(fresh));
  assert.equal(fresh.mode, 'sandbox', JSON.stringify(fresh));
  assert.deepEqual(fresh.size, [96, 64], JSON.stringify(fresh));
  assert.deepEqual(fresh.markets, ['母港市場', '漁郷市場'], JSON.stringify(fresh));
  assert.equal(fresh.zoom, 0.38, JSON.stringify(fresh));
  assert.equal(fresh.mainAtCenter, true, JSON.stringify(fresh));
  if (!mobile) assert.equal(fresh.fisheryVisible, true, JSON.stringify(fresh));
  assert.equal(fresh.bootFailure, false, JSON.stringify(fresh));

  await page.navigate(`${ROOT}?mode=tutorial&legacy-fixture=1`);
  const savedSize = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    const payload = game.currentSavePayload();
    payload.mode = 'sandbox';
    payload.tutorialState = null;
    localStorage.setItem('shioji-v004-autosave', JSON.stringify(payload));
    return [payload.engineState.physical.width, payload.engineState.physical.height];
  })()`);
  assert.deepEqual(savedSize, [48, 40]);

  await page.navigate(`${ROOT}?resume=1&legacy-check=${mobile ? 'mobile' : 'pc'}`);
  const resumed = await page.evaluate(`(() => ({
    mode: window.__SHIOJI_V004__.startMode,
    size: [window.__SHIOJI_V004__.model.width, window.__SHIOJI_V004__.model.height],
    zoom: window.__SHIOJI_V004__.camera.zoom,
    status: document.querySelector('#status span').textContent,
  }))()`);
  assert.equal(resumed.mode, 'sandbox', JSON.stringify(resumed));
  assert.deepEqual(resumed.size, [48, 40], JSON.stringify(resumed));
  assert.equal(resumed.zoom, 0.82, JSON.stringify(resumed));
  assert.match(resumed.status, /保存から再開/);
  assert.deepEqual(page.errors, []);
  await page.send('Page.close');
  page.ws.close();
  return { viewport: `${width}x${height}`, fresh, resumed };
}

const results = [];
results.push(await checkViewport(1440, 900, false));
results.push(await checkViewport(390, 844, true));
console.log(JSON.stringify(results));
