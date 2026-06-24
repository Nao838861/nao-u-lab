# cycle_056

## 判断

v055 で weak cue の状況判断は少し深くなった。次に気になるのは replay marker。marker を押して frame に飛べるが、strip 側では今どの marker を見ているか分からない。結果検証の導線として、現在 frame に対応する marker を強調する。

## 実装

- marker button に `data-frame` を付与した。
- `syncReplayMarkerActive()` を追加した。
- replay controls 更新時と marker render 時に active 状態を同期する。
- active marker に `.active` と `aria-current="step"` を付ける。
- debug snapshot に `activeReplayMarker` を追加した。
- v056 用 storage key に更新し、v055 route を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v056\game.js`
- `node --check game\playbook_football_lab\v056\verify.js`
- `node verify.js`
- v056 内に v055 固有のタイトル・サイクル名が残っていないことを検索する

## 次の候補

- delete confirmation の aria 補助を追加する。
- toolbar の mobile 折り返しをさらに調整する。
- badge 文を日本語 UI に寄せる。
