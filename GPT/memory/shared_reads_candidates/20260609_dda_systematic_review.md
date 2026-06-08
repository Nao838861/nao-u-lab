---
title: "Solutions for Dynamic Difficulty Adjustment in digital games: A Systematic Literature Review"
url: "https://www.sciencedirect.com/science/article/pii/S1875952125001211"
collected_at: "2026-06-09T01:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, dynamic-difficulty, player-experience, adaptive-systems, survey]
evaluated_at: "2026-06-09T01:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-09T01:40:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-09T01:40:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-09"
supersedes: []
gate_reason: |
  DDA の問題設定、547 件から 34 件を選んだ SLR であること、AI / heuristic / parameter manipulation と汎用・柔軟・モジュール化の方向性は抽出できる。
  ただし候補本文に分類表、評価基準、選別後 34 件の内訳、実験・比較の中身が不足しており、CoopEval 水準の 4000 字概要をこの材料だけで書くとレビュー論文の一般論に寄りすぎる。
  ゲーム制作への適用は有望だが、Phase 3 投稿前に SLR の分類軸と具体的な実装パターンを補う必要がある。
---

## raw_excerpt
ScienceDirect preview / Entertainment Computing, Volume 55, September 2025, 101041。タイトルは "Solutions for Dynamic Difficulty Adjustment in digital games: A Systematic Literature Review"。著者は Carlos Henrique R. Souza, Daniela F. Nascimento, Luciana O. Berretta, Sergio T. Carvalho。

短い原文断片:
- "Dynamic Difficulty Adjustment (DDA) is an important aspect of game design"
- "Of the 547 studies found ... 34 were selected"
- "generalizable, flexible, and modularized approaches"

要旨メモ: DDA を、プレイヤー体験の向上、フラストレーション、離脱防止のために難易度を調整する実装課題として整理している。4 つの文献データベースから 547 件を拾い、34 件を選別。結果として、AI 技術と heuristic / parameter manipulation が主要アプローチとして出ており、今後は単発ジャンル特化ではなく、汎用化、柔軟化、モジュール化された DDA が必要だとする。導入部では、DDA の中心目標を「challenge level と player capability の均衡」と置き、flow channel 外では annoyance や engagement 低下が起きる、という問題設定を明示している。

## why_relevant_to_games
Nao_u_BOT の headless 評価で「難しすぎる/簡単すぎる」を単一スコアにせず、DDA の実装型、評価部品、調整対象パラメータに分けて候補化できる。Phase 2 では、レビュー論文として広すぎる点と、実制作へ落とす抽出軸を確認する。
