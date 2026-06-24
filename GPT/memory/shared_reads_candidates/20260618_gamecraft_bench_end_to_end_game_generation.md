---
title: "GameCraft-Bench: Can Agents Build Playable Games End-to-End in a Real Game Engine?"
url: "https://arxiv.org/abs/2606.17861"
collected_at: "2026-06-18T07:58:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev-benchmark, coding-agent, godot, playable-verification, multimodal-evaluation]
evaluated_at: "2026-06-18T08:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781736810.994759"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781736810994759"
  char_count: 4163
  posted_at: "2026-06-18T07:53:55+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T07:53:55+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781736810994759"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: |-
  coding agent が complete playable game artifact に届かない失敗を、Godot 実行環境・replay・multimodal rubric で評価する問題設定が明確。
  Nao_u_BOT の playable diff 検証に、コード通過ではなく「遊べる成果物」を見る評価軸として具体適用できる。
  tasks / families / 3 評価要件 / agent 成績まで揃っており、CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "coding benchmark を、実行できるコードではなく coherent gameplay を作れるかの検査へ拡張した点を軸にする。"
  analysis_axis: "Engine Grounding / Artifact Completeness / Interactive Verification の3要件と、replay + multimodal judging が拾う失敗種別を整理する。"
  application_target: "Nao_u_BOT の playable diff 完了判定、headless テスト後の手触り評価、短期プロトタイプの rubric 設計。"
  pros_cons: "メリットは complete artifact 評価の具体性。デメリットは Godot / benchmark task 依存と、主観 rubric の運用コスト。"
  verdict_pre: "部分採用。評価思想と rubric 構造を取り込み、実装は小さな replay probe から始める。"
---

## raw_excerpt
arXiv 2606.17861。2026-06-16 submitted。GameCraft-Bench は、coding agent が自然言語仕様から complete playable game artifact を作れるかを見る benchmark。従来の coding task と違い、ゲーム生成では scripts、scenes、assets、rendering、runtime interactions が同時に coherent gameplay を作る必要がある、と置く。評価要件として Engine Grounding、Artifact Completeness、Interactive Verification の 3 点を挙げ、静的なコード確認ではなく、replayed demonstrations と rubric-guided multimodal judging で executable gameplay を観測する。実体は Godot 4 上の 140 tasks / 15 game families。検索結果の要旨では、最強 agent でも 41.46% に留まり、多くは 40% 未満。agents は recognizable mechanics を実装することはあるが、十分な content、functional visual feedback、coherent presentation を持つ complete game にまとめるところで失敗しやすいとされる。

## why_relevant_to_games
Nao_u_BOT の playable diff 検証で、コード通過・headless 通過・実際に遊べる体験の差を分ける材料になる。特に Godot task / replay / multimodal rubric の組み合わせは、短い自作ゲームにも「complete artifact か」を見る軸として使えそう。
