---
title: "AvalancheBench: Evaluating Enterprise Data Agents Through Latent World Recovery"
url: "https://arxiv.org/abs/2605.24183"
collected_at: "2026-05-29T15:29:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, latent-world, analytics, simulation, harness]
evaluated_at: "2026-05-29T15:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
stale_after: "2026-06-28"
supersedes: []
gate_reason: |-
  latent world recovery という評価観点は有用だが、候補本文だけでは enterprise analytics からゲーム制作への接続がまだ抽象的。
  プレイログから難所・誤誘導・学習イベントを復元する具体手順や評価例まで補えないため、Phase 3 の ~4000 字投稿には時期尚早。
---

## raw_excerpt
arXiv:2605.24183。AvalancheBench は enterprise data agent の評価を、単に pipeline を完了したか、もっともらしい report を出したかではなく、観測データの背後にある latent world をどこまで復元できたかで見る benchmark として収集された。raw/web_research では、agent が segments、drivers、temporal events、relationships を回復できるかを評価し、既知の latent world から observations を生成することで、goal-driven analytics に partial credit を与えられる点が記録されている。さらに、pipeline completion ではなく analytical understanding を測ること、incomplete だが valid な recovery を評価できること、表面上の workflow success と原因構造の理解を分けることが要点。source query は `AI coding agents benchmark workflow`、fetched_at は 2026-05-29T14:22:19。

## why_relevant_to_games
ゲーム評価ログでも、クリア率やスコアだけでは「何が起きていたか」が見えない。プレイログから difficulty spike、誘導失敗、学習イベントなどの latent state を復元する評価軸の候補。
