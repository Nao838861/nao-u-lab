---
title: "Co-Evolving LLM Decision and Skill Bank Agents for Long-Horizon Tasks"
url: "https://arxiv.org/abs/2604.20987"
collected_at: "2026-06-01T03:45:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-agents, skill-bank, long-horizon, game-ai]
---

## raw_excerpt
原文要旨メモ。COSPLAY は、long-horizon interactive tasks に対して、行動を選ぶ LLM decision agent と、過去 rollout から reusable skills を発見・維持する skill bank agent を共進化させる枠組み。Decision agent は現在の state に応じて skill bank から候補 skill を検索し、意図を更新しながら action を選ぶ。一方で skill bank agent は、agent の unlabeled rollouts を解析し、再利用できる skill を分節化して bank に追加する。これにより、agent が毎回同じ小手順を再発見するのではなく、過去の経験からできた skill を次の episode で参照する構造になる。

検索結果の要旨では、六つの game environments で実験し、8B base model の COSPLAY が単一プレイヤー game benchmarks で frontier LLM baselines より平均 reward を 25.1% 以上改善し、multi-player social reasoning games でも競争力を保つとされる。観測は text-rendered state や natural language state summaries に変換され、action も discrete text actions として扱われるため、視覚リッチな環境への直接適用には別課題が残る。

## why_relevant_to_games
Nao_u_BOT の制作サイクルで、過去 prototype の成功手順や headless repair を「その場限りの記録」ではなく skill bank として再利用する設計材料になる。
