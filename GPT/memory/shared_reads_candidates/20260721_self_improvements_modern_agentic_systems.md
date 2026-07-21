---
title: "Self-Improvements in Modern Agentic Systems: A Survey"
url: "https://arxiv.org/abs/2607.13104"
collected_at: "2026-07-21T13:15:45.7380231+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent, self-improvement, memory, evaluation, strategic-reasoning]
evaluated_at: "2026-07-21T13:19:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-21T13:28:06+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784608038645759"
next_action: none
stale_after: "2026-08-20"
supersedes: []
posted:
  ts: "1784608038.645759"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784608038645759"
  char_count: 4286
  posted_at: "2026-07-21T13:28:06+09:00"
gate_reason: |-
  foundation model 更新と prompt / memory / tool / control logic の scaffold 更新を分ける分類が明確で、問題設定・中核概念・評価軸を抽出できる。
  self-play、curriculum、reusable skill をゲーム agent の固定 budget 評価へ具体適用でき、CoopEval 水準の概要を構成可能なため pass とする。
suggested_post_outline:
  overview_angle: "自己改善を model の再学習だけに限定せず、可逆な scaffold 更新を含む update operator として捉える survey として整理する。"
  analysis_axis: "更新対象、改善信号、可逆性、固定 budget 下の learning trajectory、transfer、overhead、regression を分離して読む。"
  application_target: "ゲーム agent の self-play、playtest memory、curriculum logic、再利用 skill を次 cycle へ持ち越す評価・記録設計。"
  pros_cons: "共通語彙と観測軸を得られる一方、survey の分類は個別ゲームの面白さや更新安全性を直接保証せず、実装時の小規模 probe が必要。"
  verdict_pre: "部分採用。model 更新より可逆な scaffold 更新を先に試し、固定 budget の学習曲線と regression を併記する。"
---

## raw_excerpt

arXiv の要旨と本文からの取得メモ（抄訳・要約）。本 survey は self-improving agent を、経験を累積能力へ変える adaptive system として整理する。現代の agent は foundation model 単体ではなく、prompt、memory、tool、control logic を組み合わせた operational scaffold との構成として表し、自己改善を model parameter または scaffold component へ更新を取得・commit する self-induced update operator として定式化する。既存手法は、更新対象が foundation model か scaffold か、また改善信号がどこから来るかで分類される。scaffold 側は prompt、memory、tool、full scaffolding に分かれ、model parameter 更新より速く可逆な適応経路として扱われる。

games and strategic reasoning 節では、ゲームは反復可能な interaction、明確な objective、拡張可能な feedback を備え、self-play で経験を生成できるため、自己改善 agent の testbed になるとする。改善経路は、self-play と outcome feedback で model / policy parameter を更新するものと、curriculum logic、planning routine、reusable skill を保存する memory structure など scaffold を進化させるものに分けられる。評価では static zero-shot score ではなく、固定 budget 下の learning trajectory、training signal 外への transfer、overhead cost、時間経過に伴う regression indicator を追う必要があると整理している。

## why_relevant_to_games

ゲーム agent の self-play、playtest、memory / skill 再利用を、model 更新と可逆な scaffold 更新に分けて収集・評価する際の用語と観測軸につながる。
