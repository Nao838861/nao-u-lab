---
title: "RescueBench: Can Embodied Agents Save Lives in the Wild?"
url: "https://arxiv.org/abs/2606.01848"
collected_at: "2026-06-16T14:14:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [embodied-agent, spatial-memory, exploration, evaluation, level-design]
evaluated_at: "2026-06-16T14:18:59+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T14:26:55+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781587493368129"
next_action: none
stale_after: "2026-07-16"
supersedes: []
posted:
  ts: "1781587493.368129"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781587493368129"
  char_count: 4057
  posted_at: "2026-06-16T14:26:55+09:00"
gate_reason: |-
  search-and-rescue を exploration / target rescue / memory-guided return / final handoff に分け、どの stage で失敗が伝播するかを見る設計が明確。
  difficulty control、episode generation、human / oracle / baseline 比較があり、探索ゲームや救助タスクの評価設計へ具体的に転用できる。
suggested_post_outline:
  overview_angle: "探索タスクを一枚の成功率ではなく stage-level diagnosis で読む benchmark として書く。"
  analysis_axis: "environmental complexity / clue ambiguity / spatial hierarchy と、exploration failure から spatial memory bottleneck への失敗伝播。"
  application_target: "探索・救助・帰還を含むレベル設計、AI プレイヤーテスト、空間記憶が必要なミッション評価。"
  pros_cons: "失敗原因を分解しやすい一方、photo-realistic benchmark 前提をゲーム内テストへ縮約する設計が必要。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv 2606.01848。Kui Wu, Beiyu Guo, Hao Chen, ShuHang Xu, Yuling Li, Yongdan Zeng, Zhoujun Li, Yizhou Wang, Fangwei Zhong による embodied agent benchmark。Search-and-rescue を、multimodal exploration、target rescue、memory-guided return、final handoff の 4 stage pipeline として組み、stage-level evaluation で失敗の伝播を見る。photo-realistic diagnostic benchmark として、environmental complexity、clue ambiguity、spatial hierarchy を変える 5 difficulty levels と、自動 episode generation / annotation pipeline を持つ。

検索結果と raw web research では、既存 benchmark は exploration、memory、multi-stage interaction を別々に測りがちで、合成した時にどこで破綻するかが見えにくい、という問題設定が記録されている。7 baselines、oracle reference、human players を評価し、最大難度では baseline が full task を完了できないとされる。stage-level diagnosis では autonomous exploration が主な失敗要因、spatial memory が独立した second bottleneck とされている。短い引用語句として "spatial memory retrieval" と "stage-level diagnosis"。

## why_relevant_to_games
探索ゲームや脱出・救助・帰還タスクを作る時、単に「目標を見つける」だけでなく「戻れるか」「手順がつながるか」を stage ごとに測る評価設計の材料になる。
