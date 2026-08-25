---
title: "How Oxobox Games built a data-driven board to power Sente’s six-player strategy"
url: "https://unity.com/blog/data-driven-board-six-player-strategy-sente"
collected_at: "2026-08-25T19:20:04+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, strategy, simultaneous-turns, data-driven, tooling, level-design]
evaluated_at: "2026-08-25T19:23:26.0652473+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787653754.197229"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787653754197229"
  char_count: 4259
  posted_at: "2026-08-25T19:29:41.4150456+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-25T19:29:41.4150456+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787653754197229"
next_action: none
stale_after: "2026-09-24"
supersedes: []
gate_reason: >-
  逐次手番から同時解決へ変えた問題設定と相互予測の効果、表示から分離した logical board、
  spreadsheet authoring、Timeline 制御まで制作工程を貫く具体例があり、形式評価ではない限界を明記しても約4000字の分析に耐える。
suggested_post_outline:
  overview_angle: "待ち時間の解消を、同時手番の駆け引きと単一 logical board model の制作基盤へ同時に接続した事例として整理する"
  analysis_axis: "同時解決が生む予測ゲームと、runtime・editor・spreadsheet・campaign 制御を同一 data model に載せる設計の相互補強"
  application_target: "Log_cdx の board / puzzle prototype で、simulation state を描画から分離し、短い反復で盤面生成・検証・非 programmer authoring を回す設計"
  pros_cons: "長所は多人数の待ち時間削減、authoring 経路の共通化、盤面変形と共有への拡張性。短所は同時衝突の解決規則、encoded string の保守性、記事に定量比較がない点"
  verdict_pre: "部分採用"
---

## raw_excerpt

著作権に配慮し、記事本文の長文引用ではなく一次資料の要点を忠実に抜粋要約する。『Sente』は、最大6人が hex board 上で energy network を作り、laser で相手の core を狙う strategy game。逐次手番では人数増加に伴って待ち時間が長くなったため、各 player が timer 内に行動を選び、全員分を同時解決する方式へ作り直した。同時解決では、確実に見えた射線へ相手が同時に shield を置くなど、相互予測が発生する。board は表示 scene から分離した単一の logical model として保持され、editor tool、実行時 randomization、出荷 template の全てを同じ data が駆動する。size 4〜10 の盤面や、毎秒複数回の形状変更も scene object を直接操作せず扱える。非 programmer の puzzle designer は Unity を導入せず、spreadsheet 上で盤面を作って encoded string を渡し、開発側がそのまま import する。campaign は Unity Timeline の custom track で dialogue、camera、board state の変化を束ね、signal / marker で勝利後の進行や失敗時の retry 分岐を制御する。記事は、同一 data model を gameplay、authoring、runtime transformation、将来の player-created board sharing に再利用する制作事例として説明している。

短い原文メモ: “Every board is stored as a logical model, separate from what you actually see.”

## why_relevant_to_games

多人数 strategy の待ち時間を同時解決へ変える設計と、論理 state を描画・editor から分離して非 programmer の content 制作まで通す方法が、board / puzzle prototype の実装と反復設計に直接使える。
