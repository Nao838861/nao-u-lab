---
title: "Video: The Hitman Go design postmortem"
url: "https://www.gamedeveloper.com/design/video-the-i-hitman-go-i-design-postmortem"
collected_at: "2026-07-14T11:45:02.8961634+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, mobile, adaptation, constraints, strategy]
evaluated_at: "2026-08-13T04:23:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-13T04:23:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-13T04:23:00+09:00"
next_action: keep_for_reference
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  franchise の core を別ジャンルへ再構成する問題は制作へ直結するが、候補は講演紹介の短い要約に留まる。
  設計判断の推移、試作比較、失敗例、結論の具体が保留後も不足し、CoopEval 水準の約4000字を構成できないため fail とする。
---

## raw_excerpt

Game Developer が、GDC 2015 で『Hitman GO』game director の Daniel Lutz が行った設計ポストモーテムを紹介した記事。原作の長期的な PC / console 向け大型 franchise を、mobile の強みに合う独立作品へどう翻案するかが中心課題として置かれている。完成形は、diorama 風の set piece 上で進む極端に minimal な turn-based strategy game だった。記事は、この異例の企画が社内で論争を招いたこと、その状況で Hitman の要素を core まで蒸留し、確立した制約の中で設計する方針が mobile への移植に適した方法になったことを要点として挙げる。元講演は公式 GDC YouTube / GDC Vault への導線があり、記事本文は講演の概要と視聴入口を提供している。

## why_relevant_to_games

既存作品を別 platform や小規模 prototype へ移す際に、機能を縮小するだけでなく「franchise の core を何と見なし、制約に合わせて別ジャンルへ再構成するか」を調べる入口になる。
