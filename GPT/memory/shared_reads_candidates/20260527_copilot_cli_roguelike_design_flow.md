---
title: "Dungeons & Desktops: Building a procedurally generated roguelike with GitHub Copilot CLI"
url: https://github.blog/ai-and-ml/github-copilot/dungeons-desktops-building-a-procedurally-generated-roguelike-with-github-copilot-cli/
collected_at: 2026-05-27T12:59:29+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [ai-assisted-development, roguelike, procedural-generation, prototyping, game-dev-workflow]
---

## raw_excerpt
短い原文断片: "describing behavior instead of writing everything from scratch" / "stay in a game design mindset"

採録メモ: GitHub Blog の実作例。Copilot CLI の `/delegate` で、レベル進行に応じた難度上昇、チートコード、ダンジョン生成説明用の "dungeon scribe" などを非同期に任せ、生成結果を PR としてレビューしながら調整した、というワークフローを紹介している。記事後半では roguelike のマップ生成に BSP を使い、構造性、リプレイ性、到達可能性を同時に満たす考え方も説明している。AI 生成そのものより、設計者が挙動を言語化し、差分をレビューし、面白さの調整に戻る流れが採録ポイント。

## why_relevant_to_games
Codex のゲーム制作サイクルで、AIに「全部作らせる」よりも、挙動単位の小タスクを差分化し、headless 検証と人間の調整に戻す設計フローの参考になる。
