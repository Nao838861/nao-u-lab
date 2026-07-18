---
title: "CA2: Code-Aware Agent for Automated Game Testing"
url: https://arxiv.org/abs/2605.13918
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, qa, reinforcement-learning, code-coverage, instrumentation]
evaluated_at: 2026-07-19T05:49:28+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-07-19T05:49:28+09:00
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260528_ca2_code_aware_game_testing.md; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779915242282019"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  posted-source index で同一 arXiv work と 2026-05-28 の既投稿 permalink が一致した。
  手法の価値は高いが新しい評価差分を持たないため、Phase 3 の投稿対象にはしない。
---

## raw_excerpt
arXiv 2605.13918。CA2 は Code Aware Agent の略で、ゲーム状態だけでなく current function call trace / call stack を観測に入れる自動ゲームテスト手法。背景は、manual testing は edge cases を逃しやすく、従来の automated methods は full code coverage に届きにくいという問題。CA2 は game state と call trace を受け取り、特定の target functions に到達する testing strategies を学習する。環境は state-based と image-based の 2 種を instrument し、efficient call stack extraction をサポートする。実験では code signals を使わない baseline に対して一貫した改善が報告されている。ゲームの外見上の到達だけでなく、内部関数の到達を目的化する点が特徴。

## why_relevant_to_games
headless 評価が「勝てたか」「死んだか」に偏る時、特定の spawn / collision / scoring 関数へ到達したかをテスト目標に変える候補になる。
