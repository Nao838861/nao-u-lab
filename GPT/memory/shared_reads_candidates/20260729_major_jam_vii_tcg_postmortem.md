---
title: "Major Jam VII Postmortem"
url: "https://itch.io/blog/960870/major-jam-vii-postmortem"
collected_at: "2026-07-29T17:18:01.6762880+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, card-game, mechanics, postmortem, game-jam, scope]
---

## raw_excerpt

原文短摘: “All of the mechanically cool ideas I had pretty much flipped up into 2 to 4 different subsystems I didn't consider.”

Major Jam 7 の制約「Unpredictable Rules」から、作者はルールを重ね、破り、変えられる TCG を選んだ。初期案は、伏せたカードを dice で表し、移動後に表へ返して攻撃する二人用カードゲーム。Survivor、Feat、Scheme の三種、伏せ札を置く party zone、移動と戦闘、draft 中に手放されたカードが後で復讐する仕掛けなどを設計した。しかし、伏せ札の正体を隠したまま移動値を扱うこと、盤上の物理表現と内部データを分けること、手札から盤面へ配置すること、party zone と board の状態を同期することが、それぞれ別の subsystem を要求した。作者の見積りでは「2〜4」のつもりだった機構が実質「8〜16」に膨らみ、巨大な await coroutine 列と global state に集中した実装は debug が難しく、締切までに完成しなかった。本文では、card / game functionality 用の専用 test subsystem を本体実装と同程度に重視すべきだったと振り返る。締切後は dice を card 表示へ統合して同期対象を減らし、30分未満で実装できた round 間 draft は大きな gameplay 効果を得た一方、複数の案を削除した。次回は jam 前半終了時点で feature freeze する方針を記している。

## why_relevant_to_games

短期プロトタイプで「1 mechanic が暗黙に要求する subsystem 数」を見積もる場面と、表現上の二重状態を削って playable diff を早く作る場面に使える収集例。
