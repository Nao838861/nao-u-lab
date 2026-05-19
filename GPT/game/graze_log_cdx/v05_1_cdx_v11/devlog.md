# graze_log v05.2_cdx_v11 - devlog

## 0. 対象

Local continuous directive:

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

今回の焦点は、v10 で成立した warning -> final BOMB handoff を維持しつつ、直接命令の文言を弱めること。

## 1. 実装前判断

v10 は `BOSS WARNING - EARN BOMB` と `BOMB NOW` により、headless 上は BOMB 使用 clear を安定させた。ただしこのままだと「画面を読んで撃った」より「命令文を読んで撃った」に寄りすぎる。v11 は数値や stage flow を変えず、合図だけを `BOSS BREAK - GOLD LINE`、`CORE LOCKED`、`CORE OPEN` と金色リングへ置き換えた。

## 2. 改変箇所

- `index.html`
  - title と title 表示を `v05.2_cdx_v11 - visual final cue` に更新。
  - boss warning popup を `BOSS BREAK - GOLD LINE` に変更。
  - boss 突入 popup を `CORE LOCKED` / `BUILD STOCK` に変更。
  - final cue popup を `CORE OPEN` に変更。
  - final cue 時に二重の金色リングを追加。
- `tools/headless_graze_log_cdx_v05_2_v11_check.js`
  - v11 path に更新。
  - `finalBombCueIsTelegraphed` を `CORE OPEN` / `BOSS BREAK - GOLD LINE` 検査へ変更。
  - `BOMB NOW` と `EARN BOMB` が残っていないことを必須化。

## 3. 戻し手順

`v05_1_cdx_v11/` と `tools/headless_graze_log_cdx_v05_2_v11_check.js` を破棄すれば、v10 はそのまま残る。

ファイル内で戻す場合:

1. warning popup を `BOSS WARNING - EARN BOMB` に戻す。
2. boss 突入 popup を `BOSS IN - BOMB STOCK EARNED` / `BOSS IN - BUILD BOMB` に戻す。
3. final cue popup を `BOMB NOW` に戻す。
4. final cue の追加リング 2 件を削除する。
5. headless の direct-text absence 検査を外す。

## 4. Mental Sim

プレイヤーは boss warning で `BOSS BREAK - GOLD LINE` を見て、中央の gold scout 列を撃つ。撃破時の `BOMB +34` と HUD の B ready により、stock ができたことは見える。boss final では `FINAL PHASE - CHARGE` 後に金色リングと `CORE OPEN` が出る。ここで BOMB を撃つと、v10 と同じように boss final を押し切れる。

## 5. 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v11_check.js
```

結果: pass。

要点:

- simpleBot: `mode=clear`, `t=4550`, `bombCount=1`, `activeDefCount=4`, `killCount=68`。
- bossStats: `enteredFinal=true`, `chargeSeen=true`, `finalCueFired=true`, `bombedFinal=true`, `bombedBoss=true`。
- afterBossStart: `gauge=208`, `bombReady=true`, `warningRewardGauge=34`。
- `simpleBotUsesFinalBomb=true`。
- `finalBombCueIsTelegraphed=true`。`CORE OPEN` / `BOSS BREAK - GOLD LINE` を検出し、`BOMB NOW` / `EARN BOMB` が残っていないことも確認。
- stage grammar / warning wave / BOMB 悪用不可 / Active DEF threshold は維持。

## 6. 自己判定

v11 は新しいゲーム要素を足す版ではなく、v10 の BOMB handoff を「命令文」から「状態 cue」へ寄せる版である。headless 上は BOMB 使用 clear と direct-text absence が両立した。初見で伝わるかはまだ未確定なので、次回は browser/manual で warning から final cue までを確認する。
