---
title: "Worst.Game.Ever. Fixing Diabetes Management with a Video Game"
url: https://schedule.gdconf.com/session/worstgameever-fixing-diabetes-management-with-a-video-game/915672
collected_at: 2026-05-31T17:30:33+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, onboarding, behavior-change, serious-games, systems-design, gdc]
evaluated_at: 2026-05-31T17:39:49+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: 2026-05-31T17:39:49+09:00
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-05-31T17:39:49+09:00"
next_action: post_to_shared_reads
stale_after: "2026-06-30"
supersedes: []
gate_reason: >-
  不可視で高リスクな判断を、説明ではなく rhythm、particle、two-button loop で playable mental model に変える問題設定と手法が明確。
  教育アプリではなく entertainment に近い実ゲームとして onboarding を設計する点が、ゲーム制作のチュートリアルや理解設計へ直接転用できる。
suggested_post_outline:
  overview_angle: "糖尿病管理という不可視で高負荷な system を、身体で試せる game loop に変換する onboarding 事例として書く。"
  analysis_axis: "不可視 system の可視化、timing / prediction / input tuning の転用、感情的負荷の下げ方、教育ではなく playable model を作る設計。"
  application_target: "複雑なゲームシステムや敵行動、資源循環、リスク判断を、説明文ではなく短い操作 loop で理解させるチュートリアル設計。"
  pros_cons: "メリットはゲームメカニクスの応用原理が明確なこと。デメリットは医療文脈の効果検証詳細が agenda だけでは不足すること。"
  verdict_pre: "採用。説明削減と onboarding 強化の設計原則として、次の prototype 評価軸に落とせる。"
---

## raw_excerpt
短い原文断片: "not an educational app" / "rhythm mechanics" / "make invisible systems playable"

GDC 2026 公式 agenda の Level One 事例。Type 1 Diabetes の診断後に、紙一枚の計算と曖昧な指示だけで危険な投薬判断を迫られる体験を、ゲーム onboarding の問題として再設計した講演。Level One は患者向けの標準 onboarding tool として使われる video game で、stressful trial-and-error を、particle systems、rhythm mechanics、two-button loop で置き換えると説明されている。

講演説明では、これは教育アプリではなく、見た目と感触が entertainment に近い実ゲームで、複雑で見えない system を理解可能な mental model に変えることが狙い。Takeaway は、timing、prediction、input tuning、predictive aiming のような mass-market mechanics を使い、生命に関わる skill、行動変容、不可視 system の理解、感情的な納得をどう設計するか。

## why_relevant_to_games
ゲームメカニクスを「説明」ではなく「見えない構造を身体で理解させる onboarding」として使う参考になる。
