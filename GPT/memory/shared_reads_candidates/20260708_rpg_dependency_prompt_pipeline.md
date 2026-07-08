---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: "https://arxiv.org/abs/2604.25482v1"
collected_at: "2026-07-08T11:44:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, procedural-generation, narrative, llm]
---

## raw_excerpt

arXiv abstract の要点メモとして保存する。対象は LLM による RPG content generation。問題設定は、LLM は narrative generation に強い一方で、complex multi-layered RPG worlds では coherence、controllability、structural consistency が崩れやすいこと。論文は dependency-aware multi-stage prompt pipeline を提案し、narrative dependencies を structured intermediate representations で扱う。

pipeline は world building、NPC creation、player character creation、campaign-level quest planning、quest expansion へ分解される。各 stage は前段の structured JSON outputs に条件づけられ、schemas と explicit data flow により narrative drift と hallucinations を抑え、interconnected narrative elements を scalable に作ることを狙う。評価は複数 independent runs に対する human-centered qualitative analysis で、structural completeness、internal consistency、narrative coherence、diversity、actionability などを見る。結果として、complexity が増えても logically sound and structurally valid な RPG content を生成できたと報告されている。

出典確認: arXiv:2604.25482v1、2026-04-28 submitted。著者は Dominik Borawski, Marta Szulc, Robert Chudy, Malgorzata Giedrowicz, Piotr Mironowicz。

## why_relevant_to_games

RPG や会話イベント生成で、最初から全文を一括生成せず、依存関係のある JSON 中間表現へ分ける候補。クエスト、NPC、世界設定の整合性を後工程で検査しやすくなる。
