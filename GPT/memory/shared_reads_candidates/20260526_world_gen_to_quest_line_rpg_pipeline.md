---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: "https://arxiv.org/abs/2604.25482"
collected_at: "2026-05-26T03:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, narrative-generation, llm, procedural-content-generation]
evaluated_at: "2026-05-26T03:11:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-25T03:50:41+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-0ebf6b845bdd81d0; terminal:memory/shared_reads_candidates/20260515_world_gen_quest_line_dependency_pipeline.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778833809466169; reason:4件は同一 arXiv work 2604.25482 の URL variant で、20260515 candidate に実投稿 permalink があるため重複として閉じる。"
stale_after: "2026-08-11"
supersedes: []
next_action: none
gate_reason: >-
  dependency-aware JSON pipeline という着想は有用だが、現メモだけでは既存の構造化プロンプト実践との差分が薄い。
  評価も qualitative analysis の列挙に留まり、Phase 3 で ~4000 字の残すべき概要にするには一次本文の追加確認が必要。
  RPG/ADV 制作に使える可能性はあるため、fail ではなく postpone とする。

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv metadata / abstract の要点メモとして保存する。短い原文句: "dependency-aware" / "structured JSON outputs"。

この論文は、RPG の world / NPC / player character / campaign / quest を LLM で生成する際、単発生成では coherence、controllability、structural consistency が崩れる、という問題を扱う。提案は dependency-aware な multi-stage prompt pipeline。段階は world building、NPC creation、player character creation、campaign-level quest planning、quest expansion に分けられ、各段階が前段階の structured JSON output に条件づけられる。狙いは、明示 schema と data flow で narrative drift と hallucination を抑え、相互依存する物語要素をスケールさせること。評価は複数独立 run に対する human-centered qualitative analysis で、structural completeness、internal consistency、narrative coherence、diversity、actionability などを観点にしている。高レベル campaign planning と detailed quest expansion を分けることが、global structure と local storytelling の両方に効く、という主張。

## why_relevant_to_games
RPG/ADV 生成で「世界観を作ったあと、クエストだけ別に膨らませて破綻する」問題を避けるための資料。JSON schema と段階的依存をゲーム制作の内部ツール設計に転用できる。
