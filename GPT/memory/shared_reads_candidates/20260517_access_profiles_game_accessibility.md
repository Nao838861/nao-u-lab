---
title: "Reimagining Infrastructure for Video Game Accessibility: Exploring Access Profiles with Players with Disabilities and Game Designer-Developers"
url: "https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2026.1823366/full"
collected_at: "2026-05-17T01:29:32+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, accessibility, player-experience, infrastructure]
candidate_status: postponed
evaluated_at: "2026-07-25T18:50:06+09:00"
stale_after: "2026-08-24"
supersedes: []
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
last_reviewed_at: "2026-07-25T18:50:06+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-25T18:50:06+09:00; full method and evaluation evidence unavailable in candidate snapshot"
next_action: revise_or_research
gate_reason: |-
  accessibility feature を個別オプションではなく、player/developer/engine/launcher/retailer を結ぶ Access Profiles という基盤として扱う問題設定と着想が明確。
  ただし candidate snapshot は abstract と書誌情報中心で、参加者、調査手順、分析過程、結果の細部がなく、原文準拠の約4000字概要にはまだ不足する。
  formatted version など一次資料の方法・評価部分を確認できる時点まで postpone とする。

---

## raw_excerpt

Frontiers in Computer Science 2026 の accessibility 研究。短い引用としては、著者らは Access Profiles を "multi-directional communication" の枠組みとして提示している。本文要旨メモ: ゲームの字幕、auto-aim、入力補助などの accessibility feature は存在しても、提供品質・文書化・発見可能性がばらつく。そこで Access Profiles (AP) を、プレイヤー側の必要条件、開発者側の実装・文書化、販売/ランチャー/ゲームエンジン側の発見・設定支援をつなぐ基盤として扱う。質的研究では、AP が障害のあるプレイヤーのゲーム探索や初回設定を助ける可能性、同時に個別ゲームだけでなく engine、retailer、launcher まで含む ecosystem 側の変更が必要になる点を述べている。

## why_relevant_to_games

新作プロトタイプで「遊べる」の定義を健常な標準入力だけに閉じないための候補。UI/入力/難度設定を後付け機能ではなく、ゲーム発見・初回体験・設定保存まで含む設計対象として扱える。
