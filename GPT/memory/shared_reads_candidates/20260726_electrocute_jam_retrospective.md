---
title: "Jam Retrospective - ElectroCute: Maximum Resistance"
url: "https://alwinson.itch.io/electrocute/devlog/1533942/jam-retrospective"
collected_at: "2026-07-26T05:45:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-jam, postmortem, playtesting, level-design, production]
evaluated_at: "2026-07-26T05:50:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-26T05:50:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-26T05:50:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-25"
supersedes: []
gate_reason: |-
  playable prototype 完成後も外部 feedback と level 制作を先送りした時系列、content trap の再発、具体的な回避策、burnout せず完成した結果まで抽出できる。
  core-loop 検証期限と content 移行条件というゲーム制作の具体場面へ直接適用でき、約4000字の独立した概要・分析を一次記録から構成できる。
suggested_post_outline:
  overview_angle: "早い playable prototype が、早い外部検証と content 制作を保証しなかった jam の時系列を解剖する"
  analysis_axis: "component progress と validated player experience を分け、共有延期と level 着手延期が同じ content trap を作る機構を分析する"
  application_target: "短期ゲーム制作で core-loop 外部検証の期限、component freeze、placeholder 前提の level 制作開始条件を設計する"
  pros_cons: "具体的な失敗時系列と対策は強い一方、単一 jam の自己報告であり各対策の比較検証はない"
  verdict_pre: "部分採用"
---

## raw_excerpt

GameDev.tv Game Jam 2026 作品『ElectroCute: Maximum Resistance』の retrospective。作者は、art / code / music を一通り覆い、複数人が統合作業を担えるチーム構成を高く評価している。最初の週末には、移動し、電流接続で静止した敵を倒す playable prototype と web build まで完成した。内部では connector 間を線で結ぶ操作が早い段階から楽しいと分かった一方、connector の種類、記号、puzzle など scope 候補の議論が core gameplay の確認より先行した。

作者は mid-week までに外部の人へ demo を見せるつもりだったが、「これを足してから共有しよう」という不足要素が次々に現れ、結局 core gameplay への外部 feedback を一度も得なかったと記す。短い原文断片は “There was always something missing.”。さらに、機能を増やしたのに level 制作は締切前日まで始まらず、前回の retrospective と同じ content trap を繰り返した。回避案として、手描き level draft がある企画だけを採用する、level/world building の専任を置く、jam 中盤で component 開発を止めて content 制作へ移る、placeholder を徹底して level building を先に高速化する、などを挙げている。作者が目標とする体験は、新ルールを覚えた直後に終わる一、二 level ではなく、数回の驚きがある「楽しい五分間」だった。

また、jam 前に git の使い方、tile / asset の export、code style、modularization、project template、engine basics といった team interface を短い手順として揃える必要も挙げる。最終的には日常生活を大きく削らず、burnout せずに完成物を出せたとしている。

## why_relevant_to_games

playable prototype の早さと、外部 playtest・level content の早さは別物だと分けて観察できる一次記録。短期制作で core loop の検証期限と content 制作開始条件を決める場面に参照できる。
