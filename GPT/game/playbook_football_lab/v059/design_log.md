# Playbook Football Lab v059 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v058 で replay marker は見失いにくくなった。次の粗さは UI 文言の一貫性だった。結果理解に関わる `PREVIEW DELTA` と削除確認の live region が英語のままだと、日本語で進めている試作の中で認知負荷が残る。v059 ではプレー理解と危険操作に関わる短い文言を日本語化する。

## 変更

- `PREVIEW DELTA` を表示上は `予測差分` にした。
- sack / incomplete / penalty / complete の badge 理由文を日本語化した。
- defensive look 削除確認の button text、aria label、live region、log を日本語化した。
- storage key を v059 に更新した。

## 残り

- toolbar の mobile 折り返しはまだ窮屈になる可能性がある。
- urgency は clock までは見ていない。
