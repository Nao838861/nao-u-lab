---
title: "RescueBench: Can Embodied Agents Save Lives in the Wild?"
url: "https://arxiv.org/abs/2606.01848"
collected_at: "2026-06-09T11:14:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, embodied-agent, spatial-memory, benchmark, game-design]
evaluated_at: "2026-06-09T11:20:09+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1780971997.197559"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780971997197559"
  char_count: 3503
  posted_at: "2026-06-09T11:28:02+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-09T11:28:02+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780971997197559"
next_action: none
stale_after: "2026-07-09"
supersedes: []
gate_reason: |
  SAR を探索、救助、記憶誘導帰還、handoff の段階に分ける問題設定が明確で、長期タスクの失敗増幅を stage-level telemetry で見る着想も具体的。
  ゲーム制作では探索 bot、同伴 NPC、ステージ攻略 AI の評価単位に直結し、抽象論に留まらない。
  候補文だけでも投稿の骨格は立つが、Phase 3 では実験結果と失敗分析を補って概要密度を上げる。
suggested_post_outline:
  overview_angle: "未知環境の長期タスクを、能力別ベンチではなく SAR の連続ワークフローとして評価する軸で書く。"
  analysis_axis: "four-stage pipeline、stage-level evaluation、長期空間記憶、複合失敗の増幅を中心に分析する。"
  application_target: "探索ゲームやアクションゲームの bot 評価、NPC の帰還/受け渡し行動、stage-level telemetry 設計。"
  pros_cons: "メリットは失敗箇所を段階別に切り分けられること。デメリットは SAR 特化のためゲームの楽しさや意図的な迷いを直接測るわけではないこと。"
  verdict_pre: "部分採用。ベンチそのものではなく、段階分解と telemetry 設計をゲーム制作サイクルへ取り込む。"
---

## raw_excerpt
arXiv 2606.01848。2026-06-01 submitted。検索結果とローカル web_research の要旨では、Search-and-rescue (SAR) を、multimodal uncertainty のある未知環境探索、multi-stage interactions、long-horizon spatial memory retrieval を必要とする embodied-agent task として扱っている。既存 benchmark は各能力を個別に測ることが多く、現実的な workflow の中で失敗がどう複合するかが見えにくい。RescueBench は photo-realistic diagnostic benchmark として、SAR を four-stage pipeline に分解する: multimodal exploration、target rescue、memory-guided return、final handoff。sequential task composition と stage-level evaluation を組み合わせることで、長いタスクのどこで失敗が増幅するかを分析できるようにする。著者は Kui Wu, Beiyu Guo, Hao Chen, ShuHang Xu, Yuling Li。

## why_relevant_to_games
探索ゲームやアクションゲームのAI評価では、単発の成功率だけではなく「探索、目標到達、帰還、引き渡し」のような段階別失敗を見る必要がある。ゲーム用bot評価でも、stage-level telemetry と長期空間記憶の検証単位を設計する材料になる。
