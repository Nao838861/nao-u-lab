# log_autonomous_game v003 — completion_report.md

**作成**: 2026-05-27 C251 Phase 4 (Log)
**対象**: `game/log_autonomous_game/v003/` (Echo-Path v003 / phase 2 内密度カーブ漸変)
**親**: [v002/completion_report.md](../v002/completion_report.md) §4「What this v002 does NOT prove」7 項目
**用途**: v003 は v002 completion_report §4 のうち「phase 内密度カーブ」1 項目への最小差分 1 本 (currentShootInterval 関数化 + phase 2 で 90→60 frame 線形漸変) のみを着地させる version。「What this v003 proves / does NOT prove」を分節記述する出荷文書。Pulse Relay v003 教師差分 §「What this proves / does not prove」順守。

## 0. 一行コンセプト (v002 から非変更)

> 過去 1 秒の動きが「未来の道」になり、その線を弾幕の中で踏み抜けたら危機回避 — **1 秒先の自分の到達予定地点に賭ける、賭けに勝てば短時間の安全圏を得る** ごっこ遊び。

v003 ではコンセプトは触らない。**「phase 内が平坦」失点 -1 への最小差分 1 本** のみが v003 の責務。

## 1. v002 → v003 で確かに変わった点

### 1.1 game.js 差分 (実測 diff、`diff v002/game.js v003/game.js`)

| 行 | 変更 | 出所 |
|---|---|---|
| L1 | ヘッダー `v002 — Echo-Path 骨格` → `v003 — Echo-Path (v002 ベース)` | 識別子更新 |
| L4-9 | 改修方針コメント差し替え (v002 のタイトルゴースト/UI 用語洗浄記述 → v003 の phase 2 漸変記述) | 改修記録 |
| L19-21 | `SHOOT_INTERVAL=90` の用途注記 + `SHOOT_INTERVAL_PHASE2_MIN=60` 定数追加 | game.js L19-22 |
| L146/L163 | `game: 'log_autonomous_game/v001'` → `'log_autonomous_game/v003'`、`window.__logAutonomousV002` → `__logAutonomousV003` | デバッグ識別子 |
| L334-347 | **新規関数 `currentShootInterval(nowFrame)`**: phase 0/1 = 90 既定 / phase 2 (50-90s) = 90→60 線形漸変 / 90s 超は 60 固定 | game.js L334-347 |
| L387 (旧 L404) | `e.shootCooldown = SHOOT_INTERVAL` → `e.shootCooldown = currentShootInterval()` | 射撃 cooldown 計算点を関数経由に置換 |

合計 17 行追加 (636 行 → 653 行)。コメント・識別子・関数定義 1 本 + 1 行の参照置換のみで、v002 から無関係な領域への touch ゼロ。

### 1.2 verify.js 同期差分

| 項目 | v002 | v003 |
|---|---|---|
| thesis 文 | 「悪手 4 方針は 90 秒以内に必ず死ぬ」 | 「悪手 4 方針は 90 秒以内に必ず死ぬ — v003 phase 2 内 SHOOT_INTERVAL 漸変 (90→60 frame) 追加後も castLock 不使用悪手は全滅」 |
| 同型関数 | SHOOT_INTERVAL 定数のみ参照 | `currentShootInterval(elapsed)` 関数を verify 内に実装、`updateEnemies` 相当で呼び出し |
| report keys | (なし) | `shoot_interval_phase01: 90`, `shoot_interval_phase2_end: 60` を report 末尾に追加 |

### 1.3 v002 から維持した要素 (= v003 で**触らなかった**領域)

- WAVE_TIMELINE 3 phase 構造 (0-20s A / 20-50s A+D / 50-90s A+D+C) は完全維持
- wave 1 軽量化 (n=3) / wave clear 後 8 秒静寂 (WAVE_REST_FRAMES=480) は維持
- 敵 A/D/C の運動軸・color・spawn 範囲 (`enemy_behavior_audit.js` 不変式) は未変更
- echo 機構 (castLock/resolveLock/Q-成功FB 3 状態) は未変更
- 内側→外側流出 1 原則 (予測軌道線・×印・ゴースト末端マーカー非表示、`feedback_inside_to_outside_leak.md`) は維持
- タイトル画面 (Δ-1 タイトルゴースト削除済) は未変更
- bullet_origin_audit / enemy_behavior_audit / agent_difficulty_proxy の v003 移植は **意図的に行わない** (理由: design_log §2.2 — Pearson 相関は最低 3 サンプル必要、v003 単体で proxy を走らせても分母 (体感) が無いため計算不能。v002 baseline を据え置く)

## 2. verify.js 実行結果サマリ

`node game/log_autonomous_game/v003/verify.js` 実行 (本サイクル C251 Phase 4):

```
seed: 20260527
max_frames: 5400 (90s @ 60fps)
shoot_interval_phase01: 90
shoot_interval_phase2_end: 60
results:
  camper       : gameover @ 319 frames (5.32s), waves_seen=1, death_cause=bullet
  lane-holder  : gameover @ 277 frames (4.62s), waves_seen=1, death_cause=bullet
  blind-sweeper: gameover @ 378 frames (6.30s), waves_seen=1, death_cause=bullet
  nospecial    : gameover @ 489 frames (8.15s), waves_seen=1, death_cause=bullet
pass: true
survivors: []
```

- **全 4 悪手方針 gameover 到達**、 survivors ゼロ
- **死亡時刻はすべて phase 0 (0-20s = 0-1200 frame) 内** — 最遅 nospecial でも 489 frame (8.15s) で死亡、phase 1 開始 (1200 frame = 20s) すら到達しない
- 死因は全 4 件 `bullet` (敵弾接触) = v002 と同型 (v002 verify は camper 5.32s / lane-holder 4.62s / blind-sweeper 6.30s / nospecial 8.15s と完全一致 = phase 0 内の弾源負荷は v002 から変動なし)

**注意**: 4 方針が phase 0 内死亡のため、**verify.js は v003 の phase 2 漸変そのものの体感には触れない**。これは regression test (= v003 改修が phase 0 の悪手通過の穴を新規に開けていないことの確認) として読むべきで、「漸変が良い」「漸変が機能している」の積極的証拠にはならない。phase 2 漸変の意義は実機判定 (Nao_u / Mir / Ash の体感) に依存する (§4 参照)。

## 3. What this v003 does prove

- **「phase 2 内 SHOOT_INTERVAL 漸変」を 1 commit 隔離可能な最小差分で実装できる**: game.js 17 行追加 + 1 行参照置換のみで、v002 の他領域 (echo / wave dispatcher / 敵運動 / 弾源 / UI) を一切 touch せずに phase 内密度カーブを変えられた = 「次の改修候補を 1 項目ずつ最小差分で出す」運用形 ([feedback_means_ends_reversal_check.md](../../../memory/feedback_means_ends_reversal_check.md) 順守) の物理確認
- **phase 2 漸変が phase 0 の悪手通過の穴を新規に開けていない**: verify.js `pass: true`、全 4 方針 phase 0 内で gameover、死亡時刻が v002 と完全一致 (camper 319f / lane-holder 277f / blind-sweeper 378f / nospecial 489f) = 改修が改修対象外 phase に副作用を出していない
- **`currentShootInterval(nowFrame)` 関数化**: phase 内密度カーブ追加が「定数差し替え」ではなく「関数経由の動的計算」として実装され、今後 phase 1 内 / phase 0 内など他 phase への漸変追加も同関数の分岐追加で済む形に骨格化
- **verify.js report 拡張**: `shoot_interval_phase01: 90`, `shoot_interval_phase2_end: 60` を report に出すことで、verify.js 出力自体が v003 の改修内容を機械可読な形で明示する形に進化 (v002 では SHOOT_INTERVAL 値の report 出力なし)

## 4. What this v003 does NOT prove

以下は v003 では着地しておらず、実機判定または次 version 以降で扱う:

- **phase 2 漸変の体感的「展開差」**: 50s 時点 1.5 秒間隔 → 90s 時点 1.0 秒間隔 (頻度 +50%) の漸変が実機プレイで「圧迫の増加」として感じられるか / それとも 50s 以降に到達するプレイヤーが少なく無意味かは実機判定に依存。Log 単体では到達不可
- **proxy 4 指標と人間体感の Pearson 相関**: v003 では proxy を意図的に走らせなかった (design_log §2.2)。第 1 サンプルは v002 baseline (median_clear_wave=1, median_play_time=9.28s, survival_rate=0/30) を据え置き、v003 → 実機判定後の体感差分が「+1 サンプル」として有効になるか自体が次サイクル課題。第 1 回 Pearson 計算は最低 v002/v003/+1 version の 3 サンプル揃った後
- **実ブラウザでの動作 / 視覚体感の成立** (v002 §4 第1項 後段から継続): Log GUI 操作能力欠如、Nao_u/Mir/Ash 実機判定に依存
- **8 秒静寂 (WAVE_REST_FRAMES=480) の体感** (v002 §4 第2項から継続): 悪手 4 方針は phase 0 内死亡で 8 秒静寂を観測しないため verify では計測不能、実機判定依存
- **wave 1 軽量化 (n=3) の体感境界** (v002 §4 第3項から継続): proxy 数値 (median_play_time 9.28s) では「易しすぎ／ちょうどよい／圧不足」が判定できない、実機判定依存
- **タイトル副題 1 行のみで「？を立てる」体感** (v002 §4 第4項から継続): タイトル画面は v003 で未変更、実機判定依存
- **90s 以降の継続展開** (v002 §4 第6項から継続): HP system / boss / phase 3+ は v003 スコープ外
- **`feedback_headless_unfit_for_unfinished_eval.md` 順守**: headless 全 PASS だけでは「ちゃんと遊べている」判定不能の原則は v003 でも継続適用。本 v003 の「面白いか／v002 より良いか」結論は実機判定到達後に保留

## 5. リンク

- [design_log.md](design_log.md) — v003 着地スコープの明文化 (起票 C250 Phase 4)
- [game.js](game.js) — v003 本体 (currentShootInterval 関数追加)
- [verify.js](verify.js) — v003 悪手 4 方針検証 (`pass: true` 維持確認済)
- [../v002/completion_report.md](../v002/completion_report.md) — v003 起票の起点 (does NOT prove 7 項目)
- [../v002/self_judgment.md](../v002/self_judgment.md) — v002 採点 (本 v003 の比較起点、未差分採点)
- [../v001/design_log.md](../v001/design_log.md) — 8 ゲート (Q-A〜Q-G) 仕様の起点
- [../../../projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) — 上位プロジェクトファイル
- [../../../memory/feedback_inside_to_outside_leak.md](../../../memory/feedback_inside_to_outside_leak.md) — 1 原則出典 (v002/v003 で完全達成維持)
- [../../../memory/feedback_means_ends_reversal_check.md](../../../memory/feedback_means_ends_reversal_check.md) — 「ゲームを動かして出す」原則 (本 v003 が C251 Phase 4 で game/* diff 1 commit を出した記録)
- [../../../log/cycle_staging_log.md](../../../log/cycle_staging_log.md) C251 Phase 4 セクション — 本ファイル起票文脈
