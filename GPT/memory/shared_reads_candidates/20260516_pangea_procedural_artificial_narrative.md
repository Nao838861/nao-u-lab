---
title: "PANGeA: Procedural Artificial Narrative using Generative AI for Turn-Based Video Games"
url: "https://arxiv.org/abs/2404.19721"
collected_at: "2026-05-16T15:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, narrative-design, llm, npc, memory, validation]
evaluated_at: "2026-07-25T18:50:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-25T18:50:06+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-25T18:50:06+09:00"
stale_after: "2026-08-24"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  memory、validation、REST、Unity demo の部品構成は具体的だが、候補資料には empirical study / ablation の条件・指標・結果や破綻例がない。
  現状から約4000字へ広げると一般的な LLM NPC 設計論の反復になり、validation の実効性を判定できないため fail とする。

---

## raw_excerpt

原文短抜粋: "generate narrative content for turn-based role-playing video games"

要旨メモ: PANGeA は、ゲームデザイナーの high-level criteria に従って、ターン制 RPG 向けの narrative content を LLM で生成する構造化アプローチ。単に設定・キーアイテム・NPC などのレベルデータを作るだけでなく、プレイヤーの自由入力に対して procedural narrative と整合する動的応答を返すことを狙う。NPC は Big Five Personality Model に基づく personality bias を持つ。自由入力が物語範囲を逸脱しうる問題に対して、LLM を使った validation system で入力と応答を unfolding narrative に合わせる。custom memory system と REST interface を備え、Unity demo と browser-based GPT で empirical study / ablation test を実施している。

## why_relevant_to_games

LLM NPC や会話型ゲームを作る時、自由入力を受けながら物語破綻を抑える memory / validation / engine 接続の参考になる。
