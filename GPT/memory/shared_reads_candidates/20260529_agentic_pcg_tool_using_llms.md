---
title: "Agentic PCG: Procedural Content Generation via Tool-using LLMs"
url: "https://zehua-jiang.github.io/AgenticPCG/"
collected_at: "2026-05-29T13:30:04+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, llm-agent, level-design, game-ai, tooling]
evaluated_at: "2026-05-29T13:35:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
stale_after: "2026-06-28"
supersedes: []
posted:
  ts: "1779885575.577609"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779885575577609"
  char_count: 5320
  posted_at: "2026-05-27T21:39:35.577609+09:00"
  note: "Phase 3 で同一 URL の既存 #shared-reads 投稿を確認したため再投稿せず紐づけた。"
gate_reason: |
  Tool-using LLM を「一発生成」ではなく、状態知覚・評価・編集ツール選択・反復修正の PCG loop として扱う点が明確。
  対象ゲーム、使う tool 群、playability feedback、controllable metrics が候補本文から読め、Nao_u 側の level/wave/puzzle 制作 loop へ具体接続できる。
suggested_post_outline:
  overview_angle: "Agentic PCG を、LLM にコンテンツを書かせる話ではなく、評価関数と編集 tool を持つ反復制作環境として整理する。"
  analysis_axis: "perceive-reason-plan-edit の loop、tool abstraction、deterministic play feedback、複数ゲームでの制御指標評価を軸に読む。"
  application_target: "Nao_u 環境の wave/level/puzzle 生成で、LLM 出力を直接採用せず、編集 tool と headless 評価に分解する設計に効く。"
  pros_cons: "利点は制作 loop への落とし込みやすさと評価可能性。弱点は tool 設計と評価関数の品質に成果が強く依存すること。"
  verdict_pre: "部分採用。次の playable diff では小さな編集 tool + deterministic 評価の形で試す価値がある。"
---

## raw_excerpt

SSRN 版は 2026-04-28 掲載、2026-05-10 改訂。Zehua Jiang / Sam Earle / Ahmed Khalifa / Julian Togelius による、tool-calling LLM を使った Procedural Content Generation の研究。ページ本文では、ゲームを一発生成の出力先ではなく、評価と編集を返す interactive environment として包む構成を説明している。LLM agent は現在の level state を知覚し、改善点を推論し、編集計画を立て、tile placement / line drawing / patch edit / BSP / digger などの tool を選びながら反復する。

対象例は Binary Maze、Lode Runner、Zelda、Sokoban、Super Mario Bros など。構造指標だけで評価できる静的 level と、deterministic A* agent の simulated gameplay feedback を使う動的 level の両方を扱う。公開ページは「Perceive, Reason, Plan, and Edit」「Tool-Using Level Design」「Free-Form Language Instructions」「Targeting Different Controllable Metrics」という切り口で、機能制約、自然言語のデザイン意図、メトリクス目標を同じ loop に入れる設計を示している。

短い原文抜粋: "perceive the current level state, reason about what should be improved"

## why_relevant_to_games

Nao_u 環境のゲーム制作で、LLM に level / wave / puzzle を直接書かせるのではなく、評価関数・シミュレーション・編集 tool を持つ小さな制作 loop に分解する候補になる。
