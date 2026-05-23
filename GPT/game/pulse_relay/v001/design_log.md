# Pulse Relay v001 設計ログ

## 読んだ正本

- `memory/checklist_noncompression_protocol_20260523.md`
- `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md`
- `memory/game_2d_shmup_reproduction_packet_20260523.md`
- `memory/2d_stg_autonomous_eval_checklist_20260523.md`
- M-44 Boghog 4 規則
- M-45「要素設計と登場順設計は別」
- M-30/M-31 no-risk 連打と経済反転の検査
- M-37 固有メカを画面上の出来事へ接続する規則

## 保持した原文と反映先

- 「敵の出現パターンが単調」
  - 対応: `enemy_rebuild_packet.md` で 9 block の stage 構成を作り、`game.js` の `WAVE_EVENTS` を全面的に作り直した。
- 「散発的に敵が適当に出てくる」
  - 対応: 各 wave に `block`, `playerIntent`, `badPolicy` を持たせ、前 wave の位置を次 wave が利用するようにした。
- 「プレイヤーをどう動かすかが全然意識できていない」
  - 対応: opening は左から中央、mirror は右への切り返し、side feeder は横圧、armored gate は Pulse Relay、boss は変換弾の接続を要求する。
- 「縦シューなのに縦一列の敵が横から出てくる」
  - 対応: 5-7 lane の離散配置と左右反対側 spawn を `wave_grammar_check.js` の検査対象にした。
- 「shot_log は気持ちのいい敵編隊を実現できた」
  - 対応: 単体敵の強弱ではなく、curve train、mirror answer、harvest、boss fuel の編隊単位で作った。

## 敵種と登場順

- `curve`
  - 初登場: opening curve train。横移動しながら通常ショットを当てる基本練習。
  - 応用: mirror answer / boss approach。前 wave の反対側から来て切り返しを要求する。
  - Pulse との関係: 直接の Pulse 対象ではなく、硬い敵の前後に置く rhythm fuel。
- `feeder`
  - 初登場: side feeder cover。横から入り、中央目標を撃つ間の横圧を作る。
  - 応用: boss 右側 pressure。下端待ちへの追加圧力にも使う。
  - Pulse との関係: 弾密度を作り、変換の燃料になる。
- `anchor`
  - 初登場: center lane bait。中央に居座り、最初の Pulse drill を作る。
  - 応用: side feeder cover と重ねて、単独の硬い敵ではなく周囲の弾圧とセットにする。
- `armored`
  - 初登場: armored gate。盾と HP で通常ショットだけでは時間がかかる対象。
  - 応用: midboss setup / boss approach / boss late target。毎回、周囲の fuel と一緒に置く。
  - Pulse との関係: relay hit が処理速度と score に直結する。
- `harvest`
  - 初登場: armored gate 後。硬い敵の後に rhythm を戻す低 HP 編隊。
  - 応用: boss fuel。ボスを孤立させず、変換弾を作る燃料になる。
- `escort`
  - 初登場: midboss setup。左右から入って縦位置を調整させる。
  - Pulse との関係: 自体は主役でなく、armored へ入る前の外発緊張を作る。
- `boss`
  - 初登場: boss relay exam。単独で居座らせず、harvest / feeder / armored を周囲に置く。
  - Pulse との関係: route の最終検証で `converted 27`, `relayHits 19` が出るように、ボス直前とボス中に燃料を残す。

## 指標の使い方

指標は合格のために曲げない。各指標は次の疑いを見るために使う。

- `visibleTargets`: 画面に処理対象があるか。
- `shootableTargets`: 敵がいても撃てない時間が続いていないか。
- `hardTargets`: 硬い敵が複数残って処理待ちになっていないか。
- `enemyBullets`: 反撃対象なしに弾圧だけが増えていないか。
- `nearBullets`: Pulse を押したくなる外発緊張があるか。
- `routeCoverage`: clear しただけでなく authored blocks を通ったか。
- `bottomCampPct`: 下端待ちが成立していないか。
- `relayHits`: 変換が敵処理へ接続しているか。
- `bossHp`: ボス山場が進行しているか。

## 実装サイクル

1. 初回の checklist を再検証し、原文保持、8 wave schema、M-44/M-45、bad policy、時系列評価を落とさない形に再構築した。
2. 敵 wave をゼロから作り直し、9 block / 75 events にした。
3. `wave_grammar_check.js` を hard issue 検査へ作り直した。
4. `timeline_eval.js` を 9 policy と per-second telemetry へ拡張した。
5. 初回検証で route が中盤に落ち、camper が強かったため、下端撃破 score penalty と下端追加弾圧を入れた。
6. 次の検証で route がボス前に潰れたため、終盤 armored と boss 出現時刻、boss HP / fireRate を調整した。
7. 射線警告を減らすため hard target へ寄せる調整を試したが、noPulse が強くなり Pulse Relay の意義が落ちたため戻した。

## 最終結果

- `node wave_grammar_check.js`: hard issue なし。
- `node verify.js`: route 3 run すべて clear。mechanic は `converted 5`, `conversionHits 3`。
- `node timeline_eval.js`: route と marksman は 5 seed で clear。camper / lane-holder / blind-sweeper / noPulse は route より明確に弱い。

## 残す課題

`shootable_gap` と `bullets_without_targets` はまだ route に残る。v001 では Pulse Relay の山場として許容したが、次回はこの区間を「撃てない避け時間」ではなく「短い fuel 編隊の連鎖」に置き換える。
