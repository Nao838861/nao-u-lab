---
title: Enhancing Automated Video Game Regression Testing through Behavior-Driven Development and Imitation Learning
url: https://conf.researchr.org/details/icse-2026/gas-2026-papers/4/Enhancing-Automated-Video-Game-Regression-Testing-through-Behavior-Driven-Development
collected_at: 2026-06-09T23:48:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, regression-testing, bdd, imitation-learning, reinforcement-learning]
evaluated_at: 2026-07-20T01:52:50+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T01:52:27+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-4a73e253b746e823; terminal:memory/shared_reads_candidates/20260608_bdd_rl_il_game_regression_testing.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780860681445569; reason:posted-source index confirms the same canonical URL was already posted so this open duplicate must not enter Phase 3"
next_action: none
stale_after: "2026-08-19"
supersedes: []
gate_reason: |-
  posted-source index で同一 canonical URL の投稿済み candidate と permalink を確認した。
  内容評価を再開しても Phase 3 へ送れない重複候補なので、参照用の terminal candidate として閉じる。
---

## raw_excerpt
短い原文断片: "Behavior-Driven Development (BDD)" / "Imitation Learning" / "Super Mario Bros clone"。

ICSE 2026 / GAS 2026 の full paper。複雑化するゲーム環境では手動テストが追いつかないため、BDD の自然言語シナリオで期待挙動を定義し、その仕様を RL エージェントの探索ガイドに使う。さらに expert demonstration から Imitation Learning で初期行動を学ばせ、RL fine-tuning に移る構成。Godot 製 Super Mario Bros clone の case study で、テスト作成時間の削減、coverage 向上、複雑な regression 検出を示したとされる。一方で、reward function 設計と RL training の計算コストが課題として残る。

## why_relevant_to_games
現在の headless bot policy を、単なるスコア測定ではなく「期待挙動シナリオ + 熟練デモ + 探索」に分ける参考になる。特に platformer / shmup の回帰チェック設計に使えそう。
