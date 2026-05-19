# graze_log v05.2_cdx_v06 - devlog

## 0. 対象

Local continuous directive:

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

焦点は boss の削り感、BOMB を使いたくなる局面、初見クリア可能性。Slack pending の新規 game directive は今回なし。

## 1. 実装前判断

v05 は boss 中に BOMB を使って clear できるところまで進んだが、boss spawn 時に `state.gauge=G_MAX` を直接入れていた。playable diff としては有効だった一方、継続改善の次の焦点は「なぜ BOMB を持って boss に入れるのか」を画面上の行動へ戻すことだった。

今回は boss HP や BOMB 火力を広げず、boss warning wave を撃破すれば BOMB stock が自然に作れるようにした。道中の大枠は v05 のまま残し、stock 直付けだけを stage economy へ移した。

## 2. 改変箇所

- `index.html`
  - title と表示版名を `v05.2_cdx_v06 - earned boss bomb window` に更新。
  - `BOSS_WARNING_REWARD_GAUGE=22` を追加。
  - boss warning wave を `spawnBossWarning()` に置き換え、scout 撃破時に `BOMB +22` を付与。
  - `spawnBoss()` の `state.gauge=G_MAX` を削除。
  - boss 開始 popup を、稼げていれば `BOMB STOCK EARNED`、足りなければ `BUILD BOMB` に分岐。
  - title 説明を「warning scout を倒して BOMB を稼ぐ」内容に変更。
- `tools/headless_graze_log_cdx_v05_2_v06_check.js`
  - v06 path に更新。
  - `BOSS_WARNING_REWARD_GAUGE` を検査 API に追加。
  - boss spawn が gauge を直接満タンにしていないことを source regex で検査。
  - boss start 時に warning reward 由来で BOMB ready になっていることを検査。
  - self-play は boss warning 中だけ撃破を優先し、boss BOMB clear を確認。

## 3. 戻し手順

`v05_1_cdx_v06/` と `tools/headless_graze_log_cdx_v05_2_v06_check.js` を破棄すれば、v05 は無改変で残る。

ファイル内で戻す場合:

1. `STAGE_EVENTS` の boss warning を v05 の `spawnFan([...])` に戻す。
2. `BOSS_WARNING_REWARD_GAUGE`、`spawnBossWarning()`、`e.rewardGauge` 処理を削除する。
3. `spawnBoss()` に `state.gauge=G_MAX` と `BOSS IN - BOMB STOCK READY` popup を戻す。
4. headless check の path と v06 固有検査を v05 版へ戻す。

## 4. Mental Sim

プレイヤーは boss warning の横並び scout を見て撃ち込む。倒すと `BOMB +22` が連続して出るため、boss 前に gauge が伸びている理由が画面上で読める。boss に入った時点で `BOMB STOCK EARNED` が出れば、BOMB は突然配られた補助ではなく、直前 wave の報酬になる。

## 5. 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v06_check.js
```

結果: pass。

要点:

- self-play: `mode=clear`, `t=4212`, `bombCount=1`, `activeDefCount=1`, `killCount=30`。
- boss start: `gauge=208`, `bombReady=true`, `warningRewardGauge=22`。
- `spawnBoss()` による `state.gauge=G_MAX` 直付けは検出されない。
- BOMB は 5-way を付与しない。
- BOMB cooldown / brake は維持。
- finite script は midboss / boss / clear へ到達。

## 6. 次回候補

次は warning wave の報酬量が露骨すぎないかを見る。`BOMB +22` は headless と初見 clear を安定させるには有効だが、完成寄りにするなら midboss 報酬、warning scout の耐久、道中 graze 供給を合わせて、BOMB stock がより自然に溜まる形へ寄せたい。
