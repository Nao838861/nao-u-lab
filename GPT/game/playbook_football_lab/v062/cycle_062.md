# cycle_062

## 判断

v061 で clock pressure は weak threat urgency に入った。次に残っていたのは replay marker の active window が内部仕様としてしか見えない点だった。見た目を増やして field をうるさくするより、marker button の title / aria-label と snapshot に範囲と距離を出し、補助情報と検証性を上げる。

## 実装

- replay marker button の title に `±4f active` を追加した。
- replay marker button の `aria-label` に active window を追加した。
- `activeReplayMarkerDistance()` を追加した。
- debug snapshot に `activeReplayMarkerDistance` を追加した。
- storage key を v062 に更新し、v061 routes を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v062\game.js`
- `node --check game\playbook_football_lab\v062\verify.js`
- `node verify.js`
- v062 内に v061 固有タイトルや cycle 名が残っていないことを検索する。

## 次の候補

- marker 同士が近い時の優先順位を snapshot に出す。
- 日本語化した文言の長さを field badge 幅に合わせてさらに短縮する。
- mobile toolbar の visual density をスクリーンショットで確認する。
