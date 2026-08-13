---
title: "Pushing the limits in Simulating a City, One Page at a Time"
url: https://www.gamedeveloper.com/design/pushing-the-limits-in-simulating-a-city-one-page-at-a-time
collected_at: "2026-08-13T23:47:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, production, documentation, simulation]
evaluated_at: "2026-08-13T23:51:10+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-13T23:56:55.826839+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786633015826839"
next_action: none
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  one-page design の狙い、複雑さを早期露出した実例、単一形式の限界、spreadsheet との hybrid 化、配布更新、制作後の参照性まで揃う。
  simulation と resource chain の設計を core-loop 図と数値表に分けて同期する具体策へ落とせ、CoopEval 水準の概要と批判的評価を構成できる。
suggested_post_outline:
  overview_angle: "SimCity の全制作期間を通じ、one-page design が複雑さの可視化から hybrid な設計共有へ変化した過程を追う"
  analysis_axis: "一枚に制約する圧縮効果と、simulation の詳細を spreadsheet へ分離して同期する境界設計"
  application_target: "Log_cdx の小規模 simulation prototype で、core loop・依存関係図と調整数値表を分離し、実装前レビューと更新配布を同じ周期へ入れる"
  pros_cons: "俯瞰性・複雑さの早期発見・共有の能動性が利点。図の制作コスト、数値詳細の収容限界、古版管理が欠点"
  verdict_pre: "部分採用"
posted:
  ts: "1786633015.826839"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786633015826839"
  char_count: 3878
  posted_at: "2026-08-13T23:56:55.826839+09:00"
---

## raw_excerpt

著作権に配慮し、長い逐語引用ではなく記事の要点を日本語で採取する。Danielle Riendeau が Stone Librande の GDC 2013 講演を再訪し、SimCity (2013) の pre-production から出荷まで one-page design だけで進められる範囲を追う。Librande は当初 5 人のチームで、複雑な設計を一枚の図へ落とし、印刷して目立つ場所に掲示する方法を実験した。初期 map の一部は制作の最後まで残り、multiplayer trading の図では構想が複雑化していることが実装投資前に露出した。一方、coal city の生産施設、module、支援要素、simulation への影響、reward、resource chain を一枚へ整理する要求や、磁石・card game を使った表現は時間がかかり、全ての情報を一形式で扱えない場面も出た。そこで CSV / spreadsheet を使いながら、色分けした統合 chart を各作業場所へ配布する hybrid へ移行した。high-level update のたびに古い紙を外して新版へ差し替え、重要な設計は人が見に来るのを待たず届ける運用にした。制作後の振り返りでは、3 年半前の図の一部も参照可能なままで、最上位構造から細部へ降りる project organization の土台として残ったと報告される。

## why_relevant_to_games

simulation、resource chain、multiplayer system のような相互依存の多い設計を、実装前の複雑さ検出とチーム共有へ接続する資料。小規模 prototype でも core loop と数値表をどう分離・同期するかを考える入口になる。
