---
title: "APEX: Autonomous Policy Exploration for Self-Evolving LLM Agents"
url: "https://arxiv.org/abs/2605.21240"
collected_at: "2026-05-26T17:52:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, game-ai, exploration, memory, text-adventure, evaluation]
---

## raw_excerpt
arXiv abstract と `memory/raw/web_research/results.jsonl` からの収集要約。対象は、self-evolving LLM agent が episode 間で memory と reflection を蓄積して改善する一方、記憶が増えるほど高報酬だった既知 routine に行動が寄り、新しい方策を探しにくくなる exploration collapse。APEX は strategy map と呼ぶ明示的な strategy space を作り、milestone と prerequisite dependency edge を持つ DAG として管理する。Fork Discovery が evidence-grounded な未探索方向を追加し、Policy Selection が planning 中に exploration と exploitation のバランスを取る。評価環境には 9 つの Jericho text-adventure games と WebArena が含まれ、長期意思決定を伴う interactive environment で比較されている。ゲーム文脈では、攻略 bot や LLM playtest が同じ勝ち筋に固着する問題の外部資料として扱える。

## why_relevant_to_games
自動テスト bot や LLM player が「一度見つけた安全策」だけを繰り返す時、探索空間を明示して分岐を残す発想の候補になる。
