---
title: "Self-Evolving World Models for LLM Agent Planning"
url: "http://arxiv.org/abs/2606.30639v1"
collected_at: "2026-07-06T10:59:28.5584273+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, planning, world-model, memory, game-ai]
evaluated_at: "2026-07-06T11:03:16.7825624+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-06T11:03:16.7825624+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-06T11:03:16.7825624+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-05"
supersedes: []
gate_reason: "行動前予測を固定モデルの重み変更ではなく deployment-time context の更新で改善する、という方法の芯がはっきりしている。Episodic Memory と Semantic Memory を prediction-observation 差分でつなぐ構成は、敵 AI や headless playtest agent の失敗ログ活用に具体的に接続できる。Phase 3 で実験環境と評価指標を補えば投稿水準に届く。"
suggested_post_outline:
  overview_angle: "LLM agent の world model を、実行時ログと予測誤差から自己更新する planning 補助として読む"
  analysis_axis: "Episodic Memory の transition retrieval と Semantic Memory の heuristic 抽出が、予測の信頼性をどう上げるか"
  application_target: "敵 AI / NPC / headless playtest agent の失敗ログから、次回行動予測と評価 harness を更新する仕組み"
  pros_cons: "利点は重み更新なしで環境固有の予測を改善できる点。弱点は誤った heuristic の固定化と、予測文脈が肥大化する点。"
  verdict_pre: "採用寄りの部分採用。ゲーム AI 本体より、テスト agent と失敗ログ分析にまず使う。"
---

## raw_excerpt

arXiv / web_research から拾った要旨メモ。WorldEvolver は、長期行動する LLM agent に、行動前の結果予測として world model を持たせる研究。問題意識は、予測が不安定だと agent が無視したり誤用したりして、かえって意思決定が悪化する点にある。提案は、下流 agent と model parameters を固定したまま、deployment-time context を更新する self-evolving world model。構成は、実際の action transition を retrieval-based simulation に使う Episodic Memory、prediction と observation の差から持続的 heuristic rule を抽出する Semantic Memory、そしてそれらを使って予測文脈を改訂する仕組みとして説明されている。

## why_relevant_to_games

敵 AI、NPC、headless playtest agent が「この行動をしたら何が起きるか」を失敗ログから更新する設計候補。ゲーム内 world model と制作側の評価 harness の両方に接続できる。
