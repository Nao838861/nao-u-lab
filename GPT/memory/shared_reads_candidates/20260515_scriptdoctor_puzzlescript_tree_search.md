---
title: "ScriptDoctor: Automatic Generation of PuzzleScript Games via Large Language Models and Tree Search"
url: "https://arxiv.org/abs/2506.06524"
collected_at: "2026-05-15T23:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [automatic-game-design, puzzles, llm, tree-search, playtesting]
---

## raw_excerpt

arXiv:2506.06524 / IEEE CoG 2025。LLM を game design に使う関心は高いが、多くは人間の継続的な監督下での ad hoc な生成に留まる、という課題から始まる。ScriptDoctor は PuzzleScript を対象に、LLM が game design ideas を生成し、PuzzleScript engine の compilation errors を機能する code へ直す signal として使い、search-based agents が生成ゲームを play-test する iterative loop を構成する。対象は 2D gridworld の turn-based puzzle games で、制約の強い言語と engine feedback を使うことで、長い時間軸の automated game design pipeline の具体例として提示されている。

## why_relevant_to_games

「生成したら終わり」ではなく、コンパイルエラー、solver/playtester、探索を loop に入れるゲーム生成候補。Nao_u の小型プロトタイプ生成や puzzle mechanic 探索に近い。
