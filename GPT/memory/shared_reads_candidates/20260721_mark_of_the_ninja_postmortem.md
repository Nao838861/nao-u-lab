---
title: "Classic Postmortem: Klei Entertainment's Mark of the Ninja"
url: "https://www.gamedeveloper.com/design/classic-postmortem-klei-entertainment-s-i-mark-of-the-ninja-i-"
collected_at: "2026-07-21T06:45:57.1601238+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, stealth, playtesting, level-design, production-tools]
evaluated_at: "2026-07-21T06:52:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-21T06:55:37.4628879+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784584531120939"
next_action: none
posted:
  ts: "1784584531.120939"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784584531120939"
  char_count: 4058
  posted_at: "2026-07-21T06:55:37.4628879+09:00"
stale_after: "2026-08-20"
supersedes: []
gate_reason: >-
  2D stealth の成立リスクから Observe / Plan / Execute / React、状態の二値化、初見 playtest、
  level tool 投資、能力廃棄まで、問題設定・手法・評価・結論を具体例と失敗込みで再構成できる。
  小規模ゲーム制作の試作順序、観察指標、反復コスト設計へ直接適用でき、約4000字の独立分析に耐える。
suggested_post_outline:
  overview_angle: "未知の2D stealthを、体験動詞の定義・情報状態の単純化・反復可能な制作基盤・初見観察で成立させた16か月の設計記録"
  analysis_axis: "プレイヤー中心の明瞭さとシステム複雑性の取捨選択、playtestで要望ではなく行動動機を読む方法、tool先行投資と後戻りコストの関係"
  application_target: "Log_cdx の短期ゲーム試作で、核となる動詞の事前定義、週次の初見観察、level変更コストを下げるeditor/tool整備、後半能力の採否ゲートへ適用する"
  pros_cons: "長所は設計・検証・制作工程が同じ事例で結ばれている点。短所は単一商用作品の回顧であり、数値比較や対照実験がなく、成功要因の因果は完全には分離できない点"
  verdict_pre: "部分採用。四段階モデル自体の転用ではなく、体験動詞→可読性→観察→廃棄判断を一続きの試作ゲートとして採用する"
---

## raw_excerpt

本文要点の日本語メモ（長い原文引用は避けて要約）: Klei Entertainment の Nels Anderson と Jamie Cheng が、16か月で制作した 2D ステルスゲーム『Mark of the Ninja』を振り返る。大きな設計リスクは、前例の少ない 2D ステルスが成立するか不明だったこと。Shank 2 の成熟した pipeline を土台にして試作へ早く入り、texture tiling と preview tool に数か月を投じ、レベル変更が art 全体の描き直しへ波及しない制作環境を作った。初見 player の playtest は週2回行い、要望をそのまま実装せず、なぜ戦闘したくなったか、なぜ tutorial を理解できなかったかという動機を調べた。light source の位置、複数対象を同時に狙わせる props、入力時の animation cue などを調整したが、公開 playtest の開始は開発8か月目で、もっと粗い段階から始めるべきだったとも記す。設計の核は Observe / Plan / Execute / React の四要素と、player-centric systems / intentional gameplay。3D stealth の慣習を写す代わりに、隠密状態を analog ではなく hidden / illuminated の二値にした。一方、初期は fire propagation や複雑な enemy reaction を作ったものの面白さへ結びつかず、数か月分の art / animation を捨てた。後半能力の air-dash と time-stop も試作後に不採用となり、採用した short-range teleport は level design の再作業を必要とした。終盤には全編 playtest と polish のため予定を3〜4か月延長し、level、control、cinematic、重複 item を調整した。

## why_relevant_to_games

新ジャンル試作で「ジャンル慣習」ではなく体験を構成する動詞へ戻る方法、初見 playtest から要望でなく行動動機を読む方法、反復可能性を level tool 側で確保する制作判断の参照になる。
