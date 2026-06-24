# graze_log v05.2_cdx_v89

v82 の gameplay と v86-v88 の policy contrast / reason table を維持したまま、headless 実測値から人間確認用の reason row を生成し、`review_packet.html` の表示値と一致するかを検証する評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v89/index.html
game/graze_log_cdx/v05_1_cdx_v89/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v89_generated_reason_table_check.js
```

v89 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v89/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v89_generated_reason_table_check.js`
- `.tmp/graze_log_cdx_v89_policy_reason/v89_policy_reason_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl`

v89 の焦点は、理由 family の JSON 契約に加えて、route / aggressive / marksman / camper / survival / panic / novice / defensive の実測値から生成した evidence 文字列を review packet に置き、headless が同じ文字列を再生成できるかを検証すること。gameplay は変更していない。
