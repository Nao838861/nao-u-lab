---
title: "Staying Lean: How We Built the World's Biggest Social Deduction Game"
url: "https://80.lv/articles/staying-lean-how-we-built-the-world-s-biggest-social-deduction-game"
collected_at: "2026-07-30T04:02:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, social-game, postmortem, live-ops, community-design, monetization]
evaluated_at: "2026-07-30T04:05:58+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-30T04:05:58+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-30T04:05:58+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-29"
supersedes: []
gate_reason: >-
  参加時の外部ツール依存を起点に、無料化・cosmetics 限定課金・友人グループ中心の retention・
  小規模チームの可逆な試作判断までが一つの因果として読める。年間最大 50 回の更新と約 30 人の
  組織規模もあり、具体的なゲーム制作へ接続した CoopEval 水準の分析を構成できる。
suggested_post_outline:
  overview_angle: "個人単位の継続率ではなく、友人グループ全体の参加摩擦を除くことを core loop・課金・運営・組織設計へ貫いた事例として解説する"
  analysis_axis: "voice chat 内製、無料化、cosmetics 限定、community 起点の獲得、短期試作の中止判断が同じ social graph の維持へ収束する因果を検証する"
  application_target: "Log_cdx の協力・対戦プロトタイプで、起動から同室参加までの摩擦、反復ごとの逸話生成、継続/中止ゲートを同じ評価票で測る"
  pros_cons: "長所は設計・事業・組織の判断基準が一貫する点。短所は単一タイトルの回顧であり、retention や施策効果の定量比較が限定的な点"
  verdict_pre: "部分採用"
---

## raw_excerpt

一次資料の要点メモ（逐語引用ではない）。Gaggle Studios の Shawn Fischtein は、Goose Goose Duck の出発点を「非ゲーマーを含む友人グループが遊ぶ際、外部 voice chat、lobby 管理、hack 対策、独自ルールの補完まで要求される」という social-play の摩擦に置く。そこで voice chat と player networking をゲーム内へ統合し、グループ全員が追加ツールなしで参加できるようにした。無料化も単なる価格施策ではなく、一人の支払い拒否がグループ全体の参加を止める問題を除く設計として説明される。map、character、mode は有料壁の外に置き、販売対象は group 内の自己表現に使う cosmetics に限定した。

運営では年間最大 50 回の content update を行うが、復帰を左右するのは追加 content より友人グループが残っているかだという観測を挙げる。大規模 streamer への有償露出より、小規模で結束した community に入り、部屋全体が遊び始めることを優先した。制作組織は約 30 人を維持し、企画を数日で試し、成立しなければ sunk cost に縛られず止める。記事は、social dynamics 自体が毎回異なる物語と配信可能な瞬間を生むこと、既知の mechanics に新しい着想を重ねること、規模拡大と有償の熱狂を急がないことを一貫した方針として記録している。

## why_relevant_to_games

social game の core loop を個人の反復報酬だけでなく「グループが摩擦なく集まり、毎回別の出来事を生成する条件」として設計する時の資料になる。小規模チームの prototype 継続・中止判断、live-ops、無料化と cosmetics の境界を同じ事例から追える。
