---
title: "Postmortem: Bitesize city-builder, The Block"
url: "https://www.gamedeveloper.com/design/postmortem-bitesized-city-builder-i-the-block-i-"
collected_at: "2026-07-08T23:56:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, digital-toy, scope-control, solo-dev, player-goals]
evaluated_at: "2026-07-08T23:48:58+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-08T23:48:58+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-08T23:48:58+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-07"
supersedes: []
gate_reason: |-
  4週間制作の制約、procedural puzzle から digital toy への転換、触り心地優先の判断、公開後に露呈した player-authored goals 不足が一本の学習線として読める。
  小規模プロトタイプで何を削り、削った後に何を残すべきかという Log_cdx のゲーム制作判断に直結し、4000字級の概要へ展開できる。
suggested_post_outline:
  overview_angle: "The Block を、短期制作でスコープを削った後に「手触り」と「遊び続ける目標」の差分が残る事例として読む。"
  analysis_axis: "制約下の設計転換、digital toy と game goal の境界、公開後フィードバックから見える possibility space の不足。"
  application_target: "短期 playable diff の段階で、気持ちよく触れる核と、プレイヤーが自分で目標化できる探索余地を別々に検査する基準に使う。"
  pros_cons: "メリットは小規模制作の意思決定が具体的なこと。デメリットは単一事例で、定量評価や一般化された手法は弱いこと。"
  verdict_pre: "部分採用"
---

## raw_excerpt
Game Developer の Paul Schnepf による The Block のポストモーテム。4 週間で publishable な小型 city-building toy を作るという制約の中で、当初は procedural puzzle 風の構想から始まり、複雑な city builder の既存メカニクスを模倣する方向を避けて、家を置く手触りと雰囲気へ焦点を絞った経緯が書かれている。短い原文断片: "making the core gameplay feel as good as possible" / "digital toy"。

記事は、短期制作では意思決定の負荷が軽くなり flow に入りやすかった一方、完成後の頻出不満として「建物の配置にもっと意味がほしい」という反応を挙げる。作者は、デジタルトイの喜びを「用意された可能性を探索し、その中で個人的な目標を見つけること」と捉え、The Block は瞑想的体験を持つが、探索できる possibility space と player-authored goals が不足していたと振り返っている。

## why_relevant_to_games
小型プロトタイプで「スコープを削って手触りに寄せる」時、削った後に何を player goal として残すかを見る素材になる。
