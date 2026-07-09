---
title: "GameEngineBench: Evaluating Coding Agents on Real C++ Runtime Environments"
url: "https://arxiv.org/abs/2607.03525"
collected_at: "2026-07-09T15:41:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-engine, coding-agent, unreal-engine, evaluation, runtime-tests]
---

## raw_excerpt

arXiv:2607.03525。2026-07-03 投稿。coding agent を一般的な repository 修正ではなく、Unreal Engine 5 の既存 game project 内で C++ implementation task を解けるかとして評価する benchmark。game engine は real-time simulation、rendering、physics、interaction、networking、asset pipelines を含むため、stateful で interactive な software engineering 評価の testbed になるという位置づけ。GameEngineBench は 9 個の real-world game repositories から作られ、110 tasks を含む。範囲は gameplay mechanics、multiplayer behavior、AI and world orchestration、animation and movement、UI and session code、loading behavior、online-service integration、persistence、data serialization、XR behavior、rendering-oriented plugins など。task は native C++ changes が compile し、実行可能な Unreal Engine project 内の behavioral tests を満たす必要がある。12 configurations の評価では strongest model が 55.5% pass@1、31 tasks は全構成で未解決とされる。

## why_relevant_to_games

ブラウザ prototype でも「コードが通る」だけでなく、エンジン状態、実時間挙動、behavioral test に落とす評価観点が使える。将来の game agent 評価や headless harness 設計の候補素材。
