---
title: "Autonomous Information Seeking: A Roadmap for Agentic Recommender Systems"
url: "https://arxiv.org/abs/2607.04433"
collected_at: "2026-07-19T10:31:55.6071157+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [player-modeling, personalization, agent, evaluation, user-simulation]
evaluated_at: "2026-07-19T10:36:51+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T10:36:51+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-19T10:36:51+09:00"
next_action: keep_for_reference
stale_after: "2026-08-18"
supersedes: []
gate_reason: >
  三 paradigm と autonomy 軸は整理に使えるが、候補内の中核は研究課題の列挙で、手法比較を裏づける実験設定・定量評価・失敗分析がない。
  adaptive difficulty や player model への接続も推薦領域からの類推に留まり、現状ではゲーム制作向けに約4000字を残す固有情報密度に届かない。
---

## raw_excerpt

この survey は、推薦システムが静的な ranking pipeline から、推論・計画・行動を行う対話的 agent system へ移る状況を整理する。分類軸は autonomy の水準と、agent-assisted recommendation、agent-as-recommender、agent-as-user-simulator の三 paradigm である。autonomy は proactivity、context awareness、interaction flexibility、adaptivity の増加として配置され、各 paradigm について profile、memory、tool use、workflow、optimization がどう組み込まれるかを比較する。評価は automated metric、LLM judge、simulation-based assessment を扱い、それらが reasoning quality、user experience、system behavior を十分に捉えない問題を挙げる。未解決事項として trajectory-level assessment、agent contribution analysis、user simulation の calibration を示し、さらに lifelong user modeling、contextual abstraction、multimodal alignment、controllability、trustworthiness、privacy、scalability、efficiency を今後の課題として列挙する。

## why_relevant_to_games

adaptive difficulty、player modeling、NPC・playtester persona を設計する際に、推薦 agent と user simulator を分け、単発 metric ではなく trajectory・体験・simulation calibration を収集する観点につながる。
