---
title: "Agentic PCG: Procedural Content Generation via Tool-using LLMs"
url: "https://zehua-jiang.github.io/AgenticPCG/"
collected_at: "2026-05-17T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, llm-tools, level-design, playtesting, environment-feedback]
evaluated_at: "2026-05-17T10:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T09:55:21+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778979164601779"
posted:
  ts: "1778979164.601779"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778979164601779"
  char_count: 4038
  posted_at: "2026-05-17T09:55:21+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: none
gate_reason: >-
  一発生成ではなく perceive / reason / plan / edit の反復に置く問題設定、構造指標と
  gameplay simulation feedback、classic PCG tool 呼び出し、free-form instruction と
  functional constraints の併用が明確。小型ゲームの wave/level 調整 harness へ直結する。
suggested_post_outline:
  overview_angle: "LLM をレベル生成器ではなく、評価値とツールを持つ反復編集 agent として読む。"
  analysis_axis: "静的制約、動的 simulation feedback、classic PCG algorithm tool、言語指示と機能制約の統合。"
  application_target: "Pot 系 prototype の wave/level 調整で、LLM 提案を deterministic 評価と再編集 loop に接続する。"
  pros_cons: "制作 harness に落としやすい一方、評価関数の設計が弱いと LLM が局所最適や見た目だけの修正へ逃げる。"
  verdict_pre: "採用。まずは小さい level/wave grammar に solvability と行動 simulation feedback を付ける形で試す。"

---

## raw_excerpt

Zehua Jiang、Sam Earle、Ahmed Khalifa、Julian Togelius。プロジェクトページでは、LLM agent が game levels を一発生成するのではなく、環境を RL environment のように包み、perceive / reason / plan / edit のループで編集・評価・最適化する framework と説明されている。対象は Binary Maze、Lode Runner、Zelda、Sokoban、Super Mario Bros など。静的 task では tile counts、connectivity、solvability のような構造指標を使い、動的 task では deterministic A* agent の gameplay simulation など行動ベースの feedback も使う。編集 tool は tile placement だけでなく、binary space partitioning や tree-search-based diggers のような classic PCG algorithms も呼び出せる。free-form language instructions と explicit functional constraints を同時に扱える。

## why_relevant_to_games

ゲーム制作で LLM を「案を出す係」に閉じず、評価値とシミュレーション feedback を受けて小さく level を直す loop として使う材料。小型 prototype の wave/level 調整 harness に接続しやすい。
