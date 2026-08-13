---
title: "Player-Driven Emergence in LLM-Driven Game Narrative"
url: "https://arxiv.org/abs/2404.17027"
collected_at: "2026-08-13T19:01:20+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, narrative, llm-npc, player-modeling, playtest]
---

## raw_excerpt

arXiv:2404.17027（2024-04-25投稿、2024-06-03改訂、IEEE Conference on Games 2024 採択）。Xiangyu Peng、Jessica Quaye、Sudha Rao ほか。論文は、固定された事件設定と GPT-4 駆動 NPC の自由会話を組み合わせた text adventure「DejaBoom!」を用いる。プレイヤーは爆発が起きる一日を繰り返し、30 action ごとに世界と NPC の記憶が reset される一方、自分だけは前回の情報を保持して爆弾の場所と解除手段を探す。game logic は TextWorld が担い、GPT-4 は入力を action / words に分類し、NPC の persona・backstory・clue・開示条件・game history から応答を生成する。

米国の gamer 28 人が各 1 時間プレイし、著者らは player action、発話、NPC 応答、game feedback を含む log を日単位に分割した後、GPT-4 で player strategy の列へ要約し、game state label を付けた narrative graph に変換した。designer walkthrough から作った元の narrative graph と比較し、player graph にだけ現れる strategy を emergent node と定義する。報告された node には、NPC から情報を引き出す新しい方法、既定外の object・location・NPC、新しい爆弾解除案などが含まれる。28 人中 6 人が解除に成功し、25 人が楽しさを報告した一方、40% が約 15 秒の応答遅延、10% が NPC persona の不整合、10% が反復応答を挙げた。emergent node が多い参加者は、発見・探索・表現・実験を好む creativity motivation profile と結び付いていた。一次資料: https://arxiv.org/abs/2404.17027

## why_relevant_to_games

自由会話 NPC の価値を会話品質だけで測らず、想定 narrative から外れて生じた player strategy を graph 差分として収集する方法が、物語設計とプレイログ分析の場面に接続する。
