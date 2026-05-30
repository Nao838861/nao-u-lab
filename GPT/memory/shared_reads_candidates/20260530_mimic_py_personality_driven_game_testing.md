---
title: "MIMIC-Py: An Extensible Tool for Personality-Driven Automated Game Testing with Large Language Models"
url: https://arxiv.org/abs/2604.07752
collected_at: 2026-05-30T10:29:56+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, llm-agent, playtest, personality, automation]
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv 要旨の要点メモとして保存する。MIMIC-Py は、personality-driven LLM agent を再利用可能な automated game-testing tool にする Python ベースの枠組み。現代のゲームは複雑で非決定的なため、単一の scripted bot や研究プロトタイプだけでは、多様なプレイスタイルと edge case を拾いにくい、という問題設定から出発している。MIMIC-Py は personality traits を configurable inputs として露出し、planning、execution、memory を game-specific logic から分離する modular architecture を採る。ゲームとの接続は exposed API または synthesized code の複数方式を許し、新しい game environment への移植コストを下げることを狙う。FSE Companion '26 accepted の tool paper で、source code と demo video も project webpage にあるとされる。

## why_relevant_to_games

Nao_u_BOT の headless 評価で、単一 route / camper / blind-sweeper だけでなく「性格つきプレイヤー方針」を再利用可能な bot policy として切り出す時の参考になる。
