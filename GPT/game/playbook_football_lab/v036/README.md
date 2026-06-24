# Playbook Football Lab v036

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v036 の狙い

v035 で最弱 defender の理由はフィールド上に出た。v036 では保存した守備ルックを複製する時の名前を一意にし、同じ call 内で比較用ルックを複数作っても見分けやすくした。

## 操作

- フィールド上の赤い `weak` ラベル: 現在の最弱 defender
- `weak` 下の小さな行: 弱い理由の要約
- `Defense Looks`: call ごとの守備ルック保存、適用、複製、削除
- 複製名: `Base Copy` が既にある場合は `Base Copy 2` のように増える
- `Defender strength`: defender ごとの詳細な strength 一覧

## 実装済み

- 守備ルック複製名の一意化
- weak cue の理由行
- `weakCoverageNote` snapshot
- v036 用 storage key と v035 route legacy 読み
