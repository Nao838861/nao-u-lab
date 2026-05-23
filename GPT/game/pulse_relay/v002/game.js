(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.VectorWake = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const W = 480;
  const H = 640;
  const FPS = 60;
  const STAGE_END = 86 * FPS;
  const BOSS_START = 60 * FPS;

  const COLORS = {
    scout: "#48d7ff",
    lance: "#ff9f32",
    diver: "#f15bff",
    carrier: "#5cff91",
    boss: "#fff3d8",
    player: "#e9f6ff",
    shot: "#b9f6ff",
    pulse: "#7ef8ff",
    enemyBullet: "#ff6d70",
    enemyBullet2: "#ffd166",
  };

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  }

  function easeIn(t) {
    t = clamp(t, 0, 1);
    return t * t * t;
  }

  function easeInOut(t) {
    t = clamp(t, 0, 1);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeSoft(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function angleTo(ax, ay, bx, by) {
    return Math.atan2(by - ay, bx - ax);
  }

  function fromAngle(x, y, speed, angle, extra) {
    return Object.assign({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    }, extra || {});
  }

  function routeDuration(route) {
    if (route === "scoutRail") return 50 + 68 + 92;
    if (route === "sideLance") return 62 + 74 + 82;
    if (route === "sideArc") return 66 + 72 + 84;
    if (route === "diverCut") return 58 + 42 + 92;
    if (route === "carrierWake") return 62 + 150 + 70;
    if (route === "bossCore") return 99999;
    return 160;
  }

  function routePosition(enemy, frame) {
    const age = frame - enemy.spawn;
    const side = enemy.side || 1;
    if (age < 0) return { x: enemy.x0 || W / 2, y: -80, active: false, shootable: false, phase: "pre" };

    if (enemy.route === "scoutRail") {
      const entry = 50;
      const show = 68;
      const exit = 92;
      const x = enemy.lane;
      const yBias = enemy.yBias || 0;
      if (age < entry) {
        const t = easeSoft(age / entry);
        return { x, y: lerp(-36, 128 + yBias, t), active: true, shootable: age > 8, phase: "entry" };
      }
      if (age < entry + show) {
        const t = (age - entry) / show;
        return { x: x + Math.sin(t * Math.PI) * side * 4, y: lerp(128 + yBias, 178 + yBias, t), active: true, shootable: true, phase: "show" };
      }
      if (age < entry + show + exit) {
        const t = easeSoft((age - entry - show) / exit);
        return { x: x + side * 6, y: lerp(178 + yBias, H + 34, t), active: true, shootable: true, phase: "exit" };
      }
      return { x, y: H + 80, active: false, shootable: false, phase: "done" };
    }

    if (enemy.route === "sideLance") {
      const entry = 62;
      const show = 74;
      const exit = 82;
      const startX = side < 0 ? -34 : W + 34;
      const holdX = side < 0 ? 144 : 336;
      const crossX = side < 0 ? 222 : 258;
      const endX = side < 0 ? W + 48 : -48;
      const y = enemy.lane;
      if (age < entry) {
        const t = easeSoft(age / entry);
        return { x: lerp(startX, holdX, t), y: y - Math.sin(t * Math.PI) * 5, active: true, shootable: age > 8, phase: "entry" };
      }
      if (age < entry + show) {
        const t = easeInOut((age - entry) / show);
        return { x: lerp(holdX, crossX, t), y: y + Math.sin(t * Math.PI) * 7, active: true, shootable: true, phase: "show" };
      }
      if (age < entry + show + exit) {
        const t = easeSoft((age - entry - show) / exit);
        return { x: lerp(crossX, endX, t), y: y + side * 4 + t * 10, active: true, shootable: true, phase: "exit" };
      }
      return { x: endX, y, active: false, shootable: false, phase: "done" };
    }

    if (enemy.route === "sideArc") {
      const entry = 66;
      const show = 72;
      const exit = 84;
      const startX = side < 0 ? -40 : W + 40;
      const midX = side < 0 ? 150 : 330;
      const showX = side < 0 ? 212 : 268;
      const endX = side < 0 ? W + 54 : -54;
      const baseY = enemy.lane;
      if (age < entry) {
        const t = easeSoft(age / entry);
        return { x: lerp(startX, midX, t), y: baseY - Math.sin(t * Math.PI) * 18, active: true, shootable: age > 8, phase: "entry" };
      }
      if (age < entry + show) {
        const t = (age - entry) / show;
        return { x: lerp(midX, showX, t), y: baseY + Math.sin(t * Math.PI) * 10, active: true, shootable: true, phase: "show" };
      }
      if (age < entry + show + exit) {
        const t = easeSoft((age - entry - show) / exit);
        return { x: lerp(showX, endX, t), y: baseY + 14 * t, active: true, shootable: true, phase: "exit" };
      }
      return { x: endX, y: baseY, active: false, shootable: false, phase: "done" };
    }

    if (enemy.route === "diverCut") {
      const entry = 58;
      const show = 42;
      const exit = 92;
      const startX = side < 0 ? -28 : W + 28;
      const aimX = side < 0 ? 170 : 310;
      const endX = side < 0 ? W + 40 : -40;
      const startY = -30;
      const aimY = enemy.lane;
      if (age < entry) {
        const t = easeSoft(age / entry);
        return { x: lerp(startX, aimX, t), y: lerp(startY, aimY, t), active: true, shootable: age > 8, phase: "entry" };
      }
      if (age < entry + show) {
        const t = (age - entry) / show;
        return { x: aimX + side * Math.sin(t * Math.PI) * 5, y: aimY + t * 16, active: true, shootable: true, phase: "show" };
      }
      if (age < entry + show + exit) {
        const t = easeSoft((age - entry - show) / exit);
        return { x: lerp(aimX, endX, t), y: lerp(aimY + 14, H + 56, t), active: true, shootable: true, phase: "exit" };
      }
      return { x: endX, y: H + 90, active: false, shootable: false, phase: "done" };
    }

    if (enemy.route === "carrierWake") {
      const entry = 62;
      const show = 150;
      const exit = 70;
      const x = enemy.lane;
      if (age < entry) {
        const t = easeSoft(age / entry);
        return { x, y: lerp(-54, 110, t), active: true, shootable: age > 10, phase: "entry" };
      }
      if (age < entry + show) {
        const t = (age - entry) / show;
        return { x: x + Math.sin(t * Math.PI * 2) * 18, y: 110 + Math.sin(t * Math.PI) * 12, active: true, shootable: true, phase: "show" };
      }
      if (age < entry + show + exit) {
        const t = easeSoft((age - entry - show) / exit);
        return { x: x + side * 10 * t, y: lerp(110, -62, t), active: true, shootable: true, phase: "exit" };
      }
      return { x, y: -90, active: false, shootable: false, phase: "done" };
    }

    if (enemy.route === "bossCore") {
      const age2 = frame - enemy.spawn;
      const t = Math.max(0, age2);
      const phase = enemy.hp > enemy.maxHp * 0.62 ? "phase1" : enemy.hp > enemy.maxHp * 0.28 ? "phase2" : "phase3";
      const intro = Math.min(1, t / 90);
      const drift = Math.sin(t / 74) * (phase === "phase1" ? 32 : phase === "phase2" ? 58 : 42);
      const yPulse = phase === "phase3" ? Math.sin(t / 33) * 12 : Math.sin(t / 90) * 8;
      return { x: W / 2 + drift, y: lerp(-80, 108 + yPulse, easeOut(intro)), active: true, shootable: t > 30, phase };
    }

    return { x: enemy.x || W / 2, y: enemy.y || -80, active: false, shootable: false, phase: "done" };
  }

  function buildWaves() {
    const spawns = [];
    let id = 1;
    function add(frame, type, route, opts) {
      spawns.push(Object.assign({
        id: id++,
        frame,
        type,
        route,
        side: 1,
        lane: W / 2,
        hp: 28,
        radius: 13,
        score: 100,
        charge: 8,
        intent: "",
      }, opts || {}));
    }

    for (let i = 0; i < 10; i++) {
      add(36 + i * 14, "scout", "scoutRail", {
        lane: [132, 160, 188, 216, 244, 272, 300, 328, 356, 384][i],
        side: i < 3 ? -1 : 1,
        hp: 20,
        radius: 12,
        score: 90,
        charge: 7,
        fireSkip: 3,
        intent: "wake scouts broad line",
      });
    }
    for (let i = 0; i < 8; i++) {
      add(4 * FPS + 56 + i * 16, "scout", "scoutRail", {
        lane: [172, 204, 236, 268, 300, 268, 236, 204][i],
        side: 1,
        hp: 20,
        radius: 12,
        score: 90,
        charge: 7,
        fireSkip: 3,
        intent: "wake scouts second line",
      });
    }
    for (let i = 0; i < 7; i++) {
      add(7 * FPS + 8 + i * 22, "lance", "sideLance", {
        side: -1,
        lane: [132, 158, 184, 210, 236, 262, 288][i],
        hp: 18,
        radius: 13,
        score: 120,
        charge: 8,
        fireSkip: 3,
        intent: "left orange escort",
      });
    }
    for (let i = 0; i < 4; i++) {
      add(8 * FPS + 18 + i * 20, "scout", "scoutRail", {
        lane: [70, 102, 134, 102][i],
        side: -1,
        hp: 18,
        radius: 12,
        score: 85,
        charge: 6,
        yBias: -78,
        fireSkip: 4,
        intent: "left orange escort center bait",
      });
    }
    for (let i = 0; i < 5; i++) {
      add(12 * FPS + 8 + i * 13, "scout", "scoutRail", {
        lane: [80, 112, 144, 176, 208][i],
        side: i % 2 === 0 ? -1 : 1,
        hp: 12,
        radius: 12,
        score: 80,
        charge: 6,
        yBias: -58,
        fireSkip: 5,
        intent: "orange cleanup pickup",
      });
    }
    for (let i = 0; i < 7; i++) {
      add(13 * FPS + 18 + i * 22, "lance", "sideLance", {
        side: 1,
        lane: [296, 270, 244, 218, 192, 166, 140][i],
        hp: 18,
        radius: 13,
        score: 120,
        charge: 8,
        fireSkip: 3,
        intent: "right orange answer",
      });
    }
    for (let i = 0; i < 5; i++) {
      add(14 * FPS + 24 + i * 18, "scout", "scoutRail", {
        lane: [400, 432, 464, 432, 400][i],
        side: 1,
        hp: 18,
        radius: 12,
        score: 85,
        charge: 6,
        yBias: -78,
        fireSkip: 4,
        intent: "right orange answer center bait",
      });
    }
    for (let i = 0; i < 6; i++) {
      add(18 * FPS + i * 44, "diver", "diverCut", {
        side: [1, -1, 1, -1, 1, -1][i],
        lane: [132, 172, 212, 252, 292, 332][i],
        hp: 26,
        radius: 12,
        score: 135,
        charge: 8,
        fireSkip: 3,
        intent: "magenta paired cuts",
      });
    }
    for (let i = 0; i < 5; i++) {
      add(19 * FPS + 18 + i * 14, "scout", "scoutRail", {
        lane: [188, 220, 252, 284, 352][i],
        side: 1,
        hp: 12,
        radius: 12,
        score: 80,
        charge: 6,
        yBias: -64,
        fireSkip: 5,
        intent: "magenta recovery pickup",
      });
    }
    for (let i = 0; i < 9; i++) {
      add(22 * FPS + 6 + i * 15, "scout", "scoutRail", {
        lane: [150, 178, 206, 234, 262, 290, 318, 346, 374][i],
        side: i < 4 ? -1 : 1,
        hp: 14,
        radius: 12,
        score: 85,
        charge: 6,
        yBias: -42,
        fireSkip: 4,
        intent: "relief harvest ribbon",
      });
    }
    add(24 * FPS + 20, "carrier", "carrierWake", {
      lane: 240,
      side: 1,
      hp: 88,
      radius: 18,
      score: 320,
      charge: 18,
      intent: "mid anchor gate",
    });
    add(28 * FPS + 40, "carrier", "carrierWake", {
      lane: 96,
      side: -1,
      hp: 132,
      radius: 18,
      score: 330,
      charge: 16,
      intent: "second phrase left anchor",
    });
    add(32 * FPS + 12, "carrier", "carrierWake", {
      lane: 384,
      side: 1,
      hp: 132,
      radius: 18,
      score: 330,
      charge: 16,
      intent: "second phrase right anchor",
    });
    for (let i = 0; i < 6; i++) {
      add(25 * FPS + 4 + i * 22, "lance", "sideArc", {
        side: i < 3 ? -1 : 1,
        lane: [184, 214, 244, 274, 304, 334][i],
        hp: 20,
        radius: 13,
        score: 118,
        charge: 8,
        fireSkip: 3,
        intent: "mid anchor side feeders",
      });
    }
    for (let i = 0; i < 7; i++) {
      add(28 * FPS + 32 + i * 14, "scout", "scoutRail", {
        lane: [168, 200, 232, 264, 296, 120, 152][i],
        side: -1,
        hp: 14,
        radius: 12,
        score: 85,
        charge: 6,
        yBias: -50,
        fireSkip: 4,
        intent: "carrier setup bridge",
      });
    }
    for (let i = 0; i < 4; i++) {
      add(31 * FPS + 4 + i * 24, "lance", "sideLance", {
        side: 1,
        lane: [298, 270, 242, 214][i],
        hp: 18,
        radius: 13,
        score: 115,
        charge: 8,
        fireSkip: 3,
        intent: "carrier setup cross",
      });
    }
    for (let i = 0; i < 8; i++) {
      add(34 * FPS + 24 + i * 14, "scout", "scoutRail", {
        lane: [120, 152, 184, 216, 248, 280, 312, 344][i],
        side: i % 2 === 0 ? -1 : 1,
        hp: 14,
        radius: 12,
        score: 85,
        charge: 6,
        yBias: -52,
        fireSkip: 4,
        intent: "carrier setup harvest connector",
      });
    }
    for (let i = 0; i < 3; i++) {
      add(36 * FPS + i * 116, "carrier", "carrierWake", {
        lane: [120, 360, 240][i],
        side: i % 2 === 0 ? -1 : 1,
        hp: 96,
        radius: 18,
        score: 360,
        charge: 16,
        intent: "green relay carriers",
      });
    }
    for (let i = 0; i < 8; i++) {
      add(37 * FPS + 12 + i * 20, "lance", "sideArc", {
        side: -1,
        lane: [190, 216, 242, 268, 294, 320, 346, 372][i],
        hp: 20,
        radius: 13,
        score: 120,
        charge: 8,
        fireSkip: 3,
        intent: "green relay carriers arc",
      });
    }
    for (let i = 0; i < 8; i++) {
      add(43 * FPS + 20 + i * 20, "lance", "sideArc", {
        side: 1,
        lane: [372, 346, 320, 294, 268, 242, 216, 190][i],
        hp: 20,
        radius: 13,
        score: 120,
        charge: 8,
        fireSkip: 3,
        intent: "green relay answer arc",
      });
    }
    for (let i = 0; i < 7; i++) {
      add(45 * FPS + 8 + i * 16, "scout", "scoutRail", {
        lane: [388, 420, 452, 420, 388, 420, 452][i],
        side: 1,
        hp: 14,
        radius: 12,
        score: 85,
        charge: 6,
        yBias: -54,
        fireSkip: 4,
        intent: "relay tail cover",
      });
    }
    for (let i = 0; i < 5; i++) {
      add(47 * FPS + 8 + i * 15, "scout", "scoutRail", {
        lane: [38, 70, 102, 134, 410][i],
        side: -1,
        hp: 14,
        radius: 12,
        score: 85,
        charge: 6,
        yBias: -58,
        fireSkip: 4,
        intent: "carrier priority lead-in",
      });
    }
    for (let i = 0; i < 6; i++) {
      add(49 * FPS + i * 34, "diver", "diverCut", {
        side: i % 2 === 0 ? -1 : 1,
        lane: [148, 184, 220, 256, 292, 328][i],
        hp: 22,
        radius: 12,
        score: 135,
        charge: 8,
        fireSkip: 3,
        intent: "carrier priority cuts",
      });
    }
    for (let i = 0; i < 7; i++) {
      add(53 * FPS + i * 30, "diver", "diverCut", {
        side: [1, -1, 1, -1, 1, -1, 1][i],
        lane: [132, 162, 192, 222, 252, 282, 312][i],
        hp: 22,
        radius: 12,
        score: 135,
        charge: 8,
        fireSkip: 3,
        intent: "pre-boss cuts",
      });
    }
    for (let i = 0; i < 6; i++) {
      add(56 * FPS + 12 + i * 24, "lance", "sideLance", {
        side: -1,
        lane: [136, 164, 192, 220, 248, 276][i],
        hp: 18,
        radius: 13,
        score: 115,
        charge: 8,
        fireSkip: 3,
        intent: "boss warning cross",
      });
    }
    for (let i = 0; i < 8; i++) {
      add(58 * FPS + 2 + i * 15, "scout", "scoutRail", {
        lane: [168, 196, 224, 252, 280, 308, 280, 252][i],
        side: 1,
        hp: 14,
        radius: 12,
        score: 85,
        charge: 6,
        yBias: -48,
        fireSkip: 4,
        intent: "boss warning",
      });
    }
    add(BOSS_START, "boss", "bossCore", {
      hp: 1950,
      radius: 36,
      score: 5000,
      charge: 40,
      intent: "boss vector core",
    });

    return spawns.sort((a, b) => a.frame - b.frame);
  }

  const WAVES = buildWaves();

  class Game {
    constructor(opts) {
      opts = opts || {};
      this.width = W;
      this.height = H;
      this.frame = 0;
      this.spawnIndex = 0;
      this.player = { x: W / 2, y: H - 72, r: 4, spriteR: 11, hp: 6, invuln: 0, shotCd: 0, pulseCd: 0, charge: 28 };
      this.enemies = [];
      this.playerShots = [];
      this.enemyBullets = [];
      this.effects = [];
      this.score = 0;
      this.kills = 0;
      this.pulseUses = 0;
      this.grazed = new Set();
      this.state = "play";
      this.message = "";
      this.stats = { damageTaken: 0, bossSpawnFrame: null, bossKillFrame: null, shotsFired: 0, pulsesCleared: 0 };
      this.rng = opts.rng || 1;
    }

    reset() {
      const fresh = new Game();
      Object.assign(this, fresh);
    }

    rand() {
      this.rng = (this.rng * 1664525 + 1013904223) >>> 0;
      return this.rng / 0xffffffff;
    }

    spawnEnemy(data) {
      const e = Object.assign({}, data);
      e.spawn = data.frame;
      e.maxHp = data.hp;
      e.fireCd = 18 + (data.id % 5) * 7;
      e.alive = true;
      const p = routePosition(e, this.frame);
      e.x = p.x;
      e.y = p.y;
      e.phase = p.phase;
      this.enemies.push(e);
      if (e.type === "boss") this.stats.bossSpawnFrame = this.frame;
    }

    update(input) {
      input = input || {};
      if (input.restart) this.reset();
      if (input.pausePressed && this.state === "play") this.state = "pause";
      else if (input.pausePressed && this.state === "pause") this.state = "play";
      if (this.state !== "play") return this.snapshot();

      this.frame += 1;
      while (this.spawnIndex < WAVES.length && WAVES[this.spawnIndex].frame <= this.frame) {
        this.spawnEnemy(WAVES[this.spawnIndex++]);
      }

      this.updatePlayer(input);
      this.updateEnemies();
      this.updateShots();
      this.updateBullets();
      this.updateCollisions();
      this.updateEffects();
      this.checkEnd();
      return this.snapshot();
    }

    updatePlayer(input) {
      const p = this.player;
      const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
      const len = Math.hypot(dx, dy) || 1;
      const speed = 4.35;
      p.x = clamp(p.x + dx / len * speed, 18, W - 18);
      p.y = clamp(p.y + dy / len * speed, 62, H - 24);
      p.invuln = Math.max(0, p.invuln - 1);
      p.shotCd = Math.max(0, p.shotCd - 1);
      p.pulseCd = Math.max(0, p.pulseCd - 1);

      if (p.shotCd <= 0) {
        p.shotCd = 5;
        this.playerShots.push({ x: p.x - 5, y: p.y - 12, vx: -0.25, vy: -9.5, r: 3, damage: 6, kind: "shot" });
        this.playerShots.push({ x: p.x + 5, y: p.y - 12, vx: 0.25, vy: -9.5, r: 3, damage: 6, kind: "shot" });
        this.stats.shotsFired += 2;
      }

      if (input.pulse && p.charge >= 65 && p.pulseCd <= 0) {
        p.charge -= 65;
        p.pulseCd = 28;
        this.pulseUses += 1;
        let cleared = 0;
        const kept = [];
        for (const b of this.enemyBullets) {
          if (Math.hypot(b.x - p.x, b.y - p.y) <= 104) {
            cleared += 1;
            this.effects.push({ x: b.x, y: b.y, life: 18, max: 18, kind: "spark", color: COLORS.pulse });
          } else {
            kept.push(b);
          }
        }
        this.enemyBullets = kept;
        this.stats.pulsesCleared += cleared;
        const shards = clamp(6 + cleared * 2, 8, 26);
        for (let i = 0; i < shards; i++) {
          const target = this.nearestEnemy(p.x, p.y);
          const base = target ? angleTo(p.x, p.y, target.x, target.y) : -Math.PI / 2;
          const spread = (i - (shards - 1) / 2) * 0.035;
          this.playerShots.push(fromAngle(p.x, p.y, 8.2, base + spread, { r: 3.5, damage: 12, kind: "pulse" }));
        }
        this.effects.push({ x: p.x, y: p.y, life: 22, max: 22, kind: "ring", color: COLORS.pulse });
      }
    }

    nearestEnemy(x, y) {
      let best = null;
      let bestD = Infinity;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const d = (e.x - x) * (e.x - x) + (e.y - y) * (e.y - y);
        if (d < bestD) {
          bestD = d;
          best = e;
        }
      }
      return best;
    }

    updateEnemies() {
      const kept = [];
      for (const e of this.enemies) {
        const pos = routePosition(e, this.frame);
        e.x = pos.x;
        e.y = pos.y;
        e.phase = pos.phase;
        e.shootable = pos.shootable;
        if (!pos.active || !e.alive) {
          if (e.alive && e.type !== "boss" && pos.phase === "done") {
            this.enemyFire(e, true);
          }
          continue;
        }
        this.enemyThink(e);
        kept.push(e);
      }
      this.enemies = kept;
    }

    enemyThink(e) {
      if (!e.shootable) return;
      e.fireCd -= 1;
      if (e.fireSkip && e.fireSkip > 1 && e.id % e.fireSkip !== 0) return;
      if (e.type === "scout" && e.fireCd <= 0) {
        e.fireCd = 96;
        this.enemyFire(e, false, 2.2);
      } else if (e.type === "lance" && e.fireCd <= 0) {
        e.fireCd = e.route === "sideArc" ? 86 : 92;
        this.enemyFire(e, false, 2.25);
      } else if (e.type === "diver" && e.fireCd <= 0) {
        e.fireCd = 112;
        this.enemyFire(e, false, 2.55);
      } else if (e.type === "carrier" && e.fireCd <= 0) {
        e.fireCd = 72;
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI * 0.85 + i * (Math.PI * 0.7 / 4);
          this.enemyBullets.push(fromAngle(e.x, e.y + 8, 1.95, a, { r: 4, life: 260, color: COLORS.enemyBullet2 }));
        }
      } else if (e.type === "boss" && e.fireCd <= 0) {
        this.bossFire(e);
      }
    }

    enemyFire(e, exitShot, speed) {
      const p = this.player;
      const a = angleTo(e.x, e.y, p.x, p.y);
      this.enemyBullets.push(fromAngle(e.x, e.y, speed || 2.35, a, { r: exitShot ? 3.2 : 4, life: 260, color: exitShot ? COLORS.enemyBullet2 : COLORS.enemyBullet }));
    }

    bossFire(e) {
      const p = this.player;
      const phase = e.phase;
      if (phase === "phase1") {
        e.fireCd = 42;
        const a = angleTo(e.x, e.y, p.x, p.y);
        for (let i = -1; i <= 1; i++) {
          this.enemyBullets.push(fromAngle(e.x, e.y + 24, 2.45, a + i * 0.15, { r: 4.1, life: 280, color: COLORS.enemyBullet }));
        }
      } else if (phase === "phase2") {
        e.fireCd = 50;
        const base = this.frame / 37;
        for (let i = 0; i < 5; i++) {
          this.enemyBullets.push(fromAngle(e.x, e.y + 18, 1.75, base + i * Math.PI * 2 / 5, { r: 3.4, life: 300, color: i % 2 ? COLORS.enemyBullet : COLORS.enemyBullet2 }));
        }
      } else {
        e.fireCd = 50;
        const a = angleTo(e.x, e.y, p.x, p.y);
        for (let i = -1; i <= 1; i++) {
          this.enemyBullets.push(fromAngle(e.x, e.y + 26, 1.95 + Math.abs(i) * 0.08, a + i * 0.1, { r: 3.6, life: 300, color: COLORS.enemyBullet }));
        }
      }
    }

    updateShots() {
      const kept = [];
      for (const s of this.playerShots) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x > -20 && s.x < W + 20 && s.y > -30 && s.y < H + 30) kept.push(s);
      }
      this.playerShots = kept;
    }

    updateBullets() {
      const p = this.player;
      const kept = [];
      for (const b of this.enemyBullets) {
        b.x += b.vx;
        b.y += b.vy;
        b.life -= 1;
        const d = Math.hypot(b.x - p.x, b.y - p.y);
        if (d < 34 && d > 9) {
          const key = Math.floor(this.frame / 10) + ":" + Math.floor(b.x / 12) + ":" + Math.floor(b.y / 12);
          if (!this.grazed.has(key)) {
            this.grazed.add(key);
            p.charge = clamp(p.charge + 1.2, 0, 100);
          }
        }
        if (b.life > 0 && b.x > -40 && b.x < W + 40 && b.y > -50 && b.y < H + 50) kept.push(b);
      }
      this.enemyBullets = kept;
    }

    updateCollisions() {
      const shotKept = [];
      for (const s of this.playerShots) {
        let hit = false;
        for (const e of this.enemies) {
          if (!e.alive || !e.shootable) continue;
          const rr = (s.r + e.radius) * (s.r + e.radius);
          if (dist2(s, e) <= rr) {
            e.hp -= s.damage;
            hit = true;
            this.effects.push({ x: s.x, y: s.y, life: 8, max: 8, kind: "spark", color: s.kind === "pulse" ? COLORS.pulse : COLORS.shot });
            if (e.hp <= 0) this.killEnemy(e);
            break;
          }
        }
        if (!hit) shotKept.push(s);
      }
      this.playerShots = shotKept;

      const p = this.player;
      if (p.invuln <= 0) {
        const keptBullets = [];
        for (const b of this.enemyBullets) {
          if (Math.hypot(b.x - p.x, b.y - p.y) <= b.r + p.r) {
            p.hp -= 1;
            p.invuln = 110;
            this.stats.damageTaken += 1;
            this.effects.push({ x: p.x, y: p.y, life: 34, max: 34, kind: "ring", color: "#ff6d70" });
            if (p.hp <= 0) {
              this.state = "over";
              this.message = "BROKEN WAKE";
            }
          } else {
            keptBullets.push(b);
          }
        }
        this.enemyBullets = keptBullets;
      }
    }

    killEnemy(e) {
      e.alive = false;
      this.score += e.score;
      this.kills += 1;
      this.player.charge = clamp(this.player.charge + e.charge, 0, 100);
      this.effects.push({ x: e.x, y: e.y, life: e.type === "boss" ? 56 : 20, max: e.type === "boss" ? 56 : 20, kind: "burst", color: COLORS[e.type] || "#fff" });
      if (e.type === "boss") {
        this.stats.bossKillFrame = this.frame;
        this.state = "clear";
        this.message = "VECTOR WAKE CLEAR";
      }
    }

    updateEffects() {
      const kept = [];
      for (const fx of this.effects) {
        fx.life -= 1;
        if (fx.life > 0) kept.push(fx);
      }
      this.effects = kept;
    }

    checkEnd() {
      if (this.frame > STAGE_END && this.state === "play") {
        const boss = this.enemies.find((e) => e.type === "boss");
        if (!boss) {
          this.state = "clear";
          this.message = "VECTOR WAKE CLEAR";
        } else {
          this.message = "CORE ESCAPED";
        }
      }
    }

    snapshot() {
      const boss = this.enemies.find((e) => e.type === "boss");
      let shootable = 0;
      for (const e of this.enemies) if (e.shootable) shootable += 1;
      let near = 0;
      for (const b of this.enemyBullets) {
        if (Math.hypot(b.x - this.player.x, b.y - this.player.y) < 58) near += 1;
      }
      return {
        frame: this.frame,
        time: this.frame / FPS,
        state: this.state,
        score: this.score,
        kills: this.kills,
        player: Object.assign({}, this.player),
        visibleTargets: this.enemies.length,
        shootableTargets: shootable,
        enemyBullets: this.enemyBullets.length,
        nearBullets: near,
        pulseUses: this.pulseUses,
        bossHp: boss ? Math.max(0, boss.hp) : 0,
        bossMaxHp: boss ? boss.maxHp : 0,
        damageTaken: this.stats.damageTaken,
      };
    }
  }

  function idealBossTTK(options) {
    options = options || {};
    const hp = options.hp || 1950;
    const shotDamagePerSecond = 2 * 6 * (FPS / 5);
    const pulseDamagePerUse = 12 * 18;
    const normal = hp / shotDamagePerSecond;
    const pulseBurst = hp / (shotDamagePerSecond + pulseDamagePerUse / 4.2);
    return { hp, normal, pulseBurst };
  }

  function sampleRoutes() {
    const rows = [];
    for (const s of WAVES) {
      if (s.type === "boss") continue;
      const dur = routeDuration(s.route);
      for (const offset of [0, Math.floor(dur * 0.25), Math.floor(dur * 0.5), Math.floor(dur * 0.75), dur - 1]) {
        const p = routePosition(Object.assign({}, s, { spawn: s.frame, maxHp: s.hp }), s.frame + offset);
        rows.push({ id: s.id, type: s.type, route: s.route, frame: s.frame + offset, x: p.x, y: p.y, phase: p.phase, shootable: p.shootable });
      }
    }
    return rows;
  }

  function makeBot(policy) {
    policy = policy || "balanced";
    return function botInput(game) {
      const p = game.player;
      let target = null;
      let best = Infinity;
      for (const e of game.enemies) {
        if (!e.shootable) continue;
        const d = Math.abs(e.x - p.x) + Math.max(0, e.y - p.y) * 0.2;
        if (d < best) {
          best = d;
          target = e;
        }
      }
      let desiredX = target ? target.x : W / 2;
      let desiredY = H - 80;
      for (const b of game.enemyBullets) {
        const dx = p.x - b.x;
        const dy = p.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < (policy === "aggressive" ? 46 : 64)) {
          desiredX += dx / Math.max(1, d) * 72;
          desiredY += dy / Math.max(1, d) * 38;
        }
      }
      if (policy === "aggressive" && target) desiredY = Math.min(desiredY, 475);
      if (policy === "conservative") desiredY = H - 64;
      desiredX = clamp(desiredX, 26, W - 26);
      desiredY = clamp(desiredY, 76, H - 28);
      const pulseAt = policy === "pulse-heavy" ? 70 : policy === "conservative" ? 85 : 78;
      return {
        left: p.x > desiredX + 5,
        right: p.x < desiredX - 5,
        up: p.y > desiredY + 5,
        down: p.y < desiredY - 5,
        shoot: true,
        pulse: p.charge >= pulseAt && (game.enemyBullets.length > 10 || game.snapshot().nearBullets > 2),
      };
    };
  }

  function runHeadless(policy, maxFrames) {
    const game = new Game();
    const bot = makeBot(policy);
    const timeline = [];
    for (let i = 0; i < (maxFrames || STAGE_END + 180); i++) {
      const snap = game.update(bot(game));
      if (game.frame % FPS === 0) timeline.push(snap);
      if (snap.state === "clear" || snap.state === "over") break;
    }
    return { final: game.snapshot(), timeline, stats: game.stats };
  }

  return {
    W,
    H,
    FPS,
    STAGE_END,
    BOSS_START,
    COLORS,
    WAVES,
    Game,
    routePosition,
    routeDuration,
    runHeadless,
    makeBot,
    idealBossTTK,
    sampleRoutes,
  };
});
