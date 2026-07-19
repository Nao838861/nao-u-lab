import { assertMoneyConservation, createEconomicState, P } from "./econ.js";
import { createPhysicalState, stepHaulCarriers } from "./physical.js";
import { nextMulberry32, normalizeSeed } from "./prng.js";

export function createWorld({ seed = 1, initialCompanyMoney = P.TREASURY0 } = {}) {
  const normalizedSeed = normalizeSeed(seed);
  const state = {
    day: 0,
    seed: normalizedSeed,
    rngState: normalizedSeed,
    physical: createPhysicalState(),
    economy: createEconomicState({ initialCompanyMoney }),
  };

  return {
    state,
    random() {
      const result = nextMulberry32(state.rngState);
      state.rngState = result.state;
      return result.value;
    },
    step() {
      stepHaulCarriers(state.physical, 30);
      state.day += 1;
      assertMoneyConservation(state.economy);
      return state;
    },
  };
}
