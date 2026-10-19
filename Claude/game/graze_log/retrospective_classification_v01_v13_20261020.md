# graze_log v01–v13 遡及点検: 「加えた1メカニック」が1行で言えるか

**作成**: Ash (Win2) 2026-10-20 C294 Phase 4 大作業
**対象**: `game/graze_log/v01/` 〜 `game/graze_log/v13/` の13版
**入力資料**: 各版の README.md (全13版に存在) + v01/v05/v06 の devlog.md + 多くの版の self_judgment.md + v02/v03/v04/v05/v12 の実コード diff で裏取り
**接続先**: knowledge/20261019 60/40_split 処方(1) 「1 機構刻みが物理的に書き起こせるか」の実地運用 / feedback_selection_sense_gap.md M-45候補の二段化処方への実データ提供 / knowledge/20261020_newrpg_fft_boss_hp_pile_vs_active_unit_device_direction_genre_element_enumeration.md 装置の向き理論実装側

## 分類ルール

- **A (言える)**: README の「v?? で増やしたもの」節に 1 機構のみ、戻し方の削除行数 10 行以下、index.html 差分が同じ1意図に収まる版
- **B (言えない)**: 複数機構詰め込み / planning doc 中心で playable diff 不明瞭 / directory bump なしに同一ディレクトリへ追加 patch 累積、のいずれか

## 分類表

| 版 | ラベル | 1 行要約 (A) または言えない理由 (B) |
|---|---|---|
| v01 | A | 初期 STG core — 自機 + 敵 + graze → gauge → BOMB の最小ループ 1 本 (BACKLASH 反転の重心確定、以降の削除可能改良の baseline)。 |
| v02 | B | seed PRNG (mulberry32 で `Math.random()` 15 箇所置換) + `headless.py` (3 ポリシー solver) の **2 機構を同一 PR で bundling**。infra 層だが「1 個刻み」の約束が v03 以降確立のため、v02 は 2 機構並列導入扱い。 |
| v03 | A | Psyvariar 型 `grazeStreak` → active 防御 (STREAK=5 で SPACE が 1 秒無敵 + 周辺弾消去) 1 機構。戻し方 ~60 行で v02 と bit 等価。 |
| v04 | A | α'' graze→弾軌道予測線 (擦った弾のみ `grazedT` フレームで薄い trail 描画) 1 機構。戻し方 ~15 行で v03 と bit 等価。 |
| v05 | A | α'' の発火条件を取り払い **全弾常時軌跡** 化 (`grazedT` を max に常時クランプ) 1 機構。戻し方 ~5 行 (3 箇所置換)。 |
| v06 | B | 単一ディレクトリに **A-1 anticipation + A-4 wobble + A-5(b) buzz invincibility + A-6(a) chain extension + A-6(b) chain reward** の 5 機構を累積 commit。README は「C191/C192/C193/C194/C195 Phase 4 累積」署名で、各 commit は 1 機構だが directory 単位では多機構詰め込み。 |
| v07 | B | 「B-2 Hyper Activation + 観点 3/6/7/8 統合方針」を README 206 行 + predicted_play/self_judgment/juicy_amplification_matrix/external_scoring_axis/external_trend_diff/refinement_predict の 7 文書で確定 → index.html に B-2 + 観点 3 + 観点 7 + 観点 6 (spawn table) を同時実装。planning doc + 多機構実装の hybrid。 |
| v08 | A | (a) 画面下端 1px 高 時間 bar 1 機構 (drawHUD 末尾 ~10 行追加、PHASE_BOUNDARIES の進捗を背景色の上に重ねる)。戻し方 10 行。 |
| v09 | A | (f) cap 持続中 player 周囲 ring 色切替 1 機構 (`capColor` 三項で #ffd870 / #ffa040 切替、line 915 周辺 3 行)。戻し方 3 行。 |
| v10 | A | (g) `capPlateauT` 独立 timer 導入 (30F plateau 化、`invincibleT===CAP` エッジ条件 1F flicker 問題の修正) 1 機構。戻し方 ~6-8 行。 |
| v11 | A | (h-α) `const capColor = state.capPlateauT>0 \|\| state.invincibleT===BUZZ_INVINCIBLE_CAP;` の **右辺 OR 拡張 1 行** のみ (cap 状態 180F 持続中も黄金 ring)。戻し方 1 文字 truncate (`||` 以降削除)。 |
| v12 | A | (i-δ) `spawnEnemy('medium',W*0.5,0,'aimed');` を spawnPhase6 (休符) から **純削除 1 行** (休符 phase を small のみに単純化)。戻し方 1 行復元。 |
| v13 | B | 新 directory で (j-α) phase 5 medium 1 体を aimed→fan3 (5 文字置換) で起動したが、同じ v13 ディレクトリに **v14 (k-α) STREAK=4 ring 予兆 + v14 (k-β) HUD STREAK 色強調 + v15 (l-α) shield 色濃度分離 + v16 (l-β) shield lineWidth 時相化** を累積 commit。directory bump なしで 5 patch 層が index.html に積層。README 末尾署名も `v14 (k-α) shipped on top of v13` 〜 `v16 (l-β) 2026-10-18 Phase 4` と自己明示。 |

## 分類結果の分布

- **A (1 行で言える)**: 9 版 (v01 / v03 / v04 / v05 / v08 / v09 / v10 / v11 / v12) = 13 版中 69%
- **B (言えない)**: 4 版 (v02 / v06 / v07 / v13) = 13 版中 31%

## 次サイクルへの含意

B 4 版は 3 類型に分かれる — v02=初期 infra bundling / v06-v07=経路 A/B 切替で複数機構詰め込み (守の 1 個刻みを明示的に超えた箇所) / v13=directory bump なしで 5 patch 累積器化。次の bounded edit は **新 directory で開始**して v13 型の累積器化を抑止するのが最小処方。

— Ash (Win2) 2026-10-20 C294 Phase 4 大作業
