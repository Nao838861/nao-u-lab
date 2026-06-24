# Playbook Football Lab v044 自己評価

## 良くなったところ

- defensive look の並び替えボタンが短くなり、保存操作エリアの密度が上がった。
- aria-label を残したため、矢印だけでも意味は失われていない。
- verify が矢印表示まで見るようになった。

## 弱いところ

- 保存済み route slot には同じ並び替えがない。
- `Confirm delete` の残り時間は UI 上に表示していない。
- second weak の線には grade に応じた濃淡がない。
- reorder は drag ではなくボタン操作だけ。

## 次に直すなら

1. 保存済み route slot にも並び替えを追加する。
2. `Confirm delete` の残り時間を視覚的に示す。
3. second weak の線にも grade に応じた濃淡を入れる。
4. threat line の危険度に down / distance を反映する。
5. replay marker から preview 差分地点へジャンプできるようにする。
