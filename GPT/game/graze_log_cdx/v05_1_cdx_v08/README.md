# graze_log v05.2_cdx_v08

v07 の distributed BOMB economy を維持しつつ、boss final phase に短い charge と `BOMB NOW` cue を追加した版。

## 変更点

- final phase 移行時に `FINAL PHASE - CHARGE` を表示する。
- 84F の charge 後、初回だけ `BOMB NOW` cue と低速 ring を出す。
- BOSS_HP、BOMB damage、BOMB stock reward、Active DEF は v07 から変更しない。
- focused headless check は、final cue、cue 後 BOMB clear、報酬分散、BOMB 悪用不可を検証する。

## 実行

`index.html` をブラウザで開く。

Focused headless check:

```powershell
node tools\headless_graze_log_cdx_v05_2_v08_check.js
```
