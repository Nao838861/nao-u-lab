# self judgment

完成時に、問題を「自分で未然に見つけたか」と「人間指摘がないと見落としそうか」で分ける。

## self_detected_before_user

- v002 作業開始前に、v001 参照なしで作る制約と、記憶から持ち込む blocker を `design_trace.md` に具体化した。
- 実装前に `wave_intent_table.md` を作り、各 wave に `player_intent / failure_pressure / exit_reason / bad_policy_check / telemetry` を持たせた。
- 初期 draft をそのまま採用せず、`delete-and-redesign pass` で wave の完全分離を破棄し、重なりのある構成へ変えた。

## found_by_metrics

- 初回 verify で全 policy が boss 前後で落ち、boss phase3 と HP/危険度を調整した。
- 初回 overlap check で sideArc の exit/entry overlap を検出した。直角 offset ではなく、spawn order と side 切替が原因だと見て修正した。
- 二回目 overlap check で、bridge lance と diver の交差を検出した。原因は lane と入退場先だったため、bridge lance の rail を変更した。
- timeline で 38-44 秒の空白を検出し、pre-boss cuts と boss warning bridge を追加した。
- boss ideal TTK を計算し、3 秒瞬殺ではない HP にした。最終値は normal 15.97 秒、pulse burst 11.77 秒。
- enemy/wave redesign pass で、18-19 秒と 23-25 秒の boring run を検出した。18-19 秒は support scout の前倒し、23-25 秒は carrier setup cross で解消した。
- orange lance と carrier setup cross の overlap を検出した。どちらも直角 offset ではなく、同一小隊の spawn gap と左右小隊の時間分離で解いた。
- formation/speed 修正で `route_motion_check.js` を追加した。前回は速度帯を検証しておらず、scout exit 43.95px/frame、diver exit 47.18px/frame の異常速度を見落としていた。修正後は全 route が速度ゲート内に収まった。
- `verify.js` が 4 policy 中 1 policy の失敗を許していたため、全 policy clear 必須へ強化した。

## found_by_visual_review

- sideArc の左右交互出現は、数値上の出現間隔だけでなく、退出先と入場側が同じ画面端になると不自然に重なると判断した。
- bridge lance と diver は、同時に見える route sample で左側の軌跡が近すぎると判断し、offset ではなく rail の役割を変えた。
- isolated boring seconds と連続 boring runs を分けた。目的は単発の息継ぎを消すことではなく、退屈な連続区間を防ぐことだと整理した。
- redesign では、敵種紹介順をやめて「中央で撃つ、横へ動く、移動先を刺される、carrier 前に横へ振られる、pulse で切り返す」というプレイヤー状態の流れへ変更した。
- formation/speed 修正では、ランダムに見える lane 列をやめ、同じ方向、同じ spawn gap、読みやすい lane progression を持つ小隊に戻した。異常速度は `easeIn/easeOut` の三次補間を短い exit に使ったことが主因だったため、route 用に `easeSoft` を使い、duration と退場距離を調整した。

## found_after_user_feedback

- ユーザー指摘で、編隊としてまとまりがないこと、出入りが異常な速度になっていること、敵アルゴリズムと速度帯の検査が足りていないことに気づいた。これは自律検出できていなかったので、次回は speed gate と formation coherence gate を最初から入れる。

## still_suspect

- v001 を参照しないため、v001 との直接比較はできない。
- 音なしのため、テンションは視覚だけに依存する。
- headless と route sample は通ったが、人間が遊んだ時の「あと少しメリハリが足りない」感は残る可能性がある。
## 2026-05-23 enemy-count/stage-flow pass

自分で見落としていた点:

- 敵数不足は単に総数ではなく、同じ役割の敵が「編隊」としてまとまって出る時間が短いことだった。117 体まで増やしただけでは不十分で、左右の返し、carrier 前後、boss warning の順序を作る必要があった。
- overlap を避ける時に lane を直角方向へずらすと、見た目は不格好になり、撃ちにくさだけが残る。今回の修正では、同一 route 内の lane progression と spawn gap、左右ブロックの開始秒で解いた。
- 速度の問題は route 単体の平均速度ではなく、プレイヤー速度に対して show が読めるか、entry/exit のピークが瞬間移動に見えないかで判断する必要があった。

今回のチェック結果:

- `enemy_overlap_check`: pairOverlaps 0 / minGap 1.06。
- `route_motion_check`: 全 route が速度ゲート通過。
- `timeline_eval`: balanced clear 81.45 秒、boring / notShootable / heavy runs なし。
- `verify`: 4 policy 全 clear、boss duration 18.22-22.67 秒。

次回への判断基準:

- 敵数を増やす時は、先に wave ごとの「プレイヤーに何をさせるか」を固定し、その意図を壊さない範囲で数を増やす。
- overlap が出たら、検証を緩める前に「同じ route の退場と次 wave の入場が同じ画面位置を使っていないか」を見る。
- headless が通っても、敵同士の連携感は別評価にする。visibleTargets の密度だけでなく、前の敵が次の敵の狙いを作っているかを見る。
## 2026-05-23 auto-shot / density / repeated-flow feedback

自分でできていると思っていたが、できていなかった点:

- Space を通常ショットに割り当てたままにしていた。STG としては撃ちっぱなしを基本にし、Space は pulse など判断のある行動へ使うべきだった。
- `boringRuns: []` を見て安心し、敵が少ない秒や shootableTargets が低い秒を過去作と比較していなかった。shot_log v01 の midgame shootable 16.31、graze_log_cdx v57 の meanMidgameShootable 5.27 に対し、Pulse Relay は 3.60-4.24 付近まで落ちていた。
- 横から出る敵の硬さを、役割のある横圧ではなく単なる撃破不能感にしていた。横敵は HP で止めるのではなく、間隔、出現側、弾、他敵との組み合わせで圧を作る。
- ステージ展開が「縦 -> 横 -> なにか -> 縦 -> 横」の繰り返しに戻っていた。二回目の展開に中型アンカー、回収小型、横圧、pulse 判断を入れるという記憶ログ上の教訓が実装に落ちていなかった。
- 敵を足した直後、exit 中の既存敵と次 wave の entry/show が重なる問題を何度も出した。重なりは lane offset ではなく、spawn gap、route phase、役割別の画面領域で解く必要がある。

次回の防止策:

- 新規 STG では最初から auto-fire を既定にし、主ボタンは pulse/shift/charge/lock など判断のある行動に使う。
- timeline_eval には `meanMidgameShootable` と `lowShootableRuns` を入れ、「空白 run なし」だけで合格にしない。
- 過去作比較は毎回、shot_log の高密度基準と graze_log のゲーム相応基準の両方を見る。完全コピーではなく、現在のゲームの狙いに対して密度が足りているかを判断する。
- 二回目の同型 wave を作る時は、必ず「一回目と何が違う判断になったか」を wave_intent_table に書いてから実装する。
- 敵追加後は `enemy_overlap_check -> timeline_eval -> verify -> route_motion_check` を一巡し、失敗したら指標を緩めず、意図と route phase を見直す。
