# cycle_063

## 判断

v062 で replay marker の active window は title / aria / snapshot に出た。次に残っていたのは、marker 同士が近い時にどちらが active になるかの根拠が snapshot から読めない点だった。v063 では UI を増やさず、debug snapshot に候補一覧と選択理由を追加する。

## 実装

- `activeReplayMarkerCandidates()` を追加した。
- active marker 選択を候補一覧の先頭から取る形に整理した。
- 同距離の場合は登録順が早い marker を優先する仕様を明示した。
- snapshot に `activeReplayMarkerCandidates` と `activeReplayMarkerReason` を追加した。
- storage key を v063 に更新し、v062 routes を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v063\game.js`
- `node --check game\playbook_football_lab\v063\verify.js`
- `node verify.js`
- v063 内に v062 固有タイトルや cycle 名が残っていないことを検索する。

## 次の候補

- 日本語化した文言の長さを field badge 幅に合わせてさらに短縮する。
- mobile toolbar の visual density をスクリーンショットで確認する。
- hurry-up / chew clock の選択を小さく足す。
