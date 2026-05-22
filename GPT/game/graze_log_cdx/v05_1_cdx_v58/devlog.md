# graze_log v05.2_cdx_v58 devlog

## 2026-05-23 Codex v58: 底待ち支配の解消

### 背景

v57 は敵の出ない時間と中盤密度を改善したが、ユーザー評価では「ほとんど印象が変わらない。画面下で適当に左右移動しながら弾を撃っていると、上から出た敵はほぼ出た瞬間死ぬので単調」だった。

この指摘は単なる敵数不足ではなく、以下の構造問題として扱った。

- プレイヤーの縦ショット射線上に、上から低耐久敵が素直に入ってくる。
- 敵の出現直後に防御や横圧がなく、底から撃つだけで先制処理できる。
- route bot や既存 policy が底寄りでも成立しており、検証がユーザーの実感を捕まえていない。
- 底で敵を倒してもスコアとチェインが伸びるため、報酬面でも底待ちが強い。

### 実装

- `GAME_VERSION` を `v05_1_cdx_v58` に更新。
- `raider` 敵を追加。HP4、entry shield、横から上中段へ切り込む軌道を持つ。
- `spawnSwoopRaid()` を追加し、side heli braid、crane reward、right bunker、armored gate、post-mid、final bunker、boss approach に anti-camp swoop を配置。
- `raider` は通常は単発 aimed shot、プレイヤーが下端付近にいる時だけ速い左右差分弾を追加で撃つ。
- 画面下での撃破はスコア倍率を下げ、raider / bunker / tank 撃破時はチェイン維持も弱めた。
- route bot の基準位置を下端から中段寄りに変更。
- `botStyle=camper` を追加し、敵へ正確に照準を合わせず、下端で左右に揺れるだけの検証 bot とした。
- camper bot は Active DEF を自動使用しない。通常の policy 比較では無敵化せず、ゲームオーバーまで評価する。

### ヘッドレス強化

- `tools/headless_graze_log_cdx_v05_2_v58_check.js`
  - v58 の source note / version を確認。
  - camper policy を追加。
  - `bottomCampPct`、`camperIsNotDominant`、`camperStaysBottom` を評価。
  - v58 の意図に合わせ、密度上限を v57 の 12 発から 28 発基準へ更新。
- `tools/headless_graze_log_cdx_v05_2_v58_policy_matrix_check.js`
  - policy matrix に camper を追加。
  - `meanBottomCampPct` を集計。
  - camper が低スコア・低到達率・非クリアになることを確認する `camperNotDominant` を追加。

### 検証結果

```powershell
node tools\headless_graze_log_cdx_v05_2_v58_check.js
node tools\headless_graze_log_cdx_v05_2_v58_policy_matrix_check.js
```

どちらも pass。

主な数値:

- route: clear、routeCoveragePct 1、killCount 257、bottomCampPct 0.356
- route matrix: clearRate 1、meanMidgameShootable 9.85、meanMidgameBullets 17.56、meanMaxEmptyScreenGapSec 1
- camper: game over、23.28 秒、routeCoveragePct 0.313、killCount 44、score 4609、bottomCampPct 0.999
- camperNotDominant: true

### 解釈

v58 では、底で左右に揺れるだけの bot は序盤後半で詰まり、ステージの 31.3% しか進めなくなった。これは「下で撃っていれば全部死ぬ」状態ではなくなったことを示す。

一方、route は全イベントを通過してクリアできるため、単に弾を増やして全体を壊したのではなく、底待ちだけを検証上の失敗パターンとして分離できている。

### 次の確認点

数値上は底待ち対策が効いた。ただしプレイ感としては、底にいると死ぬだけでなく、上中段へ出て倒すと気持ちいい敵配置になっているかを実機で確認する必要がある。次は「上へ出る理由」と「横切り敵を追って倒す快感」を増やす方向がよい。
