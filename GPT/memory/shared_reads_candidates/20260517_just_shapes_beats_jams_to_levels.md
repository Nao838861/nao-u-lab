---
title: "How jams become levels in the co-op bullet hell musical Just Shapes & Beats"
url: https://www.gamedeveloper.com/design/how-jams-become-levels-in-the-co-op-bullet-hell-musical-i-just-shapes-beats-i-
collected_at: 2026-05-17T16:59:44+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [bullet-hell, rhythm-game, level-design, pattern-design, postmortem]
---

## raw_excerpt

Game Developer の 2018-07-19 記事。Berzerk Studio の Simon Lachance が、Just Shapes & Beats の music-dodging bullet hell levels をどう作ったかを語る開発記事。記事では、ステージ作りの出発点が音楽への愛着でありつつ、単なる感覚ではなく、視覚的に美しいこと、音楽に沿うこと、プレイヤーに fair challenge を与えることを重ねるルールがあった、と説明されている。形状パターンの着想は日常の壁、床、広告、家具などから集め、フォルダに保存した pattern idea を level に取り込む。

制作手順としては、procedural approach ではなく手作業の level editor を使い、特定の enemy を keyboard に割り当てて beat に合わせて叩く形で配置した、と述べられている。fairness の説明では、危険な square pattern を最初は画面中央に置き、プレイヤー初期位置から避けやすい方向へ撃たせ、safe environment で hazard の性質を教えてから、方向や数を増やして難しくする流れが紹介されている。

短い原文メモ: "place the enemy on beat" / "safe environment" / "fair, challenge"。

## why_relevant_to_games

bullet hell / rhythm hybrid の候補を作る時に、弾幕を「量」ではなく、音楽同期、日常パターン由来の形、初回安全提示から段階的に危険化する導入として分解する材料になる。
