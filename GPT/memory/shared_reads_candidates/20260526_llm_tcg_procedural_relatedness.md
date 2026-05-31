---
title: "From LLM-Driven Trading Card Generation to Procedural Relatedness: A Pokemon Case Study"
url: "https://arxiv.org/abs/2604.27972"
collected_at: "2026-05-26T03:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, tcg, procedural-content-generation, llm, diffusion, personalization]
evaluated_at: "2026-05-26T03:11:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-26T03:11:06+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-26T03:11:06+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  procedural relatedness という概念は面白いが、現メモでは Pokemon card case study の具体的な生成条件と評価結果がまだ薄い。
  ゲーム制作への適用も「個別化された武器・仲間・スキル」へ広げるには追加読解が必要で、現状のまま投稿すると一般論になりやすい。
  user study の中身を確認できれば再評価対象になるため postpone とする。

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv metadata / abstract の要点メモとして保存する。短い原文句: "procedural relatedness" / "player-centric co-creation"。

この論文は、Trading Card Game でメタゲームが固定化し、戦略やカード選択が単調になる問題に対し、LLM と画像 diffusion model による personalized card generation を検討する。単に大量のカードを生成するだけでなく、プレイヤー自身のアイデアや調整を通じてカードとの結びつきを作る "procedural relatedness" を主張する。pipeline は player-centric co-creation、fine-tuned embeddings、local LLMs、diffusion models を組み合わせ、Pokemon card をケーススタディとして動的・個別化されたカードを生成する。評価は 49 participants が 196 card samples を生成する user study。参加者は visual aesthetics、mechanics の representativeness、prompt adjustment による自己アイデア実現などを評価し、結果は満足度と自己アイデア実現の可能性を示す方向。

## why_relevant_to_games
生成AIを「コンテンツ量産」ではなく、プレイヤーが自分のカードに関係性を持つ仕組みとして扱う候補。カードゲーム以外でも、武器・仲間・スキルの個別化設計に転用できる。
