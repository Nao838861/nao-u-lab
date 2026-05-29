---
title: "Agentic PCG: Procedural Content Generation via Tool-using LLMs"
url: "https://zehua-jiang.github.io/AgenticPCG/"
collected_at: "2026-05-30T00:14:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, llm-agent, level-design, tool-use]
evaluated_at: "2026-05-30T00:18:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
stale_after: "2026-06-29"
supersedes: []
gate_reason: |
  Phase 3 で同一 URL の既投稿を確認したため撤退。2026-05-27 に #shared-reads 投稿済み:
  https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779885575577609
  内容の骨格は十分だが、今回は新規観点ではなく重複投稿になる。
suggested_post_outline:
  overview_angle: "LLM 一発生成ではなく、level state と metric/simulation feedback を観測しながら PCG tool を呼ぶ反復編集システムとして説明する。"
  analysis_axis: "free-form design instruction と functional constraint を同時に扱うために、LLM の自然言語 prior と既存 PCG tool / deterministic simulation をどう分業させているか。"
  application_target: "game/* の headless 評価、route/bad-policy split、ステージ編集 probe を、生成器の外部採点ではなく編集ループ内 feedback に戻す設計。"
  pros_cons: "長所は設計意図と機能制約を同じループで扱える点。弱点は tool 設計、metric 偏り、simulation agent の限界が生成品質を支配する点。"
  verdict_pre: "部分採用。PCG 全体ではなく、短いステージ差分を feedback 付きで直す probe から使う。"
---

## raw_excerpt

プロジェクトページと SSRN 要旨によると、Agentic PCG は tool-calling LLM を使ってゲームレベルを反復編集する PCG 枠組み。LLM に一発でレベル全体を生成させるのではなく、ゲーム環境を RL environment に近い形で包み、現在の level state、metric、simulation feedback を観測させる。agent は perceive / reason / plan / edit のループで、tile placement、line drawing、patch editing、BSP、digger などの PCG アルゴリズムを tool として呼び、Binary Maze、Lode Runner、Zelda、Sokoban、Super Mario Bros など複数ドメインで functional constraint と自然言語の open-ended instruction を同時に扱う。静的構造だけで評価できる map では connectivity や shortest path、動的環境では deterministic A* agent の gameplay simulation などを feedback として使う。SSRN 側の要旨では、metric-driven search だけでは扱いにくい human priors / directives を、functional constraints と free-form design control の両方で扱う枠組みとして位置づけている。

## why_relevant_to_games

レベル制作を「LLM が直接出力する成果物」ではなく「tool + 評価 feedback で編集するループ」として扱う例。Nao_u_BOT の headless 評価や route/bad-policy split を、PCG 編集ツールに接続する時の材料になる。
