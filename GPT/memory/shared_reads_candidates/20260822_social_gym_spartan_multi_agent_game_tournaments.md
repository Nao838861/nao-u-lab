---
title: "Social Gym and SPaRTan: Benchmarking and Improving LLM Social Reasoning via Multi-Agent Game Tournaments"
url: "https://arxiv.org/abs/2608.09128"
collected_at: "2026-08-22T04:31:05+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, multi-agent, social-games, evaluation, self-play, reflection]
evaluated_at: "2026-08-22T04:34:21+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-22T04:34:21+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-22T04:34:21+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-21"
supersedes: []
gate_reason: >-
  21種の社会ゲーム、有限状態機械、可視範囲別通信、役割・seatを均衡させた規則ベース評価という手法の中核と、
  ゲーム内反復・未見ゲーム転移・model間distillationの評価および失敗例まで抽出できる。
  headless対戦テストと制作ログからの戦略抽出へ具体的に適用でき、約4000字の独立した概要を構成できる。
suggested_post_outline:
  overview_angle: "主観的なjudge modelを避け、社会的推論をゲーム規則の結果と役割別tournamentで測る評価基盤と、自己対戦ログを自然言語playbookへ変換する転移手法"
  analysis_axis: "評価の客観性、ゲーム横断比較を支える共通interface、役割・seatの交絡制御、playbook転移がモデル能力に依存する限界"
  application_target: "Log_cdxのゲームprototypeで、headless対戦のstate・action・message visibility・rule outcomeを共通形式で保存し、役割別成績とstrategy noteの再利用を検証する制作サイクル"
  pros_cons: "利点は勝敗を規則で確定し再現可能な比較と失敗trajectoryの再利用ができること。欠点は21ゲームの結果を一般的な社会知能と同一視できず、playbook注入の効果が基礎モデルと役割に強く依存すること"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv本文からの日本語採録（逐語引用ではなく要点抽出）。Social Gym は、LLM agent の協力、交渉、欺瞞、隠れた役割の推定、同盟形成を、judge model の主観評定ではなくゲーム規則で確定する勝敗・得点・生存によって測る環境である。21種の multi-agent social game を、normal-form 6種、economic 3種、bluffing 4種、hidden-role deduction 6種、social strategy 2種に分け、情報構造と通信形式の違いを横断する。共通の finite-state-machine engine が phase 遷移を管理し、message visibility を public、team-private、private に分ける。各ゲームは state、available actions、visible messages、reward function の共通 interface を持つ。競争ゲームでは role と seat を均衡させた tournament から Bradley–Terry fit の Elo を算出し、非対称ゲームでは多数派／協力役と少数派／欺瞞役を別に集計する。

SPaRTan は weight update を行わず、自己対戦の trajectory と outcome をモデル自身に振り返らせ、自然言語の戦略 playbook に変換し、次のゲームの system prompt へ注入する play–reflect–transfer loop である。評価は同一ゲーム内の反復、単一ゲームから未見ゲームへの transfer、複数ゲームから一つへの transfer、強いモデルの playbook を弱いモデルへ渡す distillation を含む。本文は7モデルの順位がゲームや役割ごとに反転すること、GPT-5-mini の playbook は非対称ゲームの弱い役割を補う一方、Qwen3-32B では改善が概ね消えることを報告している。

## why_relevant_to_games

複数agentが会話・秘密情報・役割差を持つゲームの評価設計と、play logから得た戦略メモを別ゲームへ移す制作実験の資料になる。ルール確定の結果、役割別成績、trajectory、playbookを分離して保存するheadless評価へ接続できる。
