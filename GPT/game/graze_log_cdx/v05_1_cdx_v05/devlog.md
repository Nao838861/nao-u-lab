# graze_log v05.2_cdx_v05 - devlog

## 0. 対象

Local continuous directive:

`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md`

焦点は boss の削り感、BOMB を使いたくなる局面、初見クリア可能性。Slack pending の新規 game directive は今回なし。

## 1. 実装前判断

v04 の残課題は、簡易 self-play が boss まで到達するが、BOMB を使わずに boss 中で死亡することだった。道中は v04 で敵役割と緩急が入ったので、今回は stage script には手を広げず、boss 戦の読みやすさと BOMB stock を調整する。

## 2. 改変箇所

- `index.html`
  - `BOSS_HP=44` と `BOSS_SOFT_ENRAGE_FRAME` を追加。
  - boss spawn 時に gauge を満タンにし、BOMB stock ready を popup で明示。
  - BOMB の boss damage を 12 に調整。即死ではないが削りとして見える値にした。
  - boss phase 変化時の popup を追加。
  - boss radial / final phase の弾速と発射間隔を少し読みやすくした。
  - title 版名を `v05.2_cdx_v05 - finite boss bomb window` に更新。
- `tools/headless_graze_log_cdx_v05_2_v05_check.js`
  - v05 path に更新。
  - `BOSS_HP` と `BOSS_SOFT_ENRAGE_FRAME` を検査 API に追加。
  - self-play に boss stats を追加。
  - boss 中に BOMB を使って clear することを合格条件に追加。
  - BOMB damage が即死ではない範囲にあることを検証。

## 3. 戻し手順

`v05_1_cdx_v05/` と `tools/headless_graze_log_cdx_v05_2_v05_check.js` を破棄すれば、v04 は無改変で残る。

ファイル内で戻す場合:

1. `BOSS_HP` を使わず、boss HP を v04 の 116 に戻す。
2. `spawnBoss()` の `state.gauge=G_MAX` と stock popup を削除。
3. `fireBomb()` の boss damage を 7 に戻す。
4. boss phase popup と v05 の弾速/発射間隔調整を v04 値へ戻す。
5. headless check を v04 版へ戻す。

## 4. Mental Sim

boss 開始時に stock が明示されるため、プレイヤーは SPACE [B]OMB を「残しておく大技」として認識しやすい。BOMB は boss を約 27% 削るが即死ではないので、使った後も Lv3 火力で撃ち込みを続ける必要がある。final phase は密度が上がるが、v04 より HP が短いため、初見でも「ここで切れば終わりが見える」状況になりやすい。

## 5. 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v05_check.js
```

結果: pass。

要点:

- self-play: `mode=clear`, `t=4211`, `bombCount=1`, `activeDefCount=1`。
- BOMB は 5-way を付与しない。
- BOMB cooldown / brake は維持。
- finite script は midboss / boss / clear へ到達。
- boss BOMB clear が確認できた。

## 6. 次回候補

boss stock を直接付与ではなく、midboss 撃破報酬や boss warning wave の撃破報酬に寄せると、より自然な stage economy になる可能性がある。次回は人間プレイで boss が短すぎないか、BOMB をいつ押したくなるかを見たい。
