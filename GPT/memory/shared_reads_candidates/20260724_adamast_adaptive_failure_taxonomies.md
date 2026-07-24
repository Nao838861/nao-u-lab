---
title: "Fantastic Adaptive Taxonomies and How to Use Them"
url: "https://arxiv.org/abs/2607.16387"
collected_at: "2026-07-24T19:30:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, playtesting, evaluation, failure-analysis, workflow]
---

## raw_excerpt

arXiv 本文からの要点メモ（逐語引用ではなく日本語での内容転記）。LLM agent の実行 trace には失敗原因が残るが、生ログは長く、個別事例に寄り、同じ失敗を横断して指す安定した語彙がない。AdaMAST は対象 system 自身の trace 群から、system-level、role-specific、domain-specific の3軸に沿った failure code を生成する。軸だけを固定し、code 名・定義・role label・evidence pattern は trace から誘導するため、人手で code を事前定義せず、各 trace への人手 annotation も要求しない。生成 taxonomy は held-out trace に対して独立 annotator が一貫して適用できるかを gate とし、system の変化に合わせて code の追加・統合・改名を行う。用途は事後診断だけでなく、agent-system search の失敗候補への診断、実行中 checkpoint での feedback、複数 trajectory からの選択という3経路で共用される。論文は5 benchmark の system search で free-form reflection を上回り、SWE-bench Verified Mini では SWE-agent の解決率を free-text reflection の60%から70%へ、Claude Code を64.0%から70.7%へ改善したと報告する。Terminal-Bench 2.0 の best-of-5 選択では Pass@1 より8–15ポイント高かった。

## why_relevant_to_games

AI プレイテスターやゲーム制作 agent の実行ログから、探索停止・検証漏れ・役割固有ミス・ゲーム領域固有ミスを再利用可能な失敗コードへ変え、次の playtest・候補選択・workflow 改善へ戻す設計資料になる。
