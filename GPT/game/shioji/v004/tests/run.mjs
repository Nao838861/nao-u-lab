import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createEngineApi } from '../../engine/src/api.js';
import { buildBaseCity } from '../../engine/src/audit.js';
import { IsometricCamera } from '../src/camera.js';
import { SimulationClock } from '../src/clock.js';
import { createEngineController } from '../src/engine_bridge.js';
import { snapshotToViewModel } from '../src/view_model.js';

let passed = 0;

function test(name, body) {
  body();
  passed += 1;
  console.log(`ok - ${name}`);
}

test('段1: createEngineApiで基準都市を起動し1日30tick進める', () => {
  const controller = createEngineController({ seed: 11 });
  const before = controller.readModel();
  assert.equal(before.day, 0);
  assert.equal(before.tick, 0);
  assert.deepEqual([before.width, before.height], [48, 40]);
  assert.ok(before.buildings.length > 0);
  controller.advanceOneDay();
  const after = controller.readModel();
  assert.equal(after.day, 1);
  assert.equal(after.tick, 30);
});

test('段1: v003の章・台本・旧Worldをv004へ持ち込まない', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /objective|advisor|opening|TUTORIAL|第一章/);
  assert.match(html, /src="\.\/src\/main\.js/);
  assert.match(html, /潮路の島 v004/);
  assert.equal(fs.existsSync(new URL('../src/world.js', import.meta.url)), false);
});

test('段2: full snapshotを地形・建物・キャリア・棚の不変描画モデルへ変換する', () => {
  const api = createEngineApi(buildBaseCity(11));
  const snapshot = api.snapshot({ scope: 'full' });
  const model = snapshotToViewModel(snapshot);
  assert.equal(model.terrain.length, snapshot.physical.height);
  assert.equal(model.terrain[0].length, snapshot.physical.width);
  assert.equal(model.buildings.length, snapshot.physical.buildings.length);
  assert.equal(model.carriers.length, snapshot.economy.households.length);
  assert.ok(model.buildings.every(building => Array.isArray(building.shelves)));
  assert.equal(Object.isFrozen(model), true);
  assert.equal(Object.isFrozen(model.terrain[0][0]), true);
  assert.throws(() => { model.terrain[0][0].kind = 'coal'; }, TypeError);
});

test('段2: UIあり/なしで60tick後のエンジンJSON状態が完全一致する', () => {
  const withUi = createEngineApi(buildBaseCity(13));
  const headless = createEngineApi(buildBaseCity(13));
  for (let tick = 0; tick < 60; tick += 1) {
    snapshotToViewModel(withUi.snapshot({ scope: 'full' }));
    withUi.advanceTicks(1);
    headless.advanceTicks(1);
  }
  snapshotToViewModel(withUi.snapshot({ scope: 'full' }));
  assert.deepEqual(withUi.snapshot(), headless.snapshot());
  assert.deepEqual(withUi.inputJournal(), headless.inputJournal());
});

test('段2: engine importをbridge一か所へ隔離しrendererへAPIを渡さない', () => {
  const sources = Object.fromEntries([
    'camera.js', 'clock.js', 'config.js', 'controller.js', 'main.js', 'renderer.js', 'view_model.js',
  ].map(file => [file, fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')]));
  for (const [file, source] of Object.entries(sources)) {
    assert.doesNotMatch(source, /engine\/src/, `${file}からengineを直接importしない`);
  }
  assert.doesNotMatch(sources['renderer.js'], /snapshot|applyOperation|advanceTicks|inputJournal/);
  const bridge = fs.readFileSync(new URL('../src/engine_bridge.js', import.meta.url), 'utf8');
  assert.match(bridge, /engine\/src\/api\.js/);
  assert.match(bridge, /createEngineApi/);
});

test('段3: アイソメカメラは盤サイズを焼き付けず中心・往復変換を保つ', () => {
  for (const [width, height] of [[48, 40], [96, 80], [137, 91]]) {
    const camera = new IsometricCamera();
    camera.resize(1440, 900);
    camera.setWorldSize(width, height);
    const center = camera.project(width / 2, height / 2);
    assert.ok(Math.abs(center.x - 720) < 1e-9);
    assert.ok(Math.abs(center.y - 450) < 1e-9);
    const worldPoint = { x: width * 0.73, y: height * 0.28 };
    const projected = camera.project(worldPoint.x, worldPoint.y);
    const restored = camera.unproject(projected.x, projected.y);
    assert.ok(Math.abs(restored.x - worldPoint.x) < 1e-9);
    assert.ok(Math.abs(restored.y - worldPoint.y) < 1e-9);
  }
});

test('段3: PCドラッグとホイール、スマホのピンチに使うpan/zoomAtが焦点を保つ', () => {
  const camera = new IsometricCamera();
  camera.resize(390, 844);
  camera.setWorldSize(48, 40);
  const beforePan = { x: camera.panX, y: camera.panY };
  camera.pan(37, -19);
  assert.deepEqual({ x: camera.panX, y: camera.panY }, {
    x: beforePan.x + 37,
    y: beforePan.y - 19,
  });
  const screen = { x: 180, y: 300 };
  const beforeZoom = camera.unproject(screen.x, screen.y);
  camera.zoomAt(1.25, screen.x, screen.y);
  const afterZoom = camera.unproject(screen.x, screen.y);
  assert.ok(Math.abs(afterZoom.x - beforeZoom.x) < 1e-9);
  assert.ok(Math.abs(afterZoom.y - beforeZoom.y) < 1e-9);
  assert.ok(camera.zoom >= camera.minZoom && camera.zoom <= camera.maxZoom);
});

function runSpeedSchedule({ frameSeconds, speedPattern }) {
  const api = createEngineApi(buildBaseCity(14));
  const clock = new SimulationClock();
  const operationTicks = [30, 90];
  let operationIndex = 0;
  let tick = 0;
  let frame = 0;
  let guard = 0;
  while (tick < 150) {
    clock.setSpeed(speedPattern[frame % speedPattern.length]);
    let budget = clock.consume(frameSeconds[frame % frameSeconds.length]);
    frame += 1;
    guard += 1;
    assert.ok(guard < 20000, '速度スケジュールが進行する');
    while (budget > 0 && tick < 150) {
      const nextOperationTick = operationTicks[operationIndex] ?? 150;
      const nextStop = Math.min(nextOperationTick, 150);
      const count = Math.min(budget, nextStop - tick);
      if (count > 0) {
        api.advanceTicks(count);
        tick += count;
        budget -= count;
      }
      if (tick === nextOperationTick && operationIndex < operationTicks.length) {
        api.applyOperation({
          type: 'set_stock_target',
          goods: operationIndex === 0 ? 'wheat' : 'tools',
          qty: operationIndex === 0 ? 120 : 8,
        });
        operationIndex += 1;
      }
    }
  }
  return { snapshot: api.snapshot(), journal: api.inputJournal() };
}

test('段4: 停止を含む速度変更はstep頻度だけを変え同一journal・同一結果になる', () => {
  const first = runSpeedSchedule({
    frameSeconds: [0.08, 0.17, 0.31],
    speedPattern: [1, 2, 0, 3],
  });
  const second = runSpeedSchedule({
    frameSeconds: [0.5, 0.04, 0.23, 0.12],
    speedPattern: [3, 0, 1, 2, 2],
  });
  assert.deepEqual(first.journal, second.journal);
  assert.deepEqual(first.snapshot, second.snapshot);
});

test('段4: 時間制御は停止・通常・四倍・一日毎秒の4段階を持つ', () => {
  const clock = new SimulationClock({ speedIndex: 0 });
  assert.equal(clock.consume(10), 0);
  clock.setSpeed(1);
  assert.equal(clock.consume(0.5), 1);
  clock.setSpeed(2);
  assert.equal(clock.consume(0.5), 4);
  clock.setSpeed(3);
  assert.equal(clock.consume(1), 30);
  assert.throws(() => clock.setSpeed(4), RangeError);
});

test('段3/4: レスポンシブHUDとカメラ・速度操作のブラウザ契約を持つ', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  for (const id of ['world', 'hud', 'funds-value', 'day-value', 'tick-value', 'speed-controls', 'step-day']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(css, /html, body[\s\S]*overflow:\s*hidden/);
  assert.match(css, /touch-action:\s*none/);
  assert.match(css, /@media \(max-width: 640px\)/);
});

console.log(`\n${passed} v004 tests passed`);
