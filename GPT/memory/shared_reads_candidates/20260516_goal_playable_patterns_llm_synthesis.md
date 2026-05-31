---
title: "Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal Playable Patterns under Structural Constraints"
url: "https://arxiv.org/abs/2603.07101"
collected_at: "2026-05-16T19:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-game-generation, executable-synthesis, unity, design-patterns]
evaluated_at: "2026-05-16T19:44:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T19:36:16+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
gate_reason: >-
  Goal Playable Concepts から Unity 実装へ落とす問題設定、IR を挟む着想、
  automated Unity replay による検証、grounding/hygiene failure の分類が揃っている。
  Nao_u_BOT の「自然言語案から playable diff へ接続する」制作サイクルに直接適用できる。
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778927776158409"
next_action: none
posted:
  ts: "1778927776.158409"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778927776158409"
  char_count: 4237
  posted_at: "2026-05-16T19:36:16+09:00"
suggested_post_outline:
  overview_angle: "ゲームデザイン知識表現を経由して、LLM のコード生成を playable な Unity 実装へ接地する研究として書く"
  analysis_axis: "GPC、IR、構造制約、Unity replay、失敗分類を、単なる生成精度ではなく実行可能性と意味保持の評価軸として整理する"
  application_target: "ゲーム制作指示を goal pattern / intermediate spec / headless replay / failure taxonomy に分ける Nao_u_BOT の実装導線"
  pros_cons: "中間表現と自動リプレイは強いが、Unity 前提と pattern 化できる目標への依存がある"
  verdict_pre: "採用"

---

## raw_excerpt
短い原文メモ: "Goal Playable Concepts (GPCs)" / "automated Unity replay" / "grounding and hygiene failure modes"

この論文は、抽象的なゲームプレイ目標を実行可能な Unity 実装へ落とす問題を、単なるコード生成ではなく「ゲームデザイン知識表現に基づく制約付き実行可能合成」として扱っている。対象は goal patterns から派生する 26 個の goal pattern instantiation で、自然言語から直接 C# / Unity を生成するベースラインと、人間が書いた Unity 向け中間表現 (IR) を挟む複数パイプラインを比較している。評価は生成物が Unity の構文・アーキテクチャ要件を満たすかだけでなく、goal pattern に含まれる意味的なゲームプレイ関係を保てるかに焦点を置き、コンパイル成功を automated Unity replay で確認している。失敗分析では、構造レベルやプロジェクトレベルの grounding、不衛生なプロジェクト生成が主要なボトルネックとして扱われている。

## why_relevant_to_games
Nao_u_BOT の「LLM にゲームを作らせる」運用で、自然言語案から playable diff に落ちる途中の中間表現・自動実行検証・失敗分類を設計する参考になる。
