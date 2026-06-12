'use strict';
/* ============================================================================
   FABLE STRIKER 描画スモークテスト
   モックCanvas 2Dコンテキストで全描画関数を全状態ぶん1フレーム走らせ、
   描画コードが例外を投げないことを検証する（v02の絵リッチ化の回帰防止）。
   使い方: node render_smoke.js
   ============================================================================ */
global.window = undefined;
global.document = undefined;
global.localStorage = undefined;
global.performance = { now: () => 0 };
global.requestAnimationFrame = () => 0;

const path = require('path');
const { Game } = require(path.join(__dirname, 'game.js'));

// すべてのメソッド呼び出しを no-op、グラデは addColorStop を持つ、で受ける Proxy モック
function makeMockCtx() {
  const grad = { addColorStop() {} };
  const base = { _stubImg: { width: 64, height: 64 } };
  return new Proxy(base, {
    get(t, p) {
      if (p in t) return t[p];
      if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') return () => grad;
      if (p === 'measureText') return () => ({ width: 10 });
      return () => {};
    },
    set(t, p, v) { t[p] = v; return true; },
  });
}

function run() {
  const states = ['title','play','dead','stageclear','gameover','allclear'];
  let ok = true;
  console.log('=== FABLE STRIKER 描画スモークテスト ===\n');
  for (const st of states) {
    try {
      Game._renderTest(makeMockCtx(), st);
      console.log(`  [PASS] state=${st} の全描画パスが例外なし`);
    } catch (e) {
      ok = false;
      console.log(`  [FAIL] state=${st} で例外: ${e.message}`);
      console.log('         ' + (e.stack || '').split('\n').slice(1,3).join('\n         '));
    }
  }
  console.log('\n総合:', ok ? '✅ 全状態の描画が例外なし' : '❌ 描画例外あり');
  process.exit(ok ? 0 : 1);
}
run();
