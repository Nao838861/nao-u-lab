# サイクル 024

## 判断

v023 で defender ごとの man target は持てるようになったが、操作はまだクリック巡回だった。これは「今誰の何を変えたのか」を追いにくく、守備設計の試行錯誤を遅くする。今回は新しい戦術ルールではなく、守備編集の手触りを改善する。

## 実装

- 右パネルに `Defender / Duty / Target` の直接セレクタを追加した。
- 選択中 defender を `selectedDefender` として状態化し、キャンバス上に青いリングで表示した。
- defender をクリックして duty/target を巡回した場合も、セレクタ側が同期するようにした。
- select の change と Apply ボタンから、選択 defender の duty と man target を直接反映できるようにした。
- snapshot と verify に direct defender controls を追加した。

## 検証

- `node --check game\playbook_football_lab\v024\game.js`
- `node --check game\playbook_football_lab\v024\verify.js`
- `node verify.js`
- v024 内に v023 固有のタイトル・サイクル名が残っていないことを検索する

