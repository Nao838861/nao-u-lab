# Playbook Football Lab v035 自己評価

## 良くなったところ

- weak cue が、点数だけでなく理由 note もフィールド上に出すようになった。
- 右パネルの `Defender strength` と同じ note を使うため、説明の食い違いがない。
- `X 120 px` や `route 90 px` のように、何から遠いのかがすぐ分かる。
- snapshot に `weakCoverageNote` が入り、表示理由を検証できる。

## 弱いところ

- ラベルが少し大きくなったため、密集時に選手や他 overlay と重なる可能性がある。
- 複製名は単純に `Copy` で、同名が増える可能性がある。
- `Confirm delete` は時間で自動解除されない。
- 保存 look の並べ替えはまだない。

## 次に直すなら

1. 複製名に連番を付ける。
2. weak cue のラベル位置を画面端で逃がす。
3. `Confirm delete` を一定時間で戻す。
4. zone pad に近い receiver へ反応線を出す。
5. リプレイマーカーから preview 差分地点へジャンプできるようにする。

