---
title: "How contextualized generative AI shapes player experience in games"
url: "https://doi.org/10.1016/j.entcom.2026.101194"
collected_at: "2026-08-21T18:03:24+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, player-experience, generative-ai, npc, mechanics, user-study]
---

## raw_excerpt

論文は、runtime の生成AI出力がゲームの規則や状態変化に結び付かないと、生成内容が豊かでも期待との不一致や体験の断絶が起こるという問題を扱う。著者らは contextualization を二層に分けた。item-layer では生成された item に動的な status を与え、core gameplay loop の中で実行・操作できる状態にする。dialogue-layer では NPC が player input と生成結果を参照し、現在の状況に即した説明を返す。検証には Godot 製の pixel-art farming simulation「GenFlora」を用い、item status が dynamic / static、NPC dialogue が adaptive / preset の 2×2 被験者内条件を72人が体験した。両 contextualization は presence、autonomy、enjoyment をそれぞれ有意に高め、相互作用は有意でなかったため、機械的接続と物語的説明は並列・加算的な経路として報告される。さらに AI knowledge / understanding は肯定的体験の改善と一貫して関連した一方、game内でAI利用に気付く awareness の寄与は弱かった。研究の射程は単一の短時間2D prototype に限られ、3D・VR・長期playや他genreへの一般化は今後の課題とされる。

## why_relevant_to_games

生成内容をassetとして表示するだけでなく、規則上の結果とNPCの説明へ接続する二つの実装軸を、独立した実験条件としてgame prototypeで比較している。生成AIをcore loopへ組み込む設計とplaytest指標を考える場面で参照できる。
