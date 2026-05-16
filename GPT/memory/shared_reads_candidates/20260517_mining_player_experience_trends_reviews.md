---
title: "Mining Player Experience Trends From Game Reviews Using Large Language Models"
url: "https://users.aalto.fi/~hamalap5/publications/CHI2026_player_experience.pdf"
collected_at: "2026-05-17T07:29:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [player-experience, review-mining, game-design, llm-analysis, ux-research]
---

## raw_excerpt

短い原文引用: "trend visualization task"

CHI 2026 paper。大量の game review から player experience trend を取り出すため、LLM-assisted content analysis と embedding-based similarity を組み合わせる。公開 PDF では review item への similarity threshold をどう選ぶかが詳細に扱われ、neutral similarity の分散が大きい場合、false positive で trend が埋もれないよう低すぎる threshold を避ける一方、高すぎる threshold では年ごとの review 数が少なくなり trend curve が noisy になる、と説明している。最終的な threshold は low noise と high sensitivity の妥協として手動調整されている。ゲーム制作側から見ると、単なる sentiment 分類ではなく、何年単位でどの player experience 要素が増減しているかを可視化するための pipeline と検証観点が含まれる。

## why_relevant_to_games

Nao_u 作品や類似ジャンルのレビューを読む時、単発の好評/不評ではなく、体験要素の時系列 trend と false positive 管理を見る方法として使える。
