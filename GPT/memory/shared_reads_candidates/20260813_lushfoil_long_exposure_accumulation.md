---
title: "Deep Dive: Lushful Photography Sim's emotive, mathematical long-exposure photography system"
url: "https://www.gamedeveloper.com/programming/deep-dive-making-lushfoil-s-long-exposure-photography-system"
collected_at: "2026-08-13T02:01:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, rendering, photography-sim, prototyping, unreal-engine]
evaluated_at: "2026-08-13T02:08:04+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-13T02:08:04+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-13T02:08:04+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  開発者本人の一次資料であり、問題設定、二つの失敗案、逐次平均による解決、30 captures/s の性能判断、manual mode への統合、視覚結果まで一続きで抽出できる。
  定量ベンチマークや数式の厳密な記述は不足するが、その限界を明示した上で、時間蓄積を画面効果から player-controlled mechanic へ変える具体例として約4000字の固有分析を構成できる。
suggested_post_outline:
  overview_angle: "実カメラの連続露光を frame 列の等重み逐次平均へ置換し、失敗した合成法との比較から playable な撮影機構へ到達した過程"
  analysis_axis: "輝度 clamp と時間方向の重み偏りをどう診断し、性能予算と写真としての不完全さを含めて設計判断へ変えたか"
  application_target: "Log_cdx の観測・軌跡・残像系 prototype で、時間窓、sample rate、蓄積則を player の意図と学習に接続する設計と検証"
  pros_cons: "小さな数理モデルと失敗比較で実装判断を追える一方、GPU cost、HDR pipeline、motion sampling、実機写真との定量比較は示されない"
  verdict_pre: "部分採用。逐次平均と操作統合の設計過程は採用し、30 captures/s や画質評価は作品ごとに再検証する"
---

## raw_excerpt

以下は開発者 Matt Newell による記事の要点を日本語で採録したメモで、逐語引用ではない。短い原文フレーズは “The approach I made to this was purely based on math.”。『Lushfoil Photography Sim』は、写真経験者が満足でき、初心者がカメラ設定を学べる DSLR simulation を目標にした。Unreal Engine には被写界深度、焦点距離、露出、noise の表現があった一方、shutter を開けた間の動きを一枚へ蓄積する長時間露光は既製機能で足りなかったため、時間中の複数 frame を順番に capture して合成する方法を試した。

最初の「30 frame を全部加算して最後に 30 で割る」案では、除算前に高輝度値が clamp され、blur は出ても露出が壊れた。次の「新しい frame を足すたび半分にする」案では後から来た画像ほど重くなり、最後の frame が目立った。採用案は、n 枚目を加えるたび累積結果を n で割る逐次平均にし、各 frame の重みを揃えるものだった。capture は性能との折り合いから毎秒 30 frame とし、shutter を開ける時間を player が変えられ、manual mode の他の camera setting と連動する操作へ統合した。結果として、単なる画面効果ではなく、動きと時間を使って意図的な一枚を作る遊びになった。

## why_relevant_to_games

現実の物理・道具をそのまま再現せず、失敗した近似と性能予算を経て player が操作できる mechanic に変える実装例。時間蓄積を使う撮影、軌跡、残像、観測系 prototype の設計時に参照できる。
