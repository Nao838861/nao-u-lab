---
title: "Postmortem - the negatives... - Cosmic Hero 2 Prologue"
url: "https://pazur3d.itch.io/cosmic-hero-2-prologue/devlog/1375110/postmortem-the-negatives"
collected_at: "2026-07-25T03:49:14+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, puzzle, onboarding, difficulty-curve, level-design]
---

## raw_excerpt

> “Especially the first level should not have any pain points or ambiguous situations.”

要点メモ（引用ではなく本文の要約）: retro sci-fi puzzle / arcade game『Cosmic Hero 2 Prologue』の作者が、公開後の短い YouTube playthrough を観察して失敗点を整理した記録。HUD や score を置かず、起動後すぐ世界へ入り、目的と mechanics を play から発見させる設計を採ったが、Sokoban 系操作に慣れた想定 audience でも導入と目標を読み取れない人がいた。8 map の短さなら難しくても進むだろうという仮説にも反し、2～6分で離脱する playthrough があり、最初の3 map、特に開始直後の laser barrier で止まる例が見えた。作者は序盤を10～12 mapへ分解し、最初の10～20分は緩やかに上げ、途中に breathing map を置く案を示す。

新 mechanic の導入でも、laser redirect を発見させる場面に、blaster の手動起動、自由に動かせる turn block、progress に必要な puzzle、次 section 用の余分な block を同時に置いていた。改善案は、最初の遭遇では component を固定して唯一の明白な action だけで結果を見せ、その後に switch、可動 block、puzzle を足す順序である。また7/8 map に secret を置き、全 secret 未発見なら end screen で再挑戦を促す構造は、初回に player が遊び方を選べず事実上二周を要求すると振り返る。

## why_relevant_to_games

「説明を削れば没入的」「短ければ難しくても続く」「発見させれば理解する」という設計仮説が、実際の早期離脱 trace で崩れた一次資料。tutorial、first-level friction、新 mechanic の一要素ずつの導入、replay 強制を点検する時に使える。
