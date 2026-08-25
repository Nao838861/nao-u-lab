---
title: "The Art & Science of Evergreen Games: How Minecraft and Candy Crush Keep Players Engaged for Decades"
url: "https://developer.microsoft.com/en-us/games/articles/2026/05/art-and-science-of-evergreen-games-minecraft-candy-crush/"
collected_at: "2026-08-26T01:34:03+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, live-ops, player-trust, legacy-code, balancing, postmortem]
---

## raw_excerpt

Microsoft Game Devが、GDCでのKingとMojangの対談をまとめた記事。Candy Crush Sagaは開始時の65 levelから22,000超へ増え、MinecraftはBedrock / Java / Education Editionと20以上のplatform、creator economyを含むecosystemへ広がった。両teamはupdateを単発content dropではなく、player、creator、partnerへ同時に影響するecosystem eventとして扱う。Mojangは17年以上updateを無料提供し、Kingはtelemetry、behavior analytics、qualitative insightを併用して、長期playerの習熟と親しみを壊さず新規性を加えるとしている。

旧codebaseでは小さく見えるmechanicも基盤変更を要求する。Candy Crushの2x2 fish導入前には10年以上のcodebaseを2年間refactorし、約18,000 levelの難度を保ちながら60,000件以上のlevel tweakを行った。playerからfishが誤ったtileを狙うとの報告もあり、大規模updateでは「MVPを出して後で直す」進め方が成立しないと振り返る。MinecraftのCaves and Cliffsでもworld generationとengine変更を並行した経験から、platform・creator・playerへ複雑性がどう波及するかを前もって洗い出す必要が示される。記事は、agilityと長期設計を両立し、信頼を損なわず更新を続けることを長寿運営の中心に置く。

## why_relevant_to_games

既存ゲームへmechanicを追加する際、機能単体ではなく旧code、全level、入力platform、player習熟、信頼まで影響範囲として見る材料になる。小規模prototypeでも「後で直せる変更」と「先に基盤・検証設計が要る変更」を分ける観点に使える。
