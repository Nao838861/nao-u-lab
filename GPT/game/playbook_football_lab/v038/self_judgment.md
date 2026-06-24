# Playbook Football Lab v038 自己評価

## 良くなったところ

- `Confirm delete` が残り続けず、約 3.2 秒で自動的に解除される。
- 保存、複製、別ルック選択で既に解除していた経路も timer を clear するようになった。
- debug snapshot に timeout 値が入り、確認挙動を検証しやすくなった。

## 弱いところ

- zone defender の弱点理由は文字だけで、receiver との関係線はまだない。
- weak cue は defender と理由を出すだけで、どの offensive player が脅威かはまだ直接示していない。
- 保存済み look の並び替えはまだできない。
- 削除確認の残り時間は UI 上に表示していない。

## 次に直すなら

1. zone pad に近い receiver へ反応線を出す。
2. weak cue から関連 receiver / zone landmark への薄い線を追加する。
3. 保存済み守備ルックの並び替えを追加する。
4. `Confirm delete` の残り時間を視覚的に示す。
5. replay marker から preview 差分地点へジャンプできるようにする。
