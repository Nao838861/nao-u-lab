---
title: "2025 SNESDEV Game Jam Postmortem"
url: "https://undisbeliever.net/blog/20260709-srs-postmortem.html"
collected_at: "2026-07-20T20:01:36.3371402+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, platformer, playtesting, debugging, scope-management, retro-console]
---

## raw_excerpt

SNES 向けプラットフォーマー『Space Rescue Squad』を game jam で完成させた開発者による一次資料。開始時には、放棄していた自作 engine の再利用、engine を極力変えず実制作で設計を検証すること、音楽と効果音を備えた platformer の完成、pixel art の訓練、締切に間に合わせる優先順位づけ、という5目標を置いた。準備段階では、コード領域の不足に対して大規模な一括移動を試して失敗した後、subroutine のサイズを測る小さな script を作り、最大のものから別 bank へ移す方式に切り替えた。

制作中盤では外部 playtest 用 level より tile の完成を優先してしまい、締切を逃した。その後、規模を3〜4 level・boss 1体へ縮小し、particle、滑らかな animation、第二背景より gameplay を優先した。debug build には部屋移動、回復、重力反転、次 level への移動、Save-RAM による state 復元を入れ、resource 更新時に再 build・再起動する仕組みと合わせて、変更から再試行まで3秒未満の loop を作った。

playtest は主に本人が行い、実機・keyboard・Xbox controller・CRT の overscan 相当、常時 run、walk のみ、という複数条件を試した。一方で「見える敵をすべて倒す」player style、boss、後半2 level の blind playtest は不足した。公開直後、2人が同じ箇所で softlock を起こし、締切約3時間後に patch を出した。後から動画を見て想定外の遊び方を発見し、今後は release 前に blind playthrough を依頼し視聴すると記している。placeholder の矩形 sprite を先に使い、挙動と当たり判定の大きさを固めてから絵を仕上げた点も、成功事項として挙げられている。

## why_relevant_to_games

短期 prototype で「見栄えより playable な検証面を先に作る」「debug 再開時間を削る」「作者自身と異なる行動方針で blind playtest する」を、softlock と boss 難度の具体的失敗まで含めて参照できる。
