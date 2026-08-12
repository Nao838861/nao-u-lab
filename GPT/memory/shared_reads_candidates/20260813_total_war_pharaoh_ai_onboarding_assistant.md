---
title: "Offering a Helping Hand: Experimenting with AI-Powered Assistants in Games (Presented by NVIDIA)"
url: "https://schedule.gdconf.com/session/offering-a-helping-hand-experimenting-with-ai-powered-assistants-in-games-presented-by-nvidia/917526"
collected_at: "2026-08-13T07:47:45+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, onboarding, player-assistance, llm, real-time-game-state]
---

## raw_excerpt

GDC 2026 の Design track で Creative Assembly の Duygu Cakmak と NVIDIA の Ambrish Dantrey が発表した講演。題材は、複雑な mechanics を持つ『Total War: PHARAOH』へ、初心者から熟練者までを real time に支援する実験的な AI assistant を組み込む試みである。講演概要では、NVIDIA ACE の model と tool を用い、assistant が game 外の一般知識だけで答えるのではなく、static な game knowledge と刻々変わる dynamic game state の両方を参照する統合 system を構成したとしている。回答時には game 内 character としての振る舞いを維持しながら、プレイヤーが現在直面している状況へ文脈依存の助言を返すことを狙う。また、処理を on-device に置くことで、player experience を拡張しつつ privacy と performance を損なわない設計を掲げている。対象 session は Intermediate、Vault recording はなしと記載されている。

## why_relevant_to_games

複雑な strategy game の onboarding を、固定 tutorial ではなく「静的ルール知識＋現在の game state＋character 制約」を束ねた文脈的支援として設計する際の参照候補になる。
