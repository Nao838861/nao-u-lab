# cycle_059

## 判断

v058 で replay marker は近傍 frame でも active になり、再生中の出来事を追いやすくなった。次に残っていた違和感は、削除確認と予測差分 badge の文言が英語のままで、日本語 UI の中で情報の温度差が出ている点だった。v059 ではプレー理解に直結する短い文言を日本語化し、画面上の判断情報を読みやすくする。

## 実装

- `PREVIEW DELTA` の表示ラベルを `予測差分` に寄せた。
- 予測差分 badge の理由文を日本語化した。
- defensive look 削除確認の visible text / aria label / live region を日本語化した。
- 削除確認のログ文も日本語化した。
- storage key を v059 に更新し、v058 routes を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v059\game.js`
- `node --check game\playbook_football_lab\v059\verify.js`
- `node verify.js`
- v059 内に v058 固有タイトルや cycle 名が残っていないことを検索する。

## 次の候補

- toolbar の mobile 折り返しをさらに調整する。
- urgency に clock を少しだけ反映する。
- replay marker window の範囲を UI に小さく示す。
