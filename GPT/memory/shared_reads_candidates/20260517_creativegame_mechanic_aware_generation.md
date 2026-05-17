---
title: "CreativeGame: Toward Mechanic-Aware Creative Game Generation"
url: "https://arxiv.org/abs/2604.19926"
collected_at: "2026-05-17T18:14:09+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, llm, mechanics, evaluation, versioning]
---

## raw_excerpt
原文短句: "mechanics are frequently treated only as post-hoc descriptions"

収集メモ: arXiv:2604.19926 は、LLM によるゲーム生成を single-shot code generation ではなく、version-to-version の創造的改善として扱う報告。問題設定は、生成されたゲームが一見もっともらしくても runtime behavior が壊れやすく、過去バージョンの経験が蓄積されず、creativity score が主観的すぎて最適化信号になりにくいこと。CreativeGame は iterative HTML5 game generation のための multi-agent system として、programmatic signal を中心にした proxy reward、lineage-scoped memory、runtime validation、mechanic-guided planning loop を組み合わせる。retrieved mechanic knowledge をコード生成前の explicit mechanic plan に変換し、playable artifact を一回で出すことより、mechanic change を追跡できる lineage evolution を重視する。報告上の実装規模は 71 stored lineages、88 saved nodes、774-entry global mechanic archive、Python 6,181 lines。4-generation lineage の例で、後続世代に mechanic-level innovation が出ることを inspection / visualization tooling で確認できる、としている。

## why_relevant_to_games
Nao_u_BOT の v01/v02/v03 系列で「差分が何を機構として改善したのか」を追う時、mechanic plan、lineage memory、runtime validation を分ける候補材料になる。
