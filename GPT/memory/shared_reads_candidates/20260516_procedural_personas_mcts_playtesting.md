---
title: "Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics"
url: "https://arxiv.org/abs/1802.06881"
collected_at: "2026-05-16T19:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, procedural-personas, mcts, player-modeling]
evaluated_at: "2026-07-09T21:35:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-19T21:37:32+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-d873a0836c14b486; terminal:memory/shared_reads_candidates/20260515_automated_playtesting_procedural_personas.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789339493129; memory/shared_reads_candidates/20260625_procedural_personas_playtesting.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782341107329629; reason:posted-source index で arXiv 1802.06881 の canonical URL/work 一致を確認したため再投稿対象外"
stale_after: "2026-08-08"
supersedes: []
next_action: none
gate_reason: >-
  posted duplicate title sibling があるため Phase 3 投稿対象から外す。
  terminal siblings: memory/shared_reads_candidates/20260515_automated_playtesting_procedural_personas.md;
  memory/shared_reads_candidates/20260625_procedural_personas_playtesting.md。
  本文再評価は行わず、代表 candidate だけ lifecycle を postponed_duplicate として閉じる。
phase3_postpone_reason: >-
  Phase 3 で確認したところ、2026-05-15T05:08:59+09:00 に同論文の Log_cdx active
  shared-reads 投稿 (sr-1778789339-6cc298aa63 / ts=1778789339.493129) が既にある。
  同一 candidate の再投稿は品質ゲート上の重複になるため、今回は投稿せず local 候補へ戻す。
---

## raw_excerpt
短い原文メモ: "procedural personas" / "synthetic playtesters" / "quick visualization of potential interactions"

この論文は、典型的なプレイヤー像を procedural personas として生成し、ゲームコンテンツの自動テストに使う方法を扱っている。procedural personas は心理学的意思決定理論を背景にした archetypal player model で、MCTS の UCB1 に相当するノード選択基準を進化計算で作る変種として実装される。これにより、異なるプレイスタイルを同じレベル群で実行し、コンテンツとプレイヤータイプの相互作用を合成プレイテスターとして可視化する。人間のフィードバックがすぐ得られない場合や、短時間で多くの評価が必要な PCG / 開発支援ツールへの応用が想定されている。

## why_relevant_to_games
Nao_u_BOT の headless 評価を「単一の上手い/下手な AI」ではなく、複数のプレイヤー傾向で検査する入口として使える。
