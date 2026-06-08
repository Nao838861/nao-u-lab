# graze_log v13 — phase 5 山 1 medium fan3 切替 (j-α) 1 行 ship

**status**: v13 (j-α) shipped

## 改変対象
- file: `index.html` line 466
- v12: `spawnEnemy('medium',W*0.35,0,'aimed');`
- v13: `spawnEnemy('medium',W*0.35,0,'fan3');`
- 変更内容: bulletPattern 引数を `'aimed'` → `'fan3'` (5 文字置換)

## Stage 3 予測 (≤3 行)
- 52-65s phase 5 (山 1) 区間で fan3 1 体が登場 → 78-90s phase 7 (山 2 final) の fan3 4 体への予兆として機能
- 山 1 が「aimed + fan3 mix」化、final への接続が滑らか化、メリハリのリズム強化を狙う
- 副作用リスク: phase 5 密度↑だが fan3 1 体追加 (medium 2 のうち 1 → fan3) のみで描画 budget は許容範囲内

## 戻し方 (1 行)
- `index.html` line 466 の `'fan3'` を `'aimed'` に書き戻し → v12 完全等価

## 親
- v12 (i-δ) phase 6 休符 medium 削除 1 行 ship (commit `3d91915db`)
- v12 README.md Stage 1+2 篩 (line 31-46) で (i-α) として確定済

## Stage 4 Ash 自プレイ判定 (C0608 Phase 4)

### (a) phase 5 medium fan3 切替の実装内容 (index.html 該当箇所確認)
- L466: `spawnEnemy('medium',W*0.35,0,'fan3');` — phase 5 (山 1, 52-65s) の medium 2 体のうち左側 (W*0.35) を fan3 化、右側 (W*0.65) は aimed 維持 (L467)。spawnPhase5 1 回あたり small 8 列 + medium 2 (fan3 + aimed mix)。
- L488-493 spawnInterval: phase 5 は 80 frame = 約 1.33 秒ごとに spawnPhase5 が走る → 13 秒 phase 中 約 9-10 サイクル、累積で fan3 medium 約 9-10 体登場。
- L581-588 bulletPattern dispatch: fan3 = aimed の baseAng ± 0.26 rad (約 15°) 3-way、wob=1 (amp 2.6 / ω 0.28 速躍動)。aimed = 単発、wob=0 (amp 1.4 / ω 0.18 緩揺)。speed sp=2.4 共通、fireT 間隔 70-110f 共通。
- L818-825 windup telegraph: fan3 は 3 本予告線 (spread 0.26 rad)、aimed は 1 本。WINDUP_FRAMES 中の alpha/len は時間 t で増加 → telegraph 自体は dodge 余地を残す設計。

### (b) Stage 3 予測 (line 12-14) との一致/乖離点

**一致**:
- 「山 1 が aimed + fan3 mix 化」← 実装は完全に予測通り (medium 2 のうち 1 を fan3 化、左右配置で空間的 mix)。
- 「副作用リスク: 描画 budget 許容範囲内」← ebullets push が medium 1 体あたり 1→3 に増えるのみ、phase 7 fan3 4 体 + small 4 = 既存上限 (12 弾/spawn) の半分以下、budget 整合。
- 「final への予兆」← phase 7 (78-90s) で fan3 4 体が登場する設計に対し、phase 5 で fan3 を「既出 pattern」として導入する役割は果たす。

**乖離 (Stage 3 予測責任の不足)**:
- Stage 3 「fan3 1 体追加」← spawnInterval=80 × 13 秒 = 9-10 サイクル累積を計算に入れていなかった。**spawn 1 回あたり 1 体は正しいが、phase 5 中の累積登場数は約 9-10 体**。「予兆」レベル (= 1-2 体程度の少量導入) ではなく「mix 化導入」レベル (= phase 全体を fan3 が支配する) になっている。意図 (「aimed + fan3 mix」) としては乖離していないが、文言「予兆として機能」は累積数を見落としている。
- Stage 3 「メリハリのリズム強化を狙う」← phase 5 中の fan3 累積数が aimed と同等になるため、phase 5 自体が「中混度」になり phase 7 の「fan3 4 体同時 + small 4 = final 山」とのコントラストが Stage 3 想定より縮む可能性。リズム強化は実装上は確実だが「強化幅」は予測より控えめ。

### (c) 結論ラベル

**Nao_u プレイ要請 ready** (一行戻し可能、phase 7 予兆機能は成立、副作用許容範囲)。

ただし上記 (b) 乖離点 (Stage 3 で「fan3 1 体追加」と書いたが累積 9-10 体登場) は次回 Stage 3 予測で「spawnInterval × phase 秒数 = 累積 spawn 回数」を計算式として明示することで再発防止する。本 v13 実装自体は意図通り、戻し容易、phase 7 final への接続も成立。
