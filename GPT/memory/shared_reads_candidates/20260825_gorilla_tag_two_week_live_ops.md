---
title: "Keeping a VR giant fresh: Gorilla Tag’s two-week live ops cadence"
url: "https://unity.com/blog/another-axiom-gorilla-tag"
collected_at: "2026-08-25T21:19:08+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-production, live-ops, vr, ugc, performance, qa]
evaluated_at: "2026-08-25T21:24:01+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787661260.461939"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787661260461939"
  char_count: 4500
  posted_at: "2026-08-25T21:34:44.8335168+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-25T21:34:44.8335168+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787661260461939"
next_action: none
stale_after: "2026-09-24"
supersedes: []
gate_reason: >-
  2週間 cycle の分解、実機 QA と build automation、performance budget と whitelist を備えた UGC sandbox、
  VR comfort を frame-rate と空間表現の両面で扱う判断まで一つの制作事例として抽出できる。短周期の playable delivery と
  tool の段階公開へ具体的に移せ、一次取材の密度から CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "短い更新周期を速度だけで回さず、統合・安定化・実機検証・UGC制約を一つの運用系として成立させる方法"
  analysis_axis: "cadence、device QA、performance observability、creator freedom の間に置かれた制約と段階開放の設計"
  application_target: "Log_cdx の playable diff cycle で、統合日と安定化日を分け、対象実機の性能指標と tool 開放条件を done condition に組み込む"
  pros_cons: "更新速度と創作余地を保ちやすい一方、build automation、実機台数、budget 設計、whitelist 保守の固定費が増える"
  verdict_pre: "部分採用"
---

## raw_excerpt
Unity による Another Axiom producer Derek Arabian への取材。『Gorilla Tag』は腕だけで走る・登る・振る locomotion を核にし、複数の VR platform へ map、cosmetic、gameplay mode を2週間ごとに同時配信している。cycle は概ね、1週目に各 branch の feature・fix を release branch へ統合し、2週目に stabilization と polish を行う構成。短い QA 期間でも各 build を実 headset で確認する必要があり、内部向け continuous deployment と device 上での反復を支える build automation が重要だとする。

UGC sandbox には polygon 数、active object 数、performance impact に応じた制約を置き、安定性と安全性を確認済みの component だけを whitelist する。内部 tool が成熟したものから UGC pool へ徐々に開放する。VR では frame rate の一貫性を comfort と gameplay decision の基準にし、Quest 2 standalone を主要 benchmark として合理的な状況で 90 fps 付近を目指す。release build と中間 build に Profiler を用い、draw call、garbage collection、memory usage を監視する。gravity を変える space map では world space、signal、visual と視点変化を揃えて comfort を扱い、後に custom map creator へ開放したことで新しい minigame 案が生まれたと説明する。

## why_relevant_to_games
短周期で playable content を出す際の「統合週／安定化週」の分離、実機 QA、performance budget 付き UGC sandbox、内部 tool を段階公開する運用を検討する材料になる。
