---
title: "Narrative-to-Scene Generation: An LLM-Driven Pipeline for 2D Game Environments"
url: "https://arxiv.org/abs/2509.04481"
collected_at: "2026-06-14T01:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, narrative-design, level-design, llm, 2d-games]
evaluated_at: "2026-06-14T02:02:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781370292.793479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781370292793479"
  char_count: 4231
  posted_at: "2026-06-14T02:05:04.5256807+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-14T02:05:04.5256807+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781370292793479"
next_action: none
stale_after: "2026-07-14"
supersedes: []
gate_reason: "自然文 narrative を key frames、spatial predicates、tile asset、terrain、object placement へ分解する流れが明確で、問題設定・手法・評価項目・結論を概要化できる。小規模 2D ゲーム制作では、ステージ案を制約付き配置へ変換する probe として具体的に試せる。"
suggested_post_outline:
  overview_angle: "LLM の物語生成を playable な 2D scene generation に接続するため、自然文を時間フレームと空間述語へ落としてから tile/object 配置に変換する pipeline として整理する。"
  analysis_axis: "narrative parsing、affordance-aware asset retrieval、Cellular Automata terrain、spatial rule placement、multi-frame constraint satisfaction の分業がどこまで汎用化できるかを見る。"
  application_target: "Nao_u 側の 2D プロトタイプで、ステージ設計メモやイベント案を object-relation-object 制約に変換し、手配置前の rough layout を生成する検証に使う。"
  pros_cons: "メリットは自然文から配置制約までの橋渡しが具体的な点。デメリットは評価が小規模で、playability や継続的な状態整合まではまだ限定的な点。"
  verdict_pre: "部分採用。完成した自動レベル生成より、設計メモを制約リストへ変換する中間表現として採用する。"
---

## raw_excerpt

arXiv:2509.04481。2025-08-31 submitted、2025-12-31 v2。Yi-Chun Chen と Arnav Jhala による、短い narrative prompt を 2D tile-based game scenes の連続へ変換する lightweight pipeline の論文。問題設定は、LLM が物語文を生成できても、その物語を playable visual environment へ接続する部分が PCG の未解決課題として残る、というもの。

手順メモ。システムは LLM-generated narrative から 3 つの key time frames を取り出し、各 frame で Object-Relation-Object 形式の spatial predicates を抽出する。そのうえで GameTileNet dataset から affordance-aware semantic embeddings を使って visual assets を取得し、Cellular Automata で layered terrain を生成し、predicate structure に基づく spatial rules で objects を配置する。評価は 10 個の diverse stories に対して行い、tile-object matching、affordance-layer alignment、spatial constraint satisfaction across frames を見る。著者らは、この prototype を narrative-driven scene generation の scalable approach と位置づけ、multi-frame continuity、symbolic tracking、story-centered PCG における multi-agent coordination への足場としている。

## why_relevant_to_games

物語や状況説明を、そのままレベル配置・地形・オブジェクト関係へ落とす候補。Nao_u 側の小規模 2D ゲーム制作では、ステージ案を自然文から tile/object constraint に分解する probe の材料になる。
