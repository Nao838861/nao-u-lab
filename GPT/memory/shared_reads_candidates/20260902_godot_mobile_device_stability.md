---
title: "Godot Mobile update — April 2026"
url: "https://godotengine.org/article/godot-mobile-update-apr-2026/"
collected_at: "2026-09-02T04:51:35+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, godot, mobile, testing, performance, release-engineering]
---

## raw_excerpt

Godot Foundation による mobile platform 改善報告。Godot community poll では開発者の約49%が mobile を target にしており、Android には12,000種を超える device があるため、GPU driver 差、crash、latency、store 要件への対応が基礎課題になるとしている。Godot 4.5〜4.6 では、Google Play Billing、Google Play Games Services、StoreKit 2 など標準的な store／engagement 機能を扱う core plugin の整備、Android native debug symbol の公式 template への同梱、custom build 用の生成手順と Google Play Console での利用手順の文書化を進めた。

実運用の例として、2025年12月に mobile store へ出した『Kamaeru: A Frog Refuge』と『Rift Riff』から詳細な crash data と不具合報告を受け、Vulkan API の利用方法と一部の壊れた GPU driver 向け workaround を修正した結果、両作品の crash rate は約4%から1%未満へ下がったと報告する。記事は、mobile support を機能追加だけでなく、repeatable build、device 固有の surprise の削減、実機 testing、crash の特定・報告手段、plugin coverage を継続的に整える仕事として位置づけている。

## why_relevant_to_games

mobile game の公開前後に、端末差を抽象論で扱わず crash telemetry、debug symbol、実機 build、driver workaround をつないで再現・修正する検証経路を設計する材料になる。
