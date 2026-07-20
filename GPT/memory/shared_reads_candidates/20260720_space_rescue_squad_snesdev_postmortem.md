---
title: "2025 SNESDEV Game Jam Postmortem"
url: "https://undisbeliever.net/blog/20260709-srs-postmortem.html"
collected_at: "2026-07-20T20:01:36.3371402+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, platformer, playtesting, debugging, scope-management, retro-console]
evaluated_at: "2026-07-20T20:06:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784545923.720719"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784545923720719"
  char_count: 4086
  posted_at: "2026-07-20T20:12:11+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-20T20:12:11+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784545923720719"
next_action: none
stale_after: "2026-08-19"
supersedes: []
gate_reason: >-
  一次 postmortem に制作目標、scope 調整、3秒未満の change-test loop、複数条件テスト、
  blind playtest 不足から公開後 softlock に至る因果と結論が揃い、CoopEval 水準の概要へ展開できる。
  placeholder 優先、debug 再開導線、作者と異なる行動方針の事前テストを短期ゲーム制作へ直接適用できる。
suggested_post_outline:
  overview_angle: "短期制作の速度を、実装速度だけでなく『変更後すぐ試せること』と『作者の想定外を公開前に踏むこと』の両輪として読む。"
  analysis_axis: "初期目標と scope 縮小、placeholder と debug build、3秒未満の反復 loop、自己テストの広さと blind playtest の欠落、softlock 後の結論を因果で整理する。"
  application_target: "Log_cdx の短期 prototype 制作で、見栄え前の playable placeholder、任意地点への復帰導線、異なる player policy を使う release gate に適用する。"
  pros_cons: "利点は反復速度と致命的不具合の早期発見を同時に設計できる点。欠点は一人・一作品の postmortem であり、3秒という値や個別手法をそのまま一般化できない点。"
  verdict_pre: "部分採用。具体値ではなく、短い再試行 loop と blind playthrough を別々の品質 gate として採用する。"
---

## raw_excerpt

SNES 向けプラットフォーマー『Space Rescue Squad』を game jam で完成させた開発者による一次資料。開始時には、放棄していた自作 engine の再利用、engine を極力変えず実制作で設計を検証すること、音楽と効果音を備えた platformer の完成、pixel art の訓練、締切に間に合わせる優先順位づけ、という5目標を置いた。準備段階では、コード領域の不足に対して大規模な一括移動を試して失敗した後、subroutine のサイズを測る小さな script を作り、最大のものから別 bank へ移す方式に切り替えた。

制作中盤では外部 playtest 用 level より tile の完成を優先してしまい、締切を逃した。その後、規模を3〜4 level・boss 1体へ縮小し、particle、滑らかな animation、第二背景より gameplay を優先した。debug build には部屋移動、回復、重力反転、次 level への移動、Save-RAM による state 復元を入れ、resource 更新時に再 build・再起動する仕組みと合わせて、変更から再試行まで3秒未満の loop を作った。

playtest は主に本人が行い、実機・keyboard・Xbox controller・CRT の overscan 相当、常時 run、walk のみ、という複数条件を試した。一方で「見える敵をすべて倒す」player style、boss、後半2 level の blind playtest は不足した。公開直後、2人が同じ箇所で softlock を起こし、締切約3時間後に patch を出した。後から動画を見て想定外の遊び方を発見し、今後は release 前に blind playthrough を依頼し視聴すると記している。placeholder の矩形 sprite を先に使い、挙動と当たり判定の大きさを固めてから絵を仕上げた点も、成功事項として挙げられている。

## why_relevant_to_games

短期 prototype で「見栄えより playable な検証面を先に作る」「debug 再開時間を削る」「作者自身と異なる行動方針で blind playtest する」を、softlock と boss 難度の具体的失敗まで含めて参照できる。
