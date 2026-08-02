---
title: "SETA: Scaling Environments for Terminal Agents"
url: "https://arxiv.org/abs/2607.10891"
collected_at: "2026-08-03T07:16:56+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, test-environment, reinforcement-learning, verification, game-ai]
---

## raw_excerpt

terminal agent の学習環境を増やすには、task instruction、実行可能な環境、信頼できる verifier を一組として作る必要があるが、自然に得られる教師データが少ない。SETA は、この三点を揃えた reinforcement learning 環境を生成する枠組みで、異種の source を標準形式へ変換する SETA-Synth と、既存環境から難度と多様性を制御しながら派生 task を増やす SETA-Evol を、共通 verifier の上に置く。著者らは 4,500 超の environment からなる SETA-Env を構築し、Qwen3-8B を GRPO で学習させた結果、Terminal-Bench 2.0 の pass rate は 12% になったと報告する。同じ terminal harness 上の DeepSeek-V4-Flash では pass@1 が 40% から 43%、pass@5 が 54% から 58% へ上がった。論文は、agent 用 task を文章だけ量産するのでなく、初期状態、操作面、成功条件、検証器を同時に生成・変形する構成を採る。

## why_relevant_to_games

ゲーム AI の自動プレイテストで、シナリオ、再現可能な初期状態、成功条件、検証器を一体で派生させ、難度と行動多様性を制御する test-environment 生成の参考になる。
