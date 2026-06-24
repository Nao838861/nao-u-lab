---
title: "Do More Agents Help? Controlled and Protocol-Aligned Evaluation of LLM Agent Workflows"
url: "https://arxiv.org/abs/2606.05670"
collected_at: "2026-06-18T04:15:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, evaluation, workflow, agent-design]
evaluated_at: "2026-06-18T04:30:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781722674.499209"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781722674499209"
  char_count: 3803
  posted_at: "2026-06-18T03:57:54.499209+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T03:57:54.499209+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781722674499209"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: "single-agent、fixed MAS、evolving MAS を同じ execution/logging protocol で比較する問題設定が明確で、複数 agent が常に良いわけではないという結論も制作運用に効く。benchmark loader、tool access、answer contract、usage accounting、trajectory logging の統制点が具体的で、4000字概要に必要な要素を抽出できる。Log/Mir/Ash/log_cdx の役割分担を評価する基準として直接適用できる。"
suggested_post_outline:
  overview_angle: "agent 数を増やすこと自体ではなく、同一 protocol で single と multi を比較する評価設計として紹介する。"
  analysis_axis: "protocol alignment、workflow 種別、accuracy-cost trade-off、external GAIA study の扱いを見る。"
  application_target: "Log/Mir/Ash/log_cdx の分担、game-rights feedback、playable diff 評価、shared-reads 投稿品質の比較実験。"
  pros_cons: "利点は multi-agent 導入判断を計測に戻せる点。弱点は benchmark task と実制作タスクの距離を別途補正する必要がある点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2606.05670。2026-06-04 submitted。Yuhang Fu ほかによる BenchAgent 論文。問いは、benchmark loader、tool access、answer contract、usage accounting、trajectory logging を揃えた時に、agent 数を増やすことが本当に LLM workflow を改善するのか、というもの。

BenchAgent は single-agent、fixed multi-agent systems、evolving multi-agent systems を、同じ execution と logging protocol の下で比較する評価枠組み。十種類の reasoning、coding、tool-use benchmark を GPT-4.1 で評価し、別に protocol-aligned external GAIA study も報告する。検索結果の要旨では、substrate-internal 条件では 6 種の MAS のうち、benchmark-balanced average accuracy で matched single-agent anchor を明確に超えたものは多くなく、複数 agent は accuracy-cost trade-off で高くつく場合がある。一方で PAE GAIA snapshot では Claude-Code-style runtime workflow が強い結果を出したとされる。

## why_relevant_to_games
Nao_u_BOT の Log/Mir/Ash/log_cdx 分担や、ゲーム制作時の複数 agent 評価を「人数を増やすほど良い」と見ないための材料。playable diff、操作感評価、記憶 recall、投稿品質のどこに single-agent と multi-agent の差が出るかを揃えた protocol で測る発想につながる。
