# Playbook Football Lab v037 自己評価

## 良くなったところ

- weak cue のラベルがフィールド端で切れにくくなった。
- 理由行の長さに応じてラベル幅を決めるため、短い固定幅より読みやすい。
- debug snapshot に `weakCoverageLabel` が入り、位置の検証対象になった。

## 弱いところ

- `Confirm delete` は時間で自動解除されず、押し間違え後に残り続ける。
- zone defender の弱点理由は文字だけで、receiver との関係線はまだない。
- weak cue は defender と理由を出すだけで、どの offensive player が脅威かはまだ直接示していない。
- 保存済み look の並び替えはまだできない。

## 次に直すなら

1. `Confirm delete` を一定時間または別操作で自動解除する。
2. zone pad に近い receiver へ反応線を出す。
3. weak cue から関連 receiver / zone landmark への薄い線を追加する。
4. 保存済み守備ルックの並び替えを追加する。
5. replay marker から preview 差分地点へジャンプできるようにする。
