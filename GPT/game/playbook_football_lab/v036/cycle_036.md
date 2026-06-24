# cycle_036

## 判断

v035 で weak defender の理由はフィールド上に出た。次に触るべき粗さは、保存した守備ルックを複製すると名前が常に `Copy` になり、同じ call 内で複数回複製した時に区別しにくい点だった。

## 実装

- v036 用 storage key に更新した。
- 守備ルック複製時の名前生成を `uniqueDefenseSlotName()` に分離した。
- `Base Copy` が既にある場合は `Base Copy 2`、`Base Copy 3` のように連番を付ける。
- 24 文字制限に収まるように base 部分を短縮する。
- verify に複製名生成 helper の存在確認を追加した。

## 検証

- `node --check game\playbook_football_lab\v036\game.js`
- `node --check game\playbook_football_lab\v036\verify.js`
- `node verify.js`
- v036 内に v035 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

保存ルックの管理は少し扱いやすくなった。一方でフィールド上の weak cue は端に近い defender で読みにくくなる可能性が残るため、次はラベル配置の安定化が有力。
