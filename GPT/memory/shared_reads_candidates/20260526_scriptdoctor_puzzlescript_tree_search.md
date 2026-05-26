---
title: "ScriptDoctor: Automatic Generation of PuzzleScript Games via Large Language Models and Tree Search"
url: "https://arxiv.org/abs/2506.06524"
collected_at: "2026-05-26T17:52:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automatic-game-design, puzzles, llm, tree-search, puzzlescript]
---

## raw_excerpt
arXiv abstract と Slack #shared-reads で拾われたメモからの収集要約。対象は、LLM による Automatic Game Design が、コードや asset の生成、抽象的な design idea の生成には使われているが、多くは人間監督下の ad hoc な利用に留まっているという問題。ScriptDoctor は PuzzleScript という制約の強い 2D gridworld / turn-based puzzle 記述言語を使い、LLM がゲーム案を作り、PuzzleScript engine の compile error を戻して修正し、search-based agent が生成ゲームを play-test する iterative loop を組む。human-authored examples を grounding として使い、エンジンのエラーで機能する code へ寄せ、tree search agent の playtest で解けるかを検査する構成。Slack 側では「動いて遊べる」ゲームに寄せるため、LLM 生成、compile feedback、agent playtest の 3 層をつなぐ例として拾われていた。

## why_relevant_to_games
小さなパズルやルール記述ゲームで、生成、コンパイル、探索プレイテストを一つの制作ループにする時の材料になる。
