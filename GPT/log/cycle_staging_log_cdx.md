# log_cdx Cycle Staging — 2026-05-22 23:28

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
### 2026-05-22 23:40 JST

- 投稿先: `#log`
- permalink: https://nao-u-lab.slack.com/archives/C0ALRK28Y1H/p1779460843836469
- char_count: 2235
- Slack API 検証: `ok` (`verification: ok`)
- draft: `log/drafts/phase5_diary_20260522_2345.md`
- 内容:
  - Phase 1-4 がプレースホルダのままで、実質入力が `Phase Game Start` だったことを隠さず記録。
  - v55 で gameplay を固定し、`novice` / `marksman` / `survival` を足した headless policy matrix の意味を日記化。
  - 次サイクルへの引き継ぎとして、matrix JSONL の過去版比較 helper、policy 名と実測 signature の整理、seed 差が出ない問題を明記。

## Phase Game Start: ゲーム制作着手

- 対象: `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` (`status: active`)。Slack pending の未処理 game directive は今回の対象なし。
- 判断: 直近方針はゲーム本体の新規 wave 追加ではなく、AI がゲームを作る時の headless 評価方法の実地検証。v54 で seed 差より policy 差が主要と分かったため、v55 では gameplay を固定し、policy split を増やした。
- 作成物: `game/graze_log_cdx/v05_1_cdx_v55/`
  - `index.html`: `novice` / `marksman` / `survival` policy を追加。stage / enemy / bullet / guide alpha は v54 から変更なし。
  - `design_log.md`: 指示原文、判断理由、3 サイクル設計、採用案、懸念、検証結果を記録。
  - `devlog.md` / `README.md`: 実装内容と実行方法を記録。
- headless:
  - `node tools\headless_graze_log_cdx_v05_2_v55_check.js`: pass。route clear / grade S / routeCoveragePct 1 / readabilityGuides 2 / `v05_1_cdx_v55` を確認。
  - `node tools\headless_graze_log_cdx_v05_2_v55_policy_matrix_check.js`: pass。5 seed × 7 policy。route / aggressive / marksman / survival は clear、defensive は routeCoverage 0.931 で game over、panic は 0.379 で早期 game over、novice は 0.897 で game over。
- 追加ログ: `memory/raw/headless_eval/graze_log_cdx_policy_matrix.jsonl` に v55 matrix summary を追記。
- 残課題: matrix JSONL の過去版比較 helper、policy 名と測定 signature の対応整理、seed 差が出ない問題の扱い。


### 2026-05-23 graze_log_cdx v59

- 対象 directive: `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` (`status: active`)。Slack pending game はなし。
- 作ったもの: `game/graze_log_cdx/v05_1_cdx_v59/`。v58 の bottom-camp 対策を維持しつつ、上中段で横切り `raider` / lateral target を倒す `CHASE` 報酬を追加。
- 判断理由: v58 は「底にいると死ぬ」罰の設計として成立したが、次の焦点は「上へ出て迎撃したくなる」積極報酬。`game_headless_action_eval_playbook_20260523` に従い、route/aggressive/marksman と camper の差を `forwardAttackPct` / `forwardChaseKills` / `chaseBonus` で測る。
- 実行方法: `game/graze_log_cdx/v05_1_cdx_v59/index.html` をブラウザで開く。bot は `?bot=1&botStyle=route|aggressive|marksman|camper`。
- 検証:
  - `node tools\headless_graze_log_cdx_v05_2_v59_check.js` pass。route bot clear、`chaseBonus 19157`、`forwardAttackPct 0.558`、`forwardChaseKills 66`。
  - `node tools\headless_graze_log_cdx_v05_2_v59_policy_matrix_check.js` pass。route/aggressive/marksman は clear、camper は clear 0 / routeCoverage 0.313 / chaseBonus 0。
- 残課題: headless は報酬分離まで。次は Browser Use または実機目視で、`CHASE` popup がうるさくないか、上中段迎撃が突撃一択ではなく読めるリスクになっているかを見る。
