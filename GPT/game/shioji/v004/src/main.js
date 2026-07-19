import { IsometricCamera } from './camera.js';
import { SimulationClock } from './clock.js';
import { GOODS_LABELS, SPEEDS, VERSION } from './config.js';
import { createEngineController } from './engine_bridge.js';
import { WorldPresentation } from './presentation.js';
import { Renderer } from './renderer.js';

const $ = selector => document.querySelector(selector);
const canvas = $('#world');
const controller = createEngineController({ seed: 11 });
const camera = new IsometricCamera();
const renderer = new Renderer(canvas, camera);
const clock = new SimulationClock({ speedIndex: 1 });
let model = controller.readModel();
const presentation = new WorldPresentation(model);
let displayModel = presentation.reset(model);
let lastEventSequence = 0;
let visibleEventCount = 0;
let selectedCarrierId = null;
camera.setWorldSize(model.width, model.height);

function formatNumber(value) {
  return Math.round(value).toLocaleString('ja-JP');
}

function formatQuantity(value) {
  return (Math.round(value * 10) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 });
}

function refreshModel({ animate = false, baseSeconds = 0.12 } = {}) {
  const nextModel = controller.readModel();
  const events = controller.events(lastEventSequence);
  if (events.length) {
    lastEventSequence = events.at(-1).sequence;
    visibleEventCount += events.length;
  }
  if (animate) presentation.enqueue(nextModel, events, baseSeconds);
  else displayModel = presentation.reset(nextModel);
  model = nextModel;
  return events;
}

function renderHud() {
  $('#funds-value').textContent = formatNumber(model.companyMoney);
  $('#day-value').textContent = `${model.day}日目`;
  $('#tick-value').textContent = `tick ${model.tick}`;
  $('#population-value').textContent = `${formatNumber(model.population)}人`;
  $('#world-size').textContent = `${model.width}×${model.height}`;
  $('#building-count').textContent = `${model.buildings.length}棟`;
  $('#carrier-count').textContent = `${model.carriers.length}`;
  $('#trail-count').textContent = `${model.trailRows.length}区画`;
  $('#stock-count').textContent = formatNumber(model.totalVisibleStock);
  $('#event-count').textContent = formatNumber(visibleEventCount);
  document.querySelectorAll('[data-speed]').forEach(button => {
    button.classList.toggle('on', Number(button.dataset.speed) === clock.speedIndex);
  });
}

function setSpeed(index) {
  const speed = clock.setSpeed(index);
  $('#status span').textContent = speed.ticksPerSecond === 0
    ? '時間を停止しました'
    : `${speed.label}で観測中`;
  renderHud();
}

function tickPresentationSeconds() {
  const ticksPerSecond = SPEEDS[clock.speedIndex].ticksPerSecond;
  if (ticksPerSecond <= 0) return 0.028;
  return Math.max(0.025, Math.min(0.42, 0.84 / ticksPerSecond));
}

function advanceTicks(count, { animate = true, baseSeconds = tickPresentationSeconds() } = {}) {
  if (!Number.isSafeInteger(count) || count < 0) throw new TypeError('tick count must be non-negative');
  if (!animate) {
    controller.advanceTicks(count);
    refreshModel({ animate: false });
    renderHud();
    return model;
  }
  for (let index = 0; index < count; index += 1) {
    controller.advanceTicks(1);
    refreshModel({ animate: true, baseSeconds });
  }
  renderHud();
  return model;
}

function stepOneDay() {
  advanceTicks(30, { animate: true, baseSeconds: 0.028 });
  $('#status span').textContent = '1日進めました';
}

$('#speed-controls').addEventListener('click', event => {
  const button = event.target.closest('[data-speed]');
  if (button) setSpeed(Number(button.dataset.speed));
});

$('#step-day').addEventListener('click', stepOneDay);

const pointers = new Map();
let panLast = null;
let pinchDistance = null;
let tapStart = null;
let tapDistance = 0;

function localPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function clearPointers() {
  pointers.clear();
  panLast = null;
  pinchDistance = null;
  tapStart = null;
  tapDistance = 0;
  canvas.classList.remove('map-dragging');
}

canvas.addEventListener('pointerdown', event => {
  const point = localPoint(event);
  pointers.set(event.pointerId, point);
  canvas.setPointerCapture(event.pointerId);
  if (pointers.size === 1) {
    panLast = point;
    tapStart = point;
    tapDistance = 0;
    canvas.classList.add('map-dragging');
  } else if (pointers.size === 2) {
    const [first, second] = [...pointers.values()];
    pinchDistance = Math.hypot(second.x - first.x, second.y - first.y);
  }
});

canvas.addEventListener('pointermove', event => {
  if (!pointers.has(event.pointerId)) return;
  const point = localPoint(event);
  pointers.set(event.pointerId, point);
  if (tapStart) tapDistance = Math.max(tapDistance, Math.hypot(point.x - tapStart.x, point.y - tapStart.y));
  if (pointers.size === 2) {
    const [first, second] = [...pointers.values()];
    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
    if (pinchDistance) camera.zoomAt(distance / Math.max(1, pinchDistance), midpoint.x, midpoint.y);
    pinchDistance = distance;
    return;
  }
  if (panLast) camera.pan(point.x - panLast.x, point.y - panLast.y);
  panLast = point;
});

function endPointer(event) {
  const wasTap = pointers.size === 1 && tapDistance < 7;
  const point = localPoint(event);
  pointers.delete(event.pointerId);
  if (pointers.size === 1) panLast = [...pointers.values()][0];
  else if (pointers.size === 0) clearPointers();
  pinchDistance = null;
  if (wasTap) {
    const carrier = renderer.hitTestCarrier(displayModel, point.x, point.y);
    if (carrier) selectCarrier(carrier);
  }
}

canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
window.addEventListener('blur', clearPointers);

canvas.addEventListener('wheel', event => {
  event.preventDefault();
  const point = localPoint(event);
  camera.zoomAt(event.deltaY < 0 ? 1.1 : 0.9, point.x, point.y);
}, { passive: false });

window.addEventListener('keydown', event => {
  if (event.key === ' ') {
    event.preventDefault();
    setSpeed(clock.speedIndex === 0 ? 1 : 0);
  } else if (['1', '2', '3', '4'].includes(event.key)) {
    setSpeed(Number(event.key) - 1);
  }
});

window.addEventListener('resize', () => renderer.resize());

function stopTracking(message = '追跡を終了しました') {
  selectedCarrierId = null;
  renderer.selectedCarrierId = null;
  $('#tracking').hidden = true;
  if (message) $('#status span').textContent = message;
}

function selectCarrier(carrier) {
  if (!carrier) return stopTracking();
  selectedCarrierId = carrier.id;
  renderer.selectedCarrierId = carrier.id;
  const goods = carrier.goods ? (GOODS_LABELS[carrier.goods] ?? carrier.goods) : '人の移動';
  const amount = carrier.goods ? ` ${formatQuantity(carrier.amount)}` : ` ${carrier.members ?? carrier.people ?? 1}人`;
  $('#tracking-label').textContent = `${goods}${amount}`;
  $('#tracking-route').textContent = `${carrier.from?.label ?? '出所不明'} → ${carrier.to?.label ?? '行き先不明'}`;
  $('#tracking-kind').textContent = carrier.kind === 'cart' ? '荷車を追跡中' : '徒歩便を追跡中';
  $('#tracking').hidden = false;
  $('#status span').textContent = `${goods}の行方を地図上で追跡します`;
}

$('#stop-tracking').addEventListener('click', () => stopTracking('追跡を終了しました'));

function updateTracking(currentModel) {
  if (!selectedCarrierId) return;
  const carrier = currentModel.carriers.find(row => row.id === selectedCarrierId);
  if (!carrier) {
    stopTracking('荷が目的地へ到着しました');
    return;
  }
  selectCarrier(carrier);
  camera.focus(carrier.x + 0.5, carrier.y + 0.5);
}

let lastFrame = performance.now();
function frame(now) {
  const elapsedSeconds = Math.min(0.1, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  const ticks = clock.consume(elapsedSeconds);
  if (ticks > 0) {
    advanceTicks(ticks);
  }
  displayModel = presentation.advance(elapsedSeconds);
  updateTracking(displayModel);
  renderer.render(displayModel, elapsedSeconds);
  requestAnimationFrame(frame);
}

window.__SHIOJI_V004__ = Object.freeze({
  version: VERSION,
  camera,
  clock,
  controller,
  renderer,
  get model() { return model; },
  get displayModel() { return displayModel; },
  get selectedCarrierId() { return selectedCarrierId; },
  presentation,
  setSpeed,
  stepOneDay,
  advanceTicks,
  selectCarrier,
  stopTracking,
});

renderHud();
renderer.render(displayModel, 0);
requestAnimationFrame(frame);

if (SPEEDS.length !== 4) throw new Error('speed controls and speed definitions must stay aligned');
