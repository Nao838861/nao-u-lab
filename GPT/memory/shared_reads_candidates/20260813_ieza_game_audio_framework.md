---
title: "IEZA: A Framework For Game Audio"
url: "https://www.gamedeveloper.com/audio/ieza-a-framework-for-game-audio"
collected_at: "2026-08-13T12:01:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-audio, game-design, accessibility, feedback, framework]
evaluated_at: "2026-08-13T12:04:36+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-13T12:04:36+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-13T12:04:36+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  音響を制作物の種類ではなく、世界内外と activity/setting の二軸で整理する中核手法、
  学生作品での教育利用、限界まで抽出できる。操作フィードバック、環境設計、感情誘導を
  同じ監査表で点検でき、ゲーム制作への適用が具体的で約4000字の独立分析に耐える。
suggested_post_outline:
  overview_angle: "音を四分類する記事ではなく、プレイヤーへ渡す情報と feel の欠落を発見する設計座標として説明する"
  analysis_axis: "diegetic/non-diegetic と activity/setting の直交性、四領域の分業、教育事例の示唆と実証上の限界"
  application_target: "Log_cdx のプロトタイプ評価で、入力反応・世界内因果・空間の気配・感情文脈を四象限ごとに監査する"
  pros_cons: "少ない語彙で欠落と過密を発見できる一方、音の重複機能やミックス品質、アクセシビリティを分類だけでは判定できない"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文はゲーム音響の働きを、音声・効果音・音楽という制作工程別の分類ではなく、二つの直交軸で捉える。第一軸は、足音や武器音のようにゲーム世界内の音源へ結び付く diegetic と、HUD 通知や背景音楽のように世界外から聞こえる non-diegetic。第二軸は、プレイヤー操作やゲームイベントを伝える activity と、空間・感情・文化的な状況を伝える setting である。この組合せから、Interface（世界外の活動）、Effect（世界内の活動）、Zone（世界内の設定）、Affect（世界外の設定）の四領域を得る。Effect は操作と出来事への即時反応、Zone は環境の一体的な気配、Interface は HUD や状態変化、Affect は音楽などによる感情・文化的文脈を担う。著者らは activity 側が具体的なデータ伝達、setting 側がゲームの feel の伝達に向くと述べる。教育利用では、この枠組みを教えた学生作品に、より理解しやすい音の分離と多様な音響世界が見られたという。原文中の機能定義は “Helping the player play the game by providing necessary gameplay information.”

## why_relevant_to_games

プロトタイプの音を「雰囲気用」「効果音」で一括せず、操作フィードバック・世界内の因果・環境の気配・感情誘導のどこが欠けているか点検する設計語彙として使える。
