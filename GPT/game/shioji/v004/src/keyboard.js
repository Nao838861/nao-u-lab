const MOVEMENT_KEYS = new Set(['w', 'a', 's', 'd']);

export function isEditableTarget(target) {
  if (!target || typeof target.closest !== 'function') return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'));
}

export function shouldIgnoreShortcut(event) {
  const activeTarget = typeof document === 'undefined' ? null : document.activeElement;
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
    || isEditableTarget(event.target) || isEditableTarget(activeTarget);
}

export function movementKey(key) {
  const normalized = String(key ?? '').toLowerCase();
  return MOVEMENT_KEYS.has(normalized) ? normalized : null;
}

export function movementVector(keys) {
  const horizontal = Number(keys.has('a')) - Number(keys.has('d'));
  const vertical = Number(keys.has('w')) - Number(keys.has('s'));
  const length = Math.hypot(horizontal, vertical);
  if (length === 0) return { x: 0, y: 0 };
  return { x: horizontal / length, y: vertical / length };
}

export function panCameraFromKeys(camera, keys, elapsedSeconds, {
  pixelsPerSecond = 480, maxDeltaSeconds = 0.1,
} = {}) {
  const vector = movementVector(keys);
  const delta = Math.min(maxDeltaSeconds, Math.max(0, elapsedSeconds));
  if (delta === 0 || (vector.x === 0 && vector.y === 0)) return vector;
  camera.pan(vector.x * pixelsPerSecond * delta, vector.y * pixelsPerSecond * delta);
  return vector;
}
