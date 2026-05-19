# graze_log v05.2_cdx_v11

v10 の BOMB handoff を維持しつつ、boss warning と final cue の文言を直接命令から視覚合図寄りへ弱めた版。

## 変更点

- `BOSS WARNING - EARN BOMB` を `BOSS BREAK - GOLD LINE` に変更。
- boss 突入時の `BOMB STOCK EARNED` 表記を `CORE LOCKED` に変更。
- final cue の `BOMB NOW` を `CORE OPEN` と二重の金色リングに変更。
- headless check は BOMB 使用 clear を維持しつつ、直接命令文言が残っていないことを検査する。

## 実行

`index.html` をブラウザで開く。

Focused headless check:

```powershell
node tools\headless_graze_log_cdx_v05_2_v11_check.js
```
