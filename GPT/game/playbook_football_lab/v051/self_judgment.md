# Playbook Football Lab v051 自己評価

## 良くなったところ

- route slot と defensive look の保存操作が compact toolbar になり、編集 UI の密度が上がった。
- Save、矢印、Delete の見た目が分かれ、危険操作が少し判別しやすくなった。
- defense 操作の文言を短くしたので、右 panel の詰まりが減った。

## 弱いところ

- countdown はボタン文言だけで、progress bar ではない。
- urgency は down / distance だけで、field position や clock はまだ見ていない。
- badge の本文は長文を単純に切っているだけで、内容の要約はまだ粗い。
- toolbar の矢印は端にいる時も押せる見た目のまま。

## 次に直すなら

1. route/defense reorder の端状態を disabled で示す。
2. delete countdown を progress 表現にする。
3. badge 文を outcome 別に短く整形する。
4. urgency に field position を少しだけ反映する。
5. toolbar の mobile 折り返しをさらに調整する。
