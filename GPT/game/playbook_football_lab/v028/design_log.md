# Playbook Football Lab v028 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v027 で情報過多を避ける切替は入ったが、毎回初期化されると道具として弱い。守備設計は何度も開き直して比較する前提なので、表示レイヤーの好みを保存する。

## 変更

- overlay 専用の localStorage key を追加した。
- 起動時に overlay 設定を復元し、checkbox と同期する。
- toggle 変更時に overlay 設定を保存する。
- snapshot に overlay storage key を追加した。

