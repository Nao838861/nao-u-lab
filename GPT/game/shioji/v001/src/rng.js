export class RNG {
  constructor(seed = 1) {
    this.state = (Number(seed) || 1) >>> 0;
  }

  next() {
    let value = this.state += 0x6d2b79f5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  }

  int(min, max) {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  pick(items) {
    return items[Math.floor(this.next() * items.length)];
  }
}
