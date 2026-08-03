---
title: "Design Postmortem: Story-Driven Roguelike, Sproggiwood"
url: "https://www.gamedeveloper.com/design/design-postmortem-story-driven-roguelike-sproggiwood"
collected_at: "2026-08-03T09:32:47+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, roguelike, postmortem, hybrid-design, playtesting]
evaluated_at: "2026-08-03T09:37:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785717761.965769"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785717761965769"
  char_count: 4485
  posted_at: "2026-08-03T09:43:02.6290186+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-03T09:43:02.6290186+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785717761965769"
next_action: none
stale_after: "2026-09-02"
supersedes: []
gate_reason: >-
  直交した town builder / dungeon crawler の失敗、run 内報酬への再配置、survey と
  playtester 指摘による検証まで因果鎖が揃う。複合 loop の統合と短い play session の
  報酬設計へ具体適用でき、限界も含めて約4000字の概要を構成できる。
suggested_post_outline:
  overview_angle: "二つの独立したゲームを足す発想から、run 内の意思決定と報酬を一つの loop に束ね直した設計転換"
  analysis_axis: "複合 loop の結合度、procedural encounter の可読性、survey/playtest が示した即時報酬不足と theme-mechanics 不一致"
  application_target: "Log_cdx の短時間ゲーム prototype で、複数要素の相互作用と1 session 内の報酬密度を早期検証する評価設計"
  pros_cons: "設計変更の因果と評価根拠が具体的。一方、survey 約6.5/10 の条件や標本詳細が薄く、一般化には留保が要る"
  verdict_pre: "部分採用"
---

## raw_excerpt

著作権に配慮し、記事の重要箇所を日本語で忠実に採録する。Freehold Games は当初、15分単位の dungeon crawl と town builder を組み合わせ、「町そのものが character」という mobile 向け構想を進めた。dungeon で得た資源を町へ持ち帰り、村人の仕事や建物へ投資する設計だったが、町と dungeon はそれぞれ独自の複雑さを持ち、両者の橋渡しが弱いまま「直交する二つのゲームを重ねた」状態になった。IAP も望む progression と噛み合わず、最終的には dungeon 側へ焦点を戻した。

成功点として、短い modular encounter の組合せが挙げられる。数ターン以内に踏まないと slime を生む puddle と、近くの対象を tongue で引き寄せる frog を同じ procedural dungeon に置くと、単体規則から予想外の tactical situation が生じる。また、後期に導入した survey では gameplay の compelling 評価が約6.5/10に留まり、playtester から dungeon 内の即時報酬不足を指摘された。そこで level-up と power 選択を各 run 内へ移し、短い session の中で報酬 loop も閉じた。反省点には、均整の取れた enchantment が似た印象になったこと、物語上の問いが mechanics に浸透せず大半の player に届かなかったことが含まれる。

## why_relevant_to_games

複数 loop を組み合わせる prototype で、単に両方が面白いかではなく相互作用が成立しているかを点検し、短い play session に合わせて報酬周期・survey 指標・theme の mechanics 化を設計する場面に使える。
