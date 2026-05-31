---
title: "ExInCOACH: Strategic exploration meets interactive tutoring for context-aware game onboarding"
url: "https://www.sciencedirect.com/science/article/pii/S1566253526000308"
collected_at: "2026-05-31T19:29:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, onboarding, tutorial, rl-llm, player-learning, cognitive-load]
evaluated_at: "2026-05-31T19:36:40+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-05-31T19:39:52+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780223981841189"
next_action: none
stale_after: "2026-06-30"
supersedes: []
posted:
  ts: "1780223981.841189"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780223981841189"
  char_count: 4446
  posted_at: "2026-05-31T19:39:52+09:00"
gate_reason: |-
  問題設定、RL self-play による Q-function、LLM による行動説明への変換、Dou Di Zhu / StarCraft II 評価、認知負荷低下まで候補本文から抽出できる。
  チュートリアルを静的説明ではなく状態依存 onboarding loop として設計する観点が、複雑ルールのプロトタイプに直接適用できる。
suggested_post_outline:
  overview_angle: "静的チュートリアルの限界を、ゲーム状態に基づく RL 評価値と LLM 説明で補う onboarding 手法として整理する。"
  analysis_axis: "Q-function が何を判断材料にし、LLM がそれをどの粒度のルール説明・戦略助言へ翻訳するか、評価で勝率と認知負荷をどう見ているか。"
  application_target: "Nao_u_BOT の複雑ルール系プロトタイプで、headless player / scripted player の判断ログを説明 UI や tutorial prompt に接続する設計。"
  pros_cons: "メリットは状況依存の助言と学習負荷低減。デメリットは RL 環境構築コスト、助言の正当化、プレイヤー主体性を奪うリスク。"
  verdict_pre: "部分採用。RL そのものより、状態評価と自然言語説明を分ける設計パターンを採る。"
---

## raw_excerpt

Information Fusion 掲載の ExInCOACH 論文。著者は Rui Hua, Zhaoyu Huang, Jinhao Lu, Yakun Li, Na Zhao。DOI は `10.1016/j.inffus.2026.104151`。記事ページの要旨では、従来のゲームチュートリアルが静的説明に寄り、ライブのゲーム状態やプレイヤー判断に接続した guidance を出しにくい問題を扱っている。

手法は、深層 RL の self-play で Q-function を作り、現在の legal action と使用条件を LLM が自然言語のルール説明・戦略助言へ変換する構成。短い原文メモ: "state-aware adaptive tutoring", "real-time contextual feedback", "RL model exploration & LLM rule interpretation"。

評価対象は Dou Di Zhu と StarCraft II。Dou Di Zhu では ExInCOACH で訓練されたプレイヤーが従来方式で学んだ相手に 14/20 勝、StarCraft II の 2v2 では VLLM 支援チームに対して 66.7% 勝率、静的 wiki 学習チームに対して 100% 勝率と説明されている。認知負荷については NASA-TLX 系の評価で mental burden / frustration の低下を報告している。

## why_relevant_to_games

チュートリアルを「最初に読む説明」ではなく、プレイヤーの現在状態と判断に応じて変わる onboarding loop として扱う候補。複雑なルールや高密度操作のプロトタイプで、説明 UI と headless / RL / scripted player の関係を考える材料になる。
