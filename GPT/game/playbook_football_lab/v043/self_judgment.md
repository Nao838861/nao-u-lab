# Playbook Football Lab v043 自己評価

## 良くなったところ

- 保存済み defensive look を比較したい順番へ並び替えられるようになった。
- active look は移動後も維持され、保存リストの整理がしやすくなった。
- debug snapshot に `activeDefenseSlotIndex` が入り、並び順の検証ができる。

## 弱いところ

- `Up` / `Down` は文字ボタンで、現代的なツール UI としてはまだ弱い。
- 保存済み route slot には同じ並び替えがない。
- `Confirm delete` の残り時間は UI 上に表示していない。
- drag reorder ではなくボタン移動だけ。

## 次に直すなら

1. `Up` / `Down` を矢印アイコン風の短いボタンにする。
2. 保存済み route slot にも並び替えを追加する。
3. `Confirm delete` の残り時間を視覚的に示す。
4. second weak の線にも grade に応じた濃淡を入れる。
5. replay marker から preview 差分地点へジャンプできるようにする。
