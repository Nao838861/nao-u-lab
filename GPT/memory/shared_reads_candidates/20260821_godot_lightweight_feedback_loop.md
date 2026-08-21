---
title: "Godot adoption is rising: what are devs getting out of the engine?"
url: "https://www.gamedeveloper.com/programming/godot-adoption-is-rising-what-are-devs-enjoying-about-the-engine-"
collected_at: "2026-08-21T13:46:04+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, engine, prototyping, iteration, godot]
evaluated_at: "2026-08-21T13:49:42+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-21T13:49:42+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-21T13:49:42+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  「軽量」を印象語で終わらせず、起動、機能実装、スクリプト停止、atomic な単体確認という
  観測可能な feedback loop へ分解し、2D shader 合成の具体的な弱点まで併記している。
  採用統計と開発者証言の限界を区別すれば、約4000字で制作環境の選定基準へ展開できる。
suggested_post_outline:
  overview_angle: "Godot の軽量性を容量や機能数ではなく、編集から個別機能の確認までの往復時間として解剖する"
  analysis_axis: "採用統計、開発者証言、短い feedback loop を生む構造、2D shader 制約を分離し、定量比較の欠如も限界として扱う"
  application_target: "Nao_u_BOT のゲーム制作で、起動→実装→単体確認→playable diff の所要時間を制作環境の評価項目にする"
  pros_cons: "利点はエンジン非依存で反復速度を測れること。欠点は証拠がインタビュー中心で、他エンジンとの統制比較ではないこと"
  verdict_pre: "部分採用（Godot 全面移行ではなく、feedback loop を制作環境の選定・改善指標として採用）"
---

## raw_excerpt

Game Developer が Godotcon 2026 の参加者へ、Godot を使い続ける理由を聞いた記事。記事が挙げる採用状況は、開発者パネルで Godot を主要エンジンと答えた割合が 12% で前年比 8 ポイント増、GMTK Game Jam 参加者では 47% が Godot を選んだというもの。複数の開発者が共通して挙げたのは「lightweight」であること、すなわちエディタの起動、機能実装、単体テストまでが速いことだった。

Xogot の Miguel de Icaza は、デバッガ停止中もエンジン全体ではなくユーザースクリプトだけが止まる構造に触れ、短い原文で “The feedback loop is incredible.” と述べる。別の開発チームは composition-focused な object model により機能を atomic に実行でき、専用のテスト用舞台を作らず個別機能を試せると説明した。低い動作要件、ソースコードを読めること、ドキュメントも選択理由として挙がる。一方で、2D オブジェクトへ複数 shader effect を重ねる際は subviewport などの回避策か複数 pass を統合した shader が必要で、余分な時間とファイルが増えるという具体的な不足も示されている。

## why_relevant_to_games

ゲーム試作でエンジン機能の多さではなく、起動→実装→単体確認の往復時間と構成単位の小ささを制作速度の入力として扱う材料になる。Godot 採用判断だけでなく、短い playable diff を繰り返す制作環境の評価項目へ接続できる。
