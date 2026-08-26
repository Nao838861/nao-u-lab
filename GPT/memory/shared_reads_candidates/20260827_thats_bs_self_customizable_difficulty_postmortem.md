---
title: "Jam Postmortem + 1.2.2 changelist :)"
url: "https://itch.io/devlog/1482054/jam-postmortem-122-changelist-.amp"
collected_at: "2026-08-27T04:51:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, difficulty, player-agency, postmortem, game-jam, platformer]
---

## raw_excerpt

itch.io の 2026-04-06 postmortem。HTML5 製アクションゲーム『That’s BU//S#!T』は、理不尽な罠に遭遇したプレイヤーが、死亡後の選択で sawblade や sucker punch を段階的に弱体化できる仕組みを持つ。作者は当初、プレイヤーが全障害を消して空虚な勝利を得る展開を予想していたが、観察された遊び方は異なった。多くの人は弱体化をまったく使わないか、十分に苦しんでから一部だけを使い、その後の level を見たいという興味を保った。作者はこれを “Self customizable difficulty” が想定以上に成立した例として記録している。

jam 後の v1.2 では、最初の sawblade の速度低下が知覚しにくかったため、25% 刻みをやめ、速度50%化、サイズ50%化、削除の三段階へ整理した。停止状態は簡単すぎて次の削除段階まで残す意味が薄かった。sucker punch は、最初の弱体化で警告表示と panel を即座に追加し、二回目で削除するよう変更した。移動経路のどこを選んでも弱体化できるよう入力範囲も広げた。また、spike を消した後の穴が非致死なのに脱出不能になる softlock には ledge を追加した。上級者向けには、通常表示しない death count と speedrun timer を出す任意の Tryhard mode も設けている。

## why_relevant_to_games

難易度選択を開始前の一括設定ではなく、個別の障害・失敗履歴・プレイヤーの継続意思に結びつける設計例として、アクションゲームの救済 mechanic と playtest 観測に参照できる。
