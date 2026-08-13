export {
  LADDER,
  MAINLAND_AID,
  P,
  companyStockReleasePrice,
  householdClass,
  householdProductionSummary,
  laborWage,
  productionCost,
} from '../../engine/src/econ.js?v=v004.54.0-cause-readable';
import { P } from '../../engine/src/econ.js?v=v004.54.0-cause-readable';
import { createEngineApi } from '../../engine/src/api.js?v=v004.54.0-cause-readable';
import {
  E_STABLE_JOBS,
  E_STABLE_POPULATION_BAND,
  E_STABLE_YEARS,
  buildCaravanSliceWorld,
  buildTutorialTwoMarketWorld,
  buildBaseCity,
  makeStableCityPlan,
} from '../../engine/src/audit.js?v=v004.54.0-cause-readable';
import {
  createPhysicalState, findTravelPath, makeFlowIslandTerrain, makeMultiMarketTerrain,
} from '../../engine/src/physical.js?v=v004.54.0-cause-readable';
import { createWorld, ensureCompanyLogisticsSites } from '../../engine/src/world.js?v=v004.54.0-cause-readable';
import { createViewController } from './controller.js?v=v004.54.0-cause-readable';
import {
  SPRING_START_CALENDAR_OFFSET_DAYS,
  START_MODES,
} from './start_modes.js?v=v004.54.0-cause-readable';

export { E_STABLE_JOBS, E_STABLE_POPULATION_BAND, E_STABLE_YEARS, buildTutorialTwoMarketWorld };
export { findTravelPath, makeMultiMarketTerrain };
export const BUILD_COST_DENARI = P.BUILD_COST * 10;

export function applySpringStartCalendar(world) {
  if (!world?.state?.economy) throw new TypeError('world state is required');
  world.state.calendarOffsetDays = SPRING_START_CALENDAR_OFFSET_DAYS;
  world.state.economy.calendarOffsetDays = SPRING_START_CALENDAR_OFFSET_DAYS;
  return world;
}

export function buildBlankCity(seed = 11, marketNetwork = null) {
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
    marketNetwork,
  });
  ensureCompanyLogisticsSites(world.state.economy, physical);
  return world;
}

export function buildPlayableSandboxWorld(seed = 11) {
  return buildCaravanSliceWorld(seed);
}

export function createEngineController({
  seed = 11, mode = 'test', stateSnapshot = null, inputJournal = [], marketNetwork = null,
} = {}) {
  const profile = START_MODES[mode];
  if (!profile) throw new RangeError(`unknown start mode: ${mode}`);
  const world = stateSnapshot
    ? createWorld({ stateSnapshot })
    : mode === 'sandbox'
      ? buildPlayableSandboxWorld(seed)
      : mode === 'tutorial'
      ? buildTutorialTwoMarketWorld(seed)
      : mode === 'caravan'
      ? buildCaravanSliceWorld(seed)
      : profile.blank ? buildBlankCity(seed, marketNetwork) : buildBaseCity(seed);
  if (!stateSnapshot) applySpringStartCalendar(world);
  const api = createEngineApi(world, { initialJournal: inputJournal });
  return createViewController(api);
}
