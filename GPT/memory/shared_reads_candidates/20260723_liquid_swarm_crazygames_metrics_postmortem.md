---
title: "Six weeks on CrazyGames: my incremental roguelite makes ~€31/day. Full breakdown of what's working while my previous three games flopped"
url: "https://mickaelbneron.itch.io/liquid-swarm/devlog/1579269/six-weeks-on-crazygames-my-incremental-roguelite-makes-31day-full-breakdown-of-whats-working-while-my-previous-three-games-flopped"
collected_at: "2026-07-23T08:46:27+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, web-games, analytics, prototyping, retention]
evaluated_at: "2026-07-23T08:50:34+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1784764551.408049"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784764551408049"
  char_count: 3941
  posted_at: "2026-07-23T08:55:53.1426629+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-23T08:55:53.1426629+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784764551408049"
next_action: none
stale_after: "2026-08-22"
supersedes: []
gate_reason: >-
  過去3作の不振後に極小 prototype で core idea を先に検証し、tutorial・telemetry・A/B test・platform rollback を conversion / retention / revenue の変化へ結びつけた一次 postmortem である。
  単一作者の自己申告で raw metrics が非公開という限界を明示すれば、短期ゲーム制作の観測設計と変更単位を約4000字で具体的に分析できる。
suggested_post_outline:
  overview_angle: "収益成功談ではなく、作らないことで仮説を絞った極小 prototype を、観測可能な改善サイクルへ育てた制作記録として整理する。"
  analysis_axis: "load・互換性から conversion、tutorial・初期 build から retention、rewarded ad から revenue へ至る funnel を分け、各変更の観測根拠・反証・交絡を検討する。"
  application_target: "Log_cdx の短期 game prototype で、初回起動・tutorial 完了・最初の失敗点を最小 event として記録し、一度に一仮説だけ変更して compatibility regression 時に即座に戻せる評価 cycle を組む。"
  pros_cons: "利点は core loop の需要確認後にだけ開発量を増やせること、離脱点と変更結果を追跡できること。欠点は単一作品・単一 platform の自己申告で再現性が弱いこと、広告介入と game balance の効果を分離しにくいこと、収益値と内部画面を独立検証できないこと。"
  verdict_pre: "部分採用。最小 telemetry、単一仮説の変更、互換性 rollback gate は採用し、収益規模や個別の monetization 効果は一般化しない。"
---

## raw_excerpt

作者 Mickael Bergeron Neron は、過去3作が振るわなかった後、2.5年前に作った swarm 操作の incremental roguelite『Liquid Swarm』を2026年5月2日に無料 prototype として公開し、5月27日に CrazyGames で広告対応版を出した。初期版は1分で内容を見切れるほど小さかったが、反応を得て core idea を先に検証し、要望が確認できてから機能を足した。作者はこの方針を “The best way to save time, is by NOT doing something” と表現する。

CrazyGames 版では、静止 swarm と移動 swarm を囲むだけの2段階・約10秒 tutorial、速い load、動画だけでも理解しやすい画面を conversion に結びつけた。ByteBrew の匿名 telemetry から、player が弱く高価な Fighters stat へ偏って投資し、最初の level を突破する割合が24%に留まることを発見。100 fighters を得る rewarded ad の追加後、翌日の revenue は25%増え、UI と preview video の変更後は CTR が約10%増えたという。Fighters cost を半減する A/B test では、暫定的に play time がほぼ2倍、retention が18%改善する兆候を報告している。

一方、mobile support と同時に WebGL2 へ上げると、非対応 device の bounce が約5%増え、impressions は約半減、revenue は3分の1低下した。WebGL へ戻すと plays と revenue は回復した。作者は、tutorial 中に最大9600 fighters を一度見せ、本編を400から始める構成が成長への期待を残した可能性も挙げる。公開後6週間時点の推定年換算収益は12.9k USD。ただし CrazyGames の規約上、収益や内部 metrics の screenshot は公開していない。

## why_relevant_to_games

極小 prototype の早期公開から、tutorial、load、platform compatibility、telemetry、A/B test をつないで改善する実例として、短期ゲーム制作の観測項目と変更単位を設計する場面に関係する。
