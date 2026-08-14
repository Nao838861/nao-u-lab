---
title: "'Millimeters matter:' Making the Steam Controller 'just work' on day one"
url: "https://www.gamedeveloper.com/pc/-millimeters-matter-inside-the-steam-controller-s-flawless-physical-design"
collected_at: "2026-08-14T09:46:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, controls, onboarding, playtesting, accessibility, hardware]
evaluated_at: "2026-08-14T09:49:58+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786668938.237989"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786668938237989"
  char_count: 4366
  posted_at: "2026-08-14T09:55:54+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-14T09:55:54+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786668938237989"
next_action: none
stale_after: "2026-09-13"
supersedes: []
gate_reason: >-
  初代の高い学習曲線を、既存の身体的慣習、time-to-game、数 mm 単位の形状比較、mixed input 検査へ分解した設計判断が具体的である。
  定量比較はないが、問題設定・試作評価・結論とゲーム側の再現可能な検査項目が揃い、約4000字の概要と適用分析を根拠を薄めず構成できる。
suggested_post_outline:
  overview_angle: "新規入力の価値を残しつつ、既知の操作慣習と初回起動までの摩擦を設計対象に戻した Steam Controller の反復設計"
  analysis_axis: "time-to-game、身体寸法差を拾う prototype 比較、既定値と customization の二層化、mixed input failure の4軸"
  application_target: "Log_cdx の操作プロトタイプで、初回入力成立までの計測、対象プレイヤー別の配置比較、入力方式切替時の UI/state 回帰テストを同じ playtest checklist にする"
  pros_cons: "既存慣習を足場に新規性を試せ、mm 単位の差と入力混在不具合を早期発見できる。一方、ハードウェア取材由来で定量結果がなく、個別ゲームへの閾値は別途検証が要る"
  verdict_pre: "部分採用"
---

## raw_excerpt

Game Developer が Valve の Lawrence Yang と Jeremy Slocum に取材し、新しい Steam Controller を箱からゲーム開始までほぼ迷わず使える状態へ近づけた設計過程を扱う。初代 Steam Controller は mouse / keyboard 向けゲームを携帯操作へ移す新規性があった一方、通常の gamepad 前提タイトルでは扱いにくく、慣れていない利用者には学習曲線が高かった。新型では、人々が既に身につけた controller の操作慣習を基準に置き、開封、Steam Puck の接続、自動認識と firmware 更新という短い “time to game” を設計した。Puck は pairing、充電、PC 周辺の無線干渉という複数の摩擦を一つの接続経路で減らす。

物理形状では Steam Deck を基礎に、rear button を自然に中指・薬指が届く grip 曲面へ移し、D-pad はそれを常用する 2D action / fighting game の利用者を含む recruiting profile で検証した。外見上はほぼ同じ 3D print prototype でも数 mm の差を利用者が即座に区別し、好みが分かれたため、開発側は “millimeters matter” として手の大きさや能力差をまたぐ配置を探った。software 側では custom configuration を強みにしつつ、設定を触らない人にも既定 gamepad として成立させる。また controller と mouse / keyboard を同時利用する “mixed input” で、ゲーム側が入力方式を排他的に想定すると表示や操作が崩れる点も開発者向けの検査項目として挙げている。

## why_relevant_to_games

操作系の新規性を足す時、初回起動までの摩擦、既存の身体的慣習、対象プレイヤー別の微差テスト、混在入力時の UI / input state を同じ onboarding・playtest 課題として収集できる。
