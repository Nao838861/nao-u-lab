# cycle_043

## 判断

v042 でフィールド上の弱点表示はかなり安定した。次は defensive look を保存・複製した後の整理が弱い。比較したい順番に並べられないと、保存リストが増えた時に評価が散らかる。

## 実装

- v043 用 storage key に更新した。
- `Up` / `Down` ボタンを Defense Looks に追加した。
- `moveActiveDefenseSlot(delta)` を追加した。
- active look を上下に動かしても activeId は維持する。
- debug snapshot に `activeDefenseSlotIndex` を追加した。

## 検証

- `node --check game\playbook_football_lab\v043\game.js`
- `node --check game\playbook_football_lab\v043\verify.js`
- `node verify.js`
- v043 内に v042 固有のタイトル・サイクル名が残っていないことを検索する

## 次の観察

保存済み守備ルックの整理はできるようになった。ただし `Up` / `Down` はまだ見た目が粗いので、次は短い矢印ボタンにしてツール感を上げるのが自然。
