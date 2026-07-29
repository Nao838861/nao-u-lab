---
title: "Major Jam VII Postmortem"
url: "https://itch.io/blog/960870/major-jam-vii-postmortem"
collected_at: "2026-07-29T17:18:01.6762880+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, card-game, mechanics, postmortem, game-jam, scope]
evaluated_at: "2026-07-29T17:24:34.3683544+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-29T17:24:34.3683544+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-29T17:24:34.3683544+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-28"
supersedes: []
gate_reason: >-
  ルールの面白さを増やした結果、伏せ札・盤面・手札の表現差が状態同期と実装 subsystem を連鎖的に増やした過程、
  締切後に同期対象と機能を削って完成へ近づけた対処、次回の feature freeze までが具体的に揃う。
  単一 jam の回顧で定量評価はないが、短期プロトタイプの scope と状態表現を診断する約4000字の分析へ十分展開できる。
suggested_post_outline:
  overview_angle: "TCG の一機構が状態表現・同期・操作・テストへ分岐し、見積りを2〜4倍ではなく8〜16 subsystem 相当に膨らませた失敗と縮退策を時系列で解説する"
  analysis_axis: "mechanic 数ではなく状態表現の数・同期境界・未検証 interaction 数で scope を測るという軸で、巨大 coroutine と global state が debug 可能性を失った因果を読む"
  application_target: "Log_cdx の短期ゲーム制作で、着手前に mechanic-to-subsystem map を作り、同一情報の二重表現を避け、前半終了時の feature freeze と専用 test seam を設ける判断に使う"
  pros_cons: "利点は失敗の因果と削減後の改善が実装粒度で具体的なこと。弱点は単一作者の回顧で、工数・不具合数・playtest 結果の定量比較がないこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文短摘: “All of the mechanically cool ideas I had pretty much flipped up into 2 to 4 different subsystems I didn't consider.”

Major Jam 7 の制約「Unpredictable Rules」から、作者はルールを重ね、破り、変えられる TCG を選んだ。初期案は、伏せたカードを dice で表し、移動後に表へ返して攻撃する二人用カードゲーム。Survivor、Feat、Scheme の三種、伏せ札を置く party zone、移動と戦闘、draft 中に手放されたカードが後で復讐する仕掛けなどを設計した。しかし、伏せ札の正体を隠したまま移動値を扱うこと、盤上の物理表現と内部データを分けること、手札から盤面へ配置すること、party zone と board の状態を同期することが、それぞれ別の subsystem を要求した。作者の見積りでは「2〜4」のつもりだった機構が実質「8〜16」に膨らみ、巨大な await coroutine 列と global state に集中した実装は debug が難しく、締切までに完成しなかった。本文では、card / game functionality 用の専用 test subsystem を本体実装と同程度に重視すべきだったと振り返る。締切後は dice を card 表示へ統合して同期対象を減らし、30分未満で実装できた round 間 draft は大きな gameplay 効果を得た一方、複数の案を削除した。次回は jam 前半終了時点で feature freeze する方針を記している。

## why_relevant_to_games

短期プロトタイプで「1 mechanic が暗黙に要求する subsystem 数」を見積もる場面と、表現上の二重状態を削って playable diff を早く作る場面に使える収集例。
