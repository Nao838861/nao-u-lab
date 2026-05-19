# graze_log v05.2_cdx_v10 - devlog

## 0. 対象

Local continuous directive:

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

今回の焦点は、v09 の researched stage flow を維持しつつ、boss warning で BOMB stock を作り、final cue 後に BOMB を使う playable flow を headless で必須化すること。

## 1. 実装前判断

v09 check は pass していたが、simpleBot report では `bombCount=0` のまま clear していた。final cue を「見た」だけで、BOMB を使う局面としては検証できていなかった。

v10 では bot を賢くするのではなく、ゲーム側の boss warning を break/top-off wave として読みやすくした。残敵を整理し、中央寄せで遅い reward scout を出すことで、プレイヤーの自然な射線で BOMB stock を作れるようにする。

## 2. 改変箇所

- `index.html`
  - title と title 表示を `v05.2_cdx_v10 - verified bomb handoff` に更新。
  - `spawnBossWarning()` で残敵を整理し、boss 前 break として成立させた。
  - warning scout を 8 機から 10 機に増やし、中央寄せ・低速化・少し大きめにした。
  - warning popup を `BOSS WARNING - EARN BOMB` に変更。
- `tools/headless_graze_log_cdx_v05_2_v10_check.js`
  - v10 path に更新。
  - `simpleBotUsesFinalBomb` を追加。
  - `simpleBot.bombCount >= 1`、`bossStats.bombedFinal`、`bossStats.bombedBoss` を必須化。

## 3. 戻し手順

`v05_1_cdx_v10/` と `tools/headless_graze_log_cdx_v05_2_v10_check.js` を破棄すれば、v09 はそのまま残る。

ファイル内で戻す場合:

1. `spawnBossWarning()` の enemy filter を削除する。
2. warning scout を 8 機・横幅 0.08-0.92 に戻す。
3. warning scout の `vy` / `y` / `r` 上書きを削除する。
4. popup 文言を `BOSS WARNING - TOP OFF BOMB` に戻す。
5. headless check の `simpleBotUsesFinalBomb` 必須条件を外す。

## 4. Mental Sim

プレイヤーは既存STG由来の wave を進み、heavy tank と最後の chain wall を越える。boss warning に入ると弾と残敵が整理され、中央寄せの reward scout がゆっくり降りてくる。ここで自然に撃つと BOMB stock が作られる。boss final phase では `FINAL PHASE - CHARGE` の後に `BOMB NOW` cue が出るため、直前に作った BOMB を使う意味が画面上でつながる。

## 5. 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v10_check.js
```

結果: pass。

要点:

- simpleBot: `mode=clear`, `t=4550`, `bombCount=1`, `activeDefCount=4`, `killCount=68`。
- bossStats: `enteredFinal=true`, `chargeSeen=true`, `finalCueFired=true`, `bombedFinal=true`, `bombedBoss=true`。
- afterBossStart: `gauge=208`, `bombReady=true`, `warningRewardGauge=34`。
- `simpleBotUsesFinalBomb=true`。
- `stageScriptUsesResearchedGrammar=true`。
- `bossBombStockIsEarnedByWarningWave=true`。
- BOMB cooldown / brake / no 5-way / no auto recharge / Active DEF threshold も維持。

## 6. 自己判定

v10 は v09 の大きなステージ文法を壊さず、BOMB handoff の検証を一段強くした版である。`final cue を見た` だけの pass から、`warning で BOMB を作り、final cue 後に BOMB を使って clear` へ上げられた。

残る懸念は、warning wave が人間には親切すぎる補給に見える可能性。次回はブラウザで boss warning から final phase までの体感を確認する。

## 7. 次回候補

- browser/manual で warning wave が自然な boss 前 break に見えるか確認する。
- `BOSS WARNING - EARN BOMB` / `BOMB NOW` の文言が直接的すぎる場合、色・ring・配置で伝える方向へ弱める。
- BOMB なしでも final cue を避けられるか確認する。
