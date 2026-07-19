import {
  ageMarketStalls,
  createEconomicState,
  initializeNaturalResources,
  P,
  runCompanyDayStart,
  runDayEnd,
  runPrimaryProductionDay,
} from "./econ.js";
import { createPhysicalState, stepHaulCarriers } from "./physical.js";
import { nextMulberry32, normalizeSeed } from "./prng.js";

export function createWorld({ seed = 1, initialCompanyMoney = P.TREASURY0 } = {}) {
  const normalizedSeed = normalizeSeed(seed);
  const physical = createPhysicalState();
  const economy = createEconomicState({ initialCompanyMoney });
  const state = {
    day: 0,
    seed: normalizedSeed,
    rngState: normalizedSeed,
    physical,
    economy,
  };
  initializeNaturalResources(economy, physical);

  function random() {
    const result = nextMulberry32(state.rngState);
    state.rngState = result.state;
    return result.value;
  }

  return {
    state,
    random,
    step() {
      stepHaulCarriers(state.physical, 30);
      const nextDay = state.day + 1;
      ageMarketStalls(state.economy, { day: nextDay });
      runCompanyDayStart(state.economy, { day: nextDay, random });
      runPrimaryProductionDay(state.economy, state.physical, { day: nextDay });
      runDayEnd(state.economy, state.physical, { day: nextDay, random });
      state.day = nextDay;
      return state;
    },
  };
}
