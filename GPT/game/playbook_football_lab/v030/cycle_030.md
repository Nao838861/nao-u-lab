# サイクル 030

## 判断

v029 で守備 look を複数保存できるようになったが、どの look が良いかは preview read を間接的に読む必要があった。守備案を比較するには、receiver 側の openness だけでなく defender 側の strength が必要になる。今回は defender ごとの coverage / pressure strength を右パネルに追加する。

## 実装

- `coverageCard` を matchup preview の下に追加した。
- `currentCoverageStrength()` を追加し、守備選手ごとの grade を算出する。
- `rush` は QB までの距離、`man/press` は target route point までの距離、zone duty は `zoneLandmark()` から最寄り route point までの距離で評価する。
- `renderCoverageCard()` で best defender と weak spot を表示する。
- snapshot に `coverageStrength` を追加した。

## 検証

- `node --check game\playbook_football_lab\v030\game.js`
- `node --check game\playbook_football_lab\v030\verify.js`
- `node verify.js`
- v030 内に v029 固有のタイトル・サイクル名が残っていないことを検索する

