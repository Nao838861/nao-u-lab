# Playbook Football Lab v039 自己評価

## 良くなったところ

- weak defender が何を追うべきか、フィールド上の線で読めるようになった。
- zone defender は landmark と receiver の関係が分かれ、単なる文字説明よりフットボールらしくなった。
- debug snapshot に `weakCoverageTarget` が入り、線の対象を検証できる。

## 弱いところ

- threat line の色や太さは固定で、どの程度危ないかの強弱はまだ表現していない。
- weak cue だけが target line を出すため、2番目に弱い defender との比較はできない。
- 保存済み look の並び替えはまだできない。
- `Confirm delete` の残り時間は UI 上に表示していない。

## 次に直すなら

1. threat line の太さや alpha を距離 / grade に応じて変える。
2. 保存済み守備ルックの並び替えを追加する。
3. `Confirm delete` の残り時間を視覚的に示す。
4. 2番目に弱い defender も薄く表示する。
5. replay marker から preview 差分地点へジャンプできるようにする。
