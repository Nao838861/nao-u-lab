# Playbook Football Lab v035

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v035 の狙い

v031 以降、最弱 defender はフィールド上に出るようになった。v035 ではそのラベルに理由を追加し、対象 receiver や zone landmark との距離をフィールド上で読めるようにした。

## 操作

- フィールド上の赤い `weak` ラベル: 現在の最弱 defender
- `weak` 下の小さな行: 弱い理由の要約
- `Defender strength`: defender ごとの詳細な strength 一覧

## 実装済み

- weak cue の理由行
- `weakCoverageNote` snapshot
- v035 用 storage key と v034 route legacy 読み

