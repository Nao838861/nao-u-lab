# Playbook Football Lab v020

PlayMaker Football の「プレーを作って結果を見る」面白さを、現代的なフットボール試作盤として育てているプロトタイプ。

## v020 の狙い

v019 でスナップ前の matchup preview を追加したが、右パネルの数値だけでは根拠が分かりにくかった。v020 では、previewが見ている上位3ルートをフィールド上に線で表示する。

レシーバーの想定到達点から、主に影響する守備選手へ線を引く。最有力ルートは実線、次点は破線。gradeが高いものは緑、危険寄りは赤、中間は金で表示する。

## 実装済み

- `drawPreviewLines()` によるフィールド上のpreview根拠線
- preview上位3件の想定到達点マーカー
- gradeと主な守備選手の小ラベル
- setup/edit中だけ表示し、実プレー中やリプレイ中は非表示
- v019のmatchup preview UIと連動
