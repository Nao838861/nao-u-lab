# Playbook Football Lab v029 自己評価

## 良くなったところ

- 守備 look を複数保存できるため、試行錯誤が「その場の一回限り」ではなくなった。
- 同じ defensive call の中で rush/man/zone の配分を変えた案を比較できる。
- 旧形式の保存も `Saved 1` として読めるため、既存ユーザー設定を捨てない。
- defense call カードに保存数が出るので、どのコールに仕込みがあるか分かる。

## 弱いところ

- look の削除は `Reset defense` で active look を消す形なので、ラベルとしては少し分かりにくい。
- 保存 look の並べ替えや複製はない。
- coverage strength はまだなく、保存した look の良し悪しを一覧で比較できない。
- route slot と defense slot の UI が似てきたため、将来的には部品化した方が安全。

## 次に直すなら

1. defender ごとの coverage strength を表示する。
2. `Reset defense` の文言を `Delete look` 寄りに整理する。
3. 保存 look に複製ボタンを付ける。
4. zone pad に近い receiver へ反応線を出す。
5. リプレイマーカーから preview 差分地点へジャンプできるようにする。

