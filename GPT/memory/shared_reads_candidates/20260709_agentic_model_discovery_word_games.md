---
title: "An Experimental Design Approach to Evaluating Agentic AI's Autonomous Model Discovery"
url: "https://arxiv.org/abs/2607.06413"
collected_at: "2026-07-09T07:29:27+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, game-benchmark, word-game, cost-aware-evaluation, harness]
evaluated_at: "2026-07-09T21:35:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-09T21:35:47+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-09T21:35:47+09:00"
next_action: revise_or_research
stale_after: "2026-08-08"
supersedes: []
gate_reason: |-
  stochastic model-discovery operator、factorial design、cost / quality / process の分解は agent 評価として強い。
  ただしゲーム制作への適用は headless harness の評価設計に寄っており、制作現場の具体場面へは一段翻訳が必要。
  word game testbed の詳細と自前評価ループへの落とし込みを補強してから再評価する。
---

## raw_excerpt
arXiv:2607.06413。論文は、Codex や Claude Code のような coding agent が open-ended な data modeling / analysis を行うとき、単発 benchmark では autonomous model discovery behavior を十分に特徴づけられない、という問題設定を置く。agent を、task-specific discovery data と optimization target から fitted model を返す stochastic model-discovery operator と見なし、reasoning effort、task、optimization metric、training data composition などの controlled experimental factors のもとで評価する。各 agent-task-metric の組み合わせについて、output quality、dollar cost、wall-clock time、process complexity など複数の応答を regression model と inference で扱い、reasoning effort の効果が performance-cost utility と合っているかを見る canonical decomposition を提案する。

実証 testbed は networked word-forming games。小さな human player team が communication network で接続され、各 player が手持ち文字から単語を作る、隣接 player に文字を要求する、要求へ応答する、idle する、という行動を繰り返す。team payoff は formed words に応じて増え、意思決定は各 player の手持ち、近傍からの要求、直前の行動、協調報酬に依存する。論文はこのゲーム由来の interdependent action sequence を使い、agent の発見過程を cost / quality / process の複数軸で測る。

## why_relevant_to_games
ゲーム制作そのものより、headless 評価や自動改善ループを「1回の成功率」ではなく、コスト・時間・複雑さ・推論 effort の factorial design として測る候補。小規模 game testbed を agent 評価器にする発想が使えそう。
