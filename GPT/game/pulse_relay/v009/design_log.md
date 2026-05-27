# Pulse Relay v009 設計ログ

## 対象指示

`memory/slack_directives.jsonl` の `log-cdx-1779811040-15f96f05d8` を対象にした。原文:

> log_cdx v008は縦長に出る黄色い棒が何なのか全くわからなかった。ドキュメントを読んだら敵弾が横切ったら・・・と書かれていたが、敵弾がこれを横切るシチュエーションがなかったのでよくわからない。v008のコンセプトは失敗だと思う。次はv007,008が失敗だったか考えて別のアプローチをとってみて。あと、全体にそもそも中盤以降の敵弾も不足してて、もっと敵弾と敵が多い方が面白くなると思った。

## 実装前判断

v007 の失敗は、敵を書き換える内部状態が見えても「何が変わったか」がプレイ中に読めなかったこと。v008 の失敗は、縦レーンが目立っても「敵弾がそこを横切る場面」がステージ側に不足し、入力結果の予測へつながらなかったこと。どちらも、特殊仕様だけを追加し、敵配置がその仕様を読む状況を十分に作っていなかった。

v009 では v005 の分かりやすい土台へ戻し、縦レーンではなく横長の `Relay Gate` を自機前方へ置く。縦シューでは敵弾が上から下へ来るため、横ゲートなら「弾が通過する」状況が自然に発生する。加えて中盤以降に `crossfire_gate_drill`、追加 armored、boss 前後の feeder / escort を足し、敵と敵弾の密度不足を直接直す。

使った過去知見:

- `game_design_rules.md`: 説明文ではなく、見えている状況と入力結果を対応させる。
- `game_memory_task_lens_index.md`: headless は route / bad policy の分離、pressure、専用指標を見る。
- `game/pulse_relay/v005_v006_v007_feel_comparison.md`: 色や数値の差だけでなく、移動・タイミング・対象選びを変える。
- `game/pulse_relay/v008/design_log.md`: v008 は縦レーンの発生と headless 指標は出たが、人間が読むべき横切り状況が薄かった。

## 設計サイクル

### Cycle 1

良いところ/悪いところ30件: 1. v005 の Pulse 変換は分かりやすい。2. Field は残る。3. Chain Relay は攻撃結果が見える。4. v007 の敵書き換えは重い。5. v008 の縦棒は形だけ目立つ。6. 縦棒は横切る弾がないと意味がない。7. 縦シューの敵弾は基本的に下へ来る。8. 横ゲートなら通過が自然。9. 自機の前方に置けば位置取りが意味を持つ。10. 中盤以降の敵弾不足を同時に直せる。11. ただし横ゲートが強すぎると防御壁になる。12. 下端キャンプが強くなる恐れがある。13. pulseHeavy が強くなる恐れがある。14. ゲートの高さが読めないと失敗。15. ゲート時間が長すぎると自動処理。16. 短すぎると見えない。17. 敵 wave 追加で overlap が出る恐れ。18. 画面外射撃は禁止。19. boss 前が薄い。20. midboss 後が薄い。21. harvest だけでは弾が少ない。22. feeder / escort の crossfire が必要。23. hard target と弾圧を重ねたい。24. route policy にはゲート使用を要求したい。25. bad policy は score で劣るべき。26. noPulse は落ちるべき。27. camper は落ちるべき。28. blind-sweeper は落ちるべき。29. 検証専用指標が必要。30. 目視確認は次工程に残る。

改善案30件: 1. `Relay Gate` を横帯で描く。2. 自機より少し上へ置く。3. 黄色い矢印を帯に並べる。4. Gate 通過弾を黄色粒子にする。5. `gateConversions` を測る。6. `gateActiveTime` を測る。7. `crossfire_gate_drill` block を足す。8. midboss 後に追加 armored を置く。9. boss 前に escort crossfire を置く。10. boss 入り feeder を増やす。11. boss 中盤に下側 crossfire を置く。12. enemyBullets cap を少し上げる。13. feeder fireRate を早める。14. escort fireRate を早める。15. boss mid/final を少し早める。16. verify は gate 下限を見る。17. timeline は gate 指標へ更新。18. audit は gate payoff を見る。19. wrapper を v009 で作る。20. README を v009 に直す。21. design_log に原文を残す。22. staging に実行結果を残す。23. pending directive を handled にする。24. wave grammar に新 block を含める。25. offscreen shots 0 を維持。26. overlap 0 を維持。27. pulse whiff 低維持。28. route clear 維持。29. bad policy failure を見る。30. commit / push する。

筋の良い案: 横長 `Relay Gate` と crossfire wave をセットにする。解決できる問題は、v008 の「横切る場面がない」をステージ構造で直せること。懸念は、横ゲートが防御壁に見え、Pulse を押すだけの単調さに戻ること。

### Cycle 2

実装後の検証で調整する項目:

- `gateConversions` が route で十分に出るか。
- `pressurePct` と `pulseOpportunityPct` が v008 より薄くならないか。
- `noPulse`, `camper`, `lane-holder`, `blind-sweeper` が route と同等になっていないか。
- 追加 wave で `offscreenShots`, `pairOverlaps`, `maxEnemyStep` が壊れていないか。

## 実装内容

- `game/pulse_relay/v009/` を作成した。
- v008 の縦 `Relay Lane` を廃止し、横 `Relay Gate` に置き換えた。
- `gateConversions` / `gateActiveTime` を metrics / snapshot / verify / timeline / audit に追加した。
- `crossfire_gate_drill` block と中盤以降の追加 feeder / escort / armored を追加した。
- ゲート描画を横帯 + 小さな矢印列にし、発動可能時だけ自機上に `SPACE` キューを出すようにした。

## 検証方法

- `node verify.js`
- `node timeline_eval.js`
- `node enemy_behavior_audit.js`
- `node wave_grammar_check.js`
- `node enemy_overlap_check.js`
- `node tools/headless_pulse_relay_v009_check.js`

## 検証結果

- `node verify.js`: pass
- `node timeline_eval.js`: pass
- `node enemy_behavior_audit.js`: pass
- `node wave_grammar_check.js`: pass
- `node enemy_overlap_check.js`: pass
- `node tools/headless_pulse_relay_v009_check.js`: pass

主要値:

- route clearRate: 1
- route meanConverted: 239
- route meanGateConversions: 194
- route meanGateActiveTime: 14.98
- route meanPressurePct: 0.53
- route meanPulseOpportunityPct: 0.58
- route meanRelayKills: 82
- camper / lane-holder / blind-sweeper / noPulse clearRate: 0
- offscreenShots: 0
- pairOverlaps: 0

## 懸念

まだブラウザでの人間目視は未実施。headless で成立しても、横ゲートが単なる防御壁に見えるなら次回は Gate を「通過弾の反撃方向」や「敵側リアクション」へさらに接続する必要がある。`survival` と `pulseHeavy` は clear するため、次回は雑な高頻度 Pulse と良い route の質差をさらに分ける。
