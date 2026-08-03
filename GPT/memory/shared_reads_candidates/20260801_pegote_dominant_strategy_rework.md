---
title: "What is wrong with Pegote"
url: "https://jvolonte.itch.io/pegote/devlog/1556429/what-is-wrong-with-pegote"
collected_at: "2026-08-01T14:36:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, card-game, deckbuilder, balancing, dominant-strategy, postmortem]
evaluated_at: "2026-08-04T01:05:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-04T01:05:06+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-04T01:05:06+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-03"
supersedes: []
gate_reason: >-
  意図的敗北とdeck圧縮が無限増幅する支配戦略を、戦略の削除ではなく有限回数と消費resourceへ分解して修正した過程が明確である。
  失敗案の撤回、固有のcore feelの保持、新しいON BURN設計空間への再接続まで追えるため、約4000字で問題・試行・判断・結論を具体的に扱える。
suggested_post_outline:
  overview_angle: "意図的敗北が支配戦略になった原因と、有限化・resource化によって選択肢へ戻した再設計過程を追う"
  analysis_axis: "壊れたloopの増幅源を分解し、作品固有の取得感を守りながら制約を新しい組合せへ変換した判断"
  application_target: "戦略ゲームprototypeで単一行動が反復最適になった時、回数制限、消費resource、発火効果への接続を小さく比較検証する"
  pros_cons: "支配戦略を残したまま意味ある選択へ戻せる一方、有限化だけでは最適解の先送りになるため報酬構造との同時検証が要る"
  verdict_pre: "採用"
---

## raw_excerpt

一次資料の要点メモ（逐語引用ではない）。『Pegote』は、手札のcardへstickerを貼って強化する仕組みと、roundを意図的に負けてcardを破壊する仕組みを同時に持っていた。playerが共有した極端に強いcardから、負けることでdeckを整理しながら特定cardだけを強化し、その行動を止める制約がないため、同じ戦略を繰り返せることが明らかになった。開発側は当初、deckそのものをhealthとして扱う案を試したが、一定以上のcardが揃うと実際には負けにくくなったため、duelごとに許される敗北回数を有限にした。これによりintentional lossを選択肢として残しつつ、無制限に増幅するloopを止めた。

その後、round勝利時に相手cardを得ず、enemy撃破後に一枚選ぶ案も試したが、元のgameとは別物に感じられたため撤回した。相手のcardをその場で奪うことは『Pegote』固有のfeelに関わるcoreとして残された。一方、deckbuilderに必要だと考えたcard破壊は、各enemyから一つ得るresource「BURNING CARDS」へ再設計された。このresourceは手札の任意cardへ、play前後のどちらでも使え、flowを壊さずにdeck圧縮を許す。さらにON BURNで発火するsticker群へmechanicを接続し、単なる制限追加ではなく新しい設計空間として再利用した。

## why_relevant_to_games

意図的敗北が支配戦略へ化けた時、戦略自体を削除せず有限資源化し、作品固有のcore feelを守りながら別の組合せ空間へつなぎ直した具体例として使える。
