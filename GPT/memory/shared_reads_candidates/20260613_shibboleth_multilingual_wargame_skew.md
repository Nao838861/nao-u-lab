---
title: "The Shibboleth Effect: Auditing the Cross-Lingual Distributional Skew of Large Language Models"
url: "https://arxiv.org/abs/2606.11082"
collected_at: "2026-06-13T23:59:29+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [multi-agent, wargame, localization, agent-evaluation, llm-agents, simulation]
evaluated_at: "2026-07-27T04:52:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-27T04:52:35+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-27T04:52:35+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  言語だけを変える統制実験、6モデル・各10ゲーム・5ラウンド、586発言、2評価軸、モデル別の方向差まで揃い、問題設定から結論まで再構成できる。
  同一シナリオを日本語／英語で反実仮想テストする NPC・交渉 agent の評価手順へ具体化でき、4000 字級の分析を支える密度がある。
suggested_post_outline:
  overview_angle: "言語を翻訳層ではなく agent 行動を変える実験変数として扱う監査設計"
  analysis_axis: "language-only の統制、発言分類、モデル間の異質性から因果主張の範囲と限界を読む"
  application_target: "ゲーム内外交・NPC会話の同一状態を日本語／英語で反復し、譲歩率と威圧表現の差を回帰テストする"
  pros_cons: "低コストな多言語行動監査へ転用できる一方、単一シナリオと自動分類器の妥当性に依存する"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv 2606.11082。Hakan Mehmetcik。論文ページの要旨では、frontier LLM を sustained adversarial conditions に置いた時の cross-lingual distributional skew、論文中の呼称では Shibboleth Effect を調べる。実験環境として Cerulean Sea Crisis という multi-agent geopolitical wargame を構築し、Eastern Mediterranean conflicts の構造を写した synthetic maritime territorial dispute として設計している。対象モデルは GPT-4o、Llama-4、Mistral-Large、Gemini-3.1-Pro、Qwen3.6-Plus、DeepSeek-R1 の 6 種。各 arm 10 games、各 game 5 rounds の between-groups experiment で、操作する変数は language of play、English と Turkish の違いだけ。586 validated statements を作り、zero-shot classifier で Concession Rate と Coercive Rhetoric の 2 軸を測る。結果はモデルごとに不均一で、Llama-4 は Turkish 条件で coercive rhetoric が増え、Gemini-3.1-Pro と DeepSeek-R1 は逆方向に大きく動き、GPT-4o は detectable effect がないとされる。結論は、cross-lingual behavioral skew が Western-origin LLMs の普遍的性質ではなく、model architecture と training regime に依存するというもの。

## why_relevant_to_games
多言語・多文化のゲーム内交渉、外交、NPC会話、陣営シミュレーションで、同じルールでも使用言語だけで agent 行動が変わる可能性を扱う材料。ローカライズ済みゲームの自動評価にも接続できる。
