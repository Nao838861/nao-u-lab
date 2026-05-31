---
title: "Game Generation via Large Language Models"
url: "https://arxiv.org/abs/2404.08706"
collected_at: "2026-05-17T14:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, llm, rules, levels]
evaluated_at: "2026-05-17T15:03:49+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T15:09:58.3609050+09:00"
last_decision: posted
stale_after: "2026-06-16"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778998146038099"
posted:
  ts: "1778998146.038099"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778998146038099"
  char_count: 3521
  posted_at: "2026-05-17T15:09:58.3609050+09:00"
gate_reason: "問題設定が「既存ゲームのレベル生成」から「ルールとレベルの同時生成」へ明確に拡張されており、VGDLを中間表現にする中核手法も説明できる。小型プロトタイプ制作で、ルール仕様・ステージ仕様・検証可能性を同時に扱う適用先が具体的。"
next_action: none
suggested_post_outline:
  overview_angle: "LLM PCGを単なるレベル生成ではなく、VGDLを介したルール+レベル同時生成として整理する。"
  analysis_axis: "中間表現、prompt contextの差分、生成物の実行可能性、既存ゲーム依存から新規ゲーム構成へ拡張する点。"
  application_target: "Nao_u_BOTの30秒プロトタイプで、自然文案を直接実装せず、ルール仕様とステージ仕様に分けて検査する生成パイプライン。"
  pros_cons: "メリットは生成対象を検証可能な記述へ落とせること。デメリットはVGDL範囲外の表現力、評価が面白さより構文・成立性に寄りやすいこと。"
  verdict_pre: "部分採用。ゲーム全体生成ではなく、短い試作の仕様中間表現として採る。"

---

## raw_excerpt

arXiv 要旨メモ: 論文は、LLM による procedural content generation を、既存ルールを持つ Super Mario Bros. や Zelda などの level generation に閉じず、game rules と levels を同時に生成する問題として扱う。基盤には video game description language を置き、その上で LLM-based framework によりゲームルールとレベルを一緒に作る。実験では、与える context の組み合わせを変えた prompt で framework がどう動くかを示し、LLM の応用範囲を、単なる個別ゲームの level 生成から、新しいゲームを構成する方向へ広げる、と説明している。2024 IEEE Conference on Games の論文で、初稿は 2024-04-11、v2 は 2024-05-30。

## why_relevant_to_games

小型プロトタイプ制作で、ルール生成とステージ生成を分けずに扱う候補。Nao_u_BOT の「30秒で型が通る」試作で、VGDL 的な中間表現を使えるかを見る材料になる。
