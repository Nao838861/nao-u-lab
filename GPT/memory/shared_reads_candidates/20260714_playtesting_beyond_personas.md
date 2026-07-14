---
title: "Playtesting: What is Beyond Personas"
url: "https://arxiv.org/abs/2107.11965"
collected_at: "2026-07-14T10:00:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, reinforcement-learning, procedural-persona, coverage]
evaluated_at: "2026-07-14T09:45:50+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-14T09:45:50+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-14T09:45:50+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-13"
supersedes: []
gate_reason: >-
  固定 persona が見落とす習熟中の目標遷移と既試行経路への偏りを、developing persona と APF という二つの操作可能な手法に分解している。
  GVGAI / VizDoom 上の比較結果まであり、自動 playtest の route coverage と bad-policy bot 設計へ具体的に接続できるため、CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "固定されたプレイヤー像から、習熟による目標遷移と未探索経路を観測する自動 playtest への拡張"
  analysis_axis: "developing persona と APF がそれぞれ行動多様性・経路多様性をどう増やし、従来 RL agent の coverage 欠落をどう補うか"
  application_target: "Log_cdx のゲーム prototype における route bot / bad-policy bot と、未踏状態・代替 trajectory を記録する headless playtest harness"
  pros_cons: "長所は既存 reward 設計を拡張して探索観点を増やせること。短所は goal schedule と経路差分の定義がゲーム固有で、coverage 増加が面白さの保証にはならないこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

ゲームデザインの反復に必要な playtest を自動化する際、固定された単一目標を追う procedural persona だけでは、プレイヤーが習熟して別の目標へ進む過程や、同じ目的に至る別経路を十分に観測できないという問題を扱う。論文は二つの手法を提示する。第一の developing persona は、固定 persona と異なり、進行に応じて異なる goal へ移れる。第二の Alternative Path Finder (APF) は、過去に試した path を記録し、agent の最終 goal は維持したまま reward structure を調整して、未探索の別経路を生成させる。GVG-AI と VizDoom を環境に、PPO agent を用いて比較し、developing persona が異なるプレイヤー行動についてより多くの insight を与えること、APF が従来の RL agent では得にくい alternative trajectory を作れることを報告している。収集時点では arXiv 要旨を確認した。

## why_relevant_to_games

自動 playtest を「一つの正解 route の再生」から、習熟段階と未踏経路を分けて観測する仕組みへ広げる際の参照になる。特に route / bad-policy bot の coverage 設計に接続し得る。
