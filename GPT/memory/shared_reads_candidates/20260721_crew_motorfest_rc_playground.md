---
title: "Interview: Ubisoft Transformed The Crew Motorfest Into an RC Playground"
url: "https://80.lv/articles/interview-ubisoft-transformed-the-crew-motorfest-into-an-rc-playground"
collected_at: "2026-07-21T15:16:05.8418087+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, racing, physics, level-design, game-feel, live-service]
evaluated_at: "2026-07-21T15:23:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-21T15:23:07+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-21T15:23:07+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-20"
supersedes: []
gate_reason: >-
  物体 scale の変更を、既存 map の再解釈、専用 physics/camera、制作 workflow、10 event の段階導入まで一貫して設計した過程が具体的である。
  同じ空間から別の遊びを作る小規模 prototype に適用でき、実装コストと既存資産再利用の両面を含む約4000字の分析へ展開できる。
suggested_post_outline:
  overview_angle: "RC 化を単なる車両縮小ではなく、空間の affordance・物理・camera・学習順をまとめて変換する再設計として整理する。"
  analysis_axis: "scale による既存環境の再発見、toy-scale physics の作り直し、camera が走行判断へ与える効果、10 event の mechanic sequencing を軸に読む。"
  application_target: "自分達の小規模 prototype で、既存 map を移動速度・当たり判定・camera の変更で再利用し、少数 stage で新操作を順に教える設計に効く。"
  pros_cons: "利点は既存資産を新しい遊びへ変換できること。欠点は scale 変更が physics、camera、authoring tool、敵挙動まで波及し、見た目の縮小以上の実装費を伴うこと。"
  verdict_pre: "部分採用。RC 題材そのものではなく、scale change を content multiplier と onboarding sequence に接続する設計手順を採用する。"
---

## raw_excerpt

原文の要点を日本語で採録する。Ubisoft Ivory Tower の gameplay director Paul Narducci は、『The Crew Motorfest』Season 9 の RC Frenzy について、RC car という幼少期から共有される motorized fantasy を起点にしたと説明する。通常の車で時速 400 km なら通過してしまう路地、細い川、庭、屋根、縁石、柵の隙間が、RC scale では個別の level-design 要素になる。既存車両を縮小するだけでは、地面・水・空中での接触、suspension、grip、重量配分が成立しないため、physics は作り直し、jump、flip、水上走行にも専用処理を加えた。

屋根上 traversal と大 jump では、低い camera 位置から高低差を読み、jump を予測し、助走から着地までを納得できるものにする必要があった。制作は、RC 専用空間を新規設計する経路と、既存 open world の通路幅・surface・小物を調整して再発見させる経路を併用した。top-down camera は開発中の即興テストから生まれたが、実装後は corner、track 全体、対戦相手の読み方を変えた。10 event は handling、scale、新 camera を先に教え、後から jump、flip、top-down perspective を重ねる順序で構成された。player / enemy 共通の既存環境も RC の接触対象になるため、3C designer の authoring と tuning workflow も拡張された。

## why_relevant_to_games

同一 map を移動速度・物体 scale・camera の変更で別の遊び場へ変換する設計と、新 mechanic を段階導入する event sequence の収集例になる。
