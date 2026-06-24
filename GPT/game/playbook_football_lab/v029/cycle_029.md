# サイクル 029

## 判断

v028 までで守備編集と表示はかなり読めるようになったが、守備保存は 1 コール 1 件のままだった。複数の守備案を作って比較できないと、プレーブック作成ゲームとして試行錯誤が弱い。今回は守備にも名前付きスロットを入れる。

## 実装

- `defenseNameInput` / `newDefenseButton` / `defenseSlotList` を追加した。
- 守備保存を `callName -> { activeId, slots[] }` 形式に正規化した。
- 旧形式の `callName -> layout` は `Saved 1` として読み込む後方互換を入れた。
- `Save defense` は active look を上書き、`New look` は新規 look として保存する。
- defense call カードに保存数を表示し、snapshot に `defenseSlots` を追加した。

## 検証

- `node --check game\playbook_football_lab\v029\game.js`
- `node --check game\playbook_football_lab\v029\verify.js`
- `node verify.js`
- v029 内に v028 固有のタイトル・サイクル名が残っていないことを検索する

