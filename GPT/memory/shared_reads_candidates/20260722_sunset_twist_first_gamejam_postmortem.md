---
title: "First Gamejam Post-Mortem"
url: "https://itch.io/devlog/1578153/first-gamejam-post-mortem"
collected_at: "2026-07-22T02:45:45+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, postmortem, game-jam, controls, playtesting, game-feel]
evaluated_at: "2026-07-22T02:49:51+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784656503.008299"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784656503008299"
  char_count: 4291
  posted_at: "2026-07-22T02:55:03+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-22T02:55:03+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784656503008299"
next_action: none
stale_after: "2026-08-21"
supersedes: []
gate_reason: >-
  初見者が独特な移動を読めない問題に対し、入力表示の削減と世界内の進行方向 cue を試した結果、
  なお残った難度問題まで評価値と制作時系列に結び付けており、操作可読性・jam scope・物語露出を具体的に分析できる。
  単独の自己報告という限界を明示しても、記事固有の判断と失敗から約4000字の概要・適用評価を構成できる。
suggested_post_outline:
  overview_angle: "初jamの一週間を、独特な移動の可読性、playtest反映、制作scope、物語露出が最終評価へどう現れたかという判断連鎖で再構成する"
  analysis_axis: "作者には自然になった操作と初見者の心的モデルのずれを中心に、cue追加で改善した部分と難度を残した部分、技術的寄り道、secret route依存を分けて検証する"
  application_target: "Log_cdxの短期ゲームprototypeで、初回30秒の入力理解テスト、visual cue変更前後の観察、難度と操作不明の切り分け、締切中のtool作業制限、重要な物語beatの到達率確認に使う"
  pros_cons: "利点は評価値・playtest反応・工程上の判断が同じ記録にあり失敗の因果を追えること。弱点は単一作者の自己報告で、tester数や変更前後の定量比較がなく一般化には追加検証が要ること"
  verdict_pre: "部分採用。操作可読性とjam工程の監査枠は採用し、難度維持や物語露出の結論は自作prototypeで小さく再検証する"
---

## raw_excerpt

本文要点の日本語メモ（原文の長文引用ではなく、収集時の言い換え）。作者 Echo は、初参加の game jam と初公開作品『Sunset Twist』について、審査順位と制作判断を対応づけている。visual は約4.4、audio は約3.8、theme / creativity は約4.0だった一方、enjoyment は約3.5。作者は、回転する独特な移動操作を自分には自然で気持ちよいものとして調整したが、playtester は入力が進行方向へどう影響するか分からず、難しさへの不満も繰り返したと記す。途中で control-stick 表示から上下方向を除いて左右だけにし、移動方向を示す矢印形の影を加えると、tester が向きを把握しやすくなったという。それでも難度を維持した点は、より易しい movement mode や assist option を用意すべきだった失敗として挙げている。

制作初日は最小 asset で physics を試し、level より先に movement feel を固めた。auto-tiling / terrain を早期に習得して床を短時間で変更できるようにし、prototype asset も締切時にそのまま使える見た目にした。一方、jam と無関係な plugin 改造に一日を失い、週半ばには壁との衝突で進行方向が乱れる問題から movement を全面 refactor した。原因は sphere collider を楕円にするため `transform.scale` を使ったことにあり、調査と修正で長時間停止した。物語面では暗い展開を終盤かつ secret route に置いたため、多くの player が短時間の通常 play ではそこへ到達せず、明るい arcade game と受け取った。作者は、初期 physics test、変更しやすい level tool、操作理解を助ける visual cue、tester の難度指摘、締切外の寄り道、重要な narrative cue の露出時期を、同じ一週間の工程として振り返っている。

## why_relevant_to_games

作者には自然になった独特な操作を初見者が読めない時、入力表示を増やすのでなく不要方向を削り、進行方向を世界内 cue で示した事例として使える。短期 prototype で game feel を先行させる利点と、難度・tool寄り道・終盤に隠した物語が評価へどう現れたかを同時に追える。
