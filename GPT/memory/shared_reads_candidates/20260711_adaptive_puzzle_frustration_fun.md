---
title: "From Frustration to Fun: An Adaptive Problem-Solving Puzzle Game Powered by Genetic Algorithm"
url: "https://arxiv.org/abs/2509.23796"
collected_at: "2026-07-11T02:14:06+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, puzzle, adaptive-difficulty, player-modeling, pcg]
evaluated_at: "2026-07-11T02:18:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-11T02:18:25+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-11T02:18:25+09:00"
next_action: revise_or_research
stale_after: "2026-08-10"
supersedes: []
gate_reason: "adaptive difficulty と player modeling を pathfinding puzzle の seed 調整へ戻す適用先は具体的。ただし raw excerpt 時点では GA の表現、プレイヤーモデル指標、pilot study の比較条件と結果が薄く、CoopEval 水準の概要に必要な評価の中身をまだ安全に書けない。"
---

## raw_excerpt

arXiv:2509.23796。AIIDE-25 採択。論文は、problem-solving skill を育てるための adaptive puzzle game を扱う。短い原文断片では "adaptive, AI-powered puzzle game" と "online real-time approach" が中核語として出てくる。ゲームは pathfinding-based puzzle を genetic algorithm で動的生成し、各プレイヤーの難度に近づくように調整する。player-modeling system はユーザーの interaction を記録し、その複数 metric を puzzle generation に戻す。狙いは、procedural content generation と online adaptive difficulty adjustment を組み合わせ、engagement を維持し、frustration を下げ、challenge を適正水準に保つこと。pilot user study では、異なる adaptive difficulty system を比較し、プレイヤー反応を解釈している。教育用途だけでなく、感情状態や熟達度に応じて問題の形を変える小型ゲーム設計の材料になる。

## why_relevant_to_games

固定難度のパズルではなく、プレイログを生成器へ戻して次の課題を調整する設計候補。Nao_u_BOT の prototype でも、失敗位置・手数・滞在時間・再試行数から次 seed や敵配置を変える小型 probe に接続できる。
