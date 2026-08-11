---
title: "Adaptive level modification via player skill classification and large language models"
url: "https://www.nature.com/articles/s41598-026-63084-z"
collected_at: "2026-08-11T09:16:38+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, dynamic-difficulty, player-modeling, procedural-content-generation, llm, level-design]
---

## raw_excerpt

Scientific Reports 16, Article 23489（2026年7月28日公開）の open-access 論文。固定 difficulty や enemy health・spawn rate の数値調整ではなく、観測した player skill に応じて Super Mario Bros. の level chunk 自体を real-time に組み替える framework を示す。まず、学習時間を変えた3段階の PPO agent trajectory と、著者らによる human gameplay data を統合し、XGBoost classifier が beginner・normal・expert を分類する。予測 label ごとの短い prompt（beginner なら platform を広げ hazard を減らす、expert なら enemy や精密 jump を増やす等）を第一 LLM が構造制約付き指示へ展開し、第二 LLM が tile grid の chunk を変更する。変更後は Dijkstra 法を用いた physics-constrained verifier で通過可能性を検査し、失敗時は元 chunk を保持する。classifier accuracy は97.82%。変更後の playability は full-level 単位74.1%、isolated-chunk 単位83.5%で、original level は80.0%。playable な71 chunk について leniency・action density・topographical roughness も測定した。data と pipeline code は Zenodo で公開されている。

## why_relevant_to_games

player trace から難度を推定し、数値ではなく level geometry を変更し、最後に決定的 verifier で破綻を止める三段構成は、adaptive level と自動 playtest を同じ loop に接続する実装例になる。
