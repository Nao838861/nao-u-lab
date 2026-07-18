import { BUILDINGS, FIXED, GOODS, GRADE_NAMES, GRID } from './config.js';
import { keyOf } from './pathfinding.js';

const COLORS = {
  water: ['#164e57', '#195861', '#1b6068', '#15535d'],
  grass: ['#6e8b50', '#739254', '#698449', '#78975a'],
  forest: ['#557343', '#5c7b47', '#4f6d3d', '#62804b'],
  rock: ['#777b6c', '#737969', '#7e8071', '#6d7467'],
  road: '#b39a6b', roadEdge: '#69593f', roadDust: '#d0b982',
  ink: '#18282a', cream: '#f4e7c1', gold: '#e5b65b', red: '#c65f4b', cyan: '#75c7c1',
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function ease(value) {
  return value * value * (3 - 2 * value);
}

export class Renderer {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;
    this.zoom = 0.84;
    this.panX = 0;
    this.panY = 0;
    this.width = 0;
    this.height = 0;
    this.preview = null;
    this.roadPreview = null;
    this.selectedId = null;
    this.trackedShipmentId = null;
    this.followTracking = false;
    this.pulse = 0;
    this.didInitialFocus = false;
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    if (!this.didInitialFocus) {
      this.zoom = this.width < 600 ? 0.56 : 0.82;
      this.focus(10.5, 10.5, true);
      this.didInitialFocus = true;
    }
  }

  project(x, y, z = 0) {
    return {
      x: this.panX + (x - y) * GRID.tileW * 0.5 * this.zoom,
      y: this.panY + (x + y) * GRID.tileH * 0.5 * this.zoom - z * this.zoom,
    };
  }

  unproject(screenX, screenY) {
    const dx = (screenX - this.panX) / (GRID.tileW * 0.5 * this.zoom);
    const dy = (screenY - this.panY) / (GRID.tileH * 0.5 * this.zoom);
    return { x: (dx + dy) * 0.5, y: (dy - dx) * 0.5 };
  }

  tileAt(screenX, screenY) {
    const point = this.unproject(screenX, screenY);
    return { x: Math.floor(point.x), y: Math.floor(point.y) };
  }

  focus(x, y, immediate = false) {
    const targetX = this.width * 0.5 - (x - y) * GRID.tileW * 0.5 * this.zoom;
    const targetY = this.height * (this.width < 600 ? 0.44 : 0.5) - (x + y) * GRID.tileH * 0.5 * this.zoom;
    if (immediate) {
      this.panX = targetX;
      this.panY = targetY;
    } else {
      this.panX += (targetX - this.panX) * 0.22;
      this.panY += (targetY - this.panY) * 0.22;
    }
  }

  pan(dx, dy) {
    this.panX += dx;
    this.panY += dy;
  }

  zoomAt(delta, screenX, screenY) {
    const before = this.unproject(screenX, screenY);
    this.zoom = clamp(this.zoom * delta, 0.42, 1.45);
    const after = this.project(before.x, before.y);
    this.panX += screenX - after.x;
    this.panY += screenY - after.y;
  }

  diamond(x, y, fill, stroke = null, alpha = 1) {
    const ctx = this.ctx;
    const p0 = this.project(x, y);
    const p1 = this.project(x + 1, y);
    const p2 = this.project(x + 1, y + 1);
    const p3 = this.project(x, y + 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(0.7, this.zoom);
      ctx.stroke();
    }
    ctx.restore();
  }

  footprint(x, y, w, h, fill, stroke, alpha = 1, z = 0) {
    const ctx = this.ctx;
    const points = [
      this.project(x, y, z), this.project(x + w, y, z),
      this.project(x + w, y + h, z), this.project(x, y + h, z),
    ];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(1, 1.5 * this.zoom);
      ctx.stroke();
    }
    ctx.restore();
  }

  prism(x, y, w, h, height, palette) {
    const ctx = this.ctx;
    const base = [this.project(x, y), this.project(x + w, y), this.project(x + w, y + h), this.project(x, y + h)];
    const top = [this.project(x, y, height), this.project(x + w, y, height), this.project(x + w, y + h, height), this.project(x, y + h, height)];
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1, 1.5 * this.zoom);
    ctx.strokeStyle = palette.line || '#263536';
    ctx.beginPath();
    ctx.moveTo(top[1].x, top[1].y); ctx.lineTo(base[1].x, base[1].y); ctx.lineTo(base[2].x, base[2].y); ctx.lineTo(top[2].x, top[2].y); ctx.closePath();
    ctx.fillStyle = palette.right; ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(top[2].x, top[2].y); ctx.lineTo(base[2].x, base[2].y); ctx.lineTo(base[3].x, base[3].y); ctx.lineTo(top[3].x, top[3].y); ctx.closePath();
    ctx.fillStyle = palette.left; ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(top[0].x, top[0].y); ctx.lineTo(top[1].x, top[1].y); ctx.lineTo(top[2].x, top[2].y); ctx.lineTo(top[3].x, top[3].y); ctx.closePath();
    ctx.fillStyle = palette.top; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  render(dt = 0) {
    this.pulse += dt;
    const tracked = this.world.shipments.find(shipment => shipment.id === this.trackedShipmentId);
    if (tracked && this.followTracking) this.focus(tracked.x, tracked.y, false);
    if (!tracked && this.trackedShipmentId) {
      this.trackedShipmentId = null;
      this.followTracking = false;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#173f43');
    gradient.addColorStop(1, '#0d2930');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawTerrain();
    this.drawRoads();
    this.drawRouteHighlight();
    this.drawWorldObjects();
    this.drawPreviews();
    this.drawMoneyFloats();
  }

  drawTerrain() {
    for (let sum = 0; sum < this.world.width + this.world.height - 1; sum++) {
      for (let y = 0; y < this.world.height; y++) {
        const x = sum - y;
        if (x < 0 || x >= this.world.width) continue;
        const terrain = this.world.terrainAt(x, y);
        const fill = COLORS[terrain.kind]?.[terrain.variant] || COLORS.grass[0];
        this.diamond(x, y, fill, terrain.kind === 'water' ? '#1b626a' : '#4f6942');
        if (terrain.kind === 'water' && (x + y + terrain.variant) % 5 === 0) {
          const center = this.project(x + 0.5, y + 0.5);
          const ctx = this.ctx;
          ctx.save();
          ctx.strokeStyle = 'rgba(157,220,214,.25)';
          ctx.lineWidth = Math.max(1, this.zoom);
          ctx.beginPath();
          ctx.moveTo(center.x - 6 * this.zoom, center.y);
          ctx.lineTo(center.x + 5 * this.zoom, center.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  drawRoads() {
    const ctx = this.ctx;
    const roads = [...this.world.roads].map(key => key.split(',').map(Number));
    for (const [x, y] of roads) this.diamond(x, y, '#a78e61', '#69593f', 0.94);
    const roadSet = this.world.roads;
    ctx.save();
    ctx.lineCap = 'round';
    for (const [x, y] of roads) {
      const center = this.project(x + 0.5, y + 0.5);
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        if (!roadSet.has(keyOf(x + dx, y + dy))) continue;
        const other = this.project(x + dx + 0.5, y + dy + 0.5);
        ctx.strokeStyle = COLORS.roadEdge;
        ctx.lineWidth = Math.max(5, 13 * this.zoom);
        ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(other.x, other.y); ctx.stroke();
        ctx.strokeStyle = COLORS.road;
        ctx.lineWidth = Math.max(3, 9 * this.zoom);
        ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(other.x, other.y); ctx.stroke();
      }
      ctx.fillStyle = COLORS.roadDust;
      ctx.beginPath(); ctx.arc(center.x, center.y, Math.max(2, 3.5 * this.zoom), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  drawRouteHighlight() {
    const shipment = this.world.shipments.find(item => item.id === this.trackedShipmentId);
    if (!shipment) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,219,112,.88)';
    ctx.lineWidth = Math.max(2, 3 * this.zoom);
    ctx.setLineDash([7 * this.zoom, 6 * this.zoom]);
    ctx.beginPath();
    shipment.path.forEach((point, index) => {
      const p = this.project(point.x + 0.5, point.y + 0.5, 1);
      index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  drawWorldObjects() {
    const drawables = [];
    for (let y = 0; y < this.world.height; y++) {
      for (let x = 0; x < this.world.width; x++) {
        const terrain = this.world.terrainAt(x, y);
        if (this.world.occupied.has(keyOf(x, y))) continue;
        if (terrain.kind === 'forest') drawables.push({ depth: x + y + 0.2, x, kind: 'tree', data: { x, y, variant: terrain.variant } });
        if (terrain.kind === 'rock' && terrain.variant % 2 === 0) drawables.push({ depth: x + y + 0.15, x, kind: 'rock', data: { x, y, variant: terrain.variant } });
      }
    }
    for (const building of this.world.buildings) drawables.push({ depth: building.x + building.y + building.w + building.h - 0.6, x: building.x, kind: 'building', data: building });
    for (const shipment of this.world.shipments) drawables.push({ depth: shipment.x + shipment.y + 0.9, x: shipment.x, kind: 'cart', data: shipment });
    if (this.world.ship.state !== 'away') drawables.push({ depth: 20.4, x: 0, kind: 'ship', data: this.world.ship });
    drawables.sort((a, b) => a.depth - b.depth || a.x - b.x);
    for (const item of drawables) {
      if (item.kind === 'tree') this.drawTree(item.data);
      if (item.kind === 'rock') this.drawRock(item.data);
      if (item.kind === 'building') this.drawBuilding(item.data);
      if (item.kind === 'cart') this.drawCart(item.data);
      if (item.kind === 'ship') this.drawShip(item.data);
    }
  }

  drawTree({ x, y, variant }) {
    const ctx = this.ctx;
    const base = this.project(x + 0.5 + (variant - 1.5) * 0.04, y + 0.5);
    const scale = this.zoom * (0.9 + variant * 0.06);
    ctx.save();
    ctx.fillStyle = '#4b3022';
    ctx.fillRect(Math.round(base.x - 2 * scale), Math.round(base.y - 21 * scale), Math.ceil(4 * scale), Math.ceil(22 * scale));
    const layers = [
      { y: -37, w: 18, color: '#254f3c' },
      { y: -29, w: 23, color: '#2f6144' },
      { y: -20, w: 26, color: '#3d714b' },
    ];
    for (const layer of layers) {
      ctx.beginPath();
      ctx.moveTo(base.x, base.y + layer.y * scale - 16 * scale);
      ctx.lineTo(base.x + layer.w * scale, base.y + layer.y * scale + 13 * scale);
      ctx.lineTo(base.x - layer.w * scale, base.y + layer.y * scale + 13 * scale);
      ctx.closePath();
      ctx.fillStyle = layer.color;
      ctx.fill();
      ctx.strokeStyle = '#173b32';
      ctx.lineWidth = Math.max(1, scale);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRock({ x, y, variant }) {
    const ctx = this.ctx;
    const p = this.project(x + 0.5, y + 0.55);
    const s = this.zoom * (5 + variant);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p.x - s, p.y); ctx.lineTo(p.x - s * 0.4, p.y - s); ctx.lineTo(p.x + s * 0.55, p.y - s * 0.7); ctx.lineTo(p.x + s, p.y); ctx.closePath();
    ctx.fillStyle = '#8f9386'; ctx.fill(); ctx.strokeStyle = '#535b55'; ctx.stroke();
    ctx.restore();
  }

  drawBuilding(building) {
    const selected = this.selectedId === building.id;
    const pulse = 0.5 + Math.sin(this.pulse * 4) * 0.15;
    const baseFill = building.type === 'port' ? '#887b68' : building.type === 'market' ? '#b59d72' : '#6f784f';
    this.footprint(building.x, building.y, building.w, building.h, baseFill, selected ? COLORS.gold : '#455344', selected ? 0.98 : 0.9);

    if (building.type === 'port') this.drawPort(building);
    else if (building.type === 'market') this.drawMarket(building);
    else if (building.type === 'logger') this.drawLogger(building);
    else if (building.type === 'woodshop') this.drawWoodshop(building);
    else if (building.type === 'warehouse') this.drawWarehouse(building);

    const state = this.world.statusOf(building);
    if (state.tone === 'warn' || state.tone === 'wait') {
      const p = this.project(building.x + building.w * 0.5, building.y + building.h * 0.5, 58);
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = pulse + 0.25;
      ctx.fillStyle = state.tone === 'warn' ? COLORS.red : COLORS.gold;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(7, 9 * this.zoom), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COLORS.ink;
      ctx.font = `bold ${Math.max(10, 12 * this.zoom)}px ui-sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', p.x, p.y + 0.5);
      ctx.restore();
    }
  }

  gradePalette(grade) {
    if (grade >= 4) return { top: '#d3c8aa', left: '#9c9584', right: '#858276', line: '#343b3a', roof: '#6e6a65' };
    if (grade >= 3) return { top: '#9c513d', left: '#8b633f', right: '#745237', line: '#3e332a', roof: '#8a4535' };
    return { top: '#b9824e', left: '#825531', right: '#704729', line: '#3b3028', roof: '#8f4b36' };
  }

  drawLogger(building) {
    const grade = building.grade;
    const palette = this.gradePalette(grade);
    if (grade === 0) {
      this.drawTent(building.x + 0.35, building.y + 0.4, '#8b6f4b');
      this.drawSawBench(building.x + 1.45, building.y + 1.15);
    } else {
      const height = 25 + grade * 7;
      this.prism(building.x + 0.28, building.y + 0.3, 1.55 + grade * 0.16, 1.35 + grade * 0.12, height, palette);
      this.drawRoof(building.x + 0.18, building.y + 0.2, 1.8 + grade * 0.17, 1.58 + grade * 0.12, height + 3, palette.roof);
      if (grade >= 3) this.drawChimney(building.x + 1.25, building.y + 0.65, height + 6, building.siteActivity > 0);
    }
    this.drawPile(building, 'output', 'log', building.x + 2.28, building.y + 2.25, 'out');
    this.drawWorker(building.x + 1.45, building.y + 2.08, building.siteActivity > 0 ? 1 : 0);
    if (building.upgradeRequested) this.drawConstruction(building);
  }

  drawWoodshop(building) {
    const grade = building.grade;
    const palette = this.gradePalette(grade);
    if (grade === 0) {
      this.drawTent(building.x + 1.0, building.y + 0.38, '#9d7048');
      this.drawSawBench(building.x + 1.18, building.y + 1.33);
    } else {
      const height = 27 + grade * 8;
      this.prism(building.x + 0.65, building.y + 0.22, 1.75 + grade * 0.17, 1.55 + grade * 0.12, height, palette);
      this.drawRoof(building.x + 0.52, building.y + 0.1, 2.02 + grade * 0.18, 1.78 + grade * 0.13, height + 3, palette.roof);
      if (grade >= 2) this.drawChimney(building.x + 1.78, building.y + 0.52, height + 6, building.siteActivity > 0);
    }
    this.drawPile(building, 'input', 'log', building.x + 0.46, building.y + 2.37, 'in');
    this.drawPile(building, 'output', 'boards', building.x + 2.42, building.y + 2.28, 'out');
    this.drawWorker(building.x + 1.48, building.y + 2.3, building.siteActivity > 0 ? 1 : 0);
    if (building.upgradeRequested) this.drawConstruction(building);
  }

  drawWarehouse(building) {
    const palette = this.gradePalette(Math.max(1, building.grade));
    const height = 34 + building.grade * 7;
    this.prism(building.x + 0.35, building.y + 0.32, 2.25, 1.72, height, palette);
    this.drawRoof(building.x + 0.22, building.y + 0.2, 2.52, 1.94, height + 3, palette.roof);
    const goods = ['log', 'boards', 'stone'];
    goods.forEach((good, index) => this.drawPile(building, 'storage', good, building.x + 0.55 + index * 0.8, building.y + 2.45, 'store'));
    if (building.upgradeRequested) this.drawConstruction(building);
  }

  drawMarket(building) {
    const ctx = this.ctx;
    const stalls = [
      [0.48, 0.52, '#b65a43'], [1.55, 0.45, '#d3aa53'], [0.85, 1.45, '#4f8a78'], [1.92, 1.38, '#c8744e'],
    ];
    for (const [dx, dy, color] of stalls) {
      this.prism(building.x + dx, building.y + dy, 0.6, 0.46, 11, { top: color, left: '#76553c', right: '#614530', line: '#3b352f' });
    }
    this.drawPile(building, 'input', 'food', building.x + 2.43, building.y + 2.35, 'in');
    const p = this.project(building.x + 1.45, building.y + 1.5, 2);
    ctx.save(); ctx.fillStyle = '#efe0b3'; ctx.fillRect(p.x - 2, p.y - 12 * this.zoom, 4, 12 * this.zoom); ctx.restore();
  }

  drawPort(building) {
    const palette = { top: '#745546', left: '#544437', right: '#483a32', line: '#283234' };
    this.prism(building.x + 0.25, building.y + 0.22, 1.65, 1.25, 31, palette);
    this.drawRoof(building.x + 0.12, building.y + 0.1, 1.92, 1.5, 34, '#4d6870');
    this.drawCrane(building.x + 3.05, building.y + 0.55);
    this.drawPile(building, 'inbound', 'food', building.x + 0.55, building.y + 2.4, 'in');
    this.drawPile(building, 'inbound', 'tools', building.x + 1.35, building.y + 2.42, 'in');
    this.drawPile(building, 'inbound', 'stone', building.x + 2.14, building.y + 2.42, 'in');
    this.drawPile(building, 'outbound', 'boards', building.x + 3.18, building.y + 2.35, 'out');
    if (this.world.ship.state === 'loading' || this.world.ship.state === 'unloading') this.drawPorter(building);
  }

  drawPile(building, section, good, x, y, role) {
    const amount = this.world.sectionAmount(building, section, good);
    const cap = this.world.sectionCapacity(building, section, good) || GOODS[good].capacity;
    const ratio = cap > 0 ? clamp(amount / cap, 0, 1) : 0;
    const stage = amount <= 0 ? 0 : Math.max(1, Math.ceil(ratio * 4));
    const p = this.project(x, y, 1);
    const ctx = this.ctx;
    const s = this.zoom;

    ctx.save();
    ctx.strokeStyle = role === 'in' ? '#74b8ae' : role === 'out' ? '#d7ae59' : '#a9a388';
    ctx.lineWidth = Math.max(1, 1.5 * s);
    ctx.setLineDash(stage === 0 ? [3 * s, 3 * s] : []);
    ctx.beginPath();
    ctx.moveTo(p.x - 13 * s, p.y);
    ctx.lineTo(p.x, p.y - 6 * s);
    ctx.lineTo(p.x + 13 * s, p.y);
    ctx.lineTo(p.x, p.y + 6 * s);
    ctx.closePath();
    ctx.fillStyle = stage === 0 ? 'rgba(23,43,42,.20)' : 'rgba(30,38,35,.28)';
    ctx.fill(); ctx.stroke();
    ctx.setLineDash([]);

    const arrow = role === 'in' ? -1 : role === 'out' ? 1 : 0;
    if (arrow) {
      ctx.strokeStyle = role === 'in' ? '#9bd5ca' : '#f0c76d';
      ctx.lineWidth = Math.max(1, 1.4 * s);
      ctx.beginPath();
      ctx.moveTo(p.x - arrow * 10 * s, p.y + 7 * s);
      ctx.lineTo(p.x + arrow * 8 * s, p.y + 7 * s);
      ctx.lineTo(p.x + arrow * 4 * s, p.y + 4 * s);
      ctx.moveTo(p.x + arrow * 8 * s, p.y + 7 * s);
      ctx.lineTo(p.x + arrow * 4 * s, p.y + 10 * s);
      ctx.stroke();
    }

    if (stage > 0) {
      if (good === 'log') this.drawLogsAt(p.x, p.y, stage, s);
      else if (good === 'boards') this.drawBoardsAt(p.x, p.y, stage, s);
      else if (good === 'stone') this.drawStoneAt(p.x, p.y, stage, s);
      else if (good === 'food') this.drawSacksAt(p.x, p.y, stage, s, GOODS[good].color);
      else this.drawCratesAt(p.x, p.y, stage, s, GOODS[good].color);
    }
    ctx.restore();
  }

  drawLogsAt(x, y, stage, s) {
    const ctx = this.ctx;
    for (let i = 0; i < stage + 1; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const px = x + (col - 1) * 7 * s + row * 2 * s;
      const py = y - row * 5 * s - col * 1.5 * s;
      ctx.strokeStyle = GOODS.log.dark;
      ctx.lineWidth = Math.max(2, 4 * s);
      ctx.beginPath(); ctx.moveTo(px - 7 * s, py); ctx.lineTo(px + 7 * s, py - 3 * s); ctx.stroke();
      ctx.fillStyle = '#d39a5c'; ctx.beginPath(); ctx.arc(px + 7 * s, py - 3 * s, 2.2 * s, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawBoardsAt(x, y, stage, s) {
    const ctx = this.ctx;
    for (let i = 0; i < stage + 1; i++) {
      ctx.fillStyle = i % 2 ? '#c98b43' : GOODS.boards.color;
      ctx.strokeStyle = GOODS.boards.dark;
      ctx.lineWidth = Math.max(1, s);
      ctx.fillRect(x - 11 * s + (i % 2) * 2 * s, y - (i + 1) * 3.2 * s, 22 * s, 3.4 * s);
      ctx.strokeRect(x - 11 * s + (i % 2) * 2 * s, y - (i + 1) * 3.2 * s, 22 * s, 3.4 * s);
    }
  }

  drawStoneAt(x, y, stage, s) {
    const ctx = this.ctx;
    for (let i = 0; i < stage + 2; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      ctx.fillStyle = i % 2 ? '#a5a294' : GOODS.stone.color;
      ctx.strokeStyle = GOODS.stone.dark;
      ctx.fillRect(x - 10 * s + col * 7 * s, y - 5 * s - row * 6 * s, 7 * s, 6 * s);
      ctx.strokeRect(x - 10 * s + col * 7 * s, y - 5 * s - row * 6 * s, 7 * s, 6 * s);
    }
  }

  drawSacksAt(x, y, stage, s, color) {
    const ctx = this.ctx;
    for (let i = 0; i < stage + 1; i++) {
      const px = x + (i - stage * 0.5) * 6 * s;
      ctx.fillStyle = color; ctx.strokeStyle = '#665f35';
      ctx.beginPath(); ctx.ellipse(px, y - 5 * s - (i % 2) * 3 * s, 4 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }

  drawCratesAt(x, y, stage, s, color) {
    const ctx = this.ctx;
    for (let i = 0; i < stage; i++) {
      const px = x - 8 * s + (i % 2) * 9 * s;
      const py = y - 7 * s - Math.floor(i / 2) * 8 * s;
      ctx.fillStyle = color; ctx.strokeStyle = '#4f5251';
      ctx.fillRect(px, py, 9 * s, 8 * s); ctx.strokeRect(px, py, 9 * s, 8 * s);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 9 * s, py + 8 * s); ctx.stroke();
    }
  }

  drawTent(x, y, color) {
    const p = this.project(x, y, 1);
    const ctx = this.ctx;
    const s = this.zoom;
    ctx.save();
    ctx.fillStyle = color; ctx.strokeStyle = '#3f3428'; ctx.lineWidth = Math.max(1, s);
    ctx.beginPath(); ctx.moveTo(p.x, p.y - 25 * s); ctx.lineTo(p.x + 18 * s, p.y); ctx.lineTo(p.x - 18 * s, p.y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.x, p.y - 25 * s); ctx.lineTo(p.x, p.y); ctx.stroke();
    ctx.restore();
  }

  drawSawBench(x, y) {
    const p = this.project(x, y, 2);
    const ctx = this.ctx;
    const s = this.zoom;
    ctx.save();
    ctx.strokeStyle = '#4d3524'; ctx.lineWidth = Math.max(2, 3 * s);
    ctx.beginPath(); ctx.moveTo(p.x - 11 * s, p.y - 7 * s); ctx.lineTo(p.x + 11 * s, p.y - 11 * s); ctx.stroke();
    ctx.lineWidth = Math.max(1, 2 * s);
    ctx.beginPath(); ctx.moveTo(p.x - 7 * s, p.y - 7 * s); ctx.lineTo(p.x - 7 * s, p.y + 5 * s); ctx.moveTo(p.x + 7 * s, p.y - 10 * s); ctx.lineTo(p.x + 7 * s, p.y + 2 * s); ctx.stroke();
    ctx.restore();
  }

  drawRoof(x, y, w, h, z, color) {
    const ctx = this.ctx;
    const a = this.project(x, y + h * 0.5, z + 11);
    const b = this.project(x + w * 0.5, y, z);
    const c = this.project(x + w, y + h * 0.5, z + 11);
    const d = this.project(x + w * 0.5, y + h, z);
    ctx.save();
    ctx.strokeStyle = '#3a3330'; ctx.lineWidth = Math.max(1, 1.5 * this.zoom);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath();
    ctx.fillStyle = color; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();
    ctx.restore();
  }

  drawChimney(x, y, z, active) {
    const p = this.project(x, y, z);
    const ctx = this.ctx;
    const s = this.zoom;
    ctx.save();
    ctx.fillStyle = '#5f4c42'; ctx.strokeStyle = '#352f2d';
    ctx.fillRect(p.x - 3 * s, p.y - 14 * s, 7 * s, 16 * s); ctx.strokeRect(p.x - 3 * s, p.y - 14 * s, 7 * s, 16 * s);
    if (active) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#d7d2c2';
      ctx.beginPath(); ctx.arc(p.x + 3 * s, p.y - 21 * s - Math.sin(this.pulse * 3) * 3 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  drawConstruction(building) {
    const ctx = this.ctx;
    const s = this.zoom;
    const corners = [
      this.project(building.x + 0.2, building.y + 0.2, 2),
      this.project(building.x + building.w - 0.2, building.y + 0.2, 2),
      this.project(building.x + building.w - 0.2, building.y + building.h - 0.2, 2),
      this.project(building.x + 0.2, building.y + building.h - 0.2, 2),
    ];
    ctx.save(); ctx.strokeStyle = '#d4b06b'; ctx.lineWidth = Math.max(1, 2 * s);
    for (const point of corners) { ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(point.x, point.y - 45 * s); ctx.stroke(); }
    ctx.setLineDash([5 * s, 4 * s]);
    ctx.beginPath(); corners.forEach((point, index) => index ? ctx.lineTo(point.x, point.y - 32 * s) : ctx.moveTo(point.x, point.y - 32 * s)); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }

  drawWorker(x, y, active) {
    const p = this.project(x, y, 3);
    const s = this.zoom;
    const bob = active ? Math.sin(this.pulse * 9 + x) * 2 * s : 0;
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#d6b087'; ctx.beginPath(); ctx.arc(p.x, p.y - 14 * s + bob, 3.2 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = active ? '#426b64' : '#6f6658'; ctx.fillRect(p.x - 3 * s, p.y - 11 * s + bob, 6 * s, 10 * s);
    ctx.restore();
  }

  drawCrane(x, y) {
    const p = this.project(x, y, 2);
    const ctx = this.ctx;
    const s = this.zoom;
    ctx.save(); ctx.strokeStyle = '#4f3928'; ctx.lineWidth = Math.max(2, 4 * s);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 52 * s); ctx.lineTo(p.x + 32 * s, p.y - 44 * s); ctx.stroke();
    ctx.lineWidth = Math.max(1, 1.5 * s); ctx.strokeStyle = '#2c3030';
    ctx.beginPath(); ctx.moveTo(p.x + 29 * s, p.y - 43 * s); ctx.lineTo(p.x + 29 * s, p.y - 11 * s); ctx.stroke();
    ctx.restore();
  }

  drawPorter(building) {
    const phase = 1 - clamp(this.world.ship.timer / 0.72, 0, 1);
    const reverse = this.world.ship.state === 'loading';
    const t = reverse ? 1 - phase : phase;
    const x = building.x + 3.65 - t * 0.85;
    const y = building.y + 2.85 + t * 0.1;
    this.drawWorker(x, y, 1);
    const p = this.project(x, y, 15);
    const ctx = this.ctx;
    ctx.save(); ctx.fillStyle = '#d19a50'; ctx.fillRect(p.x - 4 * this.zoom, p.y - 3 * this.zoom, 8 * this.zoom, 6 * this.zoom); ctx.restore();
  }

  drawCart(shipment) {
    const p = this.project(shipment.x + 0.5, shipment.y + 0.5, 4);
    const ctx = this.ctx;
    const s = this.zoom;
    const tracked = shipment.id === this.trackedShipmentId;
    ctx.save();
    if (tracked) {
      ctx.globalAlpha = 0.35 + Math.sin(this.pulse * 5) * 0.12;
      ctx.fillStyle = COLORS.gold;
      ctx.beginPath(); ctx.arc(p.x, p.y - 8 * s, 17 * s, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#6c472e'; ctx.strokeStyle = '#292a28'; ctx.lineWidth = Math.max(1, 1.5 * s);
    ctx.beginPath(); ctx.moveTo(p.x - 10 * s, p.y - 11 * s); ctx.lineTo(p.x + 9 * s, p.y - 15 * s); ctx.lineTo(p.x + 11 * s, p.y - 5 * s); ctx.lineTo(p.x - 8 * s, p.y - 2 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#252a29';
    ctx.beginPath(); ctx.arc(p.x - 6 * s, p.y, 4 * s, 0, Math.PI * 2); ctx.arc(p.x + 8 * s, p.y - 3 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
    if (shipment.good === 'log') this.drawLogsAt(p.x, p.y - 13 * s, Math.min(3, Math.ceil(shipment.amount / 2)), s * 0.65);
    if (shipment.good === 'boards') this.drawBoardsAt(p.x, p.y - 11 * s, Math.min(3, Math.ceil(shipment.amount / 2)), s * 0.65);
    if (shipment.good === 'food') this.drawSacksAt(p.x, p.y - 9 * s, 2, s * 0.65, GOODS.food.color);
    if (shipment.good === 'tools') this.drawCratesAt(p.x, p.y - 8 * s, 2, s * 0.65, GOODS.tools.color);
    if (shipment.good === 'stone') this.drawStoneAt(p.x, p.y - 8 * s, 2, s * 0.65);
    ctx.restore();
  }

  drawShip(ship) {
    let t = 1;
    if (ship.state === 'arriving') t = ease(ship.progress);
    if (ship.state === 'departing') t = 1 - ease(ship.progress);
    const x = -1.6 + t * 3.2;
    const y = 19.8 - t * 2.35;
    const p = this.project(x, y, 1);
    const ctx = this.ctx;
    const s = this.zoom;
    ctx.save();
    ctx.strokeStyle = '#302a27'; ctx.lineWidth = Math.max(1, 2 * s);
    ctx.fillStyle = '#6d3f2e';
    ctx.beginPath(); ctx.moveTo(p.x - 38 * s, p.y - 4 * s); ctx.lineTo(p.x + 42 * s, p.y - 12 * s); ctx.lineTo(p.x + 29 * s, p.y + 12 * s); ctx.lineTo(p.x - 27 * s, p.y + 16 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d9c79d';
    ctx.beginPath(); ctx.moveTo(p.x + 2 * s, p.y - 70 * s); ctx.lineTo(p.x + 32 * s, p.y - 31 * s); ctx.lineTo(p.x + 2 * s, p.y - 25 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.x - 3 * s, p.y - 61 * s); ctx.lineTo(p.x - 29 * s, p.y - 33 * s); ctx.lineTo(p.x - 3 * s, p.y - 27 * s); ctx.closePath(); ctx.fillStyle = '#b95b47'; ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#3a3028'; ctx.lineWidth = Math.max(2, 3 * s);
    ctx.beginPath(); ctx.moveTo(p.x, p.y - 5 * s); ctx.lineTo(p.x, p.y - 74 * s); ctx.stroke();
    ctx.fillStyle = '#e4bd58'; ctx.fillRect(p.x + 2 * s, p.y - 72 * s, 14 * s, 6 * s);
    const cargoStage = Math.min(4, Math.ceil((ship.cargo.boards || 0) / 4));
    if (cargoStage) this.drawBoardsAt(p.x + 7 * s, p.y - 10 * s, cargoStage, s * 0.65);
    ctx.restore();
  }

  drawPreviews() {
    if (this.roadPreview?.cells?.length) {
      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = this.roadPreview.ok ? 'rgba(247,211,107,.9)' : 'rgba(218,95,75,.9)';
      ctx.lineWidth = Math.max(4, 9 * this.zoom);
      ctx.lineCap = 'round';
      ctx.beginPath();
      this.roadPreview.cells.forEach((cell, index) => {
        const p = this.project(cell.x + 0.5, cell.y + 0.5, 2);
        index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
      });
      ctx.stroke(); ctx.restore();
    }
    if (this.preview?.tool && this.preview.tool !== 'road') {
      const def = BUILDINGS[this.preview.tool];
      if (def) {
        const ok = this.preview.check?.ok;
        this.footprint(this.preview.x, this.preview.y, def.w, def.h, ok ? '#78a966' : '#a5554d', ok ? '#c8e68a' : '#f0a099', 0.52, 3);
        if (this.preview.check?.entrance) {
          const p = this.project(this.preview.check.entrance.x + 0.5, this.preview.check.entrance.y + 0.5, 4);
          const ctx = this.ctx;
          ctx.save(); ctx.fillStyle = COLORS.gold; ctx.beginPath(); ctx.arc(p.x, p.y, 5 * this.zoom, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
      }
    }
    if (this.world.chapterStage === 0) {
      this.drawWaymark(FIXED.roadHead.x, FIXED.roadHead.y, false);
      this.drawWaymark(FIXED.forestGate.x, FIXED.forestGate.y, true);
    }
    if (this.world.chapterStage === 1 && !this.world.getBuildingByType('logger')) {
      const alpha = 0.18 + (Math.sin(this.pulse * 4) + 1) * 0.06;
      this.footprint(FIXED.suggestedLogger.x, FIXED.suggestedLogger.y, 3, 3, '#d8b75b', '#f3d675', alpha, 4);
    }
    if (this.world.chapterStage === 3 && !this.world.getBuildingByType('woodshop')) {
      const alpha = 0.18 + (Math.sin(this.pulse * 4) + 1) * 0.06;
      this.footprint(FIXED.suggestedWoodshop.x, FIXED.suggestedWoodshop.y, 3, 3, '#d8b75b', '#f3d675', alpha, 4);
    }
  }

  drawWaymark(x, y, target) {
    const p = this.project(x + 0.5, y + 0.5, 6);
    const ctx = this.ctx;
    const r = (8 + Math.sin(this.pulse * 4) * 2) * this.zoom;
    ctx.save();
    ctx.strokeStyle = target ? '#f4d26f' : '#e6b857';
    ctx.lineWidth = Math.max(2, 3 * this.zoom);
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = target ? 'rgba(244,210,111,.22)' : 'rgba(230,184,87,.18)'; ctx.fill();
    ctx.restore();
  }

  drawMoneyFloats() {
    const ctx = this.ctx;
    for (const float of this.world.moneyFloats) {
      const p = this.project(float.x + 0.5, float.y + 0.5, 38 + (float.maxLife - float.life) * 12);
      const alpha = clamp(float.life / 0.8, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `700 ${Math.max(11, 14 * this.zoom)}px ui-sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = float.amount > 0 ? '#bde38c' : '#f2a28c';
      ctx.strokeStyle = '#203033'; ctx.lineWidth = 3;
      const text = `${float.amount > 0 ? '+' : '−'}${Math.abs(Math.round(float.amount)).toLocaleString('ja-JP')}`;
      ctx.strokeText(text, p.x, p.y); ctx.fillText(text, p.x, p.y);
      ctx.restore();
    }
  }
}

export { COLORS, GRADE_NAMES };
