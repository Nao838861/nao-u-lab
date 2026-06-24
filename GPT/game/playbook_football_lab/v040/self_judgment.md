# Playbook Football Lab v040 自己評価

## 良くなったところ

- weak threat line に危険度が出るようになり、ただの補助線より読む順番が分かりやすくなった。
- grade が低いほど target marker も大きくなるため、弱点の重さがフィールド上に出る。
- debug snapshot に `weakCoverageThreatStyle` が入り、見た目の根拠を検証できる。

## 弱いところ

- 2番目に弱い defender はまだ表示されず、比較読みはできない。
- 保存済み look の並び替えはまだできない。
- `Confirm delete` の残り時間は UI 上に表示していない。
- threat line の強弱は grade だけで、play context や down/distance は見ていない。

## 次に直すなら

1. 2番目に弱い defender も薄く表示する。
2. 保存済み守備ルックの並び替えを追加する。
3. `Confirm delete` の残り時間を視覚的に示す。
4. threat line の危険度に down / distance を反映する。
5. replay marker から preview 差分地点へジャンプできるようにする。
