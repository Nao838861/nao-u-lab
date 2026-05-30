---
title: "Intentional Computational Level Design"
url: "https://arxiv.org/abs/1904.08972"
collected_at: "2026-05-31T04:44:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, level-design, mechanics, quality-diversity]
---

## raw_excerpt
arXiv:1904.08972。Ahmed Khalifa、Michael Cerny Green、Gabriella Barros、Julian Togelius。GECCO 2019。

著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。問題設定は、procedural generation が単に playable な level を作るだけでなく、特定の mechanic に出会い、使える場面を意図的に作れるか。対象は Super Mario Bros の小さな level section で、論文では scene と呼ぶ。制約付き進化アルゴリズムと quality-diversity algorithm を使い、Limited Agents、Punishing Model、Mechanics Dimensions という 3 種類の simulation approach で、狙った mechanic を使う機会を持つ scene を生成する。短い原文メモ: "not only playable", "specific mechanics", "quality-diversity algorithms"。

## why_relevant_to_games
敵配置やステージ断片を「クリア可能」だけでなく「この mechanic を使わせる場」として生成・評価する候補。STG の graze、parry、dash、reload などを狙って発生させる level probe の素材になる。
