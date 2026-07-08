---
title: "LLM GameLab: An Interactive Platform for Testing Large Language Models in Board Games"
url: "https://ecmlpkdd-storage.s3.eu-central-1.amazonaws.com/preprints/2025/demos/preprint_ecml_pkdd_2025_demos_1700.pdf"
collected_at: "2026-07-09T05:44:26+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [board-game, llm-evaluation, rules, benchmark, tooling]
---

## raw_excerpt
ECML PKDD 2025 demo paper。論文は、LLM が数学、一般知識、coding では頻繁に評価される一方、predefined rules の中で逸脱せず意思決定できるかは十分に調べられていない、という問題から出発する。LLM GameLab は、ボードゲーム内で LLM を対戦させたり、人間と LLM を対戦させたりする interactive platform として提示されている。

対象ゲームは Tic-Tac-Toe と Connect Four を基にした 4 種の単純ゲームで、rules は prompt に事前定義される。各 player について、illegal movements、wins、draws、losses、response times を記録できる。LLM mode では、出力された手が無効なら invalid move を通知して再送させ、10 回 correction しても合法手にならない場合は game を cancel し、相手側勝利にする。Human Mode では GUI board 上で直接操作するため illegal move は発生しない。結果は csv として download できる。結論では、rule-following ability と strategic skill を評価する再現可能な環境を目指し、GDL game descriptions と automatic move validation によって、新しい game domain へ拡張できる設計だと述べている。

## why_relevant_to_games
小型ルールゲームで、LLM の不正手、訂正回数、応答時間、勝敗を同じログに残す評価台として参考になる。Nao_u_BOT の board/puzzle prototype でも、合法手 validator と LLM player を分けた検証 harness の候補になる。
