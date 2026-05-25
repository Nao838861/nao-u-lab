# Pulse Relay v001 敵配置リビルド packet

この packet は実装前の設計表であり、敵をゼロから作り直すための基準である。`reference` はタイトル名だけでなく、何を写すかまで書く。

## 参照した正本

- `memory/checklist_noncompression_protocol_20260523.md`
- `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md`
- `memory/game_2d_shmup_reproduction_packet_20260523.md`
- `memory/2d_stg_autonomous_eval_checklist_20260523.md`
- M-44 / M-45 / M-30 / M-31 / M-37

## Wave table

| id | reference | time_window | spawn | path | fire_rule | player_intent | success_feel | failure_pressure | bad_policy_check | telemetry |
|---|---|---|---|---|---|---|---|---|---|---|
| opening_curve_train | Galaga/1942 系の「曲線で入って同じ射線へ並び、連続撃破できる」導入。Pulse Relay では単発弾ではなく連射なので、曲線列を短くして主射線を置く快感だけ写す。 | 0.6-7.0s | 左上から 6 体、6 frame 間隔。5 lane 中央寄りへ入る。 | `curve`。左上外から弧を描き、x=150-250 の射線へ並び、短く滞在して下へ抜ける。 | 基本撃たない。最後の 1 体だけ遅い aimed を撃つ。 | 初手で左から中央へ寄り、編隊を読んで射線を置く。 | 1 列を溶かす。Pulse を押さず通常ショットの気持ちよさを確認する。 | 撃ち漏らすと次 wave の反対側へ切り替えが遅れる。 | blind-sweeper, lane-holder | shootableTargets, routeCoverage, emptyGapSec |
| mirror_answer | Toaplan 反対側 spawn。最初の編隊で左寄りにした後、右から反対側処理を要求する。 | 5.8-12.0s | 右上から 6 体、前 wave と 0.8s 重ねる。 | `curve` mirrored。右上外から中央右射線へ入り、左へ抜ける。 | 3 体目以降が 1 発ずつ遅い aimed。 | 左寄りから右寄りへ切り替える。 | 反対側への入れ替えが間に合う。 | lane-holder は片側に残って撃ち漏らす。 | lane-holder | shootableTargets, laneSwitches |
| center_lane_bait | 現代縦シューの中央安全処理から、直後に中央を危険化する bait。 | 11.0-18.0s | 中央小型 4 + 中型 anchor 1。 | 小型は内側へ吸い込み、anchor は中央上で短く停止。 | anchor が 0.8s 後に 3-way slow cluster。小型は撃たない。 | 中央で処理してから、slow cluster を見て横へ逃げるか pulse する。 | 中央処理から Pulse Relay の初回成功へつながる。 | noPulse は避け続ける必要が出る。camper は中央圧で押される。 | noPulse, camper | nearBullets, conversions, relayHits |
| side_feeder_cover | DonPachi 系の「主目標を撃つ間に横から小型が弾を置く」構造。画面端で終わる side enemy 禁止の対策。 | 17.0-26.0s | 左右 feeder 3+3、中央 anchor 1。 | feeder は画面外横から中段へ入り、射線を横切ってから下へ抜ける。anchor は中央上で残る。 | feeder は下端滞在時だけ速い横差し弾。anchor は slow aimed。 | 上の anchor を撃ちながら、横圧を見て上下左右へ動く。 | 上だけでなく横を見て切り替える感覚。 | camper は横差し弾で被弾または撃ち漏らし。 | camper, blind-sweeper | bottomCampPct, sideEntry, damage |
| armored_gate | v58 raider の「出現即死を防ぎ、底待ちの成立条件を壊す」役割。 | 25.0-35.0s | armored 2、左右から時間差。harvest 小型 4 を後続。 | armored は横から中段へ切り込み、entry shield 0.7s 後に停止、下へ抜ける。 | 停止後に slow cluster。底にいる時だけ追加 aimed。 | 射線を合わせ直し、Pulse Relay で硬い敵を早く落とす。 | 位置変更と pulse が噛み合って硬い敵を割る。 | lane-holder は片方しか処理できない。pulseHeavy 連打は弾がない時に空振りする。 | lane-holder, pulseHeavy | hardTargets, conversions, relayHits |
| relief_harvest | 圧の後に処理しやすい列を出し、退屈な空白ではなく収穫にする。 | 34.0-42.0s | harvest 8、左右交互、低 HP。 | 読みやすい中央寄り曲線列。 | ほぼ撃たない。最後だけ slow aimed。 | 前の圧から戻り、通常ショットでまとめて倒す。 | 休符、回収、連続撃破の気持ちよさ。 | aggressive が雑に突っ込みすぎると次 wave の位置が悪い。 | aggressive, blind-sweeper | score, emptyGapSec, routeCoverage |
| midboss_setup | ボス前に、ボスで必要な横移動と pulse 対象の slow cluster を予告する。 | 41.0-53.0s | escort 4 + armored 1。 | escort は左右から退路を制限し、armored は中央へ入る。 | escort は壁、armored は周期 slow cluster。 | 横移動だけでなく上下位置も使い、pulse 対象を選ぶ。 | ボス前の総合テスト。 | survival は倒さず進むと弾密度が残る。 | survival, noPulse | hardTargets, enemyBullets, nearBullets |
| boss_approach_final_braid | 既出文法を短く重ね、ボス前に学んだ処理を統合する。 | 52.0-63.0s | curve train + side feeder + armored を短く再登場。 | 左右交互、反対側 spawn、横切り、中央 bait。 | slow cluster と横差しを短く混ぜる。 | ここまでの処理を素早く統合し、ボスへ入る。 | 学んだ処理がつながっている感覚。 | camper と blind-sweeper はここで破綻する。 | camper, blind-sweeper | routeCoverage, damage, bossReachRate |
| boss_relay_exam | Pulse Relay の boss 応用。防御だけでなく反撃弾で boss HP を削る。 | 63.0-90.0s | boss 1 + fuel wave 複数。 | boss は上部を左右移動。fuel は曲線列と side feeder の再利用。 | boss は slow cluster と fan を交互。fuel は倒しやすい。 | slow cluster を pulse して反撃し、fuel を通常ショットで処理する。 | 反撃が boss HP を削るのが見える。 | noPulse は clear できても遅く低スコア。pulseHeavy は空振りが多い。 | noPulse, pulseHeavy, camper | bossHp, relayHits, score, clearRate |

## 敵種の役割

| kind | 画面上の役割 | 要求行動 | 通常ショットとの関係 | Pulse Relay との関係 | 再登場時の変化 |
|---|---|---|---|---|---|
| curve | 編隊を読んで射線を置く導入役 | 先読みして射線維持 | 溶かしやすい | ほぼ不要 | later では反対側 spawn と重ねる |
| feeder | 横圧で底待ちを壊す役 | 横から来る弾を見て移動 | 横切る瞬間に撃つ | pulse 対象を作る補助 | boss 前で armored と重なる |
| anchor | 中央 bait と slow cluster 供給 | 中央処理後に離脱または pulse | 残すと邪魔 | 初回 pulse 教材 | boss 前に周期が短くなる |
| armored | 出現即死を防ぐ硬い門 | 射線合わせ、pulse 併用 | 通常だけでは遅い | relayHits の主対象 | 左右時間差から中央へ |
| harvest | 休符と回収 | まとめて倒す | 気持ちよく倒せる | 基本不要 | boss fuel として再利用 |
| escort | 退路制限 | 上下位置も使う | 早めに処理 | pulse で壁を薄くできる | boss 直前で再登場 |
| boss | 最終試験 | slow cluster を pulse して反撃 | fuel 処理と並行 | boss HP を visible に削る | phase で fan / cluster 交互 |
