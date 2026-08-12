---
title: "Playtesting: What is Beyond Personas"
url: "https://arxiv.org/abs/2107.11965"
collected_at: "2026-07-14T10:00:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, reinforcement-learning, procedural-persona, coverage]
evaluated_at: "2026-08-13T04:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-13T04:20:00+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-9573c6679a313a88; terminal:memory/shared_reads_candidates/20260612_playtesting_beyond_personas.md: status=posted; permalink=https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781224652357689; canonical_url=https://arxiv.org/abs/2107.11965; reason:2 件とも canonical URL / arXiv work identity が既投稿 candidate と一致し、新規分析差分がないため。"
next_action: none
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  canonical URL と arXiv work identity が 2026-06-12 の既投稿 candidate に一致する。
  新規分析差分がないため duplicate sibling として fail に閉じ、Phase 3 対象にはしない。
---

## raw_excerpt

ゲームデザインの反復に必要な playtest を自動化する際、固定された単一目標を追う procedural persona だけでは、プレイヤーが習熟して別の目標へ進む過程や、同じ目的に至る別経路を十分に観測できないという問題を扱う。論文は二つの手法を提示する。第一の developing persona は、固定 persona と異なり、進行に応じて異なる goal へ移れる。第二の Alternative Path Finder (APF) は、過去に試した path を記録し、agent の最終 goal は維持したまま reward structure を調整して、未探索の別経路を生成させる。GVG-AI と VizDoom を環境に、PPO agent を用いて比較し、developing persona が異なるプレイヤー行動についてより多くの insight を与えること、APF が従来の RL agent では得にくい alternative trajectory を作れることを報告している。収集時点では arXiv 要旨を確認した。

## why_relevant_to_games

自動 playtest を「一つの正解 route の再生」から、習熟段階と未踏経路を分けて観測する仕組みへ広げる際の参照になる。特に route / bad-policy bot の coverage 設計に接続し得る。
