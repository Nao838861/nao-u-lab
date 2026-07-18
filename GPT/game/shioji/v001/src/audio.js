export class Soundscape {
  constructor() {
    this.context = null;
    this.master = null;
    this.enabled = true;
    this.lastAmbient = 0;
  }

  async unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        this.enabled = false;
        return;
      }
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = this.enabled ? 0.14 : 0;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") await this.context.resume();
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.master) this.master.gain.setTargetAtTime(this.enabled ? 0.14 : 0, this.context.currentTime, 0.03);
    return this.enabled;
  }

  tone({ frequency = 440, duration = .12, type = "sine", volume = .18, delay = 0, endFrequency = null } = {}) {
    if (!this.context || !this.enabled) return;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + .018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + .03);
  }

  play(kind) {
    if (kind === "build") {
      this.tone({ frequency: 310, endFrequency: 430, duration: .1, type: "triangle", volume: .13 });
    } else if (kind === "success") {
      this.tone({ frequency: 523, duration: .14, type: "triangle", volume: .18 });
      this.tone({ frequency: 659, duration: .18, type: "triangle", volume: .16, delay: .08 });
    } else if (kind === "warning") {
      this.tone({ frequency: 210, endFrequency: 160, duration: .25, type: "sawtooth", volume: .08 });
    } else if (kind === "bell") {
      this.tone({ frequency: 392, duration: .7, type: "sine", volume: .22 });
      this.tone({ frequency: 784, duration: .55, type: "sine", volume: .08, delay: .03 });
    } else if (kind === "ship") {
      this.tone({ frequency: 220, duration: .5, type: "triangle", volume: .16 });
      this.tone({ frequency: 330, duration: .7, type: "sine", volume: .13, delay: .12 });
      this.tone({ frequency: 440, duration: .8, type: "sine", volume: .1, delay: .26 });
    } else if (kind === "victory") {
      [262, 330, 392, 523].forEach((frequency, index) => this.tone({ frequency, duration: .55, type: "triangle", volume: .16, delay: index * .13 }));
    }
  }
}
