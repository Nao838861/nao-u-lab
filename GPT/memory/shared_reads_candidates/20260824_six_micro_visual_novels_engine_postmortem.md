---
title: "A Giant Postmortem for 6 Micro Visual Novels, or On Trying Out New VN Engines"
url: "https://itch.io/blog/1615249/a-giant-postmortem-for-6-micro-visual-novels-or-on-trying-out-new-vn-engines"
collected_at: "2026-08-24T12:05:46+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, visual-novel, engine-selection, rapid-prototyping, accessibility]
---

## raw_excerpt

原文短句: “gamedev is essentially one big puzzle as to how to get from nothing to something tangible and playable.”

取得メモ。Ren'Py で15本のVNを公開してきた作者が、6本のmicro visual novelを複数のjamに合わせて制作し、Godot + Dialogic 2、Decker、Light.vn、Narratを実作業で比較している。最初のGodot作品では「失敗しても笑える」jamを低圧の学習環境にし、tutorial閲覧だけでなく具体的な短編を完成させることでnode、signal、scene、exportへ触れた。ただしDialogic中心で作るとGodot本体の理解は浅いままになることも記録している。Deckerはcardへ直接描画しbuttonをつなぐだけでも動き、後の作品ではLilとmoduleへ進んだ。Godot作品では開発中に動いてもexport後にcrashし、旧projectの骨格へ移植して復旧した。Light.vnはlive previewと記述の易しさがある一方、Windows以外へのexport、web build、GUI差替え、英語圏から辿れるdocumentationが障壁になった。NarratはCSSに近いstyleとbrowser inspectorが既存技能に合い、作者には最も早く理解できた。総括では、engineの機能表だけでなく、public documentation、forum検索性、複数OSへのexport、web配布、accessibility機能、既存の制作習慣との距離が、短編を最後まで出せるかを左右するとしている。

## why_relevant_to_games

新しいengineや制作基盤を選ぶ際、機能比較だけでなく「短い完成作を複数作る」試験で学習曲線、export、配布先、文書、accessibilityまで確認する材料になる。
