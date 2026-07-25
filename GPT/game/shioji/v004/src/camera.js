import { TILE } from './config.js?v=v004.35.0-market-rhythm';

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export class IsometricCamera {
  constructor({
    tileWidth = TILE.width,
    tileHeight = TILE.height,
    minZoom = 0.28,
    maxZoom = 1.6,
  } = {}) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.zoom = 0.82;
    this.panX = 0;
    this.panY = 0;
    this.viewportWidth = 1;
    this.viewportHeight = 1;
    this.worldWidth = 1;
    this.worldHeight = 1;
    this.didInitialFocus = false;
  }

  setWorldSize(width, height) {
    if (!(width > 0 && height > 0)) throw new TypeError('world size must be positive');
    this.worldWidth = width;
    this.worldHeight = height;
    if (this.didInitialFocus) return;
    this.focus(width / 2, height / 2);
    this.didInitialFocus = true;
  }

  resize(width, height) {
    this.viewportWidth = Math.max(1, width);
    this.viewportHeight = Math.max(1, height);
    if (!this.didInitialFocus) return;
    const center = this.unproject(this.viewportWidth / 2, this.viewportHeight / 2);
    this.focus(center.x, center.y);
  }

  project(x, y, z = 0) {
    return {
      x: this.panX + (x - y) * this.tileWidth * 0.5 * this.zoom,
      y: this.panY + (x + y) * this.tileHeight * 0.5 * this.zoom - z * this.zoom,
    };
  }

  unproject(screenX, screenY) {
    const dx = (screenX - this.panX) / (this.tileWidth * 0.5 * this.zoom);
    const dy = (screenY - this.panY) / (this.tileHeight * 0.5 * this.zoom);
    return { x: (dx + dy) * 0.5, y: (dy - dx) * 0.5 };
  }

  visibleWorldBounds(padding = 4) {
    const corners = [
      this.unproject(0, 0),
      this.unproject(this.viewportWidth, 0),
      this.unproject(this.viewportWidth, this.viewportHeight),
      this.unproject(0, this.viewportHeight),
    ];
    return {
      minX: Math.max(0, Math.floor(Math.min(...corners.map(point => point.x))) - padding),
      maxX: Math.min(
        this.worldWidth - 1,
        Math.ceil(Math.max(...corners.map(point => point.x))) + padding,
      ),
      minY: Math.max(0, Math.floor(Math.min(...corners.map(point => point.y))) - padding),
      maxY: Math.min(
        this.worldHeight - 1,
        Math.ceil(Math.max(...corners.map(point => point.y))) + padding,
      ),
    };
  }

  focus(x, y) {
    this.panX = this.viewportWidth * 0.5
      - (x - y) * this.tileWidth * 0.5 * this.zoom;
    this.panY = this.viewportHeight * 0.5
      - (x + y) * this.tileHeight * 0.5 * this.zoom;
  }

  pan(dx, dy) {
    this.panX += dx;
    this.panY += dy;
  }

  zoomAt(factor, screenX, screenY) {
    const before = this.unproject(screenX, screenY);
    this.zoom = clamp(this.zoom * factor, this.minZoom, this.maxZoom);
    const after = this.project(before.x, before.y);
    this.panX += screenX - after.x;
    this.panY += screenY - after.y;
  }
}
