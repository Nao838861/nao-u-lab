---
title: "GUI Agents for Continual Game Generation"
url: "https://arxiv.org/html/2605.28258v1"
collected_at: "2026-06-10T03:29:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-playtesting, gui-agent, game-generation, evaluation, memory]
evaluated_at: "2026-06-10T03:32:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1779995803.583479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779995803583479"
  char_count: 3216
  posted_at: "2026-05-29T04:16:43.583479+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-10T03:45:00+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779995803583479"
next_action: none
duplicate_note: "Phase 3 duplicate check found an existing #shared-reads post for arXiv 2605.28258, so no duplicate message was sent."
stale_after: "2026-07-10"
supersedes: []
gate_reason: >-
  PlaytestArena / Play2Code は、ゲーム生成を one-shot artifact ではなく
  browser 上の実操作 playtest と修正 list の反復に変える点が明確。rubric pass-rate、
  baseline 比、episode/skill/world memory という評価・運用要素も揃い、4000字概要へ展開できる。
suggested_post_outline:
  overview_angle: "playable failure を GUI agent の実プレイで検出し、coding agent へ修正材料として戻す continual game generation の枠組み"
  analysis_axis: "PlaytestArena の task/rubric 設計、Play2Code の shared memory loop、pass-rate 改善、memory layer の役割"
  application_target: "Nao_u_BOT の browser playtest、headless smoke、Phase 3b/4a の playable diff 検証サイクル"
  pros_cons: "長所は実操作由来の失敗検出と fix list 化。短所は rubric 設計・GUI 操作安定性・小規模 HTML game への偏りが残ること"
  verdict_pre: "部分採用。GUI agent 全体ではなく、play summary / actionable fix list / episode memory の probe から採用"
---

## raw_excerpt
arXiv HTML の要旨では、ゲーム生成は「prompt から artifact への one-shot translation」では playable failure を検出できない、と問題設定している。提案は GUI agent を 2 つの役割で使う構成。1 つ目は PlaytestArena で、200 個の browser-based game generation tasks を 8 genre にまたがって用意し、各 task に expected in-play behaviors の rubric を付け、GUI agent が browser で build を開いて実際に play しながら rubric を判定する。2 つ目は Play2Code で、game agent と GUI agent が shared memory を持つ sustained loop を作り、game generation を coding と playing の対話に変える。論文は Play2Code が 66.8% rubric pass-rate を達成し、single-pass baseline より 37.1 points、agentic-coding baseline より 14.6 points 改善したと述べる。本文では、game agent が HTML game を生成・patch し、GUI agent が build を play して play summary と actionable fix list を episode memory に書き、次 round の修正材料にする流れが説明されている。memory は episode / skill / world の 3 layer で、round 内の試行、cross-task の実装・操作知、一般的な game rules や design principles を分けて蓄積する。

## why_relevant_to_games
Nao_u_BOT の headless / browser playtest loop と直接つながる。特に「compile では見えない playable failure」を GUI agent の操作ログと fix list に落とす設計は、Phase 3b/4a の probe 材料になる。
