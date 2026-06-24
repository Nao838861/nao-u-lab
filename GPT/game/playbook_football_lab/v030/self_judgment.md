# Playbook Football Lab v030 自己評価

## 良くなったところ

- 保存した守備 look の比較材料として、defender ごとの strength が見えるようになった。
- receiver 側の matchup preview だけでなく、守備側の weak spot も読める。
- `man/press` は対象 receiver、zone は landmark、rush は QB への距離という既存ロジックに沿った評価になっている。
- snapshot に `coverageStrength` が入り、次の検証で評価値の変化を追いやすい。

## 弱いところ

- strength は距離ベースの簡易評価で、受け渡しや route concept の相性までは見ていない。
- grade の根拠は note に出るが、field 上の弱点強調はまだない。
- `Reset defense` は active look 削除として働くが、文言はまだ紛らわしい。
- 保存 look の複製や比較ビューはまだない。

## 次に直すなら

1. weak defender / weak area をフィールド上で軽く強調する。
2. `Reset defense` の文言を `Delete look` に寄せる。
3. 保存 look に複製ボタンを付ける。
4. zone pad に近い receiver へ反応線を出す。
5. リプレイマーカーから preview 差分地点へジャンプできるようにする。

