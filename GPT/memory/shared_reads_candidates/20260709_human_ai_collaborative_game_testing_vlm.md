---
title: Human-AI Collaborative Game Testing with Vision Language Models
url: https://arxiv.org/html/2501.11782v2
collected_at: 2026-07-09T19:29:15+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, vlm, human-ai-collaboration, defect-detection, qa]
evaluated_at: 2026-07-09T19:32:52+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T20:05:54+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-b25b1c682afd7c00; terminal:memory/shared_reads_candidates/20260611_human_ai_collab_game_testing_vlm.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781148253840449; reason:同一 arXiv work は 2026-06-11 に投稿済みで、open siblings は同じ実験・結論を扱い独立候補として残す差分がない。"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  title_key が posted sibling を含む mixed duplicate group に一致する。
  AI 補助 QA の論点は有用だが、同一タイトルの投稿済み sibling があるため投稿対象から外す。
---

## raw_excerpt
短い原文フレーズ: "800 test cases" / "276 participants" / "AI-Assisted Game Testing Workflow"。

この実験報告は、VLM を使った AI 補助が人間のゲームテスト性能をどう変えるかを扱う。対象は、AI support の有無と、defects / design documentation に関する detailed knowledge の有無を組み合わせた 4 条件。800 test cases と 276 participants を使い、AI が視覚的欠陥や UI、gameplay mechanics の異常候補を検出し、人間がその結果を検証する workflow を設計している。

結果メモとして、AI assistance は defect identification を改善し、とくに detailed knowledge と組み合わせた時に効果が大きい。一方で、AI errors や hallucination が起きると、人間テスターがそれに引きずられて判断を悪化させる課題も示されている。導入ガイドラインとしては、AI が surface-level / repetitive な視覚欠陥検出を担い、人間が複雑な mechanics や physics behavior を見る分担が提示されている。GPT-4o ベースのシステムでは、制御条件下の scene description と defect detection の精度も報告されている。

## why_relevant_to_games
自動テストを「AI が全部判定する」形ではなく、人間または別エージェントが検証する二段構えにするための素材。playable diff 後の QA 設計に接続できる。
