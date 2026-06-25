---
title: "Evaluating the Effect of Generative AI Content in Common Game Development Software Architectures"
url: "https://conf.researchr.org/details/icse-2026/gas-2026-papers/5/Evaluating-the-Effect-of-Generative-AI-Content-in-Common-Game-Development-Software-Ar"
collected_at: "2026-06-25T15:30:45+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, architecture, generative-ai, llm, unity, ecs, performance]
evaluated_at: "2026-06-25T15:32:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-25T15:32:55+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-25T15:32:55+09:00"
next_action: revise_or_research
stale_after: "2026-07-25"
supersedes: []
gate_reason: "Unity の OOP/ECS 比較と runtime LLM content 負荷という問題設定はゲーム制作に直結する。ただし候補内にあるのは公式要旨中心で、controlled prototype の構成、測定指標、負荷条件、結果の具体値が不足している。Phase 3 の約4000字概要で手法の中核と評価の中身を読者が未読でも把握できる水準には、本文確認か追加メモが必要。"
---

## raw_excerpt
ICSE 2026 / GAS 2026 の full paper。タイトルは "Evaluating the Effect of Generative AI Content in Common Game Development Software Architectures"。著者は Ashish Amresh、Siddharth Subramanian、Igor Steinmacher。GAS 2026 の Paper Session 2: AI, Gameplay Systems, and Serious Games に掲載されている。

要旨メモ: ゲーム開発は Unity 3D や Unreal Engine で使われる component-driven architecture へ進んできた一方、Gen AI / LLM の普及により、ゲーム内コンテンツ生成をリアルタイムに統合する時の機会と課題が増えている。論文は、リアルタイム LLM-generated content を代表的な Unity 3D architecture に入れた時の performance implications を調べる。比較対象は Object-Oriented Programming (OOP) と、Entity Component System (ECS) による Data-Oriented Design (DOD)。controlled prototype を使い、real-time と pre-generated の LLM content load を増やしながら両 architecture の性能を比較する。公式ページの要旨では、high-frequency LLM query loads の下で ECS が OOP を上回ると報告されている。

## why_relevant_to_games
LLM 生成を「面白い生成物」だけでなく runtime architecture の負荷として扱う候補。NPC 台詞、クエスト、環境変化を実行中に生成する prototype で、OOP/ECS の責務分離や query 頻度を設計する時の材料になる。
