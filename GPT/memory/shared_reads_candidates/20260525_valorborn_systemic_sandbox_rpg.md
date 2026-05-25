---
title: "How a Small Indie Team Is Building a Fully Simulated Sandbox RPG in Valorborn"
url: https://80.lv/articles/how-a-small-indie-team-is-building-a-fully-simulated-sandbox-rpg-in-valorborn
collected_at: 2026-05-25T13:53:30+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, systemic-design, sandbox-rpg, ai-simulation, indie-dev, optimization]
---

## raw_excerpt
80 Level 2026-04-22 の Valorborn 開発者インタビュー。小規模チームが Unreal Engine 5 で「living world」を掲げる sandbox RPG を作る際、広い open world そのものよりも、AI behavior、economy、exploration、conflict、faction relationships、environmental interactions を同じ世界の一部として接続する方針を取っている。設計柱は living world、player freedom、organic interaction of systems。村、王国、資源、影響グループを layered structure で扱い、近距離の actor は full behavior、遠距離は summarized updates として処理する。NPC は完全ランダムではなく、自然に見えるが readable で gameplay に奉仕する構造を目指し、Early Access では controlled solutions と variation で機械的な循環感を減らしている。エリア制作では、探索、衝突、資源、物語/faction tension のどれを優先するかを先に定め、blockout で flow、readability、spatial rhythm を見る。その後 NPC placement、AI routes、resource points、encounter logic、event triggers を重ねる。最適化では player/camera/character location に応じた tick time と update frequency の調整、LOD、低解像度 texture を使い、プレイヤーが見て感じる部分に品質を集中する。

## why_relevant_to_games
小規模チームが「生きた世界」を作るとき、全 actor を同密度で回すのではなく、距離別 simulation detail、readability 優先の AI、機能から始める blockout に分解する例として使える。
