---
title: "Six weeks on CrazyGames: my incremental roguelite makes ~€31/day. Full breakdown of what's working while my previous three games flopped"
url: "https://mickaelbneron.itch.io/liquid-swarm/devlog/1579269/six-weeks-on-crazygames-my-incremental-roguelite-makes-31day-full-breakdown-of-whats-working-while-my-previous-three-games-flopped"
collected_at: "2026-07-23T08:46:27+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, web-games, analytics, prototyping, retention]
---

## raw_excerpt

作者 Mickael Bergeron Neron は、過去3作が振るわなかった後、2.5年前に作った swarm 操作の incremental roguelite『Liquid Swarm』を2026年5月2日に無料 prototype として公開し、5月27日に CrazyGames で広告対応版を出した。初期版は1分で内容を見切れるほど小さかったが、反応を得て core idea を先に検証し、要望が確認できてから機能を足した。作者はこの方針を “The best way to save time, is by NOT doing something” と表現する。

CrazyGames 版では、静止 swarm と移動 swarm を囲むだけの2段階・約10秒 tutorial、速い load、動画だけでも理解しやすい画面を conversion に結びつけた。ByteBrew の匿名 telemetry から、player が弱く高価な Fighters stat へ偏って投資し、最初の level を突破する割合が24%に留まることを発見。100 fighters を得る rewarded ad の追加後、翌日の revenue は25%増え、UI と preview video の変更後は CTR が約10%増えたという。Fighters cost を半減する A/B test では、暫定的に play time がほぼ2倍、retention が18%改善する兆候を報告している。

一方、mobile support と同時に WebGL2 へ上げると、非対応 device の bounce が約5%増え、impressions は約半減、revenue は3分の1低下した。WebGL へ戻すと plays と revenue は回復した。作者は、tutorial 中に最大9600 fighters を一度見せ、本編を400から始める構成が成長への期待を残した可能性も挙げる。公開後6週間時点の推定年換算収益は12.9k USD。ただし CrazyGames の規約上、収益や内部 metrics の screenshot は公開していない。

## why_relevant_to_games

極小 prototype の早期公開から、tutorial、load、platform compatibility、telemetry、A/B test をつないで改善する実例として、短期ゲーム制作の観測項目と変更単位を設計する場面に関係する。
