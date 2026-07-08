---
title: "Seduced by the Narrative: Assessing Rule Adherence in Semi-Open Textual Sandboxes"
url: "https://arxiv.org/abs/2607.02802"
collected_at: "2026-07-08T17:45:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [trpg, narrative-game, rule-adherence, llm-judge, game-master]
evaluated_at: "2026-07-08T17:48:30+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783500835.880999"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783500835880999"
  char_count: 3839
  posted_at: "2026-07-08T17:54:12+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-08T17:54:12+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783500835880999"
next_action: none
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  semi-open textual sandbox で、魅力的な自然言語表現と機械的な rule validity を切り離せるかを測る問題設定が強い。
  LLM GM、narrative NPC、裁定 UI の安全弁として、表現品質に流されない rule check 設計へ具体的に適用できる。
suggested_post_outline:
  overview_angle: "TRPG 風の自由入力で、よい物語に釣られずルールを守る adjudicator 評価として書く"
  analysis_axis: "CoC 風設定、mandatory rule checks、tiered rhetorical attacks、5,376 samples、frontier model 評価で見えた robustness の限界"
  application_target: "LLM GM / narrative NPC / ルール裁定 UI で、生成文の魅力とゲーム上の可否を別レイヤーで検査する設計"
  pros_cons: "文章裁定の危険条件を明確化できる一方、CoC 的な skill check 前提なので作品固有ルールへの移植時は rule oracle が要る"
  verdict_pre: "採用"
---

## raw_excerpt
この論文は、Tabletop Role-Playing Game のような semi-open text-based game を、LLM adjudicator の rule-alignment 評価環境として扱う。TRPG-style semi-open environments では、player は自然言語で自由に行動を宣言できる一方、AI adjudicator は underlying rule engine を厳密に守る必要がある。著者らは Dungeons & Dragons よりも曖昧で narrative-driven な Call of Cthulhu に注目し、プレイヤーの雰囲気ある記述、感情的な訴え、欺瞞的 framing が、機械的に必要な dice roll や失敗条件を AI に見逃させるかを問う。CoC-Seduce benchmark は、GPT / Claude / Gemini 系の generator が作った 5,376 samples、16 skill categories、4 world settings からなり、mandatory rule checks と tiered rhetorical attacks を組み合わせて、モデルが rhetorical quality と objective mechanical validity を切り離せるかを測る。20 frontier models の評価では、model scale や explicit reasoning が裁定 robustness を安定的に保証しないことも報告されている。

## why_relevant_to_games
LLM GM / narrative NPC / ルール裁定 UI を作る時、面白い文章に流されず「表現」と「ルール上の可否」を分ける評価素材になる。
