# Playbook Football Lab v048 自己評価

## 良くなったところ

- 結果カードの preview 差分が `PREVIEW DELTA` replay marker として残るようになった。
- marker を押すだけで結果が分岐した frame に戻れるため、何が起きたのかの説明力が上がった。
- debug snapshot に `previewDeltaMarker` が入り、結果と marker の接続を検証できる。

## 弱いところ

- threat line の危険度に down / distance はまだ反映していない。
- 保存ボタン群を toolbar として整理する余地がある。
- countdown はボタン文言だけで、progress bar ではない。
- `PREVIEW DELTA` の marker は text label だけなので、field 上の補助表示としてはまだ弱い。

## 次に直すなら

1. threat line の危険度に down / distance を反映する。
2. `PREVIEW DELTA` frame で field 上にも一瞬の分析 badge を出す。
3. 保存ボタン群を小さな toolbar として整理する。
4. delete countdown を progress 表現にする。
5. route/defense reorder の端状態を disabled で示す。
