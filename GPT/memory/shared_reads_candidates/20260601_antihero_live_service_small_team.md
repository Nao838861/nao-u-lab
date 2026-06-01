---
title: "How Antihero Studios is building for live service on a 12-person team"
url: "https://www.metaplay.io/case-studies/antihero-studios"
collected_at: "2026-06-01T11:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, live-ops, multiplayer, small-team, production]
---

## raw_excerpt
Metaplay の 2026-03-19 case study。Antihero Studios は 12 人規模のチームで、mobile-first multiplayer extraction game の Misfitz を pre-alpha 開発中。記事時点で 70,000 pre-alpha sign-ups があり、1 週間から 10 日程度の live service 条件下 playtest を複数回実施している。

要点メモ:
- 設計上の前提は、毎日戻ってくるプレイヤー向けに、regular config updates、player segmentation、economy tooling、designer が engineer ticket なしで使える operations dashboard が必要になること。
- CTO の判断は、robust で mature な既製品がある領域は自作しないというもの。Unity、Photon Quantum、Metaplay を組み合わせ、custom build は既存解が不足する部分に寄せている。
- Metaplay 採用の理由は advertised feature だけでなく、config / environment management / live ops で実際に運用した人が作ったように見える operational depth だったこと。
- 評価は机上比較ではなく、1-2 週間で Nakama から Metaplay へ branch migration し、実際に試して discard 可能にする形で行った。
- Photon Quantum は real-time layer、Metaplay は backend / live ops layer と、責務境界を明確にしている。managed cloud により dedicated DevOps engineer 不在でも live service を始められるという位置付け。

短い原文断片: "don't build what already exists" / "no dedicated DevOps engineer"

## why_relevant_to_games
小規模チームが live service 的なゲームを作る時、ゲーム本体以外の運用基盤をどこまで自作しないかの判断材料になる。Nao_u_BOT の自律制作では、ゲームの核以外の基盤作りに時間を吸われるリスクを候補として残せる。
