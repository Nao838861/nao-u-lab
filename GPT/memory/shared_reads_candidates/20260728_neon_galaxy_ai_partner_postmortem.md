---
title: "A Dreamcast-era game planner came back after 25 years — with an AI partner"
url: "https://itch.io/devlog/1597409/a-dreamcast-era-game-planner-came-back-after-25-years-with-an-ai-partner.amp"
collected_at: "2026-07-28T07:32:16.3459978+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, postmortem, ai-assisted-development, rts, prototyping]
evaluated_at: "2026-07-28T07:38:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-28T07:38:04+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-28T07:38:04+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  planner の仕様言語化を AI 実装へ移し、画面観察と短い修正指示を2週間反復して公開版へ至る工程と結果が具体的である。
  RTS の規則削減と playable build 中心の確認を同じ制作判断として分析でき、小規模 AI 制作への適用先も明確である。
suggested_post_outline:
  overview_angle: "ゲームプランナーの言語化技能を、AI と playable build を往復する実装工程へ移植した2週間の制作記録"
  analysis_axis: "規則の削減、単一 HTML の早期 prototype、screenshot と違和感の言語化による短い修正 loop"
  application_target: "小規模ゲームで、仕様書を膨らませず playable diff と画面観察を一単位にして AI 実装を収束させるサイクル"
  pros_cons: "実装速度と検証回数を増やせる一方、作者自身の観察眼と言語化能力に依存し、品質保証を AI に委ねられない"
  verdict_pre: "部分採用"
---

## raw_excerpt

Dreamcast、PlayStation 2、WonderSwan 時代にゲームプランナーとして働き、その後25年間 web 制作に携わった作者が、AI と組んで2週間でブラウザ RTS『NEON GALAXY』を公開した制作記録。完成版は最大8人の online multiplayer、co-op、最大32の AI faction に対応する。作者自身はコードを書けるが、今回は一行も直接書かず、仕様を言葉にし、AI が実装し、browser で一緒に build を確認する反復を続けた。

着想は、2000年前後に遊んだ、星から三角形の艦隊を別の星へ送る単純な Flash game の記憶にある。現代 RTS の unit type、counter、tech tree、ability を捨て、囲碁やオセロのように単純な規則へ寄せた。全 unit は一対一で相殺され、星は自動で艦を生産し、player の判断は「どの星から何隻をどこへ送るか」に絞られる。初日は黒い画面上の neon circle、周回する dot、triangle、click-to-send を順番に指示し、一つの HTML file で星・艦隊・占領を備えた playable prototype まで進んだ。

作者は、ゲームプランナーの仕事を「頭の中の game を、他者が実行できる言葉へ変換すること」と捉え、それが prompting にそのまま移ったと述べる。画面を見て違和感を言語化し、screenshot と短い修正指示を渡し、すぐ build を確認する流れを release まで繰り返した。原文の短い表現は “I described; the AI built”。

## why_relevant_to_games

仕様伝達・画面確認・即時修正という planner の既存技能を AI-assisted prototype の反復へ移す事例であり、単純な規則へ削った RTS の核を playable build で早く確かめる制作工程の材料になる。
