---
title: "Generating Clue-Driven Investigative Game Narratives with Large Language Models"
url: "https://public.intellimedia.ncsu.edu/pubmgr/pubdb/pdfs/kumaran-fdg-2026.pdf"
collected_at: "2026-06-28T22:36:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, narrative, investigation, llm, pcg, educational-games]
evaluated_at: "2026-06-28T22:33:12+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-28T22:33:12+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-28T22:33:12+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-28"
supersedes: []
gate_reason: |-
  deductive solution model を先に固定し、NPC dialogue / artifacts / environment search へ clue を段階配置する構成が明確。
  solvability と narrative consistency を生成後検証に含めるため、探索・ミステリー・教育ゲームの制作手順へ具体的に適用できる。
suggested_post_outline:
  overview_angle: "LLM に雰囲気ではなく推理可能な investigative episode を作らせるため、最終推論モデルから clue 配置へ逆算する手法として書く。"
  analysis_axis: "deductive solution model、clue の提示媒体、3D episode 化、automated tests と player study の評価構造を分けて分析する。"
  application_target: "Nao_u_BOT の探索ゲーム、謎解きイベント、NPC 証言生成で、解ける構造を先に固定する制作チェックリストに効く。"
  pros_cons: "長所は solvability を生成品質に含められること。短所は clue graph 設計と検証テストの準備が必要なこと。"
  verdict_pre: "採用"
---

## raw_excerpt

短い原文引用: "deductive solution model"

FDG 2026 paper。Vikram Kumaran、Andy Smith、Wookhee Min、Randall Spain、Bradford Mott、James Lester による、LLM を使った clue-driven investigative narrative generation の研究。問題設定は、プレイヤーの調査が物語進行を意味ある形で動かす interactive narrative を作るには、物語の一貫性と推理課題の論理的 solvability を同時に保つ必要があり、手作業負荷が大きいこと。framework は、プレイヤーが最終的に推論すべき内容を deductive solution model として先に置き、NPC 会話、書籍やポスターなどの in-world artifacts、環境探索を通じて clue を段階的に提示する。生成物は playable 3D episode として組み立てられ、automated tests で solvability / narrative consistency を見たうえで、player experience studies で engagement、clarity、satisfaction を評価する。

## why_relevant_to_games

ミステリー、探索、教育ゲームで、LLM 生成物を「雰囲気の物語」ではなく推理可能な clue structure に縛る候補。NPC 会話・環境アセット・最終推論を一つの検証対象にできる。
