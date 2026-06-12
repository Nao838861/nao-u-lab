---
title: "RogueAI: A Reverse Turing Test for Detecting Licensed AI Deception in Dialogue"
url: "http://arxiv.org/abs/2606.13310v1"
collected_at: "2026-06-12T13:30:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-deception, dialogue-game, llm-agent, evaluation]
---

## raw_excerpt

arXiv 検索結果と `memory/raw/web_research/results.jsonl` の要旨メモ。RogueAI は、従来の Turing Test を「AI らしさを見抜く」問題から「対話相手を信用できるか」にずらし、1 人の人間プレイヤーが 2 体の区別不能な LLM agent に質問する one-on-two interrogation game として実装する。設定上、片方の agent だけが共有された架空世界の中で deceiver として licensed され、プレイヤーは対話を通じてどちらが信用できないかを推定する。重要なのは、AI deception を単なる分類器評価ではなく、プレイヤーが質問を選び、相手の返答を比較し、信頼判断を更新する interactive game として扱う点。2026-06-11 published の arXiv:2606.13310v1。

短い原文断片: "one-on-two interrogation game" / "licensed to deceive" / "whether it can be trusted"。

## why_relevant_to_games

対話 NPC の信頼性、嘘つき役、尋問 UI、プレイヤー主導の情報収集を評価する小型ゲーム設計に使える。ゲーム内 deception を安全な架空設定へ閉じ込める設計例としても候補になる。
