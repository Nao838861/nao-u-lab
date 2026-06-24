# Playbook Football Lab v028 自己評価

## 良くなったところ

- Reads / Man / Zone の表示設定が保存され、編集セッションをまたいでも視界が維持されるようになった。
- toggle の見た目と state が起動時に同期するため、保存状態と画面状態がズレにくい。
- overlay 用 storage key が snapshot に出るため、保存周りの検証がしやすい。
- 操作の好みを保持することで、戦術編集を繰り返す道具として少し安定した。

## 弱いところ

- 守備保存スロットはまだ 1 コール 1 件なので、比較編集は弱い。
- overlay の凡例はまだ最低限で、線種や色の意味を覚える必要がある。
- coverage strength のような守備側評価がないため、良い配置かどうかは preview を間接的に読む必要がある。
- localStorage 失敗時は console warning だけで、画面上の通知はない。

## 次に直すなら

1. 守備保存にも名前付きスロットを入れる。
2. defender ごとの coverage strength を表示する。
3. overlay 凡例を小さく整理する。
4. zone pad に近い receiver へ反応線を出す。
5. リプレイマーカーから preview 差分地点へジャンプできるようにする。

