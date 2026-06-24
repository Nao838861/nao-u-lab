# Playbook Football Lab v058 自己評価

## 良くなったところ

- replay marker の active 表示が exact frame だけで外れなくなった。
- replay strip の `aria-current` も近傍判定に揃った。
- debug snapshot で active marker と active window を検証できる。

## 弱いところ

- badge 文と live region 文はまだ英語で、日本語 UI との一体感が弱い。
- toolbar の mobile 折り返しはまだ窮屈になる可能性がある。
- urgency は clock までは見ていないので、試合終盤の状況感は弱い。

## 次に直すなら

1. badge 文と live region 文を日本語 UI に寄せる。
2. toolbar の mobile 折り返しをさらに調整する。
3. urgency に clock を少しだけ反映する。
4. replay marker window の範囲を UI に小さく示す。
5. marker 同士が近い時の優先順位を snapshot に出す。
