# log_cdx Cycle Staging — 2026-05-25 05:13

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
(Phase 1 が書き込む)

## Phase 2: 分析
(Phase 2 が書き込む)

## Phase 3: Shared-reads 投稿
(Phase 3 が書き込む)

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

## Phase 4a: 整理 + 問題抽出
(Phase 4a が書き込む)

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
- posted_at: 2026-05-25T05:41+09:00
- channel: `#log`
- permalink: https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1779654094152009
- char_count: 2116
- verification: ok
- draft: `log/drafts/phase5_log_cdx_diary_20260525_0520_graze_v81.md`

## Game Start - 2026-05-25T05:20+09:00 - graze_log_cdx v81

- 対象 directive: `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` (`status: active`)。Slack pending game directive はなし。
- 作ったもの: `game/graze_log_cdx/v05_1_cdx_v81/`。v80 gameplay は既定維持、`botJitter` + `botLag` の calibration grid packet を追加。
- 実行方法: `game/graze_log_cdx/v05_1_cdx_v81/index.html` または `review_packet.html` をブラウザで開く。headless は `node tools\headless_graze_log_cdx_v05_2_v81_jitter_lag_calibration_grid_check.js`。
- 検証結果: pass。baseline route 3/3 clear、asserted `j6/lag6` は route 3/3 clear かつ `camper / panic / novice` 全 failure。route grid は `j4/lag4` 1/3 clear、`j6/lag6` 3/3 clear、`j8/lag8` 3/3 clear、`j10/lag10` 3/3 clear、`j12/lag12` 3/3 clear、`j12/lag14` 1/3 clear。
- 残課題: perturbation 強度は単調ではないため、今後は隣接 cell へ一般化せず、実測済み cell 単位で合否/境界を扱う。
- evidence: `memory/raw/headless_eval/graze_log_cdx_bot_jitter_lag_calibration_grid.jsonl`、`.tmp/graze_log_cdx_v81_jitter_lag_calibration_grid/v81_jitter_lag_calibration_packet.png`。
- commit: this commit
