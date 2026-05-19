# graze_log v05.2_cdx_v07 - devlog

## 0. 対象

Local continuous directive:

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

焦点は boss の削り感、BOMB を使いたくなる局面、初見クリア可能性。Slack pending の新規 game directive は今回なし。

## 1. 実装前判断

v06 は boss warning wave で BOMB を稼ぐ形にできたが、`BOMB +22` が boss 直前に集中していた。今回は、BOMB stock を midboss の節目報酬と boss warning の仕上げ報酬に分散し、stage 全体の行動から BOMB が貯まる形へ寄せる。

## 2. 改変箇所

- `index.html`
  - title と表示版名を `v05.2_cdx_v07 - distributed bomb economy` に更新。
  - `MIDBOSS_REWARD_GAUGE=36` を追加。
  - `BOSS_WARNING_REWARD_GAUGE` を 22 から 14 に変更。
  - midboss spawn 時に rewardGauge を付け、popup を `MIDBOSS - BOMB CORE` に変更。
  - boss warning popup を `BOSS WARNING - TOP OFF BOMB` に変更。
  - title 説明を「midboss core + warning scouts で final phase 用 BOMB を作る」に変更。
- `tools/headless_graze_log_cdx_v05_2_v07_check.js`
  - v07 path に更新。
  - `MIDBOSS_REWARD_GAUGE` を検査 API に追加。
  - warning reward が 14 以下で、midboss reward が warning reward より大きいことを検査。
  - boss start ready、boss BOMB clear、BOMB 悪用不可の既存検査を維持。

## 3. 戻し手順

`v05_1_cdx_v07/` と `tools/headless_graze_log_cdx_v05_2_v07_check.js` を破棄すれば、v06 は無改変で残る。

ファイル内で戻す場合:

1. `MIDBOSS_REWARD_GAUGE` を削除する。
2. `spawnMidboss()` の `rewardGauge:MIDBOSS_REWARD_GAUGE` を外し、popup を `MIDBOSS` に戻す。
3. `BOSS_WARNING_REWARD_GAUGE` を 22 に戻す。
4. boss warning popup と title 説明を v06 文言へ戻す。
5. headless check の path と v07 固有検査を v06 版へ戻す。

## 4. Mental Sim

プレイヤーは midboss を倒して `BOMB +36` を得る。これだけでは BOMB は完成しないが、道中の kill/graze と合わせて「溜まってきた」感が出る。boss warning scout は `+14` の top-off になり、boss 直前だけで BOMB を配られる感触を弱める。boss に入る時点で `BOMB STOCK EARNED` が出れば、BOMB は stage を通して作った final phase 用リソースとして読める。

## 5. 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v07_check.js
```

結果: pass。

要点:

- self-play: `mode=clear`, `t=4214`, `bombCount=1`, `activeDefCount=1`, `killCount=30`。
- boss start: `gauge=208`, `bombReady=true`, `warningRewardGauge=14`。
- constants: `MIDBOSS_REWARD_GAUGE=36`, `BOSS_WARNING_REWARD_GAUGE=14`。
- `spawnBoss()` による `state.gauge=G_MAX` 直付けは検出されない。
- BOMB は 5-way を付与しない。
- BOMB cooldown / brake は維持。
- finite script は midboss / boss / clear へ到達。

## 6. 自己判定

v07 は v06 より完成寄りになった。BOMB stock の由来が boss 直前の `+22` 連打だけでなく、midboss の節目と warning の仕上げへ分散したため、プレイヤーが見える stage 行動から final phase 用 BOMB を予測しやすい。一方で、midboss 撃破が苦手なプレイヤーへの余裕はまだ手動体感で見ていない。次回は報酬値よりも、midboss reward の視認性と boss 前の BOMB 使用判断が自然かを browser/manual 側で確認したい。

## 7. 次回候補

- midboss `BOMB +36` が節目報酬として見えているかをブラウザで確認する。
- warning `+14` が top-off として十分か、数体逃した時の boss BOMB 到達率を見る。
- boss final phase の BOMB 使用タイミングが「押したい局面」として読めるかを見る。
