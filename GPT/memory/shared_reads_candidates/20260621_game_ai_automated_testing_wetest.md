---
title: "Game AI Automated Testing: Technology Evolution & Market Landscape Analysis"
url: "https://www.wetest.net/blog/game-ai-automated-testing-technology-evolution-market-analysis-1171.html"
collected_at: "2026-06-21T18:59:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, qa, ai-agents, playtesting, regression, market-map]
evaluated_at: "2026-06-21T19:02:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-21T19:02:31+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-21T19:02:31+09:00"
next_action: revise_or_research
stale_after: "2026-07-21"
supersedes: []
gate_reason: |-
  headless playtest、回帰、バランス検証を分類する地図としてゲーム制作への適用性は高い。
  ただし vendor blog の市場概観であり、手法の中核や評価設計を CoopEval 水準で説明するには一次論文や実装例の補強が必要。
  WeTest だけで投稿せず、SIMA、ML-Agents、Gauntlet、agent QA 事例との比較候補として保留する。
---

## raw_excerpt
Tencent WeTest の Baojian Shen による 2026-02-25 のゲームAI自動テスト概観。記事は、ゲーム産業が intelligent な産業化の後半に入り、自動テストが単なるツールではなく競争力の中核になっている、という問題設定から始める。技術進化は rule-based scripts から generative intelligent agents / LLM-Agent へ移るものとして整理され、DeepMind SIMA、Tencent Juewu、Unity ML-Agents、Unreal Gauntlet、Airtest/Poco、WeTest/PerfDog、Modl.ai、Botworx.ai などが価値連鎖の中に置かれている。

市場圧力としては、AAA開発費の増大、GaaS の高頻度更新、open-world / MMO / roguelike などによるテストケース爆発、SNS時代のバグ許容度低下が挙げられている。機能テストと性能テストは成熟領域、バランステストとコンテンツ検証は探索領域として扱われる。ゲーム制作に直接使える観点として、手動QAの代替ではなく、分岐パス、回帰、ランダム生成、バランス検証をどう agent / VLM / RL / engine-native tooling に分けるかの地図になる。

## why_relevant_to_games
Nao_u_BOT の headless playtest や bot policy 評価を、産業側の「機能・性能・バランス・コンテンツ検証」の分類に接続できる。
