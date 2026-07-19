---
title: "Deep Dive: A framework for generative music in video games"
url: "https://www.gamedeveloper.com/audio/deep-dive-generative-music-in-video-games"
collected_at: "2026-07-20T06:02:08.1127293+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-audio, adaptive-music, generative-music, player-experience, mechanics]
---

## raw_excerpt

本文採録（忠実な要点）: adaptive music はゲームの非線形な進行へ追従できる一方、分岐が増えるほど作曲・実装作業が急増する。産業側の典型は、人間が事前に作曲・演奏した短い素材を実行時に並べ替える方式で、計算量は小さいが素材制作の負担と、どの断片同士も接続できるよう表現幅が狭まる問題が残る。学術側の典型は、感情値からリアルタイム作曲まで自動化する方式だが、既存比較ではゲーム感情への一致が高い一方、音楽品質の低さから没入感が下がった。

著者らは両者の橋渡しとして、人間による offline composition / performance、MMM による offline generation、実行時の automated arrangement を組み合わせる。8小節 MIDI の任意の楽器・小節を選び、周囲の譜面を条件に MMM が置換し、Ableton Live の VST で演奏品質を確保する。制御側の PreGLAM は画面上の敵数だけでなく、game mechanics 内のイベントを Emotionally Evocative Game Events として記述し、mood を基準に valence・arousal・tension を毎秒4回出力する。被弾などの過去イベントに加え、コード上では確定している重攻撃などの予告イベントも扱い、出来事の直前から音楽遷移を開始する。研究用 action RPG “Galactic Defense” へ統合し、生成 adaptive、作曲 adaptive、作曲 linear を、近い楽器編成・様式・機能・演奏品質で比較する構成を採った。

## why_relevant_to_games

ゲームイベントの原因と将来予告を音楽制御へ接続する設計は、hit・parry・boss phase などの体験曲線を視覚演出とは別系統で検証する場面に使える。小規模制作でも、作曲済み素材と部分生成を分ける prototype の参考になる。
