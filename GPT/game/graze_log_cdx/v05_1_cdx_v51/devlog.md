# graze_log v05.2_cdx_v51 devlog

## 2026-05-22 Codex v51: guide paths without chevrons

### 背景

v50 では guide alpha / lineWidth を下げ、post-midboss guide の中央線を削った。継続 directive の次焦点は「v50 を実ブラウザで見て、薄すぎないか、chevron がまだ説明記号として強すぎないか」。Browser Use skill は読んだが、このセッションには Node REPL 実行ツールが公開されていないため、実ブラウザ操作はできなかった。

### 実装

- `v05_1_cdx_v51/index.html` を v50 から派生。
- 表示名、`GAME_VERSION`、`exportEvalLedger().source`、source notes を v51 に更新。
- v50 の guide alpha 0.10、lineWidth 2.2、cross-lock 2 path、post-midboss 2 path は維持。
- `drawGuide()` から chevron stroke を削除。
- guide state と guide event に `chevrons:false` を記録。
- `tools/headless_graze_log_cdx_v05_2_v51_check.js` を追加し、clear 維持と guide payload を確認する。
- `tools/headless_graze_log_cdx_v05_2_v51_visual_check.js` を追加し、canvas draw command 上で guide path stroke が 2 本、chevron-like stroke が 0 本であることを確認する。
- `tools/headless_game_style_compare_v011.js` を追加し、v51 record を JSONL に追記できるようにした。

### 戻す場合

v51 directory と v51/v011 script を削除する。v50 の stage 進行、敵数、弾、bot policy、ledger export は変更していない。chevron だけ戻す場合は `drawGuide()` に v50 の 3 点 stroke を戻し、guide event の `chevrons:false` を削除する。

### 次の課題

- 実ブラウザで、chevron なしでも cross-lock / post-midboss の左右圧が読めるかを見る。
- 薄すぎる場合は alpha 0.12 か guide duration の短縮/濃淡調整を試す。
- まだ説明記号に見える場合は、guide を敵出現前だけに限定するか、敵色へ統合する。
