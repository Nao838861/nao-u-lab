export { MAINLAND_AID } from '../../engine/src/econ.js';
import { createEngineApi } from '../../engine/src/api.js';
import { buildBaseCity, makeStableCityPlan } from '../../engine/src/audit.js';
import { createPhysicalState, makeFlowIslandTerrain } from '../../engine/src/physical.js';
import { createWorld, ensureCompanyLogisticsSites } from '../../engine/src/world.js';
import { createViewController } from './controller.js';
import { START_MODES } from './start_modes.js';

export function buildBlankCity(seed = 11) {
  const plan = makeStableCityPlan();
  const portSite = plan.logisticsSites.port;
  const physical = createPhysicalState({
    width: 48,
    height: 40,
    terrain: makeFlowIslandTerrain(48, 40),
  });
  const world = createWorld({
    seed,
    physicalState: physical,
    market: { ...portSite.entrance },
    port: { ...portSite.entrance },
    logisticsSites: { port: portSite },
  });
  ensureCompanyLogisticsSites(world.state.economy, physical);
  return world;
}

export function createEngineController({ seed = 11, mode = 'test' } = {}) {
  const profile = START_MODES[mode];
  if (!profile) throw new RangeError(`unknown start mode: ${mode}`);
  const world = profile.blank ? buildBlankCity(seed) : buildBaseCity(seed);
  const api = createEngineApi(world);
  return createViewController(api);
}
