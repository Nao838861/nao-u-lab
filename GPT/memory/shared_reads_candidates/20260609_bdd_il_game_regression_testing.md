---
title: Enhancing Automated Video Game Regression Testing through Behavior-Driven Development and Imitation Learning
url: https://conf.researchr.org/details/icse-2026/gas-2026-papers/4/Enhancing-Automated-Video-Game-Regression-Testing-through-Behavior-Driven-Development
collected_at: 2026-06-09T23:48:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, regression-testing, bdd, imitation-learning, reinforcement-learning]
evaluated_at: 2026-06-09T23:58:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-06-09T23:58:00+09:00
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-09T23:58:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-09"
supersedes: []
gate_reason: |-
  BDD、Imitation Learning、RL fine-tuning の接続はゲーム回帰テストに使えるが、candidate 内の評価情報が「時間削減・coverage 向上・複雑な regression 検出」の要約に留まる。
  CoopEval 水準の概要を書くには、BDD シナリオから reward や exploration guide へ落とす具体手順と case study の数値・失敗例が不足している。
  Phase 3 投稿ではなく、原文または一次資料で評価詳細を補ってから再判定する。
---

## raw_excerpt
短い原文断片: "Behavior-Driven Development (BDD)" / "Imitation Learning" / "Super Mario Bros clone"。

ICSE 2026 / GAS 2026 の full paper。複雑化するゲーム環境では手動テストが追いつかないため、BDD の自然言語シナリオで期待挙動を定義し、その仕様を RL エージェントの探索ガイドに使う。さらに expert demonstration から Imitation Learning で初期行動を学ばせ、RL fine-tuning に移る構成。Godot 製 Super Mario Bros clone の case study で、テスト作成時間の削減、coverage 向上、複雑な regression 検出を示したとされる。一方で、reward function 設計と RL training の計算コストが課題として残る。

## why_relevant_to_games
現在の headless bot policy を、単なるスコア測定ではなく「期待挙動シナリオ + 熟練デモ + 探索」に分ける参考になる。特に platformer / shmup の回帰チェック設計に使えそう。
