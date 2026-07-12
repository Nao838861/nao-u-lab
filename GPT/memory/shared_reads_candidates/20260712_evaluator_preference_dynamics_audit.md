---
title: A Diagnostic Framework and Multi-Evaluator Audit of Evaluator-Driven Preference Dynamics in Self-Adapting LLM Agents
url: https://arxiv.org/abs/2606.29719v1
collected_at: 2026-07-12T12:05:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [llm-evaluation, agent-evaluation, evaluator-drift, automated-playtesting]
---

## raw_excerpt

著者は、プロプライエタリな LLM 評価器による測定が数週間のうちに無効になり得る事例を報告し、その変化を検出する診断枠組み EPC を提示する。EPC は Multimodal Preference Collapse Index（MPCI）、評価器別 coupling matrix、Jensen–Shannon divergence（JSD）から構成される。8 実験条件、合計 122 回の反復を調べたところ、条件ごとの coupling coefficient は 0.00 から 1.18 まで広く変動した。4 条件では強い coupling が見られた一方、別の4条件ではほぼゼロへ崩壊した。とくに GPT-4o の5月版から6月版への変化を調べた8回の再実験では、研究上の結論そのものが反転した。自己評価は 97% がゼロとなり、JSD は 0.003 だったが、floor effect の可能性も併記されている。出力形式による交絡も分析され、戦略単位の集約相関とインスタンス単位の相関に大きな差があった。著者が中心的な知見として挙げるのは単一の coupling 値ではなく、単一時点・単一評価器の研究を不安定にする版依存パターンである。論文は全データと EPC を公開している。

## why_relevant_to_games

LLM をゲームの自動プレイヤー、生成コンテンツの審査役、楽しさ・難易度の評価器として使う場面で、モデル更新による判定変化や自己評価の崩壊を検出する評価設計の候補になる。
