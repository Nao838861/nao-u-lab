---
title: "Post-Jam Retrospective: A Strong Idea That Needed More Time"
url: "https://itch.io/devlog/1573537/post-jam-retrospective-a-strong-idea-that-needed-more-time"
collected_at: "2026-07-22T05:01:14+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, postmortem, game-jam, controls, onboarding, feedback]
evaluated_at: "2026-07-22T05:04:42+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-22T05:04:42+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-22T05:04:42+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-21"
supersedes: []
gate_reason: >-
  入力キー自体を奪取・喪失する mechanic について、実装上の状態管理と、獲得条件・位置依存・喪失 feedback が初見者にどう誤読されたかを playtest 事例まで含めて追える。
  評価数の少ない自己報告という限界はあるが、onboarding、一貫した状態遷移、獲得・喪失 feedback、jam scope を具体的に分析でき、約4000字の概要と適用評価を構成できる。
suggested_post_outline:
  overview_angle: "入力そのものを資源にする着想を、runtime control 登録、敵との能力移送、被弾時のランダム喪失、初見 playtest での誤読まで一続きの設計問題として説明する"
  analysis_axis: "独自性の高い mechanic が理解可能なルールになる条件を、獲得前の affordance、位置に左右されない一貫性、状態変化の視聴覚 feedback、短期 jam の実装配分から検証する"
  application_target: "Log_cdx の短期 game prototype で、能力の獲得・使用・喪失を最初の level 内で一つずつ体験させ、状態遷移ごとの入力可否と feedback を観察する playtest に使う"
  pros_cons: "利点は mechanic の内部実装と player の外部理解のずれを具体例で結べること。弱点は rating が5件のみで比較実験や詳細な tester 数がなく、一般化には自作 prototype での再検証が必要なこと"
  verdict_pre: "部分採用。入力を資源化する発想そのものではなく、状態遷移を一貫させ、獲得と喪失を操作中に教える評価枠を採用する"
---

## raw_excerpt

原文の要点を日本語で採録する。『Stripped』は Mini Jam 212 のテーマ「Control」と制約「You Are The Enemy」に対し、敵から入力キーそのものを奪って自分の能力にする仕組みを核にしたブラウザゲームである。プレイヤーはほぼ何もできない状態で始まり、guard を追って能力を奪うと Godot の InputMap に対応する操作が登録される。被弾時には所持している control の一つがランダムに失われ、物理 pickup として world に戻るため、moveset がプレイ中に増減する。

72時間の jam では、runtime の input 登録、player と複数 guard 間の ability state 管理、control の受け渡し実装に大半の時間を費やし、polish、level design、仕組みを遊びながら教える工程が不足した。playtest では、能力を使う前に奪う必要があることが伝わらず、guard を捕まえた位置によって二つの能力が同時に得られたり反対側では何も起きなかったりして、挙動の一貫性も崩れた。被弾で control をランダムに失う処理は、視覚・音響 feedback が弱いため、意図的なルールではなく壊れた挙動や不公平さとして受け取られた。

作者は core concept 自体は記憶に残り、feedback でも可能性を確認できたとしている。再制作するなら、最初の level を短く絞って「奪ってから使う」関係を操作の中で教え、guard behavior を一貫させ、key の獲得・喪失に強い feedback を付けるとしている。177作品中 rating は5件だけで、jam 内の可視性には最初の screenshot と説明文も影響したと記録している。

## why_relevant_to_games

入力そのものを資源化する独自 mechanic で、ルールの一貫性、獲得・喪失 feedback、最初の level による onboarding が体験理解をどう左右するかを検討する材料になる。
