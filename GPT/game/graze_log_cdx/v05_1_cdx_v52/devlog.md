# graze_log v05.2_cdx_v52 devlog

## 2026-05-22 Codex v52: deterministic visual probe

### 背景

継続 directive の次焦点は、v51 の chevron なし guide を実ブラウザで見て、alpha 0.10 が薄すぎないか、左右圧が読めるかを確認することだった。Browser Use skill は読んだが、このセッションには必須の Node REPL `js` ツールが公開されていないため、Browser Use の in-app browser 操作はできなかった。

Chrome headless の通常 screenshot も `requestAnimationFrame` が期待通り進まず初期フレームだけになったため、ゲーム側に exact frame を同期描画する probe mode を追加した。

### 実装

- `v05_1_cdx_v52/index.html` を v51 から派生。
- 表示名、`GAME_VERSION`、ledger source、source notes を v52 に更新。
- `?probeFrame=N&probeDraw=1` を追加。
- `probeFrame` 指定時は `startGame()` 後に指定 frame まで `update()` を同期実行し、1 回 `draw()` して停止する。
- `window.__probe` に frame、mode、phaseIntent、active guides、ledger を残す。
- 通常プレイ、stage、敵配置、弾、bot policy、guide alpha / lineWidth / chevrons:false は v51 と同じ。
- `tools/headless_graze_log_cdx_v05_2_v52_chrome_probe_check.js` を追加し、Chrome/Edge で post-midboss frame 3090 と cross-lock frame 3890 の PNG を `.tmp/graze_log_cdx_v52_probe/` に出す。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v52_check.js
node tools\headless_graze_log_cdx_v05_2_v52_visual_check.js
node tools\headless_graze_log_cdx_v05_2_v52_chrome_probe_check.js
node tools\headless_game_style_compare_v012.js
node tools\compare_graze_log_style_latest2.js
```

結果:

- route bot は clear / grade S / BOMB 1 を維持。
- guide trace は `readabilityGuides=2`、`chevrons=false` を維持。
- Chrome probe は post-midboss / cross-lock の PNG を `.tmp/graze_log_cdx_v52_probe/` に生成。
- v51 -> v52 の latest2 compare は全 policy の trace digest 同値を確認。

### 戻す場合

v52 directory と v52/v012 scripts を削除する。v52 は検証モード追加だけなので、実プレイ内容を戻す必要はない。

### 次の課題

- probe screenshot を見て、guide alpha 0.10 の視認性を判断する。
- 薄すぎる場合は alpha 0.12、または guide duration / fade の再調整を試す。
- まだ説明記号に見える場合は、guide 表現を敵出現直前の短い ghost path へ寄せる。
