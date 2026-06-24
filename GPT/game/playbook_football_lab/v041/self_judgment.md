# Playbook Football Lab v041 自己評価

## 良くなったところ

- 最弱 defender だけでなく、次に弱い defender もフィールド上で比較できるようになった。
- second weak は薄い表示なので、主役の weak cue を邪魔しにくい。
- debug snapshot に `secondWeakCoverage` が入り、比較対象を検証できる。

## 弱いところ

- second weak のラベルは field bounds clamp していない。
- 保存済み look の並び替えはまだできない。
- `Confirm delete` の残り時間は UI 上に表示していない。
- second weak は線の危険度を細かく変えていない。

## 次に直すなら

1. second weak ラベルも field bounds 内に clamp する。
2. 保存済み守備ルックの並び替えを追加する。
3. `Confirm delete` の残り時間を視覚的に示す。
4. second weak の線にも grade に応じた濃淡を入れる。
5. replay marker から preview 差分地点へジャンプできるようにする。
