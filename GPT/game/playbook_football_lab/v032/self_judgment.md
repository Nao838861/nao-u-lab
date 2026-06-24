# Playbook Football Lab v032 自己評価

## 良くなったところ

- active look を削除する操作が `Delete look` として明確になった。
- 保存 look がない時のログも、削除対象がないことを正しく伝えるようになった。
- 保存スロット UI としての語彙が route slot 側に近づき、操作ミスが少し減る。
- 小さな文言修正だが、今後の look 複製や比較 UI を足す前の土台が整った。

## 弱いところ

- 削除確認はまだなく、誤クリックへの防御は弱い。
- 保存 look の複製や並べ替えはまだない。
- weak cue は 1 人だけで、なぜ弱いかはまだラベルからは分からない。
- coverage strength は距離ベースの簡易評価のまま。

## 次に直すなら

1. 保存 look に複製ボタンを付ける。
2. `Delete look` に軽い確認状態を入れる。
3. weak cue に対象 receiver / zone note を短く出す。
4. zone pad に近い receiver へ反応線を出す。
5. リプレイマーカーから preview 差分地点へジャンプできるようにする。

