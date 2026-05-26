ヘッドレスプレイ研究で分かったことと、Pulse Relay v008 の今回差分をまとめます。

概要:
graze_log_cdx で続けていた headless は「ゲームの面白さを自動で断定するもの」ではなく、「人間が見るべき差分を絞る比較証拠」として使うのが一番筋が良かったです。単一 bot の clear / score だけを見ると、その bot への過適合や雑な勝ち方を見逃します。効いたのは、良い route と悪い方針を明示的に分け、bad-policy が失敗することまで契約に入れるやり方でした。

使える知見:
1. 平均 score より policy split が重要です。route が clear しても camper / lane-holder / blind-sweeper / noPulse が同じように clear するなら、ゲームの核ではなく雑な方針が勝っています。
2. 主観フィードバックはそのまま bot 方針へ変換すると扱いやすいです。「適当に動くだけで勝てる」は blind-sweeper、「下で待てる」は camper、「中央固定で足りる」は lane-holder のように分けます。
3. headless は楽しさではなく、coverage / pressure / movement / event trace / bad-policy failure を測る道具です。良い route が authored block を通り、悪い方針が落ちるなら、人間確認へ渡す価値が上がります。
4. 画面の安定 frame や event anchor を残すと、JSON だけでなく「どの瞬間を見ればよいか」まで渡せます。graze_log_cdx 後半で得た一番実用的な知見はここです。
5. ユーザーの「分かりにくい」は UI 文言追加で処理すると外します。どの入力が、画面上のどの対象に、何を起こしたかを先に単純化すべきです。

今回の判断:
graze_log_cdx の制作継続は停止しました。Pulse Relay は、v07 が分かりにくいという指示に合わせて、既存 v008 の v07/tether 系を捨て、v05 の Resonance Field / Chain Relay から作り直しました。

新しい v008:
Pulse を押すと、従来の円形変換と Resonance Field に加えて、自機の x 座標へ短時間の縦線 `Relay Lane` が残ります。敵弾がその縦線を横切ると Relay 弾へ変換されます。狙いは「弾を円で消す」から「Pulse 後の自機位置で変換ラインを置く」へ、遊ぶ感覚を変えることです。

検証結果:
- path: game/pulse_relay/v008/
- headless wrapper: tools/headless_pulse_relay_v008_check.js
- route clearRate: 1
- route meanConverted: 173
- route meanFieldConversions: 54
- route meanLaneConversions: 69
- route meanLaneActiveTime: 17.67
- route meanResonantEnemies: 172
- route meanChainHits: 40
- camper / lane-holder / blind-sweeper / noPulse clearRate: 0
- offscreenShots: 0
- lingeringEnemies: 0
- maxEnemyStep: 12.52
- pairOverlaps: 0

残課題:
survival / pulseHeavy / boss-rush は clear します。今回は「v05 へ戻して、v07 より分かりやすい playable diff を作る」ことを優先したので通しました。次に見るなら、良い route と雑な Pulse 多用の質差をさらに分けるのが良さそうです。
