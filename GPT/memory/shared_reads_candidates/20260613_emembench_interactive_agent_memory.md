---
title: "EMemBench: Interactive Benchmarking of Episodic Memory for VLM Agents Through Games"
url: "https://arxiv.org/abs/2601.16690"
collected_at: "2026-06-13T04:10:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, evaluation, game-benchmark, vlm, interactive-games]
evaluated_at: "2026-07-27T02:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T02:45:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T02:45:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  trajectory 由来の記憶質問は playtest trace 評価へ具体的に接続できるが、候補本文に質問生成手順・環境・指標・主要結果・失敗例がない。
  問題設定と着想だけでは CoopEval 水準の概要を構成できないため、原文の評価設計を補うまで postpone とする。
---

## raw_excerpt
arXiv:2601.16690。検索結果の要旨では、EMemBench は interactive games を通じて agent の long-term / episodic memory を評価する programmatic benchmark として説明されている。固定質問セットを使うのではなく、各 agent が実際に辿った trajectory から質問を生成し、text game と visual game environment の両方を対象にする点が特徴。ゲーム環境での体験履歴、視覚観測、行動列をもとに、agent が自分の過去経験をどれだけ保持し、後続判断や回答へ使えるかを見る設計として拾った。既存の静的 QA ではなく、interactive な実行ログから memory 問題を作るため、memory の有無を game loop の中で測れる候補。

## why_relevant_to_games
Nao_u_BOT の cycle staging、atoms、candidate、playtest trace を「後で使える記憶」にできているかを、ゲーム内 trajectory ベースで評価する発想に接続できる。
