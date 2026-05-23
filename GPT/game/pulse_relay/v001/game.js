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

  function easeMotion(t, mode = "smooth") {
    if (mode === "linear") return t;
    if (mode === "outCubic") return 1 - Math.pow(1 - t, 3);
    if (mode === "inCubic") return t * t * t;
    if (mode === "snapOut") return 1 - Math.pow(1 - t, 2);
    return t * t * (3 - 2 * t);
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
      path: opts.path || null,
      targetX: opts.targetX,
      targetY: opts.targetY,
      exitX: opts.exitX,
      playerIntent: opts.playerIntent || "",
      badPolicy: opts.badPolicy || [],
      label: block,
    };
  }

  function lineColumn(frame, lane, count, block, opts = {}) {
    const stagger = Math.max(opts.stagger || 18, 18);
    return Array.from({ length: count }, (_, i) => {
      const x = LANES[lane] == null ? lane : LANES[lane];
      const endY = (opts.endY == null ? 235 : opts.endY) - i * (opts.stepY || 14);
      return ev(frame + i * stagger, opts.kind || "harvest", x, block, {
        route: "line",
        targetX: x,
        targetY: endY,
        fireCd: opts.fireCd == null ? 99 : opts.fireCd + i * 0.04,
        phase: i,
        role: opts.role || "line-column",
        playerIntent: opts.playerIntent,
        badPolicy: opts.badPolicy,
      });
    });
  }

  function vBurst(frame, centerLane, count, block, opts = {}) {
    const half = (count - 1) / 2;
    return Array.from({ length: count }, (_, i) => {
      const offset = i - half;
      const x = LANES[centerLane] + offset * (opts.spacing || 31);
      return ev(frame + Math.abs(offset) * (opts.stagger || 8), opts.kind || "curve", x, block, {
        route: "v",
        targetX: x,
        targetY: opts.endY == null ? 245 : opts.endY,
        exitX: x + (offset < 0 ? -92 : 92),
        fireCd: opts.fireCd == null ? 99 : opts.fireCd,
        side: offset < 0 ? -1 : 1,
        phase: Math.abs(offset) * 2 + (offset < 0 ? 1 : 0),
        role: opts.role || "v-burst",
        playerIntent: opts.playerIntent,
        badPolicy: opts.badPolicy,
      });
    });
  }

  function crossSweep(frame, side, count, block, opts = {}) {
    const stagger = Math.max(opts.stagger || 16, 16);
    return Array.from({ length: count }, (_, i) => ev(frame + i * stagger, opts.kind || "feeder", side < 0 ? -30 : W + 30, block, {
      y: opts.y == null ? 170 : opts.y,
      route: "side",
      side,
      targetX: side < 0 ? W * 0.58 : W * 0.42,
      exitX: side < 0 ? W + 34 : -34,
      fireCd: opts.fireCd == null ? 1.35 : opts.fireCd + i * 0.06,
      phase: i,
      role: opts.role || "cross-sweep",
      playerIntent: opts.playerIntent,
      badPolicy: opts.badPolicy,
    }));
  }

  function diveSlash(frame, startLane, count, block, opts = {}) {
    return Array.from({ length: count }, (_, i) => {
      const x = (LANES[startLane] == null ? startLane : LANES[startLane]) + i * (opts.dx || 22);
      return ev(frame + i * (opts.stagger || 9), opts.kind || "curve", x, block, {
        route: "dive",
        targetX: x,
        targetY: (opts.targetY == null ? 360 : opts.targetY) + (i % 3) * 8,
        exitX: x + (x < W / 2 ? -118 : 118),
        fireCd: opts.fireCd == null ? 99 : opts.fireCd,
        side: x < W / 2 ? -1 : 1,
        phase: i,
        role: opts.role || "dive-slash",
        playerIntent: opts.playerIntent,
        badPolicy: opts.badPolicy,
      });
    });
  }

  function largeDeadline(frame, lane, block, opts = {}) {
    const x = LANES[lane] == null ? lane : LANES[lane];
    return ev(frame, opts.kind || "armored", x, block, {
      route: "large",
      targetX: x,
      targetY: opts.targetY == null ? 178 : opts.targetY,
      shield: opts.shield == null ? 0.45 : opts.shield,
      fireCd: opts.fireCd == null ? 0.85 : opts.fireCd,
      role: opts.role || "deadline",
      playerIntent: opts.playerIntent,
      badPolicy: opts.badPolicy,
    });
  }

  function buildWaveEvents() {
    const events = [
      ...lineColumn(36, 3, 7, "opening_curve_train", {
        kind: "harvest",
        playerIntent: "center column to start immediate shooting",
        badPolicy: ["blind-sweeper", "lane-holder"],
      }),
      ...lineColumn(68, 1, 8, "opening_curve_train", {
        kind: "harvest",
        playerIntent: "left column after center",
        badPolicy: ["blind-sweeper", "lane-holder"],
      }),
      ...lineColumn(74, 5, 5, "opening_curve_train", {
        kind: "harvest",
        playerIntent: "right column after center",
        badPolicy: ["blind-sweeper", "lane-holder"],
      }),
      ...crossSweep(260, 1, 10, "mirror_answer", {
        kind: "feeder",
        y: 165,
        playerIntent: "right-to-left crossing targets",
        badPolicy: ["lane-holder", "camper"],
      }),
      ...lineColumn(300, 2, 4, "mirror_answer", {
        kind: "harvest",
        playerIntent: "center-left recovery line",
        badPolicy: ["lane-holder"],
      }),
      ...lineColumn(312, 4, 4, "mirror_answer", {
        kind: "harvest",
        playerIntent: "center-right recovery line",
        badPolicy: ["lane-holder"],
      }),
      ...vBurst(520, 3, 5, "center_lane_bait", {
        kind: "curve",
        playerIntent: "readable V burst before relay target",
        badPolicy: ["camper"],
      }),
      largeDeadline(600, 3, "center_lane_bait", { kind: "anchor", targetY: 170, fireCd: 0.9, playerIntent: "first pulse drill with a fixed deadline", badPolicy: ["noPulse", "camper"] }),
      ...diveSlash(655, 0, 7, "center_lane_bait", { kind: "curve", dx: 52, playerIntent: "sharp dive accents around anchor", badPolicy: ["camper"] }),
      ...lineColumn(690, 1, 4, "center_lane_bait", { kind: "harvest", playerIntent: "left-side reward line after anchor", badPolicy: ["camper"] }),
      ...crossSweep(760, -1, 8, "side_feeder_cover", { kind: "feeder", y: 150, playerIntent: "left crossing pressure while shooting center", badPolicy: ["camper", "blind-sweeper"] }),
      ...crossSweep(810, 1, 8, "side_feeder_cover", { kind: "feeder", y: 225, playerIntent: "right crossing answer", badPolicy: ["camper", "blind-sweeper"] }),
      largeDeadline(880, 3, "side_feeder_cover", { kind: "anchor", targetY: 182, fireCd: 1.0, playerIntent: "center relay target under crossing side pressure", badPolicy: ["camper"] }),
      largeDeadline(1080, 1, "armored_gate", { kind: "armored", targetY: 170, shield: 0.45, fireCd: 0.92, playerIntent: "left hard target deadline", badPolicy: ["lane-holder", "pulseHeavy"] }),
      ...crossSweep(1130, -1, 7, "armored_gate", { kind: "escort", y: 190, playerIntent: "left hard target cover", badPolicy: ["lane-holder", "pulseHeavy"] }),
      largeDeadline(1270, 5, "armored_gate", { kind: "armored", targetY: 190, shield: 0.45, fireCd: 0.96, playerIntent: "right hard target deadline", badPolicy: ["lane-holder", "pulseHeavy"] }),
      ...lineColumn(1340, 4, 7, "armored_gate", { kind: "harvest", playerIntent: "post-hard-target reward line" }),
      ...lineColumn(1500, 1, 7, "relief_harvest", { kind: "harvest", playerIntent: "left relief harvest", badPolicy: ["aggressive"] }),
      ...lineColumn(1520, 3, 8, "relief_harvest", { kind: "harvest", playerIntent: "center relief harvest", badPolicy: ["aggressive"] }),
      ...lineColumn(1540, 5, 7, "relief_harvest", { kind: "harvest", playerIntent: "right relief harvest", badPolicy: ["aggressive"] }),
      ...vBurst(1710, 3, 5, "relief_harvest", { kind: "curve", playerIntent: "short shape change after harvest", badPolicy: ["aggressive"] }),
      ...crossSweep(1880, -1, 7, "midboss_setup", { kind: "escort", y: 160, playerIntent: "left escort before midboss", badPolicy: ["survival"] }),
      ...crossSweep(1930, 1, 7, "midboss_setup", { kind: "escort", y: 250, playerIntent: "right escort before midboss", badPolicy: ["survival"] }),
      largeDeadline(1990, 3, "midboss_setup", { kind: "armored", targetY: 178, shield: 0.35, fireCd: 0.82, playerIntent: "relay hard target under escort pressure", badPolicy: ["noPulse", "survival"] }),
      ...diveSlash(2090, 1, 7, "midboss_setup", { kind: "harvest", targetY: 370, dx: 42, playerIntent: "short harvest after midboss setup", badPolicy: ["aggressive"] }),
      ...vBurst(2280, 4, 5, "boss_approach_final_braid", { kind: "curve", playerIntent: "right-to-left V integration", badPolicy: ["blind-sweeper"] }),
      ...crossSweep(2340, -1, 8, "boss_approach_final_braid", { kind: "feeder", y: 190, playerIntent: "crossing pressure before boss", badPolicy: ["camper"] }),
      largeDeadline(2420, 4, "boss_approach_final_braid", { kind: "armored", targetY: 185, shield: 0.25, fireCd: 0.9, playerIntent: "final hard target deadline", badPolicy: ["noPulse"] }),
      ...lineColumn(2510, 2, 6, "boss_approach_final_braid", { kind: "harvest", playerIntent: "last clean shooting line before boss" }),
      { frame: 2700, kind: "boss", x: W / 2, y: -52, route: "boss", block: "boss_relay_exam", role: "boss", fireCd: 1.05, playerIntent: "boss entry with fuel waves", badPolicy: ["noPulse", "pulseHeavy", "camper"], label: "boss_relay_exam" },
      ...lineColumn(2860, 1, 7, "boss_relay_exam", { kind: "harvest", playerIntent: "boss fuel left", badPolicy: ["noPulse"] }),
      ...crossSweep(3000, 1, 8, "boss_relay_exam", { kind: "feeder", fireCd: 1.45, y: 180, playerIntent: "boss side pressure right", badPolicy: ["camper"] }),
      ...lineColumn(3180, 5, 7, "boss_relay_exam", { kind: "harvest", playerIntent: "boss fuel right", badPolicy: ["noPulse"] }),
      largeDeadline(3400, 3, "boss_relay_exam", { kind: "armored", targetY: 185, shield: 0.2, fireCd: 0.88, playerIntent: "late boss relay target", badPolicy: ["noPulse"] }),
      ...diveSlash(3540, 0, 8, "boss_relay_exam", { kind: "harvest", targetY: 380, dx: 54, playerIntent: "late boss dive fuel" }),
      ...crossSweep(3780, -1, 8, "boss_relay_exam", { kind: "feeder", y: 240, playerIntent: "final crossing fuel", badPolicy: ["camper"] }),
      ...lineColumn(3980, 3, 8, "boss_relay_exam", { kind: "harvest", playerIntent: "final center boss fuel" }),
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
        curve: { hp: 8, r: 13, speed: 92, score: 130, fireRate: 2.6 },
        feeder: { hp: 11, r: 14, speed: 86, score: 180, fireRate: 2.0 },
        anchor: { hp: 24, r: 18, speed: 72, score: 320, fireRate: 1.6 },
        armored: { hp: 46, r: 23, speed: 64, score: 520, fireRate: 1.45 },
        harvest: { hp: 6, r: 12, speed: 104, score: 110, fireRate: 99 },
        escort: { hp: 16, r: 16, speed: 86, score: 240, fireRate: 1.8 },
        boss: { hp: 620, r: 42, speed: 0, score: 4000, fireRate: 1.35 },
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
        phaseLockFlash: 0,
        route: opts.route || "down",
        side: opts.side || 0,
        lane: opts.lane,
        block: opts.block || opts.label || kind,
        role: opts.role || kind,
        playerIntent: opts.playerIntent || "",
        badPolicy: opts.badPolicy || [],
        shield: opts.shield || 0,
        spawnX: x,
        spawnY: y,
        targetX: opts.targetX == null
          ? (opts.route === "side"
            ? (opts.side < 0 ? W * 0.58 : W * 0.42)
            : (typeof opts.lane === "number" ? (opts.lane >= 0 && opts.lane < LANES.length ? LANES[opts.lane] : opts.lane) : x))
          : opts.targetX,
        targetY: opts.targetY == null ? (opts.route === "side" ? y : 155) : opts.targetY,
        exitX: opts.exitX,
        path: opts.path || null,
        pathIdx: 0,
        pathT: 0,
        done: false,
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
          r: 8,
          dmg: 34,
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

    fireAtPlayer(e, speed, offset = 0, opts = {}) {
      const p = this.player;
      const a = Math.atan2(p.y - e.y, p.x - e.x) + offset;
      this.enemyBullets.push({
        x: e.x,
        y: e.y + (opts.yOffset == null ? 12 : opts.yOffset),
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        r: opts.r || 4,
        role: opts.role || "aim",
      });
    }

    fireFan(e, count, speed, spread, role) {
      const mid = (count - 1) / 2;
      for (let i = 0; i < count; i++) this.fireAtPlayer(e, speed, (i - mid) * spread, { role });
    }

    fireGate(e, vx, vy, role, opts = {}) {
      this.enemyBullets.push({
        x: e.x + (opts.xOffset || 0),
        y: e.y + (opts.yOffset == null ? 14 : opts.yOffset),
        vx,
        vy,
        r: opts.r || 4,
        role,
      });
    }

    fireLaneGate(e, offsets, vy, role) {
      for (const xOffset of offsets) this.fireGate(e, xOffset * 0.22, vy, role, { xOffset });
    }

    updateEnemies() {
      for (const e of this.enemies) {
        e.age += DT;
        if (e.kind === "boss") {
          const entry = clamp(e.age / 3.0, 0, 1);
          const ease = entry * entry * (3 - 2 * entry);
          e.x = W / 2 + Math.sin(Math.max(0, e.age - 3.0) * 1.05) * 104;
          e.y = -52 + (116 + 52) * ease + Math.sin(Math.max(0, e.age - 3.0) * 0.9) * 10;
        } else if (e.route === "line") {
          // Shot_log pTopDown style: readable harvest train, no hover, misses exit downward.
          this.movePathEnemy(e, [
            { x: e.spawnX, y: -42, t: 0 },
            { x: e.targetX, y: e.targetY, t: 140, ease: "linear" },
            { x: e.targetX, y: H + 62, t: 160, ease: "smooth" },
          ]);
        } else if (e.route === "v") {
          // V bursts are a fold-out cue: enter as a readable shape, then peel back upward.
          this.movePathEnemy(e, [
            { x: e.spawnX, y: -42, t: 0 },
            { x: e.targetX, y: e.targetY, t: 150, ease: "smooth" },
            { x: e.exitX, y: -58, t: 140, ease: "smooth" },
          ]);
        } else if (e.route === "dive") {
          // Dive slashes make a fast accent, kick once near the lane, then flee upward.
          this.movePathEnemy(e, [
            { x: e.spawnX, y: -42, t: 0 },
            { x: e.targetX, y: e.targetY, t: 100, ease: "outCubic" },
            { x: e.targetX, y: e.targetY - 30, t: 40, ease: "linear" },
            { x: e.exitX, y: -58, t: 110, ease: "outCubic" },
          ]);
        } else if (e.route === "side") {
          // Side enemies are crossing pressure: keep their travel direction and clear the lane.
          this.movePathEnemy(e, [
            { x: e.spawnX, y: e.spawnY - 26, t: 0 },
            { x: e.targetX, y: e.spawnY, t: 110, ease: "linear" },
            { x: e.exitX == null ? (e.side < 0 ? W + 34 : -34) : e.exitX, y: e.spawnY - 26, t: 110, ease: "linear" },
          ]);
        } else if (e.route === "large") {
          // Large enemies are deadlines: descend, hold long enough to demand focus, then retreat.
          this.movePathEnemy(e, [
            { x: e.spawnX, y: -42, t: 0 },
            { x: e.targetX, y: e.targetY, t: 136, ease: "smooth" },
            { x: e.targetX, y: e.targetY, t: 84, ease: "linear" },
            { x: e.targetX, y: -58, t: 138, ease: "inCubic" },
          ]);
        } else {
          e.y += e.speed * DT;
        }
        e.fireCd -= DT;
        e.shield = Math.max(0, e.shield - DT);
        e.phaseLockFlash = Math.max(0, e.phaseLockFlash - DT);
        if (e.fireCd <= 0 && this.enemyBullets.length < 220 && e.y > 10) {
          const bottomCamp = this.player.y > H - 96;
          let nextFireRate = e.fireRate;
          if (e.kind === "boss") {
            const hpRatio = e.hp / e.maxHp;
            const pattern = Math.floor(Math.max(0, e.age - 3) * 2.5) % 2;
            if (hpRatio > 0.66) {
              if (pattern === 0) {
                this.fireFan(e, 5, 92, 0.14, "boss-open-aim");
              } else {
                this.fireLaneGate(e, [-48, 0, 48], 100, "boss-open-lane");
              }
              nextFireRate = e.fireRate * 0.92;
            } else if (hpRatio > 0.33) {
              if (pattern === 0) {
                this.fireFan(e, 5, 100, 0.14, "boss-mid-aim");
              } else {
                this.fireLaneGate(e, [-66, -22, 22, 66], 112, "boss-mid-lane");
                this.fireGate(e, -52, 104, "boss-mid-cross");
                this.fireGate(e, 52, 104, "boss-mid-cross");
              }
              nextFireRate = e.fireRate * 0.82;
            } else {
              this.fireFan(e, 7, 112, 0.13, "boss-final-aim");
              this.fireLaneGate(e, [-66, 0, 66], 118, "boss-final-lane");
              if (pattern === 1) {
                this.fireGate(e, -54, 108, "boss-final-cross");
                this.fireGate(e, 54, 108, "boss-final-cross");
              }
              nextFireRate = e.fireRate * 0.78;
            }
            if (bottomCamp) {
              this.fireAtPlayer(e, 196, -0.18, { role: "boss-bottom-punish" });
              this.fireAtPlayer(e, 196, 0.18, { role: "boss-bottom-punish" });
            }
          } else if (e.kind === "armored" || e.kind === "anchor") {
            const deadline = e.route === "large" && e.age > 2.65;
            this.fireFan(e, deadline ? 3 : 2, deadline ? 126 : 112, deadline ? 0.13 : 0.16, "hard-target-aim");
            this.fireGate(e, 0, deadline ? 122 : 90, "hard-target-lane");
            if (deadline) {
              this.fireGate(e, -44, 106, "hard-target-side");
              this.fireGate(e, 44, 106, "hard-target-side");
              nextFireRate = e.fireRate * 0.78;
            }
            if (bottomCamp) {
              this.fireAtPlayer(e, 184, -0.05, { role: "hard-target-bottom-punish" });
              this.fireAtPlayer(e, 184, 0.05, { role: "hard-target-bottom-punish" });
            }
          } else if (e.kind === "feeder") {
            const bottomBias = this.player.y > H - 96 ? 48 * e.side : 0;
            this.fireAtPlayer(e, bottomCamp ? 184 : 136, e.side * 0.08 + bottomBias * 0.01, { role: "feeder-aim" });
            if (e.route === "side" && e.age < 2.7) {
              this.fireGate(e, -e.side * 36, 118, "feeder-cross");
              nextFireRate = e.fireRate * 1.35;
            }
          } else if (e.kind === "escort") {
            this.fireAtPlayer(e, 124, e.side * 0.2, { role: "escort-aim" });
            if (e.route === "side" && e.age < 2.8) {
              this.fireGate(e, e.side * 42, 106, "escort-gate");
              nextFireRate = e.fireRate * 1.3;
            }
            if (bottomCamp) this.fireAtPlayer(e, 176, -e.side * 0.1, { role: "escort-bottom-punish" });
          } else if (e.kind === "harvest") {
            if (e.age > 2.2) this.fireAtPlayer(e, 102, 0, { role: "harvest-timeout" });
          } else {
            if (e.age > 1.5) this.fireAtPlayer(e, 112, 0, { role: "curve-timeout" });
          }
          e.fireCd = bottomCamp && ["feeder", "anchor", "armored", "escort", "boss"].includes(e.kind) ? nextFireRate * 0.48 : nextFireRate;
        }
      }
      this.enemies = this.enemies.filter(e => !e.done && e.y < H + 70 && e.hp > 0);
    }

    movePathEnemy(e, path) {
      if (e.pathIdx >= path.length - 1) {
        e.done = true;
        return;
      }
      const p0 = path[e.pathIdx];
      const p1 = path[e.pathIdx + 1];
      e.pathT += 1;
      const dur = p1.t || 1;
      const frac = clamp(e.pathT / dur, 0, 1);
      const sf = easeMotion(frac, p1.ease || "smooth");
      e.x = p0.x + (p1.x - p0.x) * sf;
      e.y = p0.y + (p1.y - p0.y) * sf;
      if (e.pathT >= dur) {
        e.pathIdx++;
        e.pathT = 0;
        if (e.pathIdx >= path.length - 1) e.done = true;
      }
    }

    applyBossPhaseLock(e) {
      if (!e.boss) return;
      const locks = [
        { minAge: 6.8, hpFloor: e.maxHp * 0.67 },
        { minAge: 11.2, hpFloor: e.maxHp * 0.34 },
        { minAge: 14.2, hpFloor: 1 },
      ];
      for (const lock of locks) {
        if (e.age < lock.minAge && e.hp < lock.hpFloor) {
          e.hp = lock.hpFloor;
          e.phaseLockFlash = 0.16;
          return;
        }
      }
    }

    updateBullets() {
      for (const b of this.enemyBullets) {
        b.x += b.vx * DT;
        b.y += b.vy * DT;
      }
      for (const b of this.playerBullets) {
        if (b.relay) {
          const target = this.enemies
            .filter(e => e.y > -35 && e.y < H * 0.86)
            .sort((a, c) => {
              const da = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
              const dc = (c.x - b.x) * (c.x - b.x) + (c.y - b.y) * (c.y - b.y);
              return da - dc;
            })[0];
          if (target) {
            const dx = target.x - b.x;
            const dy = target.y - b.y;
            const len = Math.hypot(dx, dy) || 1;
            const speed = Math.hypot(b.vx, b.vy) || 720;
            b.vx = b.vx * 0.74 + (dx / len) * speed * 0.26;
            b.vy = b.vy * 0.74 + (dy / len) * speed * 0.26;
          }
        }
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
            if (e.shield > 0 && !b.relay) {
              b.hit = true;
              this.particles.push({ x: b.x, y: b.y, life: 0.12, max: 0.12, kind: "shield" });
              break;
            }
            if (b.relay && e.shield > 0) e.shield = 0;
            e.hp -= b.dmg;
            this.applyBossPhaseLock(e);
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
