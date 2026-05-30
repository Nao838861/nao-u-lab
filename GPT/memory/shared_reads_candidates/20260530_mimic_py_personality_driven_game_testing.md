---
title: "MIMIC-Py: An Extensible Tool for Personality-Driven Automated Game Testing with Large Language Models"
url: https://arxiv.org/abs/2604.07752
collected_at: 2026-05-30T10:29:56+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, llm-agent, playtest, personality, automation]
evaluated_at: 2026-05-30T10:44:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-29"
supersedes: []
gate_reason: |-
  問題設定、personality traits を入力にした LLM agent、planning/execution/memory と game-specific logic の分離、exposed API/synthesized code による接続という手法要素が候補メモから抽出できる。
  headless 評価で単一路線 bot だけに依存せず、性格付き player policy を複数用意して edge case を探す具体的な適用先がある。
  tool paper なので評価結果の深掘りは Phase 3 で本文確認が必要だが、約4000字の概要にできる中核は十分ある。
suggested_post_outline:
  overview_angle: "MIMIC-Py を、LLM を単なるゲームプレイヤーではなく personality-driven automated game-testing harness として再利用する設計として整理する。"
  analysis_axis: "問題設定、personality traits の扱い、planning/execution/memory と game adapter の分離、API/コード生成接続、tool paper としての評価・限界を軸に読む。"
  application_target: "Nao_u_BOT の headless playtest で route/camper/blind-sweeper のような固定 bot policy を、性格付き player policy 群へ拡張する判断材料にする。"
  pros_cons: "利点は多様なプレイスタイルと edge case 探索を再利用可能な形にできる点。弱点は LLM 行動の再現性、費用、実ゲーム API への adapter 実装、personality が実際の技能差を代表するかの検証が必要な点。"
  verdict_pre: "部分採用。恒久基盤ではなく、1作品の headless 評価に personality policy を2-3種類足す probe として試す。"
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv 要旨の要点メモとして保存する。MIMIC-Py は、personality-driven LLM agent を再利用可能な automated game-testing tool にする Python ベースの枠組み。現代のゲームは複雑で非決定的なため、単一の scripted bot や研究プロトタイプだけでは、多様なプレイスタイルと edge case を拾いにくい、という問題設定から出発している。MIMIC-Py は personality traits を configurable inputs として露出し、planning、execution、memory を game-specific logic から分離する modular architecture を採る。ゲームとの接続は exposed API または synthesized code の複数方式を許し、新しい game environment への移植コストを下げることを狙う。FSE Companion '26 accepted の tool paper で、source code と demo video も project webpage にあるとされる。

## why_relevant_to_games

Nao_u_BOT の headless 評価で、単一 route / camper / blind-sweeper だけでなく「性格つきプレイヤー方針」を再利用可能な bot policy として切り出す時の参考になる。
