---
title: "From LLM-Driven Trading Card Generation to Procedural Relatedness: A Pokemon Case Study"
url: "https://arxiv.org/abs/2604.27972"
collected_at: "2026-05-26T03:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, tcg, procedural-content-generation, llm, diffusion, personalization]
evaluated_at: "2026-05-26T03:11:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-28T03:20:21+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-8149cb865350b946; terminal:memory/shared_reads_candidates/20260516_llm_tcg_procedural_relatedness.md: status:posted; permalink:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778870429034319; memory/shared_reads_candidates/20260527_llm_tcg_procedural_relatedness.md: status:failed; same arXiv work; reason:既投稿 candidate と同じ arXiv:2604.27972 で題材・資料・work identity の差がない"
stale_after: "2026-08-11"
supersedes: []
next_action: none
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
