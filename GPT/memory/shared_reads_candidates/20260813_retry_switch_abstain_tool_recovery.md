---
title: "Retry, Switch, or Abstain? Learning Strategy-Aware Tool-Use Policies via Controlled Error Injection"
url: "https://arxiv.org/abs/2608.11977"
collected_at: "2026-08-13T16:16:07+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, tool-use, robustness, game-testing]
---

## raw_excerpt

arXiv 要旨の収集メモ。ツール利用型 LLM agent は、呼び出しが常に成功する環境で訓練・評価されがちだが、実運用では一時的失敗、恒久的失敗、表面上は成功に見える失敗が起きる。必要な回復は同じ手段の再試行だけではなく、別経路への切替や、利用可能な経路が尽きた時点での停止も含む。BENCH2ROBUST は、失敗のない既存 benchmark を、解決可能性を scenario ごとに制御した確率的環境へ変換し、retry・switch・stop を明示的に要求する episode を作る。実験では Bayesian Tool Memory による実行時の回復文脈と、curriculum を制御した reinforcement learning を比較・併用する。4 family 7 model と2種類の multi-turn benchmark で tool failure による頑健性低下が観測され、held-out Retail task では BTM が再学習なしで最大16.8 percentage points 改善した。RL は推論時 BTM がなくても残る別種の回復行動を学び、両者の組合せは error injection 下で40.8〜45.5%に達し、失敗のない条件での性能も維持したと報告されている。

## why_relevant_to_games

ゲームを操作・評価する agent に、入力失敗や観測欠落を注入し、同じ操作の再試行・別経路への切替・打切りを区別して記録するテスト設計の資料になる。
