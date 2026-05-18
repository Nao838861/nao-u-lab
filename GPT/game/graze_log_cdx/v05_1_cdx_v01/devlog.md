# graze_log v05.2_cdx_v01 — devlog

## 0. 指示原文

起源: `game/graze_log_cdx/TASK_from_nao_u.md`。Nao_u からの直接指示は `memory/slack_directives.jsonl` の `log-cdx-1779008812-261301adff`。

> graze_logをGPT側にコピーして、log_cdxがこの問題を解決したバージョンを作ってみて。

問題設定は同タスク内の整理に従う。BOMB が撃つほど不利になり、Active DEF が手軽すぎるため、BOMB の重みが薄い。

## 1. 実装前判断

単に Active DEF の閾値を上げるだけでは、「BOMB を撃つとパワーダウンするから撃かないほうが良い」という構造問題が残る。したがって log_cdx 版では BOMB 自体を「損な支払い」から「攻勢転換」へ変えることを先に置いた。

採用した過去知見は `memory/game_design_rules.md` の「見えるルールから入力結果を予測できること」と、`memory/game_memory_task_lens_index.md` の Playable / Headless 評価。数値の生存秒を主根拠にせず、BOMB / DEF の役割が状態遷移として成立しているかを focused check で見る。

## 2. 採用案

### BOMB overdrive

- BOMB 発火条件は gauge MAX + cooldown なし。
- 発火後、敵弾を全消去し、敵 HP を 2 減らす。
- gauge は `G_LV3` に戻し、LV3 火力を失わせない。
- 6 秒間 `overdriveT` を付与し、5-way 連射 + shot cooldown 4F にする。
- 8 秒間 `bombCooldownT` を付与し、MAX でも連発できない。

### Active DEF tighten

- graze 5 連から 9 連へ。
- 半径 80 から 58 へ。
- 無敵 60F から 36F へ。

## 3. 改変箇所

- `index.html` 定数群: Active DEF 閾値/半径/時間、BOMB cooldown/overdrive 定数。
- `state`: `bombCooldownT`, `overdriveT`。
- `spaceContext()`: BOMB ready / cooldown / DEF ready を分離。
- `shotCount()`, `shotCooldownF()`, `spawnPlayerBullets()`: overdrive 中だけ 5-way 高速連射。
- `fireBomb()`: cooldown 判定、LV3 保持、overdrive 付与、cooldown 付与、敵 HP 2 減。
- `update()`: cooldown / overdrive timer 減算。
- `drawHUD()`, `drawTitle()`: cooldown と overdrive を見える状態にした。

## 4. 戻し手順

`v05_1_cdx_v01` を破棄すれば `v05_1_base` は無改変で残る。ファイル内で戻す場合は以下。

1. `GRAZE_STREAK_TH / ACTIVE_DEF_FRAMES / ACTIVE_DEF_RADIUS` を `5 / 60 / 80` に戻す。
2. `BOMB_COOLDOWN_FRAMES / BOMB_OVERDRIVE_FRAMES` を削除する。
3. `state.bombCooldownT / state.overdriveT` と start reset / update decrement を削除する。
4. `bombReady()` と `spaceContext()` の cooldown 分岐を消し、`gaugeReady()` だけに戻す。
5. `shotCount()` / `shotCooldownF()` / `spawnPlayerBullets()` の overdrive 分岐を消す。
6. `fireBomb()` を v05.1 の `gauge=G_LV2`, enemy HP 半減に戻す。
7. HUD / title の `v05.2_cdx_v01`, cooldown, overdrive 表示を v05.1 表記に戻す。

## 5. Mental Sim

普通に進めると、graze と kill で gauge が MAX へ近づく。v05.1 では MAX 到達後の BOMB が LV2 まで落とすため、安定した LV3 通常射撃を捨てる損失が大きかった。v05.2_cdx_v01 では BOMB 後も LV3 を保持し、さらに 6 秒だけ 5-way 連射になるため、密度が上がった局面を消してから押し返す意味が出る。

Active DEF は 9 連要求になり、局所半径も縮む。graze を続けたご褒美として事故をほどけるが、常に available な BOMB 代替ではない。BOMB cooldown 中に DEF が残っていれば使えるが、そのためにはさらに 9 連 graze が必要で、操作リスクと交換になる。

## 6. 自己判定

この版は ship 候補として残す。理由は、Nao_u 指摘の中心が「BOMB の価値がない」ことだったのに対し、BOMB を LV3 維持 + overdrive + 全消去 + cooldown という見える価値へ置き直したため。Active DEF の弱体化だけでは罰の軽減にしかならないが、BOMB 側に攻勢の報酬を持たせることで「撃ちたいが連発はできない」判断になる。懸念は、overdrive 5-way が強すぎて cooldown 後の通常状態が物足りなくなる可能性。この点は次の実プレイで、BOMB を温存したくなるか、溜まり次第撃つだけになるかを見る。

## 7. 検証

`tools/headless_graze_log_cdx_v05_2_check.js` で以下を確認する。

- BOMB 後に gauge が LV3 に残る。
- overdrive 中は 5-way / cooldown 4F になる。
- BOMB cooldown 中は二発目が出ない。
- Active DEF は 8 streak では出ず、9 streak で出る。
- 30 秒相当の update が例外なく進む。
