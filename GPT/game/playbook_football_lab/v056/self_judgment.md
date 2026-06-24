# Playbook Football Lab v056 自己評価

## 良くなったところ

- replay marker が現在 frame と一致すると active 表示になるようになった。
- `aria-current` も付くため、視覚だけでなく状態としても現在 marker を示せる。
- debug snapshot に `activeReplayMarker` が入り、replay UI state を検証できる。

## 弱いところ

- urgency は clock までは見ていない。
- delete progress はボタン内背景だけで、専用のラベルや aria 補助はまだない。
- badge の文はまだ英語で、他の日本語 UI との一体感は弱い。
- marker active は exact frame 一致のみなので、marker 直後の近い frame では外れる。

## 次に直すなら

1. delete confirmation の aria 補助を追加する。
2. marker active を近傍 frame でも保持する。
3. toolbar の mobile 折り返しをさらに調整する。
4. badge 文を日本語 UI に寄せる。
5. urgency に clock を少しだけ反映する。
