# Playbook Football Lab v033 自己評価

## 良くなったところ

- 保存済み look を壊さずにコピーして調整できるようになった。
- active look がない時も現在の守備配置から複製できるため、保存前の試作を別案にしやすい。
- 複製後に新しい slot が active になるので、そのまま編集へ進める。
- snapshot に `activeDefenseSlot` が入り、保存状態の確認がしやすくなった。

## 弱いところ

- 複製名は単純に `Copy` を付けるだけで、同名が増える可能性がある。
- `Delete look` に確認状態はまだない。
- weak cue は 1 人だけで、なぜ弱いかはまだラベルからは分からない。
- 保存 look の並べ替えはまだない。

## 次に直すなら

1. `Delete look` に軽い確認状態を入れる。
2. weak cue に対象 receiver / zone note を短く出す。
3. 複製名に連番を付ける。
4. zone pad に近い receiver へ反応線を出す。
5. リプレイマーカーから preview 差分地点へジャンプできるようにする。

