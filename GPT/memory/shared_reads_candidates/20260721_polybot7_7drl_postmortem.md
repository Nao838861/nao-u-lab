---
title: "Workflow and Design Behind Creating One Game from Another in a Single Week (7DRL Postmortem)"
url: "https://www.gamedeveloper.com/design/workflow-and-design-behind-creating-one-game-from-another-in-a-single-week-7drl-postmortem-"
collected_at: "2026-07-21T08:46:11+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, roguelike, postmortem, rapid-prototyping, scope-control, ui]
evaluated_at: "2026-07-21T08:51:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-21T08:51:47+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-21T08:51:47+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-20"
supersedes: []
gate_reason: |-
  既存基盤を再利用しながら一週間で別体験へ変える問題設定、機構の転用、UI の事前検証、途中の再設計、終盤の計測調整まで制作判断の因果が具体的に揃っている。
  80 時間超の実績と失敗・妥協も含み、短期プロトタイプで「何を再利用し、何を捨てるか」を約 4000 字で検証可能な密度がある。
suggested_post_outline:
  overview_angle: "既存ゲームの技術資産を足場にしつつ、体験の核だけを一週間で別物へ変換した 7DRL の意思決定記録"
  analysis_axis: "再利用による時間創出、mechanic の派生、UI 制約の先行検証、途中の scope 変更、計測による終盤調整を時系列で分析する"
  application_target: "Nao_u_BOT の短期ゲーム制作で、既存 prototype から派生作を作る際の reuse inventory、初日 mockup、cut line、最終日 telemetry の運用へ適用する"
  pros_cons: "長所は制作時間を新規体験へ集中できること。短所は既存設計の細部を引きずり、途中の機構変更が balance と content 時間を圧迫すること"
  verdict_pre: "部分採用"
---

## raw_excerpt

Josh Ge が Seven-Day Roguelike Challenge の一週間で、既存作『Cogmind』を土台に『POLYBOT-7』へ作り替えた80時間超の制作記録。新規 engine や基礎機能を作り直さず、熟知した codebase・tool・asset を再利用して、実験的な core mechanic と content に時間を寄せた。出発点の単純な demake 案は、周囲の item を磁石のように引き寄せる発想を得て、同じ世界を使いながら体験を大きく変える別ゲームへ転換された。一方、詳細設計が詰まり切っていないまま開始したため、途中で propulsion system の再設計や permanent upgrade の導入などが連鎖し、予定していた balance 日を content 実装へ振り替えることになった。

UI は制約となる106×30 gridへ収まるかを事前 mockup で検証し、不要な既存 window を削除せず画面外へ移して内部処理を残す、旧 console の表示結果だけを別の一行へコピーする、といった短期制作向けの迂回を採用した。色は新鮮さだけで決めず、damage の green→yellow→orange→red という既存の視覚文法を壊さないため main UI を green に残した。item category header の削除、slot type 制約の外見上の撤廃、propulsion 種類の削減など、表示面と rules の両方で選択肢を圧縮している。終盤の balance では debug output で weapon 出現率不足を確認し、最低出現割合を強制する応急調整も行った。

## why_relevant_to_games

既存ゲームから短期間で体験の異なる派生作を作る際に、再利用する基盤・先に mockup する制約・途中で捨てる複雑性・計測で補う終盤調整を具体的に追える。
