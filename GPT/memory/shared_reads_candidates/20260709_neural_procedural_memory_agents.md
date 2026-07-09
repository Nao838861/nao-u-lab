---
title: "Neural Procedural Memory: Empowering LLM Agents with Implicit Activation Steering"
url: "https://arxiv.org/abs/2606.29824"
collected_at: "2026-07-09T11:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, procedural-memory, harness, game-ai, automated-playtesting]
evaluated_at: "2026-07-09T11:46:54+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-09T11:46:54+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-09T11:46:54+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  問題設定は「明示テキスト手順だけでは継続的 agent の procedural skill が行動へ接続しない」という点で明確。
  contrastive experience から activation steering vector を抽出する中核手法、複数 benchmark と表現分析の評価、明示 workflow との併用結論まで candidate 本文から追える。
  headless playtester や game bot に、過去ログから暗黙のプレイ手順を持たせる具体的な応用先がある。
suggested_post_outline:
  overview_angle: "symbolic memory/RAG ではなく activation steering として procedural memory を持たせる agent 設計として整理する"
  analysis_axis: "text-action disconnect、contrastive experience からの vector 抽出、training-free steering、explicit workflow 併用時の robustness を分解する"
  application_target: "ゲーム用 bot と headless playtester の失敗ログから、避ける・待つ・資源温存などの暗黙手順を再利用する評価 probe"
  pros_cons: "prompt 追加より行動に近い一方、モデル内部表現依存で移植性・可観測性・安全な解除条件が課題"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2606.29824。論文は、LLM が静的な問題解決では強くても、継続的に環境と相互作用する agent になると persistent procedural memory が不足する、という問題設定を置く。既存手法は RAG で明示的な自然言語ガイドラインを context に入れることが多いが、symbolic instruction だけでは text-action disconnect が起き、実行に必要な内部表現が十分に活性化されない場合がある、としている。

提案は Neural Procedural Memory (NPM)。過去の contrastive experiences から procedural skills を抽出し、activation space の steering vectors として表す training-free framework である。明示的な手順文を増やすのではなく、task-relevant neural mechanisms を直接活性化して実行を導く。4 種の agent benchmark では明示的な textual instruction baseline と同程度に機能し、implicit steering と explicit workflows を組み合わせると補完的に robustness が上がる、と記録されている。representational analysis では steering vector が一貫した task logic を符号化し、activation space 内で構造を作るという観察もある。

## why_relevant_to_games
ゲーム用 bot や headless playtester の失敗を、手順文追加だけで直せない時の候補。過去プレイログから「避ける」「待つ」「資源を温存する」などの procedural skill をどう持たせるかを考える材料になりそう。
