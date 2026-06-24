# Playbook Football Lab v060 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v059 で UI 文言を日本語化したことで、button label が長くなった。compact toolbar は desktop では密度が高くて良いが、mobile では削除や保存の label が狭い列に入り、読みにくくなる可能性がある。v060 では mobile の grid area を明示して、削除操作を別行へ逃がす。

## 変更

- mobile 用の route toolbar grid area を追加した。
- mobile 用の defense toolbar grid area を追加した。
- toolbar button に ellipsis と `min-width: 0` を追加した。
- storage key を v060 に更新した。

## 残り

- urgency は clock までは見ていない。
- replay marker window の範囲は UI にはまだ出ていない。
