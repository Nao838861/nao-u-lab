---
title: "Honing the Blade: Evolving Combat for 'Ghost of Yōtei'"
url: "https://schedule.gdconf.com/session/honing-the-blade-evolving-combat-for-ghost-of-ytei/913736"
collected_at: "2026-07-11T00:14:55+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, combat-design, sequel-design, systems-design, gdc2026]
evaluated_at: "2026-07-11T00:18:30+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
posted:
  ts: "1783697066.614029"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783697066614029"
  char_count: 3777
  posted_at: "2026-07-11T00:24:39.5253918+09:00"
last_reviewed_at: "2026-07-11T00:24:39.5253918+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783697066614029"
next_action: none
stale_after: "2026-08-10"
supersedes: []
gate_reason: >-
  続編で「前作の中核を壊さずに何を増やすか」という問題設定、retroactive pillars、70/30 配分、disarm / melee weapons / stance integration / boss expectations まで判断材料がある。
  実験論文ではないが、戦闘感触を数値調整ではなく attack timing と sequence variation に落とす設計論として、ゲーム制作への適用先が具体的。
suggested_post_outline:
  overview_angle: "前作の成功感を retroactive pillars として言語化し、70/30 の配分で新要素を足す続編戦闘設計として読む"
  analysis_axis: "core fantasy を守る制約、敵 variation と parry 依存の解消、weapon / stance / boss の期待管理を分けて分析する"
  application_target: "Nao_u_BOT の既存プロトタイプ改修で、成功感を先に固定し、追加メカニクスを感触・攻撃順序・敵行動の変化として検証する時の評価軸"
  pros_cons: "強みは小規模制作にも使える変更配分と feel 保護の言語化。弱みは講演要旨ベースで実測評価や失敗例の細部が不足する点"
  verdict_pre: "部分採用"
---

## raw_excerpt

短い原文断片: "improves on the original but doesn't ruin what makes it great"

GDC 2026 の Sucker Punch Productions 講演。対象は Ghost of Yōtei の戦闘設計で、前作 Ghost of Tsushima の核となる感触やプレイヤーファンタジーを保ちながら、続編として新しい領域へ進む設計プロセスを扱う。講演概要では、最初に残すべき戦闘要素と探索する新要素を高レベル pitch として整理し、その後、プレイヤーや敵の disarm、複数 melee weapons、stance system との統合、敵バリエーションの増やし方、boss fight と Yōtei 6 への期待値合わせを掘るとされている。

Invisible Friends の GDC 2026 現地レポートでは、この講演を「結果だけではなく判断前の思考を説明した設計セッション」として紹介している。レポートによると、チームは前作が実際に届けた価値を retroactive pillars として名づけ、70/30 の配分で既存の強みを保ちつつ新規要素を入れた。特に敵バリエーションについて、単発 parry で combo を中断できる構造が敵設計の幅を狭めていたため、連続 parry を要求する方向へ変え、HP や damage の数値盛りではなく、attack timing と sequence の差で難度とバリエーションを作る話が出ている。

## why_relevant_to_games

続編や既存プロトタイプ改修で、何を守り何を変えるかを「感触」ではなく pillars と core fantasy に落とす参考になる。Nao_u_BOT の小規模ゲームでも、敵や入力系を増やす前に、既存の成功感を記述してから変化量を決める時に効きそう。
