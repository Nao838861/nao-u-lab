---
title: "Dungeons & Desktops: Building a procedurally generated roguelike with GitHub Copilot CLI"
url: https://github.blog/ai-and-ml/github-copilot/dungeons-desktops-building-a-procedurally-generated-roguelike-with-github-copilot-cli/
collected_at: 2026-05-27T12:59:29+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [ai-assisted-development, roguelike, procedural-generation, prototyping, game-dev-workflow]
evaluated_at: 2026-05-27T13:02:23+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T13:04:57.895229+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779854697895229"
posted:
  ts: "1779854697.895229"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779854697895229"
  char_count: 3023
  posted_at: "2026-05-27T13:04:57.895229+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: >
  `/delegate` による挙動単位の非同期実装、PR としてのレビュー、roguelike の BSP map generation まで、問題設定・手法・適用先が候補内から抽出できる。
  「AI に全部作らせる」ではなく、設計者が言語化・差分確認・面白さ調整に戻るワークフローとして、Codex のゲーム制作サイクルへ具体的に接続できる。
suggested_post_outline:
  overview_angle: "Copilot CLI をゲーム制作の代替作者ではなく、挙動単位の差分を非同期に出す実装補助として読む。"
  analysis_axis: "委譲単位、PR レビュー、BSP による生成制約、設計者が戻るべき判断領域の四点で整理する。"
  application_target: "Nao_u_BOT の playable diff 制作で、敵挙動・難度上昇・デバッグ機能・生成説明器のような小タスクを agent に分け、headless 検証後に体験調整へ戻す運用に効く。"
  pros_cons: "メリットは実装委譲と設計判断を分離しやすいこと。デメリットは product blog 由来で、失敗例や比較評価の厚みが論文ほどはないこと。"
  verdict_pre: "部分採用"

---

## raw_excerpt
短い原文断片: "describing behavior instead of writing everything from scratch" / "stay in a game design mindset"

採録メモ: GitHub Blog の実作例。Copilot CLI の `/delegate` で、レベル進行に応じた難度上昇、チートコード、ダンジョン生成説明用の "dungeon scribe" などを非同期に任せ、生成結果を PR としてレビューしながら調整した、というワークフローを紹介している。記事後半では roguelike のマップ生成に BSP を使い、構造性、リプレイ性、到達可能性を同時に満たす考え方も説明している。AI 生成そのものより、設計者が挙動を言語化し、差分をレビューし、面白さの調整に戻る流れが採録ポイント。

## why_relevant_to_games
Codex のゲーム制作サイクルで、AIに「全部作らせる」よりも、挙動単位の小タスクを差分化し、headless 検証と人間の調整に戻す設計フローの参考になる。
