# Playbook Football Lab v060 自己評価

## 良くなったところ

- mobile 幅で route / defense toolbar が 2 行に分かれ、長い日本語ラベルで潰れにくくなった。
- 削除操作が狭い列に押し込まれにくくなり、危険操作として見つけやすくなった。
- verify で mobile toolbar wrapping の CSS を検査できる。

## 弱いところ

- urgency は clock までは見ていないので、試合終盤の状況感は弱い。
- replay marker window の範囲は UI にはまだ出ていない。
- 実ブラウザで mobile 幅の見た目確認はまだしていない。

## 次に直すなら

1. urgency に clock を少しだけ反映する。
2. replay marker window の範囲を UI に小さく示す。
3. marker 同士が近い時の優先順位を snapshot に出す。
4. 日本語化した文言の長さを field badge 幅に合わせてさらに短縮する。
5. mobile toolbar の visual density をスクリーンショットで確認する。
