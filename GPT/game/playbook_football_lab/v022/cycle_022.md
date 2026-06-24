# サイクル022 自己判断

日付: 2026-06-24

## 観察

v021でpreviewと結果の差分はつながった。しかし、守備責任が `rush / press / man / zone` だけだと、zoneの中身が粗く、previewも結果説明も曖昧になる。

## 判断

今回はzoneをhook/curl/flat/deepに分ける。守備作戦として意味のある空間差を作り、previewと実挙動の両方を改善する。

## 実装

- duty循環にhook/curl/flat/deepを追加。
- zone系traitのランドマークを追加。
- preview leverageをzone責任別に変更。
- 実プレー中のzone守備移動も責任別に変更。

## 次の候補

LB/Sのman対象を選べるようにする。zoneの解像度が上がったので、次はman責任の粗さを直す。
