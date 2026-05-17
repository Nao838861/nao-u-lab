# graze_log v05.2_cdx_v04 - devlog

## 0. フィードバック原文

> 敵の出現パターンができたが単調。既存のゲームからパターンを学んで、シューティングゲームとして面白い出現パターンやザコ敵の数、緩急などの構成、弾の打ち方、敵の種類やステージ内の展開、ボスまでの盛り上げなどを面白く遊べる形で実装してほしい。

## 1. 実装前判断

v03 は無限だらだら問題を解決したが、stage script は「敵配置の列」に近かった。シューティングとしては、敵の役割が分かれていないと単調になる。参考にした型は、popcorn で空白を埋める、硬い敵や砲台で一時的に画面支配を作る、危険波を少し重ねて flow を作る、boss 前に midboss/last wall で山を作る、というもの。

v04 では「敵を増やす」ではなく、敵役割を増やして、各 wave に別の読み方を持たせる。

## 2. 採用案

### 敵役割

- `scout`: 低 HP、速い popcorn。撃破感と gauge 供給。
- `weaver`: 左右に揺れながら単発 aimed。弾道を少しずらす。
- `sniper`: 遅めで硬い aimed enemy。横移動を要求する。
- `turret`: しばらく画面に残り radial を撃つ。通路と graze 誘導。
- `elite`: 3-way aimed。midboss 前の圧力。
- `midboss`: boss 前の山。HP 低下で radial へ変化。
- `boss`: HP で aimed 5-way、radial、mixed へ変化。

### Stage flow

`popcorn fan -> aimed pair -> crossing scouts -> weave lane -> turret gate -> popcorn refill -> sniper underlay -> elite escort -> midboss -> breather -> pincer -> last wall -> boss warning -> boss`

## 3. 改変箇所

- `index.html`
  - `STAGE_EVENTS` を 14 events に拡張。
  - `MIDBOSS_START_FRAME` を追加。
  - `spawnEnemy()` に新敵種を追加。
  - `fireEnemy()` に aimed / spread / radial / mixed を追加。
  - enemy movement / draw / reward を敵種別に分岐。
- `tools/headless_graze_log_cdx_v05_2_v04_check.js`
  - v04 path に更新。
  - midboss 到達、boss 到達、複数敵役割、clear 遷移を検証。
  - 簡易 self-play bot を追加し、道中を boss まで進めるか観察。

## 4. 戻し手順

`v05_1_cdx_v04/` を破棄すれば `v05_1_cdx_v03/` は無改変で残る。

ファイル内で戻す場合は以下。

1. `STAGE_EVENTS` を v03 の 9 events に戻す。
2. `scout/weaver/sniper/turret/midboss` の分岐を削除。
3. `MIDBOSS_START_FRAME`, `spawnMidboss()`, midboss draw/fire/reward を削除。
4. headless check を v03 版へ戻す。

## 5. Mental Sim

序盤は scout fan で撃てる対象を増やして、プレイヤーに「撃つ/避ける/gauge が上がる」を早く見せる。次に sniper と crossing scouts で左右の読みを入れる。turret gate は radial で通路を作り、graze の意味を出す。elite escort は midboss 前の山だが、初回調整では重すぎたため護衛 weaver を 4 体から 2 体に減らし、elite の発射間隔を伸ばした。

midboss 後には breather pickups を置き、boss 前に pincer / last wall / boss warning で再び密度を上げる。boss は単一パターンではなく HP で段階変化するため、到達後も「同じことの繰り返し」になりにくい。

## 6. 自己判定

v04 は v03 よりステージらしさが出た。headless のイベント契約だけでなく、簡易 bot が `boss` まで到達し、そこで死亡する結果になった。これは道中が完全な壁ではなくなり、boss が最終試験として機能している兆候。

未完成点は boss の勝ち筋。簡易 bot は BOMB を使わず boss で死んでいるため、次は「BOMB を自然に使いたくなる boss 弾密度」「boss HP とプレイヤー火力の削り時間」「clear までの平均時間」を見る。人間プレイでは boss が長すぎる/硬すぎる可能性がある。

## 7. 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v04_check.js
```

結果: pass。

要点:

- BOMB は 5-way を付与しない。
- finite script は midboss と boss に到達する。
- boss 撃破で clear へ遷移する。
- 簡易 self-play bot は boss まで到達し、boss 中に死亡する。
