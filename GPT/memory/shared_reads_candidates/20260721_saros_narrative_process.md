---
title: "Inside Housemarque's improved narrative process for Saros"
url: "https://www.gamedeveloper.com/design/inside-housemarque-s-improved-narrative-process-for-saros"
collected_at: "2026-07-21T11:02:44.3567631+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, narrative-design, production, pacing, performance-capture, action-game]
evaluated_at: "2026-07-21T11:08:54+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-21T11:08:54+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-21T11:08:54+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-20"
supersedes: []
gate_reason: >-
  narrative director / producer の分離、camp を会話・upgrade・休息の共通 node にする判断、数秒の state-transition scene、
  actor への早期 context 共有が同じ production 問題として説明されている。高速 action loop に物語を足す具体工程として約4000字へ展開できる。
suggested_post_outline:
  overview_angle: "gameplay-first の action game で、物語量ではなく制作役割と pacing interface を設計する"
  analysis_axis: "組織 bottleneck、run 内の休息配置、cinematic 前後の playable state、短時間 vignette、actor context の五層で工程を分解する"
  application_target: "高速 prototype に narrative を追加する際、camp・死亡・復活など既存 state transition を物語の接続点として小さく実装する制作サイクル"
  pros_cons: "長所は物語追加を既存 loop と制作負荷へ同時に接続できること。短所は大規模 studio の専任職と外部支援を小規模制作へそのまま移せないこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

本文要点の日本語メモ。gameplay-first の Housemarque が『Returnal』より大きな cast と物語を持つ『Saros』を作る際、物語量だけを増やさず narrative director と narrative producer を分離して配置し、PlayStation の dialogue team など社内横断の支援を使った。audio log の視点が増えるだけでも actor recording と production 管理は膨らむため、専門 role と support を先に足して既存の design・programming・art・audio 側へ bottleneck を押し付けない形を取った。cinematics には film / trailer 制作経験者も参加し、死亡後の復活など game state の遷移に短い vignette を置いている。

cinematic の判断は script を映像化するだけでなく、終了直後に player がどこへ向かうか、世界が通常状態か敵弾や音響が強まる Eclipse State かまで含めて行う。run 中の休息が死亡時に偏っていた『Returnal』に対し、『Saros』は camp へ定期的に戻し、会話・upgrade・休憩を同じ pacing node にまとめた。actor には収録直前の断片的な台本だけを渡さず、全員に導入 call を用意し、script を可能な限り早く共有して context と準備時間を渡す。高速な combat の間に物語を置くため、death / rebirth 間の scene は数秒まで圧縮され、直前の gameplay 経験から何を感じさせるかを一つの tableau として設計している。

## why_relevant_to_games

action loop を止めずに narrative を増やす時、物語の量だけでなく、専任 role、state transition、休息 node、収録 context、数秒単位の演出へ工程を分解する参照になる。
