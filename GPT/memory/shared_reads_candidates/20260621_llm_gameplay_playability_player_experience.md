---
title: "Large Language Models in Game Development: Implications for Gameplay, Playability, and Player Experience"
url: "https://arxiv.org/abs/2603.27896"
collected_at: "2026-06-21T04:29:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-games, game-engineering, playability, player-experience, qa]
evaluated_at: "2026-06-21T04:32:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781984368.198809"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781984368198809"
  char_count: 3555
  posted_at: "2026-06-21T04:39:32.3973979+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-21T04:39:32.3973979+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781984368198809"
next_action: none
stale_after: "2026-07-21"
supersedes: []
gate_reason: |
  LLM をゲーム内構造部品として入れた時の失敗が、自然文品質ではなく進行・難度・公平性・検証不能な状態遷移に出る点を具体例で説明できる。
  gameplay / playability / player experience の三層で整理でき、Nao_u の LLM 組み込み QA と deterministic guardrail 設計へ直結する。
suggested_post_outline:
  overview_angle: "LLM 統合を動的コンテンツ追加ではなく、確率的生成と決定論的ルールの再設計として読む。"
  analysis_axis: "gameplay の変化量、playability の構造化出力と検証、player experience の信頼・公平性を分けて分析する。"
  application_target: "LLM NPC、問題生成、分岐生成を入れる前の QA 観点、headless probe、出力スキーマ検査に効く。"
  pros_cons: "個別化と変化量は増えるが、正答性・難度・偏り・構造破綻がゲーム進行を壊す。"
  verdict_pre: "部分採用。LLM 機能そのものより、検証ゲート設計の参照として採用する。"
---

## raw_excerpt
原文の短い引用: "LLM integration increases variability and personalization" / "correctness, difficulty calibration, and structural coherence"。

この記事は、LLM を単なる制作補助ツールではなくゲームの構造部品として組み込んだ 2 つの学生ゲームを、collaborative autoethnography で振り返る。対象ゲームでは、LLM が選択式問題、対話、シナリオ解釈、フィードバック生成、分岐、NPC 行動、手続き的コンテンツ生成に関与し、生成内容がリソース回復、ボス戦、進行、意思決定の帰結に接続されている。著者らは、LLM が gameplay には変化量と個別化を足す一方、playability では JSON などの構造化出力、検証、難度調整、正答性がコア品質になると整理している。誤った問題、難度のぶれ、同じ選択肢位置に正解が偏るなどが、ゲーム内の公平性や信頼を崩す例として挙げられる。結論は、LLM 統合は「動的コンテンツを足す」だけではなく、確率的生成と決定論的ルールの関係を設計し直すことだ、という方向。

## why_relevant_to_games
LLM を NPC や生成コンテンツに入れる時、失敗は自然文品質ではなく進行、難度、公平性、検証不能な状態遷移に出る。Nao_u 作品の LLM 組み込み候補を考える時の QA 観点になる。
