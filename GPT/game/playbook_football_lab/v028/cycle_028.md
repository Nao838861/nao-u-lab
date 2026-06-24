# サイクル 028

## 判断

v027 で tactical overlay の切替は入ったが、ページを開き直すと初期値に戻る。守備編集は何度も試す作業なので、見たいレイヤーの好みが保存されないのは小さな摩擦になる。今回は overlay 設定の永続化を行う。

## 実装

- `overlayStorageKey()` を追加した。
- `loadOverlayPrefs()` / `persistOverlayPrefs()` / `syncOverlayToggles()` を追加した。
- `Reads / Man / Zone` の change 時に localStorage へ保存するようにした。
- 起動時に overlay 設定を復元して checkbox へ同期するようにした。
- snapshot に `overlayStorageKey` を追加した。

## 検証

- `node --check game\playbook_football_lab\v028\game.js`
- `node --check game\playbook_football_lab\v028\verify.js`
- `node verify.js`
- v028 内に v027 固有のタイトル・サイクル名が残っていないことを検索する

