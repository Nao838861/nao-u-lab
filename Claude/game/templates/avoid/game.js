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

/*
 * MNP (中間記法パターン) 反映 — 2026-05-31 C271 Phase 4
 *
 * 本 game.js は MNP の **GUI レンダラ** に対応する。設計欄 = skeleton.md (DSL 中間層)。
 * 派生時は skeleton.md を読んで派生先 game/<id>/v<NN>/ で game.js を書き直す。
 *
 *   skeleton.md (DSL 中間層)  <--->  game.js (GUI レンダラ)
 *     ↑                                  ↑
 *     Log / Mir / Ash が編集する          人間がブラウザで触る
 *
 * 双方向同期の SSoT 原則:
 *   skeleton.md と本 game.js が乖離した時は skeleton.md を真として game.js を直す。
 *   game.js 側の局所修正で skeleton.md を後追いする運用は禁則。
 *
 * 由来: projects/game_templates_design.md 2026-05-31 14:33 C271 Phase 3
 *   [Mir] #shared-reads 経由 Nao_u 共有の zenn art_reflection + izutorishima 詳細解説
 *   ("GUI アプリと LLM の共同編集問題に対し、GUI の構造に沿った独自 DSL を中間層として設計し、
 *    GUI をその DSL ファイルのレンダラにする")
 */
