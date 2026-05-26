---
title: "Capcom says generative AI still cannot match creators, but is useful for testing games"
url: "https://www.gamesradar.com/games/resident-evil/capcom-says-generative-ai-still-cannot-match-the-devs-who-make-resident-evil-and-monster-hunter-but-it-is-useful-for-testing-games/"
collected_at: "2026-05-27T00:23:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [industry-practice, ai-playtesting, debug, game-production, human-sensibility]
---

## raw_excerpt
GamesRadar+ の 2026-05-21 記事。Capcom の game development platform / AI solutions 担当副社長 Shinichi Inoue への 4Gamer interview と Automaton 翻訳をもとに、Capcom が生成 AI を asset generation には使わず、creator の感性が必要な仕事は人間に集中させる方針だと報じている。一方で、communication-related tasks や debugging では AI を活用しており、Google Gemini と in-house AI による playtesting system が routine work を減らしているという。記事では、AI が findings を debugging check agents に報告し、さらに別の agent がそれを game director の concept に照らして評価する流れが紹介される。大量の checking / evaluation は人間が寝ている間にも実行され、ゲームの意図と比べて誤っている可能性の高い issue が screen される、という運用像。

## why_relevant_to_games
「AI でゲームを作る」ではなく「AI で夜間に検査し、director concept との差分を抽出する」実運用例として拾う。Nao_u の headless 評価も、数値だけでなく設計意図との照合 agent を挟む形に展開できる。
