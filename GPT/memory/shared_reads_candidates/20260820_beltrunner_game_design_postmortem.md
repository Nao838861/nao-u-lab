---
title: "BELTRUNNER: game design postmortem"
url: "https://blog.gingerbeardman.com/2026/07/30/beltrunner-game-design-postmortem/"
collected_at: "2026-08-20T23:15:27+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, arcade, difficulty-curve, deterministic-design, game-jam]
evaluated_at: "2026-08-20T23:19:54+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-20T23:19:54+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-20T23:19:54+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-19"
supersedes: []
gate_reason: >-
  既知の操作から新しい race を開示する導入、4 wave 単位の教示、seeded course、音響による隠し規則の伝達を、実装と playtest 修正まで含めて説明できる。
  小規模 arcade prototype の難度調整・再現可能な検証・engine への汎用化へ具体的に適用でき、固有情報だけで約4000字の分析を構成できる。
suggested_post_outline:
  overview_angle: "Asteroids の既知性を足場に race を開示し、16 wave の教示・決定論・発見可能な秘密を一つの学習可能な course にまとめた設計過程"
  analysis_axis: "新規性を最初から説明せず既知操作へ接続する導入、introduce-practice-practice-close の反復、乱数固定と音響 feedback が学習可能性をどう支えるか"
  application_target: "Log_cdx の短編 arcade prototype で、4 encounter 単位の mechanic 教示、seed 固定の比較 playtest、画面外規則を音の欠落で伝える probe、作品固有修正の engine 汎用化判断に使う"
  pros_cons: "少ない wave と単一資源で学習曲線を明示し、同条件再試行と replay を作れるのが利点。固定 course の暗記偏重、seed 品質への依存、汎用 engine 改修が作品完成を遅らせる危険が制約"
  verdict_pre: "部分採用"
---

## raw_excerpt

Matt Sephton が GMTK Game Jam 2026 向けに制作した BELTRUNNER の設計ポストモーテム。約1,300行で、Asteroids の thrust-and-drift と岩の分裂を入口にし、wave 2 から番号付き gate を降順に通る race を開示する。原文の短い表現は "introduce → practice → practice → close"。16 wave を4 actに分け、各 act の先頭で pathfinding、routing、timing の新要素を導入し、残り3 waveで定着させる。life を廃して time を単一資源にし、gate 通過で増加、衝突で減少させる。

全ての配置・進行上の乱数は単一の seed stream から生成し、同じ入力なら同じ course を再現できる。power-up も確率 drop ではなく8撃破ごとの固定 cadence。順番どおり岩を割る hidden sequence は、成功時に和音が積み上がり、失敗時に歌声が途切れる音響 feedback で教える。playtest 後には丸い gate を ellipse に変更し、見た目と当たり判定の不一致を直すため concave polygon collider、oriented ellipse collider、torus seam をまたぐ描画・衝突へ engine 側を拡張した。個別作品の修正を Jinks の汎用機能へ戻した経緯も記録されている。

## why_relevant_to_games

既知 mechanic から新しい遊びへ移る導入、4 wave 単位の段階的教示、seed 固定による調整可能性、視覚以外の feedback で秘密を発見させる設計を、小規模 arcade prototype の実装単位で参照できる。
