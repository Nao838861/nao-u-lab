---
title: "Reasoning effort, not tool access, buys first-try reliability in agentic code generation: an observational study"
url: "https://arxiv.org/abs/2607.02436v1"
collected_at: "2026-07-23T10:47:11.6281902+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, game-development, coding-agent, evaluation, harness, visual-quality]
evaluated_at: "2026-07-23T10:56:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784772269.706609"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784772269706609"
  char_count: 4426
  posted_at: "2026-07-23T11:04:47+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-23T11:04:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784772269706609"
next_action: none
stale_after: "2026-08-22"
supersedes: []
gate_reason: >-
  90回の同一課題、機能rubric、視覚評価、初回成功率、コストを用いてtool・reasoning effort・design promptの寄与を分離しており、手法・評価・限界を具体的に説明できる。
  HTMLゲーム試作の初回playable diff、見た目改善、deployment失敗を別々に扱う運用へ直結し、単一課題の観察研究という限界を含めてもCoopEval水準の分析材料がある。
suggested_post_outline:
  overview_angle: "coding agentへの能力追加を一括で評価せず、機能成功・初回信頼性・見た目・コストの別軸で予算配分を読む"
  analysis_axis: "reasoning effort、testing tool、design directiveの効果差と、単一web課題・非完全要因計画による外的妥当性の限界"
  application_target: "Log_cdxのHTMLゲーム試作で、最初のplayable diffには推論予算、視覚磨きには短いdesign directive、browser検証には観測可能な判定項目を割り当てる運用"
  pros_cons: "初回成功率とコストの具体値で判断できる一方、ゲーム固有課題や多様なrepositoryへ一般化できるとは限らない"
  verdict_pre: "部分採用"
---

## raw_excerpt

Achint Mehta による観察研究。詳細な同一仕様からリアルタイムのレトロスペクティブボードを作る独立した90回の agent run を用意し、14項目・42点満点の機能 rubric と visual quality review で比較した。条件には複数世代のモデル、2種類の agent harness、2段階の reasoning effort、ブラウザベースの testing tool、2種類の design-oriented prompt が含まれる。frontier model は上限付近へ集まる一方、低価格の local model は24〜37点だった。初回失敗で最大だったのは container deployment で、全runの44%が失敗した。testing tool の追加はコストを42〜68%増やしたが、機能点や信頼性、UI上で見える項目の改善には結び付かなかった。reasoning effort を High から xHigh へ上げると、初回完全成功が28%から89%へ増え、修正promptは約5分の1になり、追加コストは9〜29%だった。design-oriented prompt は機能点を上げず、visual quality を5点満点の3.0から4.5へ上げたうえ、その効果はdirectiveを1段落に言い換えても再現した。論文は、失敗の種類に応じて対策を変える必要があり、観測された初回失敗の多くは表示確認toolで見つける問題より、推論の弱さに由来したと述べる。

## why_relevant_to_games

coding agent にゲーム試作を作らせる際、実装成功・見た目・デプロイ失敗を分離して測り、ブラウザ確認tool、推論強度、design promptのどれへ予算を配るか決める場面に接続できる。
