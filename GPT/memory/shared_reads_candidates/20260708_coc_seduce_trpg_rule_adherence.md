---
title: "Seduced by the Narrative: Assessing Rule Adherence in Semi-Open Textual Sandboxes"
url: "https://arxiv.org/abs/2607.02802"
collected_at: "2026-07-08T17:45:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [trpg, narrative-game, rule-adherence, llm-judge, game-master]
---

## raw_excerpt
この論文は、Tabletop Role-Playing Game のような semi-open text-based game を、LLM adjudicator の rule-alignment 評価環境として扱う。TRPG-style semi-open environments では、player は自然言語で自由に行動を宣言できる一方、AI adjudicator は underlying rule engine を厳密に守る必要がある。著者らは Dungeons & Dragons よりも曖昧で narrative-driven な Call of Cthulhu に注目し、プレイヤーの雰囲気ある記述、感情的な訴え、欺瞞的 framing が、機械的に必要な dice roll や失敗条件を AI に見逃させるかを問う。CoC-Seduce benchmark は、GPT / Claude / Gemini 系の generator が作った 5,376 samples、16 skill categories、4 world settings からなり、mandatory rule checks と tiered rhetorical attacks を組み合わせて、モデルが rhetorical quality と objective mechanical validity を切り離せるかを測る。20 frontier models の評価では、model scale や explicit reasoning が裁定 robustness を安定的に保証しないことも報告されている。

## why_relevant_to_games
LLM GM / narrative NPC / ルール裁定 UI を作る時、面白い文章に流されず「表現」と「ルール上の可否」を分ける評価素材になる。
