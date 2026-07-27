---
title: "Co-Creativity at the Table: A Qualitative Analysis of Creative Interactions in the Podcast Adventure AI"
url: "https://arxiv.org/abs/2606.18010"
collected_at: "2026-06-19T02:04:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ttrpg, narrative, human-ai-collaboration, llm]
evaluated_at: "2026-07-27T14:22:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-27T14:32:05.4608516+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785130293952519"
posted:
  ts: "1785130293.952519"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785130293952519"
  char_count: 3728
  posted_at: "2026-07-27T14:32:05.4608516+09:00"
next_action: none
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  3 seasons を同じ template analysis で符号化し、人間/AI の役割、agency・整合性・balance の失敗、時系列変化まで具体例と件数で示している。
  LLM を生成役に限定し、game state・裁定・物語の凝集性・対人調整を人間へ残す設計として、会話 NPC や narrative 支援へ具体的に適用できる。
suggested_post_outline:
  overview_angle: "実プレイ3 seasons の役割分解から、LLMをDMの代替ではなく制約付き共同制作者として配置する条件を読む"
  analysis_axis: "template analysis の妥当性、AIの成功領域とagency・整合性・balance失敗、model更新と運用改善の切り分け"
  application_target: "会話NPC・物語生成prototypeで、生成と選択肢提示をLLMへ、world state・裁定・伏線・player agency監視をdeterministic層へ分離する"
  pros_cons: "役割境界と失敗例が具体的／単一podcastの自己評価中心で一般化とmodel更新効果の分離には限界"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2606.18010v1。対象は Dungeons & Dragons 実プレイ podcast "Adventure AI" の 3 seasons で、ChatGPT が "Alex the Language Lord" として DM や players と関わる様子を qualitative analysis している。論文の問いは、AI が TTRPG の co-creative partner / creativity support tool としてどこで使われ、プレイヤーと DM がそれをどう扱い、シーズンをまたいで使い方が変わったか。結果テーマは、人間の役割、AI の役割、AI への評価と goals、AI failures、AI を table の person / character として扱うこと。本文メモでは、LLM は idea generation や descriptive text の authoring では有効だが、adventure cohesion、player interpersonal dynamics、fairness complaints、diegetic / extra-diegetic information の管理は人間 DM 側の複雑な仕事として残る。AI を DM そのものにするより、準備・描写・選択肢の拡張に置いた時の成功と失敗が観察対象になっている。

## why_relevant_to_games

LLM をゲーム内 storyteller / NPC / 共同制作補助に入れる時、任せる役割と人間側に残す裁定・一貫性管理の切り分けに使える。
