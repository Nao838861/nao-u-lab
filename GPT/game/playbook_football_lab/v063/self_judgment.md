# Playbook Football Lab v063 自己評価

## 良くなったところ

- replay marker が近接した時の active 候補と選択理由を snapshot で見られる。
- 同距離の場合は登録順優先という仕様がコードと snapshot reason に出た。
- UI を増やさずに replay 検証性を上げられた。

## 弱いところ

- 日本語化した文言の長さは field badge 幅に対してまだ最適化しきれていない。
- mobile toolbar の visual density はまだ実ブラウザで見ていない。
- clock はまだ簡易モデルで、hurry-up / chew clock までは無い。

## 次に直すなら

1. 日本語化した文言の長さを field badge 幅に合わせてさらに短縮する。
2. mobile toolbar の visual density をスクリーンショットで確認する。
3. hurry-up / chew clock の選択を小さく足す。
4. replay marker の kind ごとに title の理由文を短く整える。
5. clock urgency の効き具合を snapshot で数値比較しやすくする。
