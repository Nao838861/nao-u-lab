# Playbook Football Lab v031 自己評価

## 良くなったところ

- 最弱 defender がフィールド上で直接見えるようになり、修正対象を探しやすくなった。
- パネルの strength 評価とフィールド表示が同じ `currentCoverageStrength()` に基づくため、表示の根拠が揃っている。
- 保存した守備 look を呼び出した時に、どこから直せばよいかが見えやすくなった。
- snapshot の `weakCoverage` で、最弱判定を検証できるようになった。

## 弱いところ

- weak cue は最弱 defender 1 人だけで、2 番目以降のリスクはフィールド上で見えない。
- `weak` の意味は直感的だが、なぜ弱いかは右パネルの note を読む必要がある。
- `Reset defense` の文言はまだ active look 削除として分かりにくい。
- 保存 look の複製や並べ替えはまだない。

## 次に直すなら

1. `Reset defense` の文言を `Delete look` に寄せる。
2. weak cue に対象 receiver / zone note を短く出す。
3. 保存 look に複製ボタンを付ける。
4. zone pad に近い receiver へ反応線を出す。
5. リプレイマーカーから preview 差分地点へジャンプできるようにする。

