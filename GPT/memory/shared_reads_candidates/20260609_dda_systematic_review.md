---
title: "Solutions for Dynamic Difficulty Adjustment in digital games: A Systematic Literature Review"
url: "https://www.sciencedirect.com/science/article/pii/S1875952125001211"
collected_at: "2026-06-09T01:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, dynamic-difficulty, player-experience, adaptive-systems, survey]
evaluated_at: "2026-07-26T21:52:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T21:52:28+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T21:52:28+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |
  547 件から 34 件を選ぶ SLR の問題設定と大分類は分かるが、選別基準、34 件の内訳、各方式の評価指標・比較結果・適用条件が候補本文にない。
  現有資料から 4000 字級へ展開すると DDA の一般論に寄り、レビュー固有の知見を再現できないため、投稿候補としては閉じ、文献探索の入口に留める。
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
