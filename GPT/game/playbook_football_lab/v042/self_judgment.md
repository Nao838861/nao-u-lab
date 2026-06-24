# Playbook Football Lab v042 自己評価

## 良くなったところ

- `next weak` ラベルがフィールド端で切れにくくなった。
- second weak の比較表示も、主 weak cue と同じく bounds を意識するようになった。
- debug snapshot に `secondWeakCoverageLabel` が入り、位置検証ができる。

## 弱いところ

- 保存済み look の並び替えはまだできない。
- `Confirm delete` の残り時間は UI 上に表示していない。
- second weak の線には grade に応じた濃淡がない。
- weak/second weak の表示が増えた分、保存ルック一覧側の操作改善が相対的に遅れている。

## 次に直すなら

1. 保存済み守備ルックの並び替えを追加する。
2. `Confirm delete` の残り時間を視覚的に示す。
3. second weak の線にも grade に応じた濃淡を入れる。
4. threat line の危険度に down / distance を反映する。
5. replay marker から preview 差分地点へジャンプできるようにする。
