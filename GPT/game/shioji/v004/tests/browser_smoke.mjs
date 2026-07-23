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

async function pressKey(page, key, code, modifiers = 0) {
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, modifiers });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, modifiers });
}

async function checkTutorialCompanyPointerStability() {
  const page = await newPage(800, 700, false, gameForMode('tutorial'));
  const setup = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
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

  const targetSetup = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    const row = document.querySelector('.goods-row[data-goods="tools"]');
    const input = row.querySelector('[data-stock-target]');
    input.scrollIntoView({ block: 'center' });
    const inputBox = input.getBoundingClientRect();
    window.__tutorialToolsTargetInput = input;
    return {
      inputPoint: { x: inputBox.x + inputBox.width / 2, y: inputBox.y + inputBox.height / 2 },
      journalLength: game.controller.inputJournal().length,
    };
  })()`);
  await page.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: targetSetup.inputPoint.x, y: targetSetup.inputPoint.y,
    button: 'left', buttons: 1, clickCount: 1,
  });
  await page.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: targetSetup.inputPoint.x, y: targetSetup.inputPoint.y,
    button: 'left', buttons: 0, clickCount: 1,
  });
  await page.send('Input.insertText', { text: '80' });
  await page.evaluate('window.__SHIOJI_V004__.setSpeed(3)');
  await wait(180);
  const targetHeld = await page.evaluate(`({
    connected: document.contains(window.__tutorialToolsTargetInput),
    same: document.querySelector('.goods-row[data-goods="tools"] [data-stock-target]')
      === window.__tutorialToolsTargetInput,
    focused: document.activeElement === window.__tutorialToolsTargetInput,
    value: window.__tutorialToolsTargetInput.value,
  })`);
  assert.equal(targetHeld.connected, true, JSON.stringify(targetHeld));
  assert.equal(targetHeld.same, true, JSON.stringify(targetHeld));
  assert.equal(targetHeld.focused, true, JSON.stringify(targetHeld));
  assert.equal(Number(targetHeld.value), 80, JSON.stringify(targetHeld));
  await pressKey(page, 'Enter', 'Enter');
  await wait(80);
  const targetResult = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    game.setSpeed(0);
    return {
      target: game.model.stockTargets.tools,
      operations: game.controller.inputJournal().slice(${targetSetup.journalLength})
        .filter(row => row.op.type === 'set_stock_target'),
    };
  })()`);
  assert.equal(targetResult.target, 80, JSON.stringify(targetResult));
  assert.equal(targetResult.operations.length, 1, JSON.stringify(targetResult));
  assert.equal(targetResult.operations[0].op.qty, 80, JSON.stringify(targetResult));
  assert.deepEqual(page.errors, []);
  await page.close();
}

async function checkTutorialGoalHandoff(width = 1000, height = 760, mobile = false) {
  const page = await newPage(width, height, mobile, gameForMode('tutorial'));
  const transition = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
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
    game.controller.operate({
      type: 'add_road', start: setup.road.start, end: setup.road.end,
    });
    game.advanceTicks(0, { animate: false });
    game.controller.operate({
      type: 'place_building', job: 'logger',
      x: setup.logger.entrance.x, y: setup.logger.entrance.y,
      buildingX: setup.logger.x, buildingY: setup.logger.y,
    });
    game.advanceTicks(0, { animate: false });
    const observer = document.querySelector('#observer').getBoundingClientRect();
    const dock = document.querySelector('#build-dock').getBoundingClientRect();
    return {
      handoff: game.tutorialHandoff,
      objective: game.tutorialState.completedGoals,
      priority: document.querySelector('#secretary').dataset.secretaryPriority,
      speech: document.querySelector('#secretary-speech').textContent,
      action: document.querySelector('#secretary-action').textContent,
      objectiveHidden: document.querySelector('#tutorial-objective').hidden,
      memoChapter: document.querySelector('#tutorial-chapter').textContent,
      memoTitle: document.querySelector('#tutorial-goal').textContent,
      observer: { top: observer.top, bottom: observer.bottom, width: observer.width },
      dock: { top: dock.top, bottom: dock.bottom },
    };
  })()`);
  assert.equal(transition.handoff.completedId, 'first-road-and-logger', JSON.stringify(transition));
  assert.equal(transition.handoff.nextId, 'market-for-logs', JSON.stringify(transition));
  assert.ok(transition.objective.includes('first-road-and-logger'), JSON.stringify(transition));
  assert.equal(transition.priority, 'goal-complete', JSON.stringify(transition));
  assert.match(transition.speech, /できました/);
  assert.equal(transition.action, 'もう一度言って');
  assert.equal(transition.objectiveHidden, true, '達成中は次の現在目標を見せない');
  assert.ok(transition.observer.width >= (mobile ? width - 20 : 480), JSON.stringify(transition));
  assert.ok(transition.observer.bottom < transition.dock.top, JSON.stringify(transition));
  await page.screenshot(`/tmp/shioji_v004_tutorial_handoff_${mobile ? 'mobile' : 'desktop'}.png`);

  const repeated = await page.evaluate(`(() => {
    document.querySelector('#secretary').click();
    const game = window.__SHIOJI_V004__;
    return {
      handoff: game.tutorialHandoff,
      priority: document.querySelector('#secretary').dataset.secretaryPriority,
      status: document.querySelector('#status').textContent,
    };
  })()`);
  assert.equal(repeated.handoff.completedId, 'first-road-and-logger',
    'エレナを押しても次へ進まず復唱する');
  assert.match(repeated.status, /エレナ「できました/);

  await wait(3400);
  const continued = await page.evaluate(`(() => {
    const game = window.__SHIOJI_V004__;
    return {
      handoff: game.tutorialHandoff,
      priority: document.querySelector('#secretary').dataset.secretaryPriority,
      speech: document.querySelector('#secretary-speech').textContent,
      objectiveHidden: document.querySelector('#tutorial-objective').hidden,
      memoChapter: document.querySelector('#tutorial-chapter').textContent,
      memoTitle: document.querySelector('#tutorial-goal').textContent,
    };
  })()`);
  assert.equal(continued.handoff, null, '約3.2秒後に自動で次へ移る');
  assert.equal(continued.priority, 'objective', JSON.stringify(continued));
  assert.match(continued.speech, /木こりの荷/);
  assert.equal(continued.objectiveHidden, false);
  assert.match(continued.memoChapter, /第一章/);
  assert.match(continued.memoTitle, /市場/);
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
      buildingOptions: [...document.querySelectorAll('#building-kind option')].map(option => option.value),
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
  assert.deepEqual(launcher.buildingOptions.slice(0, 2), ['market', 'warehouse']);
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
    tutorialActionHidden: document.querySelector('#tutorial-action').hidden,
    tutorialActionText: document.querySelector('#tutorial-action').textContent,
    secretaryPriority: document.querySelector('#secretary').dataset.secretaryPriority,
    secretarySpeech: document.querySelector('#secretary-speech').textContent,
    secretaryRepeat: document.querySelector('#secretary-action').textContent,
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
    assert.equal(started.tutorialActionHidden, false, JSON.stringify(started));
    assert.equal(started.tutorialActionText, '［案内］');
    assert.equal(started.secretaryPriority, 'objective', JSON.stringify(started));
    assert.match(started.secretarySpeech, /丸太.*森と港/);
    assert.equal(started.secretaryRepeat, 'もう一度言って');
    assert.match(started.objectiveInstruction, /森まで道を敷く/);
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

async function checkViewport(width, height, mobile) {
  const page = await newPage(width, height, mobile);
  assert.equal(await page.evaluate('document.title'), 'CHARTER ISLE — 潮路の島 v004');
  assert.equal(await page.evaluate("document.querySelector('[data-testid=build-version]').textContent"), 'v004.15.0-elena-first-seat');
  assert.equal(await page.evaluate('window.__SHIOJI_V004__.version'), 'v004.15.0-elena-first-seat');
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
      menuButtons: [...document.querySelectorAll('#top-menu button:not([hidden])')].map(rect),
      categories: [...document.querySelectorAll('[data-build-category]')].map(button => button.textContent),
      palette: [...document.querySelectorAll('[data-building-job]')].map(button => button.textContent),
      secretaryPriority: document.querySelector('#secretary').dataset.secretaryPriority,
      secretaryText: document.querySelector('#secretary').textContent,
      secretaryAlt: document.querySelector('#secretary img').alt,
      hasEngineWindow: document.body.textContent.includes('エンジンの世界'),
      season: document.querySelector('#season-value').textContent,
      islandSignal: document.querySelector('#island-signal').textContent,
    };
  })()`);
  for (const bounds of [
    controlBounds.hud, controlBounds.speed, controlBounds.dock, controlBounds.observer, controlBounds.secretary,
    controlBounds.topMenu, ...controlBounds.buttons, ...controlBounds.menuButtons,
  ]) {
    assert.ok(bounds.left >= 0 && bounds.right <= controlBounds.viewport.width, JSON.stringify(controlBounds));
    assert.ok(bounds.top >= 0 && bounds.bottom <= controlBounds.viewport.height, JSON.stringify(controlBounds));
  }
  assert.deepEqual(controlBounds.categories, ['整備', '流通', '食料', '採取', '加工']);
  assert.equal(controlBounds.palette.length, 2);
  assert.match(controlBounds.palette.join(' '), /市場.*2,500D.*5×5.*蔵.*2,500D.*4×4/s);
  assert.equal(controlBounds.secretaryPriority, 'operation-guide');
  assert.match(controlBounds.secretaryAlt, /エレナ/);
  assert.match(controlBounds.secretaryText, /エレナ・ヴァンス.*島況.*もう一度言って/s);
  assert.equal(controlBounds.hasEngineWindow, false);
  assert.match(controlBounds.season, /^(冬|春|夏|秋)・\d+月$/);
  assert.match(controlBounds.islandSignal, /^(平穏|成長|注意|危険)$/);

  const secretaryRepeat = await page.evaluate(`(() => {
    document.querySelector('#secretary').click();
    return {
      sheetHidden: document.querySelector('#island-sheet').hidden,
      status: document.querySelector('#status').textContent,
    };
  })()`);
  assert.equal(secretaryRepeat.sheetHidden, true, 'エレナの発話は操作UIを兼ねない');
  assert.match(secretaryRepeat.status, /エレナ「島は今日も動いています/);

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
      game.advanceTicks(1292 - game.model.tick, { animate: false });
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
        cart: game.model.carriers.find(carrier => carrier.kind === 'cart')?.id ?? null,
      };
    })()`);
    assert.equal(departureVisual.phase, 'departing', JSON.stringify(departureVisual));
    assert.ok(departureVisual.qty > 0 && departureVisual.qty <= 1, JSON.stringify(departureVisual));
    assert.ok(departureVisual.cart, JSON.stringify(departureVisual));

    await wait(2100);
    const carrierPoint = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const carrier = game.displayModel.carriers.find(row => row.kind === 'cart');
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

    const island = await page.evaluate(`(() => {
      document.querySelector('#open-island').click();
      const sheet = document.querySelector('#island-sheet');
      const box = sheet.getBoundingClientRect();
      return {
        hidden: sheet.hidden,
        manifestRows: document.querySelectorAll('.manifest-row').length,
        locationRows: document.querySelectorAll('[data-stock-location]').length,
        companyLocations: [...document.querySelectorAll('[data-stock-location]')]
          .filter(button => button.textContent.includes('会社の蔵')).length,
        companyStock: Object.values(window.__SHIOJI_V004__.model.companyStock)
          .reduce((total, amount) => total + amount, 0),
        marketRows: document.querySelectorAll('.market-flow-row').length,
        marketText: document.querySelector('#market-overview').textContent,
        financeText: document.querySelector('#island-finance').textContent,
        healthText: document.querySelector('#island-health').textContent,
        box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      };
    })()`);
    assert.equal(island.hidden, false, JSON.stringify(island));
    assert.ok(island.manifestRows > 0 && island.locationRows > 0, JSON.stringify(island));
    assert.equal(island.companyLocations > 0, island.companyStock > 0, JSON.stringify(island));
    assert.ok(island.marketRows > 10, JSON.stringify(island));
    assert.match(island.marketText, /品目.*相場.*現物.*仕入\/日.*生産\/日.*消費\/日/s);
    assert.match(island.financeText, /現在資金.*入金.*支出.*差引/s);
    assert.match(island.healthText, /人口.*会社の30日差引/s);
    assert.ok(island.box.left >= 0 && island.box.right <= width, JSON.stringify(island));
    assert.ok(island.box.top >= 0 && island.box.bottom <= height, JSON.stringify(island));
    await page.screenshot('/tmp/shioji_v004_island_sheet.png');
    const locationFocus = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const before = { x: game.camera.panX, y: game.camera.panY };
      document.querySelector('[data-stock-location]').click();
      return {
        before,
        after: { x: game.camera.panX, y: game.camera.panY },
        hidden: document.querySelector('#island-sheet').hidden,
      };
    })()`);
    assert.equal(locationFocus.hidden, true, JSON.stringify(locationFocus));
    assert.notDeepEqual(locationFocus.after, locationFocus.before, JSON.stringify(locationFocus));

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
    assert.match(warehouseDetail.text, /会社の蔵にある品.*本国注文.*蔵出し/s);
    assert.match(warehouseDetail.status, /会社の物流施設/);

    const buildingPoint = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      const buildings = [...game.displayModel.buildings]
        .sort((left, right) => Number(right.occupied) - Number(left.occupied));
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
    assert.ok(buildingSheet.title.length > 0, JSON.stringify(buildingSheet));
    assert.match(buildingSheet.summary, /状態.*道路.*敷地.*座標/s);
    assert.match(buildingSheet.shelves, /区分棚/, JSON.stringify(buildingSheet));
    if (buildingSheet.household.trim()) {
      assert.match(buildingSheet.household, /Lv\d+への成長|最高段階まで成長済み/,
        JSON.stringify(buildingSheet));
      assert.match(buildingSheet.household, /必要.*日|成長済み/, JSON.stringify(buildingSheet));
    }
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
    assert.ok(company.observer.bottom < company.sheet.top, JSON.stringify(company));
    assert.ok(Math.abs((company.observer.left + company.observer.right) / 2 - width / 2) < 1,
      JSON.stringify(company));
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
    const mobileBuilding = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      game.advanceTicks(60 * 30 - game.model.tick, { animate: false });
      game.selectBuilding(game.model.buildings.find(building => building.occupied) ?? game.model.buildings[0]);
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
    assert.match(mobileBuilding.text, /状態.*道路.*敷地.*座標/s);
    await page.screenshot('/tmp/shioji_v004_building_sheet_mobile.png');
    const mobileIsland = await page.evaluate(`(() => {
      document.querySelector('#open-island-from-building').click();
      const sheet = document.querySelector('#island-sheet');
      const box = sheet.getBoundingClientRect();
      return {
        hidden: sheet.hidden,
        locations: document.querySelectorAll('[data-stock-location]').length,
        marketRows: document.querySelectorAll('.market-flow-row').length,
        box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
      };
    })()`);
    assert.equal(mobileIsland.hidden, false, JSON.stringify(mobileIsland));
    assert.ok(mobileIsland.locations > 0 && mobileIsland.marketRows > 10, JSON.stringify(mobileIsland));
    assert.ok(mobileIsland.box.left >= 0 && mobileIsland.box.right <= width, JSON.stringify(mobileIsland));
    assert.ok(mobileIsland.box.top >= 0 && mobileIsland.box.bottom <= height, JSON.stringify(mobileIsland));
    await page.screenshot('/tmp/shioji_v004_island_sheet_mobile.png');
    const mobileCompany = await page.evaluate(`(() => {
      const game = window.__SHIOJI_V004__;
      document.querySelector('[data-close-sheet="island-sheet"]').click();
      game.selectBuilding(null);
      game.openSheet('company-sheet');
      const companyBox = document.querySelector('#company-sheet').getBoundingClientRect();
      document.querySelector('[data-close-sheet="company-sheet"]').click();
      return { left: companyBox.left, right: companyBox.right, top: companyBox.top, bottom: companyBox.bottom };
    })()`);
    assert.ok(mobileCompany.left >= 0 && mobileCompany.right <= width, JSON.stringify(mobileCompany));
    assert.ok(mobileCompany.top >= 0 && mobileCompany.bottom <= height, JSON.stringify(mobileCompany));
  }
  await page.screenshot(`/tmp/shioji_v004_browser_${mobile ? 'mobile' : 'desktop'}.png`);
  assert.deepEqual(page.errors, []);
  await page.close();
}

if (process.argv.includes('--company-pointer-only')) {
  await checkTutorialCompanyPointerStability();
  console.log('CHARTER ISLE v004 company pointer smoke: PASS');
} else if (process.argv.includes('--tutorial-handoff-only')) {
  await checkTutorialGoalHandoff();
  await checkTutorialGoalHandoff(390, 844, true);
  console.log('CHARTER ISLE v004 tutorial handoff smoke: PASS');
} else {
  await checkBootFailureRecovery();
  await checkStartChoice(1440, 900, false, 'tutorial');
  await checkStartChoice(390, 844, true, 'tutorial');
  await checkStartChoice(390, 844, true, 'sandbox');
  await checkStartChoice(800, 700, false, 'test');
  await checkTutorialCompanyPointerStability();
  await checkTutorialGoalHandoff();
  await checkTutorialGoalHandoff(390, 844, true);
  await checkViewport(1440, 900, false);
  await checkViewport(390, 844, true);
  console.log('CHARTER ISLE v004 browser smoke: PASS');
}
