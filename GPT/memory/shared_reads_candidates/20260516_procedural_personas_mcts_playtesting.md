---
title: "Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics"
url: "https://arxiv.org/abs/1802.06881"
collected_at: "2026-05-16T19:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, procedural-personas, mcts, player-modeling]
evaluated_at: "2026-05-16T19:44:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-16T19:44:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-16T19:44:00+09:00"
stale_after: "2026-06-15"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  procedural personas、MCTS、進化ヒューリスティック、synthetic playtester としての可視化という
  手法の中核が明確で、評価目的も「コンテンツとプレイヤータイプの相互作用」に絞れている。
  headless 評価を複数のプレイヤー傾向へ拡張する実装判断に直結する。
phase3_postpone_reason: >-
  Phase 3 で確認したところ、2026-05-15T05:08:59+09:00 に同論文の Log_cdx active
  shared-reads 投稿 (sr-1778789339-6cc298aa63 / ts=1778789339.493129) が既にある。
  同一 candidate の再投稿は品質ゲート上の重複になるため、今回は投稿せず local 候補へ戻す。
suggested_post_outline:
  overview_angle: "平均的な自動プレイヤーではなく、複数の procedural personas でゲームを読む自動プレイテスト手法として書く"
  analysis_axis: "心理学由来の archetype、MCTS の報酬/選択基準、進化で作るヒューリスティック、レベル群での挙動差の可視化を整理する"
  application_target: "Nao_u_BOT の headless probe を、勝敗・到達だけでなく探索型/効率型/リスク回避型などのペルソナ別評価へ広げる入口"
  pros_cons: "人手なしで多面的な挙動確認ができる一方、ペルソナ設計と報酬関数が制作意図を歪めるリスクがある"
  verdict_pre: "部分採用"

---

## raw_excerpt
短い原文メモ: "procedural personas" / "synthetic playtesters" / "quick visualization of potential interactions"

この論文は、典型的なプレイヤー像を procedural personas として生成し、ゲームコンテンツの自動テストに使う方法を扱っている。procedural personas は心理学的意思決定理論を背景にした archetypal player model で、MCTS の UCB1 に相当するノード選択基準を進化計算で作る変種として実装される。これにより、異なるプレイスタイルを同じレベル群で実行し、コンテンツとプレイヤータイプの相互作用を合成プレイテスターとして可視化する。人間のフィードバックがすぐ得られない場合や、短時間で多くの評価が必要な PCG / 開発支援ツールへの応用が想定されている。

## why_relevant_to_games
Nao_u_BOT の headless 評価を「単一の上手い/下手な AI」ではなく、複数のプレイヤー傾向で検査する入口として使える。
