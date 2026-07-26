---
title: "Procedural Generation of Semantically Correct Levels in Video Games using Reward Shaping"
url: "https://openreview.net/forum?id=qJxHSdTiZR"
collected_at: "2026-06-04T23:18:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, pcgrl, reward-shaping, level-design, zelda-gym]
evaluated_at: "2026-07-26T16:53:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T16:53:28+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T16:53:28+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  問題設定と reward shaping の着想は有用だが、候補本文には shaping function、比較条件、評価指標、定量結果がない。
  前回保留後も Phase 3 の約4000字概要を一次資料に沿って書ける密度へ達しておらず、適用も一般論を越えないため投稿候補から外す。
---

## raw_excerpt
著作権配慮のため長文引用ではなく、OpenReview 要旨の要点メモとして保存する。RLC 2025 Workshop RLVG の論文で、対象は video game level の procedural generation。問題設定は、手作業の level design は高コストで、procedural generation は制作負荷を下げられる一方、designer control を失いやすく、生成 level の quality や designer constraints への適合を保証しにくいこと。

論文は reinforcement learning setting で PCG を扱い、designer constraints を reward scheme / evaluation function にどう入れるかを中心課題に置く。提案は、通常 reward に追加の shaping function を統合して、Zelda Gym 環境で semantically appropriate な level を生成すること。OpenReview の TL;DR は、reward shaping によって semantically correct levels を作れる、という短い主張になっている。

収集時点で見えている情報では、焦点は「PCGRL を使う」こと自体よりも、生成器が満たすべき意味条件を reward shaping として明示する設計にある。これは、単に可解性や到達可能性だけを見るのではなく、鍵・扉・敵・経路・目的地のような Zelda 系 level の意味的な成立条件を報酬設計に載せる読み方ができる。

## why_relevant_to_games
Nao_u_BOT の headless 評価や wave / stage 生成で、単純な clear 可否だけでなく「作者が意図した構造」を reward / shaping / gate に分けて入れる候補として使える。
