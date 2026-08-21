---
title: What game developers actually want from procedural level generation tools
url: https://www.pcgworkshop.com/archive/endrovski2026developers.pdf
collected_at: "2026-08-21T15:45:53+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, level-design, tools, developer-survey]
evaluated_at: "2026-08-21T15:50:33+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-21T15:50:33+09:00"
last_decision: postponed
duplicate_reason: duplicate_of_terminal_sibling
evidence: "duplicate of posted candidate: memory/shared_reads_candidates/20260608_pcg_level_generation_practitioner_needs.md; permalink:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780853278343919"
next_action: none
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  同一タイトルの既存 candidate は、同じ120人調査、職種別採用差、creative control / transparency という同一の結果を扱い、すでに4454字で投稿済み。
  URL は掲載ページと PDF mirror で異なるが独立資料ではないため、Phase 3 の再投稿対象から外す。
---

## raw_excerpt

FDG 2026 の論文。著者らは、研究上は多くの procedural content generation（PCG）手法が提案されている一方、実際のゲーム開発、とくに procedural level design への採用が均一には進んでいない点を出発点にしている。level designer、game designer、technical artist、environment artist、programmer、researcher を含むゲーム開発者 120 人へ、現在の利用状況、採用を妨げる要因、技術的な好み、将来の要求を質問し、回答を可視化・分析した。論文は、artist が designer より procedural generation をかなり頻繁に使うという統計的に有意な採用差を報告する。さらに AI 支援 PCG については、完全自動化よりも creative control、生成過程や判断の transparency、既存 workflow への統合を優先する回答が一貫して現れたとする。本文の表現では、開発者は AI に “ride shotgun” させても “driver’s seat” は手放したくない。著者らは、designer の技術的障壁を下げ、black-box automation ではなく designer agency を増幅する tool design が PCG 普及の余地になるとまとめている。回答データを demographic segment ごとに探索できる interactive analysis tool も併設した。

## why_relevant_to_games

自動生成をどこまで任せるかではなく、designer が生成過程を理解・修正・制御できる道具にするための要件を、開発者 120 人の調査から拾える。level / wave / encounter 生成ツールの UI と mixed-initiative workflow を設計する場面に接続できる。
