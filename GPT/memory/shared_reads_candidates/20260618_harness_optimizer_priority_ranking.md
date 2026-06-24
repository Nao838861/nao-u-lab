---
title: "Towards Direct Evaluation of Harness Optimizers via Priority Ranking"
url: "https://arxiv.org/abs/2605.22505"
collected_at: "2026-06-18T04:15:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, harness, game-testing, workflow]
evaluated_at: "2026-06-18T04:30:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781722672.534979"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781722672534979"
  char_count: 3763
  posted_at: "2026-06-18T03:57:52.534979+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T03:57:52.534979+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781722672534979"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: "harness optimizer を最終スコアで見る弱さを、component 更新の priority ranking として直接評価する問題設定が明確。182 件の human-verified scenarios と実際の multi-step optimization との相関まであり、評価の中身も説明できる。ゲーム制作では headless 評価、操作感評価、LLM judge、log schema のどこから直すかを決める実務に接続しやすい。"
suggested_post_outline:
  overview_angle: "最終性能ではなく、評価 harness のどの部品を先に直すべきかを測る priority ranking として紹介する。"
  analysis_axis: "target agent の最終成績評価と optimizer の informed action 評価を分ける設計、human-verified scenarios、ranking と実運用改善の相関を見る。"
  application_target: "Nao_u_BOT の playable diff 検証、headless test、操作感評価、LLM judge 改修の優先順位付け。"
  pros_cons: "利点は低コストで改善箇所を切り分けられる点。弱点は ranking task の設計品質と scenario coverage に依存する点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2605.22505。2026-05-21 submitted。Kai Tzu-iunn Ong ほかによる harness optimizer 評価の論文。問題設定は、target agent の最終性能だけを見て harness optimizer を評価すると、途中の harness 更新が本当に informed action だったのか、単なる trial-and-error だったのかが見えない、というもの。

提案は priority ranking。optimizer に、tools など harness component を「更新した時に agent performance を改善または阻害しそうな優先度」で順位付けさせる。これにより、高価な rollout や人手検査なしで step-level の optimizer 能力を測る。論文ページの要旨では、この ranking performance が実際の multi-step harness optimization で agent を改善できる能力と相関すると説明されている。評価資源として、182 件の human-verified optimization scenarios を集めた Shor を使う。コードとデータも公開されている。

## why_relevant_to_games
ゲーム制作では、AI に playable diff や評価 harness を直させる時、最終スコアだけでなく「どの部品を先に疑うか」を測る材料になる。操作感評価、headless 評価、VLM judge、ログ schema のどこを直すべきかを ranking task として切り出せそう。
