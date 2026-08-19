---
title: "Postmortem: Bringing an IP back to life with horror survival game Last Year"
url: "https://www.gamedeveloper.com/production/last-year-postmortem"
collected_at: "2026-08-19T09:31:14+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, live-service, community, legacy-code, production]
evaluated_at: "2026-08-19T09:34:15+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-19T09:34:15+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-19T09:34:15+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-18"
supersedes: []
gate_reason: >-
  停止作品の復旧を、権利・community・player progression・backend migration・legacy code・再公開時の scope 順序まで一続きの制作判断として分析できる。
  段階的 refactor と「まず既存購入者の版を戻す」方針は既存ゲームの再始動へ具体的に適用でき、CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "失われた運営基盤を復元しつつ、既存プレイヤーへの約束と将来開発の土台を両立した IP 再始動の postmortem"
  analysis_axis: "community の継続性、progression 保全を伴う backend 移行、restore-first の scope 設計、運営中の段階的 refactor の相互関係"
  application_target: "停止・長期休止した自作ゲームや古い prototype を再始動する際の、復旧版と刷新版の分離、save 互換性、技術負債解消の優先順位設計"
  pros_cons: "既存ユーザーの信頼と早期再公開を守れる一方、旧仕様・旧 asset・運営互換性を抱えたまま refactor するコストと、記事が開発側の自己報告である限界がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

著作権に配慮し、本文の重要箇所を逐語転載せず日本語の要点として記録する。Undaunted Games の studio head / producer である Matthew Itovitch が、2021年に server が停止した非対称型 survival horror『Last Year』の IP と残存 asset を取得し、再公開した過程を振り返る postmortem。前 studio の破産により IP と asset が売却対象になった一方、40,000人規模だった旧 Discord は失われ、継承した codebase には最適化・書き直しが必要な部分が残った。GameSparks 廃止への対応では Amazon と Code Wizards の協力を得て backend を AWS へ移行し、server data と既存 player の progression を保存した。

停止期間中も community mod の制作チームや original developers が作品を支え、mod trailer は約160,000 views を集めたと記される。再公開時には新しい方向へ即座に作り替えず、まず購入者が持っていた版を戻すことを優先した。その後に bug fix・balance change と並行して codebase の refactor、Unity 5 への更新、character model と map の改修、quality-of-life 改善を進め、未完成の Chapter 2 asset や console 版を含む将来開発の基盤を作る方針を示す。短い原文断片は “community was very much alive” と “now rather than later”。

## why_relevant_to_games

終了した live game を、community・player progression・legacy code・旧 creative vision を同時に引き継いで再始動する制作事例。既存作品の復旧、段階的 refactor、再公開時の scope 設計を考える場面に接続できる。
