const TAU = Math.PI * 2;

export const GOODS_VIEW = {
  fish:  { name: '魚', color: '#72b9cf', edge: '#d2edf1', shape: 'basket' },
  veg:   { name: '野菜', color: '#7ebf68', edge: '#d7e5a1', shape: 'basket' },
  wheat: { name: '麦', color: '#d5b65a', edge: '#f3dda0', shape: 'sack' },
  pres:  { name: '保存食', color: '#b97d4e', edge: '#e8bb80', shape: 'barrel' },
  pick:  { name: '漬物', color: '#839c59', edge: '#d0d99c', shape: 'barrel' },
  tools: { name: '木製品', color: '#b06f42', edge: '#e6b77b', shape: 'crate' },
  salt:  { name: '塩', color: '#d9ded5', edge: '#ffffff', shape: 'sack' },
  char:  { name: '炭', color: '#44484b', edge: '#aeb4b6', shape: 'sack' },
  meat:  { name: '肉', color: '#ba766f', edge: '#efb6a9', shape: 'basket' },
  meal:  { name: '魚粕', color: '#9d8b65', edge: '#d7c89f', shape: 'sack' },
  stone: { name: '石', color: '#8f989a', edge: '#d1d6d3', shape: 'stone' },
  oil:   { name: '油', color: '#c9973e', edge: '#f2d588', shape: 'barrel' },
  iron:  { name: '鉄', color: '#67777c', edge: '#c0d0d3', shape: 'crate' },
  cloth: { name: '布', color: '#9e78a6', edge: '#dcbde0', shape: 'roll' },
  log:   { name: '丸太', color: '#795035', edge: '#c98a59', shape: 'log' },
};

export const JOB_VIEW = {
  fisher:    { name: '漁師', icon: '🐟', output: 'fish', footprint: [2, 2] },
  veg:       { name: '菜園', icon: '🥬', output: 'veg', footprint: [2, 2] },
  wheat:     { name: '麦畑', icon: '🌾', output: 'wheat', footprint: [3, 3] },
  logger:    { name: '木こり', icon: '🪓', output: 'log', footprint: [2, 2] },
  woodshop:  { name: '木工房', icon: '🪚', output: 'tools', footprint: [2, 2] },
  charburner:{ name: '炭焼小屋', icon: '♨', output: 'char', footprint: [2, 2] },
  saltworks: { name: '製塩小屋', icon: '◇', output: 'salt', footprint: [2, 2] },
  shepherd:  { name: '牧場', icon: '🐑', output: 'meat', footprint: [3, 3] },
  rapeseed:  { name: '菜種畑', icon: '✿', output: 'oil', footprint: [3, 3] },
  quarryman: { name: '採石場', icon: '◆', output: 'stone', footprint: [2, 2] },
  fisher2:   { name: '沖合漁', icon: '⛵', output: 'meal', footprint: [2, 2] },
};

const TERRAIN = {
  grass: ['#66845a', '#607d54'],
  sand: ['#bda873', '#b39c68'],
  water: ['#377486', '#326b7d'],
  forest: ['#4d7047', '#486842'],
  rock: ['#777b73', '#70746d'],
  bald: ['#88765b', '#806e54'],
};

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

export class Renderer {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;
    this.tw = 56;
    this.th = 28;
    this.zoom = innerWidth < 620 ? 0.78 : 0.82;
    this.panX = 0;
    this.panY = 0;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.hover = null;
    this.selected = null;
    this.frame = 0;
    this.resize();
    this.focus(world.port?.x ?? 25, world.port?.y ?? 35, true);
  }

  resize() {
    const oldW = this.width || innerWidth;
    const oldH = this.height || innerHeight;
    this.width = innerWidth;
    this.height = innerHeight;
    this.dpr = Math.min(2, devicePixelRatio || 1);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    if (oldW !== this.width || oldH !== this.height) {
      this.panX += (this.width - oldW) / 2;
      this.panY += (this.height - oldH) / 2;
    }
  }

  project(x, y, z = 0) {
    return {
      x: this.width / 2 + this.panX + (x - y) * this.tw * 0.5 * this.zoom,
      y: this.panY + (x + y) * this.th * 0.5 * this.zoom - z * this.zoom,
    };
  }

  screenToTile(px, py, round = true) {
    const sx = (px - this.width / 2 - this.panX) / this.zoom;
    const sy = (py - this.panY) / this.zoom;
    const a = sx / (this.tw * 0.5);
    const b = sy / (this.th * 0.5);
    const x = (a + b) / 2;
    const y = (b - a) / 2;
    return round ? [Math.round(x), Math.round(y)] : [x, y];
  }

  focus(x, y, instant = false) {
    const bx = (x - y) * this.tw * 0.5 * this.zoom;
    const by = (x + y) * this.th * 0.5 * this.zoom;
    const tx = -bx;
    const ty = this.height * 0.48 - by;
    if (instant) {
      this.panX = tx;
      this.panY = ty;
    } else {
      this.targetPan = { x: tx, y: ty };
    }
  }

  pan(dx, dy) {
    this.panX += dx;
    this.panY += dy;
    this.targetPan = null;
  }

  zoomAt(factor, sx, sy) {
    const before = this.screenToTile(sx, sy, false);
    this.zoom = clamp(this.zoom * factor, 0.42, 1.65);
    const after = this.project(before[0], before[1]);
    this.panX += sx - after.x;
    this.panY += sy - after.y;
  }

  isVisible(p, pad = 120) {
    return p.x > -pad && p.y > -pad && p.x < this.width + pad && p.y < this.height + pad;
  }

  diamond(x, y, color, scale = 1, stroke = null) {
    const c = this.ctx;
    const hw = this.tw * 0.5 * this.zoom * scale;
    const hh = this.th * 0.5 * this.zoom * scale;
    c.beginPath();
    c.moveTo(x, y - hh);
    c.lineTo(x + hw, y);
    c.lineTo(x, y + hh);
    c.lineTo(x - hw, y);
    c.closePath();
    c.fillStyle = color;
    c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = Math.max(1, this.zoom); c.stroke(); }
  }

  draw(view = {}) {
    this.frame++;
    if (this.targetPan) {
      this.panX += (this.targetPan.x - this.panX) * 0.12;
      this.panY += (this.targetPan.y - this.panY) * 0.12;
      if (Math.abs(this.targetPan.x - this.panX) < 0.5 && Math.abs(this.targetPan.y - this.panY) < 0.5) this.targetPan = null;
    }
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const bg = c.createLinearGradient(0, 0, 0, this.height);
    bg.addColorStop(0, '#173f42');
    bg.addColorStop(1, '#081c1f');
    c.fillStyle = bg;
    c.fillRect(0, 0, this.width, this.height);
    this.drawSeaHaze();
    this.drawTerrain();
    this.drawRoads(view);
    this.drawRoadPreview(view.roadPreview);
    this.drawObjects(view);
    this.drawPlacement(view);
    c.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawSeaHaze() {
    const c = this.ctx;
    c.save();
    c.globalAlpha = 0.18;
    c.fillStyle = '#a8d0cf';
    for (let i = 0; i < 11; i++) {
      const y = (i * 89 + this.frame * 0.08) % (this.height + 120) - 60;
      c.fillRect(0, y, this.width, 1);
    }
    c.restore();
  }

  drawTerrain() {
    const w = this.world;
    const c = this.ctx;
    const month = (Math.floor(Math.max(0, w.day - 1) / 30) % 12) + 1;
    const winter = month >= 10 || month <= 2;
    for (let y = 0; y < w.MH; y++) {
      for (let x = 0; x < w.MW; x++) {
        const p = this.project(x, y);
        if (!this.isVisible(p, 80)) continue;
        const t = w.terr?.[y]?.[x] || 'grass';
        let col = (TERRAIN[t] || TERRAIN.grass)[(x + y) & 1];
        if (winter && t !== 'water') col = this.mix(col, '#c9d2c2', 0.24);
        this.diamond(p.x, p.y, col, 1.02, t === 'water' ? '#8ac1c333' : '#132e2633');
        if (t === 'water') {
          const wave = (x * 5 + y * 7 + Math.floor(this.frame / 18)) % 13;
          if (wave === 0) {
            c.strokeStyle = '#9cc8c46a';
            c.lineWidth = Math.max(1, this.zoom);
            c.beginPath();
            c.moveTo(p.x - 7 * this.zoom, p.y);
            c.lineTo(p.x + 8 * this.zoom, p.y);
            c.stroke();
          }
        }
      }
    }
  }

  drawRoads(view = {}) {
    const w = this.world;
    const c = this.ctx;
    const roads = w.roadTiles || new Set();
    const connected = w.roadConnected || new Set();
    const forward = [[1, 0], [0, 1], [1, 1], [1, -1]];
    c.save();
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const key of roads) {
      const [x, y] = key.split(',').map(Number);
      const p = this.project(x, y);
      for (const [dx, dy] of forward) {
        const nk = `${x + dx},${y + dy}`;
        if (!roads.has(nk)) continue;
        const q = this.project(x + dx, y + dy);
        const live = connected.has(key) && connected.has(nk);
        c.strokeStyle = live ? '#493b2d' : '#483f3a';
        c.lineWidth = Math.max(4, 12 * this.zoom);
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke();
        c.strokeStyle = live ? (w.paved ? '#b9b8ae' : '#a8895d') : '#6c625c';
        c.lineWidth = Math.max(2, 8 * this.zoom);
        c.stroke();
        c.strokeStyle = live ? (w.paved ? '#dfddd2aa' : '#d7b97a99') : '#95776b77';
        c.lineWidth = Math.max(1, 1.5 * this.zoom);
        c.stroke();
      }
    }
    for (const key of roads) {
      const [x, y] = key.split(',').map(Number);
      const p = this.project(x, y);
      if (!this.isVisible(p, 50)) continue;
      const live = connected.has(key);
      const traffic = w.traffic?.[key] || 0;
      this.diamond(p.x, p.y, live ? (w.paved ? '#aaa99f' : '#927650') : '#665c58', 0.51, live ? '#d7ba7b88' : '#a7776d');
      if (traffic > 20 && live) {
        const a = Math.min(.7, .16 + Math.log10(traffic + 1) * .16);
        c.fillStyle = `rgba(245,207,116,${a})`;
        c.beginPath(); c.arc(p.x, p.y, Math.max(1.5, 2.4 * this.zoom), 0, TAU); c.fill();
      }
      if (!live) {
        c.strokeStyle = '#e47a68'; c.lineWidth = Math.max(1, 1.5 * this.zoom);
        c.beginPath(); c.moveTo(p.x, p.y - 2 * this.zoom); c.lineTo(p.x, p.y - 15 * this.zoom); c.stroke();
        c.fillStyle = '#d95f52'; c.beginPath(); c.moveTo(p.x, p.y - 15 * this.zoom); c.lineTo(p.x + 8 * this.zoom, p.y - 11 * this.zoom); c.lineTo(p.x, p.y - 8 * this.zoom); c.closePath(); c.fill();
      }
      if (!w.hhs.length && (key === '24,32' || key === '26,32')) {
        const pulse = 1 + Math.sin(this.frame * .06) * .14;
        c.strokeStyle = '#ffe18bbd'; c.lineWidth = Math.max(1.5, 2 * this.zoom);
        c.beginPath(); c.ellipse(p.x, p.y, 18 * this.zoom * pulse, 8 * this.zoom * pulse, 0, 0, TAU); c.stroke();
      }
      if (view.selected?.type === 'road' && view.selected.x === x && view.selected.y === y) {
        c.strokeStyle = '#ffe38b'; c.lineWidth = Math.max(2, 2.5 * this.zoom);
        c.beginPath(); c.ellipse(p.x, p.y, 20 * this.zoom, 9 * this.zoom, 0, 0, TAU); c.stroke();
      }
    }
    for (const s of w.sites || []) {
      const p = this.project(s.x, s.y);
      const frontier = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].some(([dx,dy]) => connected.has(`${s.x+dx},${s.y+dy}`));
      this.diamond(p.x, p.y, frontier ? '#8e704499' : '#63565099', 0.62, frontier ? '#ebc56b' : '#bc8175');
      c.fillStyle = '#f2d684'; c.font = `${Math.max(9, 11 * this.zoom)}px sans-serif`; c.textAlign = 'center';
      c.fillText('⚒', p.x, p.y + 4);
      if (this.zoom > .8) this.label(p.x, p.y - 15 * this.zoom, `${Math.max(0, s.left)}人日`);
    }
    c.restore();
  }

  drawRoadPreview(preview) {
    if (!preview?.points?.length) return;
    const c = this.ctx, z = this.zoom;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.setLineDash([7 * z, 5 * z]);
    for (let i = 1; i < preview.points.length; i++) {
      const p = this.project(...preview.points[i - 1]), q = this.project(...preview.points[i]);
      c.strokeStyle = preview.remove ? '#ff8e79dd' : preview.valid ? (preview.connects ? '#f5d06fdd' : '#d68b7bdd') : '#e66c62dd';
      c.lineWidth = Math.max(3, 7 * z); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke();
    }
    c.setLineDash([]);
    preview.points.forEach(([x, y], i) => {
      const p = this.project(x, y);
      const status = preview.statuses?.[i];
      const color = preview.remove ? '#d9655866' : status === 'blocked' ? '#d9574c88' : status === 'existing' ? '#6caec266' : preview.connects ? '#e9c86177' : '#c87b6f77';
      this.diamond(p.x, p.y, color, .57, preview.remove ? '#ffae9e' : '#ffe29a');
    });
    const end = this.project(...preview.end);
    c.fillStyle = preview.valid ? '#ffe39a' : '#ff9b8c'; c.beginPath(); c.arc(end.x, end.y, Math.max(3, 4 * z), 0, TAU); c.fill();
    c.restore();
  }

  drawObjects(view) {
    const w = this.world;
    const objects = [];
    for (let y = 0; y < w.MH; y++) for (let x = 0; x < w.MW; x++) {
      const t = w.terr?.[y]?.[x];
      if (t === 'forest' && (x * 13 + y * 7) % 3 === 0) objects.push({ depth: x + y - 0.25, type: 'tree', x, y });
      if (t === 'rock' && (x * 11 + y * 5) % 4 === 0) objects.push({ depth: x + y - 0.2, type: 'rock', x, y });
    }
    objects.push({ depth: w.market.x + w.market.y, type: 'market', x: w.market.x, y: w.market.y });
    objects.push({ depth: w.port.x + w.port.y + 0.2, type: 'port', x: w.port.x, y: w.port.y });
    for (const z of w.zones) objects.push({ depth: z.x + z.y, type: 'zone', x: z.x, y: z.y, data: z });
    for (const r of w.ruins || []) objects.push({ depth: r.x + r.y + 0.1, type: 'ruin', x: r.x, y: r.y });
    for (const h of w.hhs) objects.push({ depth: h.x + h.y + 0.25, type: 'home', x: h.x, y: h.y, data: h });
    for (const h of w.hhs) {
      const px = h.state === 'home' || h.state === 'building' ? h.x + 0.35 : h.px;
      const py = h.state === 'home' || h.state === 'building' ? h.y + 0.2 : h.py;
      objects.push({ depth: px + py + 0.72, type: 'person', x: px, y: py, data: h });
    }
    if (view.ship) objects.push({ depth: view.ship.x + view.ship.y + 0.5, type: 'ship', x: view.ship.x, y: view.ship.y, data: view.ship });
    objects.sort((a, b) => a.depth - b.depth);
    for (const o of objects) {
      const p = this.project(o.x, o.y);
      if (!this.isVisible(p, 160)) continue;
      if (o.type === 'tree') this.drawTree(p, o.x, o.y);
      else if (o.type === 'rock') this.drawRock(p);
      else if (o.type === 'market') this.drawMarket(p);
      else if (o.type === 'port') this.drawPort(p, view.ship);
      else if (o.type === 'zone') this.drawZone(p, o.data);
      else if (o.type === 'ruin') this.drawRuin(p);
      else if (o.type === 'home') this.drawHome(p, o.data, view.selected === o.data);
      else if (o.type === 'person') this.drawPerson(p, o.data, view.selected === o.data);
      else if (o.type === 'ship') this.drawShip(p, o.data);
    }
    this.drawMarketPiles();
    this.drawPortPiles(view.ship);
  }

  drawTree(p, x, y) {
    const c = this.ctx;
    const z = this.zoom;
    const sway = Math.sin((this.frame + x * 8 + y * 3) * 0.015) * z;
    c.fillStyle = '#584431'; c.fillRect(p.x - z, p.y - 14 * z, 2 * z, 16 * z);
    const layers = [['#294c37', 30, 11], ['#315b3d', 23, 13], ['#3b6744', 16, 12]];
    for (const [col, yy, rr] of layers) {
      c.fillStyle = col; c.beginPath(); c.arc(p.x + sway, p.y - yy * z, rr * z, 0, TAU); c.fill();
    }
    c.strokeStyle = '#b9d59b22'; c.stroke();
  }

  drawRock(p) {
    const c = this.ctx, z = this.zoom;
    c.fillStyle = '#8e928c'; c.beginPath();
    c.moveTo(p.x - 8 * z, p.y); c.lineTo(p.x - 4 * z, p.y - 9 * z); c.lineTo(p.x + 3 * z, p.y - 12 * z); c.lineTo(p.x + 9 * z, p.y - 2 * z); c.lineTo(p.x + 4 * z, p.y + 3 * z); c.closePath(); c.fill();
    c.strokeStyle = '#484d49'; c.stroke();
  }

  drawFootprint(cx, cy, w, h, color, stroke = '#d4b56c44') {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) {
      const p = this.project(cx + dx - (w - 1) / 2, cy + dy - (h - 1) / 2);
      this.diamond(p.x, p.y, color, 0.94, stroke);
    }
  }

  drawMarket(p) {
    const c = this.ctx, z = this.zoom;
    this.drawFootprint(this.world.market.x, this.world.market.y, 3, 3, '#b7a071');
    this.prism(p.x, p.y, 38, 22, 20, '#d5c28d', '#8e673e', '#714a35');
    c.fillStyle = '#edd99f'; c.beginPath(); c.arc(p.x, p.y - 28 * z, 7 * z, 0, TAU); c.fill();
    c.strokeStyle = '#6d5439'; c.stroke();
    this.label(p.x, p.y + 30 * z, '中央市場');
  }

  drawPort(p, ship) {
    const c = this.ctx, z = this.zoom;
    this.drawFootprint(this.world.port.x, this.world.port.y, 4, 3, '#806748');
    for (let i = 0; i < 3; i++) {
      const q = this.project(this.world.port.x + i * 0.52, this.world.port.y + 1.5 + i * 0.12);
      c.strokeStyle = '#ad8955'; c.lineWidth = 7 * z; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke();
      c.strokeStyle = '#4a3929'; c.lineWidth = z; c.stroke();
    }
    this.prism(p.x - 18 * z, p.y - 5 * z, 46, 24, 32, '#d7c391', '#8b5f3e', '#684232');
    c.fillStyle = '#14393b'; c.fillRect(p.x - 30 * z, p.y - 25 * z, 7 * z, 9 * z);
    if (ship?.state === 'docked') {
      c.fillStyle = '#e6c775'; c.beginPath(); c.arc(p.x + 27 * z, p.y - 19 * z, 3 * z, 0, TAU); c.fill();
    }
    this.label(p.x, p.y + 34 * z, '商館・港');
  }

  drawZone(p, zdata) {
    if (zdata.filled) return;
    const c = this.ctx, z = this.zoom;
    this.diamond(p.x, p.y, zdata.roadConnected ? '#d7c47d30' : '#b66a5b38', 0.88, zdata.roadConnected ? '#f4d47c' : '#ee8d79');
    c.strokeStyle = zdata.roadConnected ? '#f1d17d' : '#ee8d79'; c.lineWidth = 2 * z;
    c.beginPath(); c.moveTo(p.x, p.y - 2 * z); c.lineTo(p.x, p.y - 23 * z); c.stroke();
    c.fillStyle = '#ead18a'; c.fillRect(p.x, p.y - 23 * z, 15 * z, 9 * z);
    c.fillStyle = '#243737'; c.font = `700 ${Math.max(8, 8 * z)}px sans-serif`; c.textAlign = 'center';
    c.fillText(JOB_VIEW[zdata.job]?.icon || '⌂', p.x + 7.5 * z, p.y - 16 * z);
    if (!zdata.roadConnected) this.label(p.x, p.y + 18 * z, '道待ち');
  }

  drawHome(p, h, selected) {
    const v = JOB_VIEW[h.job] || JOB_VIEW.veg;
    const c = this.ctx, z = this.zoom;
    if (h.job === 'wheat' || h.job === 'veg' || h.job === 'rapeseed') this.drawField(p, h);
    else if (h.job === 'fisher') this.drawFishery(p, h);
    else this.drawWorkshop(p, h);
    if (selected) {
      c.strokeStyle = '#ffe38b'; c.lineWidth = 2.5 * z; c.beginPath(); c.ellipse(p.x, p.y + 2 * z, 25 * z, 11 * z, 0, 0, TAU); c.stroke();
      if (h.roadEntry) {
        const [rx, ry] = h.roadEntry.split(',').map(Number), q = this.project(rx, ry);
        c.setLineDash([3 * z, 3 * z]); c.strokeStyle = '#ffe38bcc'; c.lineWidth = Math.max(1, 1.5 * z);
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); c.setLineDash([]);
        c.fillStyle = '#ffe38b'; c.beginPath(); c.arc(q.x, q.y, 2.5 * z, 0, TAU); c.fill();
      }
    }
    const q = (h.pantry[v.output] || 0) + (this.world.stalls[v.output] || []).filter(s => s.hh === h).reduce((sum, s) => sum + s.qty, 0);
    if (q > 1.2) this.drawPile(p.x + 18 * z, p.y + 2 * z, v.output, q, 0.75);
  }

  drawField(p, h) {
    const c = this.ctx, z = this.zoom;
    const color = h.job === 'wheat' ? '#c6a74d' : h.job === 'rapeseed' ? '#d5c94e' : '#699f54';
    this.drawFootprint(h.x, h.y, h.job === 'wheat' || h.job === 'rapeseed' ? 3 : 2, h.job === 'wheat' || h.job === 'rapeseed' ? 3 : 2, '#7c7047');
    c.strokeStyle = color; c.lineWidth = 2 * z;
    for (let i = -2; i <= 2; i++) {
      c.beginPath(); c.moveTo(p.x - 22 * z, p.y + i * 3 * z); c.lineTo(p.x + 16 * z, p.y + (i + 2) * 3 * z); c.stroke();
    }
    this.prism(p.x - 18 * z, p.y - 5 * z, 25, 14, 18, '#c99a62', '#7f5136', '#68452e');
  }

  drawFishery(p, h) {
    const c = this.ctx, z = this.zoom;
    this.drawFootprint(h.x, h.y, 2, 2, '#927654');
    c.strokeStyle = '#5a4430'; c.lineWidth = 5 * z; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + 28 * z, p.y + 14 * z); c.stroke();
    this.prism(p.x - 9 * z, p.y - 2 * z, 29, 17, 24, '#b9734c', '#734535', '#59342c');
    c.strokeStyle = '#d2e1d1'; c.lineWidth = z; c.beginPath(); c.arc(p.x + 17 * z, p.y - 4 * z, 8 * z, 0, Math.PI); c.stroke();
  }

  drawWorkshop(p, h) {
    const c = this.ctx, z = this.zoom;
    const palette = {
      logger: ['#8a623f', '#62422f'], woodshop: ['#b37747', '#71442e'], charburner: ['#5f5b52', '#403d38'],
      saltworks: ['#d2c9ae', '#82765f'], shepherd: ['#b99367', '#71503a'], quarryman: ['#8c908c', '#555b58'],
    }[h.job] || ['#9a7350', '#624330'];
    this.drawFootprint(h.x, h.y, 2, 2, '#7e6a4b');
    this.prism(p.x, p.y, 38, 23, h.lv >= 2 ? 34 : 27, palette[0], palette[1], '#493228');
    if (h.job === 'charburner' || h.job === 'saltworks' || h.job === 'woodshop') {
      c.fillStyle = '#553f35'; c.fillRect(p.x + 10 * z, p.y - 36 * z, 6 * z, 20 * z);
      const smoke = 8 + Math.sin(this.frame * 0.03 + h.id) * 2;
      c.fillStyle = '#d7d0bf55'; c.beginPath(); c.arc(p.x + 13 * z, p.y - (43 + smoke) * z, 7 * z, 0, TAU); c.fill();
    }
    if (h.job === 'logger') {
      c.fillStyle = '#765037';
      for (let i = 0; i < 4; i++) c.fillRect(p.x + (12 + i * 3) * z, p.y - (4 + i) * z, 18 * z, 3 * z);
    }
  }

  prism(x, y, w, h, height, roof, left, right) {
    const c = this.ctx, z = this.zoom;
    const hw = w * 0.5 * z, hh = h * 0.5 * z, hhgt = height * z;
    c.fillStyle = left; c.beginPath(); c.moveTo(x - hw, y); c.lineTo(x, y + hh); c.lineTo(x, y + hh - hhgt); c.lineTo(x - hw, y - hhgt); c.closePath(); c.fill();
    c.fillStyle = right; c.beginPath(); c.moveTo(x + hw, y); c.lineTo(x, y + hh); c.lineTo(x, y + hh - hhgt); c.lineTo(x + hw, y - hhgt); c.closePath(); c.fill();
    c.fillStyle = roof; c.beginPath(); c.moveTo(x, y - hh - hhgt); c.lineTo(x + hw, y - hhgt); c.lineTo(x, y + hh - hhgt); c.lineTo(x - hw, y - hhgt); c.closePath(); c.fill();
    c.strokeStyle = '#32271f99'; c.lineWidth = Math.max(1, z); c.stroke();
  }

  drawPerson(p, h, selected) {
    if (h.state === 'building') return;
    const c = this.ctx, z = this.zoom;
    const v = JOB_VIEW[h.job] || JOB_VIEW.veg;
    const bob = Math.sin(this.frame * 0.17 + h.id) * (h.state === 'home' ? 0.6 : 1.4) * z;
    const cargo = this.dominantCargo(h);
    const cargoQty = this.cargoQty(h);
    const moving = h.state !== 'home';
    if (moving && cargo && (h.state === 'toMarket' || h.state === 'toHome')) {
      if (h.tripVehicle === 'cart') this.drawCart(p.x - 5 * z, p.y + bob, cargo, cargoQty);
      else this.drawPack(p.x - 3 * z, p.y + bob, cargo);
    }
    c.fillStyle = '#e8c09a'; c.beginPath(); c.arc(p.x + 6 * z, p.y - 13 * z + bob, 3.1 * z, 0, TAU); c.fill();
    c.fillStyle = this.jobColor(h.job); c.beginPath(); c.moveTo(p.x + 2 * z, p.y - 10 * z + bob); c.lineTo(p.x + 10 * z, p.y - 10 * z + bob); c.lineTo(p.x + 11 * z, p.y + bob); c.lineTo(p.x + 1 * z, p.y + bob); c.closePath(); c.fill();
    c.strokeStyle = '#263232'; c.lineWidth = Math.max(1, z); c.beginPath(); c.moveTo(p.x + 4 * z, p.y + bob); c.lineTo(p.x + 3 * z, p.y + 5 * z + bob); c.moveTo(p.x + 8 * z, p.y + bob); c.lineTo(p.x + 9 * z, p.y + 5 * z + bob); c.stroke();
    if (selected) { c.strokeStyle = '#ffe28a'; c.beginPath(); c.arc(p.x + 6 * z, p.y - 5 * z, 10 * z, 0, TAU); c.stroke(); }
    if (this.zoom > 1.15 && moving) this.label(p.x, p.y - 29 * z, `${h.sur}家・${v.name}`);
  }

  drawCart(x, y, good, qty) {
    const c = this.ctx, z = this.zoom, gv = GOODS_VIEW[good];
    c.strokeStyle = '#3b2b20'; c.lineWidth = 2.3 * z; c.beginPath(); c.moveTo(x - 21 * z, y - 3 * z); c.lineTo(x + 3 * z, y - 5 * z); c.stroke();
    c.fillStyle = '#8a6039'; c.fillRect(x - 24 * z, y - 13 * z, 21 * z, 10 * z);
    c.strokeStyle = '#3c2b20'; c.strokeRect(x - 24 * z, y - 13 * z, 21 * z, 10 * z);
    this.drawPile(x - 14 * z, y - 13 * z, good, Math.max(1, qty), .62, false);
    c.fillStyle = '#211f1b'; c.beginPath(); c.arc(x - 20 * z, y - 2 * z, 4.5 * z, 0, TAU); c.fill(); c.beginPath(); c.arc(x - 6 * z, y - 2 * z, 4.5 * z, 0, TAU); c.fill();
    c.strokeStyle = '#c99b58'; c.lineWidth = z; c.beginPath(); c.arc(x - 20 * z, y - 2 * z, 2.3 * z, 0, TAU); c.stroke(); c.beginPath(); c.arc(x - 6 * z, y - 2 * z, 2.3 * z, 0, TAU); c.stroke();
    if (this.zoom > .72) this.label(x - 14 * z, y - 31 * z, `${Math.max(1, Math.round(qty))}荷`);
  }

  drawPack(x, y, good) {
    const c = this.ctx, z = this.zoom, gv = GOODS_VIEW[good];
    c.fillStyle = gv?.color || '#b79059'; c.strokeStyle = gv?.edge || '#ead39d'; c.lineWidth = Math.max(1, z);
    c.beginPath(); c.roundRect(x - 7 * z, y - 12 * z, 9 * z, 10 * z, 2 * z); c.fill(); c.stroke();
    c.strokeStyle = '#5b402e'; c.beginPath(); c.arc(x - 2.5 * z, y - 12 * z, 4 * z, Math.PI, TAU); c.stroke();
  }

  dominantCargo(h) {
    if (h.state === 'toMarket' && h.tripCargo) return h.tripCargo;
    if (h.state === 'toHome' && h.returnCargo) return h.returnCargo;
    const primary = JOB_VIEW[h.job]?.output;
    if (primary && h.pantry[primary] > 1) return primary;
    let best = null, qty = 1;
    for (const g of Object.keys(GOODS_VIEW)) if ((h.pantry[g] || 0) > qty) { qty = h.pantry[g]; best = g; }
    return best;
  }

  cargoQty(h) {
    if (h.state === 'toMarket') return h.tripCargoQty || 0;
    if (h.state === 'toHome') return h.returnCargoQty || 0;
    return 0;
  }

  drawPile(x, y, good, qty, scale = 1, showCount = true) {
    const c = this.ctx, z = this.zoom * scale, gv = GOODS_VIEW[good];
    if (!gv) return;
    const stage = qty < 6 ? 1 : qty < 20 ? 2 : qty < 55 ? 3 : 4;
    const n = stage === 1 ? 1 : stage === 2 ? 3 : stage === 3 ? 5 : 8;
    for (let i = 0; i < n; i++) {
      const col = i % Math.min(4, stage + 1), row = Math.floor(i / Math.min(4, stage + 1));
      const px = x + (col - 1.5) * 5 * z + row * 2 * z;
      const py = y - row * 5 * z - (i % 2) * 1.5 * z;
      c.fillStyle = gv.color; c.strokeStyle = '#25221dcc'; c.lineWidth = Math.max(0.8, z);
      if (gv.shape === 'log') {
        c.fillRect(px - 5 * z, py - 3 * z, 11 * z, 4 * z); c.strokeRect(px - 5 * z, py - 3 * z, 11 * z, 4 * z);
        c.fillStyle = gv.edge; c.beginPath(); c.arc(px + 5 * z, py - z, 2 * z, 0, TAU); c.fill();
      } else if (gv.shape === 'barrel') {
        c.fillRect(px - 3 * z, py - 7 * z, 7 * z, 8 * z); c.strokeRect(px - 3 * z, py - 7 * z, 7 * z, 8 * z);
      } else if (gv.shape === 'stone') {
        c.beginPath(); c.arc(px, py - 3 * z, 4 * z, 0, TAU); c.fill(); c.stroke();
      } else {
        c.beginPath(); c.roundRect(px - 4 * z, py - 6 * z, 8 * z, 7 * z, 2 * z); c.fill(); c.stroke();
      }
    }
    if (showCount && qty >= 10 && this.zoom > 0.67) {
      c.fillStyle = '#082225d9'; c.beginPath(); c.roundRect(x + 8 * z, y - 18 * z, 23 * z, 12 * z, 5 * z); c.fill();
      c.fillStyle = gv.edge; c.font = `700 ${Math.max(8, 8 * z)}px sans-serif`; c.textAlign = 'center'; c.fillText(Math.round(qty), x + 19.5 * z, y - 9 * z);
    }
  }

  drawMarketPiles() {
    const w = this.world;
    const totals = [];
    for (const g of Object.keys(GOODS_VIEW)) {
      const q = (w.stalls[g] || []).reduce((s, x) => s + x.qty, 0);
      if (q > 0.8) totals.push([g, q]);
    }
    totals.sort((a, b) => b[1] - a[1]);
    const spots = [[-1.3, 0.5], [-0.3, 1.2], [0.8, 1], [1.4, 0.1], [-1.3, -0.5], [0.9, -0.6]];
    totals.slice(0, 6).forEach(([g, q], i) => {
      const p = this.project(w.market.x + spots[i][0], w.market.y + spots[i][1]);
      this.drawPile(p.x, p.y, g, q, 0.9);
    });
  }

  drawPortPiles(ship) {
    const w = this.world;
    const totals = Object.entries(w.stock || {}).filter(([, q]) => q > 0.8).sort((a, b) => b[1] - a[1]);
    if (ship?.state === 'docked' && ship.cargo) {
      for (const [g, q] of Object.entries(ship.cargo)) if (q > 0) totals.unshift([g, q]);
    }
    const spots = [[-1.4, -0.1], [-0.6, 0.7], [0.4, 0.7], [1.2, 0.1]];
    totals.slice(0, 4).forEach(([g, q], i) => {
      const p = this.project(w.port.x + spots[i][0], w.port.y + spots[i][1]);
      this.drawPile(p.x, p.y, g, q, 0.9);
    });
  }

  drawShip(p, ship) {
    const c = this.ctx, z = this.zoom;
    c.fillStyle = '#523729'; c.beginPath(); c.moveTo(p.x - 34 * z, p.y - 1 * z); c.quadraticCurveTo(p.x, p.y + 19 * z, p.x + 38 * z, p.y - 3 * z); c.lineTo(p.x + 28 * z, p.y + 12 * z); c.quadraticCurveTo(p.x, p.y + 30 * z, p.x - 27 * z, p.y + 10 * z); c.closePath(); c.fill();
    c.strokeStyle = '#d3b270'; c.lineWidth = 2 * z; c.stroke();
    c.strokeStyle = '#5c4430'; c.lineWidth = 3 * z; c.beginPath(); c.moveTo(p.x, p.y + 2 * z); c.lineTo(p.x, p.y - 68 * z); c.stroke();
    const dir = ship.state === 'departing' ? -1 : 1;
    c.fillStyle = '#ddd0aa'; c.beginPath(); c.moveTo(p.x + dir * 2 * z, p.y - 64 * z); c.lineTo(p.x + dir * 37 * z, p.y - 35 * z); c.lineTo(p.x + dir * 3 * z, p.y - 11 * z); c.closePath(); c.fill();
    c.strokeStyle = '#76573c'; c.lineWidth = z; c.stroke();
    c.fillStyle = '#a9523d'; c.fillRect(p.x - z, p.y - 74 * z, dir * 20 * z, 9 * z);
    if (ship.state !== 'docked') {
      c.strokeStyle = '#b2d5d28a'; c.lineWidth = 2 * z;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(p.x - 40 * z - i * 8 * z, p.y + (7 + i * 4) * z); c.lineTo(p.x - 18 * z - i * 7 * z, p.y + (7 + i * 4) * z); c.stroke(); }
    }
  }

  drawRuin(p) {
    const c = this.ctx, z = this.zoom;
    c.fillStyle = '#4b4e49'; c.fillRect(p.x - 11 * z, p.y - 13 * z, 22 * z, 12 * z);
    c.strokeStyle = '#292d2a'; c.strokeRect(p.x - 11 * z, p.y - 13 * z, 22 * z, 12 * z);
    c.beginPath(); c.moveTo(p.x - 9 * z, p.y - 12 * z); c.lineTo(p.x + 7 * z, p.y - 22 * z); c.stroke();
  }

  drawPlacement(view) {
    if (!view.hover || !view.tool) return;
    const [x, y] = view.hover;
    const p = this.project(x, y);
    const ok = view.placementOk !== false;
    const c = this.ctx, z = this.zoom;
    this.diamond(p.x, p.y, ok ? '#8fd59e66' : '#df766866', 0.94, ok ? '#b9efbd' : '#ff9f90');
    if (view.roadAnchor) {
      const a = this.project(...view.roadAnchor);
      c.strokeStyle = '#ffe38b'; c.lineWidth = Math.max(2, 2.5 * z);
      c.beginPath(); c.ellipse(a.x, a.y, 19 * z, 8 * z, 0, 0, TAU); c.stroke();
      if (this.zoom > .65) this.label(a.x, a.y - 15 * z, '始点');
    }
    if (view.tool !== 'road' && view.tool !== 'roadRemove') {
      c.globalAlpha = 0.65;
      this.prism(p.x, p.y, 34, 20, 27, ok ? '#cfb678' : '#9f6d65', '#6f5941', '#58453a');
      c.globalAlpha = 1;
    }
  }

  label(x, y, text) {
    if (this.zoom < 0.56) return;
    const c = this.ctx;
    c.font = `700 ${Math.max(9, 10 * this.zoom)}px sans-serif`;
    const w = c.measureText(text).width + 10;
    c.fillStyle = '#071f21d9'; c.beginPath(); c.roundRect(x - w / 2, y - 12, w, 16, 5); c.fill();
    c.fillStyle = '#f0e5cd'; c.textAlign = 'center'; c.fillText(text, x, y);
  }

  jobColor(job) {
    return { fisher: '#4f91a7', veg: '#6da85a', wheat: '#c2a34e', logger: '#72513a', woodshop: '#a86c43', charburner: '#4e5353', saltworks: '#cbc5af', shepherd: '#9c7d67', rapeseed: '#c6bd4f', quarryman: '#858b8c' }[job] || '#9b7651';
  }

  mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = s => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  }
}
