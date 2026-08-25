---
title: "The Art & Science of Evergreen Games: How Minecraft and Candy Crush Keep Players Engaged for Decades"
url: "https://developer.microsoft.com/en-us/games/articles/2026/05/art-and-science-of-evergreen-games-minecraft-candy-crush/"
collected_at: "2026-08-26T01:34:03+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, live-ops, player-trust, legacy-code, balancing, postmortem]
evaluated_at: "2026-08-26T01:37:33+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-26T01:46:16+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787676360423389"
next_action: none
stale_after: "2026-09-25"
supersedes: []
posted:
  ts: "1787676360.423389"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787676360423389"
  char_count: 4201
  posted_at: "2026-08-26T01:46:16+09:00"
gate_reason: >-
  Minecraft と Candy Crush の長期運営を、player trust、旧 codebase、全 level 調整、platform / creator 波及という具体的な変更面で説明し、
  2年の refactor と60,000件超の tweak など判断規模も示している。企業対談記事で統制評価ではない限界を明示すれば、
  既存ゲーム改修の事前影響分析と検証計画へ直結する約4000字の概要を構成できる。
suggested_post_outline:
  overview_angle: "長寿ゲームの更新を content drop ではなく、旧実装・全level・複数platform・creator・player trustを同時に動かす ecosystem event として捉える"
  analysis_axis: "2x2 fish と Caves and Cliffs の事例から、小さく見える mechanic が基盤改修と大規模再調整を要求する条件、telemetry と定性知見の役割を読む"
  application_target: "Log_cdx の既存 prototype 大改修で、mechanic 単体ではなく保存データ、既存stage、入力系、習熟、制作assetまでを変更面として列挙し、先行refactorと回帰検証の要否を決めるチェック"
  pros_cons: "実運営の規模感と失敗談が具体的で適用しやすい一方、Microsoft / King / Mojang の自己報告であり、比較対照や失敗率などの定量評価は不足する"
  verdict_pre: "部分採用"
---

## raw_excerpt

Microsoft Game Devが、GDCでのKingとMojangの対談をまとめた記事。Candy Crush Sagaは開始時の65 levelから22,000超へ増え、MinecraftはBedrock / Java / Education Editionと20以上のplatform、creator economyを含むecosystemへ広がった。両teamはupdateを単発content dropではなく、player、creator、partnerへ同時に影響するecosystem eventとして扱う。Mojangは17年以上updateを無料提供し、Kingはtelemetry、behavior analytics、qualitative insightを併用して、長期playerの習熟と親しみを壊さず新規性を加えるとしている。

旧codebaseでは小さく見えるmechanicも基盤変更を要求する。Candy Crushの2x2 fish導入前には10年以上のcodebaseを2年間refactorし、約18,000 levelの難度を保ちながら60,000件以上のlevel tweakを行った。playerからfishが誤ったtileを狙うとの報告もあり、大規模updateでは「MVPを出して後で直す」進め方が成立しないと振り返る。MinecraftのCaves and Cliffsでもworld generationとengine変更を並行した経験から、platform・creator・playerへ複雑性がどう波及するかを前もって洗い出す必要が示される。記事は、agilityと長期設計を両立し、信頼を損なわず更新を続けることを長寿運営の中心に置く。

## why_relevant_to_games

既存ゲームへmechanicを追加する際、機能単体ではなく旧code、全level、入力platform、player習熟、信頼まで影響範囲として見る材料になる。小規模prototypeでも「後で直せる変更」と「先に基盤・検証設計が要る変更」を分ける観点に使える。
