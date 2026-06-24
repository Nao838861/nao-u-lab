# Playbook Football Lab v037

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なブラウザ上のフットボール試作として育てているプロトタイプ。

## v037 の狙い

v036 で守備ルック管理は少し扱いやすくなった。v037 ではフィールド上の `weak` ラベルを field bounds 内に収め、端に近い defender でも理由行が切れないようにした。

## 操作

- フィールド上の赤い `weak` ラベル: 現在の最弱 defender
- `weak` 下の小さな行: 弱い理由の要約
- weak ラベルは defender が端にいてもフィールド内へ寄る
- `Defense Looks`: call ごとの守備ルック保存、適用、複製、削除
- 複製名: `Base Copy` が既にある場合は `Base Copy 2` のように増える
- `Defender strength`: defender ごとの詳細な strength 一覧

## 実装済み

- weak cue ラベル位置の field bounds clamp
- 守備ルック複製名の一意化
- weak cue の理由行
- `weakCoverageLabel` snapshot
- v037 用 storage key と v036 route legacy 読み
