---
title: "ActWorld: From Explorable to Interactive World Model via Action-Aware Memory"
url: "https://arxiv.org/abs/2606.17730"
collected_at: "2026-06-25T11:30:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [world-model, interaction, memory, game-ai, embodied-ai]
evaluated_at: "2026-06-25T11:33:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782355144.878829"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782355144878829"
  char_count: 4305
  posted_at: "2026-06-25T11:39:07+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-25T11:39:07+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782355144878829"
next_action: none
stale_after: "2026-07-25"
supersedes: []
gate_reason: "視覚的に探索できるだけで、行動で物体状態が変わる世界を保持できないという問題設定が明確。interaction video dataset、chunk caption、importance-aware compression、persistent memory bank、event-update / object-identity token まで手法の中核が候補内に残っている。ゲーム制作では探索型プロトタイプや headless 評価で「触れるが記憶しない世界」を検出する観点に直結する。"
suggested_post_outline:
  overview_angle: "explorable world model から actionable world model へ進むために、物体相互作用と長期 rollout 記憶をどう持つかを軸に概要を書く。"
  analysis_axis: "問題設定、interaction dataset、履歴圧縮、persistent memory bank、event/object identity token、評価時に見るべき failure mode を分解する。"
  application_target: "ゲーム内 world model、NPC の環境記憶、探索プロトタイプの自動評価、インタラクション可能オブジェクトの状態一貫性チェック。"
  pros_cons: "メリットは行動可能性と記憶の評価軸を得られる点。デメリットは動画世界モデル寄りで、実ゲーム ECS や物理状態への移植には抽象化が必要な点。"
  verdict_pre: "部分採用。手法全体ではなく、interaction importance と event/object identity を評価ログ設計へ取り込む。"
---

## raw_excerpt
短い原文断片: "visually explorable but not truly actionable"。

arXiv:2606.17730。2026-06-16 submitted。ActWorld は、既存の interactive world model が視点移動や navigation には寄っているが、物体を拾う、扉を開ける、状態を変えるといった object interaction を rollout 中に維持しにくい、という問題から出発している。著者らは、100K interaction video dataset と chunk 単位の caption、interaction importance に応じた history compression、event-update / object-identity token を保持する persistent memory bank を組み合わせると説明している。ゲーム文脈では、見た目だけ歩ける世界ではなく、行動で物体状態が変わり、その変化を忘れない世界モデルという素材。

## why_relevant_to_games
アクション可能な環境・物体状態・長い rollout の記憶を扱うため、探索型ゲームや headless 評価で「見えるが触れない」問題を考える材料になる。
