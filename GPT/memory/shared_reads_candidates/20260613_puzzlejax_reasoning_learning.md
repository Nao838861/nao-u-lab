---
title: "PuzzleJax: a Benchmark for Reasoning and Learning"
url: "https://openreview.net/forum?id=jADagw65fi"
collected_at: "2026-06-13T17:59:33+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [puzzle, benchmark, reasoning, reinforcement-learning, llm-agent, dsl]
evaluated_at: "2026-06-13T18:02:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781341695.263239"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781341695263239"
  char_count: 3512
  posted_at: "2026-06-13T18:09:43+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-13T18:09:43+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781341695263239"
next_action: none
stale_after: "2026-07-13"
supersedes: []
gate_reason: |-
  PuzzleScript DSL、JAX dynamic compilation、GPU rollout、tree search / RL / LLM reasoning の共通評価基盤という中核が明確。
  小型 puzzle prototype を DSL と headless harness で検証する発想に直結し、4000 字概要でも問題設定から適用まで崩れにくい。
suggested_post_outline:
  overview_angle: "固定 benchmark ではなく、人間作成 PuzzleScript ゲームを JAX 上の評価可能な DSL corpus に変換する手法として書く。"
  analysis_axis: "DSL 表現、dynamic compilation、validated game corpus、GPU rollout、search / learning / LLM reasoning の比較可能性。"
  application_target: "小型 puzzle game の headless 評価、ルール DSL 化、生成候補の solvability / planning difficulty 検査。"
  pros_cons: "メリットは人間設計の mechanics 空間を大量評価に載せられること。デメリットは PuzzleScript 系に寄る表現範囲と DSL 整備コスト。"
  verdict_pre: "採用寄りの部分採用。PuzzleJAX 自体より、ゲームルールを実行可能 DSL と評価 harness にする考えを借りる。"
---

## raw_excerpt
OpenReview / NeurIPS 2025 Datasets and Benchmarks Track。PuzzleJAX は、PuzzleScript 系 DSL で表現できる puzzle game を JAX 上で GPU-accelerated に動かし、tree search、reinforcement learning、LLM reasoning を同じ土台で評価するための benchmark / engine。固定された少数の hard-coded environments ではなく、DSL で記述できる任意の game を dynamic compilation できる点が特徴とされる。

対象にしている PuzzleScript は、2013 年から professional designers と casual creators の両方に使われてきた puzzle game engine。論文は、公開されている多数の人間作成ゲームのうち数百件を PuzzleJAX 上で validate し、人間にとって直感的だが、制御、planning、high-level insight を必要とするタスク空間を扱えることを示す。

重要なのは、ゲームを単なる RL benchmark の固定セットではなく、人間が書いた DSL として扱う点。これにより、search / learning / language model の性能を、人間が設計した puzzle mechanics の広い空間で比較できる。GPU acceleration によって大量 rollout や探索を回しやすくしつつ、PuzzleScript の表現力を使って、単純な見た目でも mastery が難しい puzzle を評価対象にできる。

## why_relevant_to_games
小型 puzzle prototype の headless 評価や、DSL 化したルールを使うゲーム生成・検証に接続できる候補。Nao_u_BOT 側で「人間が作った小ゲーム集合」を評価 harness にする時の設計参考になる。
