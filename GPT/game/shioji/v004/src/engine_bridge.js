export {
  LADDER,
  MAINLAND_AID,
  P,
  companyStockReleasePrice,
  householdClass,
  productionCost,
} from '../../engine/src/econ.js?v=v004.16.0-elena-written-voice';
import { P } from '../../engine/src/econ.js?v=v004.16.0-elena-written-voice';
import { createEngineApi } from '../../engine/src/api.js?v=v004.16.0-elena-written-voice';
import {
  E_STABLE_JOBS,
  E_STABLE_POPULATION_BAND,
  E_STABLE_YEARS,
  buildBaseCity,
  makeStableCityPlan,
} from '../../engine/src/audit.js?v=v004.16.0-elena-written-voice';
import { createPhysicalState, makeFlowIslandTerrain } from '../../engine/src/physical.js?v=v004.16.0-elena-written-voice';
import { createWorld, ensureCompanyLogisticsSites } from '../../engine/src/world.js?v=v004.16.0-elena-written-voice';
import { createViewController } from './controller.js?v=v004.16.0-elena-written-voice';
import { START_MODES } from './start_modes.js?v=v004.16.0-elena-written-voice';

export { E_STABLE_JOBS, E_STABLE_POPULATION_BAND, E_STABLE_YEARS };
export const BUILD_COST_DENARI = P.BUILD_COST * 10;

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
