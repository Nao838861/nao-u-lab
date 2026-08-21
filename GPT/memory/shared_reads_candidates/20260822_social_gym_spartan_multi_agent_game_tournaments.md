---
title: "Social Gym and SPaRTan: Benchmarking and Improving LLM Social Reasoning via Multi-Agent Game Tournaments"
url: "https://arxiv.org/abs/2608.09128"
collected_at: "2026-08-22T04:31:05+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, multi-agent, social-games, evaluation, self-play, reflection]
---

## raw_excerpt

arXiv本文からの日本語採録（逐語引用ではなく要点抽出）。Social Gym は、LLM agent の協力、交渉、欺瞞、隠れた役割の推定、同盟形成を、judge model の主観評定ではなくゲーム規則で確定する勝敗・得点・生存によって測る環境である。21種の multi-agent social game を、normal-form 6種、economic 3種、bluffing 4種、hidden-role deduction 6種、social strategy 2種に分け、情報構造と通信形式の違いを横断する。共通の finite-state-machine engine が phase 遷移を管理し、message visibility を public、team-private、private に分ける。各ゲームは state、available actions、visible messages、reward function の共通 interface を持つ。競争ゲームでは role と seat を均衡させた tournament から Bradley–Terry fit の Elo を算出し、非対称ゲームでは多数派／協力役と少数派／欺瞞役を別に集計する。

SPaRTan は weight update を行わず、自己対戦の trajectory と outcome をモデル自身に振り返らせ、自然言語の戦略 playbook に変換し、次のゲームの system prompt へ注入する play–reflect–transfer loop である。評価は同一ゲーム内の反復、単一ゲームから未見ゲームへの transfer、複数ゲームから一つへの transfer、強いモデルの playbook を弱いモデルへ渡す distillation を含む。本文は7モデルの順位がゲームや役割ごとに反転すること、GPT-5-mini の playbook は非対称ゲームの弱い役割を補う一方、Qwen3-32B では改善が概ね消えることを報告している。

## why_relevant_to_games

複数agentが会話・秘密情報・役割差を持つゲームの評価設計と、play logから得た戦略メモを別ゲームへ移す制作実験の資料になる。ルール確定の結果、役割別成績、trajectory、playbookを分離して保存するheadless評価へ接続できる。
