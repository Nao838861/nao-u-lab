---
title: "GUI Agents for Continual Game Generation"
url: "https://arxiv.org/abs/2605.28258"
collected_at: "2026-06-01T07:30:01+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-playtesting, llm-game-generation, evaluation, browser-games]
evaluated_at: "2026-06-01T07:33:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-01T07:33:19+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-01T07:33:19+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-01"
supersedes: []
gate_reason: "問題設定が prompt-to-code の一回生成から実際に遊んだ後の failure 修正へ移っており、PlaytestArena / Play2Code / GUI agent feedback の役割が具体的。評価指標と改善幅もあり、Nao_u_BOT の playable diff 検証へ直接接続できる。CoopEval 水準の概要を書ける密度がある。"
suggested_post_outline:
  overview_angle: "ゲーム生成を code artifact ではなく browser 上で遊ばれる experience として継続評価する、という問題設定を中心に書く。"
  analysis_axis: "PlaytestArena の task/rubric、GUI agent による objective playtest、Play2Code の shared-memory loop、pass-rate 改善と traceability の限界を分けて分析する。"
  application_target: "Nao_u_BOT の headless/playable diff 評価、ブラウザゲーム prototype の smoke test、LLM coding agent と GUI playtester の役割分離。"
  pros_cons: "メリットは playable failure を実行ログに基づいて拾える点、デメリットは GUI agent の idiosyncrasy と rubric 設計依存。"
  verdict_pre: "部分採用。自動生成そのものより、制作後のブラウザ操作評価 loop を先に取り込む。"
---

## raw_excerpt
arXiv:2605.28258。2026-05-27 submitted。Yixu Huang ほか。

要旨メモ。論文は、ゲーム生成を prompt から code artifact への一回変換として扱うと、実際に触った時の失敗が残る、という問題設定から始めている。中心は GUI agent をゲーム生成 loop に入れること。1つ目の役割は客観評価者で、PlaytestArena は 8 genre / 200 browser-based game generation tasks を用意し、期待される in-play behavior の rubric を GUI agent が browser 上で build を開いて遊び、判定する。2つ目の役割は主観 playtester で、Play2Code では game agent と GUI agent が shared memory を持って継続 loop を作り、coding と playing の対話にする。実験では frontier model でも直接 playable game を生成するのは難しく、Play2Code は rubric pass-rate 66.8% と報告されている。single-pass から 37.1 point、agentic-coding baseline から 14.6 point 改善。GUI playtester の feedback は human report より traceable だが、人間テスターのような idiosyncrasy もある、という位置づけ。

## why_relevant_to_games
Nao_u_BOT の playable diff 停滞や headless 評価に対して、「コード生成 agent だけでなく、実際に browser で遊ぶ GUI agent を評価 loop に入れる」候補として使える。
