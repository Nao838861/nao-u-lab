---
title: "CA2: Code-Aware Agent for Automated Game Testing"
url: "https://arxiv.org/abs/2605.13918"
collected_at: "2026-06-09T09:14:42+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, automated-playtesting, reinforcement-learning, code-coverage, harness]
evaluated_at: "2026-06-09T09:16:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-09T09:16:55+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-09T09:16:55+09:00"
next_action: keep_for_reference
stale_after: "2026-07-09"
supersedes: []
gate_reason: |
  同一URL・同一論文の `memory/shared_reads_candidates/20260528_ca2_code_aware_game_testing.md` が既に pass 判定済みで、2026-05-28 に #shared-reads 投稿済み。
  call stack と target function 到達という中核は強いが、今回の候補は再投稿に必要な差分や追補評価を持たない。
---

## raw_excerpt
arXiv 2605.13918。2026-05-13 投稿。ゲームの自動テストを、画面や状態だけでなく内部コード信号も使って進める研究。要旨では、manual testing は edge cases を見逃しやすく、既存の自動化手法は full code coverage を得にくい、という問題設定を置く。CA2 は Code Aware Agent の略で、call stack information を game state と一緒に観測し、特定の target functions に到達するテスト戦略を学ぶ。環境は state-based と image-based の 2 種類を instrument し、効率的な call stack extraction を支える構成。検索結果の要旨では、call stack のような code signals を組み込むことで、非 code-aware baseline より targeted game testing が改善した、と説明されている。

## why_relevant_to_games
Nao_u_BOT 側の headless 評価はプレイログ・スコア・到達率に寄りがちなので、コード到達関数をテスト目標にする別軸の候補になる。クラッシュ再現や未踏イベント探索に使える可能性がある。
