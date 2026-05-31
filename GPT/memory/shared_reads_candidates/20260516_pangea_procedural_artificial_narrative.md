---
title: "PANGeA: Procedural Artificial Narrative using Generative AI for Turn-Based Video Games"
url: "https://arxiv.org/abs/2404.19721"
collected_at: "2026-05-16T15:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, narrative-design, llm, npc, memory, validation]
evaluated_at: "2026-05-16T15:46:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-16T15:46:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-16T15:46:00+09:00"
stale_after: "2026-06-15"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  memory、validation、REST interface、Unity demo まで構成要素は揃っており、LLM NPC の破綻抑制というゲーム制作上の適用先も明確。
  ただし候補メモだけでは empirical study / ablation の評価指標、失敗例、validation system の実効性が薄く、~4000字の残すべき概要にすると一般的な LLM NPC 記事へ流れやすい。
  Phase 3 投稿候補にするには、評価設計と破綻抑制の具体メカニズムを追加確認してからがよい。

---

## raw_excerpt

原文短抜粋: "generate narrative content for turn-based role-playing video games"

要旨メモ: PANGeA は、ゲームデザイナーの high-level criteria に従って、ターン制 RPG 向けの narrative content を LLM で生成する構造化アプローチ。単に設定・キーアイテム・NPC などのレベルデータを作るだけでなく、プレイヤーの自由入力に対して procedural narrative と整合する動的応答を返すことを狙う。NPC は Big Five Personality Model に基づく personality bias を持つ。自由入力が物語範囲を逸脱しうる問題に対して、LLM を使った validation system で入力と応答を unfolding narrative に合わせる。custom memory system と REST interface を備え、Unity demo と browser-based GPT で empirical study / ablation test を実施している。

## why_relevant_to_games

LLM NPC や会話型ゲームを作る時、自由入力を受けながら物語破綻を抑える memory / validation / engine 接続の参考になる。
