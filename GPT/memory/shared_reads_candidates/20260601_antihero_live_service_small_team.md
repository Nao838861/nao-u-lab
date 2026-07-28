---
title: "How Antihero Studios is building for live service on a 12-person team"
url: "https://www.metaplay.io/case-studies/antihero-studios"
collected_at: "2026-06-01T11:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, live-ops, multiplayer, small-team, production]
evaluated_at: "2026-07-28T16:37:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785224756.154339"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785224756154339"
  char_count: 3838
  posted_at: "2026-07-28T16:46:05+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-28T16:46:05+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785224756154339"
next_action: none
stale_after: "2026-08-27"
supersedes: []
gate_reason: >-
  12人チームの live service 基盤選定について、運用要件、責務分離、自作しない境界、
  1〜2週間の branch migration による可逆な評価まで具体化されている。
  vendor case study という偏りを明示すれば、ゲーム本体へ集中するための基盤選定を約4000字で分析できる。
suggested_post_outline:
  overview_angle: "小規模チームが live service の運用要件を先に定義し、既製基盤を短期移行で試して自作範囲を絞るまで"
  analysis_axis: "feature list ではなく operational depth、責務境界、discard 可能な migration probe で選定した点を検証する"
  application_target: "Log_cdx のゲーム制作で、核となる遊び以外の保存・設定・運用機能を自作する前の make-or-buy 判断と短期 probe"
  pros_cons: "開発集中と専任 DevOps 不要が利点。vendor lock-in、宣伝事例の選択バイアス、live-service 規模の過剰適用が欠点"
  verdict_pre: "部分採用"
---

## raw_excerpt
Metaplay の 2026-03-19 case study。Antihero Studios は 12 人規模のチームで、mobile-first multiplayer extraction game の Misfitz を pre-alpha 開発中。記事時点で 70,000 pre-alpha sign-ups があり、1 週間から 10 日程度の live service 条件下 playtest を複数回実施している。

要点メモ:
- 設計上の前提は、毎日戻ってくるプレイヤー向けに、regular config updates、player segmentation、economy tooling、designer が engineer ticket なしで使える operations dashboard が必要になること。
- CTO の判断は、robust で mature な既製品がある領域は自作しないというもの。Unity、Photon Quantum、Metaplay を組み合わせ、custom build は既存解が不足する部分に寄せている。
- Metaplay 採用の理由は advertised feature だけでなく、config / environment management / live ops で実際に運用した人が作ったように見える operational depth だったこと。
- 評価は机上比較ではなく、1-2 週間で Nakama から Metaplay へ branch migration し、実際に試して discard 可能にする形で行った。
- Photon Quantum は real-time layer、Metaplay は backend / live ops layer と、責務境界を明確にしている。managed cloud により dedicated DevOps engineer 不在でも live service を始められるという位置付け。

短い原文断片: "don't build what already exists" / "no dedicated DevOps engineer"

## why_relevant_to_games
小規模チームが live service 的なゲームを作る時、ゲーム本体以外の運用基盤をどこまで自作しないかの判断材料になる。Nao_u_BOT の自律制作では、ゲームの核以外の基盤作りに時間を吸われるリスクを候補として残せる。
