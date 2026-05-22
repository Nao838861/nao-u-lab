# graze_log v05.2_cdx_v58

v58 は、v57 へのフィードバック「画面下で適当に左右移動しながら撃つだけで、上から出た敵がほぼ出た瞬間に死ぬ」を直接潰すための版です。

v57 は敵の存在密度を上げましたが、プレイヤーが画面下に居座ると縦ショットの射線に敵が入り、HP1 の上方出現や素直な直進敵がそのまま処理される構造が残っていました。v58 では単純な密度追加ではなく、底待ちを成立させていた構造を変更しています。

## 主な変更

- 中盤以降の key connector を、HP1 の上方列だけでなく `raider` に置き換え。
- `raider` は HP4、出現直後の entry shield、横から上中段へ切り込む swoop 軌道を持つ。
- 底に張り付いている時だけ `raider` が速い挟み撃ち弾を追加で撃つ。
- 画面下で敵を倒した時のスコア倍率と一部チェイン維持を下げ、底待ちが報酬面でも支配的にならないようにした。
- route bot は下端固定ではなく中段寄りに動かし、別途 `botStyle=camper` を追加して「底で左右移動しながら撃つ」検証を分離した。

## 遊び方

`index.html` をブラウザで開きます。

- 矢印キー / WASD: 移動
- Space / B: BOMB
- Shift / X: Active DEF
- `?bot=1&botStyle=route`: 通常検証 bot
- `?bot=1&botStyle=camper`: 画面下左右移動 bot
- `?bot=1&botStyle=aggressive|defensive|panic|novice|marksman|survival`: 比較用 bot policy

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v58_check.js
node tools\headless_graze_log_cdx_v05_2_v58_policy_matrix_check.js
```

2026-05-23 実行結果:

- 通常 headless: pass
- policy matrix: pass
- route bot: clear、routeCoveragePct 1
- route matrix: `meanMidgameShootable` 9.85、`meanMidgameBullets` 17.56、`meanMaxEmptyScreenGapSec` 1
- camper matrix: game over、23.28 秒、routeCoveragePct 0.313、killCount 44、score 4609、bottomCampPct 0.999

## 残課題

底待ちは数値上は支配戦略ではなくなりました。ただし、これは「底にいると死ぬ」方向の対策なので、次は実プレイで「上へ出て迎撃したくなる」「横切り敵を追うと気持ちよく倒せる」方向の手触りを確認する必要があります。
