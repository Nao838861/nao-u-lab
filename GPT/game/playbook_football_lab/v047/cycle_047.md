# cycle_047

## 判断

v046 で delete confirmation の状態表示は改善した。次に残る粗さは、second weak が固定の薄い線で、grade の違いが視覚的に読めないことだった。主 weak ほど強くしない範囲で濃淡を付ける。

## 実装

- v047 用 storage key に更新した。
- `secondWeakThreatStyle(second)` を追加した。
- second weak の ring radius / line width / alpha / target radius を grade に連動した。
- debug snapshot に `secondWeakThreatStyle` を追加した。
- verify に second weak threat style の確認を追加した。

## 検証

- `node --check game\playbook_football_lab\v047\game.js`
- `node --check game\playbook_football_lab\v047\verify.js`
- `node verify.js`
- v047 内に v046 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

フィールド上の弱点比較はかなり読めるようになった。次は replay marker から preview 差分地点へジャンプできるようにすると、結果分析の使い勝手が上がる。
