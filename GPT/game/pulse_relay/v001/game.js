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
      this.waveIndex = 0;
      this.bossSpawned = false;
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
        scout: { hp: 16, r: 14, speed: 72, score: 120, fireRate: 1.45 },
        weaver: { hp: 22, r: 15, speed: 58, score: 160, fireRate: 1.25 },
        bruiser: { hp: 58, r: 22, speed: 36, score: 400, fireRate: 0.92 },
        boss: { hp: 340, r: 42, speed: 0, score: 3000, fireRate: 0.72 },
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
      });
      if (kind === "boss") this.metrics.bossReached = true;
    }

    schedule() {
      const f = this.frame;
      if (this.waveIndex === 0 && f === 40) {
        for (let i = 0; i < 5; i++) this.spawnEnemy("scout", 80 + i * 80, -30 - i * 18, { fireCd: 0.6 + i * 0.16 });
        this.waveIndex++;
      }
      if (this.waveIndex === 1 && f === 560) {
        for (let i = 0; i < 6; i++) this.spawnEnemy("weaver", 58 + i * 72, -40 - i * 28, { phase: i * 0.6, fireCd: 0.5 + i * 0.12 });
        this.waveIndex++;
      }
      if (this.waveIndex === 2 && f === 1180) {
        this.spawnEnemy("bruiser", 160, -48, { fireCd: 0.4 });
        this.spawnEnemy("bruiser", 320, -96, { fireCd: 0.8 });
        this.waveIndex++;
      }
      if (!this.bossSpawned && f === 2700) {
        this.spawnEnemy("boss", W / 2, 92, { fireCd: 0.9 });
        this.bossSpawned = true;
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
      for (const b of this.enemyBullets) {
        if (dist2(p, b) <= radius * radius) {
          converted++;
          const spread = (converted - 1) * 0.1;
          this.playerBullets.push({
            x: b.x,
            y: b.y,
            vx: Math.sin(spread) * 72,
            vy: -610 - Math.min(120, converted * 4),
            r: 5,
            dmg: 26,
            friendly: true,
            relay: true,
          });
          this.particles.push({ x: b.x, y: b.y, life: 0.22, max: 0.22, kind: "convert" });
        } else {
          next.push(b);
        }
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
              for (let i = -3; i <= 3; i++) this.fireAtPlayer(e, 112, i * 0.16);
            } else {
              for (let i = -2; i <= 2; i++) this.enemyBullets.push({ x: e.x + i * 18, y: e.y + 26, vx: i * 24, vy: 128, r: 5 });
            }
          } else if (e.kind === "bruiser") {
            this.fireAtPlayer(e, 155, -0.18);
            this.fireAtPlayer(e, 155, 0.18);
          } else {
            this.fireAtPlayer(e, 142);
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
        bossHp: boss ? boss.hp : 0,
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
    module.exports = { Game, W, H, DT };
  } else {
    root.PulseRelay = { Game };
    browserMain();
  }
})(typeof window !== "undefined" ? window : globalThis);
