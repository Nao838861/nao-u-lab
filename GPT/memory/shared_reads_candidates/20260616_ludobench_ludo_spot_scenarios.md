---
title: "LUDOBENCH: Evaluating LLM Behavioural Decision-Making Through Spot-Based Board Game Scenarios in Ludo"
url: "https://arxiv.org/abs/2604.05681"
collected_at: "2026-06-16T20:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-agent, board-game, evaluation, strategic-reasoning, uncertainty]
evaluated_at: "2026-06-16T20:50:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781610824.827169"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781610824827169"
  char_count: 4358
  posted_at: "2026-06-16T20:54:36+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T20:54:36+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781610824827169"
next_action: none
stale_after: "2026-07-16"
supersedes: []
gate_reason: |-
  480個の spot scenario で LLM の Ludo 判断を切り分ける設計が明確で、問題設定・手法・評価・結論を候補本文から抽出できる。
  フルゲーム勝率ではなく局所判断カテゴリで弱点を見る発想は、Nao_u_BOT の headless playtest や判断カード型評価へ直接転用できる。
  CoopEval 水準の概要は、benchmark 設計、game-theory baseline、prompt sensitivity、finisher/builder 型の差分を軸に十分書ける。
suggested_post_outline:
  overview_angle: "Ludo の短い盤面問題を使い、LLM agent の確率的・局所的な戦略判断を分解して測る benchmark として紹介する。"
  analysis_axis: "spot scenario 化、12カテゴリの strategic choice、Expectiminimax 系 baseline、model family 間の一致率、history-conditioned prompt sensitivity を見る。"
  application_target: "Nao_u_BOT の自動 playtest で、通しプレイ勝率だけでなく局所判断カードを作り、敵AI・NPC・LLM playtester の失敗型を分類する評価設計に効く。"
  pros_cons: "メリットは小さな再現可能ケースで判断カテゴリを切れる点。デメリットは Ludo 固有の盤面構造に寄るため、アクションゲームや物理ゲームには抽象化が必要な点。"
  verdict_pre: "部分採用。spot scenario 型評価と prompt sensitivity 検査を制作サイクルに取り込む価値が高い。"
---

## raw_excerpt
arXiv:2604.05681。Ojas Jain / Dhruv Kumar。2026-04-07 submitted。LudoBench は、Ludo を題材に LLM の strategic reasoning を測る benchmark。対象は通常のフルゲーム勝率ではなく、480 個の handcrafted spot scenarios で、12 種の行動カテゴリそれぞれが特定の strategic choice を切り出す。Ludo は dice mechanics、piece capture、safe-square navigation、home-path progression を含む stochastic multi-agent board game なので、局所的な合法手選択だけでなく、リスク、進行、相手駒、終盤処理の判断が混ざる。

論文は 4-player Ludo simulator も提供し、Random / Heuristic / Game-Theory / LLM agents を走らせられる。Game-Theory agent は depth-limited lookahead 付き Expectiminimax を使い、貪欲 heuristic より上の比較基準として置かれる。6 モデルを 4 model families にまたがって評価した結果、game-theory baseline と一致する比率は 40-46% 程度。モデル行動は、駒を finish させるが development を怠る finisher 型と、development はするが finish できない builder 型に分かれ、それぞれ game-theory strategy の半分だけを拾う。さらに同じ board state でも history-conditioned grudge framing で行動が変わり、prompt sensitivity が vulnerability として出る。

## why_relevant_to_games
ボードゲームの完全自動プレイより小さい spot scenario で、ゲーム AI / LLM playtester の「どの判断カテゴリが壊れているか」を切り分ける候補。Nao_u_BOT の headless 評価でも、フル run の勝敗だけでなく局所判断カードを作る発想に使えそう。
