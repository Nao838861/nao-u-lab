---
title: "IVIE: A Neuro-symbolic Approach to Incremental and Validated Generation of Interactive Fiction Worlds"
url: "https://arxiv.org/abs/2606.13348"
collected_at: "2026-06-14T15:59:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, interactive-fiction, narrative-generation, neuro-symbolic, pcg]
evaluated_at: "2026-06-14T16:04:37+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781421025.584849"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781421025584849"
  char_count: 4487
  posted_at: "2026-06-14T16:10:31+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-14T16:10:31+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781421025584849"
next_action: none
stale_after: "2026-07-14"
supersedes: []
gate_reason: |-
  Interactive Fiction world generation の問題設定、LLM の創造性と symbolic validation の役割分担、出力物、human evaluation と残課題が candidate 内で読み取れる。
  小規模探索ゲームやテキスト/2D adventure の生成 harness に直接落とせるため、Phase 3 の ~4000 字概要へ展開できる。
suggested_post_outline:
  overview_angle: "LLM に世界を自由生成させるのではなく、生成物を検証可能な IF world 構造へ接地する neuro-symbolic PCG として書く。"
  analysis_axis: "創造担当の LLM と一貫性・接続・パズル制約を担う symbolic validation の分業、incremental generation、human evaluation、objective validation gap。"
  application_target: "Nao_u_BOT の小規模探索ゲーム、テキスト adventure、2D adventure の level/world generation harness と、生成後の到達可能性・所持品・目的達成検証。"
  pros_cons: "創造性と検証を分けられる点は強いが、objective validation gap と goal 検証の不足は残る。"
  verdict_pre: "部分採用。生成そのものより、生成後に検証可能な world state へ落とす設計を採用する。"
---

## raw_excerpt

arXiv 2606.13348。2026-06-11 投稿。Micaela Vaucher, Santiago Silveira, Santiago Gongora, Luis Chiruzzo。

検索結果と arXiv 要旨による一次メモ。Interactive Fiction の自動生成では、LLM は創造的な設定・人物・文章を作れる一方で、世界状態、場所接続、アイテム機能、パズル制約、目標達成条件の整合性を壊しやすい。逆に symbolic system は一貫性を保ちやすいが、創造的な広がりが弱い。IVIE はこの緊張を、Incremental & Validated Interactive Experiences として、段階的生成と symbolic validation を組み合わせて扱う。設定とキャラクター生成、パズル設計などの創造判断は LLM に委ね、生成された世界状態は検証可能な構造に接地する。出力は interconnected locations、functional items、NPC、coherent puzzles を持つ playable IF world として説明されている。人間評価では没入感、テーマ一貫性、player engagement が報告される一方、LLM inconsistency が puzzle constraints をすり抜ける場合や、objective validation gap により構造的に不可能な goal が残る課題も挙げられている。

## why_relevant_to_games

LLM にゲーム世界を作らせる時の「創造は任せるが、通行・所持・使用・目的達成は検証する」という分担例。小規模な探索ゲームやテキスト/2Dアドベンチャーの生成 harness 設計に使えそう。
