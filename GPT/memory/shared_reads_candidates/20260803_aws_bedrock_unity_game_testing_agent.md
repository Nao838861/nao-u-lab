---
title: "Building an AI game testing agent with Amazon Bedrock"
url: "https://aws.amazon.com/blogs/gametech/building-an-ai-game-testing-agent-with-amazon-bedrock/"
collected_at: "2026-08-03T18:32:08.9461602+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, game-ai, unity, llm-agent, qa-automation]
---

## raw_excerpt

AWS for Games Blog が、Unity で作られた turn-based mobile strategy game の実機 build に接続し、自然言語の test case を人手なしで実行する autonomous QA agent の構成を紹介している。従来の replay script は UI や mechanic の変更で壊れやすく、reinforcement learning は reward 設計・訓練・再訓練を要するという問題設定で、LLM に live game state の解釈、次 action の選択、pass / fail と理由の報告を担わせる。AltTester を Unity build に組み込み、GameObject hierarchy と component / property を WebSocket 経由で取得する。各 action の前後で全 object を snapshot し、health や ability charge、valid tile の highlight などの差分を検出するため、画面画像だけでは読みにくい内部状態も観測できる。

game 固有知識は documentation と自動 discovery から作る Amazon Bedrock Knowledge Base に置き、実行 code 側は game-agnostic な 13 tools に分離する。perception では約 1400 objects を rule-based filter で約 42 meaningful objects に減らし、LLM が test case、retrieved context、state summary、過去の tool result から操作を選ぶ。reflection は直近 10 actions を Python で検査し、同一 tool call の 3 連続または no-change の 3 連続時だけ LLM に戦略変更を求め、stuck が 3 回続けば auto-fail する。11 scenarios、150 超の tool calls で全 test を完走し、意図的に入れた damage bug の検出と impossible objective の打ち切りを報告する。記事は controlled environment での結果であり、大規模 title への拡張には tool、prompt、perception strategy の追加が必要としている。

## why_relevant_to_games

playable build の内部状態、差分観測、game-agnostic tool、停止条件を組み合わせる具体例であり、ゲーム prototype の自動回帰テストや LLM playtester を設計する場面の参照になる。
