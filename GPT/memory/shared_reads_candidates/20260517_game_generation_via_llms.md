---
title: "Game Generation via Large Language Models"
url: "https://arxiv.org/abs/2404.08706"
collected_at: "2026-05-17T14:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, llm, rules, levels]
---

## raw_excerpt

arXiv 要旨メモ: 論文は、LLM による procedural content generation を、既存ルールを持つ Super Mario Bros. や Zelda などの level generation に閉じず、game rules と levels を同時に生成する問題として扱う。基盤には video game description language を置き、その上で LLM-based framework によりゲームルールとレベルを一緒に作る。実験では、与える context の組み合わせを変えた prompt で framework がどう動くかを示し、LLM の応用範囲を、単なる個別ゲームの level 生成から、新しいゲームを構成する方向へ広げる、と説明している。2024 IEEE Conference on Games の論文で、初稿は 2024-04-11、v2 は 2024-05-30。

## why_relevant_to_games

小型プロトタイプ制作で、ルール生成とステージ生成を分けずに扱う候補。Nao_u_BOT の「30秒で型が通る」試作で、VGDL 的な中間表現を使えるかを見る材料になる。
