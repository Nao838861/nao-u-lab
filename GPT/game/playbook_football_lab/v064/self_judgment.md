# Playbook Football Lab v064 自己評価

## 良くなったところ

- 予測差分 badge が短くなり、field 上の小さな表示に収まりやすくなった。
- outcome ごとの意味は残しつつ、即時判断用の copy に寄った。
- truncation を `compactBadgeText()` にまとめ、今後の調整がしやすくなった。

## 弱いところ

- mobile toolbar の visual density はまだ実ブラウザで見ていない。
- clock はまだ簡易モデルで、hurry-up / chew clock までは無い。
- 短縮 copy が初見で十分伝わるかは実プレー画面で見たい。

## 次に直すなら

1. mobile toolbar の visual density をスクリーンショットで確認する。
2. hurry-up / chew clock の選択を小さく足す。
3. replay marker の kind ごとに title の理由文を短く整える。
4. clock urgency の効き具合を snapshot で数値比較しやすくする。
5. badge copy の短縮が分かりにくい場合に result card 側で補足する。
