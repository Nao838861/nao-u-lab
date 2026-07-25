---
title: "Grappling with Success: Smooth Movement on an Indie Budget"
url: "https://gdcvault.com/play/1035867/Grappling-with-Success-Smooth-Movement"
collected_at: "2026-07-25T12:02:02.6349833+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, movement, game-feel, physics, indie-development, gdc]
---

## raw_excerpt

GDC 2026 で CAGE Studios の Salaar Kohari が行った、少人数・低予算の制作でも応答性と満足感のある traversal を組み立てるための講演。公式ページは冒頭で “Great traversal doesn't require a AAA team” と置き、必要なのは大規模な人員ではなく、意図を持った設計と物理の賢い利用だと説明する。扱う要素は、入力を取りこぼさない input buffering、キャラクターが可能な行動を境界込みで定義する move set、速度・距離・滞空などを調整可能にする metrics、移動と animation に物理を利用する構成。そこから grapple、wallrun、dash、jetpack といった複合移動を、入力を受けてから画面上の反応に至る “from input to pixel” の連鎖として組み立てる。

対象は tight platformer や expressive FPS に限定されず、キャラクター操作そのものをゲーム固有の identity にしたい小規模チーム全般。公式概要は、個々の派手機能を足すことより、入力受付、移動規則、測定可能な値、物理応答、表示までを一続きに扱う具体的な設計要素を列挙している。ページ上では GDC 2026 の Independent Development / Independent Games / Design セッションとして掲載され、講演ページは free content と表示されている。

## why_relevant_to_games

アクション試作で「移動が気持ちよい」を分解し、input buffer・move set・metrics・physics・animation のどこを実装または計測すべきか決める初期設計に使える。グラップルや壁走りを追加する前の game-feel 検証観点にも直結する。
