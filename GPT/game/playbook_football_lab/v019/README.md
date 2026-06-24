# Playbook Football Lab v019

PlayMaker Football の「プレーを作って結果を見る」面白さを、現代的なフットボール試作盤として育てているプロトタイプ。

## 起動

`index.html` をブラウザで開く。

## v019 の狙い

v018 で守備選手の責任を切り替えられるようになったが、スナップ前に「どのルートが通りそうか」を見る材料がなかった。v019 では、現在の攻撃ルート、投球タイミング、予測守備、守備責任から簡易的な matchup preview を出す。

Preview は右パネルの Scout report の下に表示される。各 eligible receiver のgrade、主に影響している守備選手と責任、rush count、hot riskを出す。これは完全な判定ではなく、スナップ前の作戦判断を助ける目安として扱う。

## 主な操作

- `Edit routes`: 攻撃ルート編集
- `Save slot` / `Quick save`: 攻撃ルート案の保存
- `Edit defense`: 守備初期位置の編集
- `Cycle duty`: 守備責任の切替
- `Save defense`: 守備配置と責任の保存
- `Throw timing`: previewの想定到達点にも反映

## 実装済み

- `matchupCard` UI
- `computeMatchupPreview()` によるスナップ前評価
- receiver別grade、想定深度、影響守備選手/責任の表示
- rush count / hot risk 表示
- ルート編集、守備編集、責任切替、投球タイミング変更時のpreview更新
- snapshot の既存情報を維持
