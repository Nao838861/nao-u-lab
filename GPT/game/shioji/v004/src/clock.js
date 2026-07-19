import { SPEEDS } from './config.js';

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

  consume(elapsedSeconds) {
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
      throw new TypeError('elapsed time must be finite and non-negative');
    }
    this.remainder += elapsedSeconds * SPEEDS[this.speedIndex].ticksPerSecond;
    const ticks = Math.floor(this.remainder + 1e-9);
    this.remainder -= ticks;
    return ticks;
  }
}
