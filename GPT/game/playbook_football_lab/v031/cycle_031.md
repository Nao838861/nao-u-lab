# サイクル 031

## 判断

v030 で defender strength は右パネルに出たが、弱点をフィールド上で探すにはまだ視線移動が必要だった。守備設計では「弱い数値」だけでなく「どの位置が危ないか」が重要なので、最弱 defender をフィールド上に直接強調する。

## 実装

- `drawWeakCoverageCue()` を追加した。
- `currentCoverageStrength()` の最下位 defender を赤い破線リングで強調する。
- defender の横に `weak <grade>` ラベルを描く。
- snapshot に `weakCoverage` を追加した。

## 検証

- `node --check game\playbook_football_lab\v031\game.js`
- `node --check game\playbook_football_lab\v031\verify.js`
- `node verify.js`
- v031 内に v030 固有のタイトル・サイクル名が残っていないことを検索する

