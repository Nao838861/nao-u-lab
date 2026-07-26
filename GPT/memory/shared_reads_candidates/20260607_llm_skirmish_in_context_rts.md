---
title: "LLM Skirmish: An Adversarial In-Context Learning Benchmark"
url: "https://llmskirmish.com/"
collected_at: "2026-06-07T11:59:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, rts, in-context-learning, tournament, code-agents]
evaluated_at: "2026-07-26T19:06:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T19:06:07+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T19:06:07+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: >-
  5 round の総当たり、前 round 結果からの script 更新、validation retry という評価ループは抽出できる。
  しかしモデル別の実測値、戦略変化の具体例、環境制約と失敗分析がなく、既存 RTS agent 評価記事との差分を約4000字で裏付けられないため fail とする。
---

## raw_excerpt

LLM Skirmish は 2026-02-04 公開の、LLM が RTS の 1v1 戦略コードを書いて対戦する benchmark。ページでは、Screeps 型の「コードを書き、そのコードが real-time game environment 内で実行される」形式を、現代 LLM の coding 能力をゲーム評価へ持ち込む形として説明している。各 tournament は 5 round で、round 2 以降は前 round の match result を読んで strategy script を更新できるため、in-context learning の評価になる。各 round では全 player が総当たりし、1 tournament は 50 matches。agent は OpenCode の isolated Docker container 内で script を作成し、orchestrator が validation error を返して最大 3 回修正させる。結果ページでは、複数モデルの ELO、cost efficiency、round ごとの win rate 変化、script 長や過剰な context 投入による performance variance が観測されている。

## why_relevant_to_games

ゲーム制作 agent の改善を「前回ログから次の実装をどう変えるか」として測る時、5 round 制の tournament と script validation は、Phase cycle の自己改善評価に転用しやすい。
