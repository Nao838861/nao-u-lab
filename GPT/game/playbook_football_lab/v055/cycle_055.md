# cycle_055

## 判断

v054 で replay badge は読みやすくなった。次に残るゲーム判断の粗さは、weak threat line の urgency が down / distance だけで、field position を見ていないことだった。敵陣深くでは弱点を突く重要度が上がるので、補正は控えめにしつつ red zone で強くなるようにする。

## 実装

- `fieldPositionUrgency()` を追加した。
- ball on 60 / 75 / 90 以上で段階的に urgency を足す。
- `downDistanceUrgency()` に field position 補正を加え、上限を 0.5 に広げた。
- debug snapshot に `fieldPositionUrgency` を追加した。
- v055 用 storage key に更新し、v054 route を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v055\game.js`
- `node --check game\playbook_football_lab\v055\verify.js`
- `node verify.js`
- v055 内に v054 固有のタイトル・サイクル名が残っていないことを検索する

## 次の候補

- replay marker の選択中状態を表示する。
- delete confirmation の aria 補助を追加する。
- toolbar の mobile 折り返しをさらに調整する。
