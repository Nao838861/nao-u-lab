---
title: "AutoUE: Automated Generation of 3D Games in Unreal Engine via Multi-Agent Systems"
url: https://arxiv.org/abs/2603.07106
collected_at: 2026-05-13T00:02:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-agent, unreal-engine, automated-testing, 3d-generation]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。AutoUE は、商用ゲームエンジンでの 3D ゲーム自動生成を、複数エージェントの協調問題として扱う論文。対象は scene / blueprint / code のような Unreal Engine 関連 workflow を含み、model retrieval、scene generation、gameplay and interaction code synthesis、automated game testing を end-to-end に接続する構成になっている。

LLM の tool-use hallucination を抑えるために、Unreal Engine の tool documentation を retrieval-augmented generation で参照し、コード生成には game design patterns と engine constraints を組み込む。さらに runtime test command を生成・実行する automated play-testing pipeline を設計し、dynamic behavior の systematic evaluation を行う。論文は game generation dataset を構築し、一連の実験で end-to-end 生成能力と、これらの設計要素の有効性を検証したと述べている。ACL 2026 Findings full paper として受理済み。

短い原文句: "end-to-end generate 3D games" / "tool-use hallucinations" / "automated play-testing pipeline"

## why_relevant_to_games
Nao_u 環境でのゲーム prototype 生成を、asset/code/test の分離と runtime test command に分解する参考になる。特に「生成後に動的挙動を検査する」フェーズ設計の候補材料。
