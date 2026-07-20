import assert from 'node:assert/strict';
import fs from 'node:fs';

const CDP = process.env.SHIOJI_CDP ?? 'http://127.0.0.1:9226';
const requestedGame = new URL(process.env.SHIOJI_URL ?? 'http://localhost:8420/game/shioji/v004/');
requestedGame.searchParams.delete('mode');
const START_GAME = requestedGame.href;
const gameForMode = mode => {
  const url = new URL(START_GAME);
  url.searchParams.set('mode', mode);
  return url.href;
};
const GAME = gameForMode('test');
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

async function newPage(width, height, mobile, url = GAME) {
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
  await page.send('Page.navigate', { url });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await wait(100);
    if (await page.evaluate("document.readyState === 'complete' && Boolean(window.__SHIOJI_V004__)")) {
      return page;
    }
  }
  throw new Error(`v004 did not load: ${page.errors.join(' | ') || 'no runtime error reported'}`);
}

async function checkStartChoice(width, height, mobile, mode) {
  const page = await newPage(width, height, mobile, START_GAME);
  const launcher = await page.evaluate(`(() => {
    const screen = document.querySelector('#start-screen');
    const dialog = screen.querySelector('.start-dialog').getBoundingClientRect();
    const buttons = [...screen.querySelectorAll('[data-start-mode]')];
    return {
      hidden: screen.hidden,
      buttonModes: buttons.map(button => button.dataset.startMode),
      dialog: { left: dialog.left, right: dialog.right, top: dialog.top, bottom: dialog.bottom },
      speed: window.__SHIOJI_V004__.clock.speedIndex,
      startMode: window.__SHIOJI_V004__.startMode,
      buildings: window.__SHIOJI_V004__.model.buildings.map(building => building.type).sort(),
      buildingOptions: [...document.querySelectorAll('#building-kind option')].map(option => option.value),
      households: window.__SHIOJI_V004__.model.households.length,
      roads: window.__SHIOJI_V004__.model.roadKeys.length,
    };
  })()`);
  assert.equal(launcher.hidden, false, JSON.stringify(launcher));
  assert.deepEqual(launcher.buttonModes, ['tutorial', 'sandbox', 'test']);
  assert.equal(launcher.speed, 0);
  assert.equal(launcher.startMode, 'sandbox');
  assert.deepEqual(launcher.buildings, ['port']);
  assert.deepEqual(launcher.buildingOptions.slice(0, 2), ['market', 'warehouse']);
  assert.equal(launcher.households, 0);
  assert.equal(launcher.roads, 0);
  assert.ok(launcher.dialog.left >= 0 && launcher.dialog.right <= width, JSON.stringify(launcher));
  assert.ok(launcher.dialog.top >= 0 && launcher.dialog.bottom <= height, JSON.stringify(launcher));
  await page.screenshot(`/tmp/shioji_v004_start_${mode}_${mobile ? 'mobile' : 'desktop'}.png`);

  await page.evaluate(`document.querySelector('[data-start-mode="${mode}"]').click()`);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await wait(100);
    if (await page.evaluate(`Boolean(window.__SHIOJI_V004__)
      && window.__SHIOJI_V004__.startMode === ${JSON.stringify(mode)}
      && new URLSearchParams(location.search).get('mode') === ${JSON.stringify(mode)}`)) break;
  }
  const started = await page.evaluate(`({
    mode: window.__SHIOJI_V004__.startMode,
    screenHidden: document.querySelector('#start-screen').hidden,
    buildings: window.__SHIOJI_V004__.model.buildings.length,
    households: window.__SHIOJI_V004__.model.households.length,
    roads: window.__SHIOJI_V004__.model.roadKeys.length,
    tutorialState: window.__SHIOJI_V004__.tutorialState,
    objectiveVisible: !document.querySelector('#tutorial-objective').hidden,
    letterVisible: !document.querySelector('#tutorial-letter-modal').hidden,
    letterText: document.querySelector('#tutorial-letter-modal').textContent,
    objectiveBounds: ((box) => ({ left: box.left, right: box.right, top: box.top, bottom: box.bottom }))(
      document.querySelector('#tutorial-objective').getBoundingClientRect()),
    paperBounds: ((box) => ({ left: box.left, right: box.right, top: box.top, bottom: box.bottom }))(
      document.querySelector('.tutorial-paper').getBoundingClientRect()),
    speed: window.__SHIOJI_V004__.clock.speedIndex,
    errors: document.querySelector('#status').textContent,
  })`);
  assert.equal(started.mode, mode, JSON.stringify(started));
  assert.equal(started.screenHidden, true, JSON.stringify(started));
  if (mode === 'test') {
    assert.ok(started.buildings > 3, JSON.stringify(started));
    assert.ok(started.roads > 0, JSON.stringify(started));
  } else {
    assert.equal(started.buildings, 1, JSON.stringify(started));
    assert.equal(started.households, 0, JSON.stringify(started));
    assert.equal(started.roads, 0, JSON.stringify(started));
  }
  if (mode === 'tutorial') {
    assert.equal(started.tutorialState.active, true, JSON.stringify(started));
    assert.equal(started.objectiveVisible, true, JSON.stringify(started));
    assert.equal(started.letterVisible, true, JSON.stringify(started));
    assert.equal(started.speed, 0, JSON.stringify(started));
    assert.match(started.letterText, /0日目/);
    assert.match(started.letterText, /港 1棟・人口 0人・道路 0区画/);
    for (const bounds of [started.objectiveBounds, started.paperBounds]) {
      assert.ok(bounds.left >= 0 && bounds.right <= width, JSON.stringify(started));
      assert.ok(bounds.top >= 0 && bounds.bottom <= height, JSON.stringify(started));
    }
    await page.screenshot(`/tmp/shioji_v004_tutorial_letter_${mobile ? 'mobile' : 'desktop'}.png`);
    const restoredSpeed = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      document.querySelector('#close-tutorial-letter').click();
      const speed = game.clock.speedIndex;
      game.setSpeed(0);
      return speed;
    })()`);
    assert.equal(restoredSpeed, 1);
    await page.screenshot(`/tmp/shioji_v004_tutorial_goal_${mobile ? 'mobile' : 'desktop'}.png`);
    const skip = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const before = { model: game.model, journal: game.controller.inputJournal() };
      document.querySelector('#skip-tutorial').click();
      return {
        before,
        after: { model: game.model, journal: game.controller.inputJournal() },
        state: game.tutorialState,
        objectiveHidden: document.querySelector('#tutorial-objective').hidden,
        lettersHidden: document.querySelector('#open-tutorial-letters').hidden,
        label: document.querySelector('#start-mode-label').textContent,
        save: game.tutorialSave(),
      };
    })()`);
    assert.deepEqual(skip.after, skip.before, JSON.stringify(skip));
    assert.equal(skip.state.active, false, JSON.stringify(skip));
    assert.equal(skip.state.skipped, true, JSON.stringify(skip));
    assert.equal(skip.objectiveHidden, true, JSON.stringify(skip));
    assert.equal(skip.lettersHidden, true, JSON.stringify(skip));
    assert.match(skip.label, /自由プレイ/);
    assert.deepEqual(skip.save.engineJournal, skip.before.journal);
    assert.deepEqual(skip.save.tutorialState, skip.state);
  } else {
    assert.equal(started.tutorialState, null, JSON.stringify(started));
    assert.equal(started.objectiveVisible, false, JSON.stringify(started));
    assert.equal(started.letterVisible, false, JSON.stringify(started));
  }
  await page.screenshot(`/tmp/shioji_v004_started_${mode}_${mobile ? 'mobile' : 'desktop'}.png`);
  assert.deepEqual(page.errors, []);
  page.close();
}

async function checkViewport(width, height, mobile) {
  const page = await newPage(width, height, mobile);
  assert.equal(await page.evaluate('document.title'), 'CHARTER ISLE — 潮路の島 v004');
  assert.equal(await page.evaluate("document.querySelector('[data-testid=build-version]').textContent"), 'Build v004.1.1-tutorial-first-settlers');
  assert.equal(await page.evaluate('window.__SHIOJI_V004__.version'), 'v004.1.1-tutorial-first-settlers');
  assert.equal(await page.evaluate('window.__SHIOJI_V004__.startMode'), 'test');
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
      dock: rect(document.querySelector('#build-dock')),
      observer: rect(document.querySelector('#observer')),
      observerActions: [...document.querySelectorAll('.observer-actions button')].map(rect),
    };
  })()`);
  for (const bounds of [
    controlBounds.hud, controlBounds.speed, controlBounds.dock, controlBounds.observer,
    ...controlBounds.buttons, ...controlBounds.observerActions,
  ]) {
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
  assert.ok(await page.evaluate('window.__SHIOJI_V004__.presentation.pendingCount > 0'));
  await page.evaluate('window.__SHIOJI_V004__.advanceTicks(0, { animate: false })');
  if (!mobile) {
    await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.advanceTicks(1292 - game.model.tick, { animate: false });
      game.advanceTicks(1, { animate: true, baseSeconds: 0.3 });
    })()`);
    await wait(45);
    const dockingVisual = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const ship = game.displayModel.portVisuals[0];
      const handling = game.displayModel.handlingVisuals[0];
      return {
        phase: ship?.phase,
        progress: ship?.progress,
        vesselCargo: ship?.vesselCargo,
        modelVesselCargo: game.model.portCalls[0]?.vesselCargo,
        handlingQty: handling?.qty,
        handlingDerived: handling?.derived,
      };
    })()`);
    assert.equal(dockingVisual.phase, 'approaching', JSON.stringify(dockingVisual));
    assert.ok(dockingVisual.progress > 0 && dockingVisual.progress < 1, JSON.stringify(dockingVisual));
    assert.equal(dockingVisual.vesselCargo, dockingVisual.modelVesselCargo);
    assert.equal(dockingVisual.handlingQty, 1);
    assert.equal(dockingVisual.handlingDerived, true);

    await wait(330);
    assert.equal(await page.evaluate('window.__SHIOJI_V004__.displayModel.portVisuals[0]?.phase'), 'docked');
    await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.advanceTicks(9, { animate: false });
      game.advanceTicks(1, { animate: true, baseSeconds: 0.3 });
    })()`);
    await wait(45);
    const departureVisual = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      return {
        phase: game.displayModel.portVisuals[0]?.phase,
        qty: game.displayModel.handlingVisuals[0]?.qty,
        cart: game.model.carriers.find(carrier => carrier.kind === 'cart')?.id ?? null,
      };
    })()`);
    assert.equal(departureVisual.phase, 'departing', JSON.stringify(departureVisual));
    assert.ok(departureVisual.qty > 0 && departureVisual.qty <= 1, JSON.stringify(departureVisual));
    assert.ok(departureVisual.cart, JSON.stringify(departureVisual));

    await wait(330);
    const carrierPoint = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const carrier = game.displayModel.carriers.find(row => row.kind === 'cart');
      const point = game.camera.project(carrier.x + 0.5, carrier.y + 0.5, 4);
      return { id: carrier.id, x: point.x, y: point.y - 8 * game.camera.zoom };
    })()`);
    await page.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: carrierPoint.x, y: carrierPoint.y, button: 'left', clickCount: 1,
    });
    await page.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: carrierPoint.x, y: carrierPoint.y, button: 'left', clickCount: 1,
    });
    await wait(60);
    const tracking = await page.evaluate(`({
      selected: window.__SHIOJI_V004__.selectedCarrierId,
      hidden: document.querySelector('#tracking').hidden,
      label: document.querySelector('#tracking-label').textContent,
      route: document.querySelector('#tracking-route').textContent,
    })`);
    assert.equal(tracking.selected, carrierPoint.id, JSON.stringify(tracking));
    assert.equal(tracking.hidden, false, JSON.stringify(tracking));
    assert.match(tracking.label, /麦/);
    assert.match(tracking.route, /港.*市場/);
    await page.evaluate('window.__SHIOJI_V004__.stopTracking()');

    await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.advanceTicks(120 * 30 - game.model.tick, { animate: false });
    })()`);
    const worldVisuals = await page.evaluate(`(() => {
      const model = window.__SHIOJI_V004__.model;
      return {
        trails: model.trailRows.length,
        strongestTrail: Math.max(0, ...model.trailRows.map(row => row.stage)),
        raisedBuildings: model.buildings.filter(building => building.cultureLevel > 0).length,
        appearanceKeys: new Set(model.buildings.map(building => building.appearance.key)).size,
        stalls: model.marketStalls.length,
        stock: model.totalVisibleStock,
        familyRows: model.carriers.filter(carrier => carrier.kind === 'household' && carrier.members > 1).length,
      };
    })()`);
    assert.ok(worldVisuals.trails > 100, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.strongestTrail >= 4, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.raisedBuildings > 0, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.appearanceKeys > 5, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.stalls > 0, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.stock > 0, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.familyRows > 0, JSON.stringify(worldVisuals));

    const placement = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      let preview = null;
      for (let y = 0; y < game.model.height && !preview; y += 1) {
        for (let x = 0; x < game.model.width; x += 1) {
          const candidate = game.previewBuilding('woodshop', x, y);
          if (candidate.ok) { preview = candidate; break; }
        }
      }
      const water = game.model.terrain.flatMap((row, y) => row.map((tile, x) => ({ ...tile, x, y })))
        .find(tile => tile.kind === 'water');
      const invalid = game.previewBuilding('woodshop', water.x, water.y);
      document.querySelector('#building-kind').value = 'woodshop';
      document.querySelector('[data-tool="building"]').click();
      game.camera.focus(preview.entrance.x + 0.5, preview.entrance.y + 0.5);
      const point = game.camera.project(preview.entrance.x + 0.5, preview.entrance.y + 0.5);
      return {
        preview,
        invalid: { ok: invalid.ok, reason: invalid.reason },
        point,
        buildingIds: game.model.buildings.map(building => building.id),
      };
    })()`);
    assert.equal(placement.invalid.ok, false);
    assert.match(placement.invalid.reason, /水/);
    await page.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: placement.point.x, y: placement.point.y, button: 'left', clickCount: 1,
    });
    await page.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: placement.point.x, y: placement.point.y, button: 'left', clickCount: 1,
    });
    const placed = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const before = new Set(${JSON.stringify(placement.buildingIds)});
      const building = game.model.buildings.find(row => !before.has(row.id));
      return { building, journal: game.controller.inputJournal().at(-1) };
    })()`);
    assert.equal(placed.building.type, 'woodshop');
    assert.deepEqual(
      { x: placed.building.x, y: placed.building.y, entrance: placed.building.entrance },
      { x: placement.preview.x, y: placement.preview.y, entrance: placement.preview.entrance },
    );
    assert.equal(placed.journal.op.type, 'place_building');

    const removePoint = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      document.querySelector('[data-tool="remove-building"]').click();
      const building = game.model.buildings.find(row => row.id === ${JSON.stringify(placed.building.id)});
      game.camera.focus(building.x + building.width / 2, building.y + building.height / 2);
      return game.camera.project(building.x + building.width / 2, building.y + building.height / 2);
    })()`);
    await page.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: removePoint.x, y: removePoint.y, button: 'left', clickCount: 1,
    });
    await page.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: removePoint.x, y: removePoint.y, button: 'left', clickCount: 1,
    });
    assert.equal(await page.evaluate(`window.__SHIOJI_V004__.model.buildings.some(row => row.id === ${JSON.stringify(placed.building.id)})`), false);
    assert.equal(await page.evaluate('window.__SHIOJI_V004__.controller.inputJournal().at(-1).op.type'), 'remove_building');

    const road = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      let preview = null;
      for (let y = 0; y < game.model.height && !preview; y += 1) {
        for (let x = 0; x < game.model.width; x += 1) {
          const candidate = game.previewRoad({ x, y }, { x, y });
          if (candidate.ok) { preview = candidate; break; }
        }
      }
      document.querySelector('[data-tool="road"]').click();
      game.camera.focus(preview.start.x + 0.5, preview.start.y + 0.5);
      return { preview, point: game.camera.project(preview.start.x + 0.5, preview.start.y + 0.5) };
    })()`);
    await page.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: road.point.x, y: road.point.y, button: 'left', clickCount: 1,
    });
    await page.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: road.point.x, y: road.point.y, button: 'left', clickCount: 1,
    });
    assert.equal(await page.evaluate(`window.__SHIOJI_V004__.model.roadKeys.includes(${JSON.stringify(`${road.preview.start.x},${road.preview.start.y}`)})`), true);
    await page.evaluate("document.querySelector('[data-tool=\"remove-road\"]').click()");
    await page.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: road.point.x, y: road.point.y, button: 'left', clickCount: 1,
    });
    await page.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: road.point.x, y: road.point.y, button: 'left', clickCount: 1,
    });
    assert.equal(await page.evaluate(`window.__SHIOJI_V004__.model.roadKeys.includes(${JSON.stringify(`${road.preview.start.x},${road.preview.start.y}`)})`), false);
    assert.deepEqual(await page.evaluate('window.__SHIOJI_V004__.controller.inputJournal().slice(-2).map(row => row.op.type)'), ['add_road', 'remove_road']);

    const company = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.openSheet('company-sheet');
      const sheet = document.querySelector('#company-sheet').getBoundingClientRect();
      const offer = game.model.orderOffer;
      const orderText = document.querySelector('#order-panel').textContent;
      let targetRow = document.querySelector('.goods-row[data-goods="tools"]');
      targetRow.querySelector('input').value = '12';
      targetRow.querySelector('[data-company-action="set-target"]').click();
      targetRow = document.querySelector('.goods-row[data-goods="tools"]');
      targetRow.querySelector('[data-company-action="release-stock"]').click();
      const beforeReject = game.controller.inputJournal().length;
      document.querySelector('[data-company-action="reject-order"]').click();
      const afterReject = game.controller.inputJournal().length;
      const stillOffered = game.model.orderOffer;
      document.querySelector('[data-company-action="reconsider"]').click();
      document.querySelector('[data-company-action="accept-order"]').click();
      return {
        sheet: { left: sheet.left, right: sheet.right, top: sheet.top, bottom: sheet.bottom },
        offer, orderText, beforeReject, afterReject, stillOffered,
        activeOrder: game.model.activeOrder,
        journalTypes: game.controller.inputJournal().slice(-3).map(row => row.op.type),
      };
    })()`);
    assert.ok(company.sheet.left >= 0 && company.sheet.right <= width, JSON.stringify(company));
    assert.ok(company.sheet.top >= 0 && company.sheet.bottom <= height, JSON.stringify(company));
    assert.ok(company.offer, JSON.stringify(company));
    assert.match(company.orderText, /本国決済単価/);
    assert.match(company.orderText, /市場最安/);
    assert.equal(company.afterReject, company.beforeReject, JSON.stringify(company));
    assert.deepEqual(company.stillOffered, company.offer);
    assert.deepEqual(company.journalTypes, ['set_stock_target', 'release_stock', 'accept_order']);
    assert.equal(company.activeOrder.g, company.offer.g);
    await page.screenshot('/tmp/shioji_v004_company.png');

    const eventPanel = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.openSheet('event-sheet');
      return {
        rows: document.querySelectorAll('.event-row').length,
        operation: game.eventLog.some(row => row.type === 'operation'),
        important: game.eventLog.some(row => row.important),
      };
    })()`);
    assert.ok(eventPanel.rows > 0, JSON.stringify(eventPanel));
    assert.equal(eventPanel.operation, true, JSON.stringify(eventPanel));
    assert.equal(eventPanel.important, true, JSON.stringify(eventPanel));
    await page.screenshot('/tmp/shioji_v004_events.png');
    await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      document.querySelector('[data-close-sheet="event-sheet"]').click();
      game.selectTool(game.activeTool);
      game.camera.focus(game.model.width / 2, game.model.height / 2);
      document.querySelector('#toast-stack').replaceChildren();
    })()`);
  } else {
    const mobileSheet = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.openSheet('company-sheet');
      const box = document.querySelector('#company-sheet').getBoundingClientRect();
      document.querySelector('[data-close-sheet="company-sheet"]').click();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    })()`);
    assert.ok(mobileSheet.left >= 0 && mobileSheet.right <= width, JSON.stringify(mobileSheet));
    assert.ok(mobileSheet.top >= 0 && mobileSheet.bottom <= height, JSON.stringify(mobileSheet));
  }
  await page.screenshot(`/tmp/shioji_v004_browser_${mobile ? 'mobile' : 'desktop'}.png`);
  assert.deepEqual(page.errors, []);
  page.close();
}

await checkStartChoice(1440, 900, false, 'tutorial');
await checkStartChoice(390, 844, true, 'tutorial');
await checkStartChoice(390, 844, true, 'sandbox');
await checkStartChoice(800, 700, false, 'test');
await checkViewport(1440, 900, false);
await checkViewport(390, 844, true);
console.log('CHARTER ISLE v004 browser smoke: PASS');
