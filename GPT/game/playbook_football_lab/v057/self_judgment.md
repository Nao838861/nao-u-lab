# Playbook Football Lab v057 自己評価

## 良くなったところ

- delete confirmation に live region と aria label が入り、状態が視覚以外にも伝わるようになった。
- confirmation 中は `aria-pressed` と残り秒数入り label が更新される。
- debug snapshot に aria label と live region text が入り、補助状態を検証できる。

## 弱いところ

- urgency は clock までは見ていない。
- badge の文はまだ英語で、他の日本語 UI との一体感は弱い。
- marker active は exact frame 一致のみなので、marker 直後の近い frame では外れる。
- live region 文も英語で、既存の日本語ログと揃っていない。

## 次に直すなら

1. marker active を近傍 frame でも保持する。
2. badge 文と live region 文を日本語 UI に寄せる。
3. toolbar の mobile 折り返しをさらに調整する。
4. urgency に clock を少しだけ反映する。
5. replay marker の active 範囲を snapshot に出す。
