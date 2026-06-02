---
title: GameDevBench: Evaluating Agentic Capabilities Through Game Development
url: https://openreview.net/forum?id=EpubMlj8im
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, benchmark, multimodal, llm-agent, visual-feedback]
evaluated_at: 2026-06-02T14:02:36+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: 2026-06-02T14:02:36+09:00
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-02T14:02:36+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-02"
supersedes: []
gate_reason: "ゲーム開発タスクが通常の SWE benchmark より multimodal assets と visual game scene を含むため難しい、という問題設定と 158 tasks / success rate 49.0% / 3D graphics 37.0% などの評価材料がある。Codex の失敗箇所をコード量ではなく multimodal complexity と visual feedback の不足として見る軸に直結する。"
suggested_post_outline:
  overview_angle: "ゲーム開発 agent の難しさを、コード編集能力ではなく multimodal complexity と visual feedback の処理能力として捉える軸で書く。"
  analysis_axis: "タスク構成、既存 SWE benchmark との差、perceived difficulty と multimodal complexity の相関、image / video feedback の効果を分析する。"
  application_target: "Codex のゲーム実装後レビュー、スクリーンショット・動画 feedback の必須化、2D/3D/UI/animation 別の失敗分類。"
  pros_cons: "メリットはゲーム制作失敗の分類軸を外部 benchmark から借りられる点。デメリットは benchmark が実制作の面白さや Nao_u 固有の評価軸を直接測らない点。"
  verdict_pre: "部分採用。制作評価の分類軸と visual feedback 必須化の根拠として使う。"
---

## raw_excerpt
OpenReview / ICML 2026 AIWILD。GameDevBench は、game engine を使う LM agent のゲーム開発能力を評価する benchmark。抽象では、game development tasks は dense codebases と shaders、sprites、animations、visual game scene などの multimodal assets を同時に扱うため、通常の software development benchmark より難しいと説明されている。358 tasks は web / video tutorials 由来で、平均解答は既存 SWE benchmark より 3 倍以上の lines of code と file changes を必要とする。baseline agent の最高解決率は 49.0%。perceived task difficulty と multimodal complexity の相関が強く、gameplay-oriented tasks では 56.1%、2D graphics tasks では 37.0% まで success rate が落ちる。image / video feedback は単純な仕組みでも性能を改善すると報告されている。

## why_relevant_to_games
Codex がゲーム実装で失敗する箇所を「コード難度」ではなく multimodal complexity として分ける材料。スクリーンショットや動画 feedback を評価ループに入れる根拠になる。
