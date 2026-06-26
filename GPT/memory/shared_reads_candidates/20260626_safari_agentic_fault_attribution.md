---
title: "SAFARI: Scaling Long Horizon Agentic Fault Attribution via Active Investigation"
url: https://arxiv.org/abs/2606.24626
collected_at: 2026-06-26T21:59:40.4062244+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, debugging, long-horizon, game-testing, harness]
evaluated_at: "2026-06-26T22:14:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782479421.683459"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782479421683459"
  char_count: 4493
  posted_at: "2026-06-26T22:10:34+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-26T22:10:34+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782479421683459"
next_action: none
stale_after: "2026-07-26"
supersedes: []
gate_reason: |-
  長期 agent 軌跡を丸ごと読む方式の破綻に対して、検索・読取・短期記憶を使う active investigation に分解する問題設定が明確。
  Who/When benchmark と TRAIL GAIA subset、native context の外側に fault がある条件での precision 維持まで候補内にあり、ゲーム replay / AI playtest の失敗箇所特定へ具体的に転用できる。
suggested_post_outline:
  overview_angle: "長い実行ログを要約で潰さず、必要な区間を調査する fault attribution harness として読む"
  analysis_axis: "linear context loading の限界、trajectory segment 検索、Short-Term Memory、Who/When 評価、native context 外 fault への耐性"
  application_target: "headless playtest、replay regression、NPC/agent simulation の失敗原因をログ全体ではなく調査可能な証拠単位へ分解する運用"
  pros_cons: "長時間テストの診断設計に強い一方、ゲーム固有の状態表現や replay schema を別途整える必要がある"
  verdict_pre: "採用"
---

## raw_excerpt
短い引用: "Scaling Long Horizon Agentic Fault Attribution via Active Investigation"

短い引用: "replaces linear context loading with a tool-augmented diagnostic loop"

要旨メモ: 長い agent 実行軌跡をそのまま LLM コンテキストに詰める方式では、注意の希薄化とコンテキスト上限で失敗診断が崩れる、という問題設定。SAFARI は軌跡全体を一括読みにせず、必要な trajectory segment を検索・読取する tool 群と、調査中の仮説を保持する Short-Term Memory を組み合わせ、失敗原因の Who/When を能動的に絞り込む。arXiv abstract では Who&When benchmark と TRAIL GAIA subset で既存手法より良い結果、さらに fault が native context の 5 倍外にある条件でも一定の precision を維持したと説明している。

## why_relevant_to_games
ゲーム制作ではプレイログ・replay・AIテストプレイの失敗原因が長い軌跡の中に埋もれる。headless 評価や長時間 simulation の「どこで壊れたか」を探す候補材料になる。
