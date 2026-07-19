import { BUILDING_COLORS, JOB_LABELS, TERRAIN_COLORS } from './config.js';

function keyOf(x, y) {
  return `${x},${y}`;
}

function parseKey(key) {
  return key.split(',').map(Number);
}

export class Renderer {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = camera;
    this.width = 1;
    this.height = 1;
    this.pulse = 0;
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
    this.camera.resize(this.width, this.height);
  }

  diamond(x, y, fill, stroke = null, alpha = 1) {
    const corners = [
      this.camera.project(x, y),
      this.camera.project(x + 1, y),
      this.camera.project(x + 1, y + 1),
      this.camera.project(x, y + 1),
    ];
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let index = 1; index < corners.length; index += 1) {
      ctx.lineTo(corners[index].x, corners[index].y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(0.7, this.camera.zoom);
      ctx.stroke();
    }
    ctx.restore();
  }

  footprint(x, y, width, height, fill, stroke, alpha = 1) {
    const corners = [
      this.camera.project(x, y),
      this.camera.project(x + width, y),
      this.camera.project(x + width, y + height),
      this.camera.project(x, y + height),
    ];
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let index = 1; index < corners.length; index += 1) {
      ctx.lineTo(corners[index].x, corners[index].y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(1, 1.4 * this.camera.zoom);
    ctx.stroke();
    ctx.restore();
  }

  prism(x, y, width, height, elevation, palette) {
    const base = [
      this.camera.project(x, y), this.camera.project(x + width, y),
      this.camera.project(x + width, y + height), this.camera.project(x, y + height),
    ];
    const top = [
      this.camera.project(x, y, elevation), this.camera.project(x + width, y, elevation),
      this.camera.project(x + width, y + height, elevation), this.camera.project(x, y + height, elevation),
    ];
    const ctx = this.ctx;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1, 1.3 * this.camera.zoom);
    ctx.strokeStyle = '#293433';
    ctx.beginPath();
    ctx.moveTo(top[1].x, top[1].y);
    ctx.lineTo(base[1].x, base[1].y);
    ctx.lineTo(base[2].x, base[2].y);
    ctx.lineTo(top[2].x, top[2].y);
    ctx.closePath();
    ctx.fillStyle = palette.right;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(top[2].x, top[2].y);
    ctx.lineTo(base[2].x, base[2].y);
    ctx.lineTo(base[3].x, base[3].y);
    ctx.lineTo(top[3].x, top[3].y);
    ctx.closePath();
    ctx.fillStyle = palette.left;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(top[0].x, top[0].y);
    for (let index = 1; index < top.length; index += 1) ctx.lineTo(top[index].x, top[index].y);
    ctx.closePath();
    ctx.fillStyle = palette.top;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  render(model, elapsedSeconds = 0) {
    this.pulse += elapsedSeconds;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#173f43');
    gradient.addColorStop(1, '#0d2930');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // 地面要素は3Dソートへ混ぜない。建物敷地の後に道路を描く。
    this.drawTerrain(model);
    this.drawBuildingGrounds(model);
    this.drawRoads(model);
    this.drawGroundOverlays(model);
    this.drawWorldObjects(model);
  }

  drawTerrain(model) {
    for (let sum = 0; sum < model.width + model.height - 1; sum += 1) {
      for (let y = 0; y < model.height; y += 1) {
        const x = sum - y;
        if (x < 0 || x >= model.width) continue;
        const tile = model.terrain[y][x];
        const palette = TERRAIN_COLORS[tile.kind] ?? TERRAIN_COLORS.grass;
        const fill = palette[(tile.variant ?? 0) % palette.length];
        this.diamond(x, y, fill, tile.kind === 'water' ? '#1b626a' : '#4f6942');
      }
    }
  }

  drawBuildingGrounds(model) {
    for (const building of model.buildings) {
      const fill = building.type === 'port' ? '#887b68'
        : building.type === 'market' ? '#b59d72' : '#6f784f';
      this.footprint(
        building.x, building.y, building.width, building.height,
        fill, '#455344', 0.9,
      );
    }
  }

  drawRoads(model) {
    const roadSet = new Set(model.roadKeys);
    const roads = model.roadKeys.map(parseKey);
    for (const [x, y] of roads) this.diamond(x, y, '#a78e61', '#69593f', 0.94);
    const ctx = this.ctx;
    ctx.save();
    ctx.lineCap = 'round';
    for (const [x, y] of roads) {
      const center = this.camera.project(x + 0.5, y + 0.5);
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        if (!roadSet.has(keyOf(x + dx, y + dy))) continue;
        const other = this.camera.project(x + dx + 0.5, y + dy + 0.5);
        ctx.strokeStyle = '#69593f';
        ctx.lineWidth = Math.max(5, 13 * this.camera.zoom);
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
        ctx.strokeStyle = '#b39a6b';
        ctx.lineWidth = Math.max(3, 9 * this.camera.zoom);
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawGroundOverlays() {
    // 獣道・配置カーソルは後続段でここへ追加し、3Dソートの前に描く。
  }

  collectWorldDrawables(model) {
    const occupied = new Set(model.occupiedKeys);
    const drawables = [];
    for (let y = 0; y < model.height; y += 1) {
      for (let x = 0; x < model.width; x += 1) {
        if (occupied.has(keyOf(x, y))) continue;
        const tile = model.terrain[y][x];
        if (tile.kind === 'forest') {
          drawables.push({ kind: 'tree', data: { x, y, variant: tile.variant }, depth: x + y + 1 });
        } else if (['rock', 'ore', 'coal'].includes(tile.kind) && (x + y) % 2 === 0) {
          drawables.push({ kind: 'rock', data: { x, y, type: tile.kind }, depth: x + y + 1 });
        }
      }
    }
    for (const building of model.buildings) {
      drawables.push({
        kind: 'building', data: building,
        depth: building.x + building.width + building.y + building.height,
      });
    }
    for (const carrier of model.carriers) {
      drawables.push({ kind: 'carrier', data: carrier, depth: carrier.x + carrier.y + 1 });
    }
    return drawables.sort((left, right) => left.depth - right.depth);
  }

  drawWorldObjects(model) {
    for (const drawable of this.collectWorldDrawables(model)) {
      if (drawable.kind === 'tree') this.drawTree(drawable.data);
      if (drawable.kind === 'rock') this.drawRock(drawable.data);
      if (drawable.kind === 'building') this.drawBuilding(drawable.data);
      if (drawable.kind === 'carrier') this.drawCarrier(drawable.data);
    }
  }

  drawTree({ x, y, variant = 0 }) {
    const base = this.camera.project(x + 0.5, y + 0.5);
    const scale = this.camera.zoom * (0.84 + variant * 0.04);
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#4b3022';
    ctx.fillRect(base.x - 2 * scale, base.y - 21 * scale, 4 * scale, 22 * scale);
    for (const layer of [
      { y: -45, width: 16, color: '#254f3c' },
      { y: -34, width: 21, color: '#2f6144' },
      { y: -23, width: 25, color: '#3d714b' },
    ]) {
      ctx.beginPath();
      ctx.moveTo(base.x, base.y + layer.y * scale);
      ctx.lineTo(base.x + layer.width * scale, base.y + (layer.y + 22) * scale);
      ctx.lineTo(base.x - layer.width * scale, base.y + (layer.y + 22) * scale);
      ctx.closePath();
      ctx.fillStyle = layer.color;
      ctx.fill();
      ctx.strokeStyle = '#173b32';
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRock({ x, y, type }) {
    const point = this.camera.project(x + 0.5, y + 0.55);
    const scale = 7 * this.camera.zoom;
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(point.x - scale, point.y);
    ctx.lineTo(point.x - scale * 0.4, point.y - scale);
    ctx.lineTo(point.x + scale * 0.55, point.y - scale * 0.7);
    ctx.lineTo(point.x + scale, point.y);
    ctx.closePath();
    ctx.fillStyle = type === 'coal' ? '#424744' : type === 'ore' ? '#8a6b5b' : '#8f9386';
    ctx.fill();
    ctx.strokeStyle = '#535b55';
    ctx.stroke();
    ctx.restore();
  }

  drawBuilding(building) {
    const colors = BUILDING_COLORS[building.type] ?? BUILDING_COLORS.default;
    const inset = Math.min(0.4, Math.min(building.width, building.height) * 0.1);
    const elevation = 19 + Math.min(4, building.grade) * 3;
    this.prism(
      building.x + inset,
      building.y + inset,
      building.width - inset * 2,
      building.height - inset * 2,
      elevation,
      { top: colors[2], right: colors[0], left: colors[1] },
    );
    const labelPoint = this.camera.project(
      building.x + building.width / 2,
      building.y + building.height / 2,
      elevation + 8,
    );
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `700 ${Math.max(9, 10 * this.camera.zoom)}px "Yu Gothic", sans-serif`;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(19,39,42,.8)';
    ctx.fillStyle = '#f1e4c2';
    const label = JOB_LABELS[building.type] ?? building.type;
    ctx.strokeText(label, labelPoint.x, labelPoint.y);
    ctx.fillText(label, labelPoint.x, labelPoint.y);
    ctx.restore();
    this.drawShelfHint(building);
  }

  drawShelfHint(building) {
    if (!(building.shelfAmount > 0)) return;
    const count = Math.min(4, Math.ceil(Math.log2(building.shelfAmount + 1)));
    const point = this.camera.project(
      building.x + building.width - 0.35,
      building.y + building.height - 0.35,
      4,
    );
    const scale = this.camera.zoom;
    const ctx = this.ctx;
    ctx.save();
    for (let index = 0; index < count; index += 1) {
      ctx.fillStyle = index % 2 ? '#c9974d' : '#a56c38';
      ctx.fillRect(
        point.x - 10 * scale + index * 4 * scale,
        point.y - 5 * scale - index * 3 * scale,
        10 * scale,
        6 * scale,
      );
    }
    ctx.restore();
  }

  drawCarrier(carrier) {
    const point = this.camera.project(carrier.x + 0.5, carrier.y + 0.5, 4);
    const scale = this.camera.zoom;
    const ctx = this.ctx;
    ctx.save();
    if (carrier.kind === 'cart') {
      ctx.fillStyle = '#6c472e';
      ctx.fillRect(point.x - 10 * scale, point.y - 11 * scale, 20 * scale, 10 * scale);
      ctx.fillStyle = '#252a29';
      ctx.beginPath();
      ctx.arc(point.x - 6 * scale, point.y, 4 * scale, 0, Math.PI * 2);
      ctx.arc(point.x + 7 * scale, point.y, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const bob = Math.sin(this.pulse * 7 + carrier.x) * scale;
      ctx.fillStyle = '#d6b087';
      ctx.beginPath();
      ctx.arc(point.x, point.y - 13 * scale + bob, 3.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#426b64';
      ctx.fillRect(point.x - 3 * scale, point.y - 10 * scale + bob, 6 * scale, 10 * scale);
    }
    ctx.restore();
  }
}
