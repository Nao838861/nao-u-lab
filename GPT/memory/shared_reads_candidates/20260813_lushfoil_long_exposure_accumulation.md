---
title: "Deep Dive: Lushful Photography Sim's emotive, mathematical long-exposure photography system"
url: "https://www.gamedeveloper.com/programming/deep-dive-making-lushfoil-s-long-exposure-photography-system"
collected_at: "2026-08-13T02:01:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, rendering, photography-sim, prototyping, unreal-engine]
---

## raw_excerpt

以下は開発者 Matt Newell による記事の要点を日本語で採録したメモで、逐語引用ではない。短い原文フレーズは “The approach I made to this was purely based on math.”。『Lushfoil Photography Sim』は、写真経験者が満足でき、初心者がカメラ設定を学べる DSLR simulation を目標にした。Unreal Engine には被写界深度、焦点距離、露出、noise の表現があった一方、shutter を開けた間の動きを一枚へ蓄積する長時間露光は既製機能で足りなかったため、時間中の複数 frame を順番に capture して合成する方法を試した。

最初の「30 frame を全部加算して最後に 30 で割る」案では、除算前に高輝度値が clamp され、blur は出ても露出が壊れた。次の「新しい frame を足すたび半分にする」案では後から来た画像ほど重くなり、最後の frame が目立った。採用案は、n 枚目を加えるたび累積結果を n で割る逐次平均にし、各 frame の重みを揃えるものだった。capture は性能との折り合いから毎秒 30 frame とし、shutter を開ける時間を player が変えられ、manual mode の他の camera setting と連動する操作へ統合した。結果として、単なる画面効果ではなく、動きと時間を使って意図的な一枚を作る遊びになった。

## why_relevant_to_games

現実の物理・道具をそのまま再現せず、失敗した近似と性能予算を経て player が操作できる mechanic に変える実装例。時間蓄積を使う撮影、軌跡、残像、観測系 prototype の設計時に参照できる。
