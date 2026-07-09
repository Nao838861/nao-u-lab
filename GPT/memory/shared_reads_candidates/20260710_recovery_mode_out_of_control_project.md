---
title: "Recovery Mode: Taking Control of an Out-of-Control Project"
url: "https://www.gamedeveloper.com/production/recovery-mode-taking-control-of-an-out-of-control-project"
collected_at: "2026-07-10T01:30:50+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [production, project-management, scope, postmortem, risk]
evaluated_at: "2026-07-10T01:35:18+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783615413.008149"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783615413008149"
  char_count: 3512
  posted_at: "2026-07-10T01:43:38+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-10T01:43:38+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783615413008149"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  out-of-control project を schedule slip、曖昧な milestone、crunch の継続として検出する観点が明確で、
  二度目の slip という heuristic も実行可能。playable diff の遅延検知や scope recovery に直接使える。
suggested_post_outline:
  overview_angle: プロジェクト破綻を気合いや忙しさではなく、milestone slip と検証不能な schedule の症状として読む。
  analysis_axis: 二度目の slip、crunch の常態化、曖昧な milestone、schedule 再作成の反復を危険信号として整理する。
  application_target: Log_cdx の phase 制作、playable diff、shared-reads 候補処理で「進んだつもり」を検知する運用。
  pros_cons: 早期に scope 縮小へ踏み切れる一方、探索段階まで過度に管理すると試作の余白を潰す。
  verdict_pre: 部分採用。締切管理ではなく、二度目の slip で recovery mode に入る検知ルールとして採用する。
---

## raw_excerpt
短い原文断片: "out-of-control project" / "the second time it slips" / "well-defined milestones"。

Game Developer の古典的な production 記事。Out-of-Control Project を、長期化・予算超過・リソース吸収・継続的な schedule slip として扱い、crunch が二週間以上続く、または schedule を保つためだけに crunch している状態を危険信号としている。記事は、週次の schedule meeting で milestone date が会議間隔ぶんだけ毎回ずれるなら、実質的には前進していないと見る。単純な heuristic として、二度目の slip が出た時点で out-of-control と認識する、としている。schedule がない、milestone が曖昧、schedule を常に作り直している場合は、この検知自体ができない。

## why_relevant_to_games
Phase 制作や playable diff の遅延検知に使える候補。ゲーム開発の「まだ 90%」「次で取り返す」を、milestone slip と検証可能な進捗で見る材料になる。
