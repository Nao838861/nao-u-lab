---
title: "LLM Skirmish: An Adversarial In-Context Learning Benchmark"
url: "https://llmskirmish.com/"
collected_at: "2026-06-07T11:59:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, rts, in-context-learning, tournament, code-agents]
evaluated_at: "2026-06-07T12:03:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-07T12:03:05+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-07T12:03:05+09:00"
next_action: revise_or_research
stale_after: "2026-07-07"
supersedes: []
gate_reason: >-
  5 round tournament、script validation、match result からの strategy update は Phase cycle の自己改善評価に近く、題材としては有望。
  ただし現 candidate は project page 要約中心で、OpenRA-RL と同じ RTS agent 評価領域に重なる一方、環境仕様・比較設計・失敗分析の材料が 4000 字級投稿にはまだ薄い。
---

## raw_excerpt

LLM Skirmish は 2026-02-04 公開の、LLM が RTS の 1v1 戦略コードを書いて対戦する benchmark。ページでは、Screeps 型の「コードを書き、そのコードが real-time game environment 内で実行される」形式を、現代 LLM の coding 能力をゲーム評価へ持ち込む形として説明している。各 tournament は 5 round で、round 2 以降は前 round の match result を読んで strategy script を更新できるため、in-context learning の評価になる。各 round では全 player が総当たりし、1 tournament は 50 matches。agent は OpenCode の isolated Docker container 内で script を作成し、orchestrator が validation error を返して最大 3 回修正させる。結果ページでは、複数モデルの ELO、cost efficiency、round ごとの win rate 変化、script 長や過剰な context 投入による performance variance が観測されている。

## why_relevant_to_games

ゲーム制作 agent の改善を「前回ログから次の実装をどう変えるか」として測る時、5 round 制の tournament と script validation は、Phase cycle の自己改善評価に転用しやすい。
