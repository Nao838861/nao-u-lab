# graze_log v05.2_cdx_v08 - devlog

## 0. 対象

Local continuous directive:

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

焦点は boss の削り感、BOMB を使いたくなる局面、初見クリア可能性。Slack pending の新規 game directive は今回なし。

## 1. 実装前判断

v07 は BOMB stock を stage 全体で作る形に寄せた。今回は、その stock を使う final phase の読みを強くする。数値経済を追加で動かすと比較しづらいため、final phase の最初に短い charge と `BOMB NOW` cue を足し、BOMB の使い時を画面上の状態遷移として見えるようにした。

## 2. 改変箇所

- `index.html`
  - title と表示版名を `v05.2_cdx_v08 - readable bomb window` に更新。
  - `FINAL_BOMB_CUE_FRAMES=84` を追加。
  - boss state に `finalChargeT` / `finalCueFired` を追加。
  - boss final phase 移行時の popup を `FINAL PHASE - CHARGE` に変更。
  - final phase 移行時に charge ring を出し、次射撃を 84F 後へ送る。
  - charge 後の初回 panic shot で `BOMB NOW` popup、低速 ring、aimed 1 発を出す。
  - boss 描画に final charge ring を追加。
  - title 説明を final phase cue ありに更新。
- `tools/headless_graze_log_cdx_v05_2_v08_check.js`
  - v08 path に更新。
  - `FINAL_BOMB_CUE_FRAMES` を検査 API に追加。
  - simpleBot stats に `chargeSeen` / `finalCueFired` を追加。
  - simpleBot の BOMB 条件を final cue 後優先に変更。
  - `finalBombCueIsTelegraphed` を追加し、cue source と frame 範囲を検査。
  - cue 後 final phase BOMB clear を必須化。

## 3. 戻し手順

`v05_1_cdx_v08/` と `tools/headless_graze_log_cdx_v05_2_v08_check.js` を破棄すれば、v07 は無改変で残る。

ファイル内で戻す場合:

1. `FINAL_BOMB_CUE_FRAMES` を削除する。
2. boss state の `finalChargeT` / `finalCueFired` を削除する。
3. boss phase 変更時の charge ring と `fireT=FINAL_BOMB_CUE_FRAMES` を削除する。
4. panic phase 初回の `BOMB NOW` 分岐を削除する。
5. boss 描画の final charge ring を削除する。
6. title / title 説明を v07 文言へ戻す。
7. headless check の path と v08 固有検査を v07 版へ戻す。

## 4. Mental Sim

プレイヤーは midboss と warning scout で BOMB stock を作る。boss が final phase へ入ると、すぐ弾幕が増えるのではなく、boss 周辺に charge ring と `FINAL PHASE - CHARGE` が出る。約 1.4 秒後に `BOMB NOW` が出て低速 ring が来るため、BOMB ready の状態なら押す理由が画面から読める。押せば BOMB brake と全消去で final phase を押し返せる。押さない場合も cue 弾は低速なので、即失敗にはしない。

## 5. 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v08_check.js
```

結果: pass。

要点:

- self-play: `mode=clear`, `t=4307`, `bombCount=1`, `activeDefCount=1`, `killCount=30`。
- bossStats: `enteredFinal=true`, `chargeSeen=true`, `finalCueFired=true`, `bombedFinal=true`, `bombedBoss=true`。
- boss start: `gauge=208`, `bombReady=true`, `warningRewardGauge=14`。
- constants: `FINAL_BOMB_CUE_FRAMES=84`, `MIDBOSS_REWARD_GAUGE=36`, `BOSS_WARNING_REWARD_GAUGE=14`。
- `spawnBoss()` による `state.gauge=G_MAX` 直付けは検出されない。
- BOMB は LV3 に戻り、5-way を付与せず、cooldown / brake を維持。
- finite script は midboss / boss / clear へ到達。

## 6. 自己判定

v08 は BOMB の価値そのものではなく、BOMB を押す局面の読みやすさを改善する版である。v07 の BOMB economy を維持したまま final phase の状態遷移を `CHARGE -> BOMB NOW -> panic pattern` へ分けたため、BOMB stock と boss final phase が画面上で接続されやすくなった。懸念は `BOMB NOW` が直接的すぎること。次回はブラウザで、押したい cue なのか、指示されているだけに見えるのかを確認したい。

## 7. 次回候補

- browser/manual で final phase charge の見え方を確認する。
- BOMB なしで cue 弾を避けられるか確認する。
- `BOMB NOW` の文言が強すぎる場合、色・音・ring だけで伝わる形へ弱める。
