# cycle_046

## 判断

v045 で攻守の保存スロットは整理できるようになった。次に扱うべきは `Confirm delete` の残り時間が見えないこと。自動解除はあるが、いつ解除されるか見えないと操作状態が曖昧になる。

## 実装

- v046 用 storage key に更新した。
- `deleteLookConfirmInterval` と `deleteLookConfirmDeadline` を追加した。
- `deleteLookConfirmRemainingMs()` を追加した。
- `updateDeleteLookConfirmText()` で `Confirm 3s` のように表示する。
- debug snapshot に `deleteLookConfirmRemainingMs` を追加した。

## 検証

- `node --check game\playbook_football_lab\v046\game.js`
- `node --check game\playbook_football_lab\v046\verify.js`
- `node verify.js`
- v046 内に v045 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

破壊的操作の状態は分かりやすくなった。次は second weak の線にも grade に応じた濃淡を入れると、比較表示が主 weak cue と揃う。
