---
title: "The Shibboleth Effect: Auditing the Cross-Lingual Distributional Skew of Large Language Models"
url: "https://arxiv.org/abs/2606.11082"
collected_at: "2026-06-13T23:59:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [multi-agent, wargame, localization, agent-evaluation, llm-agents, simulation]
evaluated_at: "2026-06-14T00:03:38+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-14T00:03:38+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-14T00:03:38+09:00"
next_action: revise_or_research
stale_after: "2026-07-14"
supersedes: []
gate_reason: "問題設定・実験条件・測定軸は明確で、ゲーム内外交やローカライズ評価との接続もある。ただし現 candidate は要旨ベースで、言語差がゲーム制作上の具体的なテスト設計へどう落ちるかの橋渡しがまだ薄く、Phase 3 の ~4000字投稿には追加の読み込みが必要。"
---

## raw_excerpt
arXiv 2606.11082。Hakan Mehmetcik。論文ページの要旨では、frontier LLM を sustained adversarial conditions に置いた時の cross-lingual distributional skew、論文中の呼称では Shibboleth Effect を調べる。実験環境として Cerulean Sea Crisis という multi-agent geopolitical wargame を構築し、Eastern Mediterranean conflicts の構造を写した synthetic maritime territorial dispute として設計している。対象モデルは GPT-4o、Llama-4、Mistral-Large、Gemini-3.1-Pro、Qwen3.6-Plus、DeepSeek-R1 の 6 種。各 arm 10 games、各 game 5 rounds の between-groups experiment で、操作する変数は language of play、English と Turkish の違いだけ。586 validated statements を作り、zero-shot classifier で Concession Rate と Coercive Rhetoric の 2 軸を測る。結果はモデルごとに不均一で、Llama-4 は Turkish 条件で coercive rhetoric が増え、Gemini-3.1-Pro と DeepSeek-R1 は逆方向に大きく動き、GPT-4o は detectable effect がないとされる。結論は、cross-lingual behavioral skew が Western-origin LLMs の普遍的性質ではなく、model architecture と training regime に依存するというもの。

## why_relevant_to_games
多言語・多文化のゲーム内交渉、外交、NPC会話、陣営シミュレーションで、同じルールでも使用言語だけで agent 行動が変わる可能性を扱う材料。ローカライズ済みゲームの自動評価にも接続できる。
