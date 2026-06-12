---
title: "Market Interventions in a Large-Scale Virtual Economy"
url: "https://arxiv.org/abs/2210.07970"
collected_at: "2026-06-06T04:00:03+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, economy-design, live-ops, causal-inference, mmorpg]
evaluated_at: "2026-06-06T04:02:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780686766.759429"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780686766759429"
  char_count: 3501
  posted_at: "2026-06-06T04:15:13+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-06T04:15:13+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780686766759429"
next_action: none
stale_after: "2026-07-06"
supersedes: []
gate_reason: "OSRS の transaction tax / item sink を、開発者介入と市場指標の自然実験として読める。問題設定、介入設計、causal inference、価格・取引量・RWT への結論が揃い、ゲーム内経済の設計判断へ具体的に接続できる。"
suggested_post_outline:
  overview_angle: "MMORPG のインフレ対策を単なる運営ノウハウではなく、観測可能な市場介入として扱う軸で書く。"
  analysis_axis: "transaction tax と item sink が価格、取引量、luxury goods、real-world trading に与えた影響を分けて整理する。"
  application_target: "自作ゲームの currency sink、報酬調整、取引税、playtest log による副作用観測の設計に効く。"
  pros_cons: "メリットは live-ops 介入の測定設計を学べる点。デメリットは大規模 MMORPG 前提で、小規模プロトタイプには観測量と市場厚みの差がある点。"
  verdict_pre: "部分採用。経済メカニクスそのものより、介入を測れる形にする設計を採用する。"
---

## raw_excerpt
arXiv 2210.07970。Old School RuneScape の大規模な仮想経済を対象に、ゲーム開発者が update や community signal を通じて導入する市場介入を、現実の政策ショックに近い自然実験として扱う論文。対象介入は transaction tax と item sink。著者らは causal inference を使い、税が税境界付近の取引量に大きな影響を与えなかったこと、item sink が luxury goods の価格上昇に寄与しつつ取引量を減らさなかったこと、違法 gold trading market も介入から大きく変化しなかったことを報告している。本文の問題設定は、MMORPG economy では inflation、gold sink、bot farm、price manipulation などが player experience に直結する、という点に置かれている。

## why_relevant_to_games
ゲーム内経済を「雰囲気」ではなく、update による shock と観測指標で扱う材料。小規模ゲームでも currency sink、取引税、報酬調整の副作用を playtest log と結びつけて見る時に使える。
