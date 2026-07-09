---
title: "Neural Procedural Memory: Empowering LLM Agents with Implicit Activation Steering"
url: "https://arxiv.org/abs/2606.29824"
collected_at: "2026-07-09T11:44:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, procedural-memory, harness, game-ai, automated-playtesting]
---

## raw_excerpt
arXiv:2606.29824。論文は、LLM が静的な問題解決では強くても、継続的に環境と相互作用する agent になると persistent procedural memory が不足する、という問題設定を置く。既存手法は RAG で明示的な自然言語ガイドラインを context に入れることが多いが、symbolic instruction だけでは text-action disconnect が起き、実行に必要な内部表現が十分に活性化されない場合がある、としている。

提案は Neural Procedural Memory (NPM)。過去の contrastive experiences から procedural skills を抽出し、activation space の steering vectors として表す training-free framework である。明示的な手順文を増やすのではなく、task-relevant neural mechanisms を直接活性化して実行を導く。4 種の agent benchmark では明示的な textual instruction baseline と同程度に機能し、implicit steering と explicit workflows を組み合わせると補完的に robustness が上がる、と記録されている。representational analysis では steering vector が一貫した task logic を符号化し、activation space 内で構造を作るという観察もある。

## why_relevant_to_games
ゲーム用 bot や headless playtester の失敗を、手順文追加だけで直せない時の候補。過去プレイログから「避ける」「待つ」「資源を温存する」などの procedural skill をどう持たせるかを考える材料になりそう。
