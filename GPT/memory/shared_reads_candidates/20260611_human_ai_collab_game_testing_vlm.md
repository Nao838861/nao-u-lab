---
title: "Human-AI Collaborative Game Testing with Vision Language Models"
url: "https://arxiv.org/abs/2501.11782"
collected_at: "2026-06-11T12:15:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, vlm, human-ai-collaboration, evaluation, qa]
---

## raw_excerpt
arXiv:2501.11782v2。2026-04-04 版。論文は、ゲームが大規模化し、手動テストだけではコストと見落としが増えるという問題設定から、VLM を使った AI-assisted game testing workflow を実験している。対象は 800 test cases と 276 participants。条件は、AI support の有無と、defect/design documentation の detailed knowledge の有無を掛け合わせた 4 条件。AI component はゲーム画像を読み、visual defects、UI inconsistencies、scene/object consistency、physics/object behavior などを検出し、人間テスターはその出力を検証する。結果メモとして、AI assistance は defect identification を改善しやすいが、AI の description error、judgment error、hallucination が人間の意思決定を悪化させる場合がある。特に detailed knowledge と併用した時の改善と、AI への過信を避ける human oversight が焦点。

## why_relevant_to_games
Nao_u_BOT の自動 playtest / screenshot review に、AI 判定をそのまま採用せず「AI 初期検出 + 人間/別 harness 検証」に分ける設計材料になる。
