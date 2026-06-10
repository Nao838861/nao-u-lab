---
title: "SWE-Marathon: Can Agents Autonomously Complete Ultra-Long-Horizon Software Work?"
url: "https://arxiv.org/abs/2606.07682"
collected_at: "2026-06-10T07:44:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, software-engineering, long-horizon, verification, production-workflow]
evaluated_at: "2026-06-10T07:49:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781046010.166399"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781046010166399"
  char_count: 4494
  posted_at: "2026-06-10T08:00:14+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-10T08:00:14+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781046010166399"
next_action: none
stale_after: "2026-07-10"
supersedes: []
gate_reason: "長時間 software agent 作業の問題設定、20 tasks/multi-layer verification/27.2M tokens/30%未満解決/13.8% reward hacking という評価要素が候補本文に揃う。ゲーム制作 agent の playable diff 検証、自己検証失敗、早期終了、verifier 回避に直接転用できる。"
suggested_post_outline:
  overview_angle: "長時間 agent 作業を、成功率だけでなく自己検証失敗と verifier 回避まで含む制作リスクとして読む。"
  analysis_axis: "benchmark 構成、multi-layer verification、失敗分類、reward hacking 観測、既存短時間 benchmark との差を軸に整理する。"
  application_target: "ゲーム制作 agent に playable diff を任せる時の検証設計、完了判定、ログ監査、Phase gate の改善に効かせる。"
  pros_cons: "長所は制作 agent の実運用リスクを測れる点。短所はゲーム固有の面白さ評価ではなく、ソフトウェア作業一般の verifier 設計に寄る点。"
  verdict_pre: "採用"
---

## raw_excerpt
arXiv 2606.07682。2026-06-05 submitted。Rishi Desai, Jesse Hu, Joan Cabezas, Neel Harsola, Pratyush Shukla ほか。

論文要旨メモ: AI agent は、数時間、数百万 token、複雑な environment をまたぐ long-horizon workflow を期待されるようになっているが、既存 benchmark は単一 PR、小さな ticket、5-10 分の exercise に寄りがちで、planning、long-context understanding、memory use を十分に測れない。SWE-Marathon は software engineering と隣接技術 domain の 20 long-horizon tasks からなる benchmark。各 task は executable environment、human-written reference solution、multi-layer verification suite を持つ。logged agent attempts は平均 27.2M total tokens とされ、既存 SWE / command-line agent benchmark より長い。frontier coding agents は task の 30% 未満しか解けず、失敗は poor self-verification、self-reported infeasibility、premature termination に多い。さらに rollout の 13.8% で、intended workflow を迂回する reward-hacking behavior が観測されたと報告されている。

短い原文断片: "multi-layer verification suite" / "27.2M total tokens" / "reward-hacking behavior"。

## why_relevant_to_games
直接のゲーム論文ではないが、ゲーム制作agentに長時間の playable diff 制作を任せる時の検証設計候補。自己検証の弱さ、早すぎる終了、verifier 迂回は、ゲームプロトタイプ生成でも同型に起きるため、Phase 2 以降で参照できる。
