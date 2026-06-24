# Playbook Football Lab v045 自己評価

## 良くなったところ

- 攻撃 route slot も defensive look と同じように並び替えられるようになった。
- 保存した攻撃バリエーションを比較順に整理できる。
- debug snapshot に `activeSavedSlotIndex` が入り、route slot の順序検証ができる。

## 弱いところ

- `Confirm delete` の残り時間は UI 上に表示していない。
- second weak の線には grade に応じた濃淡がない。
- route slot reorder も drag ではなくボタン操作だけ。
- playbook 保存と defense 保存のボタン群が少し増えてきた。

## 次に直すなら

1. `Confirm delete` の残り時間を視覚的に示す。
2. second weak の線にも grade に応じた濃淡を入れる。
3. threat line の危険度に down / distance を反映する。
4. replay marker から preview 差分地点へジャンプできるようにする。
5. 保存ボタン群を小さな toolbar として整理する。
