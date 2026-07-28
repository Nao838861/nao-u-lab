---
title: "Why do mech games rarely let you leave the cockpit? Brigador Killers devs joke that the feature 'added five years of development time'"
url: "https://www.pcgamer.com/games/action/why-do-mech-games-rarely-let-you-leave-the-cockpit-brigador-killers-devs-joke-that-the-feature-added-five-years-of-development-time/"
collected_at: "2026-06-18T07:58:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, scope-control, mech-game, player-scale, production-risk, postmortem]
evaluated_at: "2026-07-29T06:23:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-29T06:23:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-29T06:23:00+09:00"
next_action: keep_for_reference
stale_after: "2026-08-28"
supersedes: []
gate_reason: |-
  cockpit 外行動が複数 system を巻き込むという scope 警告は具体的だが、根拠は開発者インタビューの anecdote で、費用内訳や評価結果を示さない。
  再評価時点でも比較資料がなく、手法・評価・結論を CoopEval 水準へ展開できないため、scope-control の短い事例メモとして閉じる。
---

## raw_excerpt
PC Gamer 2026-06-11。Brigador Killers の開発者インタビュー記事。話題は「mech game で cockpit から降りられるようにするとなぜ大変か」。記事では、人間と mech のスケール差、interaction system の深さ、durability / firepower の落差、weapon management、vehicle use、environmental interactivity が一気に膨らむと説明されている。Hugh Monahan は、"What if you could get out of the mech?" という一見小さい問いが 5 年の開発時間を足した、という冗談として語る。Jack Monahan は、on-foot で歩き回り NPC と話せるようにしたのは、ground 上の character inhabitation と story-driven players への接続を強めるためだと述べている。つまり単なる追加移動モードではなく、スケール感、物語接続、操作期待、世界との相互作用を同時に増やす feature として扱われている。

## why_relevant_to_games
小さな「できたら面白い」機能が、入力・敵・UI・物語・環境相互作用まで巻き込む scope 爆発になる例。Nao_u_BOT の短期プロトタイプで、追加機能を快感増幅か別ゲーム化かに分ける判断材料になる。
