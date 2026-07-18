const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

export const keyOf = (x, y) => `${x},${y}`;

export function parseKey(key) {
  return key.split(',').map(Number);
}

export function line8(a, b) {
  let [x0, y0] = a;
  const [x1, y1] = b;
  const points = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    points.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = err * 2;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return points;
}

export function roadPath(roads, start, goal) {
  const startKey = keyOf(start.x, start.y);
  const goalKey = keyOf(goal.x, goal.y);
  if (!roads.has(startKey) || !roads.has(goalKey)) return null;
  if (startKey === goalKey) return [{ x: start.x, y: start.y }];

  const open = [{ key: startKey, x: start.x, y: start.y, score: 0 }];
  const came = new Map();
  const g = new Map([[startKey, 0]]);
  const seen = new Set();

  while (open.length) {
    open.sort((a, b) => a.score - b.score);
    const current = open.shift();
    if (seen.has(current.key)) continue;
    seen.add(current.key);
    if (current.key === goalKey) {
      const out = [];
      let cursor = goalKey;
      while (cursor) {
        const [x, y] = parseKey(cursor);
        out.push({ x, y });
        cursor = came.get(cursor);
      }
      return out.reverse();
    }
    for (const [dx, dy] of DIRS) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const nextKey = keyOf(nx, ny);
      if (!roads.has(nextKey) || seen.has(nextKey)) continue;
      const diagonal = dx !== 0 && dy !== 0;
      const tentative = (g.get(current.key) ?? Infinity) + (diagonal ? 1.414 : 1);
      if (tentative >= (g.get(nextKey) ?? Infinity)) continue;
      came.set(nextKey, current.key);
      g.set(nextKey, tentative);
      const h = Math.hypot(goal.x - nx, goal.y - ny);
      open.push({ key: nextKey, x: nx, y: ny, score: tentative + h });
    }
  }
  return null;
}

export function connectedRoads(roads, origin) {
  const originKey = keyOf(origin.x, origin.y);
  const connected = new Set();
  if (!roads.has(originKey)) return connected;
  const queue = [[origin.x, origin.y]];
  connected.add(originKey);
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of DIRS) {
      const next = keyOf(x + dx, y + dy);
      if (!roads.has(next) || connected.has(next)) continue;
      connected.add(next);
      queue.push([x + dx, y + dy]);
    }
  }
  return connected;
}

export function perimeterTiles(x, y, w, h) {
  const out = [];
  for (let px = x; px < x + w; px++) {
    out.push({ x: px, y: y - 1, side: 'north' });
    out.push({ x: px, y: y + h, side: 'south' });
  }
  for (let py = y; py < y + h; py++) {
    out.push({ x: x - 1, y: py, side: 'west' });
    out.push({ x: x + w, y: py, side: 'east' });
  }
  return out;
}
