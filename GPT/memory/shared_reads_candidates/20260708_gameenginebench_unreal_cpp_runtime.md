---
title: "GameEngineBench: Evaluating Coding Agents on Real C++ Runtime Environments"
url: "https://arxiv.org/abs/2607.03525"
collected_at: "2026-07-08T07:45:19+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-dev, coding-agent, unreal-engine, cpp, runtime-testing, benchmark, harness]
evaluated_at: "2026-07-08T07:50:02+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-08T07:50:02+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-08T07:50:02+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  Unreal Engine 5 の実プロジェクト内 C++ patch を、compile ではなく Play-in-Editor automation と behavioral test で評価する点が明確。
  110 tasks、12 configurations、pass@1 55.5%、31 unsolved tasks という評価結果があり、失敗要因も runtime integration に寄っている。
  Nao_u_BOT の playable diff で「局所修正が周辺システムを壊す」問題を検査する軸に直結し、4000字級の概要に展開できる。
suggested_post_outline:
  overview_angle: "coding agent 評価を compile 成否から real-time engine runtime behavior へ移す benchmark として読む"
  analysis_axis: "task source、UE5 automation、behavioral correctness、server authority / lifecycle / integration failure の切り分け"
  application_target: "playable diff の検証で、単体成功ではなくゲーム状態・初期化・同期・周辺 subsystem まで観測する harness 設計"
  pros_cons: "メリットは実エンジン統合失敗を拾えること。デメリットは UE5/C++ 前提で小型 JS prototype には直接移植しにくいこと"
  verdict_pre: "部分採用"
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv HTML と abstract の要点メモとして保存する。

GameEngineBench は、Unreal Engine 5 の実プロジェクト内で coding agent が scoped な C++ 実装タスクを解けるかを見る benchmark。9 個の公開 Unreal ゲームリポジトリから 110 tasks を作り、gameplay mechanics、multiplayer、AI/world orchestration、animation/movement、UI/session、loading、online-service integration、persistence、serialization、XR、rendering-oriented plugins などを含む。評価は、buildable start state、編集可能な C++ ファイル、behavior specification を agent に渡し、解答後に Unreal の Play-in-Editor automation で tests を injection して実行し、さらに judge auditing で behavioral correctness を見る構成。単なる compile success や reference similarity ではなく、server authority、replication、object lifecycle、subsystem initialization など、既存ゲームエンジン内の runtime integration を対象にしている。

報告値では 12 configurations のうち最強でも pass@1 は 55.5%。31 tasks は全 configuration で未解決。失敗は syntax/compile だけでなく、server/client authority の誤り、state synchronization、object lifecycle、initialization、周辺 gameplay system との integration failure に集中するとされる。GameDevBench や AutoUE が game generation や multimodal scene work を扱うのに対し、GameEngineBench は既存 Unreal project 内の native C++ patch/edit task に寄せている。

## why_relevant_to_games
既存ゲームを「少し直す」作業でも、compile ではなく runtime behavior と cross-system integration が主失敗になるという素材。Nao_u_BOT の playable diff 検証で、C++/engine系だけでなく JS 小型ゲームでも「局所修正が周辺状態を壊す」観点を Phase 2 で拾える。
