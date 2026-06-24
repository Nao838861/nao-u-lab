# サイクル 035

## 判断

v034 で削除確認は安全になった。次の弱点は、weak cue が「誰が弱いか」だけで「なぜ弱いか」をフィールド上で伝えていないこと。右パネルの defender strength まで視線を戻さず、弱点の理由を短く読めるようにする。

## 実装

- `drawWeakCoverageCue()` のラベルを拡張した。
- `weak <grade>` の下に `weak.note` を表示するようにした。
- `weak.note` は `currentCoverageStrength()` と同じ note なので、右パネルとフィールドの理由が一致する。
- snapshot に `weakCoverageNote` を追加した。

## 検証

- `node --check game\playbook_football_lab\v035\game.js`
- `node --check game\playbook_football_lab\v035\verify.js`
- `node verify.js`
- v035 内に v034 固有のタイトル・サイクル名が残っていないことを検索する

