# cycle_040

## 判断

v039 で weak defender と target の関係線は見えるようになった。次に必要なのは、その線に危険度の差を持たせることだった。固定の線だけでは、どれほど弱いかを視線だけで判断しにくい。

## 実装

- v040 用 storage key に更新した。
- `weakThreatStyle()` を追加した。
- weak grade から `danger` を計算し、line width / alpha / target radius に反映した。
- zone landmark 線の alpha も danger に連動した。
- debug snapshot に `weakCoverageThreatStyle` を追加した。

## 検証

- `node --check game\playbook_football_lab\v040\game.js`
- `node --check game\playbook_football_lab\v040\verify.js`
- `node verify.js`
- v040 内に v039 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

弱点の重さは読めるようになった。次は 2 番目に弱い defender も薄く出すと、守備調整の比較がしやすくなる。
