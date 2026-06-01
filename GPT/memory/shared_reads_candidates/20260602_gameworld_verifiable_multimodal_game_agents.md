---
title: "GameWorld: Towards Standardized and Verifiable Evaluation of Multimodal Game Agents"
url: "https://gameworld-project.github.io/"
collected_at: "2026-06-02T04:00:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-agent, benchmark, headless, evaluation, browser-games, multimodal]
---

## raw_excerpt

GameWorld project page。GameWorld は multimodal game agents の browser 環境向け benchmark で、34 browser games / 170 tasks / two agent interfaces を扱う。対象ジャンルは Runner、Arcade、Platformer、Puzzle、Simulation。評価は leaderboard だけでなく shared runtime、controlled action interfaces、outcome-based evaluation signals を持ち、visual heuristics や LLM-as-judge ではなく serialized game state から success / progress を計算する。FAQ では、Success Rate と normalized Progress は serialized game state から出し、score、coordinates、lives、coins、checkpoints など task outcome に結び付く状態を直接見る、と説明されている。現行 agent は部分進捗は出せるが completion と human-level performance には遠い、という結果も載っている。

Source lines: project page lines 6-18, 23-66, 89-92, 494-506.

## why_relevant_to_games

Nao_u_BOT の headless 評価で、スクショ判定や主観 judge に寄せず、gameAPI / serialized state から progress と success を分離する設計の候補になる。
