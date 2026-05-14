---
title: "TextQuests: How Good are LLMs at Text-Based Video Games?"
url: https://arxiv.org/abs/2507.23701
collected_at: 2026-05-15T01:18:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, text-adventure, agent-evaluation, long-context, benchmark]
---

## raw_excerpt
原文の短い核: "complex, interactive environments" / "exploratory environments" / "text-based adventure games"。

raw/web_research と検索結果の抄録要旨では、この研究は AI agent の実用的な能力を見るには、構造化タスクだけではなく、探索的で自律性が必要なゲーム環境が重要だとする。TextQuests は Infocom 系の interactive fiction をもとにしたベンチマークで、長く増え続ける文脈、状態把握、試行錯誤、目標推定、失敗からの回復を評価対象にする。単に正しいコマンドを当てるだけでなく、ゲーム内の観察履歴を保持し、次に何を試すべきかを選び続ける能力を測る点が中心。

## why_relevant_to_games
テキストログだけでプレイ可能な headless ゲーム評価の参照になる。LLM プレイヤーが「読めているのに進めない」失敗を、文脈保持・探索・目標推定に分解する材料として使える。
