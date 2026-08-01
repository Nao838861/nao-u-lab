---
title: "Beckett: zero-sidecar MCP server for Godot 4.2+ (the AI sees, and optionally playtests, your game)"
url: "https://forum.godotengine.org/t/beckett-zero-sidecar-mcp-server-for-godot-4-2-the-ai-sees-and-optionally-playtests-your-game/141177"
collected_at: "2026-08-01T23:31:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [godot, ai-agent, playtesting, deterministic-testing, game-development-tools]
---

## raw_excerpt

作者による Godot Forum 投稿の要点メモ（逐語引用ではない）。Beckett は Godot editor 内で単一 GDScript EditorPlugin として動く MCP server で、AI assistant が project の inspect、author、run、observe を行う。Lite 版は running game の screenshot、remote scene tree、node state、performance monitor、log を読み、GDScript の validate-before-write、C# compile check、undo、batch rollback を備える。Full 版は input simulation、UI 操作、state・text・scene structure・screenshot の assert、physics frame の停止・step・条件待ちを加える。

v1.8 の playtest suite は入力 event に physics frame を記録し、新規 play session で frame-exact に replay して node state、GDScript expression、on-screen text、screenshot を pass/fail 判定する。headless runner から CI 実行もできる。v1.9 は replay 区間の frame time、fps、memory、orphan、draw call を測り baseline 差で performance regression を止める。v1.10 は visible control と被覆状態を構造化する UI snapshot、実際に届かない click の拒否、overlap・文字切れ・小さな touch target・gamepad 到達不能の audit を追加した。v1.12 は、reversed index buffer による invisible geometry を screenshot の推測だけで追って37分失った postmortem から、visibility chain、frustum、camera mask、material cull mode、triangle winding を段階別に返す render probe を導入した。

## why_relevant_to_games

AI にゲームを作らせる際、画面観察だけでなく frame 固定 input、state assert、UI 到達性、performance baseline、render pipeline の段階診断を組み合わせ、playable diff を再現可能な regression test へ変える実装例になる。
