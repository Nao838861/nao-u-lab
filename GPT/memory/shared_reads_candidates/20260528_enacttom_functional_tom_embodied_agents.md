---
title: "EnactToM: An Evolving Benchmark for Functional Theory of Mind in Embodied Agents"
url: "https://arxiv.org/abs/2605.09826"
collected_at: "2026-05-28T15:14:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, multi-agent, theory-of-mind, benchmark, embodied-games]
evaluated_at: "2026-05-28T15:23:34+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
posted:
  ts: "1779950438.133899"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779950438133899"
  char_count: 3549
  posted_at: "2026-05-28T15:40:58.1167816+09:00"
stale_after: "2026-06-27"
supersedes: []
gate_reason: |-
  literal belief probe と functional ToM の差、partial observability / private information / constrained communication、formal verification、失敗分析まで揃っている。
  協力ゲームや非対称情報ゲームで「相手が何を知り、何を伝えるべきか」を評価する具体軸に転用しやすい。
  4000 字概要では、Pass^3 0.0% と失敗の 93% が coordination breakdown という評価結果を核にできる。
suggested_post_outline:
  overview_angle: "ToM を質問応答能力ではなく、情報非対称下で相手の制約を踏まえて行動完遂する能力として評価する。"
  analysis_axis: "literal ToM benchmark への批判、functional task 設計、epistemic depth の検証、hard split 結果、失敗分類の順に見る。"
  application_target: "協力パズル、ステルス、非対称マルチ、AI teammate の通信・役割分担・制約理解の評価設計。"
  pros_cons: "評価軸がゲーム制作に近い一方、3D household task 由来なのでジャンル転用時は情報状態と通信制約の再設計が必要。"
  verdict_pre: "採用"
---

## raw_excerpt
arXiv 2605.09826。既存の Theory of Mind benchmark は、直接的な belief question に答えさせる literal ToM に偏り、partial observability、private information、constrained communication の下で相手の implicit belief を使って最適行動できるかという functional ToM は十分に測れていない、という問題設定。EnactToM は 3D household 環境の 300 embodied multi-agent tasks で構成され、各 task は solvability と required epistemic depth が formal verification される。hard split では、評価された 7 frontier models が functional task completion で 0.0% Pass^3、literal belief probe では平均 45.0%。失敗分析では sampled failures の 93% が、情報を伝えない、相手の制約を無視する、message allocation を誤るといった epistemic coordination breakdown に由来する。短い原文メモ: "functional ToM", "epistemic coordination breakdowns"。

## why_relevant_to_games
協力ゲームや情報非対称ゲームで、NPC/AI teammate が「知っていること」「伝えるべきこと」「相手が動ける制約」を扱えるかを見る評価軸として使えそう。3D 家庭環境だが、ステルス、協力パズル、非対称マルチにも転用可能。
