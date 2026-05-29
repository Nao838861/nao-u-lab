// avoid 系 minimal skeleton (C266 Phase 4 — log_autonomous_game/v003 から抽出)
// 残しているのは「入力 → player update → render」の core loop のみ。
// 弾幕 / 敵 / 評価 / echo 機構などは全て削除。派生ゲームはこの上に固有要素を積む。
(() => {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const player = { x: W * 0.5, y: H * 0.78, r: 8, speed: 3.4 };
  const keys = new Set();

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => { keys.delete(e.code); });

  function updatePlayer() {
    let dx = 0, dy = 0;
    if (keys.has('ArrowLeft')  || keys.has('KeyA')) dx -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;
    if (keys.has('ArrowUp')    || keys.has('KeyW')) dy -= 1;
    if (keys.has('ArrowDown')  || keys.has('KeyS')) dy += 1;
    if (dx || dy) {
      const n = Math.hypot(dx, dy);
      player.x += (dx / n) * player.speed;
      player.y += (dy / n) * player.speed;
    }
    player.x = Math.max(player.r, Math.min(W - player.r, player.x));
    player.y = Math.max(player.r, Math.min(H - player.r, player.y));
  }

  function render() {
    ctx.fillStyle = '#05070b';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#dfe7f3';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function step() {
    updatePlayer();
    render();
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
