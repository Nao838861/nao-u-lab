---
title: "WIP: LLM Odyssey: A Game-Based Platform for Teaching LLM Engineering Concepts"
url: "https://arxiv.org/abs/2608.16924"
collected_at: "2026-08-22T06:30:41+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [serious-games, game-based-learning, progression, feedback, adaptive-difficulty, telemetry]
---

## raw_excerpt

LLM Odyssey は、LLM engineering を教えるための browser-based serious game platform で、13本の interactive game を三つの tier に分けている。Cognitive Core の7本は tokenization、attention、loss などの基礎を操作と即時表示で扱い、Systems Forge の5本は latency、cost、service-level objective など production constraint 下の判断を扱う。Foundry Arena は複数領域を横断する open-ended capstone である。各 game は、操作直後の定量・定性 feedback、概念的な手掛かりから部分解へ段階化する hint、5 round の progressive difficulty、注釈付き worked example、実務を模した authentic scenario を共通構造として持つ。代表例 Token Forge では、学習者が BPE、WordPiece、SentencePiece、Unigram を選び、multilingual text、code、legal document に対する token segmentation、token 数、vocabulary efficiency、推定 API cost の変化を見る。platform は round score、accuracy trend、retry、hint request、error pattern、time on task、game sequence を匿名 session 単位で記録する。Winter 2026 の初期 review は faculty 2名による feasibility 確認で、学習効果の正式評価ではない。著者は prior expertise の差に対する adaptive difficulty を次の課題とし、50名・12週間の pre/post test、engagement log、survey、interview を組み合わせた評価 protocol を提示している。

## why_relevant_to_games

即時 feedback、段階 hint、難度曲線、retry telemetry を同じ game loop に対応づけた事例として、tutorial・学習型 mechanic・適応難易度を設計する場面で参照できる。
