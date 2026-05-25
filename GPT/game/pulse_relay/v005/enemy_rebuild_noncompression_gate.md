# Pulse Relay v001 敵設計 非圧縮ゲート

このファイルは、`completion_checklist.md` の補助ではなく、敵配置をゼロから作り直す前に必ず満たす固定ゲートである。短い要約にして `completion_checklist.md` の一行へ戻してはいけない。

## 読む正本

- `memory/checklist_noncompression_protocol_20260523.md`
- `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md`
- `memory/game_2d_shmup_reproduction_packet_20260523.md`
- `memory/2d_stg_autonomous_eval_checklist_20260523.md`
- `D:/AI/Nao_u_BOT/Claude/memory/game_lessons_log.md` の M-44 / M-45 / M-30 / M-31 / M-37

## 固定チェック

- [ ] 出典: `memory/checklist_noncompression_protocol_20260523.md`, `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md`, `memory/game_2d_shmup_reproduction_packet_20260523.md`
  - 元の意図: ユーザーの「要約しすぎる癖があって、前回の指示の大事なところを落とした劣化コピーを作って同じ失敗を繰り返す傾向がある」を、チェックリスト作成段階で止める。
  - 達成条件: `design_log.md` に、読んだ正本、保持したユーザー原文、落としてはいけない条件、今回の敵設計へどう展開したかが書かれている。
  - 未達判定: 「敵配置を改善する」「stage を作る」「bad policy を見る」のような短い項目だけになっている。
  - 証跡: `design_log.md`, `enemy_rebuild_packet.md` または同等の wave 表。

- [ ] 出典: `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md` の「原文保持」
  - 元の意図: 「敵の出現パターンが単調」「散発的に敵が適当に出てくる」「プレイヤーをどう動かすかが全然意識できていない」「縦シューなのに縦一列の敵が横から出てくる」「shot_log は気持ちのいい敵編隊を実現できた」という指摘を、抽象語へ圧縮せず保持する。
  - 達成条件: Pulse Relay の設計ログに、これらの原文を教師信号として残し、各原文に対応する実装対策を最低1つずつ書く。
  - 未達判定: 「敵が単調だったので多様化する」だけで終わっている。
  - 証跡: `design_log.md` の原文保持節と、対応する wave id。

- [ ] 出典: `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md` の「実装前に必ず作る表」
  - 元の意図: 敵 wave を `reference / time_window / spawn / path / fire_rule / player_intent / success_feel / failure_pressure / bad_policy_check / telemetry` で書いてから実装する。
  - 達成条件: 最低 8 wave ブロックすべてに、上記 field が埋まっている。`reference` はタイトル名だけでなく、何を写すかまで書く。`player_intent` はプレイヤーをどこからどこへ動かすかを書く。
  - 未達判定: wave id、敵数、出現秒、敵種だけの表になっている。
  - 証跡: `enemy_rebuild_packet.md` または `design_log.md` の wave 表。

- [ ] 出典: `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md` の「最低ステージ構成」
  - 元の意図: `Opening curve train`, `Mirror answer`, `Center lane bait`, `Side feeder plus cover`, `Armored gate`, `Relief / harvest`, `Midboss setup`, `Boss approach / final braid` の 8 ブロックを、前 wave が作ったプレイヤー位置を次 wave が利用する stage として作る。
  - 達成条件: Pulse Relay の新しい `WAVE_EVENTS` はこの 8 ブロックに対応する metadata を持ち、各ブロックが前後関係を持つ。
  - 未達判定: 敵の種類と数を変えた単発 wave の羅列になっている。
  - 証跡: `game.js` の wave metadata, `wave_grammar_check.js`, `design_log.md`。

- [ ] 出典: M-44 / `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md` の Boghog assertion
  - 元の意図: Toaplan 反対側 spawn、5-7 lane、popcorn+tank の layered design、constant intensity 禁止、垂直スタック/画面端/同時高HP複数/下方ドリフト禁止を、実装前の願望ではなく検査にする。
  - 達成条件: `wave_grammar_check.js` がこれらを hard issue として検出し、通過結果を `self_judgment.md` に残す。
  - 未達判定: lane 分散、間隔、HP だけを見る検査に戻っている。
  - 証跡: `wave_grammar_check.js` の出力。

- [ ] 出典: `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md` の headless policy
  - 元の意図: headless は平均スコア採点ではなく、ユーザーが指摘した「雑な勝ち方」を bot policy として再現する装置にする。
  - 達成条件: `route`, `marksman`, `aggressive`, `survival`, `camper`, `lane-holder`, `blind-sweeper`, `noPulse`, `pulseHeavy` を分け、`route` と `marksman` は authored content を通って勝ち、雑な policy は低到達率、低スコア、早期失敗、または route より明確に弱い。
  - 未達判定: route/noPulse/pulseHeavy だけを見て、底待ちや固定射線や盲目左右移動が勝つかを見ていない。
  - 証跡: `timeline_eval.js` の policy matrix と per-second telemetry。

