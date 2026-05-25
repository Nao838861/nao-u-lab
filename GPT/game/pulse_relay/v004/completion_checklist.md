# Pulse Relay v001 完成チェックリスト

このチェックリストは、実装を通すために短く要約してはいけない。各項目は `出典 / 元の意図 / 達成条件 / 未達判定 / 証跡 / 状態` を持つ。実装中に削除しない。未達なら `blocker` または `v002` として `self_judgment.md` に残す。

## 0. チェックリスト自体の検証

- 出典: `memory/checklist_noncompression_protocol_20260523.md`
  - 元の意図: Codex が前回の指示を要約しすぎ、重要条件を落とした劣化コピーを作る傾向を止める。
  - 達成条件: このファイルの各項目に出典、元の意図、達成条件、未達判定、証跡、状態がある。短い見出しだけの項目がない。
  - 未達判定: 「敵配置を改善」「headless を走らせる」など、一行スローガンで終わっている。
  - 証跡: このファイル、`checklist_validation.md`
  - 状態: [x]

- 出典: ユーザー最新指示「チェックリストの再構築とそのチェックリストそのものの検証を数サイクル回して」
  - 元の意図: 一度作った checklist をそのまま信用せず、数サイクルの自己検証で漏れ、要約劣化、測定ハックを見つける。
  - 達成条件: `checklist_validation.md` に少なくとも 3 サイクル分の検証結果があり、各サイクルで発見した不足と修正が書かれている。
  - 未達判定: checklist を作ってすぐ実装へ進む。検証が「問題なし」だけで、照合対象や修正内容がない。
  - 証跡: `checklist_validation.md`
  - 状態: [x]

## 1. 原文保持と読み順

- 出典: `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md`
  - 元の意図: 「敵の出現パターンが単調」「散発的に敵が適当に出てくる」「プレイヤーをどう動かすかが全然意識できていない」「縦シューなのに縦一列の敵が横から出てくる」「shot_log は気持ちのいい敵編隊を実現できた」という原文を教師信号として保持する。
  - 達成条件: `design_log.md` に上記原文を残し、それぞれに対応する Pulse Relay の実装対策と wave id を書く。
  - 未達判定: 「敵が単調だったので多様化する」と要約して終わる。
  - 証跡: `design_log.md`, `enemy_rebuild_packet.md`
  - 状態: [x]

- 出典: `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md` の次回読み順
  - 元の意図: 実装前に正本を読む。記憶の短い index だけで判断しない。
  - 達成条件: `design_log.md` に、読んだ正本として `checklist_noncompression_protocol`, `game_shmup_enemy_design_noncompression_protocol`, `game_2d_shmup_reproduction_packet`, `2d_stg_autonomous_eval_checklist`, M-44/M-45/M-30/M-31/M-37 を列挙し、反映先を書く。
  - 未達判定: 「記憶を読んだ」とだけ書き、どの条件をどこへ反映したか不明。
  - 証跡: `design_log.md`
  - 状態: [x]

## 2. 敵 wave 設計

- 出典: `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md` の「実装前に必ず作る表」
  - 元の意図: 敵 wave を `reference / time_window / spawn / path / fire_rule / player_intent / success_feel / failure_pressure / bad_policy_check / telemetry` で書いてから実装する。
  - 達成条件: `enemy_rebuild_packet.md` に最低 8 ブロックすべての表があり、各 field が埋まっている。
  - 未達判定: wave id、敵数、出現秒、敵種だけの表になっている。
  - 証跡: `enemy_rebuild_packet.md`
  - 状態: [x]

- 出典: `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md` の「最低ステージ構成」
  - 元の意図: `Opening curve train`, `Mirror answer`, `Center lane bait`, `Side feeder plus cover`, `Armored gate`, `Relief / harvest`, `Midboss setup`, `Boss approach / final braid` の 8 ブロックを、前 wave が作ったプレイヤー位置を次 wave が利用する stage として作る。
  - 達成条件: `WAVE_EVENTS` が 8 ブロック以上の `block` metadata を持ち、各ブロックの `playerIntent` と `badPolicy` が export される。
  - 未達判定: 敵の種類と数を変えた単発 wave の羅列になっている。
  - 証跡: `game.js`, `wave_grammar_check.js`, `enemy_rebuild_packet.md`
  - 状態: [x]

- 出典: M-45「要素設計と登場順設計は別」
  - 元の意図: 敵種を作るだけでは不足。いつ出し、どう再登場させ、どの行動を学ばせるかを同じ重みで設計する。
  - 達成条件: `enemy_rebuild_packet.md` と `design_log.md` に、各敵が初登場、応用、ボス前再利用で何を変えるかが書かれている。
  - 未達判定: 新しい敵種があるが、登場順の意味がない。
  - 証跡: `enemy_rebuild_packet.md`, `design_log.md`
  - 状態: [x]

## 3. 敵種と弾の役割

- 出典: `memory/checklist_noncompression_protocol_20260523.md` の 2D シューティング特別ルール
  - 元の意図: 敵を HP、速度、弾数ではなく、プレイヤーに何をさせるかで定義する。
  - 達成条件: `design_log.md` に敵種ごとの「画面上の役割」「要求行動」「通常ショットとの関係」「Pulse Relay との関係」「再登場時の変化」がある。
  - 未達判定: `scout = 弱い敵`, `armored = 硬い敵` だけで止まる。
  - 証跡: `design_log.md`, `game.js`
  - 状態: [x]

- 出典: M-30/M-31
  - 元の意図: 緊張は敵側、環境側から来る。自発リスクや no-risk 連打、撃たない方が得になる経済反転を避ける。
  - 達成条件: `timeline_eval.js` に `noPulse`, `pulseHeavy`, `camper`, `survival` の比較があり、`design_log.md` に no-risk 連打、撃たない方が得、敵を残す方が得の検査結果がある。
  - 未達判定: pulseHeavy だけが常に得、noPulse が同等以上、敵を残して弾を稼ぐ方が高スコアになる。
  - 証跡: `timeline_eval.js` 出力, `self_judgment.md`
  - 状態: [x]

## 4. Wave grammar assertion

- 出典: M-44 Boghog 4 規則
  - 元の意図: Toaplan 反対側 spawn、5-7 lane、popcorn+tank の layered design、constant intensity 禁止を、実装前の願望ではなく検査にする。
  - 達成条件: `wave_grammar_check.js` が各規則を hard issue として検出し、通過する。
  - 未達判定: lane 分散、間隔、HP だけを見る検査に戻っている。
  - 証跡: `node wave_grammar_check.js`
  - 状態: [x]

- 出典: M-44 4 失敗パターン
  - 元の意図: 垂直スタック、画面端配置、同時高HP複数、下方ドリフトを禁止する。
  - 達成条件: `wave_grammar_check.js` が 4 失敗パターンを検査し、通過する。
  - 未達判定: side enemy が画面端で弾だけ撃つ、硬い敵が複数同時に残る、下へ流れる敵を無視した方が得。
  - 証跡: `node wave_grammar_check.js`
  - 状態: [x]

## 5. Headless と時系列評価

- 出典: `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md` の headless policy
  - 元の意図: headless は平均スコア採点器ではなく、ユーザーが指摘した雑な勝ち方を bot policy として再現する装置にする。
  - 達成条件: `route`, `marksman`, `aggressive`, `survival`, `camper`, `lane-holder`, `blind-sweeper`, `noPulse`, `pulseHeavy` を分け、`route` と `marksman` は authored content を通って勝ち、雑な policy は route より明確に弱い。
  - 未達判定: route/noPulse/pulseHeavy だけを見て、底待ち、固定射線、盲目左右移動が勝つかを見ていない。
  - 証跡: `node timeline_eval.js`
  - 状態: [x]

- 出典: ユーザー指示「一秒ごとにいろんなメトリクスを取って展開を考える」
  - 元の意図: per-second telemetry は aggregate の飾りではなく、どの秒に何が起きたかを見て stage 展開を考えるために使う。
  - 達成条件: `timeline_eval.js` が 1 秒ごとに `visibleTargets`, `shootableTargets`, `hardTargets`, `enemyBullets`, `nearBullets`, `emptyGapSec`, `routeCoverage`, `bottomCampPct`, `bossHp` を出し、`self_judgment.md` が時系列の山谷を説明する。
  - 未達判定: 平均 clearRate と平均 score だけで完成扱いにする。
  - 証跡: `node timeline_eval.js`, `self_judgment.md`
  - 状態: [x]

## 6. Pulse Relay 固有メカ

- 出典: `memory/2d_stg_autonomous_eval_checklist_20260523.md`
  - 元の意図: 固有メカは防御、スコア、説明だけで成立させず、画面上の出来事へ直結させる。
  - 達成条件: pulse 成功で敵弾が消え、白い反撃弾が敵へ当たり、敵 HP / boss HP / score / relayHits に反映される。slow bullet cluster が tutorial、応用、boss で最低 3 回出る。
  - 未達判定: pulse しても敵処理が変わらない。noPulse が同等以上。pulseHeavy が考えず連打で最適。
  - 証跡: `node verify.js`, `node timeline_eval.js`, `self_judgment.md`
  - 状態: [x]

## 7. 完成判定

- 出典: ユーザー指示「そのチェックリストが埋まるまで、チェックリストが埋まったチェックのループを回しながら完成まで」
  - 元の意図: checklist を作って終わりではなく、実装、検査、未達修正、再検査を loop して全項目を埋める。
  - 達成条件: `checklist_validation.md` と `self_judgment.md` に、各項目の最終状態、対応ファイル、実行した検証コマンド、残す v002 課題がある。blocker が 0。
  - 未達判定: 未達項目を削除する、v002 として丸める、証跡なしにチェックを入れる。
  - 証跡: `checklist_validation.md`, `self_judgment.md`, git diff
  - 状態: [x]
