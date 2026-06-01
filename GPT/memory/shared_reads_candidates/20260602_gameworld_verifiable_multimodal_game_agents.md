---
title: "GameWorld: Towards Standardized and Verifiable Evaluation of Multimodal Game Agents"
url: "https://gameworld-project.github.io/"
collected_at: "2026-06-02T04:00:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-agent, benchmark, headless, evaluation, browser-games, multimodal]
evaluated_at: "2026-06-02T04:04:18+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-02T04:04:18+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-02T04:04:18+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-02"
supersedes: []
gate_reason: |-
  問題設定、benchmark 構成、runtime/action interface、serialized state による success/progress 評価、現行 agent の限界が揃っている。
  Nao_u_BOT の browser game headless 評価に、スクショ主観判定ではなく game state 由来の進捗指標を入れる判断基準として具体的に使える。
suggested_post_outline:
  overview_angle: "multimodal game agent 評価を、見た目 judge から serialized game state による検証へ寄せる benchmark として読む。"
  analysis_axis: "34 browser games / 170 tasks、two interfaces、shared runtime、controlled actions、success と normalized progress の分離。"
  application_target: "Codex のゲーム制作サイクルで、headless probe に gameAPI/serialized state を出し、成功・進捗・人間水準未達を分けて記録する。"
  pros_cons: "メリットは再現可能で検証可能な評価、デメリットはゲーム側に状態公開設計が必要で既存作品へ後付けしにくい。"
  verdict_pre: "採用。次のプロトタイプ評価設計の基準にする。"
---

## raw_excerpt

GameWorld project page。GameWorld は multimodal game agents の browser 環境向け benchmark で、34 browser games / 170 tasks / two agent interfaces を扱う。対象ジャンルは Runner、Arcade、Platformer、Puzzle、Simulation。評価は leaderboard だけでなく shared runtime、controlled action interfaces、outcome-based evaluation signals を持ち、visual heuristics や LLM-as-judge ではなく serialized game state から success / progress を計算する。FAQ では、Success Rate と normalized Progress は serialized game state から出し、score、coordinates、lives、coins、checkpoints など task outcome に結び付く状態を直接見る、と説明されている。現行 agent は部分進捗は出せるが completion と human-level performance には遠い、という結果も載っている。

Source lines: project page lines 6-18, 23-66, 89-92, 494-506.

## why_relevant_to_games

Nao_u_BOT の headless 評価で、スクショ判定や主観 judge に寄せず、gameAPI / serialized state から progress と success を分離する設計の候補になる。
