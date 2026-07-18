import { MAP_H, MAP_W, isLand } from "./config.js";

export const keyOf = (x, y) => `${x},${y}`;
export const pointOf = (key) => {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
};

class MinQueue {
  constructor() {
    this.items = [];
  }

  push(node, priority) {
    this.items.push({ node, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  pop() {
    return this.items.shift()?.node;
  }

  get length() {
    return this.items.length;
  }
}
const neighbors = (x, y) => [
  { x: x + 1, y },
  { x: x - 1, y },
  { x, y: y + 1 },
  { x, y: y - 1 }
].filter((point) => point.x >= 0 && point.y >= 0 && point.x < MAP_W && point.y < MAP_H);

export function findPath(world, start, end, mode = "walker") {
  const startKey = keyOf(start.x, start.y);
  const endKey = keyOf(end.x, end.y);
  if (startKey === endKey) return [{ ...start }];

  const queue = new MinQueue();
  const cameFrom = new Map([[startKey, null]]);
  const cost = new Map([[startKey, 0]]);
  queue.push(startKey, 0);

  while (queue.length) {
    const currentKey = queue.pop();
    if (currentKey === endKey) break;
    const current = pointOf(currentKey);

    for (const next of neighbors(current.x, current.y)) {
      const nextKey = keyOf(next.x, next.y);
      if (!isLand(next.x, next.y)) continue;
      const endpoint = nextKey === startKey || nextKey === endKey;
      const road = world.roads.has(nextKey);
      if (mode === "cart" && !endpoint && !road) continue;
      const occupied = world.buildingAt(next.x, next.y);
      if (occupied && !endpoint) continue;
      const stepCost = road ? 0.42 : 1.35;
      const nextCost = cost.get(currentKey) + stepCost;
      if (!cost.has(nextKey) || nextCost < cost.get(nextKey)) {
        cost.set(nextKey, nextCost);
        cameFrom.set(nextKey, currentKey);
        const heuristic = Math.abs(end.x - next.x) + Math.abs(end.y - next.y);
        queue.push(nextKey, nextCost + heuristic * 0.35);
      }
    }
  }

  if (!cameFrom.has(endKey)) return null;
  const path = [];
  let cursor = endKey;
  while (cursor) {
    path.push(pointOf(cursor));
    cursor = cameFrom.get(cursor);
  }
  return path.reverse();
}

export function pathCost(world, path) {
  if (!path) return Infinity;
  return path.slice(1).reduce((sum, point) => sum + (world.roads.has(keyOf(point.x, point.y)) ? 0.42 : 1.35), 0);
}

export function orthogonalLine(start, end) {
  const points = [];
  let x = start.x;
  let y = start.y;
  const horizontalFirst = Math.abs(end.x - x) >= Math.abs(end.y - y);
  const walkX = () => {
    while (x !== end.x) {
      x += Math.sign(end.x - x);
      points.push({ x, y });
    }
  };
  const walkY = () => {
    while (y !== end.y) {
      y += Math.sign(end.y - y);
      points.push({ x, y });
    }
  };
  points.push({ ...start });
  if (horizontalFirst) {
    walkX();
    walkY();
  } else {
    walkY();
    walkX();
  }
  return points;
}
