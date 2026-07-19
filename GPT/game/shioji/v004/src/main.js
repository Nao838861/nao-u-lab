import { IsometricCamera } from './camera.js';
import { SimulationClock } from './clock.js';
import { SPEEDS, VERSION } from './config.js';
import { createEngineController } from './engine_bridge.js';
import { Renderer } from './renderer.js';

const $ = selector => document.querySelector(selector);
const canvas = $('#world');
const controller = createEngineController({ seed: 11 });
const camera = new IsometricCamera();
const renderer = new Renderer(canvas, camera);
const clock = new SimulationClock({ speedIndex: 1 });
let model = controller.readModel();
let lastEventSequence = 0;
let visibleEventCount = 0;
camera.setWorldSize(model.width, model.height);

function formatNumber(value) {
  return Math.round(value).toLocaleString('ja-JP');
}

function refreshModel() {
  model = controller.readModel();
  const events = controller.events(lastEventSequence);
  if (events.length) {
    lastEventSequence = events.at(-1).sequence;
    visibleEventCount += events.length;
  }
}

function renderHud() {
  $('#funds-value').textContent = formatNumber(model.companyMoney);
  $('#day-value').textContent = `${model.day}日目`;
  $('#tick-value').textContent = `tick ${model.tick}`;
  $('#population-value').textContent = `${formatNumber(model.population)}人`;
  $('#world-size').textContent = `${model.width}×${model.height}`;
  $('#building-count').textContent = `${model.buildings.length}棟`;
  $('#carrier-count').textContent = `${model.carriers.length}`;
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

function stepOneDay() {
  controller.advanceOneDay();
  refreshModel();
  renderHud();
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

function localPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function clearPointers() {
  pointers.clear();
  panLast = null;
  pinchDistance = null;
  canvas.classList.remove('map-dragging');
}

canvas.addEventListener('pointerdown', event => {
  const point = localPoint(event);
  pointers.set(event.pointerId, point);
  canvas.setPointerCapture(event.pointerId);
  if (pointers.size === 1) {
    panLast = point;
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
  pointers.delete(event.pointerId);
  if (pointers.size === 1) panLast = [...pointers.values()][0];
  else if (pointers.size === 0) clearPointers();
  pinchDistance = null;
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

let lastFrame = performance.now();
function frame(now) {
  const elapsedSeconds = Math.min(0.1, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  const ticks = clock.consume(elapsedSeconds);
  if (ticks > 0) {
    controller.advanceTicks(ticks);
    refreshModel();
    renderHud();
  }
  renderer.render(model, elapsedSeconds);
  requestAnimationFrame(frame);
}

window.__SHIOJI_V004__ = Object.freeze({
  version: VERSION,
  camera,
  clock,
  controller,
  renderer,
  get model() { return model; },
  setSpeed,
  stepOneDay,
});

renderHud();
renderer.render(model, 0);
requestAnimationFrame(frame);

if (SPEEDS.length !== 4) throw new Error('speed controls and speed definitions must stay aligned');
