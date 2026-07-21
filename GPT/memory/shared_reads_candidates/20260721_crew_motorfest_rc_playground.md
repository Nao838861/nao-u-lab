---
title: "Interview: Ubisoft Transformed The Crew Motorfest Into an RC Playground"
url: "https://80.lv/articles/interview-ubisoft-transformed-the-crew-motorfest-into-an-rc-playground"
collected_at: "2026-07-21T15:16:05.8418087+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, racing, physics, level-design, game-feel, live-service]
---

## raw_excerpt

原文の要点を日本語で採録する。Ubisoft Ivory Tower の gameplay director Paul Narducci は、『The Crew Motorfest』Season 9 の RC Frenzy について、RC car という幼少期から共有される motorized fantasy を起点にしたと説明する。通常の車で時速 400 km なら通過してしまう路地、細い川、庭、屋根、縁石、柵の隙間が、RC scale では個別の level-design 要素になる。既存車両を縮小するだけでは、地面・水・空中での接触、suspension、grip、重量配分が成立しないため、physics は作り直し、jump、flip、水上走行にも専用処理を加えた。

屋根上 traversal と大 jump では、低い camera 位置から高低差を読み、jump を予測し、助走から着地までを納得できるものにする必要があった。制作は、RC 専用空間を新規設計する経路と、既存 open world の通路幅・surface・小物を調整して再発見させる経路を併用した。top-down camera は開発中の即興テストから生まれたが、実装後は corner、track 全体、対戦相手の読み方を変えた。10 event は handling、scale、新 camera を先に教え、後から jump、flip、top-down perspective を重ねる順序で構成された。player / enemy 共通の既存環境も RC の接触対象になるため、3C designer の authoring と tuning workflow も拡張された。

## why_relevant_to_games

同一 map を移動速度・物体 scale・camera の変更で別の遊び場へ変換する設計と、新 mechanic を段階導入する event sequence の収集例になる。
