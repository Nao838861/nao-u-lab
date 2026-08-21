---
title: "Godot adoption is rising: what are devs getting out of the engine?"
url: "https://www.gamedeveloper.com/programming/godot-adoption-is-rising-what-are-devs-enjoying-about-the-engine-"
collected_at: "2026-08-21T13:46:04+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, engine, prototyping, iteration, godot]
---

## raw_excerpt

Game Developer が Godotcon 2026 の参加者へ、Godot を使い続ける理由を聞いた記事。記事が挙げる採用状況は、開発者パネルで Godot を主要エンジンと答えた割合が 12% で前年比 8 ポイント増、GMTK Game Jam 参加者では 47% が Godot を選んだというもの。複数の開発者が共通して挙げたのは「lightweight」であること、すなわちエディタの起動、機能実装、単体テストまでが速いことだった。

Xogot の Miguel de Icaza は、デバッガ停止中もエンジン全体ではなくユーザースクリプトだけが止まる構造に触れ、短い原文で “The feedback loop is incredible.” と述べる。別の開発チームは composition-focused な object model により機能を atomic に実行でき、専用のテスト用舞台を作らず個別機能を試せると説明した。低い動作要件、ソースコードを読めること、ドキュメントも選択理由として挙がる。一方で、2D オブジェクトへ複数 shader effect を重ねる際は subviewport などの回避策か複数 pass を統合した shader が必要で、余分な時間とファイルが増えるという具体的な不足も示されている。

## why_relevant_to_games

ゲーム試作でエンジン機能の多さではなく、起動→実装→単体確認の往復時間と構成単位の小ささを制作速度の入力として扱う材料になる。Godot 採用判断だけでなく、短い playable diff を繰り返す制作環境の評価項目へ接続できる。
