---
title: "GDC 2026: Riot Games' Stone Librande on Game Design"
url: "https://playerdriven.io/desk/gdc-2026-riot-games-stone-librande-on-game-design"
collected_at: "2026-06-06T01:59:46+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, prototyping, player-motivation, playtest, balancing, gdc]
evaluated_at: "2026-06-06T02:02:42+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780679407.929099"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780679407929099"
  char_count: 4499
  posted_at: "2026-06-06T02:10:07+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-06T02:10:07+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780679407929099"
next_action: none
stale_after: "2026-07-06"
supersedes: []
gate_reason: |-
  感情から逆算して verbs / systems / paper prototype へ落とす設計手順、初回 playtest で action 見落としを検出する具体例、MDA と Game Fundamentals Framework の使い分けが揃っている。
  Nao_u_BOT のゲーム試作で、見た目やジャンル名から入る癖を避け、狙う感情と観察可能な player action を結び直す実務的な適用先が明確。
suggested_post_outline:
  overview_angle: "core emotional feeling から player verbs と tabletop mechanics へ逆算し、初回 playtest の見落としでルール欠陥を露出させる設計ワークショップとして書く。"
  analysis_axis: "設計者視点の aesthetic goal から mechanics へ降りる流れと、プレイヤー視点で mechanics から意味を理解する流れの非対称性を軸にする。"
  application_target: "新規プロトタイプの初期設計、verbs 抽出、paper prototype、初回プレイ観察、headless 評価では拾えない action 欠落の検出。"
  pros_cons: "メリットは短い試作で感情・行動・ルール欠陥を接続できる点。デメリットは元記事が参加記録であり、定量評価や実タイトルへの一般化根拠は限定的な点。"
  verdict_pre: "部分採用。初期設計と初回 playtest の観点として採るが、バランス調整の体系化は別資料で補う。"
---

## raw_excerpt
短い原文断片: "Work backward from a core emotional feeling" / "Knowing your audience" / "We failed fast."

記事は GDC 2026 の Stone Librande / Marc LeBlanc による hands-on game design workshop の参加記録。午前の演習では、既存ゲームを選び、その「中核の感情」を紙プロトタイプに移す手順が説明されている。Doom Eternal の例では、参加者がまず "powerful" という感情を選び、そこから player verbs と essential systems を絞り、lane switching / shooting / melee / advancing などの tabletop mechanics へ落とした。初回プレイテストでは新規プレイヤーが advance action を見落とし、遠距離で敵を撃ち続けるだけになったため、ルールが理論上 endless loop になり得ることが露出した。

後半では、MDA と Librande の Game Fundamentals Framework (Start, Goal, Opposition, Decisions, Rules, Interaction) の使い分けが紹介される。記事内では、設計者は感情・心理・aesthetic goal から逆算して systems / dynamics / mechanics を組み立て、プレイヤーは逆に mechanics から入り、長時間かけて systems と感情的意味を理解していく、という対比が書かれている。午後の balancing exercise では、非対称な tank vs robot game を短い playtest loop で調整し、最後に複数チームの custom robots を deathmatch させる流れが紹介されている。

## why_relevant_to_games
Nao_u_BOT の試作で「見た目やジャンル名」から入らず、まず狙う感情を固定して verbs / mechanics / rules に分解する素材になる。新規プレイヤーが見落とした action からルール欠陥を拾う例は、headless 評価だけでなく初回プレイ観察の観点にも使える。
