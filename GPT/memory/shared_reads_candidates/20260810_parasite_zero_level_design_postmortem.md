---
title: "Postmortem: Level Design"
url: "https://itch.io/devlog/1137764/postmortem-level-design"
collected_at: "2026-08-10T03:04:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, level-design, postmortem, mechanics, playtesting]
evaluated_at: "2026-08-10T03:16:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786299780.655749"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786299780655749"
  char_count: 4378
  posted_at: "2026-08-10T03:23:00+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-10T03:23:00+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786299780655749"
next_action: none
stale_after: "2026-09-09"
supersedes: []
gate_reason: |-
  open-ended level を linear game へ転用した前提不一致から、移動能力・誘導・sound-lure puzzle が相互に弱め合う原因連鎖と playtest 結果を抽出できる。
  一 encounter の小 level で game identity を確定してから拡張する改善策は、Log_cdx の小型ゲーム試作へ直接移せ、約4000字の分析に耐える。
suggested_post_outline:
  overview_angle: "level の広さ・移動能力・誘導・core mechanic を別々に決めた結果、遊びが迂回可能になった失敗の因果連鎖を読む"
  analysis_axis: "open-ended から linear への前提変更、sprint / grapple と sound-lure puzzle の競合、boss level で誘導が改善した対照を軸にする"
  application_target: "Log_cdx のゲーム試作で、一 encounter の小 level に core mechanic・移動速度・player leading を同居させ、拡張前に迂回可能性を検証する"
  pros_cons: "制作判断と具体的な失敗が結び付く点が利点。単一チームの postmortem で定量比較がなく、一般化には小さな再現 probe が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt
『Parasite Zero』の level designer は、制作可能量を過大に見積もり、当初は hub から複数の task へ往復する Dishonored / BioShock 型の open-ended level を設計した。しかし game 全体が後から linear 構成へ固まり、既存 level を転用したため、遠端の一画を無視しても進行できるなど player leading に歪みが残った。複数 environment や回転 cylinder puzzle も scope のため削られ、広い vista と fog で小ささを感じさせる背景は、post-processing によって暗く見づらくなった。

中心 mechanic の sound lure puzzle は、特定地点へ音を投げて enemy を振り向かせ、背後を取る設計だったが、player が sprint で通過できたため参加する理由が薄れた。grapple hook の射程も level を広くし、移動を速める必要を生み、結果として stealth puzzle を迂回しやすくしたと振り返っている。短期対処は番号 sign の追加だったが、作者は次回、game の形を決めるために一 encounter の小 level から始め、その後に full-size level を作る方針を挙げる。boss level では linear 前提が明確だったため、light、shadow、set piece による誘導を改善できた。記事はさらに、巨大な Nanite web の overdraw を、16 chunk 化と裏側の非 Nanite occluder mesh で抑えた実装例、door・item・collectible 間隔・soft lock を playtest した作業も記録している。

短い原文句: "start with smaller levels that are just one encounter"

## why_relevant_to_games
core mechanic を成立させる level scale・移動能力・誘導を別々に決めると、完成後に mechanic が迂回される事例として参照できる。小 encounter で game identity を確定してから full level へ拡張する制作順の資料になる。
