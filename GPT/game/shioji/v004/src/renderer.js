import {
  BUILDING_COLORS, GOODS_ART, GOODS_LABELS, JOB_ICONS, JOB_LABELS, TERRAIN_COLORS,
} from './config.js?v=v004.37.0-multi-market';
import { drawGoodsSpriteCanvas } from './goods_sprites.js?v=v004.37.0-multi-market';
import { islandCalendar } from './ui_summary.js?v=v004.37.0-multi-market';
import { compileRenderScene, mergeDrawables } from './render_scene.js?v=v004.37.0-multi-market';
import {
  buildingStructureLayout, pileVisual, seasonalPlotVisual,
} from './visuals.js?v=v004.37.0-multi-market';

const MAX_TERRAIN_CACHE_PIXELS = 12_000_000;

function freshnessArt(visual) {
  const art = visual?.art;
  const stage = visual?.freshness?.stage;
  if (!art || !['aging', 'spoiling'].includes(stage)) return art;
  return stage === 'spoiling'
    ? {
      ...art, color: '#756b55', dark: '#443f35', light: '#9c9278', accent: '#625b48',
    }
    : {
      ...art, color: '#9a8758', dark: '#665538', light: '#bca86f', accent: '#7d704d',
    };
}

function carrierCargoSprites(carrier, limit) {
  const rows = carrier.cargoRows?.length
    ? carrier.cargoRows
    : carrier.goods ? [{ goods: carrier.goods, amount: carrier.amount }] : [];
  const sprites = [];
  for (const row of rows) {
    const count = Math.max(1, Math.ceil(row.amount ?? 0));
    for (let index = 0; index < count && sprites.length < limit; index += 1) {
      sprites.push(row.goods);
    }
    if (sprites.length >= limit) break;
  }
  return sprites;
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
    this.focusMarker = null;
    this.operationPreview = null;
    this.season = '冬';
    this.backgroundGradient = null;
    this.terrainCache = null;
    this.frameBounds = null;
    this.lastFrameMetrics = {};
    this.resize();
  }

  markBuilding(buildingId, durationSeconds = 5) {
    this.focusMarker = buildingId === null
      ? null
      : { buildingId, until: this.pulse + durationSeconds };
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
    this.backgroundGradient = null;
    this.terrainCache = null;
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

  sceneFor(model) {
    return model.renderScene ?? compileRenderScene(model);
  }

  boundsVisible({ x, y, width = 1, height = 1 }) {
    const bounds = this.frameBounds;
    if (!bounds) return true;
    return x + width >= bounds.minX
      && x <= bounds.maxX + 1
      && y + height >= bounds.minY
      && y <= bounds.maxY + 1;
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
    this.frameBounds = this.camera.visibleWorldBounds(4);
    this.lastFrameMetrics = {};
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    if (!this.backgroundGradient) {
      this.backgroundGradient = ctx.createLinearGradient(0, 0, 0, this.height);
      this.backgroundGradient.addColorStop(0, '#173f43');
      this.backgroundGradient.addColorStop(1, '#0d2930');
    }
    ctx.fillStyle = this.backgroundGradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // 地面要素は3Dソートへ混ぜない。建物敷地の後に道路を描く。
    this.drawTerrain(model);
    this.drawBuildingGrounds(model);
    this.drawRoads(model);
    this.drawGroundOverlays(model);
    this.drawWorldObjects(model);
    this.drawWorldOverlays(model);
  }

  drawTerrain(model) {
    const scene = this.sceneFor(model);
    const cacheEnabled = this.canvas.width * this.canvas.height <= MAX_TERRAIN_CACHE_PIXELS;
    const cacheKey = [
      scene.terrainKey, this.season,
      this.canvas.width, this.canvas.height,
      this.camera.zoom, this.camera.panX, this.camera.panY,
    ].join(':');
    const cacheHit = cacheEnabled && this.terrainCache?.key === cacheKey;
    if (cacheEnabled) {
      if (!cacheHit) this.rebuildTerrainCache(model, cacheKey);
      this.ctx.drawImage(
        this.terrainCache.canvas,
        0, 0, this.terrainCache.canvas.width, this.terrainCache.canvas.height,
        0, 0, this.width, this.height,
      );
    } else {
      this.terrainCache = null;
      this.drawTerrainBase(model);
    }
    this.drawWaterWaves(model);
    const bounds = this.frameBounds;
    const visibleWidth = Math.max(0, bounds.maxX - bounds.minX + 1);
    const visibleHeight = Math.max(0, bounds.maxY - bounds.minY + 1);
    this.lastFrameMetrics.terrainCandidates = model.width * model.height;
    this.lastFrameMetrics.terrainDrawn = visibleWidth * visibleHeight;
    this.lastFrameMetrics.terrainCacheEnabled = cacheEnabled;
    this.lastFrameMetrics.terrainCacheHit = cacheHit;
  }

  rebuildTerrainCache(model, key) {
    const cacheCanvas = this.terrainCache?.canvas ?? document.createElement('canvas');
    if (cacheCanvas.width !== this.canvas.width) cacheCanvas.width = this.canvas.width;
    if (cacheCanvas.height !== this.canvas.height) cacheCanvas.height = this.canvas.height;
    const cacheContext = cacheCanvas.getContext('2d');
    const ratio = cacheCanvas.width / this.width;
    cacheContext.setTransform(1, 0, 0, 1, 0, 0);
    cacheContext.clearRect(0, 0, cacheCanvas.width, cacheCanvas.height);
    cacheContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    cacheContext.imageSmoothingEnabled = false;
    const visibleContext = this.ctx;
    this.ctx = cacheContext;
    try {
      this.drawTerrainBase(model);
    } finally {
      this.ctx = visibleContext;
    }
    this.terrainCache = { key, canvas: cacheCanvas };
  }

  drawTerrainBase(model) {
    const seasonWash = {
      '春': 'rgba(214,221,151,.045)',
      '夏': 'rgba(238,202,99,.035)',
      '秋': 'rgba(190,107,61,.055)',
      '冬': 'rgba(204,226,218,.07)',
    }[this.season];
    const bounds = this.frameBounds ?? {
      minX: 0, maxX: model.width - 1, minY: 0, maxY: model.height - 1,
    };
    for (let sum = bounds.minX + bounds.minY; sum <= bounds.maxX + bounds.maxY; sum += 1) {
      for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
        const x = sum - y;
        if (x < bounds.minX || x > bounds.maxX) continue;
        const tile = model.terrain[y][x];
        const palette = TERRAIN_COLORS[tile.kind] ?? TERRAIN_COLORS.grass;
        const fill = palette[(tile.variant ?? 0) % palette.length];
        this.diamond(x, y, fill, tile.kind === 'water' ? '#1b626a' : '#4f6942');
        if (tile.kind !== 'water') this.diamond(x, y, seasonWash);
      }
    }
  }

  drawWaterWaves(model) {
    const bounds = this.frameBounds ?? {
      minX: 0, maxX: model.width - 1, minY: 0, maxY: model.height - 1,
    };
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#76b6b0';
    ctx.lineWidth = Math.max(0.7, this.camera.zoom);
    for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
      for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
        const tile = model.terrain[y][x];
        if (tile.kind !== 'water' || (x * 3 + y + (tile.variant ?? 0)) % 4 !== 0) continue;
        const from = this.camera.project(x + 0.22, y + 0.46, 1);
        const to = this.camera.project(x + 0.62, y + 0.46, 1);
        ctx.globalAlpha = 0.28 + Math.sin(this.pulse * 1.4 + x + y) * 0.06;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo((from.x + to.x) / 2, from.y - 2 * this.camera.zoom, to.x, to.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawBuildingGrounds(model) {
    for (const building of model.buildings) {
      if (!this.boundsVisible(building)) continue;
      const fill = building.type === 'port' ? '#887b68'
        : building.type === 'market' ? '#b59d72' : '#6f784f';
      this.footprint(
        building.x, building.y, building.width, building.height,
        fill, '#455344', 0.9,
      );
      this.drawSeasonalPlotGround(building);
      const structure = building.structure ?? buildingStructureLayout(building);
      if (structure.openYard) {
        const yardFill = building.type === 'port' ? '#aa9472'
          : building.type === 'market' ? '#c2a873' : '#9a855c';
        this.footprint(
          building.x + building.width * 0.66,
          building.y + building.height * 0.12,
          building.width * 0.22,
          building.height * 0.7,
          yardFill, '#665943', 0.54,
        );
        this.footprint(
          building.x + building.width * 0.12,
          building.y + building.height * 0.66,
          building.width * 0.76,
          building.height * 0.22,
          yardFill, '#665943', 0.54,
        );
      }
      for (const slot of building.yardPlaces ?? building.yardSlots ?? []) this.drawYardMarker(slot);
    }
    const selected = model.buildings.find(building => building.id === this.selectedBuildingId);
    if (selected && this.boundsVisible(selected)) {
      this.footprint(
        selected.x, selected.y, selected.width, selected.height,
        '#f2c45d', '#ffe39a', 0.34,
      );
    }
  }

  drawSeasonalPlotGround(building) {
    const visual = seasonalPlotVisual(building, this.season);
    if (!visual) return;
    const minX = Math.floor(building.x);
    const minY = Math.floor(building.y);
    const maxX = Math.ceil(building.x + building.width);
    const maxY = Math.ceil(building.y + building.height);
    for (let y = minY; y < maxY; y += 1) {
      for (let x = minX; x < maxX; x += 1) {
        const fill = visual.fills[Math.abs(x + y) % visual.fills.length];
        // 農地だけを一枚の色面にせず、一筆の区画ごとに季節が読めるようにする。
        this.diamond(x, y, fill, visual.stroke, 0.96);
      }
    }
  }

  drawYardMarker({ row, zone, x, y }) {
    const point = this.camera.project(x, y, 1);
    const scale = this.camera.zoom;
    const ctx = this.ctx;
    const inward = zone === 'input'
      || ['input', 'inbound', 'pickup', 'construction'].includes(row?.section);
    const outward = zone === 'output'
      || ['output', 'outbound'].includes(row?.section);
    ctx.save();
    ctx.globalAlpha = row ? 0.6 : 0.2;
    ctx.strokeStyle = inward ? '#b9d8c8' : outward ? '#f0bd61' : '#d6c58f';
    ctx.lineWidth = Math.max(1, 1.4 * scale);
    if (inward || outward) {
      const direction = outward ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(point.x - direction * 8 * scale, point.y + 5 * scale);
      ctx.lineTo(point.x + direction * 8 * scale, point.y + 5 * scale);
      ctx.lineTo(point.x + direction * 4 * scale, point.y + 2 * scale);
      ctx.moveTo(point.x + direction * 8 * scale, point.y + 5 * scale);
      ctx.lineTo(point.x + direction * 4 * scale, point.y + 8 * scale);
      ctx.stroke();
    } else {
      ctx.strokeRect(point.x - 8 * scale, point.y, 16 * scale, 9 * scale);
      ctx.beginPath();
      ctx.moveTo(point.x - 4 * scale, point.y);
      ctx.lineTo(point.x - 4 * scale, point.y + 9 * scale);
      ctx.moveTo(point.x + 4 * scale, point.y);
      ctx.lineTo(point.x + 4 * scale, point.y + 9 * scale);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRoads(model) {
    const scene = this.sceneFor(model);
    const roads = scene.roadRows.filter(row => this.boundsVisible(row));
    for (const road of roads) {
      this.diamond(
        road.x, road.y,
        road.connected ? '#a78e61' : '#9f6355',
        road.connected ? '#69593f' : '#713f3b',
        0.94,
      );
    }
    const segments = scene.roadSegments.filter(segment => this.boundsVisible({
      x: Math.min(segment.x, segment.toX),
      y: Math.min(segment.y, segment.toY),
      width: Math.abs(segment.toX - segment.x) + 1,
      height: Math.abs(segment.toY - segment.y) + 1,
    }));
    const ctx = this.ctx;
    ctx.save();
    ctx.lineCap = 'round';
    for (const segment of segments) {
      const center = this.camera.project(segment.x + 0.5, segment.y + 0.5);
      const other = this.camera.project(segment.toX + 0.5, segment.toY + 0.5);
      ctx.strokeStyle = segment.connected ? '#69593f' : '#713f3b';
      ctx.lineWidth = Math.max(5, 13 * this.camera.zoom);
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(other.x, other.y);
      ctx.stroke();
      ctx.strokeStyle = segment.connected ? '#b39a6b' : '#bd7867';
      ctx.lineWidth = Math.max(3, 9 * this.camera.zoom);
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(other.x, other.y);
      ctx.stroke();
    }
    ctx.restore();
    this.lastFrameMetrics.roadCandidates = scene.roadRows.length;
    this.lastFrameMetrics.roadDrawn = roads.length;
    this.lastFrameMetrics.roadSegmentCandidates = scene.roadSegments.length;
    this.lastFrameMetrics.roadSegmentsDrawn = segments.length;
  }

  drawGroundOverlays(model) {
    const scene = this.sceneFor(model);
    const ctx = this.ctx;
    for (const trail of scene.trailRows) {
      if (!this.boundsVisible(trail)) continue;
      const { x, y } = trail;
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
      if (!building.entrance || !this.boundsVisible(building)) continue;
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
    this.drawSelectedProductivityRoute(model);
    this.drawTrackedRoute(model);
    this.drawOperationPreview();
  }

  drawWorldOverlays(model) {
    // 危機・接続警告は建物や人物の深度ソート後に描き、常に読める最前面へ置く。
    this.drawFocusMarker(model);
    this.drawConnectionWarnings(model);
    this.drawCrisisSignals(model);
  }

  drawConnectionWarnings(model) {
    const ctx = this.ctx;
    for (const building of this.sceneFor(model).warningBuildings) {
      if (!this.boundsVisible(building)) continue;
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

  drawCrisisSignals(model) {
    const ctx = this.ctx;
    for (const building of this.sceneFor(model).crisisBuildings ?? []) {
      if (!this.boundsVisible(building)) continue;
      const crisis = building.stateSignals.crisis;
      const point = this.camera.project(
        building.x + building.width * 0.92,
        building.y + building.height * 0.08,
        28,
      );
      const critical = crisis.severity === 'critical';
      const icon = crisis.kind === 'hunger' ? '🍽'
        : crisis.kind === 'demotion' ? '↓'
          : crisis.kind === 'delivery' ? '' : '!';
      const missingGoods = (crisis.goods ?? []).filter(goods => GOODS_ART[goods]).slice(0, 2);
      const badgeWidth = (86 + missingGoods.length * 17) * this.camera.zoom;
      const badgeLeft = point.x - badgeWidth / 2;
      ctx.save();
      // 動く警告は死亡・離散間際だけ。中程度と降格間際は静止させる。
      if (critical) ctx.globalAlpha = 0.72 + Math.sin(this.pulse * 5.2) * 0.22;
      ctx.fillStyle = critical ? 'rgba(126,31,28,.94)' : 'rgba(114,73,28,.92)';
      ctx.strokeStyle = critical ? '#ff9b7c' : '#f3c66a';
      ctx.lineWidth = Math.max(1.5, 2 * this.camera.zoom);
      ctx.beginPath();
      ctx.roundRect(
        badgeLeft,
        point.y - 13 * this.camera.zoom,
        badgeWidth,
        23 * this.camera.zoom,
        8 * this.camera.zoom,
      );
      ctx.fill();
      ctx.stroke();
      const goodsStart = badgeLeft + 13 * this.camera.zoom;
      missingGoods.forEach((goods, index) => {
        drawGoodsSpriteCanvas(
          ctx,
          GOODS_ART[goods],
          goodsStart + index * 16 * this.camera.zoom,
          point.y - 1 * this.camera.zoom,
          Math.max(11, 14 * this.camera.zoom),
        );
      });
      ctx.fillStyle = '#fff2cf';
      ctx.font = `800 ${Math.max(8, 9 * this.camera.zoom)}px "Yu Gothic", sans-serif`;
      ctx.textAlign = 'center';
      const textOffset = missingGoods.length * 8 * this.camera.zoom;
      ctx.fillText(
        `${icon ? `${icon} ` : ''}${crisis.label}`,
        point.x + textOffset,
        point.y + 3 * this.camera.zoom,
      );
      ctx.restore();
    }
  }

  drawFocusMarker(model) {
    if (!this.focusMarker) return;
    if (this.pulse >= this.focusMarker.until) {
      this.focusMarker = null;
      return;
    }
    const building = model.buildings.find(row => row.id === this.focusMarker.buildingId);
    if (!building || !this.boundsVisible(building)) return;
    const point = this.camera.project(
      building.x + building.width / 2,
      building.y + building.height / 2,
      34,
    );
    const ctx = this.ctx;
    const radius = (15 + Math.sin(this.pulse * 7) * 3) * this.camera.zoom;
    ctx.save();
    ctx.strokeStyle = '#fff0a5';
    ctx.fillStyle = 'rgba(236,169,58,.18)';
    ctx.lineWidth = Math.max(2, 3 * this.camera.zoom);
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y - radius - 12 * this.camera.zoom);
    ctx.lineTo(point.x - 6 * this.camera.zoom, point.y - radius - 22 * this.camera.zoom);
    ctx.lineTo(point.x + 6 * this.camera.zoom, point.y - radius - 22 * this.camera.zoom);
    ctx.closePath();
    ctx.fillStyle = '#fff0a5';
    ctx.fill();
    ctx.restore();
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
    if (preview.ok && preview.entrance && preview.productivity?.target) {
      const from = this.camera.project(
        preview.entrance.x + 0.5, preview.entrance.y + 0.5, 4,
      );
      const to = this.camera.project(
        preview.productivity.target.x + 0.5,
        preview.productivity.target.y + 0.5,
        4,
      );
      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = 'rgba(117,189,209,.92)';
      ctx.lineWidth = Math.max(1.5, 2.2 * this.camera.zoom);
      ctx.setLineDash([3 * this.camera.zoom, 5 * this.camera.zoom]);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
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

  drawSelectedProductivityRoute(model) {
    const building = model.buildings.find(row => row.id === this.selectedBuildingId);
    const path = building?.productivity?.resourceWork?.path;
    if (!path?.length || path.length < 2) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(117,189,209,.9)';
    ctx.lineWidth = Math.max(1.5, 2.4 * this.camera.zoom);
    ctx.setLineDash([3 * this.camera.zoom, 5 * this.camera.zoom]);
    ctx.beginPath();
    path.forEach((point, index) => {
      const projected = this.camera.project(point.x + 0.5, point.y + 0.5, 3);
      if (index) ctx.lineTo(projected.x, projected.y);
      else ctx.moveTo(projected.x, projected.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  collectDynamicDrawables(model, scene) {
    const drawables = [];
    for (const inventory of model.inventoryVisuals ?? []) {
      drawables.push({
        kind: 'inventory',
        data: inventory,
        depth: inventory.x + inventory.y + 1.1,
        bounds: { x: inventory.x - 0.5, y: inventory.y - 0.5, width: 1, height: 1 },
        dynamic: true,
      });
    }
    for (const stall of model.marketStallVisuals ?? []) {
      drawables.push({
        kind: 'stall',
        data: stall,
        depth: stall.x + stall.y + 1.1,
        bounds: { x: stall.x - 0.5, y: stall.y - 0.5, width: 1, height: 1 },
        dynamic: true,
      });
    }
    for (const carrier of model.carriers) {
      drawables.push({
        kind: 'carrier',
        data: carrier,
        depth: carrier.x + carrier.y + 1,
        bounds: { x: carrier.x - 0.5, y: carrier.y - 0.5, width: 2, height: 2 },
        dynamic: true,
      });
    }
    for (const ship of model.portVisuals ?? []) {
      const position = this.shipPosition(model.portBerth, ship);
      drawables.push({
        kind: 'ship', data: { ...ship, ...position },
        depth: position.x + position.y + 1, dynamic: true,
      });
    }
    for (const handling of model.handlingVisuals ?? []) {
      if (!scene.portYard || !model.portBerth) continue;
      const yard = scene.portYard;
      const ship = model.portBerth.dock;
      const start = handling.direction === 'import' ? ship : yard;
      const finish = handling.direction === 'import' ? yard : ship;
      const progress = handling.progress ?? 1;
      const position = {
        x: start.x + (finish.x - start.x) * progress,
        y: start.y + (finish.y - start.y) * progress,
      };
      drawables.push({
        kind: 'handling', data: { ...handling, ...position },
        depth: position.x + position.y + 1.2, dynamic: true,
      });
    }
    return drawables.sort((left, right) => left.depth - right.depth);
  }

  collectWorldDrawables(model) {
    const scene = this.sceneFor(model);
    return mergeDrawables(
      scene.staticDrawables,
      this.collectDynamicDrawables(model, scene),
    );
  }

  drawWorldObjects(model) {
    const scene = this.sceneFor(model);
    let staticDrawn = 0;
    let dynamicDrawn = 0;
    for (const drawable of this.collectWorldDrawables(model)) {
      if (!drawable.dynamic && !this.boundsVisible(drawable.bounds)) continue;
      if (drawable.dynamic && drawable.bounds && !this.boundsVisible(drawable.bounds)) continue;
      if (!drawable.dynamic && drawable.kind === 'inventory' && model.inventoryVisuals) continue;
      if (!drawable.dynamic && drawable.kind === 'stall' && model.marketStallVisuals) continue;
      if (drawable.dynamic) dynamicDrawn += 1;
      else staticDrawn += 1;
      if (drawable.kind === 'tree') this.drawTree(drawable.data);
      if (drawable.kind === 'rock') this.drawRock(drawable.data);
      if (drawable.kind === 'building') this.drawBuilding(drawable.data);
      if (drawable.kind === 'inventory') this.drawInventoryPile(drawable.data);
      if (drawable.kind === 'stall') this.drawMarketStall(drawable.data);
      if (drawable.kind === 'carrier') this.drawCarrier(drawable.data);
      if (drawable.kind === 'ship') this.drawShip(drawable.data);
      if (drawable.kind === 'handling') this.drawHandlingBlock(drawable.data);
    }
    this.lastFrameMetrics.staticCandidates = scene.staticDrawables.length;
    this.lastFrameMetrics.staticDrawn = staticDrawn;
    this.lastFrameMetrics.dynamicDrawn = dynamicDrawn;
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
    const structure = building.structure ?? buildingStructureLayout(building);
    const bodyWidth = structure.width;
    const bodyHeight = structure.height;
    const bodyX = structure.x;
    const bodyY = structure.y;
    const elevation = appearance.elevation;
    const ctx = this.ctx;
    ctx.save();
    if (building.vacant) ctx.globalAlpha = 0.76;
    if (appearance.leveled && appearance.tier === 1 && !building.vacant) {
      this.footprint(
        building.x + 0.22,
        building.y + 0.22,
        Math.min(1.15, building.width - 0.44),
        Math.min(1.05, building.height - 0.44),
        '#8e754f', '#5f523d', 0.82,
      );
    }
    if (farm) {
      const seasonalPlot = seasonalPlotVisual(building, this.season);
      ctx.strokeStyle = seasonalPlot?.furrow ?? appearance.accent;
      ctx.lineWidth = Math.max(1, 1.2 * this.camera.zoom);
      const furrowCount = appearance.leveled
        ? Math.max(2, Math.min(5, appearance.tier + 1)) : 4;
      for (let row = 1; row <= furrowCount; row += 1) {
        const rowY = building.y + 0.25 + row * ((building.height - 0.5) / (furrowCount + 1));
        const from = this.camera.project(building.x + 0.3, rowY, 2);
        const to = this.camera.project(building.x + building.width - 0.3, rowY, 2);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
    if (appearance.structureVisible) {
      if (appearance.stoneBase) {
        this.prism(bodyX - 0.08, bodyY - 0.08, bodyWidth + 0.16, bodyHeight + 0.16, 6, {
          top: '#aaa699', right: '#77746d', left: '#62615d',
        });
      }
      const facade = building.vacant
        ? { ...appearance, roof: '#736c5e', wall: '#766c5c', accent: '#5e5b52' }
        : appearance;
      this.prism(
        bodyX,
        bodyY,
        bodyWidth,
        bodyHeight,
        elevation,
        {
          top: facade.roof ?? colors[2],
          right: facade.wall ?? colors[0],
          left: building.vacant ? '#5d5950' : colors[1],
        },
      );
      if (!['market', 'pit'].includes(appearance.archetype)) {
        this.drawGabledRoof(bodyX, bodyY, bodyWidth, bodyHeight, elevation, facade);
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
          ctx.globalAlpha = 1;
        }
      }
      if (appearance.windows > 0) {
        const base = this.camera.project(bodyX + bodyWidth, bodyY + bodyHeight * 0.58, elevation * 0.48);
        for (let index = 0; index < appearance.windows; index += 1) {
          ctx.fillStyle = '#f0cf75';
          ctx.fillRect(base.x - index * 8 * this.camera.zoom, base.y, 4 * this.camera.zoom, 5 * this.camera.zoom);
        }
      }
    }
    if (building.type === 'port') {
      this.drawCrane(building.x + building.width * 0.72, building.y + building.height * 0.78);
    }
    this.drawBuildingProps(building);
    this.drawCultureStageDetails(building);
    if (building.vacant) this.drawVacancyDetails(building);
    ctx.restore();
    const labelPoint = this.camera.project(
      building.x + building.width / 2,
      building.y + building.height / 2,
      appearance.structureVisible ? elevation + 8 : 22,
    );
    ctx.save();
    ctx.textAlign = 'center';
    const typeLabel = JOB_LABELS[building.type] ?? building.type;
    const label = building.vacant
      ? `${typeLabel}・無人`
      : `${typeLabel}${appearance.leveled ? ` Lv${appearance.level}` : ''}`;
    const icon = building.vacant ? '無' : (JOB_ICONS[building.type] ?? '?');
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
    if (!building.vacant && appearance.leveled) {
      const trend = building.stateSignals?.trend === 'up' ? '↑'
        : building.stateSignals?.trend === 'down' ? '↓' : '—';
      const pillY = labelPoint.y + 12 * this.camera.zoom;
      ctx.fillStyle = 'rgba(23,48,44,.9)';
      ctx.strokeStyle = building.stateSignals?.trend === 'down' ? '#d88670'
        : building.stateSignals?.trend === 'up' ? '#8fc78a' : '#b8a878';
      ctx.lineWidth = Math.max(1, this.camera.zoom);
      ctx.beginPath();
      ctx.roundRect(
        labelPoint.x - 17 * this.camera.zoom,
        pillY - 7 * this.camera.zoom,
        34 * this.camera.zoom,
        13 * this.camera.zoom,
        5 * this.camera.zoom,
      );
      ctx.fill();
      ctx.stroke();
      ctx.font = `800 ${Math.max(7, 8 * this.camera.zoom)}px "Yu Gothic", sans-serif`;
      ctx.fillStyle = building.stateSignals?.trend === 'down' ? '#ffb09a'
        : building.stateSignals?.trend === 'up' ? '#bce5ae' : '#efe1b4';
      ctx.fillText(
        `Lv${appearance.level}${trend}`,
        labelPoint.x,
        pillY + 2 * this.camera.zoom,
      );
    }
    if (this.camera.zoom >= 1.02 || building.id === this.selectedBuildingId || building.vacant) {
      ctx.font = `700 ${Math.max(9, 10 * this.camera.zoom)}px "Yu Gothic", sans-serif`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(19,39,42,.84)';
      ctx.fillStyle = '#f6e9c8';
      ctx.strokeText(label, labelPoint.x, labelPoint.y + 25 * this.camera.zoom);
      ctx.fillText(label, labelPoint.x, labelPoint.y + 25 * this.camera.zoom);
    }
    ctx.restore();
  }

  drawCultureStageDetails(building) {
    const appearance = building.appearance;
    if (!appearance.leveled || building.vacant) return;
    const ctx = this.ctx;
    const scale = this.camera.zoom;
    const structure = building.structure ?? buildingStructureLayout(building);
    const toolBase = this.camera.project(
      building.x + building.width * 0.24,
      building.y + building.height * 0.7,
      5,
    );
    ctx.save();
    ctx.lineCap = 'round';
    for (let index = 0; index < appearance.toolCount; index += 1) {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const x = toolBase.x + (column - 1) * 7 * scale + row * 2 * scale;
      const y = toolBase.y - row * 6 * scale - (column % 2) * 2 * scale;
      ctx.strokeStyle = index % 2 ? '#d3ad61' : '#705037';
      ctx.lineWidth = Math.max(1.2, 2 * scale);
      ctx.beginPath();
      ctx.moveTo(x - 3 * scale, y + 4 * scale);
      ctx.lineTo(x + 3 * scale, y - 5 * scale);
      ctx.moveTo(x, y - 2 * scale);
      ctx.lineTo(x + 5 * scale, y + 1 * scale);
      ctx.stroke();
    }
    for (let index = 0; index < appearance.bannerCount; index += 1) {
      const anchor = this.camera.project(
        building.x + building.width * 0.13 + index * 0.14,
        building.y + building.height * 0.22,
        Math.max(10, appearance.elevation + 4),
      );
      const poleHeight = (12 + appearance.tier) * scale;
      ctx.strokeStyle = '#4d3826';
      ctx.lineWidth = Math.max(1, 1.2 * scale);
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y);
      ctx.lineTo(anchor.x, anchor.y - poleHeight);
      ctx.stroke();
      ctx.fillStyle = index % 2 ? '#e0b85a' : appearance.accent;
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y - poleHeight);
      ctx.lineTo(anchor.x + 7 * scale, anchor.y - poleHeight + 3 * scale);
      ctx.lineTo(anchor.x, anchor.y - poleHeight + 6 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    for (let index = 0; index < appearance.gardenCount; index += 1) {
      const flower = this.camera.project(
        building.x + building.width * (0.38 + index * 0.11),
        building.y + building.height * 0.9,
        4,
      );
      ctx.strokeStyle = '#49683e';
      ctx.lineWidth = Math.max(1, scale);
      ctx.beginPath();
      ctx.moveTo(flower.x, flower.y + 4 * scale);
      ctx.lineTo(flower.x, flower.y - 3 * scale);
      ctx.stroke();
      ctx.fillStyle = index % 2 ? '#f0cf68' : '#d77b65';
      ctx.beginPath();
      ctx.arc(flower.x, flower.y - 5 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawVacancyDetails(building) {
    const appearance = building.appearance;
    const structure = building.structure ?? buildingStructureLayout(building);
    const ctx = this.ctx;
    const scale = this.camera.zoom;
    ctx.save();
    if (appearance.structureVisible) {
      const board = this.camera.project(
        structure.x + structure.width,
        structure.y + structure.height * 0.55,
        appearance.elevation * 0.48,
      );
      ctx.strokeStyle = '#493f35';
      ctx.lineWidth = Math.max(2, 3 * scale);
      ctx.beginPath();
      ctx.moveTo(board.x - 7 * scale, board.y - 5 * scale);
      ctx.lineTo(board.x + 7 * scale, board.y + 5 * scale);
      ctx.moveTo(board.x + 7 * scale, board.y - 5 * scale);
      ctx.lineTo(board.x - 7 * scale, board.y + 5 * scale);
      ctx.stroke();
    }
    for (const [xRatio, yRatio] of [[0.18, 0.72], [0.43, 0.88], [0.72, 0.76], [0.86, 0.57]]) {
      const weed = this.camera.project(
        building.x + building.width * xRatio,
        building.y + building.height * yRatio,
        3,
      );
      ctx.strokeStyle = '#465e37';
      ctx.lineWidth = Math.max(1, 1.4 * scale);
      ctx.beginPath();
      ctx.moveTo(weed.x, weed.y);
      ctx.lineTo(weed.x - 4 * scale, weed.y - 8 * scale);
      ctx.moveTo(weed.x, weed.y);
      ctx.lineTo(weed.x + 2 * scale, weed.y - 10 * scale);
      ctx.moveTo(weed.x, weed.y);
      ctx.lineTo(weed.x + 6 * scale, weed.y - 6 * scale);
      ctx.stroke();
    }
    const abandoned = this.camera.project(
      building.x + building.width * 0.64,
      building.y + building.height * 0.82,
      4,
    );
    ctx.strokeStyle = '#59412f';
    ctx.lineWidth = Math.max(1.5, 2.3 * scale);
    ctx.beginPath();
    ctx.moveTo(abandoned.x - 8 * scale, abandoned.y + 3 * scale);
    ctx.lineTo(abandoned.x + 7 * scale, abandoned.y - 5 * scale);
    ctx.moveTo(abandoned.x + 4 * scale, abandoned.y - 7 * scale);
    ctx.lineTo(abandoned.x + 10 * scale, abandoned.y + 1 * scale);
    ctx.stroke();
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
    const { archetype, accent, toolCount = 2 } = building.appearance;
    const ctx = this.ctx;
    const scale = this.camera.zoom;
    const structure = building.structure ?? buildingStructureLayout(building);
    const point = this.camera.project(
      structure.x + structure.width * 0.28,
      structure.y + structure.height * 0.78,
      5,
    );
    if (archetype === 'workshop') {
      ctx.strokeStyle = '#4f3525';
      ctx.lineWidth = Math.max(2, 4 * scale);
      const rackRows = Math.max(1, Math.min(3, Math.ceil(toolCount / 2)));
      for (let row = 0; row < rackRows; row += 1) {
        ctx.beginPath();
        ctx.moveTo(point.x - 10 * scale, point.y - row * 5 * scale);
        ctx.lineTo(point.x + 10 * scale, point.y - 4 * scale - row * 5 * scale);
        ctx.stroke();
      }
      if (building.type === 'cartwright') {
        const progress = building.cartWork
          ? Math.min(1, building.cartWork.progress / building.cartWork.required)
          : building.cartStock?.length ? 1 : 0;
        ctx.strokeStyle = '#2f2d28';
        ctx.lineWidth = Math.max(1.5, 2 * scale);
        for (const offset of [-8, 8]) {
          ctx.beginPath();
          ctx.arc(point.x + offset * scale, point.y + 5 * scale, 6 * scale, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.strokeStyle = '#8b5b32';
        ctx.lineWidth = Math.max(2, 3 * scale);
        ctx.beginPath();
        ctx.moveTo(point.x - 12 * scale, point.y);
        ctx.lineTo(point.x - 12 * scale + 24 * scale * progress, point.y - 5 * scale);
        ctx.lineTo(point.x - 5 * scale + 17 * scale * progress, point.y + 2 * scale);
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
    const count = row.visual.spriteCount;
    const exact = row.visual.pileStage === 'exact';
    const columns = exact ? (count <= 6 ? 3 : count <= 12 ? 4 : 5) : 5;
    const spriteScale = exact ? (count <= 6 ? 0.82 : count <= 12 ? 0.68 : 0.56) : 0.62;
    const footprintScale = row.visual.footprintScale ?? 1;
    const heightScale = row.visual.heightScale ?? 1;
    ctx.save();
    ctx.globalAlpha = exact ? 0.72 : 0.84;
    ctx.fillStyle = exact ? '#5c432c' : freshnessArt(row.visual).dark;
    if (exact) {
      ctx.fillRect(point.x - 10 * scale, point.y + 2 * scale, 20 * scale, 3 * scale);
    } else {
      ctx.beginPath();
      ctx.ellipse(
        point.x,
        point.y + 2 * scale,
        12 * scale * footprintScale,
        4 * scale * Math.sqrt(footprintScale),
        0, 0, Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    const positions = [];
    for (let index = 0; index < count; index += 1) {
      const column = index % columns;
      const layer = Math.floor(index / columns);
      positions.push({
        x: point.x + (column - (columns - 1) / 2) * 5.4 * scale * footprintScale,
        y: point.y - layer * 4.9 * scale * heightScale - (column % 2) * 1.2 * scale,
      });
    }
    this.drawGoodsPileSprites(
      freshnessArt(row.visual),
      positions,
      scale * spriteScale * (exact ? 1 : Math.sqrt(footprintScale)),
      exact,
    );
    if (ownerId === this.selectedBuildingId) {
      const text = `${GOODS_LABELS[row.goods] ?? row.goods} ${row.visual.label}荷`;
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

  drawGoodsPileSprites(art, positions, scale, outlined) {
    if (!positions.length) return;
    for (const { x, y } of positions) {
      drawGoodsSpriteCanvas(this.ctx, art, x, y, 16 * scale, { outlined });
    }
  }

  drawGoodsSprite(art, x, y, scale, isolated = true, outlined = true) {
    void isolated;
    drawGoodsSpriteCanvas(this.ctx, art, x, y, 16 * scale, { outlined });
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
    if (primary) {
      const count = Math.max(1, Math.min(5, primary.visual.spriteCount));
      for (let index = 0; index < count; index += 1) {
        this.drawGoodsSprite(
          freshnessArt(primary.visual),
          point.x + (index - (count - 1) / 2) * 4.2 * scale,
          point.y - (index % 2) * 2 * scale,
          scale * 0.66,
        );
      }
    }
    if (scale >= 1.02 || this.selectedBuildingId !== null) {
      ctx.font = `700 ${Math.max(8, 8.5 * scale)}px ui-sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#253331';
      ctx.fillStyle = '#f1e4c2';
      const label = primary
        ? `${GOODS_LABELS[primary.goods] ?? primary.goods} ${Math.round(stall.totalAmount * 10) / 10}荷`
        : '品切れ';
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
    if (carrier.kind === 'porter_queue') {
      const width = 42 * scale;
      const height = 18 * scale;
      ctx.fillStyle = 'rgba(49, 43, 32, .9)';
      ctx.strokeStyle = '#d4b56e';
      ctx.lineWidth = Math.max(1, 1.2 * scale);
      ctx.fillRect(point.x - width / 2, point.y - 22 * scale, width, height);
      ctx.strokeRect(point.x - width / 2, point.y - 22 * scale, width, height);
      if (carrier.goods) {
        this.drawGoodsSprite(
          GOODS_ART[carrier.goods] ?? GOODS_ART.tools,
          point.x - 14 * scale,
          point.y - 13 * scale,
          scale * 0.58,
        );
      }
      ctx.fillStyle = '#f3dfaa';
      ctx.font = `800 ${Math.max(7, 8 * scale)}px "Yu Gothic", sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`待ち ${carrier.queuedPeople}人`, point.x - 7 * scale, point.y - 13 * scale);
      ctx.restore();
      return;
    }
    if (carrier.id === this.selectedCarrierId) {
      ctx.globalAlpha = 0.35 + Math.sin(this.pulse * 5) * 0.12;
      ctx.fillStyle = '#f6d76b';
      ctx.beginPath();
      ctx.arc(point.x, point.y - 8 * scale, 18 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (carrier.kind === 'cart') {
      if (!carrier.idle) {
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
      }
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
        const cargoSprites = carrierCargoSprites(carrier, 3);
        for (let index = 0; index < cargoSprites.length; index += 1) {
          const art = GOODS_ART[cargoSprites[index]] ?? GOODS_ART.tools;
          this.drawGoodsSprite(
            art,
            point.x + (index - (cargoSprites.length - 1) / 2) * 4 * scale,
            point.y - 13 * scale - (index % 2) * 2 * scale,
            scale * 0.66,
            false,
          );
        }
      } else if (!carrier.idle) {
        ctx.font = `800 ${Math.max(7, 8 * scale)}px "Yu Gothic", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f2dcae';
        ctx.fillText('空', point.x, point.y - 8 * scale);
      }
      for (let index = 1; index < (carrier.peopleRows?.length ?? 1); index += 1) {
        const angle = index * 2.399963;
        const radius = (9 + (index % 3) * 3) * scale;
        const x = point.x - 18 * scale + Math.cos(angle) * radius;
        const y = point.y - 13 * scale + Math.sin(angle) * radius * 0.52;
        const bob = Math.sin(this.pulse * 7 + index) * scale;
        ctx.fillStyle = '#d6b087';
        ctx.beginPath();
        ctx.arc(x, y - 7 * scale + bob, 3.1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = index % 2 ? '#6e7861' : '#4f746d';
        ctx.fillRect(x - 3 * scale, y - 4 * scale + bob, 6 * scale, 9 * scale);
      }
    } else {
      const count = Math.max(1, carrier.peopleRows?.length ?? carrier.members ?? carrier.people ?? 1);
      const backpack = carrier.kind === 'backpack';
      const shopping = ['toMarket', 'atMarket', 'toSupplier', 'atSupplier'].includes(carrier.state)
        || (carrier.state === 'toHome' && Boolean(carrier.goods));
      const working = ['working', 'working-away'].includes(carrier.activity)
        || ['toWork', 'atResource'].includes(carrier.state)
        || (carrier.state === 'home' && carrier.productionMultiplier > 0);
      const moving = [
        'arriving', 'toMarket', 'toSupplier', 'toHome', 'toWork',
        'toResource', 'fromResource',
      ].includes(carrier.state);
      const bodyColor = shopping ? '#b78349'
        : working ? '#4f746d'
          : carrier.state === 'building' ? '#9a6b43' : '#6a7660';
      for (let index = count - 1; index >= 0; index -= 1) {
        const angle = index * 2.399963;
        const radius = index === 0 ? 0 : (working ? 8 + (index % 4) * 3 : 4 + (index % 3) * 2);
        const offsetX = Math.cos(angle) * radius * scale;
        const offsetY = Math.sin(angle) * radius * (working ? 0.7 : 0.45) * scale;
        const bob = moving
          ? Math.sin(this.pulse * 7 * (carrier.visualPace ?? 1) + carrier.x + index) * scale
          : 0;
        ctx.fillStyle = '#d6b087';
        ctx.beginPath();
        ctx.arc(point.x + offsetX, point.y - 13 * scale + offsetY + bob, 3.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = index === 0 ? bodyColor : '#70775f';
        ctx.fillRect(point.x - 3 * scale + offsetX, point.y - 10 * scale + offsetY + bob, 6 * scale, 10 * scale);
        if (backpack && index === 0) {
          ctx.strokeStyle = '#5b3d29';
          ctx.lineWidth = Math.max(1, 1.3 * scale);
          ctx.strokeRect(
            point.x - 8 * scale + offsetX,
            point.y - 12 * scale + offsetY + bob,
            6 * scale,
            10 * scale,
          );
          ctx.beginPath();
          ctx.moveTo(point.x - 7 * scale + offsetX, point.y - 10 * scale + offsetY + bob);
          ctx.lineTo(point.x - 2 * scale + offsetX, point.y - 5 * scale + offsetY + bob);
          ctx.stroke();
        }
        if (carrier.goods && index < 2 && !backpack) {
          const goods = carrierCargoSprites(carrier, 2)[index] ?? carrier.goods;
          const art = GOODS_ART[goods] ?? GOODS_ART.tools;
          this.drawGoodsSprite(
            art,
            point.x + offsetX + 4 * scale,
            point.y - 5 * scale + offsetY + bob,
            scale * 0.6,
          );
        }
      }
      if (backpack && carrier.goods) {
        const cargoSprites = carrierCargoSprites(carrier, 4);
        for (let index = 0; index < cargoSprites.length; index += 1) {
          const art = GOODS_ART[cargoSprites[index]] ?? GOODS_ART.tools;
          this.drawGoodsSprite(
            art,
            point.x - (7 + (index % 2) * 3) * scale,
            point.y - (13 + Math.floor(index / 2) * 4) * scale,
            scale * 0.58,
          );
        }
      }
      if (shopping) {
        ctx.strokeStyle = '#e1c17b';
        ctx.lineWidth = Math.max(1, 1.2 * scale);
        ctx.strokeRect(point.x - 7 * scale, point.y - 5 * scale, 9 * scale, 6 * scale);
      } else if (working) {
        ctx.strokeStyle = '#d9c69a';
        ctx.lineWidth = Math.max(1, 1.4 * scale);
        ctx.beginPath();
        ctx.moveTo(point.x - 7 * scale, point.y - 13 * scale);
        ctx.lineTo(point.x + 2 * scale, point.y - 3 * scale);
        ctx.moveTo(point.x - 3 * scale, point.y - 12 * scale);
        ctx.lineTo(point.x - 8 * scale, point.y - 7 * scale);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  hitTestCarrier(model, screenX, screenY) {
    let selected = null;
    let nearest = Infinity;
    for (const carrier of model.carriers) {
      if (carrier.selectable === false) continue;
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

  hitTestInventory(model, screenX, screenY) {
    const rows = model.inventoryVisuals ?? (model.buildings ?? []).flatMap(building => (
      (building.yardSlots ?? []).map(slot => ({ ...slot, ownerId: building.id }))
    ));
    let selected = null;
    let nearest = Infinity;
    for (const slot of rows) {
      const point = this.camera.project(slot.x, slot.y, 5);
      const distance = Math.hypot(screenX - point.x, screenY - point.y);
      const radius = Math.max(9, 15 * this.camera.zoom);
      if (distance <= radius && distance < nearest) {
        selected = slot;
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
