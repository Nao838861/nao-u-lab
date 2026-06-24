# Playbook Football Lab v018

PlayMaker Football の「プレーを作って結果を見る」面白さを、現代的なフットボール試作盤として育てているプロトタイプ。

## 起動

`index.html` をブラウザで開く。

## 操作

- `1` から `3`: プレー選択
- `Space`: スナップ
- `R`: ドライブ初期化
- `P`: 一時停止/再開
- `L`: 直前のプレーをリプレイ
- `,` / `.`: リプレイを1フレーム戻す/進める
- `Edit routes`: WR / TE / RB のルート点をドラッグ編集
- `Add point`: ルート線付近をクリックして中間点を追加
- `Delete point`: 中間点だけを削除
- `Save slot`: 現在の攻撃ルートを名前付きの新規案として保存
- `Quick save`: 選択中の攻撃保存案を上書き
- `Edit defense`: 守備選手の初期位置をドラッグ編集
- `Cycle duty`: 守備選手をクリックして `rush / press / man / zone` を切り替え
- `Save defense`: 現在の守備コール用に守備配置と責任を保存
- `Reset defense`: 現在の守備コールの保存内容を削除
- `Throw timing`: QB が投げるタイミングを調整
- `0.45x / 1x / 1.45x`: 再生速度を変更

## v018 の狙い

v017 では守備の初期配置を編集できるようになったが、守備選手の責任は固定だった。v018 では、各守備選手のtraitを簡単に切り替えられるようにして、同じ配置でもrush、press、man、zoneの違いを試せるようにした。

保存した守備には位置と責任が一緒に残る。スナップ後の細かいAIはまだ簡易だが、攻撃ルートと守備責任の噛み合わせを試す土台ができた。

## 実装済み

- 守備選手ごとの `rush / press / man / zone` 切替
- 守備配置保存にtraitを含める
- スナップ時に保存済みtraitを復元
- HUDの守備責任表示
- snapshot の `dutyEdit`
- 既存の守備配置編集、攻撃ルート保存スロット、リプレイ、holding処理、screen wall、block quality
