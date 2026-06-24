---
title: "RPA-Check: A Multi-Stage Automated Framework for Evaluating Dynamic LLM-based Role-Playing Agents"
url: "https://arxiv.org/abs/2604.11655"
collected_at: "2026-06-13T17:59:33+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [role-playing-agent, npc, evaluation, llm-agent, narrative-stability]
evaluated_at: "2026-06-13T18:02:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781341694.445529"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781341694445529"
  char_count: 3509
  posted_at: "2026-06-13T18:15:33+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-13T18:15:33+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781341694445529"
next_action: none
stale_after: "2026-07-13"
supersedes: []
gate_reason: |-
  問題設定、4 段階の評価 pipeline、検証対象、モデル比較の結論が候補本文内で揃っている。
  NPC / role-playing agent を「それっぽさ」ではなく checklist と judge 粒度に分解するため、Nao_u_BOT の対話型キャラクター評価へ具体的に接続できる。
suggested_post_outline:
  overview_angle: "role-playing agent 評価を、役割遵守・論理整合・長期 narrative stability の観点から boolean checklist 化する手法として書く。"
  analysis_axis: "dimension definition、indicator augmentation、semantic filtering、LLM judge の分業と、モデルサイズより instruction tuning / sycophancy が効くという評価結果。"
  application_target: "NPC 会話、LLM GM、法廷・交渉・推理系プロトタイプのキャラクター評価 rubric と regression check。"
  pros_cons: "メリットは評価粒度を明示できること。デメリットは LLM judge 依存と domain checklist 作成コスト。"
  verdict_pre: "部分採用。RPA-Check 全体ではなく、checklist expansion と semantic filtering を小型 rubric に圧縮して使う。"
---

## raw_excerpt
arXiv 2604.11655。Riccardo Rosati ほか。LLM を使った dynamic / open-ended な Role-Playing Agents は、通常の NLP 指標では role adherence、logical consistency、long-term narrative stability を測りにくい、という問題設定から出発する。RPA-Check は、複雑で制約の多い環境における LLM-based RPA を自動評価する multi-stage framework として提案されている。

手順は 4 段階。まず Dimension Definition で、高水準の qualitative behavioral criteria を定義する。次に Augmentation で、それを granular boolean checklist indicators へ展開する。さらに Semantic Filtering で、indicator の客観性、冗長性のなさ、agent isolation を確認する。最後に LLM-as-a-Judge Evaluation で chain-of-thought verification を使い、agent fidelity を採点する。

検証対象は forensic training 用 serious game の LLM Court。5 つの legal scenarios と複数の quantized local models を使い、モデルサイズ、reasoning depth、operational stability の trade-off を見る。結果として、より大きい model が常に procedural consistency で勝つわけではなく、十分に instruction-tuned された 8-9B 級 model が、user-alignment bias や sycophancy に寄りやすい大規模 model を上回る場合がある、と報告されている。

## why_relevant_to_games
NPC や対話型キャラクターを「それっぽい返答」ではなく、役割・制約・長期一貫性の checklist に分解して評価する候補。Nao_u_BOT の narrative / role-playing 系プロトタイプで、LLM judge を使う時の粒度設計に効きそう。
