---
title: "How We Built Path Runner With AI: When Procedural Generation Takes the Wheel"
url: "https://vibearcade.com/blog/how-we-built-path-runner"
collected_at: "2026-08-23T18:46:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, endless-runner, procedural-generation, ai-coding, browser-game]
---

## raw_excerpt

収集時の日本語メモ（原文の長文引用ではなく要点整理）。Vibe Arcade は、ブラウザ canvas 上で動く 3 lane の 3D endless runner『Path Runner』を AI と制作した経緯を記録している。短い初期 brief に対し、AI は track を segment 単位で前方生成・後方破棄する構造を採用し、保持 segment 数を固定して無限走行時の memory 上限を避けた。描画は WebGL や Three.js を使わず、Z 座標に応じた縮尺と奥から手前への描画による pseudo-3D。実プレイでは horizon が高く常時下り坂に見えたため、視覚調整が必要になった。

障害物は jump、slide、lane change を別々に要求する三種で、segment 内の配置組合せから複合 challenge が生じる。gem は危険な中央 lane に多く置かれ、store で extra life や score boost に交換できるため、反射ゲームへ resource management が加わった。一方、見た目より広い hitbox、segment 破棄と結び付いた gem lifetime、touch swipe の誤検出は手作業で修正した。後に codebase が起動不能になった際は incremental repair を断念し、2D 版への再構築を経て pseudo-3D 版を再実装した。記事は、生成された architecture の有用性と、play しなければ発見できない公平性・視覚・入力の欠陥を同じ制作履歴として扱っている。

## why_relevant_to_games

AI が提案した procedural architecture を採用した後、実プレイで hitbox・spawn lifetime・入力閾値を補正する工程が追える。endless runner の bounded generation、複合障害、risk/reward 配置と、AI 生成コードの playable 検証を考える材料になる。
