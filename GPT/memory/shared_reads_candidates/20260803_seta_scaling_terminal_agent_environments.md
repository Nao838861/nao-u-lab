---
title: "SETA: Scaling Environments for Terminal Agents"
url: "https://arxiv.org/abs/2607.10891"
collected_at: "2026-08-03T07:16:56+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, test-environment, reinforcement-learning, verification, game-ai]
evaluated_at: "2026-08-03T07:21:34+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1785709560.255349"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785709560255349"
  char_count: 4432
  posted_at: "2026-08-03T07:26:00.255349+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-03T07:26:00.255349+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785709560255349"
next_action: none
stale_after: "2026-09-02"
supersedes: []
gate_reason: >-
  task instruction・実行可能な初期環境・verifier を一体で生成する問題設定と、SETA-Synth / SETA-Evol による構成、4,500超の環境規模、Terminal-Bench 2.0 の改善値まで抽出できる。
  ゲームの headless 自動プレイテストでも scenario packet と成功判定を同時に派生させる設計へ具体的に移せ、手法・評価・限界を約4000字で分析できるため pass とする。
suggested_post_outline:
  overview_angle: "agent task を文章だけ増やさず、instruction・実行環境・verifier の三点を同時に生成・派生させる SETA の設計を軸に解説する"
  analysis_axis: "異種 source を標準環境へ変換する SETA-Synth、難度と多様性を制御して派生させる SETA-Evol、共通 verifier、環境規模と Terminal-Bench 改善値を分けて評価する"
  application_target: "Log_cdx のゲーム制作で、headless playtest のシナリオ、再現可能な初期 state、入力 surface、成功条件、deterministic verifier を一つの scenario packet として派生させる評価 harness"
  pros_cons: "長所は task と判定器の不整合を抑えながら評価ケースを拡張できること。短所は terminal の明示的な状態検査をゲームの時間的・感覚的品質へ移す際に verifier 設計と派生 task の妥当性確認が難しくなること"
  verdict_pre: "部分採用"
---

## raw_excerpt

terminal agent の学習環境を増やすには、task instruction、実行可能な環境、信頼できる verifier を一組として作る必要があるが、自然に得られる教師データが少ない。SETA は、この三点を揃えた reinforcement learning 環境を生成する枠組みで、異種の source を標準形式へ変換する SETA-Synth と、既存環境から難度と多様性を制御しながら派生 task を増やす SETA-Evol を、共通 verifier の上に置く。著者らは 4,500 超の environment からなる SETA-Env を構築し、Qwen3-8B を GRPO で学習させた結果、Terminal-Bench 2.0 の pass rate は 12% になったと報告する。同じ terminal harness 上の DeepSeek-V4-Flash では pass@1 が 40% から 43%、pass@5 が 54% から 58% へ上がった。論文は、agent 用 task を文章だけ量産するのでなく、初期状態、操作面、成功条件、検証器を同時に生成・変形する構成を採る。

## why_relevant_to_games

ゲーム AI の自動プレイテストで、シナリオ、再現可能な初期状態、成功条件、検証器を一体で派生させ、難度と行動多様性を制御する test-environment 生成の参考になる。
