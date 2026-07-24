import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createEngineApi, replayInputJournal } from '../../engine/src/api.js';
import { buildBaseCity } from '../../engine/src/audit.js';
import { createViewController } from '../src/controller.js';
import { previewBuildingPlacement, previewRoadPlacement } from '../src/placement.js';

const REPOSITORY_ROOT = fileURLToPath(new URL('../../../../../', import.meta.url));
const DAYS = 150;
const TICKS_PER_DAY = 30;
const FINAL_TICK = DAYS * TICKS_PER_DAY;
const SEED = 11;

function assertPublishedV003Unchanged() {
  const status = execFileSync('git', [
    'status', '--porcelain=v1', '--',
    'GPT/game/shioji/v003',
  ], { cwd: REPOSITORY_ROOT, encoding: 'utf8' });
  assert.equal(status, '', '公開版v003に差分がある');
}

function findBuildingPreview(model, job) {
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
      const preview = previewBuildingPlacement(model, job, { x, y });
      if (preview.ok) return preview;
    }
  }
  return null;
}

function findRoadPreview(model) {
  for (let y = 0; y < model.height; y += 1) {
    for (let x = 0; x < model.width; x += 1) {
      const preview = previewRoadPlacement(model, { x, y }, { x, y });
      if (preview.ok) return preview;
    }
  }
  return null;
}

assertPublishedV003Unchanged();

const liveApi = createEngineApi(buildBaseCity(SEED));
const controller = createViewController(liveApi);

const buildingPreview = findBuildingPreview(controller.readModel(), 'woodshop');
assert.ok(buildingPreview, 'UIプレビューで木工房の配置可能地が見つかる');
const placed = controller.operate({
  type: 'place_building',
  job: 'woodshop',
  x: buildingPreview.entrance.x,
  y: buildingPreview.entrance.y,
  buildingX: buildingPreview.x,
  buildingY: buildingPreview.y,
});
assert.equal(placed.ok, true);
assert.equal(controller.operate({
  type: 'remove_building', buildingId: placed.buildingId,
}).ok, true);

const roadPreview = findRoadPreview(controller.readModel());
assert.ok(roadPreview, 'UIプレビューで道路の敷設可能地が見つかる');
assert.equal(controller.operate({
  type: 'add_road', start: roadPreview.start, end: roadPreview.end,
}).ok, true);
assert.equal(controller.operate({
  type: 'remove_road', x: roadPreview.start.x, y: roadPreview.start.y,
}).ok, true);

assert.equal(controller.operate({
  type: 'set_stock_target', goods: 'tools', qty: 12,
}).ok, true);
controller.operate({ type: 'release_stock', goods: 'tools', qty: 16 });
assert.equal(controller.operate({ type: 'request_aid' }).ok, true);

let acceptedOrder = false;
for (let day = 1; day <= DAYS; day += 1) {
  controller.advanceTicks(TICKS_PER_DAY);
  const model = controller.readModel();
  if (!acceptedOrder && model.orderOffer) {
    assert.equal(controller.operate({ type: 'accept_order' }).ok, true);
    acceptedOrder = true;
  }
  if (day === 120) {
    assert.equal(controller.operate({
      type: 'set_stock_target', goods: 'tools', qty: 0,
    }).ok, true);
  }
}
assert.equal(acceptedOrder, true, '150日以内に届いた本国注文をUIから受諾できる');

const journal = controller.inputJournal();
const operationTypes = new Set(journal.map(({ op }) => op.type));
for (const type of [
  'place_building', 'remove_building', 'add_road', 'remove_road',
  'set_stock_target', 'release_stock', 'request_aid', 'accept_order',
]) {
  assert.equal(operationTypes.has(type), true, `${type}が入力ジャーナルに記録される`);
}

const replay = replayInputJournal(
  () => buildBaseCity(SEED),
  journal,
  { untilTick: FINAL_TICK },
);
assert.equal(liveApi.snapshot().tick, FINAL_TICK);
assert.deepEqual(
  replay.api.snapshot(),
  liveApi.snapshot(),
  'UI操作150日後と入力ジャーナル再生後のエンジン状態が完全一致する',
);

console.log(`ok - 全章受け入れ: v003差分ゼロ、UI全8操作${DAYS}日後とjournal再生が完全一致`);
