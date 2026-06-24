# Playbook Football Lab v047 自己評価

## 良くなったところ

- second weak の線にも grade に応じた濃淡が入り、比較表示として読みやすくなった。
- 主 weak より控えめな範囲にしたので、主役の cue を邪魔しにくい。
- debug snapshot に `secondWeakThreatStyle` が入り、見た目の根拠を検証できる。

## 弱いところ

- replay marker から preview 差分地点へはまだジャンプできない。
- threat line の危険度に down / distance はまだ反映していない。
- 保存ボタン群を toolbar として整理する余地がある。
- countdown はボタン文言だけで、progress bar ではない。

## 次に直すなら

1. replay marker から preview 差分地点へジャンプできるようにする。
2. threat line の危険度に down / distance を反映する。
3. 保存ボタン群を小さな toolbar として整理する。
4. delete countdown を progress 表現にする。
5. route/defense reorder の端状態を disabled で示す。
