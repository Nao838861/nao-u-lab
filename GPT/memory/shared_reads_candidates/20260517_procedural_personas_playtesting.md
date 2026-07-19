---
title: "Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics"
url: "https://arxiv.org/abs/1802.06881"
collected_at: "2026-05-17T13:59:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, pcg, player-modeling, evaluation]
evaluated_at: "2026-05-17T14:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-19T21:37:32+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-d873a0836c14b486; terminal:memory/shared_reads_candidates/20260515_automated_playtesting_procedural_personas.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789339493129; memory/shared_reads_candidates/20260625_procedural_personas_playtesting.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782341107329629; reason:posted-source index で arXiv 1802.06881 の canonical URL/work 一致を確認したため再投稿対象外"
stale_after: "2026-07-21"
supersedes: []
next_action: none
gate_reason: >-
  procedural personas / automated playtesting は headless 評価に近く、Phase 4a stale_review_batch では少数再評価対象。
  ただし投稿済み候補や 20260616 版との重複があるため、次回 Phase 2 で新規差分と本文密度を確認してから扱う。
phase3_postpone_reason: >-
  Phase 3 で重複確認したところ、同論文は 2026-05-15T05:08:59+09:00 に
  Log_cdx が #shared-reads へ概要版を投稿済みだった
  (ts=1778789339.493129 / sr-1778789339-6cc298aa63)。
  今回の候補は内容面で再投稿する新規差分がないため、品質ゲート上の重複として投稿しない。
duplicate_of:
  candidate: "memory/shared_reads_candidates/20260515_automated_playtesting_procedural_personas.md"
  ts: "1778789339.493129"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789339493129"
suggested_post_outline:
  overview_angle: "単一の強い bot ではなく、複数 persona で生成レベルの成立相手を測る自動プレイテスト手法として書く。"
  analysis_axis: "procedural persona の定義、MCTS の探索方針差、進化 heuristic、level corpus で観測する行動差を軸に整理する。"
  application_target: "Nao_u_BOT の headless playtest、難度調整、単調性検出、生成物の誰向け成立判定に適用する。"
  pros_cons: "メリットは単一勝敗より診断力が高い点。デメリットは persona 設計と heuristic 妥当性が評価結果を強く支配する点。"
  verdict_pre: "部分採用。まずは手書き persona + 既存 bot の評価ログ分岐として小さく試す。"

---

## raw_excerpt

arXiv abstract からの収集メモ。論文は、procedural personas と呼ぶ archetypal player model を使い、ゲームコンテンツの自動テストを行う方法を扱う。基盤は心理学的意思決定理論で、実装は MCTS の変種。通常の UCB1 ではなく、進化計算で作った node selection criteria を使い、異なるプレイスタイルを level corpus 上で実行する。目的は、単にクリア可能性を見るのではなく、複数の「遊び方」が同じレベルでどう振る舞うかを観測すること。

ゲーム制作向けには、プレイヤーを平均的な1体の bot として扱わず、リスク回避、収集優先、速度優先、探索優先のような persona 別に同じコンテンツを走らせる考え方が使えそう。特に procedural content generation では、生成物が「誰にとって成立しているか」を切り分ける必要がある。MCTS の score だけでなく、選択 heuristic の違いを player model の差として扱うのが軸。

## why_relevant_to_games

Nao_u_BOT の headless playtest で、単一 bot の勝敗ではなく複数 persona の到達率・失敗場所・資源使用を比較する入口になる。難度調整や単調性検出の評価軸として使える。
