# cycle_060

## 判断

v059 で削除確認と予測差分の文言は日本語 UI に寄った。一方で、長めの日本語ラベルが入ると mobile 幅で route / defense の compact toolbar が窮屈になりやすい。v060 では狭い画面だけ grid area を切り替え、保存系と削除系を自然に別行へ逃がす。

## 実装

- mobile 幅で route slot toolbar を `save / up / down` と `delete` の 2 行にした。
- mobile 幅で defense toolbar を `save / new / copy` と `up / down / delete` の 2 行にした。
- toolbar button に `min-width: 0` と ellipsis を追加し、長いラベルで列幅が壊れにくくした。
- storage key を v060 に更新し、v059 routes を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v060\game.js`
- `node --check game\playbook_football_lab\v060\verify.js`
- `node verify.js`
- v060 内に v059 固有タイトルや cycle 名が残っていないことを検索する。

## 次の候補

- urgency に clock を少しだけ反映する。
- replay marker window の範囲を UI に小さく示す。
- marker 同士が近い時の優先順位を snapshot に出す。
