---
title: "Three games, 10 years, one Unity project: Piecing together The Immortal John Triptych"
url: "https://unity.com/blog/immortal-john-triptych-joe-richardson-interview"
collected_at: "2026-09-01T09:34:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, adventure-game, production, migration, accessibility, solo-dev]
---

## raw_excerpt

一次資料抜粋メモ（内容を日本語で要約）。Joe Richardson は、Renaissance / medieval painting の断片を先に集めて scene を組み、完成した空間を歩きながら物同士の関係から puzzle を見つけ、story は最後に接続するという、一般的な greybox-first と逆向きの制作順を説明している。三作品を一つの Unity project に統合した際は、Unity 本体の更新より Adventure Creator の movement system 変更の方が大きく壊れ、最新版 Unity と数年前の plugin を併用した。別 project 間では variable、dialogue ID、scene name が衝突し、同名の “Town” scene が三つある状態も解消対象になった。console 向け controller 対応では、容易な virtual cursor を避けて direct character control を採用したため、歩いて届かない hotspot を右 stick で探す仕組みまで必要になった。一方、旧作の読みにくい dialogue box を新作の表示へ統一することで、文章自体を変えずに可読性を改善した。

## why_relevant_to_games

art-first から puzzle / story を発見する逆向き設計と、長寿 project の統合で起きる ID・plugin・入力方式の migration 問題を同じ制作事例で追える。adventure prototype の空間先行設計や、既存作品を壊さず現代的操作へ移す場面の参照候補になる。
