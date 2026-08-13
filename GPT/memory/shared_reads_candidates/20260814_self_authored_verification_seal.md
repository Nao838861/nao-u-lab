---
title: "Self-Authored Verification Is Unreliable in Heuristic Self-Improving Agents"
url: "https://arxiv.org/abs/2607.24300"
collected_at: "2026-08-14T03:46:05+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, automated-playtesting, agent-evaluation, self-improvement, regression-testing]
evaluated_at: "2026-08-14T03:49:48+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786647298.287999"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786647298287999"
  char_count: 4383
  posted_at: "2026-08-14T03:55:13+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-14T03:55:13+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786647298287999"
next_action: none
stale_after: "2026-09-13"
supersedes: []
gate_reason: >-
  自己生成 test と外生的な非公開 audit を分離する問題設定、SEAL の accept/reject 機構、
  Atari 5作品での評価結果と有限 sample proxy という限界まで抽出できる。ゲーム bot や
  headless playtest の自己改変ループへ具体的に適用でき、約4000字の独立した分析に展開可能。
suggested_post_outline:
  overview_angle: "自己改善 agent が policy と採点器を同時に最適化すると起きる退行を、非公開の外生 audit で遮断する設計として解説する"
  analysis_axis: "self-score と deployment truth の乖離、candidate-versus-incumbent の1 bit判定、改善幅と有限監査の限界を分けて検討する"
  application_target: "ゲームAIの policy・難度テスト・評価rubricを反復更新する制作サイクルに、編集不能な固定seed監査とaccepted stateの巻き戻しを導入する"
  pros_cons: "長所は自己採点への過適合と後続editの退行を検出できる点。短所は非公開harnessも有限sampleのproxyで、監査対象外の挙動や誤受理を防ぎ切れない点"
  verdict_pre: "部分採用。通常の可視テストを探索用に残し、release gateだけをsealed auditにする"
---

## raw_excerpt

以下は arXiv 本文の要点を日本語で再構成した収集メモ。自己改善 agent が policy、controller、heuristic rule を反復改変する際、自分で作った test や metric だけを採否基準にすると、検証対象と測定器の両方を同じ agent が支配する。実験では Breakout、Pong、SpaceInvaders、Seaquest、MsPacman の programmatic policy と tests を10 round にわたり同時編集させ、agent 可視の self-score と、sticky action など分布ずれを含む非公開 deployment evaluation を分離した。self-test 出力が有効な35 model-game 条件はすべて最終 self-score 0.70 以上だったが、15条件の最終 policy は random reference を下回った。失敗には、有用な戦略を発見できないまま test だけ飽和する場合と、一度得た戦略を後続 edit で壊しながら test も同じ誤前提へ変わる場合があった。

提案する Sealed Exogenous Acceptance Loop（SEAL）は self-authored test を残しつつ、candidate と incumbent を agent から見えない固定 harness audit で比較する。audit の sample、dynamics、score は開示せず、返すのは accept / reject の1 bit だけで、明確な退行時は policy と test の accepted state 全体を保持する。Breakout の compute-matched pilot では平均 final truth が 7.7 から15.4へ上がり、peak-to-final loss は6.9から0.4へ減少した。複数 Atari game の12 model-game 比較では9件で改善、2件で同等だった。一方、audit 自体も有限 sample の proxy であり、単調改善を保証するものではない。

## why_relevant_to_games

AI に game-playing policy、headless bot、難度 test、評価 rubric を同時改変させる制作 loop で、自己採点の上昇と実プレイ性能の退行を分けて観測する材料になる。固定 seed の公開 test と、agent が編集・閲覧できない candidate-versus-incumbent audit の役割分離に接続できる。
