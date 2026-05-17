---
title: "Towards LLM-Based Automatic Playtest"
url: "https://arxiv.org/abs/2507.09490"
collected_at: "2026-05-17T18:14:09+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, llm, qa, match-3, evaluation, headless]
---

## raw_excerpt
原文短句: "Lap encompasses three key phases: processing of game environments, prompting-based action generation, and action execution."

収集メモ: arXiv:2507.09490 は、LLM を non-text game の automatic playtesting に使う研究。手動 playtest は高コストだが、従来の自動テストは domain knowledge や problem-solving skills を持ちにくく、LLM も text-based game や API が整ったゲームに偏りがち、という問題から始まる。Lap は match-3 game を対象に、ゲーム画面の snapshot を numeric matrix に変換し、その board representation を ChatGPT-O1-mini に渡して move suggestion を得る。提案手を実行して score と board change を発生させ、timeout までこの処理を反復する。評価は open-source match-3 game CasseBonbons での case study で、既存 tool 3 種と比較し、code coverage と crash trigger の面で良い結果を報告している。焦点は「視覚的ゲームをそのまま見せる」のではなく、ゲーム状態を LLM が扱える構造化表現に落とす pipeline にある。

## why_relevant_to_games
headless が弱いゲームでも、画面や盤面を numeric / symbolic state に落として LLM player に渡す設計候補になる。特にパズル、match-3、grid 系プロトタイプの自動テスト材料。
