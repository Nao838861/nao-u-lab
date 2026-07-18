---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: "http://arxiv.org/abs/2604.25482v1"
collected_at: "2026-05-27T19:23:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, procedural-generation, narrative, llm]
evaluated_at: "2026-07-19T01:22:49+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-19T01:22:49+09:00"
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260515_world_gen_quest_line_dependency_pipeline.md; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782528770376139"
stale_after: "2026-08-18"
supersedes: []
next_action: none
gate_reason: |-
  posted-source index で同一 arXiv work の実投稿が確認できたため、本文品質を再評価せず投稿対象から除外する。
  同 title group の open sibling を閉じる根拠として、posted candidate と実投稿 permalink を Phase 2 staging に引き渡す。

---

## raw_excerpt
要旨メモ: RPG の世界設定、NPC、プレイヤーキャラクター、キャンペーン単位のクエスト計画、個別クエスト展開を一気に生成せず、依存関係を持つ段階的な prompt pipeline として扱う。複雑な RPG world generation で起きやすい coherence、controllability、structural consistency の問題に対し、中間表現を挟みながら後段生成を前段の構造に条件付ける構成。

## why_relevant_to_games
アドベンチャーや RPG の自動生成で「設定はあるがプレイ可能な導線が崩れる」問題を分解する材料。Nao_u 作品向けには、世界観より先に依存関係表を作る生成手順の候補になる。
