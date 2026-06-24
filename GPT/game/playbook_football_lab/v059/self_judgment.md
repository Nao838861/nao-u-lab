# Playbook Football Lab v059 自己評価

## 良くなったところ

- 予測差分の label と badge 理由が日本語になり、結果の読み取りが途切れにくくなった。
- 削除確認の button / aria label / live region が日本語化され、危険操作の状態が UI と揃った。
- verify で日本語化された文言を検査できる。

## 弱いところ

- toolbar の mobile 折り返しはまだ窮屈になる可能性がある。
- urgency は clock までは見ていないので、試合終盤の状況感は弱い。
- 予測差分のラベル変更が marker strip 以外の説明文にも十分に見えているかは追加確認したい。

## 次に直すなら

1. toolbar の mobile 折り返しをさらに調整する。
2. urgency に clock を少しだけ反映する。
3. replay marker window の範囲を UI に小さく示す。
4. marker 同士が近い時の優先順位を snapshot に出す。
5. 日本語化した文言の長さを field badge 幅に合わせてさらに短縮する。
