# graze_log v05.2_cdx_v57 design_log

## 設計判断

v57 の目的は、shot_log の「途切れにくい敵配置」から良い差分だけを取り、`graze_log_cdx` を shot_log 化しないことだった。

shot_log は撃ち返し弾と高密度連射を前提に、画面上の敵と敵弾がかなり多い。これをそのまま graze_log に入れると、グレイズ・硬い目標・DEF の読み合いよりも、単純な弾幕と物量処理が主役になる。

そこで v57 では、次の判断基準を採用した。

- 敵弾密度ではなく、撃てる敵と接続列の密度を上げる。
- hard target の前後に connector を置き、倒した後の空白を減らす。
- route bot が早く倒しても、次の意図に移る前に 1 秒以上空白が続かないようにする。
- shot_log の 16 体台 / 30 発台ではなく、graze_log 用に 5-6 体 / 12 発以下を上限目安にする。

## 変更したステージ構造

v56 は `RIGHT_BUNKER_RELEASE` 周辺の空白を直したが、中盤全体ではまだ撃てる敵が少なかった。v57 では中盤からボス前までを通して、以下のように接続を厚くした。

1. crane reward で報酬対象の周囲に追加 cover を置き、倒した後の移動先を残す。
2. second tank pair の直後に floor row を足し、硬い目標から右バンカーへ切り替える前の空白を減らす。
3. right bunker entry / release / chase を増やし、右側処理から左側 sweep へつなぐ。
4. midboss warning 前の topoff を厚くし、中ボス前の無風時間を減らす。
5. armored carrier と feeder の左右接続を厚くし、プレイヤーが中央固定で終わらないようにする。
6. post-mid と final bunker 後も connector を置き、ボス前の準備区間を単なる待ち時間にしない。

## 評価軸

v57 では主観評価だけでなく、以下を合格条件に入れた。

- `midgameMeanShootable >= 5.0`
- `midgameMeanBullets <= 12`
- `maxEmptyScreenGapSec <= 1`
- `maxNoShootableGapSec <= 1`
- 複数 bot style で policy の差が出る
- route bot が clear し、route coverage が 1 になる

## 実測の解釈

route 単体では `midgameMeanShootable` 5.62、`midgameMeanBullets` 3.25、`maxEmptyScreenGapSec` 1 になった。v56 の中盤 3.46 体、空画面 2 秒からは改善している。

policy matrix でも route 平均 `meanMidgameShootable` 5.27、`meanMidgameBullets` 4.23、`meanMaxEmptyScreenGapSec` 1 なので、単発の seed だけでなく複数 policy でも狙い値に入った。

一方で、killCount 309、maxChain 108、score 718370 は高すぎる可能性がある。これは「画面に敵がいない」問題を解くために connector を増やした結果、チェーンとスコア報酬が膨らんだことを示す。次の改善では敵数をさらに増やすのではなく、chain window、score 係数、早撃ち policy への条件付き follow-up を調整する。
