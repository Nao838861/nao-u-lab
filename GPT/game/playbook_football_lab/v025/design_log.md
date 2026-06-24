# Playbook Football Lab v025 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v024 で直接編集は入ったが、フィールド上で man target が見えないままだと、守備編集の結果を頭の中で補完する必要がある。フットボールらしさを上げるには、選手の責任と対象が画面から読めることが重要なので、setup 中の target link を追加した。

## 変更

- `drawManTargetLines()` を追加した。
- man/press defender から担当 receiver へ blue target link を描く。
- 選択中 defender の link は太く、press は実線、man は破線で描く。
- matchup preview と snapshot に target link 情報を追加した。

