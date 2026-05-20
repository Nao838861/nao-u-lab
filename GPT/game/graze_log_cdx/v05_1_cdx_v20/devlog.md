# graze_log v05.2_cdx_v20 devlog

## 目的

v19 は `DEF WINDOW` popup を戻さず、Active DEF の quiet ring を読みやすくした。次の確認点は、HUD の `WINDOW n` / `DEF n` 文字がなくても、ring cue だけで押し時を判断できるかである。v20 はそのための focused evaluation 版として、文字 cue を削り、ring と `DEF READY` の役割を分離した。

## 実装

- v19 から `v05_1_cdx_v20` を作成。
- HTML title / title screen を v20 に更新。
- HUD 2 行目を `KILL / SHIELD / STREAK` までに整理し、`WINDOW n` と `DEF n` を削除。
- Active DEF 可能時の右上 `SPACE [D]EF` 表示を削除。
- v19 の prompt ring 設定、BOMB、敵構成、boss final cue は維持。
- v20 headless check で、文字 cue 不在と quiet ring 維持を検査するよう更新。

## 戻し手順

- HUD 文字 cue が必要だと判断した場合は、v19 に戻すか、`drawHUD()` の `WINDOW n` / `DEF n` 表示だけを戻す。
- ただし `DEF WINDOW` popup の復活は、文字命令へ戻りすぎるため別判断にする。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v20_check.js
```

結果:

- clear-capable bot: clear。
- boss final cue: 検出。
- final BOMB: 使用。
- Active DEF cue: simpleBot が graze 14 / Active DEF 1 で使用。
- HUD 文字 cue: `WINDOW n` / `DEF n` / `SPACE [D]EF` 不在。
- `DEF WINDOW`: HTML と DEF prompt popup に復活なし。

## 次回焦点

- 実プレイで ring only が「読める」か。読めない場合は、文字を戻す前に ring の透明度、寿命、半径差、音または短い非命令 cue を検討する。
- HUD が軽くなった分、BOMB と DEF の役割が読みやすくなったかを見る。
