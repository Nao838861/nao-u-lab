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

  const LANES = [60, 120, 180, 240, 300, 360, 420];

  function ev(frame, kind, lane, block, opts = {}) {
    return {
      frame,
      kind,
      x: typeof lane === "number" ? (lane >= 0 && lane < LANES.length ? LANES[lane] : lane) : LANES[lane],
      y: opts.y == null ? -42 : opts.y,
      lane,
      block,
      role: opts.role || kind,
      route: opts.route || "down",
      side: opts.side || 0,
      fireCd: opts.fireCd == null ? 1.0 : opts.fireCd,
      phase: opts.phase || 0,
      shield: opts.shield || 0,
      playerIntent: opts.playerIntent || "",
      badPolicy: opts.badPolicy || [],
      label: block,
    };
  }

  function curveTrain(frame, side, lanes, block, opts = {}) {
    return lanes.map((lane, i) => ev(frame + i * (opts.stagger || 7), opts.kind || "curve", lane, block, {
      route: "curve",
      side,
      fireCd: opts.fireCd == null ? 99 : opts.fireCd + i * 0.1,
      phase: i * 0.45,
      role: "popcorn",
      playerIntent: opts.playerIntent,
      badPolicy: opts.badPolicy,
    }));
  }

  function sideFeed(frame, side, count, block, opts = {}) {
    return Array.from({ length: count }, (_, i) => ev(frame + i * (opts.stagger || 16), opts.kind || "feeder", side < 0 ? -28 : W + 28, block, {
      y: 130 + i * 18,
      route: "side",
      side,
      fireCd: opts.fireCd == null ? 1.3 : opts.fireCd + i * 0.08,
      phase: i * 0.5,
      role: "side-pressure",
      playerIntent: opts.playerIntent,
      badPolicy: opts.badPolicy,
    }));
  }

  function buildWaveEvents() {
    const events = [
      ...curveTrain(36, -1, [1, 2, 3, 3, 2, 1], "opening_curve_train", {
        playerIntent: "left-to-center shooting lane",
        badPolicy: ["blind-sweeper", "lane-holder"],
      }),
      ...curveTrain(350, 1, [5, 4, 3, 3, 4, 5], "mirror_answer", {
        fireCd: 1.7,
        playerIntent: "switch from left to right",
        badPolicy: ["lane-holder"],
      }),
      ...curveTrain(650, -1, [2, 3, 4, 3], "center_lane_bait", {
        kind: "curve",
        playerIntent: "enter center then leave",
        badPolicy: ["camper"],
      }),
      ev(720, "anchor", 3, "center_lane_bait", { route: "dwell", fireCd: 0.9, playerIntent: "first pulse drill", badPolicy: ["noPulse", "camper"] }),
      ...sideFeed(1020, -1, 3, "side_feeder_cover", { playerIntent: "watch side pressure while shooting center", badPolicy: ["camper", "blind-sweeper"] }),
      ...sideFeed(1080, 1, 3, "side_feeder_cover", { playerIntent: "watch side pressure while shooting center", badPolicy: ["camper", "blind-sweeper"] }),
      ev(1100, "anchor", 3, "side_feeder_cover", { route: "dwell", fireCd: 1.1, playerIntent: "keep center target while dodging side shots", badPolicy: ["camper"] }),
      ev(1500, "armored", 1, "armored_gate", { route: "side", side: -1, y: 155, shield: 0.75, fireCd: 1.1, playerIntent: "move to left gate and relay hard target", badPolicy: ["lane-holder", "pulseHeavy"] }),
      ev(1630, "armored", 5, "armored_gate", { route: "side", side: 1, y: 190, shield: 0.75, fireCd: 1.15, playerIntent: "switch to right gate", badPolicy: ["lane-holder", "pulseHeavy"] }),
      ...curveTrain(1760, 1, [4, 3, 2, 3], "armored_gate", { kind: "harvest", playerIntent: "recover rhythm after hard target" }),
      ...curveTrain(2040, -1, [1, 2, 3, 4, 5, 4, 3, 2], "relief_harvest", { kind: "harvest", playerIntent: "harvest readable formation", badPolicy: ["aggressive"] }),
      ...sideFeed(2460, -1, 2, "midboss_setup", { kind: "escort", playerIntent: "use vertical space before boss", badPolicy: ["survival"] }),
      ...sideFeed(2510, 1, 2, "midboss_setup", { kind: "escort", playerIntent: "use vertical space before boss", badPolicy: ["survival"] }),
      ev(2560, "armored", 3, "midboss_setup", { route: "dwell", shield: 0.6, fireCd: 0.9, playerIntent: "relay slow cluster under escort pressure", badPolicy: ["noPulse", "survival"] }),
      ...curveTrain(2860, -1, [1, 2, 3, 4, 5], "midboss_setup", { kind: "harvest", playerIntent: "short harvest after midboss setup", badPolicy: ["aggressive"] }),
      ...curveTrain(3140, 1, [5, 4, 3, 2], "boss_approach_final_braid", { playerIntent: "fast right-to-left integration", badPolicy: ["blind-sweeper"] }),
      ...sideFeed(3210, -1, 3, "boss_approach_final_braid", { playerIntent: "avoid side pressure before boss", badPolicy: ["camper"] }),
      ev(3300, "armored", 4, "boss_approach_final_braid", { route: "dwell", shield: 0.3, fireCd: 1.05, playerIntent: "final relay hard target", badPolicy: ["noPulse"] }),
      { frame: 3560, kind: "boss", x: W / 2, y: 92, route: "boss", block: "boss_relay_exam", role: "boss", fireCd: 1.05, playerIntent: "relay slow clusters into boss hp", badPolicy: ["noPulse", "pulseHeavy", "camper"], label: "boss_relay_exam" },
      ...curveTrain(3830, -1, [1, 2, 3, 4], "boss_relay_exam", { kind: "harvest", playerIntent: "boss fuel left", badPolicy: ["noPulse"] }),
      ...sideFeed(4100, 1, 3, "boss_relay_exam", { kind: "feeder", fireCd: 1.55, playerIntent: "boss side pressure right", badPolicy: ["camper"] }),
      ...curveTrain(4380, 1, [5, 4, 3, 2, 1], "boss_relay_exam", { kind: "harvest", playerIntent: "boss fuel right-to-left" }),
      ev(4680, "armored", 3, "boss_relay_exam", { route: "dwell", shield: 0.25, fireCd: 0.95, playerIntent: "late boss relay target", badPolicy: ["noPulse"] }),
      ...curveTrain(4960, -1, [1, 2, 3, 4, 5], "boss_relay_exam", { kind: "harvest", playerIntent: "late boss harvest" }),
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
        curve: { hp: 11, r: 13, speed: 76, score: 130, fireRate: 2.6 },
        feeder: { hp: 15, r: 14, speed: 72, score: 180, fireRate: 2.1 },
        anchor: { hp: 28, r: 18, speed: 32, score: 320, fireRate: 1.8 },
        armored: { hp: 58, r: 23, speed: 38, score: 520, fireRate: 1.55 },
        harvest: { hp: 8, r: 12, speed: 84, score: 110, fireRate: 99 },
        escort: { hp: 22, r: 16, speed: 66, score: 240, fireRate: 1.9 },
        boss: { hp: 190, r: 42, speed: 0, score: 4000, fireRate: 1.45 },
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
        route: opts.route || "down",
        side: opts.side || 0,
        lane: opts.lane,
        block: opts.block || opts.label || kind,
        role: opts.role || kind,
        shield: opts.shield || 0,
        spawnX: x,
        spawnY: y,
        targetX: opts.route === "side"
          ? (opts.side < 0 ? LANES[4] : LANES[2])
          : (typeof opts.lane === "number" ? (opts.lane >= 0 && opts.lane < LANES.length ? LANES[opts.lane] : opts.lane) : x),
        targetY: opts.route === "side" ? y : 155,
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
        if (e.kind === "boss") {
          e.x = W / 2 + Math.sin(e.age * 1.15) * 118;
          e.y = 86 + Math.sin(e.age * 0.9) * 12;
        } else if (e.route === "curve") {
          const t = clamp(e.age / 2.45, 0, 1);
          const startX = e.side < 0 ? -38 : W + 38;
          const control = e.side < 0 ? e.targetX + 92 : e.targetX - 92;
          e.x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * control + t * t * e.targetX;
          e.y = -42 + t * 245 + Math.sin(t * Math.PI) * 42;
          if (e.age > 2.45) e.y += (e.age - 2.45) * e.speed;
        } else if (e.route === "side") {
          const t = clamp(e.age / 1.55, 0, 1);
          const ease = t * t * (3 - 2 * t);
          e.x = e.spawnX + (e.targetX - e.spawnX) * ease;
          e.y = e.spawnY + Math.sin(t * Math.PI) * 36;
          if (e.age > 1.55) {
            e.y += (e.age - 1.55) * (e.kind === "armored" ? 34 : 62);
            e.x += Math.sin((e.age - 1.55) * 1.6 + e.phase) * (e.kind === "armored" ? 18 : 28);
          }
        } else if (e.route === "dwell") {
          if (e.y < 150) e.y += e.speed * DT;
          else {
            e.y += 5 * DT;
            e.x = e.baseX + Math.sin(e.age * 1.45 + e.phase) * (e.kind === "armored" ? 44 : 24);
          }
        } else {
          e.y += e.speed * DT;
        }
        e.fireCd -= DT;
        e.shield = Math.max(0, e.shield - DT);
        if (e.fireCd <= 0 && this.enemyBullets.length < 180 && e.y > 10) {
          const bottomCamp = this.player.y > H - 96;
          if (e.kind === "boss") {
            const pattern = Math.floor(e.age * 2) % 2;
            if (pattern === 0) {
              for (let i = -3; i <= 3; i++) this.fireAtPlayer(e, 76, i * 0.15);
            } else {
              for (let i = -2; i <= 2; i++) this.enemyBullets.push({ x: e.x + i * 18, y: e.y + 26, vx: i * 16, vy: 86, r: 5 });
            }
            if (bottomCamp) {
              this.fireAtPlayer(e, 188, -0.18);
              this.fireAtPlayer(e, 188, 0.18);
            }
          } else if (e.kind === "armored" || e.kind === "anchor") {
            this.fireAtPlayer(e, 108, -0.16);
            this.fireAtPlayer(e, 108, 0.16);
            this.enemyBullets.push({ x: e.x, y: e.y + 14, vx: 0, vy: 84, r: 5 });
            if (bottomCamp) {
              this.fireAtPlayer(e, 178, -0.05);
              this.fireAtPlayer(e, 178, 0.05);
            }
          } else if (e.kind === "feeder") {
            const bottomBias = this.player.y > H - 96 ? 48 * e.side : 0;
            this.fireAtPlayer(e, bottomCamp ? 176 : 128, bottomBias * 0.01);
          } else if (e.kind === "escort") {
            this.fireAtPlayer(e, 116, e.side * 0.18);
            if (bottomCamp) this.fireAtPlayer(e, 170, -e.side * 0.1);
          } else if (e.kind === "harvest") {
            if (e.age > 2.2) this.fireAtPlayer(e, 96);
          } else {
            if (e.age > 1.5) this.fireAtPlayer(e, 104);
          }
          e.fireCd = bottomCamp && ["feeder", "anchor", "armored", "escort", "boss"].includes(e.kind) ? e.fireRate * 0.48 : e.fireRate;
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
            if (e.shield > 0) {
              b.hit = true;
              this.particles.push({ x: b.x, y: b.y, life: 0.12, max: 0.12, kind: "shield" });
              break;
            }
            e.hp -= b.dmg;
            b.hit = true;
            if (b.relay) this.metrics.conversionHits++;
            this.particles.push({ x: b.x, y: b.y, life: b.relay ? 0.24 : 0.12, max: b.relay ? 0.24 : 0.12, kind: b.relay ? "relayHit" : "hit" });
            if (e.hp <= 0) {
              const bottomPenalty = this.player.y > H - 96 ? 0.35 : 1;
              this.score += Math.round((e.score + (b.relay ? 220 : 0)) * bottomPenalty);
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
    const colors = {
      curve: "#d17cff",
      feeder: "#ff8a68",
      anchor: "#7ed3ff",
      armored: "#a7df78",
      harvest: "#f4dc72",
      escort: "#ff6ca8",
      boss: "#e8a84a",
    };
    ctx.fillStyle = e.boss ? colors.boss : colors[e.kind] || "#d17cff";
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
      if (e.shield > 0) {
        ctx.rotate(-Math.PI / 4);
        ctx.strokeStyle = "#ffffff";
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.arc(0, 0, e.r + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
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
