---
title: "How Oxobox Games built a data-driven board to power Sente’s six-player strategy"
url: "https://unity.com/blog/data-driven-board-six-player-strategy-sente"
collected_at: "2026-08-25T19:20:04+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, strategy, simultaneous-turns, data-driven, tooling, level-design]
---

## raw_excerpt

著作権に配慮し、記事本文の長文引用ではなく一次資料の要点を忠実に抜粋要約する。『Sente』は、最大6人が hex board 上で energy network を作り、laser で相手の core を狙う strategy game。逐次手番では人数増加に伴って待ち時間が長くなったため、各 player が timer 内に行動を選び、全員分を同時解決する方式へ作り直した。同時解決では、確実に見えた射線へ相手が同時に shield を置くなど、相互予測が発生する。board は表示 scene から分離した単一の logical model として保持され、editor tool、実行時 randomization、出荷 template の全てを同じ data が駆動する。size 4〜10 の盤面や、毎秒複数回の形状変更も scene object を直接操作せず扱える。非 programmer の puzzle designer は Unity を導入せず、spreadsheet 上で盤面を作って encoded string を渡し、開発側がそのまま import する。campaign は Unity Timeline の custom track で dialogue、camera、board state の変化を束ね、signal / marker で勝利後の進行や失敗時の retry 分岐を制御する。記事は、同一 data model を gameplay、authoring、runtime transformation、将来の player-created board sharing に再利用する制作事例として説明している。

短い原文メモ: “Every board is stored as a logical model, separate from what you actually see.”

## why_relevant_to_games

多人数 strategy の待ち時間を同時解決へ変える設計と、論理 state を描画・editor から分離して非 programmer の content 制作まで通す方法が、board / puzzle prototype の実装と反復設計に直接使える。
