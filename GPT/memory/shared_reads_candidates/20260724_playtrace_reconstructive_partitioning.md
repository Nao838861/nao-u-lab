---
title: "Representing and Generating Levels Over Time through Playtrace Reconstructive Partitioning"
url: "https://arxiv.org/abs/2607.12097"
collected_at: "2026-07-24T17:01:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, level-design, playtrace, puzzle]
evaluated_at: "2026-07-24T17:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-24T17:08:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-24T17:08:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-23"
supersedes: []
gate_reason: |-
  level を静的配置でなく解法中の状態遷移として表す問題設定と、Sokoban で6手法に比較した評価枠は、時間的な攻略体験を生成・比較するレベル設計へ具体的に接続できる。
  ただし現 candidate では cake representation の構造、PRP の再構成・分割手順、baseline、validity と diversity の指標・数値・失敗条件が不明で、手法の中核と評価内容を約4000字で再現できない。
---

## raw_excerpt

arXiv 抄録からの要点メモ。ビデオゲームは時間の中で経験される動的な媒体だが、多くの Procedural Content Generation は level を静的な tile 配置や最終状態として表し、プレイヤーがどの順序で状態を変化させるかを抽象化している。本研究は、プレイ中の時間的な変化を暗黙に符号化する、ゲーム領域に依存しない level 表現として “cake” representation を提案する。これに合わせて、Playtrace Reconstructive Partitioning（PRP）という level generation 手法を設計している。実験領域には Sokoban を使い、6種類の state-of-the-art PCG approach と比較した。報告された結果では、PRP は valid な level を生成しつつ、solution diversity を犠牲にしなかった。研究の主眼は、盤面の静的形状だけではなく、解法に沿って起きる状態遷移を level 表現へ組み込み、その表現から domain-agnostic な生成を行うことにある。論文は11ページ・5図で、ACM Foundations of Digital Games 採択論文として公開されている。

## why_relevant_to_games

パズルや状態変化型レベルで、静的な見た目だけでなく「プレイヤーが辿る時間的な解法」を生成・比較単位にするレベル設計資料になる。
