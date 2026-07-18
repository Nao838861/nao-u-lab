const smooth = t => t * t * (3 - 2 * t);

export class ShipSystem {
  constructor(port, onArrival = () => {}) {
    this.port = port;
    this.onArrival = onArrival;
    this.state = 'docked';
    this.elapsed = 0;
    this.nextDue = 15;
    this.lastArrivalDay = 0;
    this.cargo = { wheat: 20, tools: 8, log: 12 };
    this.opening = true;
  }

  begin() {
    if (!this.opening) return;
    this.opening = false;
    this.state = 'departing';
    this.elapsed = 0;
  }

  update(dt, day) {
    this.elapsed += dt;
    if (!this.opening && this.state === 'away' && day >= this.nextDue) {
      const arrivalDay = this.nextDue;
      this.state = 'arriving';
      this.elapsed = 0;
      this.lastArrivalDay = arrivalDay;
      this.nextDue += 15;
      this.cargo = this.cargoFor(arrivalDay);
      this.onArrival({ day: arrivalDay, cargo: this.cargo });
    }
    if (this.state === 'arriving' && this.elapsed >= 4.2) {
      this.state = 'docked';
      this.elapsed = 0;
    } else if (this.state === 'docked' && !this.opening && this.elapsed >= 6.5) {
      this.state = 'departing';
      this.elapsed = 0;
    } else if (this.state === 'departing' && this.elapsed >= 5) {
      this.state = 'away';
      this.elapsed = 0;
      this.cargo = null;
    }
  }

  cargoFor(day) {
    if (day <= 15) return { wheat: 30, tools: 10, log: 16 };
    if (day <= 45) return { wheat: 18, salt: 8, tools: 6 };
    return { wheat: 10, iron: 4, salt: 5 };
  }

  getPosition() {
    const px = this.port.x + 1.35;
    const py = this.port.y + 1.6;
    const farX = this.port.x + 7.5;
    const farY = this.port.y + 7.2;
    if (this.state === 'away') return null;
    if (this.state === 'docked') return { x: px, y: py, state: this.state, cargo: this.cargo };
    const duration = this.state === 'arriving' ? 4.2 : 5;
    let t = Math.min(1, this.elapsed / duration);
    if (this.state === 'arriving') t = 1 - smooth(t);
    else t = smooth(t);
    return {
      x: px + (farX - px) * t,
      y: py + (farY - py) * t,
      state: this.state,
      cargo: this.cargo,
    };
  }

  daysUntil(day) {
    if (this.opening || this.state === 'docked' || this.state === 'arriving') return 0;
    return Math.max(0, this.nextDue - day);
  }

  label(day) {
    if (this.opening) return '第一便 停泊中';
    if (this.state === 'arriving') return '入港中';
    if (this.state === 'docked') return '荷役中';
    if (this.state === 'departing') return '出港中';
    return `あと${this.daysUntil(day)}日`;
  }
}
