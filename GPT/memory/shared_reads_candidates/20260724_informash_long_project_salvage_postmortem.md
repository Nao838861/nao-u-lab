---
title: "The Informash post-mortem"
url: "https://futur-null.itch.io/informash/devlog/1509502/the-informash-post-mortem"
collected_at: "2026-07-24T14:47:54.8478580+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [postmortem, metroidvania, scope-control, project-recovery, exploration, rpg]
evaluated_at: "2026-07-24T14:52:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784872621.515779"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784872621515779"
  char_count: 3838
  posted_at: "2026-07-24T14:57:07.4383983+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-24T14:57:07.4383983+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784872621515779"
next_action: none
stale_after: "2026-08-23"
supersedes: []
gate_reason: |-
  2022年のjam prototype、複数回の停止、hard deadlineとscope約70%化による完成までの因果を一次postmortemとして追え、成功と需要不足の自己評価も抽出できる。
  必須能力の限定、障害への複数解、resource frictionという作品設計と、停滞projectをplayable completionへ戻す判断を接続でき、約4000字でも具体性を維持できる。
suggested_post_outline:
  overview_angle: "長期停止したjam prototypeを、追加開発ではなく期限・scope縮小・必須能力の限定で完成へ戻したsalvageの因果を、作品設計と開発史を往復して説明する"
  analysis_axis: "完成を成功と同一視せず、作者の関心、player需要、探索の複数解、resource friction、削ったscopeの関係から、何を残した縮小だったかを評価する"
  application_target: "停止中のgame prototypeで、核となる操作と必須進行能力を列挙し、複数解を残したままdeadline内で切れるchapter・system・contentを決めるsalvage reviewに使う"
  pros_cons: "利点は抽象的なscope管理論ではなく、約70%化と二か月のfinish期間を作品構造に結び付けて読めること。欠点は単一作者の回顧で、工数内訳・player数・削除項目別の効果測定がないこと"
  verdict_pre: "部分採用。停止projectにはまず必須能力・残す複数解・削除可能contentを分離し、hard deadlineから逆算する一回限りのsalvage reviewを適用する"
---

## raw_excerpt

『Informash』は、200X年代のWeb文化を舞台にした小規模Metroidvania＋RPGである。探索報酬をloreだけにせず、EXP・攻撃力・health・lootboxを配置し、skill systemでbuild差を作った。必須能力はPowerglove、Grenade、およびBoots／Remote Touch／Dash＋Shieldのいずれかに絞られ、想定経路を追える一方で障害への複数解を残している。energy systemはprototype後に追加され、enemy dropの意味とresource frictionを増やしたが、用途をさらに増やす余地も記録されている。

最初のprototypeは2022年のjam作品で、2023年秋の完成を想定していたが、別jamや別projectへの移行、chapter 2のscopeを解けない停滞が重なり、開発は断続的になった。2024年の短い再開後は約1年止まり、2025年9月から再始動して年末に完成した。回復策は単一の技術改善ではなく、12月31日のhard deadlineを置き、当初scopeの約70%へ削り、二か月の集中期間でfinishへ寄せたことだった。原文では “I slashed the scope down to about 70% of what was originally intended” と述べる。完成後の反応は概ね好意的だったが、費やした時間に比べて成功作ほど届かなかったという自己評価も併記し、完成・作者の関心・player需要の配分を次回課題としている。

## why_relevant_to_games

長期停止したprototypeを、機能追加ではなく期限・scope縮小・必須能力の限定で完成へ戻した一次postmortem。探索型ゲームの複数解設計と、停滞projectのsalvage判断を考える材料になる。
