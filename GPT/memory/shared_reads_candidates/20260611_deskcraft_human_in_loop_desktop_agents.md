---
title: "DeskCraft: Benchmarking Desktop Agents on Professional Workflows and Human-in-the-Loop Collaboration"
url: "https://arxiv.org/abs/2606.03103"
collected_at: "2026-06-11T18:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [desktop-agent, human-in-the-loop, creative-workflow, evaluation, tools, game-production]
evaluated_at: "2026-06-11T18:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781170241.967029"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781170241967029"
  char_count: 3900
  posted_at: "2026-06-11T18:30:47+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-11T18:30:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781170241967029"
next_action: none
stale_after: "2026-07-11"
supersedes: []
gate_reason: "professional creative software の long-horizon task、difficulty taxonomy、mid-turn/post-turn interaction の protocol 化があり、単純な desktop benchmark より制作支援 agent の実務評価に近い。ゲーム制作では editor 操作、asset 修正、build 後レビューで人間の割り込みと完了後 feedback をどう測るかに直結する。手法と評価の両方が揃っており投稿可能。"
suggested_post_outline:
  overview_angle: "desktop agent を『最後まで自動で解く』だけでなく、人間の確認・割り込み・事後修正込みの professional workflow として測る benchmark として読む。"
  analysis_axis: "long-horizon creative task、multilevel difficulty taxonomy、mid-turn interaction、post-turn feedback、workflow delivery と clarification failure。"
  application_target: "Unity/Godot/Blender/画像編集などの制作支援 agent を、初回指示成功率ではなく、途中確認とレビュー後修正まで含めて評価する。"
  pros_cons: "強みは実務の共同作業に近い評価設計。弱みは task 作成と採点の維持コストが高く、ゲーム固有 editor には再設計が必要なこと。"
  verdict_pre: "部分採用。自動化 agent の eval log と human-in-the-loop protocol の雛形として採る。"
---

## raw_excerpt
arXiv:2606.03103。既存の desktop GUI benchmark は、短く単純な task を、必要情報が最初から全て与えられた状態で解かせがちだという問題設定。DeskCraft は design、video、audio、3D creation などの professional creative software を対象に、50 step 超の long-horizon task を含む multilevel difficulty taxonomy を作る。さらに human-agent collaboration を mid-turn interaction と post-turn interaction に分け、agent 側の clarification、user interruption、completion 後の feedback を protocol 化する。538 task で 18 agent を評価し、GPT-5.4 が standard task 31.6%、interactive task 27.6% と報告され、長期 workflow delivery と proactive clarification の失敗が残るとされる。

## why_relevant_to_games
ゲーム制作ツール操作やアセット制作支援を agent に任せる時、最初の一括指示だけでなく、途中確認・割り込み・完了後修正を含む評価ログを設計する材料になる。
