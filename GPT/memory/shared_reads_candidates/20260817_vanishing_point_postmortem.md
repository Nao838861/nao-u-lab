---
title: "Vanishing Point Postmortem"
url: "https://www.gamedeveloper.com/design/vanishing-point-postmortem"
collected_at: "2026-08-17T19:30:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, puzzle, mechanics, playtesting, postmortem, production]
evaluated_at: "2026-08-17T19:35:02.8201415+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-17T19:35:02.8201415+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-17T19:35:02.8201415+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-16"
supersedes: []
gate_reason: >-
  単一 mechanic の downscope、authored puzzle が生む誤学習を検出する頻繁な playtest、可逆な level tool、浅い core prototype の失敗が一つの制作記録で因果的につながっている。
  11か月・最大23人・20 encounter という制作規模と具体例があり、ゲーム制作の着手ゲートと level iteration へ無理なく適用でき、CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "単一 mechanic を20 encounterへ展開した成功と、core prototype不足・曖昧な creative directionが長期化を招いた失敗を同じ制作工程として解く"
  analysis_axis: "mechanic depthの事前検証、authored puzzleの誤学習、変更を速く戻せるtooling、downscopeの相互作用"
  application_target: "Log_cdxの新規ゲーム着手時のcore-loop prototype gateと、level追加ごとの誤学習playtest・revert可能な制作サイクル"
  pros_cons: "具体的な制作判断と失敗因果を転用しやすい一方、単一学生projectの回顧であり定量比較や商用規模への一般化には限界がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

著作権に配慮し、長文引用ではなく本文の要点メモとして保存する。Kevin Wong が、2015 年の USC Advanced Games Project『Vanishing Point』で lead designer を務めた経験を振り返る postmortem。作品は、物体の大きさと質量を操作して puzzle を解く first-person puzzle platformer で、制作期間は 11 か月、スタッフは最大 23 人だった。

本文では、player-controlled ability と、それを使う level を削って単一 mechanic の探索へ集中したこと、400×400 の tile editor により level 変更を素早く test・revert できたことを「うまくいった点」として挙げる。authored puzzle では emergent behavior が誤った推論をプレイヤーに教え得るため、頻繁な playtest で必要情報と道具の提示、進行の区切りを調整した。初期には mechanic 全体が機能していないと分かり、既存物を捨てて作り直した結果、学習しやすく design の余地が広い形になった。全体は 20 encounter で、stasis field、質量依存 button、破壊可能 mesh を組み合わせ、scale mechanic の性質を展開した。

一方で、creative direction が曖昧なまま tone・theme・purpose が揺れ、新 engine の習熟で exploratory phase が長期化した。さらに core mechanic の prototype が不足し、level や追加 mechanic を組み立てる土台として浅いまま substantial project に進んだ、と失敗点を記録している。

## why_relevant_to_games

単一 mechanic を level へ展開する際の downscope、誤学習を見つける playtest、素早く戻せる level tool、core prototype の深さを制作開始前に確認する場面の参照になる。
