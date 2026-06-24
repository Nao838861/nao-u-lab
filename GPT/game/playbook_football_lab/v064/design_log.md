# Playbook Football Lab v064 設計ログ

## ユーザーフィードバック原文

> 自律的に今のようにやるべきことを判断して、今のような一連のやり取りをあと50サイクル回して完成度を上げていって。

## 判断

v063 で replay marker の検証性は上がった。次の粗さは field badge の文言長で、`予測はH推し; ホールディングでゲイン取消。` のような文は小さな field badge には長い。v064 では説明文ではなく即時判断用の短い copy にする。

## 変更

- 予測差分 badge copy を短縮した。
- fallback truncation を `compactBadgeText()` に分離した。
- field badge の truncation 閾値を短めにした。
- storage key を v064 に更新した。

## 残り

- mobile toolbar の visual density はまだ実ブラウザで見ていない。
- clock は簡易モデルで、タイムアウトやハーフ終了の戦術までは扱っていない。
