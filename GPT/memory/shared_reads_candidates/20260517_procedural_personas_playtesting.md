---
title: "Automated Playtesting with Procedural Personas through MCTS with Evolved Heuristics"
url: "https://arxiv.org/abs/1802.06881"
collected_at: "2026-05-17T13:59:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, pcg, player-modeling, evaluation]
evaluated_at: "2026-05-17T14:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-16"
supersedes: []
gate_reason: >-
  問題設定、procedural personas の着想、MCTS + evolved heuristics という中核、
  level corpus 上で複数プレイスタイルを比較する評価、PCG/playtest への結論が分離している。
  Nao_u_BOT の headless playtest に直接落とせるため、Phase 3 の CoopEval 水準概要にできる。
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
