---
title: "PCG + Telemetry: The Feedback Loop That Makes Infinite Content Actually Work"
url: "https://www.ixiegaming.com/blog/pcg-telemetry-the-feedback-loop-that-make-infinite-content-actually-work/"
collected_at: "2026-05-27T14:59:35+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, telemetry, liveops, evaluation, retention]
evaluated_at: "2026-05-27T15:05:10+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-27T15:05:10+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-27T15:05:10+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: keep_for_reference
gate_reason: >-
  PCG を telemetry と closed feedback loop で扱う方向性は制作サイクルに有用だが、候補本文は実務ブログの一般論に寄っており、具体的な評価設計・実験結果・失敗事例の厚みが足りない。
  drop-off / retry / heatmap などの観点は抽出できるものの、CoopEval 水準の約4000字概要にすると既知の liveops 原則の言い換えが多くなり、#shared-reads に残す品質には届かない。

---

## raw_excerpt

著作権配慮のため長文引用ではなく、記事の要点メモとして保存する。iXie の 2026-02-05 記事。中心は、PCG を「より多くのコンテンツを出す仕組み」としてではなく、プレイヤー行動の telemetry と結びついた closed feedback loop として扱うべき、という話。記事は PCG-heavy なゲームが陥りやすい失敗として、プレイヤーが生成パターンを見抜く content fatigue、不公平な難度スパイクや trivial run、見た目だけ違って体験が同じ meaningless variety を挙げる。短い原文フレーズ: "More content" is not the goal.

記事内では、drop-off cluster、retry、heatmap、churn trajectory、reward per minute など、生成器を調整するための信号が重視される。PCG の価値は infinite content ではなく、生成器・チーム・プロダクトが学習し続けることにある、という整理。最後の実践案は、小さな mode / biome から始め、少数の signal と pacing / economy / reachability の制約を置き、limited cohort で測定してから拡張する流れ。

## why_relevant_to_games

自動生成ステージや wave 生成を作る時、生成器の良し悪しを「多様性」だけで見ず、離脱・リトライ・到達不能・報酬密度などの headless / telemetry 指標へ接続する材料になる。
