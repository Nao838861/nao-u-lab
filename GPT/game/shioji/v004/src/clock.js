import { SPEEDS } from './config.js?v=v004.39.0-goods-discovery';

export class SimulationClock {
  constructor({ speedIndex = 1 } = {}) {
    this.speedIndex = 0;
    this.remainder = 0;
    this.setSpeed(speedIndex);
  }

  setSpeed(index) {
    if (!Number.isInteger(index) || index < 0 || index >= SPEEDS.length) {
      throw new RangeError(`unknown speed index: ${index}`);
    }
    this.speedIndex = index;
    return SPEEDS[index];
  }

  consume(elapsedSeconds, { maxTicks = Number.MAX_SAFE_INTEGER } = {}) {
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
      throw new TypeError('elapsed time must be finite and non-negative');
    }
    if (!Number.isSafeInteger(maxTicks) || maxTicks < 0) {
      throw new TypeError('maxTicks must be a non-negative safe integer');
    }
    this.remainder += elapsedSeconds * SPEEDS[this.speedIndex].ticksPerSecond;
    if (SPEEDS[this.speedIndex].ticksPerSecond === 0) return 0;
    const ticks = Math.min(maxTicks, Math.floor(this.remainder + 1e-9));
    this.remainder -= ticks;
    return ticks;
  }
}
