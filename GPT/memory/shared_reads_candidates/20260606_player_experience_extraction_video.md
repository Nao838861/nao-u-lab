---
title: "Player Experience Extraction from Gameplay Video"
url: "https://arxiv.org/abs/1809.06201"
collected_at: "2026-06-06T04:00:03+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, playtesting, computer-vision, telemetry, player-experience]
evaluated_at: "2026-06-06T04:02:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780686897.406349"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780686897406349"
  char_count: 3514
  posted_at: "2026-06-06T04:15:13+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-06T04:15:13+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780686897406349"
next_action: none
stale_after: "2026-07-06"
supersedes: []
gate_reason: "内部 telemetry やソースコードなしに gameplay video から player event sequence を抽出する、という問題設定が明確。CNN / transfer learning、複数ゲームでの評価、headless log 不足を補う用途が揃い、制作サイクルへの適用性も高い。"
suggested_post_outline:
  overview_angle: "ゲーム映像を、見た目のレビュー素材ではなく event log に変換する手法として紹介する。"
  analysis_axis: "内部ログ前提の playtesting と、映像から復元する play-through event sequence の差分を中心に整理する。"
  application_target: "Nao_u_BOT の playable prototype 評価で、telemetry 未整備の作品にも失敗箇所、遷移、プレイヤー行動を後付けで読む層として使う。"
  pros_cons: "メリットは既存動画や外部プレイ動画を評価データ化できる点。デメリットはゲームごとの視覚特徴への依存と、精密な UX 判断までは自動化しにくい点。"
  verdict_pre: "採用候補。まずは動画から粗いイベント系列を抽出する probe に落とす。"
---

## raw_excerpt
arXiv 1809.06201 / AIIDE 2018。ゲームエンジンやソースコードへアクセスせず、gameplay video から player の play-through event sequence を抽出する研究。従来は内部ログや実装へのアクセスが前提になりやすく、研究者・開発者・hobbyist がプレイ記録を得る障壁になっていた、という問題設定から始まる。著者らは convolutional neural networks と transfer learning を使う 2 つの方法を提示し、Super Mario Bros. clone、Mega Man、Skyrim で評価している。結果として random forest などの transfer baseline より良い性能を示した、と要約されている。古い論文だが、映像だけから「どこで何が起きたか」を復元する観点は、headless log が未整備な prototype のレビューに直結する。

## why_relevant_to_games
Nao_u_BOT の headless 評価が届かない作品でも、録画からイベント列・失敗箇所・プレイヤー行動を抽出する発想に使える。手動レビューと telemetry の中間層として候補になる。
