(function (root) {
  "use strict";

  const W = 480;
  const H = 720;
  const DT = 1 / 60;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function makeRng(seed) {
    let s = seed >>> 0;
    return function rand() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function line(kind, frame, xs, opts = {}) {
    return xs.map((x, i) => ({
      frame: frame + Math.round((opts.stagger || 0) * i),
      kind,
      x,
      y: opts.y == null ? -34 - i * 10 : opts.y - i * 10,
      fireCd: (opts.fireCd || 0.7) + i * (opts.fireStep || 0.06),
      phase: (opts.phase || 0) + i * 0.55,
      label: opts.label || kind,
    }));
  }

  function buildWaveEvents() {
    const events = [
      ...line("scout", 40, [120, 240, 360], { stagger: 18, label: "W1 lanes" }),
      ...line("scout", 210, [80, 160, 320, 400], { stagger: 12, label: "W1 side fill" }),
      ...line("weaver", 420, [70, 170, 310, 410], { stagger: 20, label: "W2 weave lanes" }),
      ...line("scout", 620, [110, 190, 290, 370], { stagger: 14, label: "W2 shot fuel" }),
      ...line("bruiser", 860, [240], { stagger: 36, fireCd: 0.95, label: "W3 relay drill" }),
      ...line("scout", 940, [105, 170, 310, 375], { stagger: 14, label: "W3 relay targets" }),
      ...line("weaver", 1180, [90, 175, 305, 390], { stagger: 20, label: "W4 cross weave" }),
      ...line("bruiser", 1480, [160, 320], { stagger: 42, fireCd: 0.9, label: "W5 heavy lanes" }),
      ...line("scout", 1620, [82, 150, 220, 300, 370], { stagger: 12, label: "W5 small overlap" }),
      ...line("weaver", 1900, [110, 200, 280, 370], { stagger: 24, label: "W6 preboss weave" }),
      ...line("scout", 2100, [80, 145, 210, 270, 335, 400], { stagger: 10, label: "W6 preboss fuel" }),
      ...line("bruiser", 2320, [180, 300], { stagger: 48, fireCd: 0.85, label: "W7 gate pair" }),
      ...line("scout", 2520, [92, 154, 216, 278, 340, 402], { stagger: 9, label: "W7 gate fuel" }),
      { frame: 2760, kind: "boss", x: W / 2, y: 92, fireCd: 1.15, label: "BOSS" },
      ...line("scout", 3000, [105, 180, 300, 375], { stagger: 10, label: "B1 boss fuel" }),
      ...line("weaver", 3300, [95, 240, 385], { stagger: 18, label: "B2 boss weave" }),
      ...line("scout", 3600, [90, 160, 320, 390], { stagger: 10, label: "B3 boss fuel" }),
      ...line("bruiser", 3900, [240], { stagger: 40, fireCd: 0.85, label: "B4 boss heavy" }),
      ...line("scout", 4200, [105, 180, 300, 375], { stagger: 10, label: "B5 late fuel" }),
    ];
    return events.sort((a, b) => a.frame - b.frame);
  }

  const WAVE_EVENTS = buildWaveEvents();

  class Game {
    constructor(seed = 1779) {
      this.seed = seed;
      this.rand = makeRng(seed);
      this.reset();
    }

    reset() {
      this.t = 0;
      this.frame = 0;
      this.score = 0;
      this.state = "play";
      this.player = {
        x: W / 2,
        y: H - 76,
        r: 5,
        speed: 260,
        lives: 4,
        invuln: 0,
        pulseCd: 0,
        shotCd: 0,
      };
      this.enemies = [];
      this.enemyBullets = [];
      this.playerBullets = [];
      this.particles = [];
      this.stars = Array.from({ length: 80 }, () => ({
        x: this.rand() * W,
        y: this.rand() * H,
        s: 28 + this.rand() * 70,
        a: 0.28 + this.rand() * 0.55,
      }));
      this.waveEventIndex = 0;
      this.bossSpawned = false;
      this.spawnLog = [];
      this.metrics = {
        pulses: 0,
        converted: 0,
        conversionHits: 0,
        damageTaken: 0,
        bossReached: false,
        bossKilled: false,
        maxSurvival: 0,
      };
    }

    spawnEnemy(kind, x, y, opts = {}) {
      const base = {
        scout: { hp: 13, r: 14, speed: 68, score: 120, fireRate: 2.35 },
        weaver: { hp: 18, r: 15, speed: 54, score: 160, fireRate: 2.1 },
        bruiser: { hp: 46, r: 22, speed: 34, score: 400, fireRate: 1.7 },
        boss: { hp: 80, r: 42, speed: 0, score: 3000, fireRate: 1.45 },
      }[kind];
      this.enemies.push({
        kind,
        x,
        y,
        baseX: x,
        hp: base.hp,
        maxHp: base.hp,
        r: base.r,
        speed: base.speed,
        score: base.score,
        fireRate: base.fireRate,
        fireCd: opts.fireCd || 0.8,
        age: 0,
        boss: kind === "boss",
        phase: opts.phase || 0,
        label: opts.label || kind,
      });
      this.spawnLog.push({ frame: this.frame, time: this.t, kind, x, y, label: opts.label || kind });
      if (kind === "boss") {
        this.metrics.bossReached = true;
        this.bossSpawned = true;
      }
    }

    schedule() {
      while (this.waveEventIndex < WAVE_EVENTS.length && WAVE_EVENTS[this.waveEventIndex].frame <= this.frame) {
        const e = WAVE_EVENTS[this.waveEventIndex];
        this.spawnEnemy(e.kind, e.x, e.y, e);
        this.waveEventIndex++;
      }
    }

    update(input) {
      if (input.restart) this.reset();
      if (this.state !== "play") return;

      this.t += DT;
      this.frame++;
      this.metrics.maxSurvival = this.t;
      this.schedule();

      const p = this.player;
      const ix = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const iy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
      const len = Math.hypot(ix, iy) || 1;
      p.x = clamp(p.x + (ix / len) * p.speed * DT, 22, W - 22);
      p.y = clamp(p.y + (iy / len) * p.speed * DT, 80, H - 28);
      p.invuln = Math.max(0, p.invuln - DT);
      p.pulseCd = Math.max(0, p.pulseCd - DT);
      p.shotCd -= DT;
      if (p.shotCd <= 0) {
        this.playerBullets.push({ x: p.x - 7, y: p.y - 13, vx: 0, vy: -520, r: 3, dmg: 7, friendly: true, relay: false });
        this.playerBullets.push({ x: p.x + 7, y: p.y - 13, vx: 0, vy: -520, r: 3, dmg: 7, friendly: true, relay: false });
        p.shotCd = 0.115;
      }
      if (input.pulse && p.pulseCd <= 0) this.pulse();

      this.updateEnemies();
      this.updateBullets();
      this.updateCollisions();
      this.updateParticles();

      if (p.lives <= 0) this.state = "over";
      if (this.bossSpawned && !this.enemies.some(e => e.boss) && this.state === "play") {
        this.state = "clear";
        this.metrics.bossKilled = true;
      }
    }

    pulse() {
      const p = this.player;
      const radius = 92;
      let converted = 0;
      const next = [];
      const convertedBullets = [];
      for (const b of this.enemyBullets) {
        if (dist2(p, b) <= radius * radius) {
          convertedBullets.push(b);
          this.particles.push({ x: b.x, y: b.y, life: 0.22, max: 0.22, kind: "convert" });
        } else {
          next.push(b);
        }
      }
      converted = convertedBullets.length;
      for (let i = 0; i < convertedBullets.length; i++) {
        const b = convertedBullets[i];
        const spread = (i - (convertedBullets.length - 1) / 2) * 0.12;
        const target = this.enemies
          .filter(e => e.y > -20 && e.y < H * 0.82)
          .sort((a, c) => {
            const da = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
            const dc = (c.x - b.x) * (c.x - b.x) + (c.y - b.y) * (c.y - b.y);
            return da - dc;
          })[0];
        let vx = Math.sin(spread) * 96;
        let vy = -640 - Math.min(130, convertedBullets.length * 5);
        if (target) {
          const dx = target.x - b.x;
          const dy = target.y - b.y;
          const len = Math.hypot(dx, dy) || 1;
          vx = (dx / len) * 690 + Math.sin(spread) * 48;
          vy = (dy / len) * 690;
        }
        this.playerBullets.push({
          x: b.x,
          y: b.y,
          vx,
          vy,
          r: 5,
          dmg: 28,
          friendly: true,
          relay: true,
        });
      }
      this.enemyBullets = next;
      p.pulseCd = 1.8;
      this.metrics.pulses++;
      this.metrics.converted += converted;
      this.particles.push({ x: p.x, y: p.y, life: 0.18, max: 0.18, kind: "ring", count: converted });
    }

    fireAtPlayer(e, speed, offset = 0) {
      const p = this.player;
      const a = Math.atan2(p.y - e.y, p.x - e.x) + offset;
      this.enemyBullets.push({ x: e.x, y: e.y + 12, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: 5 });
    }

    updateEnemies() {
      for (const e of this.enemies) {
        e.age += DT;
        if (e.kind === "scout") {
          e.y += e.speed * DT;
        } else if (e.kind === "weaver") {
          e.y += e.speed * DT;
          e.x = e.baseX + Math.sin(e.age * 2.4 + e.phase) * 34;
        } else if (e.kind === "bruiser") {
          e.y += e.y < 120 ? e.speed * DT : 8 * DT;
          e.x = e.baseX + Math.sin(e.age * 1.4 + e.phase) * 52;
        } else if (e.kind === "boss") {
          e.x = W / 2 + Math.sin(e.age * 1.15) * 118;
          e.y = 86 + Math.sin(e.age * 0.9) * 12;
        }
        e.fireCd -= DT;
        if (e.fireCd <= 0 && this.enemyBullets.length < 160) {
          if (e.kind === "boss") {
            const pattern = Math.floor(e.age * 2) % 2;
            if (pattern === 0) {
              for (let i = -3; i <= 3; i++) this.fireAtPlayer(e, 88, i * 0.16);
            } else {
              for (let i = -2; i <= 2; i++) this.enemyBullets.push({ x: e.x + i * 18, y: e.y + 26, vx: i * 18, vy: 100, r: 5 });
            }
          } else if (e.kind === "bruiser") {
            this.fireAtPlayer(e, 128, -0.18);
            this.fireAtPlayer(e, 128, 0.18);
          } else {
            this.fireAtPlayer(e, e.kind === "weaver" ? 124 : 116);
          }
          e.fireCd = e.fireRate;
        }
      }
      this.enemies = this.enemies.filter(e => e.y < H + 70 && e.hp > 0);
    }

    updateBullets() {
      for (const b of this.enemyBullets) {
        b.x += b.vx * DT;
        b.y += b.vy * DT;
      }
      for (const b of this.playerBullets) {
        b.x += b.vx * DT;
        b.y += b.vy * DT;
      }
      this.enemyBullets = this.enemyBullets.filter(b => b.x > -30 && b.x < W + 30 && b.y > -40 && b.y < H + 40);
      this.playerBullets = this.playerBullets.filter(b => b.x > -40 && b.x < W + 40 && b.y > -50 && b.y < H + 30);
      for (const s of this.stars) {
        s.y += s.s * DT;
        if (s.y > H) {
          s.y = 0;
          s.x = this.rand() * W;
        }
      }
    }

    updateCollisions() {
      const p = this.player;
      for (const b of this.playerBullets) {
        if (b.hit) continue;
        for (const e of this.enemies) {
          if (dist2(b, e) <= (b.r + e.r) * (b.r + e.r)) {
            e.hp -= b.dmg;
            b.hit = true;
            if (b.relay) this.metrics.conversionHits++;
            this.particles.push({ x: b.x, y: b.y, life: b.relay ? 0.24 : 0.12, max: b.relay ? 0.24 : 0.12, kind: b.relay ? "relayHit" : "hit" });
            if (e.hp <= 0) {
              this.score += e.score + (b.relay ? 80 : 0);
              this.particles.push({ x: e.x, y: e.y, life: 0.36, max: 0.36, kind: "boom" });
            }
            break;
          }
        }
      }
      this.playerBullets = this.playerBullets.filter(b => !b.hit);
      if (p.invuln <= 0) {
        for (const b of this.enemyBullets) {
          if (dist2(p, b) <= (p.r + b.r) * (p.r + b.r)) {
            this.takeDamage();
            b.dead = true;
            break;
          }
        }
        for (const e of this.enemies) {
          if (dist2(p, e) <= (p.r + e.r - 2) * (p.r + e.r - 2)) {
            this.takeDamage();
            break;
          }
        }
      }
      this.enemyBullets = this.enemyBullets.filter(b => !b.dead);
    }

    takeDamage() {
      const p = this.player;
      p.lives--;
      p.invuln = 1.15;
      p.pulseCd = Math.min(p.pulseCd, 0.35);
      this.metrics.damageTaken++;
      this.particles.push({ x: p.x, y: p.y, life: 0.42, max: 0.42, kind: "damage" });
    }

    updateParticles() {
      for (const q of this.particles) q.life -= DT;
      this.particles = this.particles.filter(q => q.life > 0);
    }

    snapshot() {
      const boss = this.enemies.find(e => e.boss);
      return {
        state: this.state,
        time: this.t,
        score: this.score,
        lives: this.player.lives,
        converted: this.metrics.converted,
        pulses: this.metrics.pulses,
        conversionHits: this.metrics.conversionHits,
        bossReached: this.metrics.bossReached,
        bossKilled: this.metrics.bossKilled,
        damageTaken: this.metrics.damageTaken,
        bossHp: boss ? boss.hp : 0,
        enemies: this.enemies.length,
        enemyBullets: this.enemyBullets.length,
        playerBullets: this.playerBullets.length,
      };
    }
  }

  function drawGame(ctx, game) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0c1018";
    ctx.fillRect(0, 0, W, H);
    for (const s of game.stars) {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = "#d7e9ff";
      ctx.fillRect(s.x, s.y, 2, 2);
    }
    ctx.globalAlpha = 1;

    for (const e of game.enemies) drawEnemy(ctx, e);
    for (const b of game.playerBullets) {
      ctx.fillStyle = b.relay ? "#f5fbff" : "#72c8ff";
      ctx.shadowColor = b.relay ? "#ffffff" : "#3aa3ff";
      ctx.shadowBlur = b.relay ? 12 : 6;
      circle(ctx, b.x, b.y, b.r);
    }
    ctx.shadowBlur = 0;
    for (const b of game.enemyBullets) {
      ctx.fillStyle = "#ff5d68";
      ctx.shadowColor = "#ff293a";
      ctx.shadowBlur = 8;
      circle(ctx, b.x, b.y, b.r);
    }
    ctx.shadowBlur = 0;
    drawPlayer(ctx, game.player);
    drawParticles(ctx, game.particles);
    drawHud(ctx, game);
  }

  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEnemy(ctx, e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.fillStyle = e.boss ? "#e8a84a" : e.kind === "bruiser" ? "#a7df78" : "#d17cff";
    ctx.strokeStyle = "#111722";
    ctx.lineWidth = 2;
    if (e.boss) {
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(46, 0);
      ctx.lineTo(0, 42);
      ctx.lineTo(-46, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-e.r, -e.r, e.r * 2, e.r * 2);
      ctx.strokeRect(-e.r, -e.r, e.r * 2, e.r * 2);
    }
    ctx.restore();
  }

  function drawPlayer(ctx, p) {
    const ready = p.pulseCd <= 0;
    const pulseRadius = 92;
    ctx.save();
    ctx.globalAlpha = ready ? 0.38 : 0.14;
    ctx.strokeStyle = ready ? "#bff4ff" : "#67778c";
    ctx.lineWidth = ready ? 3 : 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, pulseRadius * (ready ? 1 : 1 - p.pulseCd / 1.8 * 0.28), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = p.invuln > 0 && Math.floor(p.invuln * 16) % 2 === 0 ? 0.35 : 1;
    ctx.fillStyle = "#70e0ff";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 18);
    ctx.lineTo(p.x + 14, p.y + 14);
    ctx.lineTo(p.x, p.y + 7);
    ctx.lineTo(p.x - 14, p.y + 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    circle(ctx, p.x, p.y, p.r);
    ctx.restore();
  }

  function drawParticles(ctx, particles) {
    for (const q of particles) {
      const k = q.life / q.max;
      ctx.globalAlpha = Math.max(0, k);
      if (q.kind === "ring") {
        ctx.strokeStyle = q.count > 0 ? "#ffffff" : "#5c6b7e";
        ctx.lineWidth = q.count > 0 ? 4 : 2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 24 + (1 - k) * 88, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = q.kind === "damage" ? "#ff394a" : q.kind === "relayHit" ? "#ffffff" : "#8fdcff";
        circle(ctx, q.x, q.y, 6 + (1 - k) * 20);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawHud(ctx, game) {
    const p = game.player;
    ctx.fillStyle = "#eef6ff";
    ctx.font = "16px Segoe UI, sans-serif";
    ctx.fillText(`LIFE ${p.lives}`, 18, 28);
    ctx.fillText(`SCORE ${game.score}`, 18, 52);
    ctx.fillText(`RELAY ${game.metrics.converted}`, 18, 76);
    const cdw = 112;
    ctx.strokeStyle = "#38445a";
    ctx.strokeRect(W - 132, 18, cdw, 10);
    ctx.fillStyle = p.pulseCd <= 0 ? "#bff4ff" : "#5f7894";
    ctx.fillRect(W - 132, 18, cdw * (1 - clamp(p.pulseCd / 1.8, 0, 1)), 10);
    ctx.fillStyle = "#cfd9e8";
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.fillText("PULSE", W - 132, 44);
    const boss = game.enemies.find(e => e.boss);
    if (boss) {
      ctx.strokeStyle = "#4b3940";
      ctx.strokeRect(96, 18, 288, 10);
      ctx.fillStyle = "#ffb357";
      ctx.fillRect(96, 18, 288 * clamp(boss.hp / boss.maxHp, 0, 1), 10);
    }
    if (game.state !== "play") {
      ctx.fillStyle = "rgba(5, 8, 14, 0.72)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "42px Segoe UI, sans-serif";
      ctx.fillText(game.state === "clear" ? "CLEAR" : "GAME OVER", W / 2, H / 2 - 28);
      ctx.font = "18px Segoe UI, sans-serif";
      ctx.fillText("Press R to restart", W / 2, H / 2 + 18);
      ctx.textAlign = "left";
    }
  }

  function browserMain() {
    const canvas = document.getElementById("game");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const game = new Game(1779);
    const keys = new Set();
    window.addEventListener("keydown", e => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
      keys.add(e.code);
    });
    window.addEventListener("keyup", e => keys.delete(e.code));
    function input() {
      const pulse = keys.has("Space");
      const restart = keys.has("KeyR");
      return {
        left: keys.has("ArrowLeft") || keys.has("KeyA"),
        right: keys.has("ArrowRight") || keys.has("KeyD"),
        up: keys.has("ArrowUp") || keys.has("KeyW"),
        down: keys.has("ArrowDown") || keys.has("KeyS"),
        pulse,
        restart,
      };
    }
    let pulseWasDown = false;
    function loop() {
      const raw = input();
      const edge = raw.pulse && !pulseWasDown;
      pulseWasDown = raw.pulse;
      raw.pulse = edge;
      game.update(raw);
      drawGame(ctx, game);
      requestAnimationFrame(loop);
    }
    loop();
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { Game, W, H, DT, WAVE_EVENTS };
  } else {
    root.PulseRelay = { Game };
    browserMain();
  }
})(typeof window !== "undefined" ? window : globalThis);
