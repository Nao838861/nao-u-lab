# cycle_039

## 判断

v038 で delete confirmation は安全になった。次に目立つ弱点は、weak defender の理由が文字では読めても、どの receiver / zone landmark との位置関係が問題なのかをフィールド上で追いにくいことだった。

## 実装

- v039 用 storage key に更新した。
- coverage strength row に `targetId` / `targetPoint` / `zonePoint` を持たせた。
- `drawWeakCoverageThreat()` を追加した。
- man / press / rush は defender から target へ赤い破線を引く。
- zone は defender -> zone landmark -> receiver の二段線にした。
- debug snapshot に `weakCoverageTarget` を追加した。

## 検証

- `node --check game\playbook_football_lab\v039\game.js`
- `node --check game\playbook_football_lab\v039\verify.js`
- `node verify.js`
- v039 内に v038 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

弱点の位置関係は見やすくなった。次は線の強弱を grade / distance に反映すると、危険度の読みがさらに速くなる。
