---
title: "Come Closer, It's Cold — Postmortem: My First Game in 2 Weeks"
url: "https://itch.io/blog/1561059/come-closer-its-cold-postmortem-my-first-game-in-2-weeks"
collected_at: "2026-07-26T03:31:27+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, ai-assisted-development, balancing, onboarding, simulation]
evaluated_at: "2026-07-26T03:43:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-26T03:43:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-26T03:43:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  感情目標から scope を削る判断、parameter dashboard、条件あたり 300～500 回の Monte Carlo、五夜の難度曲線が具体的に接続されている。
  text tutorial が hold 操作を伝えられなかった失敗と、数理 balance では補えない animation の不足もあり、方法・評価・限界・結論を記事固有の密度で展開できる。
  AI 実装と人間の設計判断の境界を、短時間 prototype の実工程へ無理なく適用でき、約 4000 字の残すべき概要を構成できる。
suggested_post_outline:
  overview_angle: "初作品を二週間で完成させた過程を、感情起点の scope 制御、Monte Carlo balance、onboarding 失敗の三層で読む。"
  analysis_axis: "mechanic 過多の GDD を捨てた判断、五夜の pressure curve を parameter simulation で作る方法、数理上の正しさと初見 UX・生命感のずれを分けて分析する。"
  application_target: "短時間ゲーム prototype の one-loop 定義、headless simulation による難度 proxy、Night/Stage ごとの圧力曲線、操作を実行するまで進めない onboarding gate に適用する。"
  pros_cons: "少ない実装で balance 仮説を大量試行できる一方、simulation は操作理解・感情・animation の手触りを測れず、実プレイ観察との二段評価が必要。"
  verdict_pre: "部分採用。one loop / one feeling と Monte Carlo は採用し、tutorial と生命感は別の観察系で検証する。"
---

## raw_excerpt

原文の重要部分を日本語で言い換えた収集メモ。作者は、凍った精霊を焚き火で温めながら五夜を生き延びる約9分の browser game を、初作品として二週間で完成させた。コードは AI に実装させ、game design、物語、音楽システム、balance は自分で担当した。着想は mechanic からではなく「穏やかだが incremental の反復報酬がある感情」を先に置き、三つの案を捨てた後、焚き火そのものを player character にする構図へ到達した。

難度調整では decay rate、精霊の cost、天候倍率、wood economy を dashboard にまとめ、parameter を少しずつ変えながら一条件あたり300～500回の Monte Carlo simulation を行った。Night 1 を tutorial、2～3を圧力導入、4を意図的な壁、5を scripted ending とする曲線を作った。一方、tutorial text を用意しても「焚き火を click ではなく hold する」操作が伝わらず、作者は説明よりも、その action を実行するまで進行しない onboarding が必要だったと振り返る。

事前には mechanic を八つ持つ GDD を三本書いたが、相互作用と実装量が膨らんで全て破棄した。記事中の短い原則は “One loop. One feeling. Ship that.”。また、数理的な balance が意図通りでも、静止画中心の森は生命感を欠き、animation と反復 play による「どこで完成とするか」の感覚は別の課題として残った。

## why_relevant_to_games

AI 実装で制作障壁を下げても、感情目標、scope、難度 proxy、初見操作、animation の不足は別々に検証する必要がある。短い game loop に Monte Carlo と実プレイ観察をどう接続するかを考える一次事例になる。
