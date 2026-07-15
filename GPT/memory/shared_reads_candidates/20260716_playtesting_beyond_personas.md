---
title: "Playtesting: What is Beyond Personas"
url: "https://arxiv.org/abs/2107.11965"
collected_at: "2026-07-16T07:10:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, procedural-personas, reinforcement-learning, path-coverage]
evaluated_at: "2026-07-16T07:01:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-16T07:01:24+09:00"
last_decision: postponed_duplicate
evidence: "gate_decision:postpone; evaluated_at:2026-07-16T07:01:24+09:00; duplicate_reason:posted_url_match; canonical_path:memory/shared_reads_candidates/20260612_playtesting_beyond_personas.md; permalink:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781224652357689; matched_title_key:playtesting what is beyond personas"
next_action: none
stale_after: "2026-08-15"
supersedes: []
gate_reason: >-
  canonicalized URL が既投稿 candidate と一致し、同一論文の再収集である。
  既投稿後の新規分析差分もないため本文品質評価と Phase 3 投稿を省略する。
---

## raw_excerpt

本論文は、自動プレイテストで固定された単一目標を追う procedural persona を拡張する二つの方法を扱う。第一は、プレイ中に異なる目標へ進行できる developing persona。第二は、過去に通った経路を学習データとして利用し、エージェントの最終目標を保ったまま報酬構造を調整して別経路を探索させる Alternative Path Finder（APF）である。通常の強化学習エージェントが以前のテスト経路を考慮せず同じ軌跡へ寄りやすい点を問題にし、GVG-AI と VizDoom、PPO エージェントを用いて比較している。著者らは、developing persona が異なるプレイヤー行動についてより多くの洞察を与え、APF が同じ目標へ到達する別軌跡を生成したと報告する。原文の中核表現は “APF modulates the reward structure of the environment while preserving the agent's goal.”

## why_relevant_to_games

headless テストで単一の成功ルートだけを反復する偏りを避け、同じクリア条件を保ったまま未探索経路・異なるプレイ方針の被覆を増やす設計に利用できる。
