---
title: "3DCodeBench: Benchmarking Agentic Procedural 3D Modeling Via Code"
url: "https://arxiv.org/abs/2606.01057"
collected_at: "2026-06-05T19:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, procedural-modeling, 3d-assets, benchmark, game-dev-tools]
evaluated_at: "2026-06-05T20:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780628666.886719"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780628666886719"
  char_count: 4507
  posted_at: "2026-06-05T12:04:26.886719+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-05T19:54:52+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780628666886719"
next_action: none
stale_after: "2026-07-05"
supersedes: []
gate_reason: "procedural 3D modeling を画像生成ではなく、Blender で実行・編集・検査できる code artifact として評価する問題設定が明確。API mismatch、floating/disconnected components、multi-turn refinement など失敗様式と改善手段も出ており、ゲーム制作の asset 生成レビューへ具体的に転用できる。CoopEval 水準の概要に必要な問題設定・着想・手法中核・評価・結論を本文から抽出可能。"
suggested_post_outline:
  overview_angle: "3D asset 生成を「見た目の一発生成」ではなく、実行可能な procedural code として評価する benchmark として紹介する。"
  analysis_axis: "dataset/protocol、automatic metrics と human pairwise preference、API mismatch や構造破綻、test-time scaling の効き方を分けて読む。"
  application_target: "小規模ゲーム制作で Blender / engine-ready asset を LLM に作らせる時の検査軸、coding-agent harness、multi-turn refinement loop の設計。"
  pros_cons: "メリットは editable/deterministic な asset 生成評価に寄る点。デメリットは Blender procedural API 前提で、最終的な art direction や engine import 品質は別検査が必要な点。"
  verdict_pre: "部分採用。asset 生成そのものより、生成物を code artifact として検査する評価軸を取り込む。"
---

## raw_excerpt
arXiv 2606.01057 は、VLM agent が text / image reference から Blender 5.0 向けの procedural code を書き、実行可能な 3D asset を生成できるかを測る benchmark として 3DCodeBench を提案している。対象は 12 個の先端 VLM で、評価対象は neural text-to-3D のような直接 mesh 生成ではなく、deterministic で engine-ready、かつ後工程で編集しやすい code-based procedural 3D modeling である。論文要旨では、procedural modeling は実用価値が高い一方、3D software API、parametric design、code-level geometric reasoning を要求するため難しいと位置づけられている。

評価では、text / image prompt から procedural code と 3D object triplet を作る dataset と protocol に加え、自動 metric だけでは形状の知覚品質を捉えきれないため、人間の pairwise preference に基づく 3DCodeArena も用意している。結果として、失敗は API mismatch によるものが多く、render に成功しても floating / disconnected components のような物理的・構造的な破綻が残ること、thinking budget や multi-turn refinement のような test-time scaling が性能改善に寄与することが報告されている。project page では、212 object categories、約 13K の code 付き 3D objects、52K multi-view renders、execution feedback を使う multi-turn loop や coding-agent harness 比較も示されている。

## why_relevant_to_games
ゲーム制作用の 3D asset 生成を「画像が良い」ではなく、Blender で実行でき、編集でき、構造破綻を検査できる code artifact として評価する視点が得られる。
