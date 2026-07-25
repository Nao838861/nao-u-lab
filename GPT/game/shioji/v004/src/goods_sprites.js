const shape = (type, values) => Object.freeze({ type, ...values });
const polygon = (points, fill, stroke = 'dark', lineWidth = 1) => (
  shape('polygon', { points: Object.freeze(points), fill, stroke, lineWidth })
);
const polyline = (points, stroke, lineWidth = 1) => (
  shape('polyline', { points: Object.freeze(points), stroke, lineWidth })
);
const ellipse = (cx, cy, rx, ry, fill, stroke = 'dark', lineWidth = 1) => (
  shape('ellipse', { cx, cy, rx, ry, fill, stroke, lineWidth })
);
const circle = (cx, cy, r, fill, stroke = null, lineWidth = 1) => (
  shape('circle', { cx, cy, r, fill, stroke, lineWidth })
);
const rect = (x, y, width, height, fill, stroke = 'dark', lineWidth = 1) => (
  shape('rect', { x, y, width, height, fill, stroke, lineWidth })
);

const SPRITES = Object.freeze({
  fish: Object.freeze([
    polygon([[2.8, 8], [0.5, 4.6], [0.5, 11.4]], 'accent'),
    ellipse(8.2, 8, 5.8, 3.1, 'color'),
    polygon([[6.4, 9.2], [4.8, 12.4], [9.2, 10.1]], 'light'),
    circle(11.6, 7.1, 1.05, 'light', 'dark', 0.7),
    circle(11.8, 7.05, 0.38, 'dark'),
  ]),
  veg: Object.freeze([
    circle(5.2, 9.6, 3.45, 'color', 'dark'),
    circle(10.5, 9.7, 3.65, 'light', 'dark'),
    circle(8.1, 11.4, 3.45, 'accent', 'dark'),
    polygon([[5.4, 6.2], [3.5, 2.1], [7.1, 4.9]], 'accent'),
    polygon([[8.1, 7.7], [8.2, 2.2], [10.2, 6.3]], 'color'),
    polygon([[10.4, 6.2], [13.3, 3.1], [12, 7]], 'accent'),
  ]),
  wheat: Object.freeze([
    polyline([[5, 15], [6.2, 3.2]], 'dark', 1.35),
    polyline([[8, 15], [8.2, 2]], 'dark', 1.35),
    polyline([[11, 15], [9.9, 3.1]], 'dark', 1.35),
    ellipse(5.1, 5.2, 1.7, 1, 'light', 'dark', 0.65),
    ellipse(7.1, 7.2, 1.7, 1, 'color', 'dark', 0.65),
    ellipse(9.8, 5, 1.7, 1, 'light', 'dark', 0.65),
    ellipse(10.7, 8.2, 1.7, 1, 'color', 'dark', 0.65),
    ellipse(7.1, 3.7, 1.5, 0.9, 'accent', 'dark', 0.65),
    polyline([[4.5, 11.1], [11.5, 10.8]], 'accent', 1.2),
  ]),
  pres: Object.freeze([
    polygon([[5, 4.8], [11, 4.8], [12.7, 7], [12.1, 13.8], [10.6, 15], [5.4, 15], [3.9, 13.8], [3.3, 7]], 'color'),
    rect(5.2, 2.1, 5.6, 3.4, 'light'),
    polyline([[4.3, 6.1], [11.7, 6.1]], 'accent', 1.05),
    ellipse(8, 10.1, 2.7, 1.35, 'accent', 'dark', 0.7),
    polygon([[5.5, 10.1], [4.2, 8.9], [4.2, 11.3]], 'accent', 'dark', 0.7),
    circle(9.5, 9.8, 0.3, 'dark'),
  ]),
  pick: Object.freeze([
    polygon([[3.3, 5.5], [12.7, 5.5], [12, 14.7], [4, 14.7]], 'color'),
    polyline([[3.4, 8], [12.5, 8]], 'light', 1.25),
    polyline([[3.6, 12.2], [12.2, 12.2]], 'light', 1.25),
    polygon([[6.1, 5.4], [4.1, 1.3], [7.7, 4.1]], 'accent'),
    polygon([[8, 5.3], [9.2, 0.9], [10.5, 4.8]], 'light'),
    polygon([[9.7, 5.5], [13.1, 2.2], [11.9, 6.1]], 'accent'),
  ]),
  tools: Object.freeze([
    polygon([[2, 11], [11.7, 7.9], [12.8, 10.1], [3.1, 13.3]], 'color'),
    polygon([[3, 6.8], [12.1, 4.1], [13, 6.2], [3.8, 9]], 'light'),
    polygon([[7.4, 3.8], [9.5, 3.2], [12.9, 13.7], [10.8, 14.4]], 'accent'),
    rect(4.1, 1.5, 8.3, 3.2, 'color'),
  ]),
  salt: Object.freeze([
    polygon([[5.2, 4], [10.8, 4], [12.8, 7.1], [13.3, 14.7], [2.7, 14.7], [3.2, 7.1]], 'light'),
    polyline([[5, 4.2], [7.1, 2.2], [8.9, 2.2], [11, 4.2]], 'dark', 1.1),
    polygon([[8, 7.2], [10.4, 12.1], [5.6, 12.1]], 'accent', 'dark', 0.8),
    polyline([[6.6, 10.3], [9.4, 10.3]], 'light', 0.8),
  ]),
  char: Object.freeze([
    polygon([[2.1, 11.9], [5.4, 3.1], [8.2, 4.1], [4.8, 13.1]], 'color'),
    polygon([[6, 13.5], [7.8, 2.2], [10.7, 2.7], [8.8, 14]], 'dark', 'dark'),
    polygon([[10.3, 13.3], [10.9, 5], [14, 5.5], [13.4, 13.8]], 'color'),
    polyline([[4.4, 7.1], [6, 8.1], [4.9, 9.3]], 'accent', 0.9),
    polyline([[8.4, 6], [10, 7], [8.8, 8.2]], 'accent', 0.9),
  ]),
  meat: Object.freeze([
    polyline([[3.1, 12.9], [7.1, 9.7]], 'light', 2.4),
    circle(2.4, 13.5, 1.4, 'light', 'dark', 0.8),
    circle(4, 14.1, 1.25, 'light', 'dark', 0.8),
    ellipse(9.7, 7.7, 5, 4.4, 'color'),
    ellipse(10.2, 7.4, 2.4, 2, 'accent', 'dark', 0.7),
  ]),
  meal: Object.freeze([
    polygon([[4, 3.1], [11.2, 3.1], [12.6, 12.2], [3, 12.2]], 'color'),
    polyline([[4.2, 5], [11.3, 5]], 'dark', 1),
    ellipse(9.6, 13.2, 5.2, 1.9, 'light', 'dark', 0.8),
    polyline([[5.2, 3.2], [6.5, 1.7], [10.2, 2.2], [11.2, 3.2]], 'accent', 1.1),
  ]),
  stone: Object.freeze([
    polygon([[1.3, 13.8], [2.1, 8.5], [6.6, 7.8], [8.1, 13.9]], 'color'),
    polygon([[6.2, 13.9], [7, 6.5], [11.7, 5.9], [14, 13.8]], 'light'),
    polygon([[3.7, 7.9], [4.7, 3.2], [9.4, 2.2], [11.2, 6.7]], 'accent'),
    polyline([[5.2, 4.2], [8.7, 3.5]], 'light', 0.8),
  ]),
  oil: Object.freeze([
    ellipse(8, 10.7, 4.4, 4.4, 'color'),
    rect(6.5, 3.2, 3, 4.6, 'light'),
    rect(5.8, 2, 4.4, 2, 'accent'),
    ellipse(11.8, 8, 2.7, 3.5, null, 'dark', 1.25),
    polyline([[6.2, 10.1], [9.8, 10.1]], 'light', 1),
  ]),
  iron: Object.freeze([
    polygon([[1.2, 5.2], [11.7, 2.3], [13.3, 4.4], [2.7, 7.3]], 'light'),
    polygon([[2.5, 9], [12.9, 6.2], [14.3, 8.5], [4, 11.2]], 'color'),
    polygon([[3.5, 12.5], [11.8, 10.3], [13, 12.7], [5, 14.8]], 'accent'),
    polygon([[7, 3.6], [9.1, 3], [10.4, 12.7], [8.2, 13.3]], 'dark', null),
  ]),
  cloth: Object.freeze([
    polygon([[6, 4], [13.4, 5], [12.3, 14.7], [6.1, 13.3]], 'color'),
    ellipse(5.2, 5.2, 3.7, 3.7, 'light'),
    circle(5.2, 5.2, 1.7, 'accent', 'dark', 0.8),
    polyline([[7.1, 8.2], [11.5, 9.1], [10.8, 13.1]], 'light', 1),
  ]),
  log: Object.freeze([
    rect(3, 2.2, 10.8, 3.2, 'color'),
    circle(3, 3.8, 1.65, 'light', 'dark', 0.85),
    circle(3, 3.8, 0.65, null, 'accent', 0.65),
    rect(2, 6.5, 11.2, 3.2, 'accent'),
    circle(2, 8.1, 1.65, 'light', 'dark', 0.85),
    circle(2, 8.1, 0.65, null, 'accent', 0.65),
    rect(3.6, 10.8, 10, 3.2, 'color'),
    circle(3.6, 12.4, 1.65, 'light', 'dark', 0.85),
    circle(3.6, 12.4, 0.65, null, 'accent', 0.65),
  ]),
  ore: Object.freeze([
    polygon([[1.3, 13.8], [2.5, 7], [6.1, 2.2], [12.1, 3.7], [14.5, 10.1], [11.8, 14.6]], 'color'),
    polyline([[3.1, 11.9], [6.2, 9.2], [7.3, 5.4], [11.8, 4.2]], 'accent', 2),
    polygon([[8.7, 10.5], [11.4, 8.2], [13, 11.1], [10.9, 13]], 'light', 'dark', 0.7),
  ]),
  coal: Object.freeze([
    polygon([[1, 13.9], [3, 7], [6.6, 12.3]], 'color'),
    polygon([[4.3, 13.9], [7.3, 3], [10.5, 13.6]], 'dark', 'dark'),
    polygon([[8.2, 13.8], [11.5, 6], [15, 13.9]], 'color'),
    polygon([[3.2, 7.2], [6.2, 3.7], [7.3, 8.5]], 'light'),
    polyline([[8.1, 5.9], [9.5, 8.1], [8.7, 10]], 'accent', 0.8),
  ]),
  bar: Object.freeze([
    polygon([[1.3, 8.2], [4.1, 3.5], [12.2, 3.5], [14.7, 8.2]], 'light'),
    polygon([[1.3, 8.2], [14.7, 8.2], [12.7, 10.8], [3.2, 10.8]], 'color'),
    polygon([[2.4, 13], [4.6, 9.7], [11.7, 9.7], [13.7, 13]], 'accent'),
    polyline([[4.5, 5.7], [11.9, 5.7]], 'color', 0.9),
  ]),
});

const FALLBACK_SPRITE = Object.freeze([
  rect(2.2, 3.2, 11.6, 10.8, 'color'),
  polyline([[2.5, 7], [13.5, 7]], 'light', 1),
  polyline([[8, 3.4], [8, 13.8]], 'accent', 1),
]);

function paletteColor(art, token) {
  if (!token) return null;
  return art?.[token] ?? ({
    color: '#bd9a63',
    dark: '#5b4230',
    light: '#ead19d',
    accent: '#8c6b3e',
  })[token];
}

function canvasPath(ctx, item) {
  ctx.beginPath();
  if (item.type === 'polygon' || item.type === 'polyline') {
    const [first, ...rest] = item.points;
    ctx.moveTo(first[0], first[1]);
    for (const point of rest) ctx.lineTo(point[0], point[1]);
    if (item.type === 'polygon') ctx.closePath();
  } else if (item.type === 'ellipse') {
    ctx.ellipse(item.cx, item.cy, item.rx, item.ry, 0, 0, Math.PI * 2);
  } else if (item.type === 'circle') {
    ctx.arc(item.cx, item.cy, item.r, 0, Math.PI * 2);
  } else if (item.type === 'rect') {
    ctx.rect(item.x, item.y, item.width, item.height);
  }
}

export function goodsSpriteDefinition(goods) {
  return SPRITES[goods] ?? FALLBACK_SPRITE;
}

export function goodsSpriteGeometrySignature(goods) {
  return JSON.stringify(goodsSpriteDefinition(goods).map(item => {
    const { fill, stroke, ...geometry } = item;
    return geometry;
  }));
}

function drawGoodsSpriteVector(
  ctx,
  art,
  x,
  y,
  size,
  { outlined = true } = {},
) {
  const definition = goodsSpriteDefinition(art?.sprite);
  const scale = Math.max(0.01, size / 16);
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const item of definition) {
    canvasPath(ctx, item);
    const fill = paletteColor(art, item.fill);
    const stroke = paletteColor(art, item.stroke);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke && (outlined || item.type === 'polyline' || !fill)) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = item.lineWidth ?? 1;
      ctx.stroke();
    }
  }
  ctx.restore();
}

const SPRITE_SURFACE_SIZE = 48;
const MAX_SPRITE_SURFACES = 96;
const SPRITE_SURFACES = new Map();

function spriteSurface(art, outlined) {
  const key = [
    art?.sprite, art?.color, art?.dark, art?.light, art?.accent, outlined ? 1 : 0,
  ].join(':');
  const cached = SPRITE_SURFACES.get(key);
  if (cached) return cached;
  if (SPRITE_SURFACES.size >= MAX_SPRITE_SURFACES) SPRITE_SURFACES.clear();
  const surface = typeof OffscreenCanvas === 'function'
    ? new OffscreenCanvas(SPRITE_SURFACE_SIZE, SPRITE_SURFACE_SIZE)
    : document.createElement('canvas');
  surface.width = SPRITE_SURFACE_SIZE;
  surface.height = SPRITE_SURFACE_SIZE;
  const surfaceContext = surface.getContext('2d');
  drawGoodsSpriteVector(
    surfaceContext,
    art,
    SPRITE_SURFACE_SIZE / 2,
    SPRITE_SURFACE_SIZE / 2,
    SPRITE_SURFACE_SIZE - 4,
    { outlined },
  );
  SPRITE_SURFACES.set(key, surface);
  return surface;
}

export function drawGoodsSpriteCanvas(
  ctx,
  art,
  x,
  y,
  size,
  { outlined = true } = {},
) {
  const safeSize = Math.max(1, size);
  const previousSmoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    spriteSurface(art, outlined),
    x - safeSize / 2,
    y - safeSize / 2,
    safeSize,
    safeSize,
  );
  ctx.imageSmoothingEnabled = previousSmoothing;
}

function svgShape(item, art) {
  const fill = paletteColor(art, item.fill) ?? 'none';
  const stroke = paletteColor(art, item.stroke) ?? 'none';
  const common = `fill="${fill}" stroke="${stroke}" stroke-width="${item.lineWidth ?? 1}"`;
  if (item.type === 'polygon' || item.type === 'polyline') {
    const points = item.points.map(point => point.join(',')).join(' ');
    return `<${item.type} points="${points}" ${common}/>`;
  }
  if (item.type === 'ellipse') {
    return `<ellipse cx="${item.cx}" cy="${item.cy}" rx="${item.rx}" ry="${item.ry}" ${common}/>`;
  }
  if (item.type === 'circle') {
    return `<circle cx="${item.cx}" cy="${item.cy}" r="${item.r}" ${common}/>`;
  }
  return `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" ${common}/>`;
}

export function goodsSpriteSvgMarkup(goods, art) {
  const sprite = art?.sprite ?? goods;
  const rows = goodsSpriteDefinition(sprite).map(item => svgShape(item, art)).join('');
  return `<svg class="goods-sprite" data-goods-sprite="${sprite}" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${rows}</svg>`;
}

export const GOODS_SPRITE_IDS = Object.freeze(Object.keys(SPRITES));
