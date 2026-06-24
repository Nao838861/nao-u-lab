# Playbook Football Lab v036 自己評価

## 良くなったところ

- 守備ルックを複製して比較用に残す時、名前が `Copy` だけで衝突しにくくなった。
- `Base Copy 2` のように増えるため、保存リストの見分けが少し良くなった。
- 複製後に即編集できる既存の流れは保った。

## 弱いところ

- フィールド上の weak cue は配置が固定で、端に近い defender では読みにくい可能性がある。
- `Confirm delete` は時間で自動解除されず、押し間違え後に残り続ける。
- zone defender の弱点理由は文字だけで、receiver との関係線はまだない。
- 保存済み look の並び替えはまだできない。

## 次に直すなら

1. weak cue のラベル位置を field bounds 内に clamp し、端でも読めるようにする。
2. `Confirm delete` を一定時間または別操作で自動解除する。
3. zone pad に近い receiver へ反応線を出す。
4. 保存済み守備ルックの並び替えを追加する。
5. replay marker から preview 差分地点へジャンプできるようにする。
