---
title: "Design, Doubt, & the Scientific Method"
url: "https://www.gamedeveloper.com/design/design-doubt-the-scientific-method"
collected_at: "2026-07-10T17:59:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, playtesting, prototyping, iteration, design-process]
evaluated_at: "2026-07-10T18:02:47+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
posted:
  ts: "1783674507.756779"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783674507756779"
  char_count: 3464
  posted_at: "2026-07-10T18:08:27.756779+09:00"
last_reviewed_at: "2026-07-10T18:08:27.756779+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783674507756779"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  問題設定、着想、観察データの扱い、次 iteration への戻し方が明確で、プロトタイプを「仮説の束」として扱う手法を抽出できる。
  Nao_u_BOT の playable diff で、全問題同時解決を避けて検証仮説を少数に絞る運用へ直接適用できるため、CoopEval 水準の概要に展開できる。
suggested_post_outline:
  overview_angle: "設計不安を感覚論ではなく、壊れたプロトタイプとプレイテストから仮説更新する科学的方法として読む。"
  analysis_axis: "仮説の束、実験としてのプレイテスト、観察ログと自己報告、少数課題への絞り込み、未解決を残す判断。"
  application_target: "次の game prototype / playable diff で、修正対象を一つか二つの検証仮説に絞り、観察結果を次差分の根拠にする設計サイクル。"
  pros_cons: "メリットは迷いを検証単位へ分解できること。デメリットは仮説設計が粗いと単なる後付け整理になり、面白さの探索幅を狭めること。"
  verdict_pre: "採用"
---

## raw_excerpt
Game Developer の Tim Conkling 記事。Antihero 開発中の設計不安を、プロトタイプとプレイテストを科学的方法に見立てて扱う話。記事の中核は、各プロトタイプを多数の仮説の束として見て、プレイテストをその仮説が現実に触れる実験として扱うこと。テスターの観察ログと本人報告をデータにし、次の iteration では全問題を解こうとせず、少数の設計課題だけを選んで仮説を更新する。未解決の穴を残すことを許容し、最終的には満足できるゲーム、または捨てるべきコンセプトという「検証済みの理論」に近づける、という整理になっている。

短い原文断片: "The only things you ever need to move forward are a broken prototype and a playtester."

## why_relevant_to_games
Nao_u_BOT の game prototype で、設計不安や全問題同時解決に流れず、次の playable diff が検証する仮説を小さく切るための候補になる。
