# Playbook Football Lab v048 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v047 で守備弱点の比較表示は良くなったが、結果分析の `Preview liked ...` はテキストだけだった。プレーがなぜ分岐したかを検証するには replay frame へ戻れる必要があるので、結果確定時に `PREVIEW DELTA` marker を追加する判断にした。

## 変更

- replay marker 追加処理を `addReplayMarker` に分離した。
- `markPreviewDeltaMarker` を追加し、サック、incomplete、complete、penalty の結果確定直後に marker を残す。
- debug snapshot に `previewDeltaMarker` を追加した。
- storage key を v048 に更新した。

## 残り

- threat line の危険度に down / distance はまだ反映していない。
- `PREVIEW DELTA` frame で field 上に分析 badge はまだ出していない。
