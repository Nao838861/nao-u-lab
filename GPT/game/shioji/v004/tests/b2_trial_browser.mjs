import assert from 'node:assert/strict';
import fs from 'node:fs';

const CDP = process.env.CHARTER_CDP || 'http://127.0.0.1:9226';
const GAME = process.env.CHARTER_URL
  || 'http://127.0.0.1:8420/game/shioji/v004/?mode=big-island';
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
await page.send('Network.enable');
await page.send('Network.setCacheDisabled', { cacheDisabled: true });
await page.send('Emulation.setDeviceMetricsOverride', {
  width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
  screenWidth: 1440, screenHeight: 900,
});
await page.send('Page.navigate', { url: GAME });
for (let attempt = 0; attempt < 150; attempt += 1) {
  await wait(100);
  if (await page.evaluate("window.__SHIOJI_V004__?.startMode === 'big-island'")) break;
}
assert.equal(
  await page.evaluate("window.__SHIOJI_V004__?.startMode === 'big-island'"),
  true,
  'B2 trial did not load',
);

const result = await page.evaluate(`(() => {
  const game = window.__SHIOJI_V004__;
  const before = game.displayModel;
  let buildingPreview = null;
  for (let y = 175; y <= 220 && !buildingPreview; y += 1) {
    for (let x = 85; x <= 140 && !buildingPreview; x += 1) {
      const candidate = game.previewBuilding('woodshop', x, y);
      if (candidate.ok) buildingPreview = candidate;
    }
  }
  const building = game.controller.operate({
    type: 'place_building', job: 'woodshop',
    x: buildingPreview.entrance.x, y: buildingPreview.entrance.y,
    buildingX: buildingPreview.x, buildingY: buildingPreview.y,
  });
  const road = game.controller.operate({
    type: 'add_road', start: { x: 120, y: 185 }, end: { x: 121, y: 185 },
  });
  const mountain = { x: 67, y: 19 };
  const mountainPreview = game.previewRoad(mountain, mountain);
  const mountainRoad = game.controller.operate({
    type: 'add_road', start: mountain, end: mountain,
  });
  game.advanceTicks(1, { animate: false });
  const after = game.displayModel;
  const save = game.currentSavePayload();
  const pass = game.controller.saveState().b2Trial.passes.P1;
  game.camera.focus(pass.x + 0.5, pass.y + 0.5);
  const passBounds = game.camera.visibleWorldBounds(0);
  const passVisible = pass.x >= passBounds.minX && pass.x <= passBounds.maxX
    && pass.y >= passBounds.minY && pass.y <= passBounds.maxY;
  game.camera.focus(after.worldData.startFocus.x + 0.5, after.worldData.startFocus.y + 0.5);
  game.renderer.render(after, 1 / 60);
  for (let index = 0; index < 120; index += 1) game.renderer.render(after, 1 / 60);
  const samples = [];
  for (let run = 0; run < 5; run += 1) {
    const started = performance.now();
    for (let index = 0; index < 240; index += 1) game.renderer.render(after, 1 / 60);
    samples.push(performance.now() - started);
  }
  samples.sort((left, right) => left - right);
  return {
    version: game.version,
    size: [after.width, after.height],
    startFocus: after.worldData.startFocus,
    population: after.population,
    households: after.households.length,
    buildingsBefore: before.buildings.length,
    buildingsAfter: after.buildings.length,
    marketBuildings: after.buildings.filter(row => row.roles.includes('market')).length,
    marketCandidatesSeeded: game.controller.saveState().marketNetwork.markets.length,
    building,
    road,
    mountainPreview,
    mountainRoad,
    passVisible,
    saveMode: save.mode,
    saveSize: [save.engineState.physical.width, save.engineState.physical.height],
    medianFrameMs: samples[2] / 240,
    frameSamples: samples,
    frameMetrics: game.renderer.lastFrameMetrics,
  };
})()`);

assert.equal(page.errors.length, 0, page.errors.join(' | '));
assert.deepEqual(result.size, [256, 256]);
assert.deepEqual(result.startFocus, { x: 104, y: 201 });
assert.equal(result.households, 12);
assert.equal(result.marketBuildings, 1);
assert.equal(result.marketCandidatesSeeded, 1);
assert.equal(result.building.ok, true);
assert.equal(result.buildingsAfter, result.buildingsBefore + 1);
assert.equal(result.road.ok, true);
assert.equal(result.mountainPreview.ok, false);
assert.match(result.mountainPreview.reason, /山/);
assert.equal(result.mountainRoad.ok, false);
assert.equal(result.passVisible, true);
assert.equal(result.saveMode, 'big-island');
assert.deepEqual(result.saveSize, [256, 256]);
assert.ok(result.medianFrameMs < 16.67, JSON.stringify(result));
assert.ok(result.frameMetrics.terrainDrawn < result.frameMetrics.terrainCandidates);

const screenshot = await page.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
fs.writeFileSync('/tmp/shioji_b2_trial.png', Buffer.from(screenshot.data, 'base64'));
console.log(JSON.stringify(result));
page.ws.close();
