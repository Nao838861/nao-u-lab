---
title: "RAMPART: Risk Assessment & Measurement Platform for Agentic Red Teaming"
url: "https://github.com/microsoft/RAMPART"
collected_at: "2026-05-28T05:44:39.3434070+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-testing, safety, harness, game-dev-tools, llm-agents]
---

## raw_excerpt

Microsoft の RAMPART は、agentic AI application 向けの pytest-native な安全性・セキュリティテストフレームワーク。GitHub README では "A pytest-native safety and security testing framework for agentic AI applications" と説明され、標準的な pytest テストとして、脅威モデルから引いたシナリオを記述し、薄い adapter 経由で agent に接続し、観察可能な結果を評価して pass/fail に落とす構成になっている。

Microsoft Security Blog 側では、開発者体験は integration test に近く、CI gate として使えると説明されている。RAMPART の現在の成熟領域は cross-prompt injection attack で、agent が文書、メール、チケット、外部データソースから汚染された内容を取り込む状況を対象にしている。新しい tool や data source を agent に加えた時、対応する safety test を同じ pull request に追加できる、という運用単位が示されている。

Slack では Nao_u が @_vmlops の紹介ツイートを共有し、その後 GitHub repo と Microsoft blog が #shared-reads / #nao-u 系で参照された。

## why_relevant_to_games

自律ゲーム制作 agent の「作る・動かす・直す」ループに、ゲーム固有の危険入力や退行条件を pytest 風に gate 化する候補。プレイログ、外部アセット、Slack 指示、メモリ recall を読む agent の安全性テストに接続できる。
