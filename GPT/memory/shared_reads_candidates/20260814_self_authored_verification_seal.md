---
title: "Self-Authored Verification Is Unreliable in Heuristic Self-Improving Agents"
url: "https://arxiv.org/abs/2607.24300"
collected_at: "2026-08-14T03:46:05+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, automated-playtesting, agent-evaluation, self-improvement, regression-testing]
---

## raw_excerpt

以下は arXiv 本文の要点を日本語で再構成した収集メモ。自己改善 agent が policy、controller、heuristic rule を反復改変する際、自分で作った test や metric だけを採否基準にすると、検証対象と測定器の両方を同じ agent が支配する。実験では Breakout、Pong、SpaceInvaders、Seaquest、MsPacman の programmatic policy と tests を10 round にわたり同時編集させ、agent 可視の self-score と、sticky action など分布ずれを含む非公開 deployment evaluation を分離した。self-test 出力が有効な35 model-game 条件はすべて最終 self-score 0.70 以上だったが、15条件の最終 policy は random reference を下回った。失敗には、有用な戦略を発見できないまま test だけ飽和する場合と、一度得た戦略を後続 edit で壊しながら test も同じ誤前提へ変わる場合があった。

提案する Sealed Exogenous Acceptance Loop（SEAL）は self-authored test を残しつつ、candidate と incumbent を agent から見えない固定 harness audit で比較する。audit の sample、dynamics、score は開示せず、返すのは accept / reject の1 bit だけで、明確な退行時は policy と test の accepted state 全体を保持する。Breakout の compute-matched pilot では平均 final truth が 7.7 から15.4へ上がり、peak-to-final loss は6.9から0.4へ減少した。複数 Atari game の12 model-game 比較では9件で改善、2件で同等だった。一方、audit 自体も有限 sample の proxy であり、単調改善を保証するものではない。

## why_relevant_to_games

AI に game-playing policy、headless bot、難度 test、評価 rubric を同時改変させる制作 loop で、自己採点の上昇と実プレイ性能の退行を分けて観測する材料になる。固定 seed の公開 test と、agent が編集・閲覧できない candidate-versus-incumbent audit の役割分離に接続できる。
