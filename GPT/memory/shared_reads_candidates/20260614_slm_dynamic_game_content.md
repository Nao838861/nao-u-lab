---
title: "High-quality generation of dynamic game content via small language models: A proof of concept"
url: "https://arxiv.org/html/2601.23206v2"
collected_at: "2026-06-14T19:59:28.8718985+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [narrative-ai, small-language-models, npc, dynamic-content, evaluation]
evaluated_at: "2026-06-14T20:18:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-14T20:18:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-14T20:18:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-14"
supersedes: []
gate_reason: "狭い責務の fine-tuned SLM、量子化、retry-until-success という着想はゲーム内動的テキスト生成に有用。ただし現 candidate だけでは評価の中身と一般化可能な制作判断が薄く、DefameLM という PoC から自分達の制作サイクルへ接続するには追加確認が必要。"
---

## raw_excerpt
この論文は、ゲーム内の動的コンテンツ生成に巨大な汎用 LLM をそのまま使うのではなく、狭く定義された生成タスクに強く fine-tune した small language model を使う実装寄りの代替案を扱う。背景として、複雑な世界理解や長期的な narrative cohesion は LLM にとって難しく、NPC 会話や story-driven game で naive に使うと world state や goal の一貫性が崩れやすいとする。提案は、生成責務を小さく切り、必要なら複数の constrained SLM を agentic network として組み合わせる方向にある。

proof of concept の DefameLM は、player と NPC の間の rhetorical attacks を生成する fine-tuned SLM で、intelligence item、rhetorical angle、audience-appropriate humor を制約付き format に合成する。評価では 16-bit、8-bit、4-bit の量子化で quality transfer と generation efficiency を比較し、8-bit が実用上の選択肢として示される。結論では、consumer hardware 上で retry-until-success を使い、5秒以内の生成予算に近づけられること、ただし cloud LLM-as-a-judge を置き換える local runtime quality assessment が残課題であることが述べられる。

## why_relevant_to_games
NPC台詞や短い演出文のような局所生成を、巨大LLM任せにせず、制約付き小モデルとローカル評価で扱う設計候補として使える。
