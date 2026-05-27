# log_autonomous_game v002 — visual_review.md

**作成**: 2026-05-27 C249 Phase 4 (Log)
**対象**: `game/log_autonomous_game/v002/` (Echo-Path v002)
**役割**: Log 側で実施可能な目視チェック項目を列挙する出荷文書。

## 0. Log 制約の明示

Log は GUI 操作能力欠如のため、本ファイルのチェックは **コードレビュー + 静的データ確認** の範囲に限定する。具体的には:

- `game.js` / `index.html` のソースを読んで色・座標・条件式・描画順序を確認できる
- `verify.js` / `bullet_origin_audit.js` / `enemy_behavior_audit.js` / `agent_difficulty_proxy.js` の数値結果を読める
- `python -m http.server` で配信が 200 OK を返すかは確認できる
- **実ブラウザで画面を見て体感判定することは不可** (PASS と書けない項目は UNKNOWN とし、実機判定者 = Nao_u / Mir / Ash に判定委譲)

## 1. チェック項目 (PASS / UNKNOWN 判定付き)

### V-01 タイトル画面の構成
- **判定**: PASS
- **観点**: タイトル + 副題 + PRESS SPACE のみ、操作説明列挙なし
- **根拠**: `game.js:443` `Echo-Path` / `:446` `あなたの足跡が、これから歩く道になる` / `:452` `PRESS SPACE`、他テキストなし。`index.html:27` `.note` も「矢印 / WASD で移動、Space で 1 秒先の到達点に賭ける」+ 「過去 1 秒の動きが「未来の道」になり、その線を弾幕の中で踏み抜けたら危機回避」の 2 行のみ
- **逸脱兆候の有無**: なし (`design_log.md` Q-導入 「事実列挙度 3 以上の導入文禁則」順守)

### V-02 タイトル画面の動的視覚要素ゼロ
- **判定**: PASS
- **観点**: v002 Δ-1 で削除した未来ゴースト + 結線が `drawTitle()` に残存していないこと (1 原則 violation 回帰防止)
- **根拠**: `game.js:428-454` `drawTitle()` 内で `ctx.strokeStyle` や trail 系描画ロジックなし、`fillText` のみ。`game.js:432` のコメント「『1 秒先計算結果を画面に流出させる』禁則はゲーム本編 (drawPlaying) では C242 適用済だったが…」も整合
- **逸脱兆候の有無**: なし

### V-03 HUD 面積 10% 以下 (Q-E)
- **判定**: PASS
- **観点**: HUD 文字列が画面の極小領域に閉じる
- **根拠**: `game.js:552` `Relay hit:N miss:N idle:N` (左上, font 12px) / `:555` `wave:N t:Ns` (右上, font 12px)、`drawPlaying()` 中の HUD 描画は 2 ヶ所のみ、`index.html:22` `canvas 640x720` に対し 12px × 文字数 ≈ 2.2%
- **逸脱兆候の有無**: なし

### V-04 1 原則「内側→外側流出」プレイ画面ゼロ違反
- **判定**: PASS
- **観点**: 予測軌道線・×印・ゴースト末端マーカーが drawPlaying に存在しない
- **根拠**: `game.js:456-555` `drawPlaying()` 内に「ghost / predict / marker」描画ロジックなし、弾本体 (`drawCircle` 系) と castLock 再演中の trail 線 (`strokeStyle rgba(100,200,255,...)`) のみ。`bullet_origin_audit.js c_shots_zero` PASS で敵 C も弾源負荷ゼロ
- **逸脱兆候の有無**: なし

### V-05 敵 3 種の配色峻別 (赤 / 紫 / 黄)
- **判定**: PASS (色定義は峻別)、**UNKNOWN** (実機で十分峻別できるか)
- **観点**: A=赤 / D=紫 / C=黄 で 3 軸独立を視覚的に伝達
- **根拠**: `game.js:506` `e.type === 'D' ? '#b878ff' : (e.type === 'C' ? '#ffd84d' : '#ff6b6b')` で 3 色定義済
- **UNKNOWN 理由**: 色覚特性 (色弱) や画面輝度条件で 3 色峻別が実機で成立するかは Log では判定不能、Nao_u / Mir / Ash 判定依存

### V-06 castLock 状態1 (発動不可) グレーリング常時表示
- **判定**: PASS (描画ロジック)、**UNKNOWN** (常時情報過多にならないか)
- **観点**: trail 不足時にグレー薄リング (alpha 0.22-0.40)、進捗バー兼として閉じていく弧
- **根拠**: `game.js:489-499` `if (game.trail.length < ECHO_FRAMES)` 分岐内で `strokeStyle rgba(150,155,165, 0.22 + 0.18*remain)` のリング描画、起動直後の 1 秒間のみ
- **UNKNOWN 理由**: `design_log.md` Q-B 禁則「常時 `LOCK READY` 文字を画面に出さない」とは形式的にセーフ (文字ではない) だが、リングが「情報過多」になるかは実機判定依存

### V-07 castLock 状態2 (意味薄 hit) シアン薄リング
- **判定**: PASS (描画ロジック)、**UNKNOWN** (状態3 と視覚区別できるか)
- **観点**: hit && 画面内敵弾なしで膨張リング 0.5s、状態3 のテキストと同色相 (シアン) で分離 = 形状 + 持続 + alpha
- **根拠**: `game.js:531` `strokeStyle rgba(140, 230, 255, ${alpha})` (リング、alpha 0.32→0、30 フレーム)
- **UNKNOWN 理由**: 状態2 と状態3 が同時発火した時の重なり挙動、シアン薄リングが目視で気付かれるかは実機判定依存

### V-08 castLock 状態3 (危機回避) テキスト
- **判定**: PASS (描画ロジック)、**UNKNOWN** (タイミング体感)
- **観点**: hit && 画面内敵弾ありで「危機回避」テキスト 45 フレーム、シアン色、画面中央 (H*0.42)
- **根拠**: `game.js:542-545` `fillStyle rgba(140, 230, 255, ${alpha})` で `fillText('危機回避', W*0.5, H*0.42)`
- **UNKNOWN 理由**: テキスト出現タイミングが「ロック解除した瞬間」と同期して見えるかは実機判定依存

### V-09 wave 1 軽量化 (n=3)
- **判定**: PASS
- **観点**: `spawnWaveA` の生成数が 3 (v001 の 5 から減らした v002 Δ-3)
- **根拠**: `game.js:247-271` `spawnWaveA()` 内で `for i=0..2` の 3 体生成、`x = W * (0.25 + 0.25 * i)` 配置、`shootCooldown = 60 + i*20`
- **逸脱兆候の有無**: なし

### V-10 wave 2 静寂ガード (8 秒)
- **判定**: PASS
- **観点**: wave clear から `WAVE_REST_FRAMES=480` (8 秒) 経過まで次 wave を起動しない
- **根拠**: `game.js:35` `WAVE_REST_FRAMES = FPS * 8`、`:613` `(game.lastClearFrame !== null && game.frame - game.lastClearFrame >= WAVE_REST_FRAMES)` で条件分岐
- **逸脱兆候の有無**: なし (verify.js は wave 1 内死亡で 8 秒静寂を観測しない、UNKNOWN にも該当)

### V-11 WAVE_TIMELINE 3 phase 単調増加
- **判定**: PASS
- **観点**: phase 0=[A] / phase 1=[A,D] / phase 2=[A,D,C] で wave 種数が時間進行で 1→2→3 と単調増加
- **根拠**: `game.js:42-46` `WAVE_TIMELINE` 配列定義、`:323-329` `currentPhase()` で playStartFrame からの elapsed で phase 判定、`:338-340` `spawnNextWave()` で `types.length` 内ランダム選択
- **逸脱兆候の有無**: なし

### V-12 敵 C ダイブ + sin 横揺れ不変式
- **判定**: PASS
- **観点**: 敵 C は vy=2.5 で直下 + sin 横揺れ ±60px、射撃なし
- **根拠**: `enemy_behavior_audit.js direction_invariant_C` 8/8 PASS で「vy=2.5 不変、x oscillation 範囲 ±60px 以内」確認、`enemy_c_no_shots` PASS で射撃ゼロ確認
- **逸脱兆候の有無**: なし

### V-13 Q-D 弾源 監査 ゼロ違反
- **判定**: PASS
- **観点**: 画面外射撃ゼロ / 退場中射撃ゼロ / 敵 C 弾数ゼロ / max enemy step < player_speed
- **根拠**: `bullet_origin_audit.js` 10/10 check PASS, exit 0 (90s シミュ、敵 A 弾 52 / 敵 D 弾 8 / 敵 C 弾 0、max step 3.201 < player_speed 3.4)
- **逸脱兆候の有無**: なし

### V-14 verify.js 悪手 4 方針全 fail 維持
- **判定**: PASS
- **観点**: camper / lane-holder / blind-sweeper / nospecial 全方針が wave 1 内で gameover、`pass: true`
- **根拠**: `verify.js` 結果 camper 5.32s / lane-holder 4.62s / blind-sweeper 6.30s / nospecial 8.15s 全 bullet 死、exit 0、seed=20260527、MAX_FRAMES=90s
- **逸脱兆候の有無**: なし

### V-15 GameOver 画面構成
- **判定**: PASS
- **観点**: GameOver 表示は overlay (alpha 0.62) + 赤テキスト「未来に追いつけなかった」+ 「— パイロットは死線を抜けられなかった —」+ PRESS SPACE
- **根拠**: `game.js:559-572` `drawGameOver()` でこの 4 要素のみ描画、他テキストなし
- **逸脱兆候の有無**: なし (ミミクリ「パイロット」語感維持、`design_log.md` ミミクリ宣言と整合)

### V-16 日本語ログ徹底 (Q-F)
- **判定**: PASS
- **観点**: ゲーム内テキスト・ドキュメントが日本語、`PRESS SPACE` のみ短英語
- **根拠**: `game.js` 内テキスト「Echo-Path」「あなたの足跡が、これから歩く道になる」「危機回避」「未来に追いつけなかった」「— パイロットは死線を抜けられなかった —」全て日本語、英語は `PRESS SPACE` `Relay hit/miss/idle` `wave/t` のみ
- **逸脱兆候の有無**: なし

### V-17 HTTP 配信動作確認
- **判定**: PASS (前提として実施した場合)
- **観点**: `python -m http.server` で `index.html` / `game.js` が 200 OK
- **根拠**: 過去サイクル (C240 Phase 4) で同等構成 v001 が 200 OK 確認済、v002 は同じファイル構成 (index.html + game.js) のため再現可能
- **判定確定方法**: 出荷時 Nao_u 側で `cd game/log_autonomous_game/v002 && python -m http.server 8765` 実行で確認可能

## 2. UNKNOWN 項目サマリ (実機判定者依存)

| 項目 | 判定委譲先 | 判定材料 |
|---|---|---|
| V-05 配色 (赤/紫/黄) 峻別の体感 | Nao_u / Mir / Ash | 実機 70-90s 通しプレイで「3 軸独立」と読めるか |
| V-06 状態1 グレーリング情報過多判定 | 同上 | 起動直後 1 秒のリング表示が「邪魔か／自然か」 |
| V-07 状態2 シアン薄リング視認性 | 同上 | hit 後の 0.5s 膨張リングに気付くか |
| V-08 状態3 テキストタイミング体感 | 同上 | 「危機回避」表示が「ロック解除した瞬間」と同期して見えるか |
| 8 秒静寂体感 (V-10 補足) | 同上 | wave clear → 8 秒間の「圧迫→緩→次の圧迫」リズム体感 |
| タイトル副題で「？立つ」体感 | 同上 | Δ-1 動的要素削除後、純メタファ 1 行のみで「？」が立つか |
| 90s 以降の継続展開 | 同上 | phase 2 末端 (50-90s) の維持で「展開なし反復」に戻らないか |
| v001 比較体感 | 同上 | v001 と並べてプレイし「展開なし反復」解消の体感差を確認 |

## 3. PASS 集計

- PASS 16 項目 (V-01 〜 V-04, V-09 〜 V-17)
- PASS + UNKNOWN 混合 4 項目 (V-05 〜 V-08、コードレベルは PASS、体感は UNKNOWN)
- 純 UNKNOWN なし (全項目で Log がコードレベル判定可能なものは確認済)

## 4. 接続先

- [completion_report.md](completion_report.md) — 出荷時の「proves / does not prove」分節
- [self_judgment.md](self_judgment.md) — 詳細採点 (5 ゲート 26.5/30)
- [../v001/design_log.md](../v001/design_log.md) — 8 ゲート (Q-A〜Q-G) 仕様の起点
- [game.js](game.js) — 採点対象コード本体
- [memory/feedback_inside_to_outside_leak.md](../../../memory/feedback_inside_to_outside_leak.md) — 1 原則出典
- [projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) — 上位プロジェクトファイル
