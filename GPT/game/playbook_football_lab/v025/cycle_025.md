# サイクル 025

## 判断

v024 で defender / duty / target は直接編集できるようになったが、フィールド上では man/press の対応関係がまだ暗黙だった。守備設計を遊びとして成立させるには、スナップ前に「誰が誰を見ているか」が一目で分かる必要がある。今回は setup 中の可視化を足す。

## 実装

- setup 中に `man` / `press` defender から担当 receiver へ青い target link を描画する `drawManTargetLines()` を追加した。
- 選択中 defender の target link は太く濃く表示する。
- `press` は実線、`man` は破線で表示し、同じ target link でも性質が分かるようにした。
- matchup preview の説明文に blue target links の意味を追加した。
- snapshot に `manTargetLinks` を追加した。

## 検証

- `node --check game\playbook_football_lab\v025\game.js`
- `node --check game\playbook_football_lab\v025\verify.js`
- `node verify.js`
- v025 内に v024 固有のタイトル・サイクル名が残っていないことを検索する

