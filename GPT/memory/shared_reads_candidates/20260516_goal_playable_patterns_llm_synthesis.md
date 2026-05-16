---
title: "Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal Playable Patterns under Structural Constraints"
url: "https://arxiv.org/abs/2603.07101"
collected_at: "2026-05-16T19:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-game-generation, executable-synthesis, unity, design-patterns]
---

## raw_excerpt
短い原文メモ: "Goal Playable Concepts (GPCs)" / "automated Unity replay" / "grounding and hygiene failure modes"

この論文は、抽象的なゲームプレイ目標を実行可能な Unity 実装へ落とす問題を、単なるコード生成ではなく「ゲームデザイン知識表現に基づく制約付き実行可能合成」として扱っている。対象は goal patterns から派生する 26 個の goal pattern instantiation で、自然言語から直接 C# / Unity を生成するベースラインと、人間が書いた Unity 向け中間表現 (IR) を挟む複数パイプラインを比較している。評価は生成物が Unity の構文・アーキテクチャ要件を満たすかだけでなく、goal pattern に含まれる意味的なゲームプレイ関係を保てるかに焦点を置き、コンパイル成功を automated Unity replay で確認している。失敗分析では、構造レベルやプロジェクトレベルの grounding、不衛生なプロジェクト生成が主要なボトルネックとして扱われている。

## why_relevant_to_games
Nao_u_BOT の「LLM にゲームを作らせる」運用で、自然言語案から playable diff に落ちる途中の中間表現・自動実行検証・失敗分類を設計する参考になる。
