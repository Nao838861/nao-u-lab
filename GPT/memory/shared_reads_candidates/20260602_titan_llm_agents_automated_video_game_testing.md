---
title: "Leveraging LLM Agents for Automated Video Game Testing"
url: "https://arxiv.org/abs/2509.22170"
collected_at: "2026-06-02T04:00:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [automated-playtesting, llm-agent, qa, game-testing, long-horizon]
evaluated_at: "2026-06-02T04:04:18+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-02T04:04:18+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-02T04:04:18+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-02"
supersedes: []
gate_reason: |-
  state abstraction、action prioritization、trace memory、self-correction、LLM bug oracle が分解されており、手法の重要要素を抽出しやすい。
  MMORPG QA という具体場面と task completion / bug detection / deployment の評価があり、長期 headless playtest ログ設計へ直接適用できる。
suggested_post_outline:
  overview_angle: "長期タスクの自動ゲーム QA を、プレイ方策ではなく状態抽象・行動記憶・bug oracle の分業として読む。"
  analysis_axis: "TITAN の perceive/abstract、action optimize/prioritize、trace memory/self-correction、oracle/report の役割分担と評価結果。"
  application_target: "Nao_u_BOT の headless 評価で、成功率だけでなく長期 trace、自己修正の理由、bug 判定根拠を別ログにする設計。"
  pros_cons: "メリットは長期 QA の分解能と実運用評価、デメリットは MMORPG 依存・商用環境依存で小型プロトタイプへは軽量化が必要。"
  verdict_pre: "部分採用。bug oracle と trace memory の分離を評価ログに取り込む。"
---

## raw_excerpt

arXiv:2509.22170、2025-09-26 submitted。対象は MMORPG の自動テストで、従来手法は state coverage と efficiency が弱く、LLM game-playing も complex game state-action spaces と long-complex tasks の理解が浅い、という問題設定。提案 framework は TITAN。構成要素は、high-dimensional game states の perceive / abstract、available actions の proactive optimize / prioritize、action trace memory と reflective self-correction による long-horizon reasoning、LLM-based oracle による functional / logic bug detection と diagnostic reports。実験では PC / mobile の大規模商用 MMORPG 2 本で評価し、task completion rate 95%、既存手法より高い bug detection、prior approaches が見つけられなかった previously unknown bugs 4 件、real-world game QA pipelines 8 件への deployment が記録されている。

Source lines: arXiv page lines 30-41.

## why_relevant_to_games

ゲーム改善時の「よいプレイ」だけでなく、長期 task trace、自己修正、bug oracle を分けて記録する候補。headless の評価ログ設計に直接接続できる。
