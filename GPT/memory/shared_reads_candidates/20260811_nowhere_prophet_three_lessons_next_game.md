---
title: "3 Lessons for the next game"
url: "https://sharkbombs.itch.io/nowhere-prophet/devlog/1277002/3-lessons-for-the-next-game"
collected_at: "2026-08-11T02:31:37+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, roguelike, deck-builder, difficulty, run-length, narrative, postmortem]
evaluated_at: "2026-08-11T02:36:28+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786383928.323609"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786383928323609"
  char_count: 4432
  posted_at: "2026-08-11T02:45:48+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-11T02:45:48+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786383928323609"
next_action: none
stale_after: "2026-09-10"
supersedes: []
gate_reason: |-
  作者自身の失敗分析から、難度較正・100分超 run・procedural narrative の問題と、後継作での具体的な構造変更を一対一で追える。
  run 短縮が従来の deck-building を失わせるため戦闘内へ移す、という変更間の因果まであり、ゲーム制作の具体判断へ接続できる。
  一次資料として問題設定・着想・設計手段・観察された失敗・次作での結論が揃い、約4000字の概要を独立して構成できる。
suggested_post_outline:
  overview_angle: 旧作の三つの失敗を個別の反省ではなく、後継作の core loop・難度導線・物語構造を組み替える因果連鎖として整理する
  analysis_axis: 作者の熟達による難度較正の歪み、run 長と損失感、短縮で失われる成長、交換可能な narrative と recurring character の差を追う
  application_target: Log_cdx のゲーム prototype で、難度・1 play の長さ・成長資源の配置・反復人物を変更する際の連鎖チェックと短い playable diff の評価軸に使う
  pros_cons: 実制作の具体的な trade-off が強みだが、単一作者・単一シリーズの postmortem で定量比較がなく、数値を一般則として移植しない注意が要る
  verdict_pre: 部分採用。20〜30分という値ではなく、短縮で消える機能を core action 内へ再配置する設計手順を採る
---

## raw_excerpt

『Nowhere Prophet』の作者が、5年以上前に出した roguelike tactical card game の三つの不足を振り返り、後継作『Crownbreakers』で設計をどう変えたかを記した一次資料。第一は最低難度でも多くの player が序盤で離脱するほど厳しかったこと。作者自身が game を知りすぎて通常難度の感覚を見誤り、さらに敵の手札が隠れているため、対等な対人 card game なら読み合いになる不確実性が、資源条件の異なる AI 相手では「counter を都合よく出された」感覚になったという。後継作では地区ごとに段階的な difficulty modifier を解放し、最低難度を広い層が完走できる入口として扱う。

第二は一 run が100分を超え、終盤死の損失と再開時の心理的負担が大きかったこと。複数 map と長い巡礼感、価格に見合う量を求めた結果だが、20〜30分へ短縮すると従来の overworld 上で deck を育てる時間も消える。そこで後継作は一地区を複数の短い route に分け、戦闘中に宝物を壊して card を得たり card を除去したりして、deck-building 自体を battle 内へ移す。第三は procedural な物語を交換可能にしすぎ、再会して関係が変わる recurring character が不足したこと。雰囲気を伝える長い prose は読まれにくく翻訳費も増えたため、後継作では物語文の大半を character-driven dialogue に置き換え、繰り返し会う人物と reactive な関係変化を中心に据えるとしている。

## why_relevant_to_games

difficulty、run length、deck-building の配置、procedural narrative を独立に直すのではなく、一つの変更が別の core loop を失わせる連鎖まで記録しており、旧作の失敗を次作の構造変更へ接続する設計比較に使える。
