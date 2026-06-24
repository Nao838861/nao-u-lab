# cycle_058

## 判断

v057 で replay marker の現在位置は strip 上に出るようになったが、active 判定が exact frame だけだった。スクラブや再生中は 1 frame ずれるだけで marker が消えたように見え、プレー中の「どこで何が起きたか」を追いにくい。v058 では marker の近傍 window を作り、イベント直前直後でも同じ marker を active として維持する。

## 実装

- `replayMarkerActiveWindowFrames = 4` を追加した。
- `activeReplayMarkerForIndex()` を追加し、現在 frame から近い marker を window 内で選ぶようにした。
- `syncReplayMarkerActive()` は exact frame ではなく `activeReplayMarkerForIndex()` の結果で strip button を active にする。
- debug snapshot に `activeReplayMarker` と `replayMarkerActiveWindowFrames` を出すようにした。
- storage key を v058 に更新し、v057 routes を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v058\game.js`
- `node --check game\playbook_football_lab\v058\verify.js`
- `node verify.js`
- v058 内に v057 固有タイトルや cycle 名が残っていないことを検索する。

## 次の候補

- badge 文と live region 文を日本語 UI に寄せる。
- toolbar の mobile 折り返しをさらに調整する。
- urgency に clock を少しだけ反映する。
