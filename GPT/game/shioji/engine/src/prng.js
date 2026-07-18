const MULBERRY32_INCREMENT = 0x6d2b79f5;

export function normalizeSeed(seed) {
  if (!Number.isSafeInteger(seed)) {
    throw new TypeError("seed must be a safe integer");
  }
  return seed >>> 0;
}

export function nextMulberry32(state) {
  const nextState = (normalizeSeed(state) + MULBERRY32_INCREMENT) >>> 0;
  let value = nextState;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  value = ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  return { state: nextState, value };
}

export function mulberry32(seed) {
  let state = normalizeSeed(seed);
  return () => {
    const result = nextMulberry32(state);
    state = result.state;
    return result.value;
  };
}
