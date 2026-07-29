import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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
const SEASON_SCREENSHOT_DIR = process.env.SHIOJI_SEASON_SCREENSHOT_DIR ?? '/tmp';
const seasonScreenshotPath = filename => path.join(SEASON_SCREENSHOT_DIR, filename);
const GOODS_DETAIL_SCREENSHOT_DIR = process.env.SHIOJI_GOODS_DETAIL_SCREENSHOT_DIR ?? '/tmp';
const goodsDetailScreenshotPath = filename => path.join(GOODS_DETAIL_SCREENSHOT_DIR, filename);
const BOUNDARY_SCREENSHOT_DIR = process.env.SHIOJI_BOUNDARY_SCREENSHOT_DIR ?? '/tmp';
const boundaryScreenshotPath = filename => path.join(BOUNDARY_SCREENSHOT_DIR, filename);
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

class Page {
  constructor(webSocketUrl, targetId) {
    this.socket = new WebSocket(webSocketUrl);
    this.targetId = targetId;
    this.nextId = 1;
    this.pending = new Map();
    this.errors = [];
    this.failModuleRequests = false;
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
      } else if (message.method === 'Fetch.requestPaused' && this.failModuleRequests) {
        this.send('Fetch.failRequest', {
          requestId: message.params.requestId,
          errorReason: 'Failed',
        }).catch(error => this.errors.push(error.message));
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

  async close() {
    this.socket.close();
    await fetch(`${CDP}/json/close/${this.targetId}`).catch(() => null);
  }
}

async function checkBootFailureRecovery() {
  const target = await fetch(`${CDP}/json/new?${encodeURIComponent('about:blank')}`, {
    method: 'PUT',
  }).then(response => response.json());
  const page = new Page(target.webSocketDebuggerUrl, target.id);
  await page.connect();
  page.failModuleRequests = true;
  await page.send('Fetch.enable', {
    patterns: [{ urlPattern: '*src/main.js*', requestStage: 'Request' }],
  });
  await page.send('Page.navigate', { url: START_GAME });
  await wait(500);
  const failure = await page.evaluate(`({
    bootState: document.querySelector('#boot-status').dataset.state,
    bootText: document.querySelector('#boot-status').textContent,
    startVisible: !document.querySelector('#start-screen').hidden,
    retryVisible: !document.querySelector('#retry-boot').hidden,
    gameLoaded: Boolean(window.__SHIOJI_V004__),
  })`);
  assert.equal(failure.gameLoaded, false, JSON.stringify(failure));
  assert.equal(failure.startVisible, true, JSON.stringify(failure));
  assert.equal(failure.bootState, 'failed', JSON.stringify(failure));
  assert.equal(failure.retryVisible, true, JSON.stringify(failure));
  assert.match(failure.bootText, /もう一度読み込/);
  await page.close();
}

async function newPage(width, height, mobile, url = GAME) {
  const target = await fetch(`${CDP}/json/new?${encodeURIComponent('about:blank')}`, {
    method: 'PUT',
  }).then(response => response.json());
  const page = new Page(target.webSocketDebuggerUrl, target.id);
  await page.connect();
  await page.send('Network.enable');
  await page.send('Network.setCacheDisabled', { cacheDisabled: process.env.SHIOJI_CACHE !== '1' });
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

async function waitForBrowserValue(page, expression, {
  timeoutMs = 60_000,
  intervalMs = 100,
  description = 'browser condition',
} = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await page.evaluate(expression);
    if (value) return value;
    await wait(intervalMs);
  }
  throw new Error(`${description} did not become ready within ${timeoutMs}ms`);
}

async function pressKey(page, key, code, modifiers = 0) {
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, modifiers });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, modifiers });
}

async function checkTutorialCompanyPointerStability() {
  const page = await newPage(800, 700, false, gameForMode('tutorial'));
  const setup = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.openTutorialLetter('arrival-report');
    game.closeTutorialLetter();
    game.setSpeed(0);
    game.openSheet('company-sheet');
    const button = document.querySelector('[data-company-action="request-aid"]');
    const box = button.getBoundingClientRect();
    window.__tutorialHeldCompanyButton = button;
    return {
      point: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      domUpdates: game.performanceMetrics().domUpdates,
    };
  })()`);
  await page.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: setup.point.x, y: setup.point.y,
    button: 'left', buttons: 1, clickCount: 1,
  });
  await page.evaluate('window.__SHIOJI_V004__.setSpeed(3)');
  await wait(180);
  const held = await page.evaluate(`({
    connected: document.contains(window.__tutorialHeldCompanyButton),
    same: document.querySelector('[data-company-action="request-aid"]')
      === window.__tutorialHeldCompanyButton,
    domUpdates: window.__SHIOJI_V004__.performanceMetrics().domUpdates,
  })`);
  assert.equal(held.connected, true, JSON.stringify(held));
  assert.equal(held.same, true, JSON.stringify(held));
  assert.ok(held.domUpdates > setup.domUpdates, JSON.stringify(held));
  await page.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: setup.point.x, y: setup.point.y,
    button: 'left', buttons: 0, clickCount: 1,
  });
  await wait(80);
  const result = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    return {
      journal: game.controller.inputJournal().filter(row => row.op.type === 'request_aid'),
      status: document.querySelector('#status span').textContent,
    };
  })()`);
  assert.equal(result.journal.length, 1, JSON.stringify(result));
  assert.match(result.status, /停止|支援/);

  const discoveredAid = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(3);
    game.advanceTicks(3, { animate: false });
    game.setSpeed(0);
    return {
      goods: [...document.querySelectorAll('#company-goods .goods-row')]
        .map(row => row.dataset.goods),
      discoveredGoods: game.discoveredGoods,
    };
  })()`);
  assert.deepEqual(discoveredAid.goods, ['wheat']);
  assert.deepEqual(discoveredAid.discoveredGoods, ['wheat']);
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkTutorialGoalHandoff(width = 1000, height = 760, mobile = false) {
  const page = await newPage(width, height, mobile, gameForMode('tutorial'));
  const transition = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.openTutorialLetter('arrival-report');
    game.closeTutorialLetter();
    game.setSpeed(0);
    const model = game.model;
    const port = model.buildings.find(building => building.roles.includes('port'));
    const candidates = [];
    for (let y = 0; y < model.height; y += 1) {
      for (let x = 0; x < model.width; x += 1) {
        const logger = game.previewBuilding('logger', x, y);
        if (!logger.ok) continue;
        const road = game.previewRoad(port.entrance, logger.entrance);
        if (!road.ok) continue;
        const reachesForest = road.cells.some(cell => {
          for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
              if ((dx || dy)
                && model.terrain[cell.y + dy]?.[cell.x + dx]?.kind === 'forest') return true;
            }
          }
          return false;
        });
        const footprint = new Set(logger.cells.map(cell => cell.x + ',' + cell.y));
        if (!reachesForest || road.cells.some(cell => footprint.has(cell.x + ',' + cell.y))) continue;
        candidates.push({ logger, road });
      }
    }
    const setup = candidates.sort((left, right) => left.road.cells.length - right.road.cells.length)[0];
    if (!setup) throw new Error('tutorial handoff用の木こり配置が見つかりません');
    window.__tutorialFirstLoggerSetup = setup;
    game.controller.operate({
      type: 'add_road', start: setup.road.start, end: setup.road.end,
    });
    game.advanceTicks(0, { animate: false });
    const observer = document.querySelector('#observer').getBoundingClientRect();
    const dock = document.querySelector('#build-dock').getBoundingClientRect();
    return {
      handoff: game.tutorialHandoff,
      objective: game.tutorialState.completedGoals,
      priority: document.querySelector('#secretary').dataset.secretaryPriority,
      speech: document.querySelector('#secretary-speech').textContent,
      objectiveHidden: document.querySelector('#tutorial-objective').hidden,
      memoChapter: document.querySelector('#tutorial-chapter').textContent,
      memoTitle: document.querySelector('#tutorial-goal').textContent,
      observer: { top: observer.top, bottom: observer.bottom, width: observer.width },
      dock: { top: dock.top, bottom: dock.bottom },
    };
  })()`);
  assert.equal(transition.handoff.completedId, 'first-road-and-logger', JSON.stringify(transition));
  assert.equal(transition.handoff.nextId, 'first-logger', JSON.stringify(transition));
  assert.ok(transition.objective.includes('first-road-and-logger'), JSON.stringify(transition));
  assert.equal(transition.priority, 'goal-complete', JSON.stringify(transition));
  assert.match(transition.speech, /森まで道が届きました.*木こりを建てましょう/s);
  assert.equal(transition.objectiveHidden, true, '達成中は次の現在目標を見せない');
  assert.ok(
    mobile
      ? transition.observer.width >= width - 20
      : transition.observer.width >= Math.min(600, width - 450)
        && transition.observer.width <= 650,
    JSON.stringify(transition),
  );
  assert.ok(transition.observer.bottom < transition.dock.top, JSON.stringify(transition));

  await wait(3200);
  const stillReadable = await page.evaluate(`({
    pending: window.__SHIOJI_V004__.tutorialTransitionPending,
    handoff: window.__SHIOJI_V004__.tutorialHandoff,
    priority: document.querySelector('#secretary').dataset.secretaryPriority,
    speech: document.querySelector('#secretary-speech').textContent,
  })`);
  assert.equal(stillReadable.pending, false, JSON.stringify(stillReadable));
  assert.equal(stillReadable.handoff.completedId, 'first-road-and-logger',
    JSON.stringify(stillReadable));
  assert.equal(stillReadable.priority, 'goal-complete', JSON.stringify(stillReadable));
  assert.match(stillReadable.speech, /森まで道が届きました/);
  await page.screenshot(`/tmp/shioji_v004_tutorial_road_handoff_${mobile ? 'mobile' : 'desktop'}.png`);

  let switching = null;
  for (let attempt = 0; attempt < 180; attempt += 1) {
    switching = await page.evaluate(`({
      pending: window.__SHIOJI_V004__.tutorialTransitionPending,
      handoff: window.__SHIOJI_V004__.tutorialHandoff,
      objectiveHidden: document.querySelector('#tutorial-objective').hidden,
      secretarySwitching: document.querySelector('#secretary').classList.contains('guidance-switching'),
    })`);
    if (switching.pending || switching.handoff === null) break;
    await wait(20);
  }
  if (switching.pending) {
    assert.equal(switching.handoff.completedId, 'first-road-and-logger', JSON.stringify(switching));
    assert.equal(switching.objectiveHidden, true, JSON.stringify(switching));
    assert.equal(switching.secretarySwitching, true, JSON.stringify(switching));
    await wait(280);
  }

  const loggerObjective = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    return {
      handoff: game.tutorialHandoff,
      transitionPending: game.tutorialTransitionPending,
      priority: document.querySelector('#secretary').dataset.secretaryPriority,
      speech: document.querySelector('#secretary-speech').textContent,
      objectiveHidden: document.querySelector('#tutorial-objective').hidden,
      memoChapter: document.querySelector('#tutorial-chapter').textContent,
      memoTitle: document.querySelector('#tutorial-goal').textContent,
      action: document.querySelector('#tutorial-action').textContent,
      secretaryEntering: document.querySelector('#secretary').classList.contains('guidance-entering'),
      objectiveEntering: document.querySelector('#tutorial-objective').classList.contains('guidance-entering'),
    };
  })()`);
  assert.equal(loggerObjective.handoff, null, JSON.stringify(loggerObjective));
  assert.equal(loggerObjective.transitionPending, false, JSON.stringify(loggerObjective));
  assert.equal(loggerObjective.priority, 'objective', JSON.stringify(loggerObjective));
  assert.match(loggerObjective.speech, /今度は.*木こりを建てましょう/s);
  assert.equal(loggerObjective.objectiveHidden, false);
  assert.match(loggerObjective.memoChapter, /第一章/);
  assert.match(loggerObjective.memoTitle, /配置予測の日産が高い森近く/);
  assert.equal(loggerObjective.action, '木こりを選ぶ');
  if (switching.pending) {
    assert.equal(loggerObjective.secretaryEntering, true, JSON.stringify(loggerObjective));
    assert.equal(loggerObjective.objectiveEntering, true, JSON.stringify(loggerObjective));
  }
  await page.screenshot(`/tmp/shioji_v004_tutorial_logger_goal_${mobile ? 'mobile' : 'desktop'}.png`);

  const loggerTransition = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const setup = window.__tutorialFirstLoggerSetup;
    game.controller.operate({
      type: 'place_building', job: 'logger',
      x: setup.logger.entrance.x, y: setup.logger.entrance.y,
      buildingX: setup.logger.x, buildingY: setup.logger.y,
    });
    game.advanceTicks(0, { animate: false });
    return {
      handoff: game.tutorialHandoff,
      objectives: game.tutorialState.completedGoals,
      priority: document.querySelector('#secretary').dataset.secretaryPriority,
      speech: document.querySelector('#secretary-speech').textContent,
      objectiveHidden: document.querySelector('#tutorial-objective').hidden,
    };
  })()`);
  assert.equal(loggerTransition.handoff.completedId, 'first-logger', JSON.stringify(loggerTransition));
  assert.equal(loggerTransition.handoff.nextId, 'market-for-logs', JSON.stringify(loggerTransition));
  assert.ok(loggerTransition.objectives.includes('first-road-and-logger'), JSON.stringify(loggerTransition));
  assert.ok(loggerTransition.objectives.includes('first-logger'), JSON.stringify(loggerTransition));
  assert.equal(loggerTransition.priority, 'goal-complete', JSON.stringify(loggerTransition));
  assert.match(loggerTransition.speech, /木こりが建ちました.*まだ丸太を売る場所はありません/s);
  assert.equal(loggerTransition.objectiveHidden, true);
  await page.screenshot(`/tmp/shioji_v004_tutorial_logger_handoff_${mobile ? 'mobile' : 'desktop'}.png`);

  await wait(5900);
  const continued = await page.evaluate(`(() => ({
    handoff: window.__SHIOJI_V004__.tutorialHandoff,
    priority: document.querySelector('#secretary').dataset.secretaryPriority,
    speech: document.querySelector('#secretary-speech').textContent,
    objectiveHidden: document.querySelector('#tutorial-objective').hidden,
    memoTitle: document.querySelector('#tutorial-goal').textContent,
    action: document.querySelector('#tutorial-action').textContent,
  }))()`);
  assert.equal(continued.handoff, null, JSON.stringify(continued));
  assert.equal(continued.priority, 'objective', JSON.stringify(continued));
  assert.match(continued.speech, /木こりが丸太を売れるよう.*市場を開きましょう/s);
  assert.equal(continued.objectiveHidden, false);
  assert.match(continued.memoTitle, /市場/);
  assert.equal(continued.action, '市場を選ぶ');
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkGoodsDiscovery() {
  const page = await newPage(1440, 900, false, gameForMode('tutorial'));
  const result = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    game.openSheet('supply-sheet');
    const initial = {
      rows: document.querySelectorAll('#supply-grid [data-supply-goods]').length,
      text: document.querySelector('#supply-grid').textContent.trim(),
    };
    document.querySelector('[data-close-sheet="supply-sheet"]').click();
    game.openTutorialLetter('arrival-report');
    game.closeTutorialLetter();
    const model = game.model;
    const port = model.buildings.find(building => building.roles.includes('port'));
    const candidates = [];
    for (let y = 0; y < model.height; y += 1) {
      for (let x = 0; x < model.width; x += 1) {
        const logger = game.previewBuilding('logger', x, y);
        if (!logger.ok) continue;
        const road = game.previewRoad(port.entrance, logger.entrance);
        if (!road.ok) continue;
        const reachesForest = road.cells.some(cell => {
          for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
              if ((dx || dy)
                && model.terrain[cell.y + dy]?.[cell.x + dx]?.kind === 'forest') return true;
            }
          }
          return false;
        });
        const footprint = new Set(logger.cells.map(cell => cell.x + ',' + cell.y));
        if (!reachesForest || road.cells.some(cell => footprint.has(cell.x + ',' + cell.y))) continue;
        candidates.push({ logger, road });
      }
    }
    const setup = candidates.sort((left, right) => left.road.cells.length - right.road.cells.length)[0];
    if (!setup) throw new Error('品目出会い確認用の木こり配置が見つかりません');
    const roadResult = game.controller.operate({
      type: 'add_road', start: setup.road.start, end: setup.road.end,
    });
    const loggerResult = game.controller.operate({
      type: 'place_building', job: 'logger',
      x: setup.logger.entrance.x, y: setup.logger.entrance.y,
      buildingX: setup.logger.x, buildingY: setup.logger.y,
    });
    if (!roadResult.ok || !loggerResult.ok) throw new Error('木こりを配置できません');
    game.advanceTicks(0, { animate: false });
    for (let day = 0; day < 45 && !game.discoveredGoods.includes('log'); day += 1) {
      game.advanceTicks(30, { animate: false });
    }
    game.openSheet('supply-sheet');
    return {
      initial,
      day: game.model.day,
      discoveredGoods: game.discoveredGoods,
      rows: [...document.querySelectorAll('#supply-grid [data-supply-goods]')]
        .map(row => row.dataset.supplyGoods),
      speech: document.querySelector('#secretary-speech').textContent,
      priority: document.querySelector('#secretary').dataset.secretaryPriority,
    };
  })()`);
  assert.deepEqual(result.initial, { rows: 0, text: 'まだ島に品がありません' });
  assert.deepEqual(result.discoveredGoods, ['log']);
  assert.deepEqual(result.rows, ['log']);
  assert.equal(result.priority, 'goods-discovery');
  assert.match(result.speech, /丸太が採れました.*木製品と木炭に加工できます/s);
  await page.screenshot(path.join(
    process.env.SHIOJI_GOODS_SCREENSHOT_DIR ?? new URL('./artifacts', import.meta.url).pathname,
    'goods_discovery_first_log.png',
  ));
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkSecretaryEventLifecycle() {
  const page = await newPage(1440, 900, false, GAME);
  const shown = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    for (let day = 0; day < 120; day += 1) {
      game.advanceTicks(30, { animate: false });
      const birth = [...game.eventLog].reverse().find(row => row.type === 'birth');
      if (!birth) continue;
      const route = game.secretaryRoute;
      return {
        day: game.model.day,
        birthSequence: birth.sequence,
        routeSequence: route?.target?.sequence ?? null,
        priority: route?.priority ?? null,
        speech: document.querySelector('#secretary-speech').textContent,
        width: document.querySelector('#observer').getBoundingClientRect().width,
      };
    }
    return null;
  })()`);
  assert.ok(shown, '120日以内の実出生イベントを表示できる');
  assert.ok(shown.width >= 600 && shown.width <= 650, JSON.stringify(shown));

  let birthRoute = shown;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (birthRoute.routeSequence === shown.birthSequence) break;
    await wait(500);
    birthRoute = await page.evaluate(`(() => ({
      routeSequence: window.__SHIOJI_V004__.secretaryRoute?.target?.sequence ?? null,
      priority: window.__SHIOJI_V004__.secretaryRoute?.priority ?? null,
      speech: document.querySelector('#secretary-speech').textContent,
    }))()`);
  }
  assert.equal(birthRoute.priority, 'important-event', JSON.stringify(birthRoute));
  assert.equal(birthRoute.routeSequence, shown.birthSequence, JSON.stringify(birthRoute));
  assert.match(birthRoute.speech, /新しい子どもが生まれました/);

  let after = null;
  for (let attempt = 0; attempt < 24; attempt += 1) {
    await wait(500);
    after = await page.evaluate(`(() => ({
      priority: window.__SHIOJI_V004__.secretaryRoute?.priority ?? null,
      sequence: window.__SHIOJI_V004__.secretaryRoute?.target?.sequence ?? null,
      speech: document.querySelector('#secretary-speech').textContent,
    }))()`);
    if (after.sequence !== shown.birthSequence) break;
  }
  assert.notEqual(after.sequence, shown.birthSequence,
    `出生発話が読み終えた後も常駐し続けています: ${JSON.stringify(after)}`);
  assert.doesNotMatch(after.speech, /新しい子どもが生まれました/);
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkBuildingLevelVisuals(width = 1440, height = 900, mobile = false) {
  const page = await newPage(width, height, mobile, GAME);
  const checkpoints = [30, 90, 270, 720];
  const observations = [];
  for (const day of checkpoints) {
    const observation = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.setSpeed(0);
      game.advanceTicks(Math.max(0, ${day} * 30 - game.model.tick), { animate: false });
      const buildings = game.model.buildings.filter(row => row.cultureLeveled);
      const occupied = buildings.filter(row => !row.vacant);
      const levels = [...new Set(occupied.map(row => row.appearance.level))].sort((a, b) => a - b);
      const stages = Object.fromEntries(levels.map(level => {
        const rows = occupied.filter(row => row.appearance.level === level);
        return [level, {
          count: rows.length,
          structures: rows.filter(row => row.appearance.structureVisible).length,
          tools: [...new Set(rows.map(row => row.appearance.toolCount))],
          banners: [...new Set(rows.map(row => row.appearance.bannerCount))],
        }];
      }));
      const center = buildings.reduce((sum, row) => ({
        x: sum.x + row.x + row.width / 2,
        y: sum.y + row.y + row.height / 2,
      }), { x: 0, y: 0 });
      if (buildings.length) {
        game.camera.zoom = ${mobile ? 0.56 : 0.82};
        game.camera.focus(center.x / buildings.length, center.y / buildings.length);
      }
      const calls = [];
      const drawWorldObjects = game.renderer.drawWorldObjects.bind(game.renderer);
      const drawWorldOverlays = game.renderer.drawWorldOverlays.bind(game.renderer);
      game.renderer.drawWorldObjects = model => {
        calls.push('world');
        return drawWorldObjects(model);
      };
      game.renderer.drawWorldOverlays = model => {
        calls.push('overlay');
        return drawWorldOverlays(model);
      };
      game.renderer.render(game.displayModel, 0);
      game.renderer.drawWorldObjects = drawWorldObjects;
      game.renderer.drawWorldOverlays = drawWorldOverlays;
      return {
        day: game.model.day,
        levels,
        stages,
        vacant: buildings.filter(row => row.vacant).length,
        abandoned: buildings.filter(row => row.vacant && row.appearance.abandoned).length,
        calls,
      };
    })()`);
    observations.push(observation);
    await wait(120);
    await page.screenshot(
      `/tmp/shioji_v004_building_levels_${mobile ? 'mobile' : 'desktop'}_day${day}.png`,
    );
  }

  assert.deepEqual(observations[0].levels, [1], JSON.stringify(observations[0]));
  assert.ok(observations[0].vacant > 0, JSON.stringify(observations[0]));
  assert.equal(observations[0].abandoned, observations[0].vacant,
    '無人建物はすべて荒廃外観へ写す');
  assert.equal(observations[0].stages[1].structures, 0,
    'Lv1は建屋を立てず道具だけを見せる');
  assert.ok(observations[1].levels.includes(1) && observations[1].levels.includes(2),
    JSON.stringify(observations[1]));
  assert.ok(observations[2].levels.includes(3), JSON.stringify(observations[2]));
  assert.ok(observations[3].levels.includes(4), JSON.stringify(observations[3]));
  assert.deepEqual(observations[0].stages[1].tools, [1]);
  assert.deepEqual(observations[1].stages[2].tools, [2]);
  assert.deepEqual(observations[2].stages[3].tools, [4]);
  assert.deepEqual(observations[3].stages[4].tools, [6]);
  assert.deepEqual(observations[0].stages[1].banners, [1]);
  assert.deepEqual(observations[1].stages[2].banners, [2]);
  assert.deepEqual(observations[2].stages[3].banners, [3]);
  assert.deepEqual(observations[3].stages[4].banners, [4]);
  assert.deepEqual(observations[3].calls.slice(-2), ['world', 'overlay'],
    '危機・警告overlayを建物と人物より後に描く');
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkReadabilityUi(width = 1440, height = 900, mobile = false) {
  const page = await newPage(width, height, mobile);
  const hud = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    game.advanceTicks(60 * 30, { animate: false });
    const food = document.querySelector('#food-runway');
    const box = food.getBoundingClientRect();
    return {
      text: food.textContent,
      tone: food.dataset.tone,
      box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
    };
  })()`);
  assert.match(hud.text, /島の食料.*あと\d+日分 (?:→|↘|↘↘)/s);
  assert.ok(['steady', 'warning', 'danger'].includes(hud.tone));
  assert.ok(hud.box.left >= 0 && hud.box.right <= width, JSON.stringify(hud));
  assert.ok(hud.box.top >= 0 && hud.box.bottom <= height, JSON.stringify(hud));

  await page.evaluate("document.querySelector('#food-runway').click()");
  await wait(200);
  const island = await page.evaluate(`(() => {
    const sheet = document.querySelector('#island-sheet');
    const chart = document.querySelector('[data-chart="food-stock"]');
    const box = sheet.getBoundingClientRect();
    return {
      hidden: sheet.hidden,
      forecast: document.querySelector('#winter-forecast').textContent,
      chartVisible: chart.getBoundingClientRect().top < box.bottom
        && chart.getBoundingClientRect().bottom > box.top,
      box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
    };
  })()`);
  assert.equal(island.hidden, false);
  assert.match(island.forecast, /必要 約[\d,]+荷.*備え [\d,]+荷/s);
  assert.equal(island.chartVisible, true, JSON.stringify(island));
  await page.screenshot(`/tmp/shioji_v004_readability_island_${mobile ? 'mobile' : 'desktop'}.png`);

  const building = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    document.querySelector('[data-close-sheet="island-sheet"]').click();
    const buildingIds = new Set(game.model.households.map(row => row.buildingId));
    const home = game.model.buildings.find(row => buildingIds.has(row.id));
    game.selectBuilding(home);
    const sheet = document.querySelector('#building-sheet');
    const text = sheet.textContent;
    const box = sheet.getBoundingClientRect();
    const observer = document.querySelector('#observer').getBoundingClientRect();
    return {
      title: document.querySelector('#building-sheet-title').textContent,
      health: document.querySelector('#building-summary').textContent,
      text,
      positions: ['食料', '財布', '最近の収支', '次の暮らし', '仕事のいま', '在庫']
        .map(label => text.indexOf(label)),
      box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      observer: {
        left: observer.left, right: observer.right,
        top: observer.top, bottom: observer.bottom,
      },
    };
  })()`);
  assert.match(building.title, /の.+家 Lv\d+$/);
  assert.match(building.health, /順調|⚠/);
  assert.ok(building.positions.every(position => position >= 0), JSON.stringify(building));
  assert.deepEqual([...building.positions].sort((a, b) => a - b), building.positions,
    '建物シートは健康→数字→次の暮らし→仕事→在庫の順');
  assert.doesNotMatch(building.text, /敷地|座標|入口/);
  assert.ok(building.box.left >= 0 && building.box.right <= width, JSON.stringify(building));
  assert.ok(building.box.top >= 0 && building.box.bottom <= height, JSON.stringify(building));
  if (mobile) assert.ok(building.observer.bottom < building.box.top, JSON.stringify(building));
  else assert.ok(building.observer.right < building.box.left, JSON.stringify(building));
  await page.screenshot(`/tmp/shioji_v004_readability_building_${mobile ? 'mobile' : 'desktop'}.png`);
  assert.deepEqual(page.errors, []);
  await page.close();
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
      hasLegacyBuildingSelect: Boolean(document.querySelector('#building-kind')),
      households: window.__SHIOJI_V004__.model.households.length,
      roads: window.__SHIOJI_V004__.model.roadKeys.length,
      bootState: document.querySelector('#boot-status').dataset.state,
      bootText: document.querySelector('#boot-status').textContent,
      portraitVisible: document.querySelector('.start-story img').getBoundingClientRect().height > 100,
      buildCategories: [...document.querySelectorAll('[data-build-category]')].map(button => button.textContent),
      buildingPalette: [...document.querySelectorAll('[data-building-job]')].map(button => button.textContent),
    };
  })()`);
  assert.equal(launcher.hidden, false, JSON.stringify(launcher));
  assert.deepEqual(launcher.buttonModes, ['tutorial', 'sandbox', 'test']);
  assert.equal(launcher.speed, 0);
  assert.equal(launcher.startMode, 'sandbox');
  assert.equal(launcher.bootState, 'ready', JSON.stringify(launcher));
  assert.match(launcher.bootText, /遊び方を選べます/);
  assert.equal(launcher.portraitVisible, true, JSON.stringify(launcher));
  assert.deepEqual(launcher.buildings, ['port']);
  assert.equal(launcher.hasLegacyBuildingSelect, false);
  assert.deepEqual(launcher.buildCategories, ['整備', '流通', '食料', '採取', '加工']);
  assert.equal(launcher.buildingPalette.length, 2);
  assert.match(launcher.buildingPalette[0], /市場.*2,500D.*5×5/s);
  assert.equal(launcher.households, 0);
  assert.equal(launcher.roads, 0);
  assert.ok(launcher.dialog.left >= 0 && launcher.dialog.right <= width, JSON.stringify(launcher));
  assert.ok(launcher.dialog.top >= 0 && launcher.dialog.bottom <= height, JSON.stringify(launcher));
  await page.screenshot(`/tmp/shioji_v004_start_${mode}_${mobile ? 'mobile' : 'desktop'}.png`);

  await page.evaluate(`document.querySelector('[data-start-mode="${mode}"]').click()`);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await wait(100);
    if (await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const ready = Boolean(game)
        && game.startMode === ${JSON.stringify(mode)}
        && new URLSearchParams(location.search).get('mode') === ${JSON.stringify(mode)};
      if (ready) game.setSpeed(0);
      return ready;
    })()`)) break;
  }
  const started = await page.evaluate(`({
    mode: window.__SHIOJI_V004__.startMode,
    day: window.__SHIOJI_V004__.model.day,
    calendarOffsetDays: window.__SHIOJI_V004__.model.calendarOffsetDays,
    effectiveCalendarDay: Math.max(1, window.__SHIOJI_V004__.model.day)
      + window.__SHIOJI_V004__.model.calendarOffsetDays,
    season: document.querySelector('#season-value').textContent,
    screenHidden: document.querySelector('#start-screen').hidden,
    buildings: window.__SHIOJI_V004__.model.buildings.length,
    households: window.__SHIOJI_V004__.model.households.length,
    roads: window.__SHIOJI_V004__.model.roadKeys.length,
    tutorialState: window.__SHIOJI_V004__.tutorialState,
    objectiveVisible: !document.querySelector('#tutorial-objective').hidden,
    tutorialActionHidden: document.querySelector('#tutorial-action').hidden,
    tutorialActionText: document.querySelector('#tutorial-action').textContent,
    secretaryPriority: document.querySelector('#secretary').dataset.secretaryPriority,
    secretarySpeech: document.querySelector('#secretary-speech').textContent,
    secretaryTag: document.querySelector('#secretary').tagName,
    secretaryActionPresent: Boolean(document.querySelector('#secretary-action')),
    objectiveInstruction: document.querySelector('#tutorial-goal').textContent,
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
  assert.equal(started.day, 0, JSON.stringify(started));
  assert.equal(started.calendarOffsetDays, 60, JSON.stringify(started));
  assert.equal(started.effectiveCalendarDay, 61, JSON.stringify(started));
  assert.equal(started.season, '春・3月', JSON.stringify(started));
  assert.equal(started.screenHidden, true, JSON.stringify(started));
  if (mode === 'test') {
    assert.ok(started.buildings > 3, JSON.stringify(started));
    assert.ok(started.roads > 0, JSON.stringify(started));
  } else {
    assert.equal(started.buildings, 1, JSON.stringify(started));
    assert.equal(started.households, 0, JSON.stringify(started));
    assert.equal(started.roads, 0, JSON.stringify(started));
  }
  const discoveryLists = await page.evaluate(`(() => {
    const openAndRead = (openId, sheetId, rowSelector) => {
      document.querySelector(openId).click();
      const sheet = document.querySelector(sheetId);
      const result = {
        rows: sheet.querySelectorAll(rowSelector).length,
        emptyText: sheet.querySelector('.goods-empty')?.textContent ?? '',
      };
      sheet.querySelector('[data-close-sheet]')?.click();
      return result;
    };
    return {
      supply: openAndRead('#open-supply', '#supply-sheet', '[data-supply-goods]'),
      company: openAndRead('#open-company', '#company-sheet', '.goods-row'),
      discoveredGoods: window.__SHIOJI_V004__.discoveredGoods,
    };
  })()`);
  if (mode === 'test') {
    assert.equal(discoveryLists.supply.rows, 18, JSON.stringify(discoveryLists));
    assert.equal(discoveryLists.company.rows, 18, JSON.stringify(discoveryLists));
    assert.equal(discoveryLists.discoveredGoods.length, 18, JSON.stringify(discoveryLists));
  } else {
    assert.equal(discoveryLists.supply.rows, 0, JSON.stringify(discoveryLists));
    assert.equal(discoveryLists.company.rows, 0, JSON.stringify(discoveryLists));
    assert.equal(discoveryLists.supply.emptyText, 'まだ島に品がありません');
    assert.equal(discoveryLists.company.emptyText, 'まだ島に品がありません');
    assert.deepEqual(discoveryLists.discoveredGoods, []);
  }
  if (mode === 'tutorial') {
    assert.equal(started.tutorialState.active, true, JSON.stringify(started));
    assert.equal(started.objectiveVisible, true, JSON.stringify(started));
    assert.equal(started.tutorialActionHidden, false, JSON.stringify(started));
    assert.equal(started.tutorialActionText, '道を敷き始める');
    assert.equal(started.secretaryPriority, 'forced-letter', JSON.stringify(started));
    assert.match(started.secretarySpeech, /いま島にあるのは港だけ.*木こりが丸太を運べるように/s);
    assert.doesNotMatch(started.secretarySpeech, /このあと自動で開きます/);
    assert.equal(started.secretaryTag, 'DIV');
    assert.equal(started.secretaryActionPresent, false);
    assert.equal(started.objectiveInstruction, '港から森の隣まで道を引く');
    assert.equal(started.letterVisible, false, JSON.stringify(started));
    assert.equal(started.speed, 0, JSON.stringify(started));
    for (const bounds of [started.objectiveBounds]) {
      assert.ok(bounds.left >= 0 && bounds.right <= width, JSON.stringify(started));
      assert.ok(bounds.top >= 0 && bounds.bottom <= height, JSON.stringify(started));
    }
    await wait(5600);
    const opened = await page.evaluate(`({
      letterVisible: !document.querySelector('#tutorial-letter-modal').hidden,
      letterText: document.querySelector('#tutorial-letter-modal').textContent,
      speed: window.__SHIOJI_V004__.clock.speedIndex,
      paperBounds: ((box) => ({
        left: box.left, right: box.right, top: box.top, bottom: box.bottom,
      }))(document.querySelector('.tutorial-paper').getBoundingClientRect()),
    })`);
    assert.equal(opened.letterVisible, true, JSON.stringify(opened));
    assert.equal(opened.speed, 0, JSON.stringify(opened));
    assert.match(opened.letterText, /港から最初の道を始めましょう/);
    assert.match(opened.letterText, /道が届いたら、その隣に木こりを建てましょう/);
    assert.doesNotMatch(opened.letterText, /\d+日目・/);
    assert.ok(opened.paperBounds.left >= 0 && opened.paperBounds.right <= width, JSON.stringify(opened));
    assert.ok(opened.paperBounds.top >= 0 && opened.paperBounds.bottom <= height, JSON.stringify(opened));
    await page.screenshot(`/tmp/shioji_v004_tutorial_letter_${mobile ? 'mobile' : 'desktop'}.png`);
    const restoredSpeed = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      document.querySelector('#continue-tutorial-letter').click();
      const speed = game.clock.speedIndex;
      game.setSpeed(0);
      return speed;
    })()`);
    assert.equal(restoredSpeed, 1);
    const guidedAction = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      document.querySelector('#tutorial-action').click();
      const result = {
        activeTool: game.activeTool,
        category: document.querySelector('[data-build-category].on')?.dataset.buildCategory,
      };
      game.selectTool('road');
      return result;
    })()`);
    assert.deepEqual(guidedAction, { activeTool: 'road', category: 'infrastructure' });
    await page.screenshot(`/tmp/shioji_v004_tutorial_goal_${mobile ? 'mobile' : 'desktop'}.png`);
    const tutorialExit = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      return {
        exitButton: document.querySelector('#skip-tutorial'),
        state: game.tutorialState,
        objectiveHidden: document.querySelector('#tutorial-objective').hidden,
        lettersHidden: document.querySelector('#open-tutorial-letters').hidden,
        label: document.querySelector('#start-mode-label').textContent,
      };
    })()`);
    assert.equal(tutorialExit.exitButton, null, JSON.stringify(tutorialExit));
    assert.equal(tutorialExit.state.active, true, JSON.stringify(tutorialExit));
    assert.equal(tutorialExit.state.skipped, false, JSON.stringify(tutorialExit));
    assert.equal(tutorialExit.objectiveHidden, false, JSON.stringify(tutorialExit));
    assert.equal(tutorialExit.lettersHidden, false, JSON.stringify(tutorialExit));
    assert.match(tutorialExit.label, /チュートリアル/);
  } else {
    assert.equal(started.tutorialState, null, JSON.stringify(started));
    assert.equal(started.objectiveVisible, false, JSON.stringify(started));
    assert.equal(started.letterVisible, false, JSON.stringify(started));
    assert.equal(started.secretaryPriority, 'operation-guide', JSON.stringify(started));
  }
  await page.screenshot(`/tmp/shioji_v004_started_${mode}_${mobile ? 'mobile' : 'desktop'}.png`);
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkTutorialLetterDelivery() {
  const width = 390;
  const height = 844;
  const page = await newPage(width, height, true, gameForMode('tutorial'));
  const preview = await page.evaluate(`({
    priority: document.querySelector('#secretary').dataset.secretaryPriority,
    speech: document.querySelector('#secretary-speech').textContent,
    modalHidden: document.querySelector('#tutorial-letter-modal').hidden,
    actionHidden: document.querySelector('#secretary-letter-action').hidden,
    speed: window.__SHIOJI_V004__.clock.speedIndex,
  })`);
  assert.equal(preview.priority, 'forced-letter', JSON.stringify(preview));
  assert.match(preview.speech, /いま島にあるのは港だけ/);
  assert.doesNotMatch(preview.speech, /このあと自動で開きます/);
  assert.equal(preview.modalHidden, true, JSON.stringify(preview));
  assert.equal(preview.actionHidden, true, JSON.stringify(preview));
  assert.equal(preview.speed, 0, JSON.stringify(preview));

  await wait(3200);
  assert.equal(await page.evaluate('document.querySelector("#tutorial-letter-modal").hidden'), true,
    '重要書状の予告も3.2秒では読み終わった扱いにしない');
  for (let attempt = 0; attempt < 32; attempt += 1) {
    await wait(250);
    if (!await page.evaluate('document.querySelector("#tutorial-letter-modal").hidden')) break;
  }
  const forced = await page.evaluate(`({
    modalHidden: document.querySelector('#tutorial-letter-modal').hidden,
    text: document.querySelector('#tutorial-letter-modal').textContent,
    speed: window.__SHIOJI_V004__.clock.speedIndex,
  })`);
  assert.equal(forced.modalHidden, false, JSON.stringify(forced));
  assert.match(forced.text, /港から最初の道を始めましょう/);
  assert.equal(forced.speed, 0, JSON.stringify(forced));

  const overlap = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.closeTutorialLetter();
    game.setSpeed(0);
    game.openSheet('company-sheet');
    const objective = document.querySelector('#tutorial-objective').getBoundingClientRect();
    const sheet = document.querySelector('#company-sheet').getBoundingClientRect();
    document.querySelector('[data-close-sheet="company-sheet"]').click();
    return {
      objective: { top: objective.top, bottom: objective.bottom },
      sheet: { top: sheet.top, bottom: sheet.bottom },
    };
  })()`);
  assert.ok(overlap.objective.bottom <= overlap.sheet.top, JSON.stringify(overlap));

  const setup = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const refresh = () => game.advanceTicks(0, { animate: false });
    const requireOk = (result, label) => {
      if (!result?.ok) throw new Error(label + ': ' + JSON.stringify(result));
      return result;
    };
    const shortest = (job, origin) => {
      let best = null;
      for (let y = 0; y < game.model.height; y += 1) {
        for (let x = 0; x < game.model.width; x += 1) {
          const building = game.previewBuilding(job, x, y);
          if (!building.ok) continue;
          const road = game.previewRoad(origin, building.entrance);
          if (!road.ok) continue;
          if (!best || road.cells.length < best.road.cells.length) best = { building, road };
        }
      }
      if (!best) throw new Error(job + 'の接続可能な場所がありません');
      return best;
    };
    const place = (job, plan, roadFirst = false) => {
      const buildingOp = {
        type: 'place_building', job,
        x: plan.building.entrance.x, y: plan.building.entrance.y,
        buildingX: plan.building.x, buildingY: plan.building.y,
      };
      const roadOp = { type: 'add_road', start: plan.road.start, end: plan.road.end };
      if (roadFirst) requireOk(game.controller.operate(roadOp), job + 'への道');
      requireOk(game.controller.operate(buildingOp), job + 'の配置');
      if (!roadFirst) requireOk(game.controller.operate(roadOp), job + 'への道');
      refresh();
    };

    const port = game.model.buildings.find(building => building.roles.includes('port'));
    place('logger', shortest('logger', port.entrance), true);
    refresh();
    const marketPlan = shortest('market', port.entrance);
    place('market', marketPlan);
    const market = game.model.buildings.find(building => building.roles.includes('market'));
    requireOk(game.controller.operate({ type: 'request_aid' }), '最初の食料支援');
    refresh();
    game.advanceTicks(Math.max(0, 15 * 30 - game.model.tick), { animate: false });
    for (const job of ['fisher', 'veg', 'woodshop', 'warehouse']) {
      place(job, shortest(job, market.entrance));
      refresh();
    }
    requireOk(game.controller.operate({
      type: 'set_stock_target', goods: 'tools', qty: 80,
    }), '木製品の事前買上げ');
    for (let pass = 0; pass < 3; pass += 1) refresh();
    game.advanceTicks(Math.max(0, 75 * 30 - game.model.tick), { animate: false });
    return {
      day: game.model.day,
      objective: game.tutorialState.completedGoals,
      current: document.querySelector('#tutorial-goal').textContent,
      offer: game.model.orderOffer,
      futureGoals: game.tutorialState.completedGoals.filter(id => [
        'observe-seasonal-food-valley', 'assess-profitable-order',
        'observe-skippable-order', 'observe-tools-price-rise',
      ].includes(id)),
      futureLetters: game.tutorialState.letters.filter(letter => [
        'seasonal-food-valley-report', 'profitable-order-assessment',
        'skippable-order-assessment', 'tools-price-rise',
      ].includes(letter.id)).map(letter => letter.id),
    };
  })()`);
  assert.equal(setup.day, 75, JSON.stringify(setup));
  assert.equal(setup.offer.g, 'tools', JSON.stringify(setup));
  assert.deepEqual(setup.futureGoals, [], JSON.stringify(setup));
  assert.deepEqual(setup.futureLetters, [], JSON.stringify(setup));
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await wait(250);
    if (!await page.evaluate('document.querySelector("#tutorial-letter-modal").hidden')) break;
  }
  assert.equal(await page.evaluate('document.querySelector("#tutorial-letter-modal").hidden'), false);
  assert.match(await page.evaluate('document.querySelector("#tutorial-letter-title").textContent'), /注文が届きました/);

  const completion = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.closeTutorialLetter();
    if (!game.controller.operate({ type: 'accept_order' }).ok) throw new Error('注文を受諾できません');
    for (let pass = 0; pass < 3; pass += 1) game.advanceTicks(0, { animate: false });
    for (let day = 0; day < 8 && game.model.activeOrder; day += 1) {
      game.advanceTicks(30, { animate: false });
    }
    // まとめ進行で同じ観測内に「倉庫到着→船積み→完遂」まで起きても、
    // 必達目標は一段ずつ切り替えて読める。その後続段まで実画面で送る。
    for (let pass = 0; pass < 2; pass += 1) game.advanceTicks(0, { animate: false });
    return {
      day: game.model.day,
      activeOrder: game.model.activeOrder,
      chapterLetter: game.tutorialState.letters.find(letter => letter.id === 'chapter-one-close'),
      current: game.tutorialState.completedGoals,
      letterIds: game.tutorialState.letters.map(letter => letter.id),
      instruction: document.querySelector('#tutorial-goal').textContent,
      futureGoals: game.tutorialState.completedGoals.filter(id => [
        'observe-seasonal-food-valley', 'assess-profitable-order',
        'observe-skippable-order', 'observe-tools-price-rise',
      ].includes(id)),
    };
  })()`);
  assert.equal(completion.activeOrder, null, JSON.stringify(completion));
  assert.ok(completion.chapterLetter, JSON.stringify(completion));
  assert.deepEqual(completion.futureGoals, [], JSON.stringify(completion));

  await wait(3000);
  assert.equal(
    await page.evaluate("document.querySelector('#secretary').dataset.secretaryPriority"),
    'goal-complete',
    '章末の達成発話も3秒では次の書状へ切り替えない',
  );
  for (let attempt = 0; attempt < 32; attempt += 1) {
    await wait(250);
    if (await page.evaluate(
      "document.querySelector('#secretary').dataset.secretaryPriority === 'optional-letter'",
    )) break;
  }
  const optional = await page.evaluate(`({
    priority: document.querySelector('#secretary').dataset.secretaryPriority,
    speech: document.querySelector('#secretary-speech').textContent,
    actionHidden: document.querySelector('#secretary-letter-action').hidden,
    actionText: document.querySelector('#secretary-letter-action').textContent,
  })`);
  assert.equal(optional.priority, 'optional-letter', JSON.stringify(optional));
  assert.match(optional.speech, /この欄から直接開けます/);
  assert.equal(optional.actionHidden, false, JSON.stringify(optional));
  assert.equal(optional.actionText.trim(), '書状を開く');
  await page.screenshot('/tmp/shioji_v004_tutorial_optional_letter_mobile.png');
  await page.evaluate('document.querySelector("#secretary-letter-action").click()');
  const direct = await page.evaluate(`({
    modalHidden: document.querySelector('#tutorial-letter-modal').hidden,
    title: document.querySelector('#tutorial-letter-title').textContent,
    unread: document.querySelector('#tutorial-unread').textContent,
  })`);
  assert.equal(direct.modalHidden, false, JSON.stringify(direct));
  assert.match(direct.title, /最初の輸出|期限切れ/);
  await page.screenshot('/tmp/shioji_v004_tutorial_letter_delivery_mobile.png');
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkElenaLineBreaks(width, height, mobile) {
  const page = await newPage(width, height, mobile);
  const result = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const speech = document.querySelector('#secretary-speech');
    const range = document.createRange();
    range.selectNodeContents(speech);
    const renderedLineTops = [...range.getClientRects()]
      .map(rect => Math.round(rect.top * 2) / 2)
      .filter((top, index, all) => all.indexOf(top) === index);
    const style = getComputedStyle(speech);
    const text = speech.textContent;
    return {
      source: game.secretaryRoute.speech,
      text,
      lines: text.split('\\n'),
      renderedLineCount: renderedLineTops.length,
      whiteSpace: style.whiteSpace,
      overflowWrap: style.overflowWrap,
      wordBreak: style.wordBreak,
      fitsHeight: speech.scrollHeight <= speech.clientHeight + 1,
      fitsWidth: speech.scrollWidth <= speech.clientWidth + 1,
      box: (() => {
        const rect = document.querySelector('#observer').getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      })(),
    };
  })()`);
  assert.equal(result.text.replaceAll('\n', ''), result.source, JSON.stringify(result));
  assert.ok(result.lines.length >= 2 && result.lines.length <= 3, JSON.stringify(result));
  assert.equal(
    result.lines.slice(0, -1).every(line => /[、。！？!?」』）】]$/.test(line)),
    true,
    JSON.stringify(result),
  );
  assert.ok(result.renderedLineCount <= 3, JSON.stringify(result));
  assert.equal(result.whiteSpace, 'pre-line', JSON.stringify(result));
  assert.equal(result.overflowWrap, 'normal', JSON.stringify(result));
  assert.equal(result.wordBreak, 'normal', JSON.stringify(result));
  assert.equal(result.fitsHeight, true, JSON.stringify(result));
  assert.equal(result.fitsWidth, true, JSON.stringify(result));
  assert.ok(result.box.left >= 0 && result.box.right <= width, JSON.stringify(result));
  assert.ok(result.box.top >= 0 && result.box.bottom <= height, JSON.stringify(result));
  await page.screenshot(`/tmp/shioji_v004_elena_lines_${mobile ? 'mobile' : 'desktop'}.png`);
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkSeasonalPlots(width, height, mobile) {
  fs.mkdirSync(SEASON_SCREENSHOT_DIR, { recursive: true });
  const page = await newPage(width, height, mobile);
  const springStart = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    const targetDay = 0;
    if (game.model.day < targetDay) game.advanceTicks((targetDay - game.model.day) * 30, { animate: false });
    const plots = game.model.buildings.filter(row => (
      ['wheat', 'veg', 'shepherd', 'rapeseed'].includes(row.type)
    ));
    const focus = plots[0];
    if (focus) game.camera.focus(focus.x + focus.width / 2, focus.y + focus.height / 2);
    game.renderer.render(game.displayModel, 0);
    return {
      version: game.version,
      day: game.model.day,
      season: game.renderer.season,
      plots: plots.map(row => row.type),
    };
  })()`);
  assert.equal(springStart.version, 'v004.42.1-polish', JSON.stringify(springStart));
  assert.equal(springStart.season, '春', JSON.stringify(springStart));
  assert.ok(springStart.plots.some(type => ['wheat', 'veg'].includes(type)), JSON.stringify(springStart));
  assert.ok(springStart.plots.some(type => type === 'shepherd'), JSON.stringify(springStart));

  const summer = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const targetDay = 91;
    if (game.model.day < targetDay) game.advanceTicks((targetDay - game.model.day) * 30, { animate: false });
    game.renderer.render(game.displayModel, 0);
    return { day: game.model.day, season: game.renderer.season };
  })()`);
  assert.equal(summer.season, '夏', JSON.stringify(summer));
  await page.screenshot(seasonScreenshotPath(
    `shioji_v004_winter_visuals_summer_${mobile ? 'mobile' : 'desktop'}.png`,
  ));

  const autumn = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const targetDay = 181;
    if (game.model.day < targetDay) game.advanceTicks((targetDay - game.model.day) * 30, { animate: false });
    game.renderer.render(game.displayModel, 0);
    return {
      day: game.model.day,
      season: game.renderer.season,
      marketStalls: game.model.marketStalls.length,
      marketReal: game.model.marketStalls.every(stall => stall.items.every(item => (
        item.visual.amount === item.qty && item.visual.spriteCount > 0
      ))),
    };
  })()`);
  assert.equal(autumn.season, '秋', JSON.stringify(autumn));
  assert.ok(autumn.marketStalls > 0, JSON.stringify(autumn));
  assert.equal(autumn.marketReal, true, JSON.stringify(autumn));
  await page.screenshot(seasonScreenshotPath(
    `shioji_v004_winter_visuals_autumn_${mobile ? 'mobile' : 'desktop'}.png`,
  ));

  const winter = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const targetDay = 271;
    if (game.model.day < targetDay) game.advanceTicks((targetDay - game.model.day) * 30, { animate: false });
    game.renderer.render(game.displayModel, 0);
    return {
      day: game.model.day,
      season: game.renderer.season,
      errors: window.__SHIOJI_BOOT_ERROR__ ?? null,
    };
  })()`);
  assert.equal(winter.season, '冬', JSON.stringify(winter));
  assert.equal(winter.errors, null, JSON.stringify(winter));
  await page.screenshot(seasonScreenshotPath(
    `shioji_v004_winter_visuals_winter_${mobile ? 'mobile' : 'desktop'}.png`,
  ));

  const springReturn = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const targetDay = 361;
    if (game.model.day < targetDay) game.advanceTicks((targetDay - game.model.day) * 30, { animate: false });
    game.renderer.render(game.displayModel, 0);
    return {
      day: game.model.day,
      season: game.renderer.season,
      terrainCacheHit: game.renderer.lastFrameMetrics.terrainCacheHit,
    };
  })()`);
  assert.equal(springReturn.season, '春', JSON.stringify(springReturn));
  assert.equal(springReturn.terrainCacheHit, false,
    `雪解けで地形cacheを焼き直す: ${JSON.stringify(springReturn)}`);
  await page.screenshot(seasonScreenshotPath(
    `shioji_v004_winter_visuals_spring_${mobile ? 'mobile' : 'desktop'}.png`,
  ));
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkSeasonalEvents(width = 1440, height = 900, mobile = false) {
  fs.mkdirSync(SEASON_SCREENSHOT_DIR, { recursive: true });
  const page = await newPage(width, height, mobile);
  await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    const targetDay = 271;
    game.advanceTicks(Math.max(0, targetDay * 30 - game.model.tick), { animate: false });
    game.renderer.render(game.displayModel, 0);
    return game.model.day;
  })()`);
  const firstSnow = await waitForBrowserValue(page, `(() => {
    const game = window.__SHIOJI_V004__;
    const speech = document.querySelector('#secretary-speech').textContent;
    if (!speech.includes('初雪です。')) return null;
    return {
      day: game.model.day,
      season: game.renderer.season,
      speech,
      route: game.secretaryRoute,
      seasonHud: document.querySelector('#season-value').textContent,
      defaultGraphs: [...document.querySelectorAll('#economy-charts > figure:not([hidden])')]
        .map(figure => figure.dataset.chart),
    };
  })()`, { description: 'first-snow speech' });
  assert.equal(firstSnow.day, 271, JSON.stringify(firstSnow));
  assert.equal(firstSnow.season, '冬', JSON.stringify(firstSnow));
  assert.match(firstSnow.seasonHud, /冬・12月/, JSON.stringify(firstSnow));
  assert.equal(firstSnow.route.target.kind, 'seasonal-event', JSON.stringify(firstSnow));
  assert.match(firstSnow.speech, /魚は1日20荷から5荷/, JSON.stringify(firstSnow));
  assert.deepEqual(firstSnow.defaultGraphs, ['food-stock', 'population', 'finance'],
    JSON.stringify(firstSnow));
  await page.screenshot(seasonScreenshotPath('season_event_first_snow.png'));

  const firstSpoilage = await waitForBrowserValue(page, `(() => {
    const game = window.__SHIOJI_V004__;
    const state = game.seasonalEventState;
    return state.announcedSpoilage.includes('fish')
      && state.announcedSpoilage.includes('veg')
      ? {
        announcedSpoilage: state.announcedSpoilage,
        spoilByGoods: game.model.spoilByGoods,
      }
      : null;
  })()`, { timeoutMs: 90_000, description: 'first-spoilage speeches' });
  assert.ok(firstSpoilage.spoilByGoods.fish > 0, JSON.stringify(firstSpoilage));
  assert.ok(firstSpoilage.spoilByGoods.veg > 0, JSON.stringify(firstSpoilage));

  await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const targetDay = 361;
    game.advanceTicks(Math.max(0, targetDay * 30 - game.model.tick), { animate: false });
    game.renderer.render(game.displayModel, 0);
    return game.model.day;
  })()`);
  const thaw = await waitForBrowserValue(page, `(() => {
    const game = window.__SHIOJI_V004__;
    const speech = document.querySelector('#secretary-speech').textContent;
    if (!speech.includes('雪が解けました。')) return null;
    return {
      day: game.model.day,
      season: game.renderer.season,
      speech,
      route: game.secretaryRoute,
      seasonHud: document.querySelector('#season-value').textContent,
    };
  })()`, { description: 'thaw speech' });
  assert.equal(thaw.day, 361, JSON.stringify(thaw));
  assert.equal(thaw.season, '春', JSON.stringify(thaw));
  assert.match(thaw.seasonHud, /春・3月/, JSON.stringify(thaw));
  assert.equal(thaw.route.target.kind, 'seasonal-event', JSON.stringify(thaw));
  assert.match(thaw.speech, /畑が動き始めます/, JSON.stringify(thaw));
  await page.screenshot(seasonScreenshotPath('season_event_thaw.png'));

  assert.deepEqual(page.errors, []);
  await page.close();
  return { firstSnow, thaw, firstSpoilage };
}

async function checkFastForwardVoices(width = 1440, height = 900, mobile = false) {
  const page = await newPage(width, height, mobile);
  const result = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    game.resetPerformanceMetrics();
    const startedAt = performance.now();
    const targetDay = 361;
    game.advanceTicks(Math.max(0, targetDay * 30 - game.model.tick), { animate: false });
    const elapsedMs = performance.now() - startedAt;
    const seasonal = game.seasonalEventState.pending.map(row => ({
      id: row.id, day: row.day, type: row.type, kind: 'seasonal-event', order: 1,
    }));
    const boundary = game.boundaryEventState.pending.map(row => ({
      id: row.id, day: row.day, type: row.type, kind: 'boundary-event', order: 0,
    }));
    const discovery = game.goodsDiscoveryState.pending.map(row => ({
      id: row.id, day: row.day, type: row.goods.join('+'), kind: 'goods-discovery', order: 2,
    }));
    const chronological = [...seasonal, ...boundary, ...discovery]
      .sort((left, right) => left.day - right.day || left.order - right.order);
    return {
      day: game.model.day,
      elapsedMs,
      metrics: game.performanceMetrics(),
      seasonal,
      boundary,
      discovery,
      chronological,
      route: game.secretaryRoute,
      speech: document.querySelector('#secretary-speech').textContent,
    };
  })()`);
  assert.equal(result.day, 361, JSON.stringify(result));
  assert.ok(result.metrics.advanceCalls >= 361, JSON.stringify(result));
  assert.ok(result.metrics.snapshotReads >= 361, JSON.stringify(result));
  assert.deepEqual(
    result.seasonal.filter(row => ['firstSnow', 'thaw'].includes(row.type))
      .map(row => ({ day: row.day, type: row.type })),
    [{ day: 271, type: 'firstSnow' }, { day: 361, type: 'thaw' }],
    `1年一括早送りでも季節の一言を発生日つきで保持する: ${JSON.stringify(result)}`,
  );
  assert.ok(result.chronological.length >= 2, JSON.stringify(result));
  assert.equal(result.route.target.id, result.chronological[0].id,
    `早送り後は最古の一言から表示する: ${JSON.stringify(result)}`);
  assert.equal(result.route.target.kind, result.chronological[0].kind, JSON.stringify(result));
  assert.equal(result.speech.length > 0, true, JSON.stringify(result));
  assert.deepEqual(page.errors, []);
  await page.close();
  return result;
}

async function checkBoundaryVoices(width = 1440, height = 900, mobile = false) {
  fs.mkdirSync(BOUNDARY_SCREENSHOT_DIR, { recursive: true });
  const page = await newPage(width, height, mobile, GAME);
  const setup = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const observation = ({ day, food, fish = 4, salt = 2, char = 2 }) => ({
      day,
      calendarOffsetDays: 60,
      population: 10,
      households: [{
        members: Array.from({ length: 10 }, (_, index) => ({ id: index + 1 })),
        pantry: [{ goods: 'wheat', amount: food }],
      }],
      stalls: [],
      companyMarketStock: {},
      companyStock: {},
      flowEma: { wheat: { prod: 2, imp: 0.5, cons: 4 } },
      goodsManifest: [
        { goods: 'fish', totalAmount: fish },
        { goods: 'salt', totalAmount: salt },
        { goods: 'char', totalAmount: char },
      ],
    });
    window.__boundaryObservation = observation;
    game.setSpeed(0);
    game.boundaryEvents.observe(observation({ day: 1, food: 150 }));
    game.boundaryEvents.observe(observation({ day: 2, food: 139 }));
    game.setSpeed(0);
    return {
      speech: document.querySelector('#secretary-speech').textContent,
      route: game.secretaryRoute,
      pending: game.boundaryEventState.pending.map(row => row.type),
      letterHidden: document.querySelector('#secretary-letter-action').hidden,
      modalHidden: document.querySelector('#tutorial-letter-modal').hidden,
    };
  })()`);
  assert.equal(setup.route.priority, 'food-boundary', JSON.stringify(setup));
  assert.equal(setup.route.target.kind, 'boundary-event', JSON.stringify(setup));
  assert.match(setup.speech, /14日分を下回りました.*残り13日分/s, JSON.stringify(setup));
  assert.match(setup.speech, /畑や漁師を建てれば間に合います/s, JSON.stringify(setup));
  assert.equal(setup.letterHidden, true, JSON.stringify(setup));
  assert.equal(setup.modalHidden, true, JSON.stringify(setup));
  await waitForBrowserValue(page, `(() => {
    const panel = document.querySelector('#secretary');
    return !panel.classList.contains('guidance-entering')
      && !panel.classList.contains('guidance-switching')
      && Number.parseFloat(getComputedStyle(panel).opacity) >= 0.99;
  })()`, { timeoutMs: 2_000, description: 'food boundary speech fully visible' });
  await page.screenshot(boundaryScreenshotPath('boundary_voice_food_spring.png'));

  await waitForBrowserValue(page, `(() => (
    !window.__SHIOJI_V004__.boundaryEventState.pending.some(row => row.type === 'food')
  ))()`, { timeoutMs: 15_000, description: 'food boundary auto-read' });
  const salt = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.boundaryEvents.observe(window.__boundaryObservation({
      day: 3, food: 139, salt: 0, char: 2,
    }));
    game.setSpeed(0);
    return {
      speech: document.querySelector('#secretary-speech').textContent,
      route: game.secretaryRoute,
      pending: game.boundaryEventState.pending.map(row => row.type),
      letterHidden: document.querySelector('#secretary-letter-action').hidden,
      modalHidden: document.querySelector('#tutorial-letter-modal').hidden,
    };
  })()`);
  assert.equal(salt.route.priority, 'preservation-stop', JSON.stringify(salt));
  assert.match(salt.speech, /塩がなくなりました.*魚を保存食にできず.*3日で腐ります/s,
    JSON.stringify(salt));
  assert.equal(salt.letterHidden, true, JSON.stringify(salt));
  assert.equal(salt.modalHidden, true, JSON.stringify(salt));
  await waitForBrowserValue(page, `(() => {
    const panel = document.querySelector('#secretary');
    return !panel.classList.contains('guidance-entering')
      && Number.parseFloat(getComputedStyle(panel).opacity) >= 0.99;
  })()`, { timeoutMs: 2_000, description: 'salt boundary speech fully visible' });
  await page.screenshot(boundaryScreenshotPath('boundary_voice_salt.png'));

  await waitForBrowserValue(page, `(() => (
    !window.__SHIOJI_V004__.boundaryEventState.pending.some(row => row.type === 'salt')
  ))()`, { timeoutMs: 15_000, description: 'salt boundary auto-read' });
  const charcoal = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.boundaryEvents.observe(window.__boundaryObservation({
      day: 4, food: 139, salt: 0, char: 0,
    }));
    game.setSpeed(0);
    return {
      speech: document.querySelector('#secretary-speech').textContent,
      route: game.secretaryRoute,
      pending: game.boundaryEventState.pending.map(row => row.type),
      letterHidden: document.querySelector('#secretary-letter-action').hidden,
      modalHidden: document.querySelector('#tutorial-letter-modal').hidden,
    };
  })()`);
  assert.equal(charcoal.route.priority, 'preservation-stop', JSON.stringify(charcoal));
  assert.match(charcoal.speech, /木炭がなくなりました.*魚を燻製にできず.*3日で腐ります/s,
    JSON.stringify(charcoal));
  assert.equal(charcoal.letterHidden, true, JSON.stringify(charcoal));
  assert.equal(charcoal.modalHidden, true, JSON.stringify(charcoal));
  await waitForBrowserValue(page, `(() => {
    const panel = document.querySelector('#secretary');
    return !panel.classList.contains('guidance-entering')
      && Number.parseFloat(getComputedStyle(panel).opacity) >= 0.99;
  })()`, { timeoutMs: 2_000, description: 'charcoal boundary speech fully visible' });
  await page.screenshot(boundaryScreenshotPath('boundary_voice_charcoal.png'));
  await waitForBrowserValue(page, `(() => (
    !window.__SHIOJI_V004__.boundaryEventState.pending.some(row => row.type === 'char')
  ))()`, { timeoutMs: 15_000, description: 'charcoal boundary auto-read' });

  assert.deepEqual(page.errors, []);
  await page.close();
  return { food: setup.speech, salt: salt.speech, charcoal: charcoal.speech };
}

async function checkPeopleVisuals(width, height, mobile) {
  const page = await newPage(width, height, mobile);
  const result = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    let walking = null;
    let best = [];
    for (let guard = 0; guard < 1800 && !walking; guard += 1) {
      game.advanceTicks(1, { animate: false });
      const rows = game.model.carriers.filter(row => (
        ['walker', 'backpack'].includes(row.kind)
        && row.path?.length > 1
        && row.visualProgress > 0.05
        && row.visualProgress < 0.95
      ));
      if (rows.length > best.length) best = rows;
      if (rows.length >= 3 && new Set(rows.map(row => row.laneOffset)).size >= 2) {
        walking = rows;
      }
    }
    walking ??= best;
    if (walking.length < 3) return {
      found: false,
      bestCount: walking.length,
      bestRows: walking.map(row => ({
        id: row.id, kind: row.kind, state: row.state,
        lane: row.laneOffset, pace: row.visualPace, progress: row.visualProgress,
      })),
    };
    const focus = walking.reduce((point, row) => ({
      x: point.x + row.x / walking.length,
      y: point.y + row.y / walking.length,
    }), { x: 0, y: 0 });
    game.camera.focus(focus.x, focus.y);
    game.renderer.render(game.displayModel, 0);
    return {
      found: true,
      count: walking.length,
      lanes: new Set(walking.map(row => row.laneOffset)).size,
      paces: new Set(walking.map(row => row.visualPace.toFixed(3))).size,
      yPositions: new Set(walking.map(row => row.y.toFixed(3))).size,
      companyCrew: game.model.carriers.filter(row => row.companyCrewSlot).length,
      companyQueue: game.model.carriers
        .filter(row => row.kind === 'porter_queue')
        .map(row => ({ people: row.queuedPeople, amount: row.amount })),
      maxCompanySlot: Math.max(0, ...game.model.carriers
        .map(row => row.companyCrewSlot ?? 0)),
    };
  })()`);
  assert.equal(result.found, true, JSON.stringify(result));
  assert.ok(result.count >= 3, JSON.stringify(result));
  assert.ok(result.lanes >= 2, JSON.stringify(result));
  assert.ok(result.paces >= 3, JSON.stringify(result));
  assert.ok(result.yPositions >= 3, JSON.stringify(result));
  assert.ok(result.companyCrew <= 6, JSON.stringify(result));
  assert.ok(result.maxCompanySlot <= 6, JSON.stringify(result));
  await page.screenshot(`/tmp/shioji_v004_people_${mobile ? 'mobile' : 'desktop'}.png`);
  const companyQueue = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const offered = new Map();
    for (const stall of game.model.marketStalls) {
      for (const item of stall.items) {
        offered.set(item.goods, (offered.get(item.goods) ?? 0) + item.qty);
      }
    }
    for (const [goods, qty] of [...offered.entries()]
      .filter(([, qty]) => qty >= 8)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)) {
      game.controller.operate({ type: 'set_stock_target', goods, qty: Math.min(80, qty) });
    }
    for (const goods of ['fish', 'veg', 'wheat', 'log', 'tools']) {
      game.controller.operate({ type: 'set_stock_target', goods, qty: 80 });
    }
    let candidate = null;
    for (let guard = 0; guard < 12 && !candidate; guard += 1) {
      candidate = Object.entries(game.model.companyStock)
        .filter(([, qty]) => qty >= 8)
        .sort((left, right) => right[1] - left[1])[0] ?? null;
      if (!candidate) game.advanceTicks(30 * 30, { animate: false });
    }
    if (!candidate) return { found: false, day: game.model.day, stock: game.model.companyStock };
    const [goods, stock] = candidate;
    const qty = Math.min(40, Math.floor(stock));
    const operation = game.controller.operate({ type: 'release_stock', goods, qty });
    game.advanceTicks(1, { animate: false });
    const queue = game.model.carriers.find(row => row.kind === 'porter_queue');
    const crew = game.model.carriers.filter(row => row.companyCrewSlot);
    if (queue) {
      game.camera.focus(queue.x, queue.y);
      game.renderer.render(game.displayModel, 0);
    }
    return {
      found: Boolean(queue),
      operationOk: Boolean(operation?.ok),
      goods,
      qty,
      queuedPeople: queue?.queuedPeople ?? 0,
      crew: crew.length,
      slots: crew.map(row => row.companyCrewSlot),
    };
  })()`);
  assert.equal(companyQueue.found, true, JSON.stringify(companyQueue));
  assert.equal(companyQueue.operationOk, true, JSON.stringify(companyQueue));
  assert.ok(companyQueue.queuedPeople > 0, JSON.stringify(companyQueue));
  assert.ok(companyQueue.crew <= 6, JSON.stringify(companyQueue));
  assert.ok(companyQueue.slots.every(slot => slot >= 1 && slot <= 6), JSON.stringify(companyQueue));
  assert.deepEqual(page.errors, []);
  await page.screenshot(`/tmp/shioji_v004_company_queue_${mobile ? 'mobile' : 'desktop'}.png`);
  await page.close();
}

async function checkViewport(width, height, mobile) {
  const page = await newPage(width, height, mobile);
  assert.equal(await page.evaluate('document.title'), 'CHARTER ISLE — 潮路の島 v004');
  assert.equal(await page.evaluate("document.querySelector('[data-testid=build-version]').textContent"), 'v004.42.1-polish');
  assert.equal(await page.evaluate('window.__SHIOJI_V004__.version'), 'v004.42.1-polish');
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
      secretary: rect(document.querySelector('#secretary')),
      topMenu: rect(document.querySelector('#top-menu')),
      foodRunway: rect(document.querySelector('#food-runway')),
      menuButtons: [...document.querySelectorAll('#top-menu button:not([hidden])')].map(rect),
      categories: [...document.querySelectorAll('[data-build-category]')].map(button => button.textContent),
      palette: [...document.querySelectorAll('[data-building-job]')].map(button => button.textContent),
      secretaryPriority: document.querySelector('#secretary').dataset.secretaryPriority,
      secretaryText: document.querySelector('#secretary').textContent,
      secretaryAlt: document.querySelector('#secretary img').alt,
      secretaryTag: document.querySelector('#secretary').tagName,
      secretaryActionPresent: Boolean(document.querySelector('#secretary-action')),
      hasEngineWindow: document.body.textContent.includes('エンジンの世界'),
      season: document.querySelector('#season-value').textContent,
      islandSignal: document.querySelector('#island-signal').textContent,
      foodText: document.querySelector('#food-runway').textContent,
    };
  })()`);
  for (const bounds of [
    controlBounds.hud, controlBounds.speed, controlBounds.dock, controlBounds.observer, controlBounds.secretary,
    controlBounds.topMenu, controlBounds.foodRunway, ...controlBounds.buttons, ...controlBounds.menuButtons,
  ]) {
    assert.ok(bounds.left >= 0 && bounds.right <= controlBounds.viewport.width, JSON.stringify(controlBounds));
    assert.ok(bounds.top >= 0 && bounds.bottom <= controlBounds.viewport.height, JSON.stringify(controlBounds));
  }
  assert.deepEqual(controlBounds.categories, ['整備', '流通', '食料', '採取', '加工']);
  assert.equal(controlBounds.palette.length, 2);
  assert.match(controlBounds.palette.join(' '), /市場.*2,500D.*5×5.*倉庫.*2,500D.*4×4/s);
  assert.equal(controlBounds.secretaryPriority, 'operation-guide');
  assert.match(controlBounds.secretaryAlt, /エレナ/);
  assert.match(controlBounds.secretaryText, /エレナ・ヴァンス.*荷車が運ぶ品.*家々の食料/s);
  assert.equal(controlBounds.secretaryTag, 'DIV');
  assert.equal(controlBounds.secretaryActionPresent, false);
  assert.equal(controlBounds.hasEngineWindow, false);
  assert.match(controlBounds.season, /^(冬|春|夏|秋)・\d+月$/);
  assert.match(controlBounds.islandSignal, /^(平穏|成長|注意|危険)$/);
  assert.match(controlBounds.foodText, /島の食料.*あと\d+日分 (?:→|↘|↘↘)/s);

  const cameraBefore = await page.evaluate(`({
    x: window.__SHIOJI_V004__.camera.panX,
    y: window.__SHIOJI_V004__.camera.panY,
    zoom: window.__SHIOJI_V004__.camera.zoom,
  })`);
  if (!mobile) {
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'w', code: 'KeyW' });
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'd', code: 'KeyD' });
    await wait(140);
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'w', code: 'KeyW' });
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'd', code: 'KeyD' });
    const keyboardPan = await page.evaluate(`({
      x: window.__SHIOJI_V004__.camera.panX,
      y: window.__SHIOJI_V004__.camera.panY,
      pressed: window.__SHIOJI_V004__.pressedMovementKeys,
    })`);
    assert.notDeepEqual({ x: keyboardPan.x, y: keyboardPan.y }, { x: cameraBefore.x, y: cameraBefore.y });
    assert.deepEqual(keyboardPan.pressed, []);

    await page.evaluate('window.__SHIOJI_V004__.setSpeed(2)');
    await pressKey(page, ' ', 'Space');
    assert.equal(await page.evaluate('window.__SHIOJI_V004__.clock.speedIndex'), 0);
    await pressKey(page, ' ', 'Space');
    assert.equal(await page.evaluate('window.__SHIOJI_V004__.clock.speedIndex'), 2,
      'Spaceは直前速度へ復帰する');
    await pressKey(page, '4', 'Digit4');
    assert.equal(await page.evaluate('window.__SHIOJI_V004__.clock.speedIndex'), 3);

    await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.setSpeed(1);
      game.openSheet('company-sheet');
      document.querySelector('#company-goods input').focus();
    })()`);
    await pressKey(page, '4', 'Digit4');
    assert.equal(await page.evaluate('window.__SHIOJI_V004__.clock.speedIndex'), 1,
      '入力欄の数字は速度を変えない');
    await page.evaluate(`(() => {
      const editor = document.createElement('div');
      editor.id = 'shortcut-editor';
      editor.contentEditable = 'true';
      document.body.append(editor);
      editor.focus();
    })()`);
    await pressKey(page, '4', 'Digit4');
    assert.equal(await page.evaluate('window.__SHIOJI_V004__.clock.speedIndex'), 1,
      'contenteditableの数字は速度を変えない');
    await page.evaluate(`(() => {
      document.querySelector('#shortcut-editor').remove();
      document.activeElement?.blur();
    })()`);
    await pressKey(page, '4', 'Digit4', 2);
    assert.equal(await page.evaluate('window.__SHIOJI_V004__.clock.speedIndex'), 1,
      'modifier付き数字は速度を変えない');
    await pressKey(page, 'Escape', 'Escape');
    assert.equal(await page.evaluate('document.querySelector("#company-sheet").hidden'), true);
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'w', code: 'KeyW' });
    assert.deepEqual(await page.evaluate('window.__SHIOJI_V004__.pressedMovementKeys'), ['w']);
    await page.evaluate('window.dispatchEvent(new Event("blur"))');
    assert.deepEqual(await page.evaluate('window.__SHIOJI_V004__.pressedMovementKeys'), []);
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'w', code: 'KeyW' });
  }
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
  const batchMetrics = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.resetPerformanceMetrics();
    const before = game.model.tick;
    game.advanceTicks(90, { batchSize: 3 });
    return { before, after: game.model.tick, metrics: game.performanceMetrics() };
  })()`);
  assert.equal(batchMetrics.after - batchMetrics.before, 90);
  assert.equal(batchMetrics.metrics.snapshotReads, 30, JSON.stringify(batchMetrics));
  assert.equal(batchMetrics.metrics.viewModelBuilds, 30, JSON.stringify(batchMetrics));
  assert.equal(batchMetrics.metrics.displayBatches, 30, JSON.stringify(batchMetrics));
  assert.equal(batchMetrics.metrics.domUpdates, 1, JSON.stringify(batchMetrics));
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
      game.advanceTicks(1382 - game.model.tick, { animate: false });
      game.advanceTicks(1, { animate: true, baseSeconds: 2 });
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

    await wait(2100);
    assert.equal(await page.evaluate('window.__SHIOJI_V004__.displayModel.portVisuals[0]?.phase'), 'docked');
    await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.advanceTicks(9, { animate: false });
      game.advanceTicks(1, { animate: true, baseSeconds: 2 });
    })()`);
    await wait(45);
    const departureVisual = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      return {
        phase: game.displayModel.portVisuals[0]?.phase,
        qty: game.displayModel.handlingVisuals[0]?.qty,
        carrier: game.model.carriers.find(row => row.goods === 'wheat')?.id ?? null,
      };
    })()`);
    assert.equal(departureVisual.phase, 'departing', JSON.stringify(departureVisual));
    assert.ok(departureVisual.qty > 0 && departureVisual.qty <= 1, JSON.stringify(departureVisual));
    assert.ok(departureVisual.carrier, JSON.stringify(departureVisual));

    await wait(2100);
    const carrierPoint = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const carrier = game.displayModel.carriers.find(row => row.goods === 'wheat');
      game.camera.focus(carrier.x + 0.5, carrier.y + 0.5);
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
        individualResidents: model.carriers.filter(carrier => (
          carrier.householdId !== undefined && carrier.members === 1
          && carrier.peopleRows?.length === 1
        )).length,
        population: model.population,
        yardStages: [...new Set(model.buildings.flatMap(building => (
          building.yardSlots.map(slot => slot.row.visual.pileStage)
        )))],
        exactPilesHonest: model.buildings.flatMap(building => building.yardSlots)
          .filter(slot => slot.row.amount <= 20)
          .every(slot => slot.row.visual.spriteCount === Math.ceil(slot.row.amount)),
        yardZonesFixed: model.buildings.every(building => (
          building.yardPlaces.every(place => (
            ['input', 'output', 'storage'].includes(place.zone)
            && place.x >= building.x && place.x <= building.x + building.width
            && place.y >= building.y && place.y <= building.y + building.height
          ))
        )),
        emptyYardPlaces: model.buildings.flatMap(building => building.yardPlaces)
          .filter(place => !place.row).length,
      };
    })()`);
    assert.ok(worldVisuals.trails > 100, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.strongestTrail >= 4, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.raisedBuildings > 0, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.appearanceKeys > 5, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.stalls > 0, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.stock > 0, JSON.stringify(worldVisuals));
    assert.equal(worldVisuals.individualResidents, worldVisuals.population, JSON.stringify(worldVisuals));
    assert.equal(worldVisuals.exactPilesHonest, true, JSON.stringify(worldVisuals));
    assert.equal(worldVisuals.yardZonesFixed, true, JSON.stringify(worldVisuals));
    assert.ok(worldVisuals.emptyYardPlaces > 0, JSON.stringify(worldVisuals));
    assert.ok(['exact', 'small', 'medium', 'large']
      .every(stage => worldVisuals.yardStages.includes(stage)), JSON.stringify(worldVisuals));
    if (!mobile) {
      const yardView = await page.evaluate(`(() => {
        const game = window.__SHIOJI_V004__;
        const before = { zoom: game.camera.zoom, panX: game.camera.panX, panY: game.camera.panY };
        const building = game.model.buildings.find(row => (
          row.yardSlots.some(slot => slot.row.visual.pileStage === 'large')
        ));
        const slot = building.yardSlots.find(row => row.row.visual.pileStage === 'large');
        game.camera.zoom = 1.4;
        game.camera.focus(building.x + building.width / 2, building.y + building.height / 2);
        game.renderer.render(game.displayModel, 0);
        return {
          before,
          pilePoint: game.camera.project(slot.x, slot.y, 5),
          amount: slot.row.amount,
        };
      })()`);
      await page.screenshot('/tmp/shioji_v004_living_yard.png');
      await page.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved', x: yardView.pilePoint.x, y: yardView.pilePoint.y,
      });
      await wait(40);
      const pileHint = await page.evaluate(`({
        hidden: document.querySelector('#tool-hint').hidden,
        text: document.querySelector('#tool-hint').textContent,
      })`);
      assert.equal(pileHint.hidden, false, JSON.stringify(pileHint));
      assert.match(pileHint.text, new RegExp(
        `${(Math.round(yardView.amount * 10) / 10).toLocaleString('ja-JP')}荷`,
      ));
      await page.evaluate(`(() => {
        const game = window.__SHIOJI_V004__;
        const before = ${JSON.stringify(yardView.before)};
        game.camera.zoom = before.zoom;
        game.camera.panX = before.panX;
        game.camera.panY = before.panY;
        game.renderer.render(game.displayModel, 0);
      })()`);
    }

    const supply = await page.evaluate(`(() => {
      document.querySelector('#open-supply').click();
      const sheet = document.querySelector('#supply-sheet');
      const box = sheet.getBoundingClientRect();
      const rows = [...document.querySelectorAll('[data-supply-goods]')];
      const severities = rows.map(row => ({ shortage: 2, tight: 1, sufficient: 0 }[row.dataset.status]));
      const spriteIds = rows.map(row => row.querySelector('.goods-sprite')?.dataset.goodsSprite);
      return {
        hidden: sheet.hidden,
        rowCount: rows.length,
        allNamed: rows.every(row => row.querySelector('.goods-icon') && row.querySelector('.supply-name b')),
        allSprites: spriteIds.every(Boolean),
        uniqueSprites: new Set(spriteIds).size,
        allFields: rows.every(row => row.querySelectorAll('.supply-number').length === 4),
        sorted: severities.every((value, index) => index === 0 || severities[index - 1] >= value),
        fitsWithoutScroll: sheet.scrollHeight <= sheet.clientHeight + 1,
        text: sheet.textContent,
        box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      };
    })()`);
    assert.equal(supply.hidden, false, JSON.stringify(supply));
    assert.equal(supply.rowCount, 18, JSON.stringify(supply));
    assert.equal(supply.allNamed, true, JSON.stringify(supply));
    assert.equal(supply.allSprites, true, JSON.stringify(supply));
    assert.equal(supply.uniqueSprites, 18, JSON.stringify(supply));
    assert.equal(supply.allFields, true, JSON.stringify(supply));
    assert.equal(supply.sorted, true, JSON.stringify(supply));
    assert.equal(supply.fitsWithoutScroll, true, JSON.stringify(supply));
    assert.match(supply.text, /足りてる|ギリギリ|不足/);
    assert.ok(supply.box.left >= 0 && supply.box.right <= width, JSON.stringify(supply));
    assert.ok(supply.box.top >= 0 && supply.box.bottom <= height, JSON.stringify(supply));
    await page.screenshot('/tmp/shioji_v004_supply_sheet.png');

    const detail = await page.evaluate(`(() => {
      document.querySelector('[data-supply-goods="tools"]').click();
      const sheet = document.querySelector('#goods-detail-sheet');
      const box = sheet.getBoundingClientRect();
      return {
        hidden: sheet.hidden,
        supplyHidden: document.querySelector('#supply-sheet').hidden,
        title: document.querySelector('#goods-detail-title').textContent,
        elements: document.querySelectorAll('#goods-detail-content [data-detail-element]').length,
        artGoods: document.querySelector('.goods-detail-art [data-goods-sprite]')?.dataset.goodsSprite,
        factText: document.querySelector('[data-detail-element="fact"]').textContent,
        shelfText: document.querySelector('[data-detail-element="shelf-life"]').textContent,
        recipeText: document.querySelector('[data-detail-element="recipe"]').textContent,
        priceChart: Boolean(document.querySelector('[data-detail-element="price-chart"] #price-chart')),
        endLabels: document.querySelectorAll('#goods-detail-sheet .chart-end-label').length,
        referenceLines: document.querySelectorAll('#goods-detail-sheet .chart-line.reference').length,
        overflowsX: sheet.scrollWidth > sheet.clientWidth + 1,
        box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      };
    })()`);
    assert.equal(detail.hidden, false, JSON.stringify(detail));
    assert.equal(detail.supplyHidden, true, JSON.stringify(detail));
    assert.equal(detail.title, '木製品', JSON.stringify(detail));
    assert.equal(detail.elements, 5, JSON.stringify(detail));
    assert.equal(detail.artGoods, 'tools', JSON.stringify(detail));
    assert.match(detail.factText, /家の発展と木の荷車/);
    assert.match(detail.shelfText, /腐りません/);
    assert.match(detail.recipeText, /丸太.*木製品/s);
    assert.equal(detail.priceChart, true, JSON.stringify(detail));
    assert.ok(detail.endLabels >= 2 && detail.referenceLines >= 1, JSON.stringify(detail));
    assert.equal(detail.overflowsX, false, JSON.stringify(detail));
    assert.ok(detail.box.left >= 0 && detail.box.right <= width, JSON.stringify(detail));
    assert.ok(detail.box.top >= 0 && detail.box.bottom <= height, JSON.stringify(detail));
    await page.screenshot('/tmp/shioji_v004_goods_detail.png');

    const island = await page.evaluate(`(() => {
      document.querySelector('#open-island').click();
      const sheet = document.querySelector('#island-sheet');
      const box = sheet.getBoundingClientRect();
      return {
        hidden: sheet.hidden,
        defaultCharts: document.querySelectorAll('#economy-charts > figure').length,
        legacyLocations: document.querySelectorAll('[data-stock-location]').length,
        financeText: document.querySelector('#island-finance').textContent,
        healthText: document.querySelector('#island-health').textContent,
        winterText: document.querySelector('#winter-forecast').textContent,
        box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      };
    })()`);
    assert.equal(island.hidden, false, JSON.stringify(island));
    assert.equal(island.defaultCharts, 3, JSON.stringify(island));
    assert.equal(island.legacyLocations, 0, JSON.stringify(island));
    assert.match(island.financeText, /現在資金.*入金.*支出.*差引/s);
    assert.match(island.healthText, /人口.*会社の30日差引/s);
    assert.match(island.winterText,
      /必要 約[\d,]+荷.*備え [\d,]+荷.*(?:不足|足りています)/s);
    assert.ok(island.box.left >= 0 && island.box.right <= width, JSON.stringify(island));
    assert.ok(island.box.top >= 0 && island.box.bottom <= height, JSON.stringify(island));
    await page.screenshot('/tmp/shioji_v004_island_sheet.png');

    const warehouseDetail = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const warehouse = game.model.buildings.find(building => building.roles.includes('warehouse'));
      game.selectBuilding(warehouse);
      return {
        text: document.querySelector('#building-company-stock').textContent,
        hidden: document.querySelector('#building-company-stock').hidden,
        status: document.querySelector('#building-summary').textContent,
      };
    })()`);
    assert.equal(warehouseDetail.hidden, false, JSON.stringify(warehouseDetail));
    assert.match(warehouseDetail.text, /会社の倉庫にある品.*本国注文.*市場へ出す/s);
    assert.match(warehouseDetail.status, /順調/);
    assert.doesNotMatch(warehouseDetail.status, /状態|道路|敷地|座標/);

    const buildingPoint = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const householdBuildings = new Set(game.model.households.map(row => row.buildingId));
      const buildings = [...game.displayModel.buildings]
        .filter(row => householdBuildings.has(row.id));
      for (const building of buildings) {
        const point = game.camera.project(
          building.x + building.width / 2,
          building.y + building.height / 2,
          building.appearance.elevation,
        );
        if (game.renderer.hitTestCarrier(game.displayModel, point.x, point.y)) continue;
        if (game.renderer.hitTestBuilding(game.displayModel, point.x, point.y)?.id !== building.id) continue;
        return { id: building.id, x: point.x, y: point.y, journalLength: game.controller.inputJournal().length };
      }
      return null;
    })()`);
    assert.ok(buildingPoint, '荷車と重ならない建物の実クリック点がある');
    await page.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: buildingPoint.x, y: buildingPoint.y, button: 'left', clickCount: 1,
    });
    await page.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: buildingPoint.x, y: buildingPoint.y, button: 'left', clickCount: 1,
    });
    await wait(60);
    assert.deepEqual(page.errors, [], `建物クリック中のruntime error: ${page.errors.join(' | ')}`);
    const buildingSheet = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const sheet = document.querySelector('#building-sheet');
      const box = sheet.getBoundingClientRect();
      return {
        selected: game.selectedBuildingId,
        rendererSelected: game.renderer.selectedBuildingId,
        hidden: sheet.hidden,
        title: document.querySelector('#building-sheet-title').textContent,
        summary: document.querySelector('#building-summary').textContent,
        household: document.querySelector('#building-household').textContent,
        shelves: document.querySelector('#building-shelves').textContent,
        journalLength: game.controller.inputJournal().length,
        box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      };
    })()`);
    assert.equal(buildingSheet.selected, buildingPoint.id, JSON.stringify(buildingSheet));
    assert.equal(buildingSheet.rendererSelected, buildingPoint.id, JSON.stringify(buildingSheet));
    assert.equal(buildingSheet.hidden, false, JSON.stringify(buildingSheet));
    assert.match(buildingSheet.title, /の.+家 Lv\d+$/, JSON.stringify(buildingSheet));
    assert.match(buildingSheet.summary, /順調|⚠/);
    assert.doesNotMatch(buildingSheet.summary, /状態|道路|敷地|座標/);
    assert.match(buildingSheet.shelves, /在庫/, JSON.stringify(buildingSheet));
    assert.match(buildingSheet.household,
      /食料.*財布.*最近の収支.*次の暮らし.*(?:◆|◇).*仕事のいま/s,
      JSON.stringify(buildingSheet));
    assert.equal(buildingSheet.journalLength, buildingPoint.journalLength, '建物選択はjournalを増やさない');
    assert.ok(buildingSheet.box.left >= 0 && buildingSheet.box.right <= width, JSON.stringify(buildingSheet));
    assert.ok(buildingSheet.box.top >= 0 && buildingSheet.box.bottom <= height, JSON.stringify(buildingSheet));
    await page.screenshot('/tmp/shioji_v004_building_sheet.png');
    const focusResult = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      document.querySelector('#focus-selected-building').click();
      const result = {
        selected: game.selectedBuildingId,
        hidden: document.querySelector('#building-sheet').hidden,
        panX: game.camera.panX,
        panY: game.camera.panY,
      };
      game.selectBuilding(null);
      return result;
    })()`);
    assert.equal(focusResult.selected, buildingPoint.id, JSON.stringify(focusResult));
    assert.equal(focusResult.hidden, true, JSON.stringify(focusResult));

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
      document.querySelector('[data-build-category="processing"]').click();
      document.querySelector('[data-building-job="woodshop"]').click();
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

    const company = await page.evaluate(`(async () => {
      const game = window.__SHIOJI_V004__;
      game.openSheet('company-sheet');
      const sheet = document.querySelector('#company-sheet').getBoundingClientRect();
      const observer = document.querySelector('#observer').getBoundingClientRect();
      const secretaryStyle = getComputedStyle(document.querySelector('#secretary'));
      const offer = game.model.orderOffer;
      const orderText = document.querySelector('#order-panel').textContent;
      const aidText = document.querySelector('#aid-panel').textContent;
      document.querySelector('[data-company-action="request-aid"]').click();
      let targetRow = document.querySelector('.goods-row[data-goods="tools"]');
      targetRow.querySelector('[data-stock-target]').focus();
      targetRow.querySelector('[data-stock-target]').value = '80';
      targetRow.querySelector('[data-stock-target]').dispatchEvent(new Event('input', { bubbles: true }));
      game.advanceTicks(1, { animate: false });
      targetRow = document.querySelector('.goods-row[data-goods="tools"]');
      const draftAfterRender = targetRow.querySelector('[data-stock-target]').value;
      targetRow.querySelector('[data-stock-target]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      targetRow = document.querySelector('.goods-row[data-goods="tools"]');
      const targetAfterCommit = targetRow.querySelector('[data-stock-target]').value;
      const targetFeedback = targetRow.querySelector('[data-target-feedback]').textContent;
      await new Promise(resolve => requestAnimationFrame(resolve));
      const releaseRow = [...document.querySelectorAll('.goods-row')].find(row => (
        !row.querySelector('[data-company-action="release-stock"]').disabled
      ));
      const releaseGoods = releaseRow?.dataset.goods ?? null;
      const releaseText = document.querySelector('#company-goods').textContent;
      const beforeReject = game.controller.inputJournal().length;
      document.querySelector('[data-company-action="reject-order"]').click();
      const afterReject = game.controller.inputJournal().length;
      const stillOffered = game.model.orderOffer;
      document.querySelector('[data-company-action="reconsider"]').click();
      game.setSpeed(0);
      const acceptButton = document.querySelector('[data-company-action="accept-order"]');
      acceptButton.scrollIntoView({ block: 'center' });
      const acceptBox = acceptButton.getBoundingClientRect();
      window.__companyHeldButton = acceptButton;
      return {
        sheet: { left: sheet.left, right: sheet.right, top: sheet.top, bottom: sheet.bottom },
        observer: {
          left: observer.left, right: observer.right, top: observer.top, bottom: observer.bottom,
        },
        secretaryTheme: {
          backgroundImage: secretaryStyle.backgroundImage,
          color: secretaryStyle.color,
        },
        offer, orderText, aidText, draftAfterRender, targetAfterCommit, targetFeedback, releaseGoods, releaseText,
        modelTarget: game.model.stockTargets.tools, beforeReject, afterReject, stillOffered,
        acceptPoint: { x: acceptBox.x + acceptBox.width / 2, y: acceptBox.y + acceptBox.height / 2 },
        domUpdates: game.performanceMetrics().domUpdates,
      };
    })()`);
    assert.ok(company.sheet.left >= 0 && company.sheet.right <= width, JSON.stringify(company));
    assert.ok(company.sheet.top >= 0 && company.sheet.bottom <= height, JSON.stringify(company));
    assert.ok(company.observer.right < company.sheet.left, JSON.stringify(company));
    assert.ok(company.observer.left <= 20, JSON.stringify(company));
    assert.ok(company.sheet.top <= 100, JSON.stringify(company));
    assert.ok(company.sheet.bottom - company.sheet.top >= 680, JSON.stringify(company));
    assert.match(company.secretaryTheme.backgroundImage, /linear-gradient/);
    assert.equal(company.secretaryTheme.color, 'rgb(57, 45, 32)');
    assert.ok(company.offer, JSON.stringify(company));
    assert.match(company.orderText, /完遂決済単価/);
    assert.match(company.orderText, /市場最安/);
    assert.match(company.aidText, /次の支援は麦240荷/);
    assert.equal(company.draftAfterRender, '80', JSON.stringify(company));
    assert.equal(company.targetAfterCommit, '80', JSON.stringify(company));
    assert.equal(company.targetFeedback, '設定済み', JSON.stringify(company));
    assert.match(company.releaseText, /市場へ出す量.*荷.*市場へ出す/s);
    assert.equal(company.modelTarget, 80, JSON.stringify(company));
    assert.equal(company.afterReject, company.beforeReject, JSON.stringify(company));
    assert.deepEqual(company.stillOffered, company.offer);
    await page.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: company.acceptPoint.x, y: company.acceptPoint.y,
      button: 'left', buttons: 1, clickCount: 1,
    });
    await page.evaluate('window.__SHIOJI_V004__.setSpeed(3)');
    await wait(180);
    const heldOrderButton = await page.evaluate(`({
      connected: document.contains(window.__companyHeldButton),
      same: document.querySelector('[data-company-action="accept-order"]') === window.__companyHeldButton,
      domUpdates: window.__SHIOJI_V004__.performanceMetrics().domUpdates,
    })`);
    assert.equal(heldOrderButton.connected, true, JSON.stringify(heldOrderButton));
    assert.equal(heldOrderButton.same, true, JSON.stringify(heldOrderButton));
    assert.ok(heldOrderButton.domUpdates > company.domUpdates, JSON.stringify(heldOrderButton));
    await page.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: company.acceptPoint.x, y: company.acceptPoint.y,
      button: 'left', buttons: 0, clickCount: 1,
    });
    await wait(80);
    const acceptedOrder = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.setSpeed(0);
      return {
        activeOrder: game.model.activeOrder,
        journalTypes: game.controller.inputJournal().slice(-4).map(row => row.op.type),
      };
    })()`);
    assert.ok(acceptedOrder.journalTypes.includes('set_stock_target'), JSON.stringify(acceptedOrder));
    assert.equal(acceptedOrder.journalTypes.at(-1), 'accept_order');
    assert.equal(acceptedOrder.activeOrder.g, company.offer.g);
    await page.screenshot('/tmp/shioji_v004_company.png');

    const eventPanel = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.openSheet('event-sheet');
      return {
        rows: document.querySelectorAll('.event-row').length,
        operation: game.eventLog.some(row => row.type === 'operation'),
        silent: game.eventLog.some(row => (
          ['operation', 'departure', 'arrival', 'transaction', 'docking', 'handling']
            .includes(row.type)
        )),
      };
    })()`);
    assert.ok(eventPanel.rows > 0, JSON.stringify(eventPanel));
    assert.equal(eventPanel.operation, false, JSON.stringify(eventPanel));
    assert.equal(eventPanel.silent, false, JSON.stringify(eventPanel));
    assert.ok(eventPanel.rows <= 24, JSON.stringify(eventPanel));
    await page.screenshot('/tmp/shioji_v004_events.png');
    await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      document.querySelector('[data-close-sheet="event-sheet"]').click();
      game.selectTool(game.activeTool);
      game.camera.focus(game.model.width / 2, game.model.height / 2);
      document.querySelector('#toast-stack').replaceChildren();
    })()`);
  } else {
    const mobileBuilding = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.advanceTicks(60 * 30 - game.model.tick, { animate: false });
      const householdBuildingIds = new Set(game.model.households.map(row => row.buildingId));
      game.selectBuilding(game.model.buildings.find(building => householdBuildingIds.has(building.id))
        ?? game.model.buildings[0]);
      const buildingBox = document.querySelector('#building-sheet').getBoundingClientRect();
      const observerBox = document.querySelector('#observer').getBoundingClientRect();
      const secretaryStyle = getComputedStyle(document.querySelector('#secretary'));
      const buildingText = document.querySelector('#building-sheet').textContent;
      return {
        box: { left: buildingBox.left, right: buildingBox.right, top: buildingBox.top, bottom: buildingBox.bottom },
        observer: {
          left: observerBox.left, right: observerBox.right,
          top: observerBox.top, bottom: observerBox.bottom,
        },
        secretaryTheme: {
          backgroundImage: secretaryStyle.backgroundImage,
          color: secretaryStyle.color,
        },
        text: buildingText,
      };
    })()`);
    assert.ok(mobileBuilding.box.left >= 0 && mobileBuilding.box.right <= width, JSON.stringify(mobileBuilding));
    assert.ok(mobileBuilding.box.top >= 0 && mobileBuilding.box.bottom <= height, JSON.stringify(mobileBuilding));
    assert.ok(mobileBuilding.observer.bottom < mobileBuilding.box.top, JSON.stringify(mobileBuilding));
    assert.ok(mobileBuilding.observer.left <= 8 && mobileBuilding.observer.right >= width - 8,
      JSON.stringify(mobileBuilding));
    assert.match(mobileBuilding.secretaryTheme.backgroundImage, /linear-gradient/);
    assert.equal(mobileBuilding.secretaryTheme.color, 'rgb(57, 45, 32)');
    assert.match(mobileBuilding.text,
      /Lv\d+.*(?:順調|⚠).*食料.*財布.*最近の収支.*次の暮らし.*仕事のいま.*在庫/s);
    assert.doesNotMatch(mobileBuilding.text, /状態.*道路|敷地|座標/);
    await page.screenshot('/tmp/shioji_v004_building_sheet_mobile.png');
    const mobileSupply = await page.evaluate(`(() => {
      document.querySelector('#open-island-from-building').click();
      const sheet = document.querySelector('#supply-sheet');
      const box = sheet.getBoundingClientRect();
      return {
        hidden: sheet.hidden,
        rows: document.querySelectorAll('[data-supply-goods]').length,
        allFields: [...document.querySelectorAll('[data-supply-goods]')]
          .every(row => row.querySelectorAll('.supply-number').length === 4),
        fitsWithoutScroll: sheet.scrollHeight <= sheet.clientHeight + 1,
        scrollHeight: sheet.scrollHeight,
        clientHeight: sheet.clientHeight,
        gridHeight: document.querySelector('#supply-grid').getBoundingClientRect().height,
        box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      };
    })()`);
    assert.equal(mobileSupply.hidden, false, JSON.stringify(mobileSupply));
    assert.equal(mobileSupply.rows, 18, JSON.stringify(mobileSupply));
    assert.equal(mobileSupply.allFields, true, JSON.stringify(mobileSupply));
    assert.equal(mobileSupply.fitsWithoutScroll, true, JSON.stringify(mobileSupply));
    assert.ok(mobileSupply.box.left >= 0 && mobileSupply.box.right <= width, JSON.stringify(mobileSupply));
    assert.ok(mobileSupply.box.top >= 0 && mobileSupply.box.bottom <= height, JSON.stringify(mobileSupply));
    await page.screenshot('/tmp/shioji_v004_supply_sheet_mobile.png');
    const mobileCompany = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      document.querySelector('[data-close-sheet="supply-sheet"]').click();
      game.selectBuilding(null);
      game.openSheet('company-sheet');
      const companyBox = document.querySelector('#company-sheet').getBoundingClientRect();
      document.querySelector('[data-close-sheet="company-sheet"]').click();
      return { left: companyBox.left, right: companyBox.right, top: companyBox.top, bottom: companyBox.bottom };
    })()`);
    assert.ok(mobileCompany.left >= 0 && mobileCompany.right <= width, JSON.stringify(mobileCompany));
    assert.ok(mobileCompany.top >= 0 && mobileCompany.bottom <= height, JSON.stringify(mobileCompany));
  }
  const development = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.openSheet('development-sheet');
    const sheet = document.querySelector('#development-sheet');
    const box = sheet.getBoundingClientRect();
    return {
      hidden: sheet.hidden,
      branches: document.querySelectorAll('.development-branch').length,
      active: document.querySelectorAll('.development-node[data-state="active"]').length,
      future: document.querySelectorAll('.development-node[data-state="future"]').length,
      buttonsInsideMap: document.querySelectorAll('#development-map button').length,
      text: document.querySelector('#development-map').textContent,
      box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      documentFits: document.documentElement.scrollWidth <= innerWidth,
    };
  })()`);
  assert.equal(development.hidden, false, JSON.stringify(development));
  assert.equal(development.branches, 4, JSON.stringify(development));
  assert.ok(development.active > 0 && development.future > 0, JSON.stringify(development));
  assert.equal(development.buttonsInsideMap, 0, '発展図は現段階では閲覧専用');
  assert.match(development.text, /荷車工房.*造船所.*鉄製荷車/s);
  assert.ok(development.box.left >= 0 && development.box.right <= width, JSON.stringify(development));
  assert.ok(development.box.top >= 0 && development.box.bottom <= height, JSON.stringify(development));
  assert.equal(development.documentFits, true, JSON.stringify(development));
  await page.screenshot(`/tmp/shioji_v004_development_${mobile ? 'mobile' : 'desktop'}.png`);
  await page.evaluate("document.querySelector('[data-close-sheet=\"development-sheet\"]').click()");
  await page.screenshot(`/tmp/shioji_v004_browser_${mobile ? 'mobile' : 'desktop'}.png`);
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkGoodsDetail(width, height, mobile, goods) {
  const page = await newPage(width, height, mobile);
  await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    for (let day = 0; day < 30; day += 1) game.advanceTicks(30, { animate: false });
    document.querySelector('#open-supply').click();
  })()`);
  const rowPoint = await page.evaluate(`(() => {
    const row = document.querySelector(${JSON.stringify(`[data-supply-goods="${goods}"]`)});
    const box = row.getBoundingClientRect();
    return {
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
      tag: row.tagName,
      directButtons: row.querySelectorAll('button').length,
    };
  })()`);
  assert.equal(rowPoint.tag, 'BUTTON', JSON.stringify(rowPoint));
  assert.equal(rowPoint.directButtons, 0, '品目行の中に押し分けボタンを置かない');
  await page.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: rowPoint.x, y: rowPoint.y,
    button: 'left', buttons: 1, clickCount: 1,
  });
  await page.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: rowPoint.x, y: rowPoint.y,
    button: 'left', buttons: 0, clickCount: 1,
  });
  const detail = await page.evaluate(`(() => {
    const sheet = document.querySelector('#goods-detail-sheet');
    const box = sheet.getBoundingClientRect();
    const content = document.querySelector('#goods-detail-content');
    return {
      hidden: sheet.hidden,
      supplyHidden: document.querySelector('#supply-sheet').hidden,
      goods: content.dataset.goods,
      elements: content.querySelectorAll('[data-detail-element]').length,
      art: content.querySelector('.goods-detail-art [data-goods-sprite]')?.dataset.goodsSprite,
      fact: content.querySelector('[data-detail-element="fact"]').textContent,
      life: content.querySelector('[data-detail-element="shelf-life"]').textContent,
      lifeAria: content.querySelector('.shelf-life-art').getAttribute('aria-label'),
      recipe: content.querySelector('[data-detail-element="recipe"]').textContent,
      recipeAria: content.querySelector('.goods-formula').getAttribute('aria-label'),
      priceChart: Boolean(content.querySelector('[data-detail-element="price-chart"] #price-chart')),
      pricePaths: content.querySelectorAll('#price-chart .chart-line').length,
      horizontalOverflow: sheet.scrollWidth > sheet.clientWidth + 1,
      pageHorizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
    };
  })()`);
  assert.equal(detail.hidden, false, JSON.stringify(detail));
  assert.equal(detail.supplyHidden, true, JSON.stringify(detail));
  assert.equal(detail.goods, goods, JSON.stringify(detail));
  assert.equal(detail.elements, 5, JSON.stringify(detail));
  assert.equal(detail.art, goods, JSON.stringify(detail));
  assert.equal(detail.priceChart, true, JSON.stringify(detail));
  assert.ok(detail.pricePaths >= 2, JSON.stringify(detail));
  assert.equal(detail.horizontalOverflow, false, JSON.stringify(detail));
  assert.equal(detail.pageHorizontalOverflow, false, JSON.stringify(detail));
  assert.ok(detail.box.left >= 0 && detail.box.right <= width, JSON.stringify(detail));
  assert.ok(detail.box.top >= 0 && detail.box.bottom <= height, JSON.stringify(detail));
  if (goods === 'tools') {
    assert.match(detail.fact, /家の発展と木の荷車/);
    assert.match(detail.life, /腐りません/);
    assert.match(detail.recipeAria, /丸太.*木工房.*木製品/);
  }
  if (goods === 'fish') {
    assert.match(detail.fact, /3日で腐ります/);
    assert.match(detail.life, /約3日/);
    assert.match(detail.lifeAria, /約3日で傷む/);
  }
  fs.mkdirSync(GOODS_DETAIL_SCREENSHOT_DIR, { recursive: true });
  await page.screenshot(goodsDetailScreenshotPath(
    mobile ? 'goods_detail_mobile_fish.png' : 'goods_detail_pc_tools.png',
  ));
  await page.evaluate("document.querySelector('#goods-detail-back').click()");
  await wait(50);
  const returned = await page.evaluate(`({
    supplyVisible: !document.querySelector('#supply-sheet').hidden,
    detailHidden: document.querySelector('#goods-detail-sheet').hidden,
    focusedGoods: document.activeElement?.dataset?.supplyGoods ?? null,
  })`);
  assert.deepEqual(returned, {
    supplyVisible: true,
    detailHidden: true,
    focusedGoods: goods,
  });
  assert.deepEqual(page.errors, []);
  await page.close();
  return detail;
}

async function checkSpatialProductivity(width = 1440, height = 900, mobile = false) {
  const page = await newPage(width, height, mobile, GAME);
  const building = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    game.advanceTicks(Math.max(0, 240 * 30 - game.model.tick), { animate: false });
    const household = game.model.households.find(row =>
      row.productivity?.resourceWork && row.productivity.days > 0);
    if (!household) return {
      missing: true,
      day: game.model.day,
      households: game.model.households.map(row => ({
        job: row.job,
        days: row.productivity?.days,
        resource: Boolean(row.productivity?.resourceWork),
      })),
    };
    game.selectBuilding(game.model.buildings.find(row => row.id === household.buildingId));
    game.openSheet('building-sheet');
    const sheet = document.querySelector('#building-sheet');
    const rect = sheet.getBoundingClientRect();
    return {
      version: game.version,
      householdId: household.id,
      efficiency: household.productivity.efficiency,
      resourceEfficiency: household.productivity.resourceWork.efficiency,
      selectedBuildingId: game.selectedBuildingId,
      text: sheet.textContent,
      withinViewport: rect.left >= 0 && rect.right <= innerWidth
        && rect.top >= 0 && rect.bottom <= innerHeight,
      routeVisible: household.productivity.resourceWork.path.length > 1,
    };
  })()`);
  assert.ok(building && !building.missing,
    `資源職の30日実測を建物画面へ表示できる: ${JSON.stringify(building)}`);
  assert.equal(building.version, 'v004.42.1-polish');
  assert.ok(Number.isFinite(building.efficiency), JSON.stringify(building));
  assert.ok(Number.isFinite(building.resourceEfficiency), JSON.stringify(building));
  assert.equal(building.withinViewport, true, JSON.stringify(building));
  assert.equal(building.routeVisible, true, JSON.stringify(building));
  assert.match(building.text, /30日平均の日産/);
  assert.match(building.text, /生産性/);
  assert.match(building.text, /まで片道/);
  await page.screenshot(`/tmp/shioji_v004_spatial_building_${mobile ? 'mobile' : 'desktop'}.png`);

  const island = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.openSheet('island-sheet');
    const sheet = document.querySelector('#island-sheet');
    const rect = sheet.getBoundingClientRect();
    const chart = document.querySelector('#productivity-chart');
    return {
      text: document.querySelector('#island-productivity').textContent,
      rate: document.querySelector('#island-productivity-rate').textContent,
      chartDrawn: chart.childElementCount > 0,
      withinViewport: rect.left >= 0 && rect.right <= innerWidth
        && rect.top >= 0 && rect.bottom <= innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    };
  })()`);
  assert.match(island.text, /島の生産性/);
  assert.match(island.text, /近隣直接取引/);
  assert.match(island.rate, /%/);
  assert.equal(island.chartDrawn, true, JSON.stringify(island));
  assert.equal(island.withinViewport, true, JSON.stringify(island));
  assert.equal(island.horizontalOverflow, false, JSON.stringify(island));
  await page.screenshot(`/tmp/shioji_v004_spatial_island_${mobile ? 'mobile' : 'desktop'}.png`);

  const market = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const selected = game.model.buildings.find(row => row.roles.includes('market'));
    game.selectBuilding(selected);
    game.openSheet('building-sheet');
    return document.querySelector('#building-sheet').textContent;
  })()`);
  assert.match(market, /市場圏14刻/);
  assert.match(market, /近隣直接取引/);
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkSaveDeliveryUi(width = 1440, height = 900, mobile = false) {
  const page = await newPage(width, height, mobile, GAME);
  await page.evaluate("localStorage.removeItem('shioji-v004-autosave')");
  const saved = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    game.advanceTicks(3600, { animate: false });
    game.openSheet('save-sheet');
    document.querySelector('#save-local').click();
    const payload = JSON.parse(localStorage.getItem('shioji-v004-autosave'));
    const home = game.model.buildings.find(building => building.ownerHouseholdId !== null);
    game.selectBuilding(home);
    const saveBox = document.querySelector('#save-sheet').getBoundingClientRect();
    const progress = document.querySelector('.culture-growth [role="progressbar"]');
    return {
      day: game.model.day,
      payloadDay: payload.summary.day,
      schema: payload.schema,
      saveHidden: document.querySelector('#save-sheet').hidden,
      feedback: document.querySelector('#save-feedback').textContent,
      saveBox: {
        left: saveBox.left, right: saveBox.right, top: saveBox.top, bottom: saveBox.bottom,
      },
      progress: progress ? {
        now: Number(progress.getAttribute('aria-valuenow')),
        max: Number(progress.getAttribute('aria-valuemax')),
        width: progress.firstElementChild.style.width,
      } : null,
      pantryHeadings: document.querySelector('#building-shelves').textContent,
    };
  })()`);
  assert.equal(saved.schema, 'shioji-v004-save', JSON.stringify(saved));
  assert.equal(saved.payloadDay, saved.day, JSON.stringify(saved));
  assert.equal(saved.saveHidden, true, '建物を選ぶと保存シートから建物シートへ切り替わる');
  assert.match(saved.feedback, /保存/);
  assert.ok(saved.progress && saved.progress.max > 0, JSON.stringify(saved));
  assert.match(saved.progress.width, /%$/);
  assert.match(saved.pantryHeadings, /家の食料庫|家の生活用品/);
  await page.screenshot(`/tmp/shioji_v004_delivery_building_${mobile ? 'mobile' : 'desktop'}.png`);

  const resume = await page.evaluate(`(() => {
    document.querySelector('#choose-start').click();
    const button = document.querySelector('#start-resume');
    const dialog = document.querySelector('.start-dialog').getBoundingClientRect();
    return {
      hidden: button.hidden,
      text: button.textContent,
      fileInputInert: document.querySelector('#save-file-input').inert,
      dialog: { left: dialog.left, right: dialog.right, top: dialog.top, bottom: dialog.bottom },
    };
  })()`);
  assert.equal(resume.hidden, false, JSON.stringify(resume));
  assert.equal(resume.fileInputInert, false, JSON.stringify(resume));
  assert.match(resume.text, new RegExp(`${saved.day}日目`));
  assert.ok(resume.dialog.left >= 0 && resume.dialog.right <= width, JSON.stringify(resume));
  assert.ok(resume.dialog.top >= 0 && resume.dialog.bottom <= height, JSON.stringify(resume));
  await page.screenshot(`/tmp/shioji_v004_save_${mobile ? 'mobile' : 'desktop'}.png`);

  await page.evaluate("document.querySelector('#start-resume').click()");
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await wait(100);
    const ready = await page.evaluate(`Boolean(window.__SHIOJI_V004__)
      && new URLSearchParams(location.search).get('resume') === '1'
      && document.querySelector('#start-screen').hidden`);
    if (ready) break;
  }
  const restored = await page.evaluate(`({
    day: window.__SHIOJI_V004__.model.day,
    mode: window.__SHIOJI_V004__.startMode,
    hidden: document.querySelector('#start-screen').hidden,
    status: document.querySelector('#status span').textContent,
  })`);
  assert.ok(
    restored.day >= saved.day && restored.day <= saved.day + 1,
    `再開直後の通常速度で進んでも1日以内: ${JSON.stringify(restored)}`,
  );
  assert.equal(restored.mode, 'test', JSON.stringify(restored));
  assert.equal(restored.hidden, true, JSON.stringify(restored));
  assert.match(restored.status, /保存から再開/);

  await page.evaluate("document.querySelector('#choose-start').click()");
  const tutorialChoice = await page.evaluate(`(() => {
    const button = document.querySelector('[data-start-mode="tutorial"]');
    return {
      count: document.querySelectorAll('[data-start-mode="tutorial"]').length,
      enabled: !button.disabled,
      screenHidden: document.querySelector('#start-screen').hidden,
    };
  })()`);
  assert.deepEqual(tutorialChoice, { count: 1, enabled: true, screenHidden: false });
  await page.evaluate("document.querySelector('[data-start-mode=\"tutorial\"]').click()");
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await wait(100);
    const ready = await page.evaluate(`Boolean(window.__SHIOJI_V004__)
      && window.__SHIOJI_V004__.startMode === 'tutorial'
      && new URLSearchParams(location.search).get('mode') === 'tutorial'
      && new URLSearchParams(location.search).get('resume') === null`);
    if (ready) break;
  }
  const startedOver = await page.evaluate(`({
    mode: window.__SHIOJI_V004__.startMode,
    resume: new URLSearchParams(location.search).get('resume'),
    screenHidden: document.querySelector('#start-screen').hidden,
    buildings: window.__SHIOJI_V004__.model.buildings.map(building => building.type),
    households: window.__SHIOJI_V004__.model.households.length,
    roads: window.__SHIOJI_V004__.model.roadKeys.length,
  })`);
  assert.deepEqual(startedOver, {
    mode: 'tutorial',
    resume: null,
    screenHidden: true,
    buildings: ['port'],
    households: 0,
    roads: 0,
  }, JSON.stringify(startedOver));
  await page.screenshot(`/tmp/shioji_v004_start_over_${mobile ? 'mobile' : 'desktop'}.png`);
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkMarketRhythmUi(width = 1440, height = 900, mobile = false) {
  const page = await newPage(width, height, mobile, GAME);
  const result = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    game.advanceTicks(450, { animate: false });
    let household = null;
    for (let tick = 0; tick < 600 && !household; tick += 1) {
      household = game.model.households.find(row => row.marketRhythm?.kind === 'batching') ?? null;
      if (!household) game.advanceTicks(1, { animate: false });
    }
    if (!household) throw new Error('2日まとめ待ちの世帯を実状態で観測できません');
    const building = game.model.buildings.find(row => row.id === household.buildingId);
    game.selectBuilding(building);
    const sheet = document.querySelector('#building-sheet');
    const box = sheet.getBoundingClientRect();
    return {
      version: game.version,
      day: game.model.day,
      label: household.marketRhythm.label,
      detail: household.marketRhythm.detail,
      text: document.querySelector('#building-household').textContent,
      box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      hidden: sheet.hidden,
    };
  })()`);
  assert.equal(result.version, 'v004.42.1-polish', JSON.stringify(result));
  assert.equal(result.hidden, false, JSON.stringify(result));
  assert.match(result.label, /出荷をまとめ中 1\/2日/, JSON.stringify(result));
  assert.match(result.detail, /食料切れと生産停止は待ちません/, JSON.stringify(result));
  assert.match(result.text, /出荷をまとめ中 1\/2日/, JSON.stringify(result));
  assert.ok(result.box.left >= 0 && result.box.right <= width, JSON.stringify(result));
  assert.ok(result.box.top >= 0 && result.box.bottom <= height, JSON.stringify(result));
  await page.screenshot(`/tmp/shioji_v004_market_rhythm_${mobile ? 'mobile' : 'desktop'}.png`);
  assert.deepEqual(page.errors, []);
  await page.close();
}

if (process.argv.includes('--start-choice-only')) {
  await checkStartChoice(1440, 900, false, 'tutorial');
  await checkStartChoice(390, 844, true, 'sandbox');
  await checkStartChoice(800, 700, false, 'test');
  console.log('CHARTER ISLE v004 spring start choices smoke: PASS');
} else if (process.argv.includes('--company-pointer-only')) {
  await checkTutorialCompanyPointerStability();
  console.log('CHARTER ISLE v004 company pointer smoke: PASS');
} else if (process.argv.includes('--tutorial-handoff-only')) {
  await checkTutorialGoalHandoff();
  await checkTutorialGoalHandoff(390, 844, true);
  console.log('CHARTER ISLE v004 tutorial handoff smoke: PASS');
} else if (process.argv.includes('--tutorial-letters-only')) {
  await checkTutorialLetterDelivery();
  console.log('CHARTER ISLE v004 tutorial letter delivery smoke: PASS');
} else if (process.argv.includes('--secretary-lifecycle-only')) {
  await checkSecretaryEventLifecycle();
  console.log('CHARTER ISLE v004 secretary lifecycle smoke: PASS');
} else if (process.argv.includes('--building-levels-only')) {
  await checkBuildingLevelVisuals();
  await checkBuildingLevelVisuals(390, 844, true);
  console.log('CHARTER ISLE v004 building levels smoke: PASS');
} else if (process.argv.includes('--readability-only')) {
  await checkReadabilityUi();
  await checkReadabilityUi(390, 844, true);
  console.log('CHARTER ISLE v004 readability smoke: PASS');
} else if (process.argv.includes('--people-visuals-only')) {
  await checkPeopleVisuals(1440, 900, false);
  await checkPeopleVisuals(390, 844, true);
  console.log('CHARTER ISLE v004 people visuals smoke: PASS');
} else if (process.argv.includes('--elena-lines-only')) {
  await checkElenaLineBreaks(1440, 900, false);
  await checkElenaLineBreaks(390, 844, true);
  console.log('CHARTER ISLE v004 Elena line breaks smoke: PASS');
} else if (process.argv.includes('--seasonal-plots-only')) {
  await checkSeasonalPlots(1440, 900, false);
  await checkSeasonalPlots(390, 844, true);
  console.log('CHARTER ISLE v004 seasonal plots smoke: PASS');
} else if (process.argv.includes('--seasonal-events-only')) {
  const result = await checkSeasonalEvents();
  console.log(`CHARTER ISLE v004 seasonal events smoke: PASS ${JSON.stringify(result)}`);
} else if (process.argv.includes('--fast-forward-voices-only')) {
  const result = await checkFastForwardVoices();
  console.log(`CHARTER ISLE v004 fast-forward voices smoke: PASS ${JSON.stringify({
    day: result.day,
    elapsedMs: Number(result.elapsedMs.toFixed(1)),
    metrics: result.metrics,
    queue: result.chronological.map(row => `${row.day}:${row.type}`),
    firstRoute: `${result.route.target.kind}:${result.route.target.id}`,
  })}`);
} else if (process.argv.includes('--boundary-voices-only')) {
  const result = await checkBoundaryVoices();
  console.log(`CHARTER ISLE v004 boundary voices smoke: PASS ${JSON.stringify(result)}`);
} else if (process.argv.includes('--goods-discovery-only')) {
  await checkStartChoice(1440, 900, false, 'tutorial');
  await checkStartChoice(390, 844, true, 'sandbox');
  await checkStartChoice(800, 700, false, 'test');
  await checkGoodsDiscovery();
  console.log('CHARTER ISLE v004 goods discovery smoke: PASS');
} else if (process.argv.includes('--goods-detail-only')) {
  const pc = await checkGoodsDetail(1440, 900, false, 'tools');
  const mobile = await checkGoodsDetail(390, 844, true, 'fish');
  console.log(`CHARTER ISLE v004 goods detail smoke: PASS ${JSON.stringify({
    pc: { goods: pc.goods, elements: pc.elements, pricePaths: pc.pricePaths },
    mobile: { goods: mobile.goods, elements: mobile.elements, pricePaths: mobile.pricePaths },
  })}`);
} else if (process.argv.includes('--save-delivery-only')) {
  await checkSaveDeliveryUi(1440, 900, false);
  await checkSaveDeliveryUi(390, 844, true);
  console.log('CHARTER ISLE v004 save/delivery smoke: PASS');
} else if (process.argv.includes('--market-rhythm-only')) {
  await checkMarketRhythmUi(1440, 900, false);
  await checkMarketRhythmUi(390, 844, true);
  console.log('CHARTER ISLE v004 market rhythm smoke: PASS');
} else if (process.argv.includes('--spatial-productivity-only')) {
  await checkSpatialProductivity(1440, 900, false);
  await checkSpatialProductivity(390, 844, true);
  console.log('CHARTER ISLE v004 spatial productivity smoke: PASS');
} else if (process.argv.includes('--viewport-only')) {
  await checkViewport(1440, 900, false);
  await checkViewport(390, 844, true);
  console.log('CHARTER ISLE v004 viewport smoke: PASS');
} else if (process.argv.includes('--mobile-viewport-only')) {
  await checkViewport(390, 844, true);
  console.log('CHARTER ISLE v004 mobile viewport smoke: PASS');
} else if (process.argv.includes('--desktop-viewport-only')) {
  await checkViewport(1440, 900, false);
  console.log('CHARTER ISLE v004 desktop viewport smoke: PASS');
} else {
  await checkBootFailureRecovery();
  await checkStartChoice(1440, 900, false, 'tutorial');
  await checkStartChoice(390, 844, true, 'tutorial');
  await checkStartChoice(390, 844, true, 'sandbox');
  await checkStartChoice(800, 700, false, 'test');
  await checkTutorialCompanyPointerStability();
  await checkTutorialGoalHandoff();
  await checkTutorialGoalHandoff(390, 844, true);
  await checkSecretaryEventLifecycle();
  await checkBuildingLevelVisuals();
  await checkBuildingLevelVisuals(390, 844, true);
  await checkTutorialLetterDelivery();
  await checkViewport(1440, 900, false);
  await checkViewport(390, 844, true);
  console.log('CHARTER ISLE v004 browser smoke: PASS');
}
