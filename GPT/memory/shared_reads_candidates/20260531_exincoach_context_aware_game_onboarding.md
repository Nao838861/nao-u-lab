---
title: "ExInCOACH: Strategic exploration meets interactive tutoring for context-aware game onboarding"
url: "https://www.sciencedirect.com/science/article/pii/S1566253526000308"
collected_at: "2026-05-31T19:29:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, onboarding, tutorial, rl-llm, player-learning, cognitive-load]
---

## raw_excerpt

Information Fusion 掲載の ExInCOACH 論文。著者は Rui Hua, Zhaoyu Huang, Jinhao Lu, Yakun Li, Na Zhao。DOI は `10.1016/j.inffus.2026.104151`。記事ページの要旨では、従来のゲームチュートリアルが静的説明に寄り、ライブのゲーム状態やプレイヤー判断に接続した guidance を出しにくい問題を扱っている。

手法は、深層 RL の self-play で Q-function を作り、現在の legal action と使用条件を LLM が自然言語のルール説明・戦略助言へ変換する構成。短い原文メモ: "state-aware adaptive tutoring", "real-time contextual feedback", "RL model exploration & LLM rule interpretation"。

評価対象は Dou Di Zhu と StarCraft II。Dou Di Zhu では ExInCOACH で訓練されたプレイヤーが従来方式で学んだ相手に 14/20 勝、StarCraft II の 2v2 では VLLM 支援チームに対して 66.7% 勝率、静的 wiki 学習チームに対して 100% 勝率と説明されている。認知負荷については NASA-TLX 系の評価で mental burden / frustration の低下を報告している。

## why_relevant_to_games

チュートリアルを「最初に読む説明」ではなく、プレイヤーの現在状態と判断に応じて変わる onboarding loop として扱う候補。複雑なルールや高密度操作のプロトタイプで、説明 UI と headless / RL / scripted player の関係を考える材料になる。
