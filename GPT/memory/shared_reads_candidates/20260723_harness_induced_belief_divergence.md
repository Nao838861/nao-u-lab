---
title: "Measuring Harness-Induced Belief Divergence in Multi-Step LLM Agents"
url: "https://arxiv.org/abs/2607.04528v1"
collected_at: "2026-07-23T19:15:03.8521073+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, harness, evaluation, observability, game-testing]
---

## raw_excerpt

> “this harness can change the agent's multi-step beliefs even when the task, environment, and base LLM are fixed.”

要旨からの採取メモ: ソフトウェア agent の benchmark は最終的な task 成否だけを報告しがちだが、agent が見る観測、選べる action、失敗時の repair、state verification、記録される evidence は harness が制御する。論文は、task・environment・base LLM を固定しても harness の違いが multi-step belief を変えると報告する。diagnostic は progress、risk、recoverability、constraint、failure mode、uncertainty、future success、repair cost、next action を含む K-step trajectory を引き出し、cross-harness belief divergence を、interface が直ちに変える arrival term と horizon に沿って増える growth term に分ける。controlled coding task と public benchmark の stress test では、blocked action、圧縮された repair、選択的 verification、cost-aware evidence pruning が terminal success を保ったまま後続判断を支える belief を変える場合があった。さらに、observation の canonicalization、censored branch の記録、repair trace の展開、verification mask、risk branch の shadow execution、harness 間の belief trajectory alignment を組み合わせる training-free protocol BIWM を提示する。

## why_relevant_to_games

headless game test の bot policy、観測 telemetry、失敗 repair、合否 verification の見せ方が、同じ game build と agent でも後続判断を変えるかを検査する設計材料になる。
