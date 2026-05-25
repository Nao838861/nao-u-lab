# Pulse Relay v004 再構築記録

2026-05-25 に消失した `v004` を、残存していた `v003`復元版、会話内のv004差分メモ、検証ログ要約から再構築した。

v004の目的:
- Pulseを単なる防御ではなく、このゲームの中心的な気持ちよさにする。
- 敵弾が多いほど、Pulseで敵を一気に倒せる方向へ寄せる。
- Relayが遅くて当たりにくい問題を、誘導、少しのばらけ、加速、長めの軌跡で改善する。
- 全Relayが同じ敵へ吸い込まれすぎないよう、硬い敵、ボス、射線外、倒し切れる敵を優先しつつ、同一ターゲット過多にペナルティを入れる。

主な差分:
- `PULSE_RADIUS = 108`
- `PULSE_CD = 1.55`
- Relayは `RELAY_SPEED` から始まり、`RELAY_ACCEL` で少し加速し、`RELAY_STEER` で誘導する。
- Relayに `targetId`、`splash`、`trail` を持たせた。
- `relayKills` と `pulseWhiffs` をメトリクス化した。
- feeder/escort/boss/armored系の敵弾供給を増やし、Pulse燃料が途切れすぎないようにした。
- 中盤とボス直後にPulse燃料用の追加waveを入れた。
- Pulse成功時に短い無敵を付け、成功入力が防御と反撃の両方として機能するようにした。
- `enemy_behavior_audit.js` で route clear、画面外射撃0、長すぎる非ボス滞在0、移動ジャンプ上限、relayKills、pulseWhiffsを監査する。

この版は、消失前の元ソースをgitから復元したものではなく、ログから再構築した実行可能版である。
