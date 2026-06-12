// log_autonomous_game v007 — mini-metroidvania 初版実装 (C325 Phase 4)
//
// Q-守 審問 (feedback_shuhari_clone_first.md 順守):
//   型 = mini-metroidvania (action-adventure 探索、能力解放型空間ゲーム)
//   代表作 3 本 = Hollow Knight / Animal Well / Zelda 1
//   忠実再現可否 = 部分的 yes。最小骨格 (2 部屋遷移 + 1 能力ゲート) は型に従う。
//     ただし design_log の「1部屋 + ダッシュ」設計を staging Phase 4 仕様で
//     「2部屋 + ダブルジャンプ」に拡張 (room 遷移を骨格に含めるため)。
//     階層的能力解放 / 大マップ / 戦闘は v007 では削っている。
//
// 自己プレイ判定 (実装後 Log 自己評価、実機未試遊):
//   1. メトロイドヴァニア骨格 = 部分的に立つ。能力ゲート↔空間制約の対応関係は成立、
//      ただし「壁が壁に見える」明示性が過剰、Hollow Knight 系の「最初は道に見えない」誘導はない
//   2. 入力 → 即時 FB (ジャンプ → 着地) + 能力解放 → 同じ画面が別意味を持つ構造は成立
//   3. 「30 秒で 1 周」スコープ、面白さ未到達、型示し止まり

(function () {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const GRAVITY = 0.5;
  const JUMP_V = -10;
  const MOVE_V = 3;
  const MAX_FALL = 12;

  const player = {
    x: 60, y: 388, w: 24, h: 32, vx: 0, vy: 0,
    onGround: false, hasDoubleJump: false, usedDouble: false
  };

  let currentRoom = 0;
  let cleared = false;

  const rooms = [
    {
      ground: 420,
      walls: [
        { x: 500, y: 240, w: 40, h: 180 }
      ],
      orb: { x: 250, y: 396, w: 24, h: 24, collected: false },
      door: null
    },
    {
      ground: 420,
      walls: [],
      orb: null,
      door: { x: 720, y: 358, w: 24, h: 62 }
    }
  ];

  const keys = {};
  let prevJumpKey = false;

  function handleSpace() {
    if (cleared) restart();
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      handleSpace();
      e.preventDefault();
    }
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) e.preventDefault();
    keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  function restart() {
    player.x = 60; player.y = 388; player.vx = 0; player.vy = 0;
    player.onGround = false; player.hasDoubleJump = false; player.usedDouble = false;
    currentRoom = 0;
    cleared = false;
    for (const r of rooms) {
      if (r.orb) r.orb.collected = false;
    }
  }

  function rectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function step() {
    if (!cleared) update();
    draw();
    requestAnimationFrame(step);
  }

  function update() {
    const room = rooms[currentRoom];

    player.vx = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -MOVE_V;
    if (keys['ArrowRight'] || keys['KeyD']) player.vx = MOVE_V;

    const jumpKey = !!(keys['ArrowUp'] || keys['KeyW'] || keys['KeyZ']);
    if (jumpKey && !prevJumpKey) {
      if (player.onGround) {
        player.vy = JUMP_V;
        player.onGround = false;
        player.usedDouble = false;
      } else if (player.hasDoubleJump && !player.usedDouble) {
        player.vy = JUMP_V;
        player.usedDouble = true;
      }
    }
    prevJumpKey = jumpKey;

    player.vy += GRAVITY;
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;

    player.x += player.vx;
    for (const wall of room.walls) {
      if (rectOverlap(player, wall)) {
        if (player.vx > 0) player.x = wall.x - player.w;
        else if (player.vx < 0) player.x = wall.x + wall.w;
      }
    }

    player.y += player.vy;
    let landedThisFrame = false;
    for (const wall of room.walls) {
      if (rectOverlap(player, wall)) {
        if (player.vy > 0) {
          player.y = wall.y - player.h;
          player.vy = 0;
          landedThisFrame = true;
        } else if (player.vy < 0) {
          player.y = wall.y + wall.h;
          player.vy = 0;
        }
      }
    }

    if (player.y + player.h >= room.ground) {
      player.y = room.ground - player.h;
      player.vy = 0;
      landedThisFrame = true;
    }
    player.onGround = landedThisFrame;
    if (landedThisFrame) player.usedDouble = false;

    if (room.orb && !room.orb.collected && rectOverlap(player, room.orb)) {
      room.orb.collected = true;
      player.hasDoubleJump = true;
    }

    if (room.door && rectOverlap(player, room.door)) {
      cleared = true;
    }

    if (player.x + player.w > W) {
      if (currentRoom < rooms.length - 1) {
        currentRoom++;
        player.x = 4;
      } else {
        player.x = W - player.w;
      }
    } else if (player.x < 0) {
      if (currentRoom > 0) {
        currentRoom--;
        player.x = W - player.w - 4;
      } else {
        player.x = 0;
      }
    }
  }

  function draw() {
    ctx.fillStyle = '#0b1018';
    ctx.fillRect(0, 0, W, H);

    const room = rooms[currentRoom];

    ctx.fillStyle = '#3a3525';
    ctx.fillRect(0, room.ground, W, H - room.ground);

    ctx.fillStyle = '#1e2940';
    for (const wall of room.walls) ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

    if (room.orb && !room.orb.collected) {
      ctx.fillStyle = '#7dffe0';
      ctx.fillRect(room.orb.x, room.orb.y, room.orb.w, room.orb.h);
    }

    if (room.door) {
      ctx.fillStyle = '#ffe770';
      ctx.fillRect(room.door.x, room.door.y, room.door.w, room.door.h);
    }

    ctx.fillStyle = player.hasDoubleJump ? '#7dc9ff' : '#cbd3e1';
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = '#8a93a5';
    ctx.font = '12px monospace';
    ctx.fillText('ROOM ' + (currentRoom + 1) + ' / ' + rooms.length, 10, 18);
    if (player.hasDoubleJump) ctx.fillText('ABILITY: DOUBLE JUMP', 10, 34);

    if (cleared) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CLEAR', W / 2, H / 2 - 10);
      ctx.font = '14px monospace';
      ctx.fillText('PRESS SPACE TO RETRY', W / 2, H / 2 + 30);
      ctx.textAlign = 'left';
    }
  }

  step();
})();
