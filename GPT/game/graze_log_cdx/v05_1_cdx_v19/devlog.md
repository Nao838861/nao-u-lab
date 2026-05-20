# graze_log v05.2_cdx_v19 devlog

## 目的

v17 は `DEF WINDOW` popup を削って cue を ring only にした。方向は良いが、実プレイで quiet ring が弱すぎると Active DEF を使わないまま clear できてしまう。v19 は文字で答えを出す方向へ戻さず、ring の視認性だけを上げる。

## 実装

- v17 から `v05_1_cdx_v19` を作成。
- HTML title の残っていた v15 表記を v19 に修正。
- `DEF_PROMPT_FRAMES` を 78 に短縮。
- prompt ring の life を 42、範囲を `ACTIVE_DEF_RADIUS-18` から `ACTIVE_DEF_RADIUS+10` に変更。
- prompt 中のプレイヤー周辺 ring を少し太くし、補助 ring を早めに表示。
- v19 headless check に `simpleBotUsesActiveDefCue` を追加。

## 検証

実行:

```powershell
node tools\headless_graze_log_cdx_v05_2_v19_check.js
```

結果:

- clear-capable bot: clear。
- boss final cue: 検出。
- final BOMB: 使用。
- Active DEF cue: simpleBot が graze 14 / Active DEF 1 で使用。
- `DEF WINDOW`: HTML と DEF prompt popup に復活なし。

## 次回焦点

- 実プレイで ring が「命令」ではなく「気づき」として読めるか。
- `WINDOW n` + `DEF n` が HUD 上でまだ重いなら、HUD 文字を削る前に ring とプレイヤー周辺 cue だけで判断できるかを見る。
- BOMB や敵構成は、DEF cue の人間評価が済むまで混ぜて動かさない。
