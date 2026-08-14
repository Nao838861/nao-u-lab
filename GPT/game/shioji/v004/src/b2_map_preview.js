import { IsometricCamera } from './camera.js?v=v004.60.0-b2-p2';

const PREVIEW_VERSION = 'b2-map-preview-s0-v1';
const SOURCE_URL = new URL('../../design/map_b2/b2_map_data.json', import.meta.url);
const TILE_WIDTH = 68;
const TILE_HEIGHT = 34;
const CACHE_ZOOM = 0.25;

const TERRAIN = Object.freeze({
  '~': { label: '海', color: '#123f55', stroke: '#173548' },
  '-': { label: '浅瀬', color: '#74aebb', stroke: '#4b8997' },
  R: { label: '豊かな漁場', color: '#13bca4', stroke: '#0b8f80' },
  m: { label: '中漁場', color: '#367b8c', stroke: '#285f70' },
  '.': { label: '砂地', color: '#c4ae78', stroke: '#9b875c' },
  g: { label: '草地', color: '#688d52', stroke: '#4d703e' },
  f: { label: '肥沃地 f', color: '#9fab55', stroke: '#78833c' },
  F: { label: '肥沃コア F', color: '#d2b94f', stroke: '#a38b31' },
  t: { label: '森林', color: '#315f43', stroke: '#244a34' },
  M: { label: '山', color: '#606675', stroke: '#444a58' },
  r: { label: '岩', color: '#898574', stroke: '#666456' },
  o: { label: '鉄鉱', color: '#a66f55', stroke: '#774d3d' },
  c: { label: '石炭', color: '#34383c', stroke: '#24272b' },
});

function assertMap(data) {
  if (!data?.version?.includes('v1.3')) throw new Error(`B2 map v1.3 is required: ${data?.version ?? 'unknown'}`);
  if (data.size?.[0] !== 256 || data.size?.[1] !== 256) throw new Error('B2 map must be 256×256');
  if (!Array.isArray(data.terrain) || data.terrain.length !== 256) throw new Error('B2 map must have 256 terrain rows');
  for (const [y, row] of data.terrain.entries()) {
    if (typeof row !== 'string' || row.length !== 256) throw new Error(`B2 map row ${y} must have 256 tiles`);
    for (const symbol of row) {
      if (!TERRAIN[symbol]) throw new Error(`unknown B2 terrain symbol: ${symbol}`);
    }
  }
}

function createPreviewHud() {
  const hud = document.createElement('aside');
  hud.id = 'b2-map-preview-hud';
  hud.innerHTML = `
    <div class="b2-preview-title">
      <b>B2 MAP <span>v1.3</span></b>
      <span>256×256 見た目プレビュー</span>
      <strong id="b2-preview-fps">— fps</strong>
    </div>
    <div class="b2-preview-legend">
      ${Object.entries(TERRAIN).map(([symbol, item]) => `
        <span><i style="--terrain-color:${item.color}"></i>${item.label}<small>${symbol}</small></span>
      `).join('')}
    </div>
    <p>WASD / 矢印 / ドラッグ: 移動　ホイール: 拡大縮小　Home: 全域表示</p>
  `;
  document.body.append(hud);
  return hud;
}

function drawDiamond(ctx, x, y, tileWidth, tileHeight, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + tileWidth / 2, y + tileHeight / 2);
  ctx.lineTo(x, y + tileHeight);
  ctx.lineTo(x - tileWidth / 2, y + tileHeight / 2);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function buildTerrainCache(data) {
  const tileWidth = TILE_WIDTH * CACHE_ZOOM;
  const tileHeight = TILE_HEIGHT * CACHE_ZOOM;
  const originX = data.size[1] * tileWidth / 2 + 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil((data.size[0] + data.size[1]) * tileWidth / 2) + 2;
  canvas.height = Math.ceil((data.size[0] + data.size[1]) * tileHeight / 2) + 2;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = '#0d2930';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 0.35;
  ctx.lineJoin = 'round';
  for (let sum = 0; sum <= data.size[0] + data.size[1] - 2; sum += 1) {
    const minY = Math.max(0, sum - data.size[0] + 1);
    const maxY = Math.min(data.size[1] - 1, sum);
    for (let y = minY; y <= maxY; y += 1) {
      const x = sum - y;
      const style = TERRAIN[data.terrain[y][x]];
      drawDiamond(
        ctx,
        originX + (x - y) * tileWidth / 2,
        (x + y) * tileHeight / 2,
        tileWidth,
        tileHeight,
        style.color,
        style.stroke,
      );
    }
  }
  return Object.freeze({ canvas, originX });
}

document.body.classList.add('b2-map-preview');
document.documentElement.classList.add('b2-map-preview');
const hud = createPreviewHud();
const canvas = document.querySelector('#world');
const response = await fetch(SOURCE_URL, { cache: 'no-store' });
if (!response.ok) throw new Error(`B2 map load failed: HTTP ${response.status}`);
const map = await response.json();
assertMap(map);
const terrainCache = buildTerrainCache(map);

const ctx = canvas.getContext('2d');
const camera = new IsometricCamera({ minZoom: 0.02, maxZoom: 1.2 });
camera.setWorldSize(map.size[0], map.size[1]);
let viewportWidth = 1;
let viewportHeight = 1;
let fitZoom = 0.08;
let lastFrame = performance.now();
let fpsSampleStart = lastFrame;
let fpsFrames = 0;
let measuredFps = 0;
const pressedKeys = new Set();
const pointers = new Map();
let panLast = null;

function fitWholeMap() {
  const horizontal = Math.max(0.02, (viewportWidth - 32) / ((map.size[0] + map.size[1]) * TILE_WIDTH / 2));
  const vertical = Math.max(0.02, (viewportHeight - 112) / ((map.size[0] + map.size[1]) * TILE_HEIGHT / 2));
  fitZoom = Math.min(0.24, horizontal, vertical);
  camera.zoom = fitZoom;
  camera.focus(map.size[0] / 2, map.size[1] / 2);
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  viewportWidth = Math.max(1, rect.width);
  viewportHeight = Math.max(1, rect.height);
  canvas.width = Math.round(viewportWidth * ratio);
  canvas.height = Math.round(viewportHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.imageSmoothingEnabled = false;
  camera.resize(viewportWidth, viewportHeight);
  fitWholeMap();
}

function localPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

canvas.addEventListener('pointerdown', event => {
  const point = localPoint(event);
  pointers.set(event.pointerId, point);
  panLast = point;
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add('map-dragging');
});
canvas.addEventListener('pointermove', event => {
  if (!pointers.has(event.pointerId)) return;
  const point = localPoint(event);
  if (pointers.size === 1 && panLast) camera.pan(point.x - panLast.x, point.y - panLast.y);
  pointers.set(event.pointerId, point);
  panLast = point;
});
function endPointer(event) {
  pointers.delete(event.pointerId);
  panLast = pointers.size ? [...pointers.values()][0] : null;
  if (!pointers.size) canvas.classList.remove('map-dragging');
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('wheel', event => {
  event.preventDefault();
  const point = localPoint(event);
  camera.zoomAt(event.deltaY < 0 ? 1.14 : 0.88, point.x, point.y);
}, { passive: false });

window.addEventListener('keydown', event => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
  const key = event.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
    event.preventDefault();
    pressedKeys.add(key);
  } else if (key === 'home') {
    event.preventDefault();
    fitWholeMap();
  }
});
window.addEventListener('keyup', event => pressedKeys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => pressedKeys.clear());
window.addEventListener('resize', resize);

function panFromKeys(seconds) {
  const distance = 760 * seconds;
  if (pressedKeys.has('w') || pressedKeys.has('arrowup')) camera.pan(0, distance);
  if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) camera.pan(0, -distance);
  if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) camera.pan(distance, 0);
  if (pressedKeys.has('d') || pressedKeys.has('arrowright')) camera.pan(-distance, 0);
}

function render(now) {
  const elapsed = Math.min(0.1, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  panFromKeys(elapsed);
  ctx.fillStyle = '#0d2930';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);
  const scale = camera.zoom / CACHE_ZOOM;
  ctx.drawImage(
    terrainCache.canvas,
    camera.panX - terrainCache.originX * scale,
    camera.panY,
    terrainCache.canvas.width * scale,
    terrainCache.canvas.height * scale,
  );

  fpsFrames += 1;
  if (now - fpsSampleStart >= 500) {
    measuredFps = fpsFrames * 1000 / (now - fpsSampleStart);
    hud.querySelector('#b2-preview-fps').textContent = `${Math.round(measuredFps)} fps`;
    fpsFrames = 0;
    fpsSampleStart = now;
  }
  requestAnimationFrame(render);
}

resize();
window.__SHIOJI_V004__ = Object.freeze({
  version: PREVIEW_VERSION,
  preview: 'b2-map-v1.3',
  map,
  camera,
  metrics: () => Object.freeze({ fps: measuredFps, cachePixels: terrainCache.canvas.width * terrainCache.canvas.height }),
});
window.__SHIOJI_BOOT__?.ready();
requestAnimationFrame(render);
