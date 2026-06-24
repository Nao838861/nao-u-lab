# Playbook Football Lab v050 自己評価

## 良くなったところ

- `PREVIEW DELTA` frame に field badge が出るようになり、marker で飛んだ場所の意味がその場で分かる。
- badge は replay frame 側にも保存されるので、frame stepping でも分析情報が残る。
- debug snapshot に `previewDeltaBadge` が入り、表示状態を検証できる。

## 弱いところ

- 保存ボタン群を toolbar として整理する余地がある。
- countdown はボタン文言だけで、progress bar ではない。
- urgency は down / distance だけで、field position や clock はまだ見ていない。
- badge の本文は長文を単純に切っているだけで、内容の要約はまだ粗い。

## 次に直すなら

1. 保存ボタン群を小さな toolbar として整理する。
2. delete countdown を progress 表現にする。
3. route/defense reorder の端状態を disabled で示す。
4. badge 文を outcome 別に短く整形する。
5. urgency に field position を少しだけ反映する。
