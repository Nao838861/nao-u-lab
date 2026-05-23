# 2026-05-23 柔らかくして敵数を増やす pass

## ユーザー指摘

> 敵が不自然に硬いので、柔らかくしてもっと数を増やして

## 原因分析

- 前回の密度改善は、敵数の少なさを一部の中型/横敵の HP で受け止めており、撃破テンポが鈍く見える箇所が残っていた。
- 「敵を増やす」を既存 route の同高度・同退場線へ単純追加すると、前 wave の退場と次 wave の entry/show が重なる。今回も最初の追加では overlap が出たため、敵数追加は lane offset ではなく route phase と時間軸で解く必要があると再確認した。
- 追加敵が弾を撃つと、密度ではなく弾圧だけが増える。今回の追加敵は主役 wave の補助として、低 HP・低弾圧・短い滞在で撃破テンポを上げる役割に限定した。

## 対処

- 小型/横/切り込み敵の HP を全体に下げた。例: wake scout 20 -> 15、orange lance 18 -> 14、bait scout 18 -> 12、magenta diver 26 -> 19、sideArc 20 -> 15、pre-boss diver 22 -> 17。
- 中型は瞬殺になりすぎない範囲で下げた。mid anchor 88 -> 72、second phrase anchors 132 -> 102、green relay carriers 96 -> 78。
- 低 HP の補助敵 route `softDrop` を追加した。目的は「硬い壁を増やす」のではなく、主役 wave の前後に拾える敵を置いて shootable 密度と撃破テンポを上げること。
- `softDrop` は短く入って短く上へ抜ける。下へ長く掃けると sideArc/diver/carrier の退場と交差して重なるため、補助敵は主役 route の軌跡を横切らない設計にした。
- 追加配置は `mid anchor soft pickup`、`anchor handoff soft pickup`、`right anchor soft pickup`、`relay answer soft pickup`、`pre-boss soft pickup`。いずれも HP 10、基本 no-fire 相当の `fireSkip: 997` とし、数を増やしても弾圧の主役を奪わないようにした。

## 再検証

- `node game\pulse_relay\v002\enemy_overlap_check.js`: OK。`pairOverlaps: 0`, `minGap: 0.58`。
- `node game\pulse_relay\v002\route_motion_check.js`: OK。`softDrop` は entry avg 2.31 / show avg 0.90 / exit avg 2.81 で、補助敵として読める速度帯。
- `node game\pulse_relay\v002\timeline_eval.js`: OK。balanced clear 80.67s、boring / low-shootable run / not-shootable run / heavy pressure なし。`meanMidgameShootable` は 4.71 -> 5.48。
- `node game\pulse_relay\v002\verify.js`: OK。balanced/aggressive/conservative/pulse-heavy 全 clear。balanced kills は 106 -> 117。

## 次への判断基準

- 敵数を増やす時は、まず HP を壁として使っていないかを確認する。増やす対象は低 HP・短い役割・明確な player intent を持つこと。
- 追加敵は主役 wave の軌跡を邪魔しない。overlap が出たら指標を緩めず、route phase、退場方向、spawn gap、左右ブロックを見直す。
- mean shootable が上がっても、撃破数が伸びない場合は「見えているが硬い/届かない/弾圧だけ増えた」可能性を見る。kills、shootable、enemyBullets、policy 別 clear をまとめて読む。
