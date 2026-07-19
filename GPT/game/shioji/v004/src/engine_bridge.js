import { createEngineApi } from '../../engine/src/api.js';
import { buildBaseCity } from '../../engine/src/audit.js';
import { createViewController } from './controller.js';

export function createEngineController({ seed = 11 } = {}) {
  const world = buildBaseCity(seed);
  const api = createEngineApi(world);
  return createViewController(api);
}
