import { BUILDINGS, GOODS, MAP_H, MAP_W, terrainAt } from "./config.js";
import { keyOf } from "./pathfinding.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}
function shade(hex, amount) {
  const rgb = hexToRgb(hex);
  return `rgb(${clamp(rgb.r + amount, 0, 255)}, ${clamp(rgb.g + amount, 0, 255)}, ${clamp(rgb.b + amount, 0, 255)})`;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.tile = 28;
    this.originX = 0;
    this.originY = 0;
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.effects = [];
    this.lastTime = performance.now();
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.max(1, Math.floor(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * this.dpr));
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const mobile = this.width < 620;
    const fitted = Math.min((this.width - 30) / MAP_W, (this.height - 150) / MAP_H);
    this.tile = (mobile ? 22 : clamp(fitted, 25, 38)) * this.zoom;
    this.clampPan();
  }

  clampPan() {
    const mapWidth = MAP_W * this.tile;
    const mapHeight = MAP_H * this.tile;
    const mobile = this.width < 620;
    const baseX = mobile ? 10 : (this.width - mapWidth) / 2;
    const baseY = mobile ? 85 : 85 + (this.height - 170 - mapHeight) / 2;
    const minX = Math.min(10, this.width - mapWidth - 10) - baseX;
    const maxX = Math.max(10, this.width - mapWidth - 10) - baseX;
    const minY = Math.min(70, this.height - mapHeight - 80) - baseY;
    const maxY = Math.max(70, this.height - mapHeight - 80) - baseY;
    this.panX = clamp(this.panX, minX, maxX);
    this.panY = clamp(this.panY, minY, maxY);
    this.originX = baseX + this.panX;
    this.originY = baseY + this.panY;
  }

  panBy(dx, dy) {
    this.panX += dx;
    this.panY += dy;
    this.clampPan();
  }

  centerOn(point) {
    this.panX += this.width / 2 - (this.originX + (point.x + 0.5) * this.tile);
    this.panY += this.height / 2 - (this.originY + (point.y + 0.5) * this.tile);
    this.clampPan();
  }

  screenToTile(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left - this.originX) / this.tile);
    const y = Math.floor((clientY - rect.top - this.originY) / this.tile);
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return null;
    return { x, y };
  }

  tileCenter(point) {
    return {
      x: this.originX + (point.x + 0.5) * this.tile,
      y: this.originY + (point.y + 0.5) * this.tile
    };
  }

  addEffect(type, point, options = {}) {
    this.effects.push({ type, point: { ...point }, age: 0, duration: options.duration || 1.2, color: options.color || "#f4c75c", text: options.text || "" });
  }

  draw(world, ui = {}) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.clampPan();
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    this.drawSea(now);
    this.drawMap(world, now);
    this.drawRoadProjects(world);
    this.drawConstructions(world);
    this.drawBuildings(world, ui, now);
    this.drawShipments(world, now);
    this.drawMerchants(world, now);
    this.drawShip(world, now);
    this.drawPreview(world, ui);
    this.drawEffects(dt);
    this.drawVignette();
  }

  drawSea(now) {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, "#1e6c7b");
    gradient.addColorStop(0.55, "#3b97a1");
    gradient.addColorStop(1, "#62aaa4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.globalAlpha = 0.17;
    ctx.strokeStyle = "#d6f2e7";
    ctx.lineWidth = 1;
    const drift = (now / 60) % 26;
    for (let y = 18; y < this.height; y += 27) {
      ctx.beginPath();
      for (let x = -30; x < this.width + 30; x += 26) {
        const sx = x + drift;
        ctx.moveTo(sx, y);
        ctx.quadraticCurveTo(sx + 7, y - 3, sx + 14, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawMap(world, now) {
    const ctx = this.ctx;
    const colors = {
      coast: "#dcc992",
      grass: "#9fbd79",
      fertile: "#c9c16c",
      forest: "#668b63",
      ridge: "#8f9480"
    };
    ctx.save();
    ctx.shadowColor = "rgba(11,44,48,.28)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 7;
    for (let y = 0; y < MAP_H; y += 1) {
      for (let x = 0; x < MAP_W; x += 1) {
        const terrain = terrainAt(x, y);
        if (terrain === "water") continue;
        const px = this.originX + x * this.tile;
        const py = this.originY + y * this.tile;
        const noise = ((x * 17 + y * 31 + world.seed) % 7) - 3;
        ctx.fillStyle = shade(colors[terrain], noise);
        ctx.fillRect(px - .3, py - .3, this.tile + .6, this.tile + .6);
      }
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = .24;
    ctx.strokeStyle = "rgba(49,68,50,.32)";
    ctx.lineWidth = 1;
    for (let y = 0; y < MAP_H; y += 1) {
      for (let x = 0; x < MAP_W; x += 1) {
        const terrain = terrainAt(x, y);
        if (terrain === "water") continue;
        const px = this.originX + x * this.tile;
        const py = this.originY + y * this.tile;
        if (terrain === "fertile") {
          for (let i = 5; i < this.tile; i += 8) {
            ctx.beginPath();
            ctx.moveTo(px + 2, py + i);
            ctx.lineTo(px + this.tile - 2, py + i - 4);
            ctx.stroke();
          }
        }
      }
    }
    ctx.restore();

    for (let y = 0; y < MAP_H; y += 1) {
      for (let x = 0; x < MAP_W; x += 1) {
        const terrain = terrainAt(x, y);
        const center = this.tileCenter({ x, y });
        if (terrain === "forest" && (x * 5 + y * 3) % 4 !== 0) this.drawTree(center.x, center.y, this.tile, now, x + y);
        if (terrain === "ridge" && (x + y) % 3 === 0) this.drawRock(center.x, center.y, this.tile);
      }
    }

    this.drawRoads(world);
  }

  drawTree(x, y, tile, now, seed) {
    const ctx = this.ctx;
    const sway = Math.sin(now / 900 + seed) * tile * .025;
    ctx.save();
    ctx.translate(x + sway, y);
    ctx.fillStyle = "rgba(35,57,42,.22)";
    ctx.beginPath();
    ctx.ellipse(2, tile * .24, tile * .3, tile * .1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#594c34";
    ctx.fillRect(-tile * .045, -tile * .02, tile * .09, tile * .27);
    ctx.fillStyle = seed % 2 ? "#416c50" : "#4e7952";
    ctx.beginPath();
    ctx.moveTo(0, -tile * .42);
    ctx.lineTo(-tile * .28, tile * .09);
    ctx.lineTo(tile * .28, tile * .09);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(181,207,125,.28)";
    ctx.beginPath();
    ctx.moveTo(-tile * .04, -tile * .34);
    ctx.lineTo(-tile * .2, tile * .02);
    ctx.lineTo(0, tile * .02);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawRock(x, y, tile) {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(44,55,51,.2)";
    ctx.beginPath();
    ctx.ellipse(x + 2, y + tile * .18, tile * .22, tile * .08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#777e72";
    ctx.beginPath();
    ctx.moveTo(x - tile * .2, y + tile * .14);
    ctx.lineTo(x - tile * .12, y - tile * .17);
    ctx.lineTo(x + tile * .1, y - tile * .24);
    ctx.lineTo(x + tile * .23, y + tile * .12);
    ctx.closePath();
    ctx.fill();
  }

  drawRoads(world) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const key of world.roads) {
      const [x, y] = key.split(",").map(Number);
      const center = this.tileCenter({ x, y });
      ctx.fillStyle = "#b49469";
      ctx.beginPath();
      ctx.arc(center.x, center.y, this.tile * .18, 0, Math.PI * 2);
      ctx.fill();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const neighborKey = keyOf(x + dx, y + dy);
        const connected = world.roads.has(neighborKey) || world.buildingAt(x + dx, y + dy);
        if (!connected) continue;
        ctx.strokeStyle = "#b49469";
        ctx.lineWidth = this.tile * .34;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x + dx * this.tile * .55, center.y + dy * this.tile * .55);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,238,193,.2)";
        ctx.lineWidth = Math.max(1, this.tile * .045);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawRoadProjects(world) {
    const ctx = this.ctx;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255,239,184,.85)";
    ctx.lineWidth = Math.max(3, this.tile * .18);
    for (const project of world.roadProjects) {
      ctx.beginPath();
      project.points.forEach((point, index) => {
        const center = this.tileCenter(point);
        if (index === 0) ctx.moveTo(center.x, center.y);
        else ctx.lineTo(center.x, center.y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  drawConstructions(world) {
    const ctx = this.ctx;
    for (const item of world.constructions) {
      const center = this.tileCenter(item);
      const size = this.tile * .38;
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.fillStyle = "rgba(63,45,34,.18)";
      ctx.fillRect(-size, -size * .35, size * 2, size * .7);
      ctx.strokeStyle = "#7d5e3f";
      ctx.lineWidth = Math.max(1, this.tile * .06);
      ctx.beginPath();
      ctx.moveTo(-size, size * .38);
      ctx.lineTo(-size, -size);
      ctx.moveTo(size, size * .38);
      ctx.lineTo(size, -size);
      ctx.moveTo(-size, -size * .55);
      ctx.lineTo(size, -size * .55);
      ctx.stroke();
      ctx.fillStyle = "#f0c45c";
      ctx.fillRect(-size, size * .55, size * 2 * item.progress, Math.max(3, this.tile * .09));
      ctx.restore();
    }
  }

  drawBuildings(world, ui, now) {
    for (const building of world.buildings) {
      if (!building.complete) continue;
      const selected = ui.selectedBuildingId === building.id;
      this.drawBuilding(world, building, selected, now);
    }
  }

  drawBuilding(world, building, selected, now) {
    const ctx = this.ctx;
    const definition = BUILDINGS[building.type];
    const center = this.tileCenter(building);
    const s = this.tile;
    const hungry = building.household?.hungryToday;
    ctx.save();
    ctx.translate(center.x, center.y);
    if (selected) {
      ctx.strokeStyle = "#fff3a7";
      ctx.lineWidth = Math.max(2, s * .08);
      ctx.beginPath();
      ctx.arc(0, 0, s * .58 + Math.sin(now / 180) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(24,42,38,.25)";
    ctx.beginPath();
    ctx.ellipse(3, s * .29, s * .42, s * .14, 0, 0, Math.PI * 2);
    ctx.fill();

    if (building.type === "port") this.drawPort(ctx, s);
    else if (building.type === "market") this.drawMarket(ctx, s);
    else if (building.type === "farm") this.drawFarm(ctx, s, definition.color);
    else this.drawHouse(ctx, s, definition.color, definition.icon, building.type);

    if (building.vacant) {
      ctx.fillStyle = "rgba(25,36,34,.72)";
      ctx.beginPath();
      ctx.arc(s * .31, -s * .31, s * .17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff2c5";
      ctx.font = `700 ${Math.max(9, s * .22)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("空", s * .31, -s * .24);
    }
    if (hungry || building.idleReason) {
      const color = hungry ? "#d85444" : "#e0aa3e";
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(-s * .34, -s * .36, s * .13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = `900 ${Math.max(10, s * .25)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(hungry ? "!" : "·", -s * .34, -s * .27);
    }
    if (building.lastOutput > .05 && definition.output) {
      this.drawGoodIcon(ctx, definition.output, s * .35, -s * .22, s * .19);
    }
    ctx.restore();
  }

  drawHouse(ctx, s, color, icon, type) {
    const width = s * .62;
    const height = s * .44;
    ctx.fillStyle = shade(color, -20);
    ctx.fillRect(-width / 2, -height * .18, width, height * .72);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-width * .62, -height * .18);
    ctx.lineTo(0, -height * .85);
    ctx.lineTo(width * .62, -height * .18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,244,214,.8)";
    ctx.fillRect(-width * .34, height * .05, width * .18, height * .2);
    ctx.fillStyle = "#614735";
    ctx.fillRect(width * .13, height * .02, width * .2, height * .52);
    ctx.fillStyle = "rgba(255,249,226,.95)";
    ctx.font = `${Math.max(10, s * .29)}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(icon, 0, -height * .13);
    if (["sawmill", "workshop"].includes(type)) {
      ctx.fillStyle = "rgba(231,235,219,.45)";
      ctx.beginPath();
      ctx.arc(width * .3, -height * .88, s * .1, 0, Math.PI * 2);
      ctx.arc(width * .39, -height * 1.05, s * .08, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFarm(ctx, s, color) {
    ctx.save();
    ctx.rotate(-.06);
    ctx.fillStyle = shade(color, -18);
    ctx.fillRect(-s * .43, -s * .34, s * .86, s * .68);
    ctx.strokeStyle = "rgba(255,243,174,.62)";
    ctx.lineWidth = Math.max(1, s * .045);
    for (let x = -s * .32; x <= s * .32; x += s * .17) {
      ctx.beginPath();
      ctx.moveTo(x, -s * .29);
      ctx.lineTo(x + s * .06, s * .29);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = "#885f39";
    ctx.fillRect(s * .12, -s * .12, s * .26, s * .34);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(s * .06, -s * .12);
    ctx.lineTo(s * .25, -s * .38);
    ctx.lineTo(s * .46, -s * .12);
    ctx.closePath();
    ctx.fill();
  }

  drawMarket(ctx, s) {
    ctx.fillStyle = "#d9b36a";
    ctx.fillRect(-s * .42, -s * .02, s * .84, s * .27);
    ctx.fillStyle = "#d85843";
    ctx.beginPath();
    ctx.moveTo(-s * .48, -s * .04);
    ctx.lineTo(-s * .32, -s * .43);
    ctx.lineTo(s * .32, -s * .43);
    ctx.lineTo(s * .48, -s * .04);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff0c9";
    for (let x = -s * .24; x < s * .3; x += s * .24) ctx.fillRect(x, -s * .43, s * .11, s * .39);
    ctx.strokeStyle = "#73503a";
    ctx.lineWidth = Math.max(1, s * .05);
    ctx.beginPath();
    ctx.moveTo(-s * .36, -s * .03);
    ctx.lineTo(-s * .36, s * .38);
    ctx.moveTo(s * .36, -s * .03);
    ctx.lineTo(s * .36, s * .38);
    ctx.stroke();
  }

  drawPort(ctx, s) {
    ctx.fillStyle = "#785b40";
    ctx.fillRect(-s * .46, -s * .1, s * .95, s * .22);
    ctx.fillRect(-s * .36, s * .08, s * .13, s * .48);
    ctx.fillRect(s * .2, s * .08, s * .13, s * .48);
    ctx.fillStyle = "#365d68";
    ctx.fillRect(-s * .34, -s * .38, s * .67, s * .31);
    ctx.fillStyle = "#e1c066";
    ctx.beginPath();
    ctx.moveTo(-s * .42, -s * .38);
    ctx.lineTo(0, -s * .69);
    ctx.lineTo(s * .42, -s * .38);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#f3e0a4";
    ctx.lineWidth = Math.max(1, s * .045);
    ctx.beginPath();
    ctx.moveTo(s * .22, -s * .35);
    ctx.lineTo(s * .22, -s * .92);
    ctx.stroke();
    ctx.fillStyle = "#d95e46";
    ctx.beginPath();
    ctx.moveTo(s * .24, -s * .9);
    ctx.lineTo(s * .55, -s * .76);
    ctx.lineTo(s * .24, -s * .62);
    ctx.closePath();
    ctx.fill();
  }

  drawGoodIcon(ctx, good, x, y, size) {
    const definition = GOODS[good];
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(17,42,45,.78)";
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = definition.color;
    ctx.font = `800 ${size * 1.15}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(definition.icon, 0, 0);
    ctx.restore();
  }

  positionOnPath(path, progress) {
    if (!path?.length) return null;
    if (path.length === 1) return this.tileCenter(path[0]);
    const scaled = clamp(progress, 0, 1) * (path.length - 1);
    const index = Math.min(path.length - 2, Math.floor(scaled));
    const local = scaled - index;
    const from = this.tileCenter(path[index]);
    const to = this.tileCenter(path[index + 1]);
    return { x: lerp(from.x, to.x, local), y: lerp(from.y, to.y, local), angle: Math.atan2(to.y - from.y, to.x - from.x) };
  }

  drawShipments(world, now) {
    const ctx = this.ctx;
    const grouped = world.shipments.slice(0, 80);
    for (const shipment of grouped) {
      const position = this.positionOnPath(shipment.path, shipment.progress);
      if (!position) continue;
      const bob = Math.sin(now / 150 + shipment.id) * 1.2;
      ctx.save();
      ctx.translate(position.x, position.y + bob);
      ctx.fillStyle = "rgba(20,35,34,.2)";
      ctx.beginPath();
      ctx.ellipse(1, this.tile * .16, this.tile * .14, this.tile * .06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = shipment.sellerType === "merchant" || shipment.buyerType === "merchant" ? "#76528c" : "#2c5660";
      ctx.beginPath();
      ctx.arc(0, -this.tile * .03, this.tile * .09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-this.tile * .06, this.tile * .03, this.tile * .12, this.tile * .17);
      this.drawGoodIcon(ctx, shipment.good, this.tile * .13, -this.tile * .13, this.tile * .09);
      ctx.restore();
    }
  }

  drawMerchants(world, now) {
    const ctx = this.ctx;
    for (const building of world.buildings.filter((item) => item.merchant?.trip)) {
      const trip = building.merchant.trip;
      const position = this.positionOnPath(trip.path, trip.progress);
      if (!position) continue;
      ctx.save();
      ctx.translate(position.x, position.y + Math.sin(now / 180) * 1.2);
      ctx.rotate(position.angle);
      ctx.fillStyle = "rgba(20,34,31,.25)";
      ctx.beginPath();
      ctx.ellipse(0, this.tile * .15, this.tile * .31, this.tile * .08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8a5a9d";
      ctx.fillRect(-this.tile * .25, -this.tile * .11, this.tile * .42, this.tile * .23);
      ctx.fillStyle = "#3c3438";
      for (const x of [-this.tile * .17, this.tile * .1]) {
        ctx.beginPath();
        ctx.arc(x, this.tile * .15, this.tile * .08, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "#f2d783";
      ctx.lineWidth = Math.max(1, this.tile * .045);
      ctx.beginPath();
      ctx.moveTo(-this.tile * .08, -this.tile * .1);
      ctx.lineTo(-this.tile * .08, -this.tile * .48);
      ctx.stroke();
      ctx.fillStyle = "#e6bc54";
      ctx.beginPath();
      ctx.moveTo(-this.tile * .06, -this.tile * .46);
      ctx.lineTo(this.tile * .21, -this.tile * .34);
      ctx.lineTo(-this.tile * .06, -this.tile * .22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  drawShip(world, now) {
    const ctx = this.ctx;
    const port = this.tileCenter(world.port());
    const t = world.shipAtSea;
    const x = lerp(this.originX - this.tile * 3.2, port.x - this.tile * .85, t);
    const y = lerp(port.y - this.tile * 4.8, port.y + this.tile * .25, t) + Math.sin(now / 420) * 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(.18 - t * .12);
    ctx.fillStyle = "rgba(9,45,52,.24)";
    ctx.beginPath();
    ctx.ellipse(0, this.tile * .25, this.tile * .65, this.tile * .16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#75472f";
    ctx.beginPath();
    ctx.moveTo(-this.tile * .52, this.tile * .05);
    ctx.lineTo(this.tile * .55, this.tile * .05);
    ctx.lineTo(this.tile * .32, this.tile * .35);
    ctx.lineTo(-this.tile * .3, this.tile * .35);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#f2d991";
    ctx.lineWidth = Math.max(1.5, this.tile * .06);
    ctx.beginPath();
    ctx.moveTo(0, this.tile * .04);
    ctx.lineTo(0, -this.tile * 1.12);
    ctx.stroke();
    ctx.fillStyle = "#f0e3bd";
    ctx.beginPath();
    ctx.moveTo(this.tile * .04, -this.tile * 1.05);
    ctx.quadraticCurveTo(this.tile * .78, -this.tile * .65, this.tile * .07, -this.tile * .14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d35c45";
    ctx.beginPath();
    ctx.moveTo(-this.tile * .04, -this.tile * 1.04);
    ctx.lineTo(-this.tile * .5, -this.tile * .77);
    ctx.lineTo(-this.tile * .05, -this.tile * .56);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawPreview(world, ui) {
    const ctx = this.ctx;
    if (ui.previewRoad?.length) {
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = ui.previewValid ? "#fff1a7" : "#df6251";
      ctx.lineWidth = Math.max(4, this.tile * .2);
      ctx.beginPath();
      ui.previewRoad.forEach((point, index) => {
        const center = this.tileCenter(point);
        if (index === 0) ctx.moveTo(center.x, center.y);
        else ctx.lineTo(center.x, center.y);
      });
      ctx.stroke();
      ctx.restore();
    }
    if (ui.previewBuilding) {
      const center = this.tileCenter(ui.previewBuilding);
      ctx.save();
      ctx.globalAlpha = .72;
      ctx.fillStyle = ui.previewValid ? BUILDINGS[ui.selectedTool].color : "#c84c43";
      ctx.fillRect(center.x - this.tile * .42, center.y - this.tile * .42, this.tile * .84, this.tile * .84);
      ctx.fillStyle = "white";
      ctx.font = `700 ${this.tile * .38}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(BUILDINGS[ui.selectedTool].icon, center.x, center.y);
      ctx.restore();
    }
  }

  drawEffects(dt) {
    const ctx = this.ctx;
    for (const effect of this.effects) effect.age += dt;
    this.effects = this.effects.filter((effect) => effect.age < effect.duration);
    for (const effect of this.effects) {
      const t = effect.age / effect.duration;
      const center = this.tileCenter(effect.point);
      ctx.save();
      ctx.globalAlpha = 1 - t;
      if (effect.type === "ring") {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3 * (1 - t);
        ctx.beginPath();
        ctx.arc(center.x, center.y, this.tile * (.25 + t * 1.25), 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === "text") {
        ctx.fillStyle = effect.color;
        ctx.font = `800 ${Math.max(12, this.tile * .4)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(effect.text, center.x, center.y - t * this.tile * 1.2);
      }
      ctx.restore();
    }
  }

  drawVignette() {
    const ctx = this.ctx;
    const gradient = ctx.createRadialGradient(this.width / 2, this.height / 2, Math.min(this.width, this.height) * .35, this.width / 2, this.height / 2, Math.max(this.width, this.height) * .72);
    gradient.addColorStop(0, "rgba(8,31,35,0)");
    gradient.addColorStop(1, "rgba(7,25,29,.2)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }
}
