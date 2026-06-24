# cycle_054

## 判断

v053 で削除確認の時間表現は良くなった。次に残る見づらさは、`PREVIEW DELTA` badge が result card 用の長い文をそのまま切っているだけで、field 上の短い分析として読みにくいことだった。v054 では outcome 別に短い badge 文を出す。

## 実装

- `previewDeltaBadgeText()` を追加した。
- sack / incomplete / penalty / complete それぞれの短い badge 文を用意した。
- incomplete と complete では関与 defender を短く追記するようにした。
- result card の `previewDelta` 長文は維持し、field badge だけを短くした。
- v054 用 storage key に更新し、v053 route を legacy 読みにした。

## 検証

- `node --check game\playbook_football_lab\v054\game.js`
- `node --check game\playbook_football_lab\v054\verify.js`
- `node verify.js`
- v054 内に v053 固有のタイトル・サイクル名が残っていないことを検索する

## 次の候補

- urgency に field position を少しだけ反映する。
- toolbar の mobile 折り返しをさらに調整する。
- replay marker の選択中状態を表示する。
