# サイクル 026

## 判断

v025 で man/press の担当線は見えるようになったが、zone duty はまだ抽象的だった。`hook / curl / flat / deep` を直接選べても、フィールド上でどこを守るのかが見えなければ、ユーザーは名前を覚えるだけになる。今回は zone landmark を setup 中に表示する。

## 実装

- `drawZoneLandmarks()` を追加した。
- `isZoneDuty()` と `zoneLandmark()` を使い、実際の AI 移動先と同じ基準で gold pad を描画する。
- 選択中 defender の zone pad は濃く太く表示する。
- defender から landmark への補助線を描き、どの選手の責任か分かるようにした。
- matchup preview の説明と snapshot に `zoneLandmarks` を追加した。

## 検証

- `node --check game\playbook_football_lab\v026\game.js`
- `node --check game\playbook_football_lab\v026\verify.js`
- `node verify.js`
- v026 内に v025 固有のタイトル・サイクル名が残っていないことを検索する

