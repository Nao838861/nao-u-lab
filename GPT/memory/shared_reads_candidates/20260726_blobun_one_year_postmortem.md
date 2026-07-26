---
title: "One Year Of Blobun"
url: "https://cyansorcery.itch.io/blobun/devlog/1455287/one-year-of-blobun"
collected_at: "2026-07-26T16:48:23.3967710+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, puzzle, postmortem, difficulty, progression, launch, player-feedback]
evaluated_at: "2026-07-26T16:53:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785052956.135639"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785052956135639"
  char_count: 4131
  posted_at: "2026-07-26T17:02:36.135639+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-26T17:02:44+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785052956135639"
next_action: none
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  難易度の相反反応を achievement 到達率と optional puzzle の設計に結び、公開後の解答互換性、価格改定、販売実績まで同一作品で追えている。
  puzzle progression、telemetry、live maintenance、継続制作判断へ具体的に適用でき、固有の数値と判断過程を保った約4000字概要を構成できる。
suggested_post_outline:
  overview_angle: "発売後1年の定量値と作者判断をつなぎ、難易度設計・互換性・価格・次作判断を一つの運用記録として読む"
  analysis_axis: "相反する主観 feedback を achievement と optional challenge で分解した点、解答互換性を保つ保守、実測時間に応じた価格改定"
  application_target: "小型 puzzle prototype の必須導線と任意難問の分離、到達率 telemetry、公開後 patch の互換性 gate、継続制作の停止条件"
  pros_cons: "具体値と意思決定が揃う一方、単一作品の自己報告で因果比較や cohort 分析はない"
  verdict_pre: "部分採用"
---

## raw_excerpt

収集時の要点メモ（原文の長文引用ではない）。top-down puzzle game『Blobun』の発売1年後の記録。difficulty について「簡単すぎる」という反応がある一方、その2～3倍ほど「難しく、全 puzzle を解けない」という反応もあり、作者は player ごとの mechanic への適性差を観測している。設計目標は、必須 puzzle だけなら到達しやすく、望む人には難問を残すことだった。Steam achievement では game clear が29.2%、全 puzzle complete が21.7%、約3分の1が8 world 中の world 7 まで到達した。作者は progression が mechanic を露骨に説明せず教えられたという feedback も受けている。

release 後は、debug tool だった puzzle editor を player 向け機能にし、online puzzle integration、menu と視認性の改善、rule consistency の bug 修正を行った。既存 puzzle の解答が攻略動画と食い違わないよう layout 変更を避け、logic bug のあった1問も solution を維持したまま block を1マス動かした。価格は想定プレイ時間4～6時間に対し実測感が2.5～4時間で、発売時14.99ドルから9.99ドルへ変更。1年間の販売は Steam 1420本、itch 271本、platform fee と税引き後の収益は概算11700ドル。今後の追加 content より、小規模な次作を継続して出す判断を記している。

## why_relevant_to_games

平均 difficulty だけでなく optional challenge と到達率を分けて見る puzzle progression の実例。公開後の解答互換性、editor の製品化、価格と制作継続判断まで同じ作品の数字で追える。
