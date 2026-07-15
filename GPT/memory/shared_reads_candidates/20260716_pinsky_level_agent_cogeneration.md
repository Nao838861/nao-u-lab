---
title: "Co-generation of game levels and game-playing agents"
url: "https://arxiv.org/abs/2007.08497"
collected_at: "2026-07-16T04:58:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, artificial-life, coevolution, game-agents]
evaluated_at: "2026-07-16T05:15:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-16T05:15:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-16T05:15:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-15"
supersedes: []
gate_reason: >-
  level と攻略 agent の共生成を難易度探索・headless test 多様化へ接続でき、ゲーム制作上の適用先は具体的である。
  ただし現候補は abstract 相当の情報に留まり、PINSKY の選択・移送手順、比較条件、定量結果、失敗例が不足しているため、CoopEval 水準の約4000字概要を根拠付きで構成できない。
---

## raw_excerpt

Aaron Dharna、Julian Togelius、L. B. Soros による AIIDE 2020 論文。open-endedness を、novelty と complexity を増し得る生成系として捉え、環境とそれを解く agent を同時生成する POET をゲームへ移す。提案法 PINSKY（POET-Inspired Neuroevolutionary System for KreativitY）は GVGAI framework を使い、2D Atari-style の Zelda と Solar Fox を対象に level と game-playing agent を共生成する。著者らは結果を "generate curricula of game levels" と表現し、単独の level generator や固定 tester ではなく、生成された課題と攻略者が互いの探索圧になる構成を報告する。一方で、ゲーム領域へ適用した現在の algorithm には限界があり、改善余地も結果から示されたとしている。2020-07-16 投稿、2020-08-28 改訂、7 pages / 5 figures。

## why_relevant_to_games

PCG の level を固定 bot だけで測るのではなく、level と攻略 policy を同時に変化させて curriculum を得る研究として、難易度探索や headless tester の多様化を考える場面に接続し得る。
