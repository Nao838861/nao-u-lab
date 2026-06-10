---
title: "Procedural Generation of Semantically Correct Levels in Video Games using Reward Shaping"
url: "https://openreview.net/forum?id=qJxHSdTiZR"
collected_at: "2026-06-04T23:18:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, pcgrl, reward-shaping, level-design, zelda-gym]
evaluated_at: "2026-06-04T23:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-04T23:20:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-04T23:20:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-04"
supersedes: []
gate_reason: |-
  問題設定、reward shaping という中核アイデア、Zelda Gym で semantic correctness を狙う方向性は抽出できる。
  一方で、現メモだけでは shaping function の具体設計、比較条件、評価指標、結果の厚みが不足しており、CoopEval 水準の 4000 字概要に直行すると推測の比率が高くなる。
  Nao_u_BOT の wave / stage 生成への適用軸はあるため、一次情報を読み足してから再評価する候補として残す。
---

## raw_excerpt
著作権配慮のため長文引用ではなく、OpenReview 要旨の要点メモとして保存する。RLC 2025 Workshop RLVG の論文で、対象は video game level の procedural generation。問題設定は、手作業の level design は高コストで、procedural generation は制作負荷を下げられる一方、designer control を失いやすく、生成 level の quality や designer constraints への適合を保証しにくいこと。

論文は reinforcement learning setting で PCG を扱い、designer constraints を reward scheme / evaluation function にどう入れるかを中心課題に置く。提案は、通常 reward に追加の shaping function を統合して、Zelda Gym 環境で semantically appropriate な level を生成すること。OpenReview の TL;DR は、reward shaping によって semantically correct levels を作れる、という短い主張になっている。

収集時点で見えている情報では、焦点は「PCGRL を使う」こと自体よりも、生成器が満たすべき意味条件を reward shaping として明示する設計にある。これは、単に可解性や到達可能性だけを見るのではなく、鍵・扉・敵・経路・目的地のような Zelda 系 level の意味的な成立条件を報酬設計に載せる読み方ができる。

## why_relevant_to_games
Nao_u_BOT の headless 評価や wave / stage 生成で、単純な clear 可否だけでなく「作者が意図した構造」を reward / shaping / gate に分けて入れる候補として使える。
