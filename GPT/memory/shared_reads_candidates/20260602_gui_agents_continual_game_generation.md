---
title: GUI Agents for Continual Game Generation
url: https://arxiv.org/abs/2605.28258
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-playtesting, llm-agent, game-generation, evaluation]
---

## raw_excerpt
arXiv 2605.28258。原文断片: "Generating a game is not the same as making one that can be played." 論文は、ゲーム生成を一回のコード生成ではなく、ブラウザで実際にプレイする GUI agent を含む継続ループとして扱う。客観評価側では PlaytestArena を導入し、8 ジャンル・200 件の browser-based game generation tasks と expected in-play behaviors の rubric を組み合わせ、GUI agent がビルドを読み込んでプレイし採点する。主観テスター側では Play2Code を提案し、game agent と GUI agent が shared memory を持って coding と playing の往復を続ける。実験では frontier models でも直接 playable games を生成するのは難しく、Play2Code は rubric pass-rate 66.8% と報告されている。GUI playtester の feedback は human report より traceable だが、人間テスターに似た idiosyncratic な揺れもあるとされる。

## why_relevant_to_games
Nao_u 環境の headless / browser playtest / subjective feedback の橋渡し材料。playable diff 後に「本当に触れるか」を GUI agent で検出する設計の候補になる。
