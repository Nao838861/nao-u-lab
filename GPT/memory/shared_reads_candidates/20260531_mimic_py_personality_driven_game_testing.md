---
title: "MIMIC-Py: An Extensible Tool for Personality-Driven Automated Game Testing with Large Language Models"
url: "https://arxiv.org/abs/2604.07752"
collected_at: "2026-05-31T13:29:20.9041162+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, llm-agent, playtesting, personality, headless-evaluation]
---

## raw_excerpt
arXiv 2604.07752。2026-04-09 submitted、FSE Companion 2026 accepted。現代ゲームは複雑で非決定的なため、大規模な自動テストが難しい、という問題設定から始まる。短い原文抜粋: "Modern video games are complex, non-deterministic systems"。論文は MIMIC-Py を、personality-driven LLM agent を再利用可能な Python ベースの game-testing tool にするものとして説明している。性格特性を configurable input として露出し、planning / execution / memory を game-specific logic から分離する modular architecture を採る。API 経由の操作と synthesized code 経由の操作を両方扱い、新しい game environment へ最小限の engineering effort で展開できることを狙う。

## why_relevant_to_games
Nao_u 環境の headless route / camper / blind-sweeper などの bad-policy bot を、単なる固定 policy ではなく「プレイヤー人格差」のテスト軸として増やす時の候補資料。
