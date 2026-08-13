---
title: "Retry, Switch, or Abstain? Learning Strategy-Aware Tool-Use Policies via Controlled Error Injection"
url: "https://arxiv.org/abs/2608.11977"
collected_at: "2026-08-13T16:16:07+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, evaluation, tool-use, robustness, game-testing]
evaluated_at: "2026-08-13T16:20:07+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-13T16:20:07+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-13T16:20:07+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  一時的・恒久的な tool failure を混同せず、retry・switch・stop の選択自体を制御注入で評価する問題設定と、BTM / RL の比較結果が具体的である。
  ゲーム自動テストの入力欠落、経路遮断、観測失敗を故障種別ごとに注入し、成功率だけでなく回復方策の妥当性を測る設計へ直接適用でき、約4000字の独立した分析を構成できる。
suggested_post_outline:
  overview_angle: "tool-use agent の頑健性を、失敗後も同じ操作を続ける能力ではなく retry・switch・stop の選択問題として捉え直す"
  analysis_axis: "制御された error injection、Bayesian Tool Memory、reinforcement learning の役割分担と held-out task への一般化"
  application_target: "ゲーム自動プレイ・回帰テスト harness に一時故障と恒久故障を注入し、再試行・代替入力経路・打ち切りの policy を別々に検証する工程"
  pros_cons: "回復行動を観測可能な評価軸にできる一方、実ゲーム固有の failure taxonomy と安全な stop 条件を別途定義する必要がある"
  verdict_pre: "採用"
---

## raw_excerpt

arXiv 要旨の収集メモ。ツール利用型 LLM agent は、呼び出しが常に成功する環境で訓練・評価されがちだが、実運用では一時的失敗、恒久的失敗、表面上は成功に見える失敗が起きる。必要な回復は同じ手段の再試行だけではなく、別経路への切替や、利用可能な経路が尽きた時点での停止も含む。BENCH2ROBUST は、失敗のない既存 benchmark を、解決可能性を scenario ごとに制御した確率的環境へ変換し、retry・switch・stop を明示的に要求する episode を作る。実験では Bayesian Tool Memory による実行時の回復文脈と、curriculum を制御した reinforcement learning を比較・併用する。4 family 7 model と2種類の multi-turn benchmark で tool failure による頑健性低下が観測され、held-out Retail task では BTM が再学習なしで最大16.8 percentage points 改善した。RL は推論時 BTM がなくても残る別種の回復行動を学び、両者の組合せは error injection 下で40.8〜45.5%に達し、失敗のない条件での性能も維持したと報告されている。

## why_relevant_to_games

ゲームを操作・評価する agent に、入力失敗や観測欠落を注入し、同じ操作の再試行・別経路への切替・打切りを区別して記録するテスト設計の資料になる。
