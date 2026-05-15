---
title: "Bounded Autonomy: Controlling LLM Characters in Live Multiplayer Games"
url: https://arxiv.org/abs/2604.04703
collected_at: 2026-05-16T07:35:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-npc, multiplayer, control-interface, player-steering]
source_note: "新規Web検索: arXiv page checked 2026-05-16"
---

## raw_excerpt

短い原文フレーズ: "agent-agent interaction, agent-world action execution, and player-agent steering"。

arXiv抄録メモ: この論文は、LLMキャラクターがライブマルチプレイヤーゲーム内で会話や社会的行動を担う時、ゲーム世界で実行可能で、他キャラクターとの社会的整合性を保ち、必要に応じてプレイヤーが操舵できるようにする制御問題を扱う。提案する bounded autonomy は、LLMキャラクター制御を3つのインターフェースに分ける。実装要素として、会話の連鎖が過剰に伸びないようにする probabilistic reply-chain decay、embedding による action grounding と fallback、プレイヤーが完全に上書きせず次の行動に影響を与える軽量 soft-steering 技法 whisper が挙げられている。評価はライブマルチプレイヤー社会ゲームで行われ、interaction stability、grounding quality、whisper intervention success、formative interviews を見る。

## why_relevant_to_games

LLM NPCを「自由会話」だけでなく、世界への実行、NPC同士の相互作用、プレイヤーからの軽い介入に分けて設計する候補になる。
