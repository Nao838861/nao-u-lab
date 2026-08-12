---
title: "Playtesting: What is Beyond Personas"
url: "https://arxiv.org/abs/2107.11965"
collected_at: "2026-07-16T07:10:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, procedural-personas, reinforcement-learning, path-coverage]
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
  canonicalized URL が既投稿 candidate と一致し、同一論文の再収集である。
  既投稿後の新規分析差分もないため duplicate sibling として fail に閉じ、Phase 3 投稿を省略する。
---

## raw_excerpt

本論文は、自動プレイテストで固定された単一目標を追う procedural persona を拡張する二つの方法を扱う。第一は、プレイ中に異なる目標へ進行できる developing persona。第二は、過去に通った経路を学習データとして利用し、エージェントの最終目標を保ったまま報酬構造を調整して別経路を探索させる Alternative Path Finder（APF）である。通常の強化学習エージェントが以前のテスト経路を考慮せず同じ軌跡へ寄りやすい点を問題にし、GVG-AI と VizDoom、PPO エージェントを用いて比較している。著者らは、developing persona が異なるプレイヤー行動についてより多くの洞察を与え、APF が同じ目標へ到達する別軌跡を生成したと報告する。原文の中核表現は “APF modulates the reward structure of the environment while preserving the agent's goal.”

## why_relevant_to_games

headless テストで単一の成功ルートだけを反復する偏りを避け、同じクリア条件を保ったまま未探索経路・異なるプレイ方針の被覆を増やす設計に利用できる。
