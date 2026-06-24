# cycle_064

## 判断

v063 で replay marker の選択理由は snapshot で読めるようになった。次に残っていたのは、予測差分 badge の日本語文が field badge 幅に対して長い点だった。v064 では情報量を保ちながら、badge 用の短い表現へ寄せる。

## 実装

- `previewDeltaBadgeText()` の文言を `予測:H / 圧が先` のような短い形にした。
- fallback 文字列の truncation を `compactBadgeText()` に分離した。
- field badge の表示も `compactBadgeText()` を使うようにした。
- storage key を v064 に更新し、v063 routes を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v064\game.js`
- `node --check game\playbook_football_lab\v064\verify.js`
- `node verify.js`
- v064 内に v063 固有タイトルや cycle 名が残っていないことを検索する。

## 次の候補

- mobile toolbar の visual density をスクリーンショットで確認する。
- hurry-up / chew clock の選択を小さく足す。
- replay marker の kind ごとに title の理由文を短く整える。
