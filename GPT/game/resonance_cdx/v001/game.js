(function (root) {
  "use strict";

  const W = 480;
  const H = 720;
  const DT = 1 / 60;
  const RING_RADIUS = 86;
  const RING_CD = 1.85;
  const STAGE_SECONDS = 88;
  const TONES = [
    { id: 0, name: "low", color: "#f05d5e", mark: "I" },
    { id: 1, name: "mid", color: "#3db7d8", mark: "II" },
    { id: 2, name: "high", color: "#f2c94c", mark: "III" },
  ];

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function ease(t) {
    return t * t * (3 - 2 * t);
  }

  function makeRng(seed) {
    let s = seed >>> 0;
    return function rand() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function makeTimeline() {
    const items = [];
    const add = (time, kind, x, tone, opts = {}) => {
      items.push({ time, kind, x, tone, ...opts });
    };

    for (let t = 4.2; t < 11.2; t += 1.2) add(t, "drifter", 120 + (t % 2) * 220, 0, { cue: "learn one tone" });
    for (let t = 12.5; t < 23.8; t += 1.1) add(t, "drifter", t % 2 < 1 ? 115 : 365, t % 2 < 1 ? 0 : 1, { cue: "two tones" });
    for (let t = 25.5; t < 38.5; t += 1.4) {
      add(t, "chord", 96 + ((t * 47) % 280), Math.floor(t) % 2, { cue: "value window", burst: 4 });
    }
    for (let t = 41; t < 56.5; t += 1.05) add(t, "sweeper", t % 2 < 1 ? -30 : W + 30, Math.floor(t) % 3, { side: t % 2 < 1 ? 1 : -1, cue: "pressure" });
    for (let t = 58.5; t < 74.5; t += 1.7) {
      add(t, "chord", 85 + ((t * 73) % 310), Math.floor(t) % 3, { cue: "boss chord", burst: 5 });
    }
    add(59, "boss", W / 2, 2, { cue: "final bell" });
    return items.sort((a, b) => a.time - b.time);
  }

  class Game {
    constructor(seed = 1779657780) {
      this.seed = seed;
      this.rand = makeRng(seed);
      this.timeline = makeTimeline();
      this.reset();
    }

    reset() {
      this.frame = 0;
      this.time = 0;
      this.state = "title";
      this.player = { x: W / 2, y: H - 92, r: 10, speed: 250, cd: 0, flash: 0, inv: 0 };
      this.enemies = [];
      this.bullets = [];
      this.particles = [];
      this.spawnIndex = 0;
      this.score = 0;
      this.hp = 16;
      this.clear = false;
      this.metrics = {
        ringUses: 0,
        meaningfulRings: 0,
        emptyRings: 0,
        converted: 0,
        hits: 0,
        offscreenShots: 0,
        abruptExits: 0,
        bossReached: false,
        clear: false,
        damage: 0,
        markerFrames: 0,
        stateUnavailable: 0,
        stateReadyThin: 0,
        stateReadyUseful: 0,
        bossDefeated: false,
      };
    }

    start() {
      if (this.state === "title" || this.state === "over" || this.state === "clear") {
        this.reset();
        this.state = "play";
      }
    }

    update(input = {}) {
      if ((this.state === "title" || this.state === "over" || this.state === "clear") && input.ring) {
        this.start();
        return;
      }
      if (this.state !== "play") {
        this.frame++;
        return;
      }

      this.frame++;
      this.time += DT;
      this.player.cd = Math.max(0, this.player.cd - DT);
      this.player.flash = Math.max(0, this.player.flash - DT);
      this.player.inv = Math.max(0, this.player.inv - DT);

      let ax = 0;
      let ay = 0;
      if (input.left) ax -= 1;
      if (input.right) ax += 1;
      if (input.up) ay -= 1;
      if (input.down) ay += 1;
      const len = Math.hypot(ax, ay) || 1;
      this.player.x = clamp(this.player.x + (ax / len) * this.player.speed * DT, 24, W - 24);
      this.player.y = clamp(this.player.y + (ay / len) * this.player.speed * DT, H * 0.22, H - 28);

      this.spawnDue();
      this.updateEnemies();
      this.updateBullets();
      this.updateParticles();
      this.sampleState();
      if (input.ring) this.useRing();
      this.collide();

      if (this.hp <= 0) this.finish("over");
      if (this.time >= STAGE_SECONDS && this.state === "play") this.finish("clear");
    }

    spawnDue() {
      while (this.spawnIndex < this.timeline.length && this.timeline[this.spawnIndex].time <= this.time) {
        this.spawn(this.timeline[this.spawnIndex++]);
      }
    }

    spawn(ev) {
      const id = `${ev.kind}-${this.frame}-${this.enemies.length}`;
      if (ev.kind === "boss") {
        this.metrics.bossReached = true;
        this.enemies.push({ id, kind: "boss", x: ev.x, y: -70, tx: ev.x, ty: 116, tone: ev.tone, hp: 44, age: 0, fire: 0.55, r: 34, cue: ev.cue });
        return;
      }
      const side = ev.side || 0;
      const tx = ev.kind === "sweeper" ? (side > 0 ? W * 0.72 : W * 0.28) : ev.x;
      const ty = ev.kind === "chord" ? 160 + this.rand() * 80 : 145 + this.rand() * 140;
      const exitX = ev.kind === "sweeper" ? (side > 0 ? W + 42 : -42) : clamp(ev.x + (this.rand() - 0.5) * 220, 44, W - 44);
      this.enemies.push({
        id,
        kind: ev.kind,
        x: ev.x,
        y: ev.kind === "sweeper" ? 150 + this.rand() * 140 : -38,
        sx: ev.x,
        sy: ev.kind === "sweeper" ? 150 + this.rand() * 120 : -38,
        tx,
        ty,
        exitX,
        exitY: H + 46,
        tone: ev.tone,
        hp: ev.kind === "chord" ? 8 : 5,
        age: 0,
        life: ev.kind === "sweeper" ? 5.2 : 6.8,
        fire: ev.kind === "chord" ? 0.35 : 0.8,
        burst: ev.burst || 2,
        r: ev.kind === "chord" ? 18 : 15,
        cue: ev.cue,
      });
    }

    updateEnemies() {
      for (const e of this.enemies) {
        e.age += DT;
        if (e.kind === "boss") {
          e.y = e.y < e.ty ? e.y + 80 * DT : e.ty + Math.sin(this.time * 1.5) * 10;
          e.x = W / 2 + Math.sin(this.time * 0.8) * 70;
          e.fire -= DT;
          if (e.fire <= 0) {
            e.fire = 0.86;
            for (let i = -2; i <= 2; i++) this.fireBullet(e, e.tone, i * 0.3, 92 + Math.abs(i) * 13);
            e.tone = (e.tone + 1) % 3;
          }
          continue;
        }
        const enterT = Math.min(1, e.age / 1.0);
        if (e.age < e.life - 1.35) {
          const k = ease(enterT);
          e.x = e.sx + (e.tx - e.sx) * k + Math.sin((e.age + e.tone) * 2.1) * 14;
          e.y = e.sy + (e.ty - e.sy) * k;
        } else {
          const k = ease((e.age - (e.life - 1.35)) / 1.35);
          e.x = e.tx + (e.exitX - e.tx) * k;
          e.y = e.ty + (e.exitY - e.ty) * k;
        }
        e.fire -= DT;
        if (e.fire <= 0 && this.isVisible(e)) {
          e.fire = e.kind === "chord" ? 0.95 : 1.25;
          const count = e.kind === "chord" ? e.burst : 2;
          for (let i = 0; i < count; i++) this.fireBullet(e, (e.tone + i) % 3, (i - (count - 1) / 2) * 0.15, 70 + i * 9);
        } else if (e.fire <= 0 && !this.isVisible(e)) {
          e.fire = 0.2;
        }
      }
      this.enemies = this.enemies.filter(e => e.hp > 0 && e.y < H + 70 && e.x > -90 && e.x < W + 90);
    }

    fireBullet(e, tone, angleOffset, speed) {
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const base = Math.atan2(dy, dx) + angleOffset;
      this.bullets.push({
        x: e.x,
        y: e.y + e.r * 0.55,
        vx: Math.cos(base) * speed,
        vy: Math.sin(base) * speed,
        tone,
        r: 5.5,
        friendly: false,
        age: 0,
        mark: false,
      });
    }

    updateBullets() {
      for (const b of this.bullets) {
        b.age += DT;
        b.x += b.vx * DT;
        b.y += b.vy * DT;
        b.mark = !b.friendly && this.player.cd <= 0 && dist2(b, this.player) <= RING_RADIUS * RING_RADIUS;
        if (b.mark) this.metrics.markerFrames++;
      }
      this.bullets = this.bullets.filter(b => b.x > -28 && b.x < W + 28 && b.y > -38 && b.y < H + 38);
    }

    updateParticles() {
      for (const p of this.particles) {
        p.age += DT;
        p.x += p.vx * DT;
        p.y += p.vy * DT;
      }
      this.particles = this.particles.filter(p => p.age < p.life);
    }

    sampleState() {
      if (this.player.cd > 0) {
        this.metrics.stateUnavailable++;
      } else if (this.hasUsefulRing()) {
        this.metrics.stateReadyUseful++;
      } else {
        this.metrics.stateReadyThin++;
      }
    }

    hasUsefulRing() {
      return this.bullets.some(b => !b.friendly && dist2(b, this.player) <= RING_RADIUS * RING_RADIUS);
    }

    useRing() {
      if (this.player.cd > 0) return;
      this.metrics.ringUses++;
      let converted = 0;
      for (const b of this.bullets) {
        if (!b.friendly && dist2(b, this.player) <= RING_RADIUS * RING_RADIUS) {
          const a = Math.atan2(b.y - this.player.y, b.x - this.player.x);
          b.vx = Math.cos(a) * 290;
          b.vy = Math.sin(a) * 290;
          b.friendly = true;
          b.mark = false;
          converted++;
        }
      }
      if (converted) {
        this.metrics.meaningfulRings++;
        this.metrics.converted += converted;
        this.burst(this.player.x, this.player.y, "#d7fff2", 18, 160);
      } else {
        this.metrics.emptyRings++;
        this.burst(this.player.x, this.player.y, "#66706f", 6, 70);
      }
      this.player.cd = RING_CD;
    }

    collide() {
      for (const b of this.bullets) {
        if (b.friendly) {
          for (const e of this.enemies) {
            if (dist2(b, e) < (b.r + e.r) * (b.r + e.r)) {
              e.hp -= e.kind === "boss" ? 2 : 4;
              b.dead = true;
              this.metrics.hits++;
              this.score += e.kind === "boss" ? 90 : 40;
              this.burst(e.x, e.y, TONES[b.tone].color, e.kind === "boss" ? 10 : 7, 120);
              if (e.kind === "boss" && e.hp <= 0) {
                this.metrics.bossDefeated = true;
                this.finish("clear");
              }
            }
          }
        } else if (this.player.inv <= 0 && dist2(b, this.player) < (b.r + this.player.r) * (b.r + this.player.r)) {
          b.dead = true;
          this.hp--;
          this.metrics.damage++;
          this.player.flash = 0.28;
          this.player.inv = 1.35;
          this.burst(this.player.x, this.player.y, "#ffffff", 18, 180);
        }
      }
      this.bullets = this.bullets.filter(b => !b.dead);
      for (const e of this.enemies) {
        if (e.hp <= 0) {
          this.score += e.kind === "boss" ? 1000 : 150;
          this.burst(e.x, e.y, TONES[e.tone].color, e.kind === "boss" ? 42 : 18, 210);
        }
      }
    }

    burst(x, y, color, n, speed) {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + this.rand() * 0.35;
        const s = speed * (0.45 + this.rand() * 0.7);
        this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, age: 0, life: 0.35 + this.rand() * 0.45, color });
      }
    }

    finish(state) {
      if (this.state !== "play") return;
      this.state = state;
      this.clear = state === "clear";
      this.metrics.clear = this.clear;
      this.burst(this.player.x, this.player.y, state === "clear" ? "#f2c94c" : "#f05d5e", 36, 190);
    }

    isVisible(e) {
      return e.x > 0 && e.x < W && e.y > 0 && e.y < H;
    }

    snapshot() {
      return {
        state: this.state,
        time: Number(this.time.toFixed(2)),
        hp: this.hp,
        score: this.score,
        enemies: this.enemies.length,
        bullets: this.bullets.length,
        metrics: { ...this.metrics },
      };
    }

    draw(ctx) {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#101518");
      g.addColorStop(0.56, "#151a1d");
      g.addColorStop(1, "#0b0d10");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      this.drawGrid(ctx);

      for (const p of this.particles) {
        const k = 1 - p.age / p.life;
        ctx.globalAlpha = k;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + 3 * k, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const e of this.enemies) this.drawEnemy(ctx, e);
      for (const b of this.bullets) this.drawBullet(ctx, b);
      this.drawPlayer(ctx);
      this.drawHud(ctx);
      if (this.state === "title") this.drawOverlay(ctx, "RESONANCE CDX", "SPACE");
      if (this.state === "over") this.drawOverlay(ctx, "BROKEN", "SPACE");
      if (this.state === "clear") this.drawOverlay(ctx, "CLEAR", "SPACE");
    }

    drawGrid(ctx) {
      ctx.strokeStyle = "rgba(180, 210, 205, 0.07)";
      ctx.lineWidth = 1;
      for (let y = 40; y < H; y += 48) {
        ctx.beginPath();
        ctx.moveTo(24, y);
        ctx.lineTo(W - 24, y);
        ctx.stroke();
      }
    }

    drawPlayer(ctx) {
      const useful = this.hasUsefulRing();
      const ready = this.player.cd <= 0;
      ctx.strokeStyle = ready ? (useful ? "#d7fff2" : "rgba(215,255,242,0.42)") : "rgba(215,255,242,0.16)";
      ctx.lineWidth = useful ? 3 : 2;
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, RING_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      if (!ready) {
        ctx.strokeStyle = "#5f6b69";
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, RING_RADIUS - 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - this.player.cd / RING_CD));
        ctx.stroke();
      }
      ctx.fillStyle = this.player.flash > 0 ? "#ffffff" : "#d7fff2";
      ctx.beginPath();
      ctx.moveTo(this.player.x, this.player.y - 14);
      ctx.lineTo(this.player.x - 11, this.player.y + 12);
      ctx.lineTo(this.player.x + 11, this.player.y + 12);
      ctx.closePath();
      ctx.fill();
    }

    drawEnemy(ctx, e) {
      const tone = TONES[e.tone];
      ctx.fillStyle = e.kind === "boss" ? "#252c2d" : "#20282a";
      ctx.strokeStyle = tone.color;
      ctx.lineWidth = e.kind === "boss" ? 3 : 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = tone.color;
      ctx.font = e.kind === "boss" ? "bold 14px Segoe UI" : "bold 10px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(tone.mark, e.x, e.y + 4);
    }

    drawBullet(ctx, b) {
      const tone = TONES[b.tone];
      ctx.fillStyle = b.friendly ? "#d7fff2" : tone.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.friendly ? 4 : b.r, 0, Math.PI * 2);
      ctx.fill();
      if (b.mark) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 11 + Math.sin(this.time * 12) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    drawHud(ctx) {
      ctx.fillStyle = "#edf3f2";
      ctx.font = "13px Segoe UI";
      ctx.textAlign = "left";
      ctx.fillText(`HP ${this.hp}`, 18, 25);
      ctx.textAlign = "right";
      ctx.fillText(`${Math.max(0, STAGE_SECONDS - this.time).toFixed(0)}`, W - 18, 25);
    }

    drawOverlay(ctx, title, key) {
      ctx.fillStyle = "rgba(5, 8, 9, 0.72)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#edf3f2";
      ctx.textAlign = "center";
      ctx.font = "bold 34px Segoe UI";
      ctx.fillText(title, W / 2, H * 0.44);
      ctx.font = "bold 22px Segoe UI";
      ctx.fillText(key, W / 2, H * 0.53);
    }
  }

  const POLICIES = {
    route(game) {
      const p = game.player;
      const marked = game.bullets.filter(b => b.mark);
      const nearest = game.bullets.reduce((best, b) => {
        const d = dist2(b, p);
        return !best || d < best.d ? { b, d } : best;
      }, null);
      let tx = W / 2;
      let ty = H - 94;
      const boss = game.enemies.find(e => e.kind === "boss");
      if (boss) tx = clamp(boss.x, 48, W - 48);
      if (nearest && nearest.d < 145 * 145) {
        tx = clamp(p.x - (nearest.b.x - p.x) * 1.2, 32, W - 32);
        ty = clamp(p.y - (nearest.b.y - p.y) * 0.55, H * 0.25, H - 32);
      }
      return moveToward(p, tx, ty, game.player.cd <= 0 && marked.length >= 1);
    },
    noRing(game) {
      const p = game.player;
      return moveToward(p, W / 2 + Math.sin(game.time * 1.2) * 120, H - 90, false);
    },
    camper(game) {
      return moveToward(game.player, W / 2, H - 34, game.player.cd <= 0 && game.hasUsefulRing());
    },
    emptyRinger(game) {
      return moveToward(game.player, W / 2, H - 96, game.player.cd <= 0 && !game.hasUsefulRing());
    },
  };

  function moveToward(p, tx, ty, ring) {
    return {
      left: p.x > tx + 8,
      right: p.x < tx - 8,
      up: p.y > ty + 8,
      down: p.y < ty - 8,
      ring,
    };
  }

  function bootBrowser() {
    const canvas = root.document && root.document.getElementById("game");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const game = new Game();
    const input = { left: false, right: false, up: false, down: false, ring: false };
    const set = (key, v) => {
      if (key === "ArrowLeft" || key === "a") input.left = v;
      if (key === "ArrowRight" || key === "d") input.right = v;
      if (key === "ArrowUp" || key === "w") input.up = v;
      if (key === "ArrowDown" || key === "s") input.down = v;
      if (key === " ") input.ring = v;
    };
    root.addEventListener("keydown", e => {
      set(e.key, true);
      if (e.key === " ") e.preventDefault();
    });
    root.addEventListener("keyup", e => set(e.key, false));
    function loop() {
      game.update(input);
      game.draw(ctx);
      input.ring = false;
      root.requestAnimationFrame(loop);
    }
    loop();
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { Game, POLICIES, W, H, RING_RADIUS, STAGE_SECONDS };
  } else {
    bootBrowser();
  }
})(typeof window !== "undefined" ? window : globalThis);
