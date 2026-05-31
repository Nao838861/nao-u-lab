---
title: "Robo Dance, Postmortem, GamedevJS Jam 2026"
url: "https://forum.defold.com/t/robo-dance-postmortem-gamedevjs-jam-2026/82698"
collected_at: "2026-05-18T01:18:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, jam, ui-ux, playtesting, turn-planning]
evaluated_at: "2026-05-18T01:24:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-18T01:20:59.1639286+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779034850236629"
posted:
  ts: "1779034850.236629"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779034850236629"
  char_count: 3624
  posted_at: "2026-05-18T01:20:59.1639286+09:00"
stale_after: "2026-06-17"
supersedes: []
next_action: none
gate_reason: |-
  問題設定、初期案の破棄、同時ターン制の中核、playtest で露呈した理解不能性、4手強制を外した結論まで抽出できる。
  Nao_u 側のゲーム制作では「制約で深くする」前に入力・目的・反応学習を先に通す評価軸として具体的に使える。
  jam postmortem だが設計判断の因果が明確で、CoopEval 水準の概要に展開できるだけの密度がある。
suggested_post_outline:
  overview_angle: "同時ターン制の面白さを、制約の強制ではなくプレイヤーが反応を学ぶ余地へ作り替えた事例として書く。"
  analysis_axis: "初期コンセプト、edge-case rule の増加、playtest での理解負荷、4手計画制約の撤去と報酬化の関係を見る。"
  application_target: "turn-planning、同時解決、音楽同期、短時間プロトタイプの初回導線評価に効く。"
  pros_cons: "メリットは設計変更の因果が明確なこと。デメリットは原文が個人 jam 記録で、定量評価や長期運用の検証は薄いこと。"
  verdict_pre: "部分採用。入力直後の理解と自己ペース学習を、制約追加前のゲートとして採用する。"

---

## raw_excerpt
GamedevJS Jam 2026 の2週間制作ポストモーテム。作者は最初に crafting/production 案を試したがしっくり来ず、以前から試したかった「同時ターン制 + ターン計画」へ戻した。実装では「同時に解決する」ため、2体が同じマスへ入る時など、多くの edge-case rule を定義する必要が出た。音楽方向は先に見えたが、music-sync の gameplay concept は実験後に現れた。Level design は Tiled と custom properties で敵の field pattern を調整したが、作者自身も弱点として認識している。

Testing では、初期設計が「cool に感じる」はずだったのに、実際には理解しづらく遊びづらいと判明した。友人 playtest で、画面表示直後にプレイヤーが controls と目的を理解できない問題が出た。さらに、4手すべてを計画しないと execute できない制約は puzzle-like にする意図だったが、feedback 後に外した方が大幅に気持ちよくなった。現在は4手計画を music track 維持で報酬化しつつ、プレイヤーが自分のペースで世界の反応を学べる形にしている。短い原文断片: "players don't" / "own pace"。

## why_relevant_to_games
turn-planning や同時解決ルールは複雑化しやすい。Nao_u 環境で「制約で深くする」前に、プレイヤーが即座に動かして反応を学べる余地を残す候補として使える。
