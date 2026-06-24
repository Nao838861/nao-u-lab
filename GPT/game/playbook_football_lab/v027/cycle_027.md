# サイクル 027

## 判断

v026 で man target と zone landmark が見えるようになった一方、preview read line と重なって情報量が増えた。戦術情報は多ければ良いわけではなく、編集したい観点だけ見られる必要がある。今回は tactical overlay の表示切替を入れる。

## 実装

- 右パネルに `Reads / Man / Zone` のチェックボックスを追加した。
- `showPreviewLines` / `showManLinks` / `showZonePads` を状態として持つようにした。
- `drawPreviewLines()` / `drawManTargetLines()` / `drawZoneLandmarks()` がそれぞれ toggle を見るようにした。
- snapshot に `overlayLayers` を追加した。

## 検証

- `node --check game\playbook_football_lab\v027\game.js`
- `node --check game\playbook_football_lab\v027\verify.js`
- `node verify.js`
- v027 内に v026 固有のタイトル・サイクル名が残っていないことを検索する

