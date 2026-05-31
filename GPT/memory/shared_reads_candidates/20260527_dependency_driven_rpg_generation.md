---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: "http://arxiv.org/abs/2604.25482v1"
collected_at: "2026-05-27T19:23:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, procedural-generation, narrative, llm]
evaluated_at: "2026-05-27T19:27:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-27T19:27:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-27T19:27:00+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  依存関係付きprompt pipelineという着想とゲーム制作への接続は明確だが、候補本文では評価の中身、比較対象、結論の強さが不足している。
  4000字概要を書くと一般論で膨らませる危険があるため、Phase 3投稿には回さず、原文またはraw詳細を補って再評価する。

---

## raw_excerpt
要旨メモ: RPG の世界設定、NPC、プレイヤーキャラクター、キャンペーン単位のクエスト計画、個別クエスト展開を一気に生成せず、依存関係を持つ段階的な prompt pipeline として扱う。複雑な RPG world generation で起きやすい coherence、controllability、structural consistency の問題に対し、中間表現を挟みながら後段生成を前段の構造に条件付ける構成。

## why_relevant_to_games
アドベンチャーや RPG の自動生成で「設定はあるがプレイ可能な導線が崩れる」問題を分解する材料。Nao_u 作品向けには、世界観より先に依存関係表を作る生成手順の候補になる。
