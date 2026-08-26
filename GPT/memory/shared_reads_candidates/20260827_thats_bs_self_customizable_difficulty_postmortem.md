---
title: "Jam Postmortem + 1.2.2 changelist :)"
url: "https://itch.io/devlog/1482054/jam-postmortem-122-changelist-.amp"
collected_at: "2026-08-27T04:51:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, difficulty, player-agency, postmortem, game-jam, platformer]
evaluated_at: "2026-08-27T04:55:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1787774575.827039"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787774575827039"
  char_count: 3690
  posted_at: "2026-08-27T05:03:02+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-27T05:03:02+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787774575827039"
next_action: none
stale_after: "2026-09-26"
supersedes: []
gate_reason: |-
  死亡後に障害単位で弱体化を選ぶ問題設定、プレイヤーが必要時だけ救済を使った観察、25% 刻みから知覚可能な三段階へ直した反復まで抽出できる。
  アクションゲームの救済 mechanic と playtest 観測へ直接適用でき、限界も含めて CoopEval 水準の約4000字に展開できるため pass とする。
suggested_post_outline:
  overview_angle: "難易度を開始前の一括設定ではなく、失敗直後に個別障害へ作用するプレイヤー選択として設計した postmortem"
  analysis_axis: "救済の選択粒度、弱体化が知覚できる段階差、利用行動の観察から仕様を直す反復"
  application_target: "アクションゲームの障害調整、詰まり検知後の救済提示、playtest での利用率と継続率の観測"
  pros_cons: "自尊心と継続意思を保ちやすい一方、選択提示のテンポ、自己責任感、障害別実装コストが増える"
  verdict_pre: "部分採用"
---

## raw_excerpt

itch.io の 2026-04-06 postmortem。HTML5 製アクションゲーム『That’s BU//S#!T』は、理不尽な罠に遭遇したプレイヤーが、死亡後の選択で sawblade や sucker punch を段階的に弱体化できる仕組みを持つ。作者は当初、プレイヤーが全障害を消して空虚な勝利を得る展開を予想していたが、観察された遊び方は異なった。多くの人は弱体化をまったく使わないか、十分に苦しんでから一部だけを使い、その後の level を見たいという興味を保った。作者はこれを “Self customizable difficulty” が想定以上に成立した例として記録している。

jam 後の v1.2 では、最初の sawblade の速度低下が知覚しにくかったため、25% 刻みをやめ、速度50%化、サイズ50%化、削除の三段階へ整理した。停止状態は簡単すぎて次の削除段階まで残す意味が薄かった。sucker punch は、最初の弱体化で警告表示と panel を即座に追加し、二回目で削除するよう変更した。移動経路のどこを選んでも弱体化できるよう入力範囲も広げた。また、spike を消した後の穴が非致死なのに脱出不能になる softlock には ledge を追加した。上級者向けには、通常表示しない death count と speedrun timer を出す任意の Tryhard mode も設けている。

## why_relevant_to_games

難易度選択を開始前の一括設定ではなく、個別の障害・失敗履歴・プレイヤーの継続意思に結びつける設計例として、アクションゲームの救済 mechanic と playtest 観測に参照できる。
