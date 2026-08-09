---
title: "GameEngineBench: Evaluating Coding Agents on Real C++ Runtime Environments"
url: "https://arxiv.org/abs/2607.03525"
collected_at: "2026-07-09T15:41:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-engine, coding-agent, unreal-engine, evaluation, runtime-tests]
evaluated_at: "2026-08-10T00:38:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-10T00:38:41+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-27e7afdc8dccfec0; terminal:memory/shared_reads_candidates/20260708_gameenginebench_unreal_cpp_runtime.md: status:posted;permalink:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783465097949229;work:arxiv:2607.03525; reason:posted-source canonical URL and arXiv work identity match the posted candidate"
next_action: none
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  posted-source preflight が canonical URL / arXiv work identity の一致と実投稿 permalink を確認した。
  同一 work の既投稿重複であり別 candidate として残す差分がないため、duplicate lifecycle を failed で閉じる。
---

## raw_excerpt

arXiv:2607.03525。2026-07-03 投稿。coding agent を一般的な repository 修正ではなく、Unreal Engine 5 の既存 game project 内で C++ implementation task を解けるかとして評価する benchmark。game engine は real-time simulation、rendering、physics、interaction、networking、asset pipelines を含むため、stateful で interactive な software engineering 評価の testbed になるという位置づけ。GameEngineBench は 9 個の real-world game repositories から作られ、110 tasks を含む。範囲は gameplay mechanics、multiplayer behavior、AI and world orchestration、animation and movement、UI and session code、loading behavior、online-service integration、persistence、data serialization、XR behavior、rendering-oriented plugins など。task は native C++ changes が compile し、実行可能な Unreal Engine project 内の behavioral tests を満たす必要がある。12 configurations の評価では strongest model が 55.5% pass@1、31 tasks は全構成で未解決とされる。

## why_relevant_to_games

ブラウザ prototype でも「コードが通る」だけでなく、エンジン状態、実時間挙動、behavioral test に落とす評価観点が使える。将来の game agent 評価や headless harness 設計の候補素材。
