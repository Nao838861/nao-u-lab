import {
  BUILDING_COLORS, GOODS_ART, GOODS_LABELS, JOB_ICONS, JOB_LABELS, SECTION_LABELS, TERRAIN_COLORS,
} from './config.js?v=v004.10.0-final-polish';
import { islandCalendar } from './ui_summary.js?v=v004.10.0-final-polish';

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
    this.selectedCarrierId = null;
    this.selectedBuildingId = null;
    this.operationPreview = null;
    this.season = '冬';
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
    this.season = islandCalendar(model.day).season;
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
    const seasonWash = {
      '春': 'rgba(214,221,151,.045)',
      '夏': 'rgba(238,202,99,.035)',
      '秋': 'rgba(190,107,61,.055)',
      '冬': 'rgba(204,226,218,.07)',
    }[this.season];
    for (let sum = 0; sum < model.width + model.height - 1; sum += 1) {
      for (let y = 0; y < model.height; y += 1) {
        const x = sum - y;
        if (x < 0 || x >= model.width) continue;
        const tile = model.terrain[y][x];
        const palette = TERRAIN_COLORS[tile.kind] ?? TERRAIN_COLORS.grass;
        const fill = palette[(tile.variant ?? 0) % palette.length];
        this.diamond(x, y, fill, tile.kind === 'water' ? '#1b626a' : '#4f6942');
        if (tile.kind !== 'water') this.diamond(x, y, seasonWash, null, 1);
        if (tile.kind === 'water' && (x * 3 + y + (tile.variant ?? 0)) % 4 === 0) {
          const ctx = this.ctx;
          const from = this.camera.project(x + 0.22, y + 0.46, 1);
          const to = this.camera.project(x + 0.62, y + 0.46, 1);
          ctx.save();
          ctx.globalAlpha = 0.28 + Math.sin(this.pulse * 1.4 + x + y) * 0.06;
          ctx.strokeStyle = '#76b6b0';
          ctx.lineWidth = Math.max(0.7, this.camera.zoom);
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.quadraticCurveTo((from.x + to.x) / 2, from.y - 2 * this.camera.zoom, to.x, to.y);
          ctx.stroke();
          ctx.restore();
        }
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
    const selected = model.buildings.find(building => building.id === this.selectedBuildingId);
    if (selected) {
      this.footprint(
        selected.x, selected.y, selected.width, selected.height,
        '#f2c45d', '#ffe39a', 0.34,
      );
    }
  }

  drawRoads(model) {
    const roadSet = new Set(model.roadKeys);
    const connected = new Set(model.roadConnection?.connectedRoadKeys ?? []);
    const roads = model.roadKeys.map(parseKey);
    for (const [x, y] of roads) {
      const isConnected = connected.has(keyOf(x, y));
      this.diamond(x, y, isConnected ? '#a78e61' : '#9f6355', isConnected ? '#69593f' : '#713f3b', 0.94);
    }
    const ctx = this.ctx;
    ctx.save();
    ctx.lineCap = 'round';
    for (const [x, y] of roads) {
      const center = this.camera.project(x + 0.5, y + 0.5);
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        if (!roadSet.has(keyOf(x + dx, y + dy))) continue;
        const other = this.camera.project(x + dx + 0.5, y + dy + 0.5);
        const segmentConnected = connected.has(keyOf(x, y)) && connected.has(keyOf(x + dx, y + dy));
        ctx.strokeStyle = segmentConnected ? '#69593f' : '#713f3b';
        ctx.lineWidth = Math.max(5, 13 * this.camera.zoom);
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
        ctx.strokeStyle = segmentConnected ? '#b39a6b' : '#bd7867';
        ctx.lineWidth = Math.max(3, 9 * this.camera.zoom);
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawGroundOverlays(model) {
    const roads = new Set(model.roadKeys);
    const ctx = this.ctx;
    for (const trail of model.trailRows) {
      if (roads.has(trail.key)) continue;
      const [x, y] = parseKey(trail.key);
      const from = this.camera.project(x + 0.14, y + 0.48, 1);
      const to = this.camera.project(x + 0.86, y + 0.52, 1);
      ctx.save();
      ctx.globalAlpha = trail.alpha;
      ctx.strokeStyle = '#735b39';
      ctx.lineWidth = Math.max(1, trail.width * this.camera.zoom);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      if (trail.stage >= 4) {
        const crossFrom = this.camera.project(x + 0.48, y + 0.18, 1);
        const crossTo = this.camera.project(x + 0.52, y + 0.82, 1);
        ctx.beginPath();
        ctx.moveTo(crossFrom.x, crossFrom.y);
        ctx.lineTo(crossTo.x, crossTo.y);
        ctx.stroke();
      }
      ctx.restore();
    }
    for (const building of model.buildings) {
      if (!building.entrance) continue;
      const point = this.camera.project(
        building.entrance.x + 0.5,
        building.entrance.y + 0.5,
        2,
      );
      ctx.save();
      const selected = building.id === this.selectedBuildingId;
      ctx.fillStyle = selected ? '#fff0ad' : building.vacant ? '#9b8e77' : '#e5b65b';
      ctx.strokeStyle = selected ? '#f2a93b' : '#443d31';
      ctx.lineWidth = Math.max(selected ? 2 : 1, (selected ? 2 : 1) * this.camera.zoom);
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(selected ? 4 : 2.5, (selected ? 6 : 4) * this.camera.zoom), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    this.drawTrackedRoute(model);
    this.drawConnectionWarnings(model);
    this.drawOperationPreview();
  }

  drawConnectionWarnings(model) {
    const disconnected = new Set((model.roadConnection?.buildings ?? [])
      .filter(row => !row.connected).map(row => row.id));
    const ctx = this.ctx;
    for (const building of model.buildings) {
      if (!disconnected.has(building.id) || !building.entrance) continue;
      const point = this.camera.project(building.entrance.x + 0.5, building.entrance.y + 0.5, 4);
      ctx.save();
      ctx.strokeStyle = '#e26f5d';
      ctx.fillStyle = 'rgba(87,30,28,.82)';
      ctx.lineWidth = Math.max(2, 2.5 * this.camera.zoom);
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(7, 10 * this.camera.zoom), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = `800 ${Math.max(8, 9 * this.camera.zoom)}px ui-sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#442321';
      ctx.fillStyle = '#ffd2bd';
      ctx.strokeText('道が繋がっていません', point.x, point.y - 12 * this.camera.zoom);
      ctx.fillText('道が繋がっていません', point.x, point.y - 12 * this.camera.zoom);
      ctx.restore();
    }
  }

  drawOperationPreview() {
    const preview = this.operationPreview;
    if (!preview) return;
    const ok = preview.ok;
    const fill = ok ? '#d4be62' : '#d45e52';
    const stroke = ok ? '#f4db74' : '#ff8a72';
    const cells = preview.cells?.length ? preview.cells : preview.entrance ? [preview.entrance] : [];
    for (const cell of cells) this.diamond(cell.x, cell.y, fill, stroke, 0.48);
    if (preview.entrance) {
      const point = this.camera.project(preview.entrance.x + 0.5, preview.entrance.y + 0.5, 5);
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = ok ? '#f6d76b' : '#ff7461';
      ctx.strokeStyle = '#342e29';
      ctx.lineWidth = Math.max(1, this.camera.zoom);
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(4, 6 * this.camera.zoom), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  drawTrackedRoute(model) {
    const carrier = model.carriers.find(row => row.id === this.selectedCarrierId);
    if (!carrier?.path?.length) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,219,112,.9)';
    ctx.lineWidth = Math.max(2, 3 * this.camera.zoom);
    ctx.setLineDash([7 * this.camera.zoom, 6 * this.camera.zoom]);
    ctx.beginPath();
    carrier.path.forEach((point, index) => {
      const projected = this.camera.project(point.x + 0.5, point.y + 0.5, 2);
      if (index) ctx.lineTo(projected.x, projected.y);
      else ctx.moveTo(projected.x, projected.y);
    });
    ctx.stroke();
    ctx.restore();
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
      const buildingDepth = building.x + building.width + building.y + building.height;
      drawables.push({
        kind: 'building', data: building,
        depth: buildingDepth,
      });
      building.shelfGroups.slice(0, 3).forEach((row, index) => {
        const column = index % 3;
        drawables.push({
          kind: 'inventory',
          data: {
            row,
            ownerId: building.id,
            x: building.x + building.width - 0.42 - column * 0.62,
            y: building.y + building.height - 0.34,
          },
          depth: buildingDepth + 0.1 + index * 0.001,
        });
      });
    }
    for (const household of model.households) {
      const home = model.buildings.find(building => building.id === household.buildingId);
      if (!home) continue;
      if (household.pantryStock) drawables.push({
        kind: 'inventory',
        data: {
          row: household.pantryStock,
          ownerId: home.id,
          x: home.x + 0.48,
          y: home.y + home.height - 0.35,
        },
        depth: home.x + home.width + home.y + home.height + 0.2,
      });
    }
    const market = model.buildings.find(building => building.type === 'market');
    const marketDepth = market
      ? market.x + market.width + market.y + market.height
      : 0;
    model.marketStalls.forEach((stall, index) => drawables.push({
      kind: 'stall',
      data: stall,
      depth: marketDepth + 0.4 + index * 0.001,
    }));
    for (const carrier of model.carriers) {
      drawables.push({ kind: 'carrier', data: carrier, depth: carrier.x + carrier.y + 1 });
    }
    for (const ship of model.portVisuals ?? []) {
      const position = this.shipPosition(model.portBerth, ship);
      drawables.push({
        kind: 'ship', data: { ...ship, ...position }, depth: position.x + position.y + 1,
      });
    }
    for (const handling of model.handlingVisuals ?? []) {
      const port = model.buildings.find(building => building.type === 'port');
      if (!port || !model.portBerth) continue;
      const yard = { x: port.x + port.width * 0.55, y: port.y + port.height * 0.58 };
      const ship = model.portBerth.dock;
      const start = handling.direction === 'import' ? ship : yard;
      const finish = handling.direction === 'import' ? yard : ship;
      const progress = handling.progress ?? 1;
      const position = {
        x: start.x + (finish.x - start.x) * progress,
        y: start.y + (finish.y - start.y) * progress,
      };
      drawables.push({
        kind: 'handling', data: { ...handling, ...position }, depth: position.x + position.y + 1.2,
      });
    }
    return drawables.sort((left, right) => left.depth - right.depth);
  }

  drawWorldObjects(model) {
    for (const drawable of this.collectWorldDrawables(model)) {
      if (drawable.kind === 'tree') this.drawTree(drawable.data);
      if (drawable.kind === 'rock') this.drawRock(drawable.data);
      if (drawable.kind === 'building') this.drawBuilding(drawable.data);
      if (drawable.kind === 'inventory') this.drawInventoryPile(drawable.data);
      if (drawable.kind === 'stall') this.drawMarketStall(drawable.data);
      if (drawable.kind === 'carrier') this.drawCarrier(drawable.data);
      if (drawable.kind === 'ship') this.drawShip(drawable.data);
      if (drawable.kind === 'handling') this.drawHandlingBlock(drawable.data);
    }
  }

  shipPosition(berth, ship) {
    const progress = Math.max(0, Math.min(1, ship.progress ?? 1));
    const from = ship.phase === 'departing' ? berth.dock : berth.away;
    const to = ship.phase === 'departing' ? berth.away : berth.dock;
    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  }

  drawTree({ x, y, variant = 0 }) {
    const base = this.camera.project(x + 0.5, y + 0.5);
    const scale = this.camera.zoom * (0.84 + variant * 0.04);
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#172d2a';
    ctx.beginPath();
    ctx.ellipse(base.x + 8 * scale, base.y + 1 * scale, 18 * scale, 6 * scale, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#4b3022';
    ctx.fillRect(base.x - 2 * scale, base.y - 21 * scale, 4 * scale, 22 * scale);
    const seasonal = this.season === '秋'
      ? ['#5a5230', '#71613a', '#8a7443']
      : this.season === '冬'
        ? ['#28493e', '#35594a', '#466957']
        : ['#254f3c', '#2f6144', '#3d714b'];
    if (variant % 4 === 3) {
      for (const crown of [
        { x: -7, y: -30, r: 14, color: seasonal[1] },
        { x: 7, y: -31, r: 15, color: seasonal[2] },
        { x: 0, y: -43, r: 15, color: seasonal[0] },
      ]) {
        ctx.beginPath();
        ctx.arc(base.x + crown.x * scale, base.y + crown.y * scale, crown.r * scale, 0, Math.PI * 2);
        ctx.fillStyle = crown.color;
        ctx.fill();
        ctx.strokeStyle = '#173b32';
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    for (const layer of [
      { y: -45, width: 16, color: seasonal[0] },
      { y: -34, width: 21, color: seasonal[1] },
      { y: -23, width: 25, color: seasonal[2] },
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
    const appearance = building.appearance;
    const farm = ['farm', 'pasture'].includes(appearance.archetype);
    const market = appearance.archetype === 'market';
    const inset = market ? 1.55 : farm ? 0.45 : Math.min(0.4, Math.min(building.width, building.height) * 0.1);
    const bodyWidth = market ? Math.max(1.2, building.width - inset * 2)
      : farm ? Math.min(1.55 + appearance.tier * 0.12, building.width - 0.8)
        : building.width - inset * 2;
    const bodyHeight = market ? Math.max(1.2, building.height - inset * 2)
      : farm ? Math.min(1.45 + appearance.tier * 0.12, building.height - 0.8)
        : building.height - inset * 2;
    const bodyX = building.x + inset;
    const bodyY = building.y + inset;
    const elevation = appearance.elevation;
    const ctx = this.ctx;
    ctx.save();
    if (building.vacant) ctx.globalAlpha = 0.58;
    if (farm) {
      ctx.strokeStyle = appearance.accent;
      ctx.lineWidth = Math.max(1, 1.2 * this.camera.zoom);
      for (let row = 1; row <= 4; row += 1) {
        const from = this.camera.project(building.x + 0.3, building.y + 0.35 + row * 0.62, 2);
        const to = this.camera.project(building.x + building.width - 0.3, building.y + 0.35 + row * 0.62, 2);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
    if (appearance.stoneBase) {
      this.prism(bodyX - 0.08, bodyY - 0.08, bodyWidth + 0.16, bodyHeight + 0.16, 6, {
        top: '#9a9589', right: '#6f6c65', left: '#5c5b57',
      });
    }
    this.prism(
      bodyX,
      bodyY,
      bodyWidth,
      bodyHeight,
      elevation,
      {
        top: appearance.roof ?? colors[2],
        right: appearance.wall ?? colors[0],
        left: colors[1],
      },
    );
    if (!['market', 'pit'].includes(appearance.archetype)) {
      this.drawGabledRoof(bodyX, bodyY, bodyWidth, bodyHeight, elevation, appearance);
    }
    if (['kiln', 'industrial'].includes(appearance.archetype)) {
      const chimney = this.camera.project(bodyX + bodyWidth * 0.72, bodyY + bodyHeight * 0.3, elevation);
      ctx.fillStyle = appearance.archetype === 'industrial' ? '#4a403a' : '#3d413d';
      ctx.fillRect(chimney.x - 3 * this.camera.zoom, chimney.y - 24 * this.camera.zoom, 6 * this.camera.zoom, 25 * this.camera.zoom);
      if (!building.vacant) {
        ctx.globalAlpha *= 0.28 + Math.sin(this.pulse * 1.7) * 0.06;
        ctx.fillStyle = '#c3c1b3';
        ctx.beginPath();
        ctx.arc(chimney.x, chimney.y - 29 * this.camera.zoom, 6 * this.camera.zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (appearance.windows > 0) {
      const base = this.camera.project(bodyX + bodyWidth, bodyY + bodyHeight * 0.58, elevation * 0.48);
      for (let index = 0; index < appearance.windows; index += 1) {
        ctx.fillStyle = '#e6c673';
        ctx.fillRect(base.x - index * 8 * this.camera.zoom, base.y, 4 * this.camera.zoom, 5 * this.camera.zoom);
      }
    }
    if (building.type === 'port') {
      this.drawCrane(building.x + building.width * 0.72, building.y + building.height * 0.78);
    }
    this.drawBuildingProps(building);
    ctx.restore();
    const labelPoint = this.camera.project(
      building.x + building.width / 2,
      building.y + building.height / 2,
      elevation + 8,
    );
    ctx.save();
    ctx.textAlign = 'center';
    const typeLabel = JOB_LABELS[building.type] ?? building.type;
    const label = building.vacant
      ? `${typeLabel}・空き`
      : `${typeLabel}${appearance.level ? ` Lv${appearance.level}` : ''}`;
    const icon = building.vacant ? '空' : (JOB_ICONS[building.type] ?? '?');
    const badgeRadius = Math.max(8, 10 * this.camera.zoom);
    ctx.fillStyle = building.id === this.selectedBuildingId ? '#f4c95f'
      : building.vacant ? '#746f62' : '#183f3d';
    ctx.strokeStyle = building.id === this.selectedBuildingId ? '#fff0ad' : '#e2c67f';
    ctx.lineWidth = Math.max(1.2, 1.5 * this.camera.zoom);
    ctx.beginPath();
    ctx.arc(labelPoint.x, labelPoint.y - 3 * this.camera.zoom, badgeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = `800 ${Math.max(9, 10 * this.camera.zoom)}px "Yu Gothic", sans-serif`;
    ctx.fillStyle = '#fff3cf';
    ctx.fillText(icon, labelPoint.x, labelPoint.y + 0.5 * this.camera.zoom);
    if (this.camera.zoom >= 1.02 || building.id === this.selectedBuildingId || building.vacant) {
      ctx.font = `700 ${Math.max(9, 10 * this.camera.zoom)}px "Yu Gothic", sans-serif`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(19,39,42,.84)';
      ctx.fillStyle = '#f6e9c8';
      ctx.strokeText(label, labelPoint.x, labelPoint.y + 18 * this.camera.zoom);
      ctx.fillText(label, labelPoint.x, labelPoint.y + 18 * this.camera.zoom);
    }
    ctx.restore();
  }

  drawGabledRoof(x, y, width, height, elevation, appearance) {
    const ctx = this.ctx;
    const lift = 7 + appearance.tier * 1.5;
    const top = [
      this.camera.project(x, y, elevation),
      this.camera.project(x + width, y, elevation),
      this.camera.project(x + width, y + height, elevation),
      this.camera.project(x, y + height, elevation),
    ];
    const ridgeA = this.camera.project(x, y + height / 2, elevation + lift);
    const ridgeB = this.camera.project(x + width, y + height / 2, elevation + lift);
    const plane = (points, fill) => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = '#3c3a32';
      ctx.lineWidth = Math.max(1, 1.2 * this.camera.zoom);
      ctx.stroke();
    };
    plane([top[0], top[1], ridgeB, ridgeA], appearance.roof);
    plane([ridgeA, ridgeB, top[2], top[3]], appearance.accent);
    if (this.season === '冬') {
      ctx.strokeStyle = 'rgba(224,236,224,.55)';
      ctx.lineWidth = Math.max(1, 2 * this.camera.zoom);
      ctx.beginPath();
      ctx.moveTo(ridgeA.x, ridgeA.y - this.camera.zoom);
      ctx.lineTo(ridgeB.x, ridgeB.y - this.camera.zoom);
      ctx.stroke();
    }
  }

  drawBuildingProps(building) {
    const { archetype, accent } = building.appearance;
    const ctx = this.ctx;
    const scale = this.camera.zoom;
    const point = this.camera.project(
      building.x + building.width * 0.23,
      building.y + building.height * 0.76,
      5,
    );
    if (['workshop', 'warehouse'].includes(archetype)) {
      ctx.strokeStyle = '#4f3525';
      ctx.lineWidth = Math.max(2, 4 * scale);
      for (let row = 0; row < 3; row += 1) {
        ctx.beginPath();
        ctx.moveTo(point.x - 10 * scale, point.y - row * 5 * scale);
        ctx.lineTo(point.x + 10 * scale, point.y - 4 * scale - row * 5 * scale);
        ctx.stroke();
      }
    } else if (['pit', 'industrial'].includes(archetype)) {
      ctx.fillStyle = archetype === 'industrial' ? '#d56d3d' : '#898476';
      for (const [dx, dy, radius] of [[-7, 0, 5], [2, -4, 6], [9, 1, 4]]) {
        ctx.beginPath();
        ctx.arc(point.x + dx * scale, point.y + dy * scale, radius * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4e4d47';
        ctx.stroke();
      }
    } else if (archetype === 'coastal') {
      ctx.strokeStyle = '#8fc0b5';
      ctx.lineWidth = Math.max(1, 1.2 * scale);
      ctx.beginPath();
      ctx.arc(point.x, point.y - 5 * scale, 11 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(point.x - 8 * scale, point.y - 13 * scale);
      ctx.lineTo(point.x + 8 * scale, point.y + 3 * scale);
      ctx.moveTo(point.x + 8 * scale, point.y - 13 * scale);
      ctx.lineTo(point.x - 8 * scale, point.y + 3 * scale);
      ctx.stroke();
    } else if (archetype === 'works') {
      ctx.fillStyle = 'rgba(225,236,220,.72)';
      ctx.strokeStyle = '#a5b7aa';
      ctx.fillRect(point.x - 12 * scale, point.y - 8 * scale, 24 * scale, 10 * scale);
      ctx.strokeRect(point.x - 12 * scale, point.y - 8 * scale, 24 * scale, 10 * scale);
    } else if (archetype === 'market') {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(point.x - 13 * scale, point.y - 13 * scale);
      ctx.lineTo(point.x + 13 * scale, point.y - 13 * scale);
      ctx.lineTo(point.x + 9 * scale, point.y - 5 * scale);
      ctx.lineTo(point.x - 9 * scale, point.y - 5 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#493d30';
      ctx.stroke();
    }
  }

  drawInventoryPile({ row, ownerId, x, y }) {
    const point = this.camera.project(x, y, 5);
    const scale = this.camera.zoom;
    const ctx = this.ctx;
    ctx.save();
    for (let index = 0; index < row.visual.spriteCount; index += 1) {
      const spriteX = point.x + (index % 3) * 5 * scale - 5 * scale;
      const spriteY = point.y - Math.floor(index / 3) * 5 * scale - index * 1.4 * scale;
      this.drawGoodsSprite(row.visual.art, spriteX, spriteY, scale * 0.72);
    }
    if (scale >= 1.02 || ownerId === this.selectedBuildingId) {
      const text = `${SECTION_LABELS[row.section] ?? row.section}${row.visual.label}`;
      ctx.font = `700 ${Math.max(7, 8 * scale)}px ui-sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(21,35,35,.88)';
      ctx.fillStyle = '#f1e4c2';
      ctx.strokeText(text, point.x, point.y + 9 * scale);
      ctx.fillText(text, point.x, point.y + 9 * scale);
    }
    ctx.restore();
  }

  drawGoodsSprite(art, x, y, scale) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = art.color;
    ctx.strokeStyle = art.dark;
    ctx.lineWidth = Math.max(1, scale);
    if (art.shape === 'round') {
      ctx.beginPath();
      ctx.ellipse(x, y, 6 * scale, 2.7 * scale, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 4.5 * scale, y - 0.8 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.stroke();
    } else if (art.shape === 'rock') {
      ctx.beginPath();
      ctx.moveTo(x - 5 * scale, y + 2 * scale);
      ctx.lineTo(x - 2 * scale, y - 4 * scale);
      ctx.lineTo(x + 4 * scale, y - 3 * scale);
      ctx.lineTo(x + 6 * scale, y + 2 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (art.shape === 'sack') {
      ctx.beginPath();
      ctx.ellipse(x, y, 4.5 * scale, 5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(x - 5 * scale, y - 4 * scale, 10 * scale, art.shape === 'bar' ? 3 * scale : 8 * scale);
      ctx.strokeRect(x - 5 * scale, y - 4 * scale, 10 * scale, art.shape === 'bar' ? 3 * scale : 8 * scale);
    }
    ctx.restore();
  }

  drawMarketStall(stall) {
    const point = this.camera.project(stall.x, stall.y, 3);
    const scale = this.camera.zoom;
    const primary = stall.items[0];
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = stall.householdId % 2 ? '#b75d4f' : '#d2a34d';
    ctx.strokeStyle = '#463b32';
    ctx.lineWidth = Math.max(1, scale);
    ctx.beginPath();
    ctx.moveTo(point.x - 8 * scale, point.y - 10 * scale);
    ctx.lineTo(point.x + 8 * scale, point.y - 10 * scale);
    ctx.lineTo(point.x + 5 * scale, point.y - 3 * scale);
    ctx.lineTo(point.x - 5 * scale, point.y - 3 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (primary) this.drawGoodsSprite(primary.visual.art, point.x, point.y, scale * 0.65);
    if (scale >= 1.02 || this.selectedBuildingId !== null) {
      ctx.font = `700 ${Math.max(8, 8.5 * scale)}px ui-sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#253331';
      ctx.fillStyle = '#f1e4c2';
      const label = `#${stall.householdId} ${Math.round(stall.totalAmount * 10) / 10}`;
      ctx.strokeText(label, point.x, point.y + 11 * scale);
      ctx.fillText(label, point.x, point.y + 11 * scale);
    }
    ctx.restore();
  }

  drawCrane(x, y) {
    const point = this.camera.project(x, y, 4);
    const scale = this.camera.zoom;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#4f3928';
    ctx.lineWidth = Math.max(2, 4 * scale);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x, point.y - 48 * scale);
    ctx.lineTo(point.x + 29 * scale, point.y - 39 * scale);
    ctx.stroke();
    ctx.strokeStyle = '#252d2c';
    ctx.lineWidth = Math.max(1, 1.4 * scale);
    ctx.beginPath();
    ctx.moveTo(point.x + 27 * scale, point.y - 39 * scale);
    ctx.lineTo(point.x + 27 * scale, point.y - 12 * scale);
    ctx.stroke();
    ctx.restore();
  }

  drawShip(ship) {
    const point = this.camera.project(ship.x, ship.y, 2);
    const scale = this.camera.zoom;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#302a27';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.fillStyle = '#6d3f2e';
    ctx.beginPath();
    ctx.moveTo(point.x - 38 * scale, point.y - 4 * scale);
    ctx.lineTo(point.x + 42 * scale, point.y - 12 * scale);
    ctx.lineTo(point.x + 29 * scale, point.y + 12 * scale);
    ctx.lineTo(point.x - 27 * scale, point.y + 16 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d9c79d';
    ctx.beginPath();
    ctx.moveTo(point.x + 2 * scale, point.y - 70 * scale);
    ctx.lineTo(point.x + 32 * scale, point.y - 31 * scale);
    ctx.lineTo(point.x + 2 * scale, point.y - 25 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x - 3 * scale, point.y - 61 * scale);
    ctx.lineTo(point.x - 29 * scale, point.y - 33 * scale);
    ctx.lineTo(point.x - 3 * scale, point.y - 27 * scale);
    ctx.closePath();
    ctx.fillStyle = '#b95b47';
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#3a3028';
    ctx.lineWidth = Math.max(2, 3 * scale);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y - 5 * scale);
    ctx.lineTo(point.x, point.y - 74 * scale);
    ctx.stroke();
    ctx.fillStyle = '#e4bd58';
    ctx.fillRect(point.x + 2 * scale, point.y - 72 * scale, 14 * scale, 6 * scale);
    const cargo = pileLabel(ship.vesselCargo ?? 0);
    ctx.font = `700 ${Math.max(8, 9 * scale)}px ui-sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#263333';
    ctx.fillStyle = '#f1e4c2';
    const phase = ship.phase === 'approaching' ? '入港' : ship.phase === 'departing' ? '出港' : '接岸';
    const label = `${phase} ${GOODS_LABELS[ship.goods] ?? ship.goods} ${cargo}`;
    ctx.strokeText(label, point.x, point.y + 27 * scale);
    ctx.fillText(label, point.x, point.y + 27 * scale);
    ctx.restore();
  }

  drawHandlingBlock(handling) {
    const point = this.camera.project(handling.x, handling.y, 17);
    const scale = this.camera.zoom;
    const art = GOODS_ART[handling.goods] ?? { color: '#d19a50', dark: '#715236', shape: 'crate' };
    this.drawGoodsSprite(art, point.x, point.y, scale * 0.82);
    const ctx = this.ctx;
    ctx.save();
    ctx.font = `800 ${Math.max(8, 9 * scale)}px ui-sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#263333';
    ctx.fillStyle = '#f6d784';
    const label = `1荷 ${pileLabel(handling.qty)}`;
    ctx.strokeText(label, point.x, point.y - 9 * scale);
    ctx.fillText(label, point.x, point.y - 9 * scale);
    ctx.restore();
  }

  drawCarrier(carrier) {
    const point = this.camera.project(carrier.x + 0.5, carrier.y + 0.5, 4);
    const scale = this.camera.zoom;
    const ctx = this.ctx;
    ctx.save();
    if (carrier.id === this.selectedCarrierId) {
      ctx.globalAlpha = 0.35 + Math.sin(this.pulse * 5) * 0.12;
      ctx.fillStyle = '#f6d76b';
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8 * scale, 18 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (carrier.kind === 'cart') {
      const personX = point.x - 18 * scale;
      const personY = point.y - 18 * scale;
      ctx.fillStyle = '#c98b58';
      ctx.beginPath();
      ctx.arc(personX, personY - 7 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#527c72';
      ctx.fillRect(personX - 4 * scale, personY - 3 * scale, 8 * scale, 11 * scale);
      ctx.strokeStyle = '#d5b48a';
      ctx.lineWidth = Math.max(1, 1.8 * scale);
      ctx.beginPath();
      ctx.moveTo(personX + 2 * scale, personY - 1 * scale);
      ctx.lineTo(point.x - 9 * scale, point.y - 10 * scale);
      ctx.stroke();
      ctx.fillStyle = '#6c472e';
      ctx.strokeStyle = '#292a28';
      ctx.beginPath();
      ctx.moveTo(point.x - 10 * scale, point.y - 11 * scale);
      ctx.lineTo(point.x + 9 * scale, point.y - 15 * scale);
      ctx.lineTo(point.x + 11 * scale, point.y - 5 * scale);
      ctx.lineTo(point.x - 8 * scale, point.y - 2 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#252a29';
      ctx.beginPath();
      ctx.arc(point.x - 6 * scale, point.y, 4 * scale, 0, Math.PI * 2);
      ctx.arc(point.x + 8 * scale, point.y - 3 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      if (carrier.goods) {
        const art = GOODS_ART[carrier.goods] ?? GOODS_ART.tools;
        this.drawGoodsSprite(art, point.x, point.y - 13 * scale, scale * 0.62);
      }
    } else {
      const count = Math.max(1, Math.min(5, carrier.members ?? carrier.people ?? 1));
      for (let index = count - 1; index >= 0; index -= 1) {
        const offsetX = index * 5 * scale;
        const offsetY = index * 3 * scale;
        const bob = Math.sin(this.pulse * 7 + carrier.x + index) * scale;
        ctx.fillStyle = '#d6b087';
        ctx.beginPath();
        ctx.arc(point.x + offsetX, point.y - 13 * scale + offsetY + bob, 3.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = index === 0 ? '#426b64' : '#6a7660';
        ctx.fillRect(point.x - 3 * scale + offsetX, point.y - 10 * scale + offsetY + bob, 6 * scale, 10 * scale);
      }
    }
    ctx.restore();
  }

  hitTestCarrier(model, screenX, screenY) {
    let selected = null;
    let nearest = Infinity;
    for (const carrier of model.carriers) {
      const point = this.camera.project(carrier.x + 0.5, carrier.y + 0.5, 4);
      const distance = Math.hypot(screenX - point.x, screenY - (point.y - 8 * this.camera.zoom));
      const radius = Math.max(12, 20 * this.camera.zoom);
      if (distance <= radius && distance < nearest) {
        selected = carrier;
        nearest = distance;
      }
    }
    return selected;
  }

  hitTestBuilding(model, screenX, screenY) {
    const pointInPolygon = (point, polygon) => {
      let inside = false;
      for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current, current += 1) {
        const a = polygon[current];
        const b = polygon[previous];
        if ((a.y > point.y) !== (b.y > point.y)
          && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
      }
      return inside;
    };
    const point = { x: screenX, y: screenY };
    const frontToBack = [...model.buildings].sort((left, right) => (
      right.x + right.width + right.y + right.height
      - (left.x + left.width + left.y + left.height)
    ));
    for (const building of frontToBack) {
      const elevation = Math.max(4, building.appearance?.elevation ?? 12);
      const base = [
        this.camera.project(building.x, building.y),
        this.camera.project(building.x + building.width, building.y),
        this.camera.project(building.x + building.width, building.y + building.height),
        this.camera.project(building.x, building.y + building.height),
      ];
      const top = [
        this.camera.project(building.x, building.y, elevation),
        this.camera.project(building.x + building.width, building.y, elevation),
        this.camera.project(building.x + building.width, building.y + building.height, elevation),
        this.camera.project(building.x, building.y + building.height, elevation),
      ];
      const faces = [base, top, [top[1], base[1], base[2], top[2]], [top[2], base[2], base[3], top[3]]];
      if (faces.some(face => pointInPolygon(point, face))) return building;
    }
    return null;
  }
}

function pileLabel(value) {
  const rounded = Math.round(Math.max(0, value) * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}
