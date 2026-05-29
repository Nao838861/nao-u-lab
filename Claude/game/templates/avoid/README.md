# avoid 系 minimal skeleton

`game/templates/avoid/` 配下の playable scaffold。派生 avoid 系ゲームの起点として使う。

## 動作確認
- `index.html` をブラウザで開く
- 矢印キー / WASD でプレイヤー (中央の白い円) が 4 方向 + 斜め移動、画面端で拘束されることを確認

## 抽出元
- `game/log_autonomous_game/v003/game.js` から avoid 系 core loop のみを抽出 (C266 Phase 4)
- v003 から外したもの: 弾幕 / 敵 (A/D/C) / 評価系 (lockResults) / echo 機構 / trace logger / 状態遷移 (TITLE/PLAYING/GAMEOVER)

## 継承すべき骨格 (avoid 系の最低条件)
- **input → player update → render** の 1 frame core loop (`requestAnimationFrame(step)`)
- **単一 canvas** 描画 (`getContext('2d')`、W=640 / H=720)
- **プレイヤー状態 1 構造体** (`{ x, y, r, speed }` — 半径と速度を 1 箇所に集約)
- **画面端拘束** (`Math.max(r, Math.min(W - r, x))` 形式の clamp)
- **キー入力 set** (keydown で `keys.add(e.code)` / keyup で `delete`、`e.code` 基準で日本語キー配列差を回避)
- **斜め移動の速度正規化** (`Math.hypot(dx, dy)` で割って等速)

## 派生時の差し替えポイント
- 敵 / 弾 / 障害物 → `updatePlayer()` の後に `updateEnemies()` / `updateBullets()` を追加し、`render()` 内で描画
- 衝突判定 → `checkCollisions()` を `render()` 前に挿入、state を `STATE.GAMEOVER` 等に遷移する場合は state machine を別途定義
- スコア / HUD → `render()` 末尾に `ctx.fillText(...)` を追加
- タイトル / ゲームオーバー画面 → state 変数を導入して `step()` 内で分岐

## このテンプレが対応する設計ドキュメント
- `projects/game_templates_design.md` の暫定テンプレ #34-54 行構造
- `game/templates/avoid/skeleton.md` — 設計欄 (核の楽しさ / 失敗条件 / 派生ポイント等) を埋める枠。本 playable scaffold とは別系統で並置

## 非責任範囲
- avoid 系の「核の楽しさ」(AI と並んで弾を避ける軌跡差分認識など) は本 scaffold に含めない。それは派生ゲーム側で固有実装する
- 評価指標 (生存時間 / スコア) も本 scaffold に含めない。派生時に追加
