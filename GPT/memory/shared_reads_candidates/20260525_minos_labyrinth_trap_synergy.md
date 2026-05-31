---
title: "Minos Interview: inside the twisting labyrinth of this tower defence roguelite"
url: https://rogueliker.com/minos-interview/
collected_at: 2026-05-25T20:36:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, roguelite, tower-defense, level-design, player-experimentation, post-launch]
evaluated_at: 2026-05-25T20:44:38+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T20:53:59+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779709898875179"
posted:
  ts: "1779709898.875179"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779709898875179"
  char_count: 3555
  posted_at: "2026-05-25T20:53:59+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |-
  labyrinth-building / trap placement / enemy routing を中心に、プレイヤー実験を成立させる設計判断と post-launch balancing の論点が抽出できる。
  Nao_u_BOT の経路・装置・難度調整プロトタイプへ具体適用でき、demo 滞在時間という評価観点も使える。
suggested_post_outline:
  overview_angle: "tower defence roguelite を短い run ではなく、自作迷宮の読みと罠シナジーを味わうゲームとして設計した判断を軸にする。"
  analysis_axis: "プレイヤーの組み合わせ創意を守りつつ、fun を削らずに balance する post-launch 運用を分析する。"
  application_target: "罠・経路・敵誘導を持つ小規模プロトタイプで、探索導線、シナジー可視化、滞在時間評価、nerf 方針に使う。"
  pros_cons: "メリットは設計と運用の両方に落とせる点。デメリットはインタビュー記事で、定量データは demo 滞在時間程度に限られる点。"
  verdict_pre: "採用"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、記事内容の要旨メモとして保存する。2026-05-08 の Rogueliker による Minos 開発者 Artificer へのインタビュー。Minos は Greek mythology を背景にした tower defence roguelite で、run の短さや高速リセットよりも、プレイヤーが labyrinth を組み、trap placement と enemy routing を試しながら生きた迷宮を形作ることを重視している。

開発者は、典型的な roguelite の期待よりも「labyrinth design」という固有角度を優先したため、通常 run は長く、失敗しにくく、unlock や upgrade を進めながら一回の慎重な attempt でクリアできる作りになった、と説明する。後から、より classic roguelite に近い no-story mode / streamlined mode も追加予定。開発中には、敵が迷宮を探索し記憶し集団行動する設計から、プレイヤー側の仕掛けと routing の読みやすさを優先した形へ変化した話も出ている。

発売後の feedback では、プレイヤーが trap を組み合わせる創意工夫が想定以上で、開発者は「fun を nerf しない balance」の難しさに触れている。demo の滞在時間も目立ち、37k players 中 15k が 1 時間超、4k が 5 時間超、1k 超が 10 時間超を遊んだという数字が挙がっている。

短い原文句として "Players are geniuses." と "without nerfing the fun out of the game" を控える。

## why_relevant_to_games
プレイヤー実験を中心に置く設計で、固有メカニクスを守りながら post-launch で軽量モードを足す事例。Nao_u_BOT の罠、経路、敵誘導、支配戦略検証、demo 滞在時間の読み方に使える。
