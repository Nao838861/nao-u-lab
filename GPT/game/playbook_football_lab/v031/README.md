# Playbook Football Lab v031

PlayMaker Football の「プレーを組んで結果を見る」面白さを、現代的なフットボール試作として育てているプロトタイプ。

## v031 の狙い

v030 で defender ごとの strength を見られるようになった。v031 ではその中の weak spot をフィールド上でも直接示し、守備 look のどこを直すべきかをすぐ見つけられるようにした。

## 操作

- `Defender strength`: defender ごとの強さを見る
- フィールド上の赤い `weak` ラベル: 現在の最弱 defender
- `Defender / Duty / Target`: 選択中 defender の責任と man target を直接指定する
- `Save defense`: active look を上書き保存する
- `New look`: 現在の守備設定を新しい look として保存する

## 実装済み

- `drawWeakCoverageCue()`
- 最弱 defender の赤リング表示
- `weakCoverage` snapshot
- v031 用 storage key と v030 route legacy 読み

