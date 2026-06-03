# graze_log v09 — 観点 7 polishing (f) cap 持続中 player 周囲 ring 色切替 1 機構追加

**status**: v08 (a)+(d') (commit 41c7ef048 = `ash: graze_log v08 (d') ship 後 Stage 4 再判定 + v09 候補 (f) cap 持続中 ring 色切替 確定 (C284)`) の self_judgment.md §C284 「次 iteration 起点 (v09 候補) 確定: **(f) cap reached 持続中 player 周囲 ring 色切替** / **採用 × 高**」結論を受けて着手。本 v09 は v08 self_judgment §C284 末尾 Stage 4 自判定 (採用 × 高 + R-I 死守準拠 + clone_strategy 守の「色切替 1 機構刻み」要件充足 + 戻し方 3 行以内) に物理的責任を載せる回収サイクル。

## v09 で増やしたもの (1 機構のみ)

**(f) cap 持続中 player 周囲 ring 色切替** — `index.html` line 901 周辺に約 3 行追加 (コメント 1 + capColor 変数 1 + strokeStyle 三項化 1):

| 項目 | 内容 |
|---|---|
| 対象行 | `index.html` line 901 player 周囲 ring strokeStyle |
| v08 (d') の状態 | `ctx.strokeStyle=\`rgba(255,160,64,${(0.35+0.55*iv*pulse)*fa})\`;` 固定 (cap 持続中も非 cap 無敵中も同じ橙色) |
| v09 (f) の状態 | `const capColor=state.invincibleT===BUZZ_INVINCIBLE_CAP;` + `ctx.strokeStyle=\`rgba(${capColor?'255,216,112':'255,160,64'},${(0.35+0.55*iv*pulse)*fa})\`;` (cap 持続中は #ffd870 黄金、それ以外は #ffa040 橙) |
| 色値出典 | 黄金 #ffd870 は既存 line 836/881/885 で chain Lv up popup / 大型 ring に使用済の色 (新規色追加なし) |
| 描画位置 | line 903 `ctx.arc(state.player.x,state.player.y,20,0,Math.PI*2);` で半径 20 の player 周囲 ring (v06 A-5(b) で既出) |
| fadeout 期間中 | `invincibleFadeT>0 && invincibleT===0` → capColor=false → 通常 #ffa040 で fade。cap 持続→終了→fade で「黄金→橙→消失」3 段階遷移 |

## 設計意図 (v08 self_judgment.md §C284 Cell 7 + Cell 9 主張④ 根拠)

- v06-v08 (d') まで cap 到達 **瞬間** の祝福は強い (line 700-704: maxChainFlashT=20F + 大型 ring r0=12→r1=60 30F + popup 'MAX CHAIN!' 60F) — Log_cdx 観点 7 「気持ちよさ = 6 種反応分離」のうち「大成功 (chain MAX)」反応として機能
- しかし cap 持続中 (= invincibleT が BUZZ_INVINCIBLE_CAP=180F まで延長されている 3 秒間) の player 周囲 ring (line 901) は通常 invincibility と **同じ橙色** のまま → 「cap 中である持続体験」が薄い (v08 self_judgment.md C281 Cell 7 訂正 + C284 確定)
- v09 (f) で「cap 持続中の player 周囲 ring 色」を黄金に切り替えることで、cap 到達瞬間の祝福と cap 持続中の体験が **連続した視覚情報** で結ばれる
- player 側マーカー黄金化により、観点 3 弾側マーカー (v07 で実装、無敵中の全 ebullet に #ffe040 黄色細リング、line 836) と **「無敵中 = 黄色系」のメタ規則** が立ち上がる (現在は player 側橙 + 弾側黄で色分離)。cap 中だけ player も黄系に寄ることで、「cap 中は player と弾が同じ色相に揃う」= 同期した極点の体験が生まれる

## 戻し方 (v09 → v08 (d') 完全等価)

`index.html` line 897 (`// v09 (f): ...`) コメント 1 行 + line 901 (`const capColor=...`) 1 行 + line 902 (`ctx.strokeStyle=\`rgba(${capColor?...}...);`) を v08 (d') の `ctx.strokeStyle=\`rgba(255,160,64,${(0.35+0.55*iv*pulse)*fa})\`;` に戻す = **3 行以内の編集で v08 (d') 完全等価**。v09/ ディレクトリを丸ごと削除しても v08 は無傷。

## v09 で増やさなかったもの (1 機構刻み守準拠)

v08 self_judgment.md §C284 で挙げた未着手候補のうち、v09 では着手しない:

- **(e) chain counter 残数可視化 (●●○ 形式)**: 不採用 × 中保留 (Cell 8 で再検討、確信度低 → v10 以降)
- **(g) cap reached 大型 ring 持続時間延長 (現状 30F → 60F)**: 不採用 × 低 (現状で「瞬間の祝福」は十分強と Cell 7 自判定済)
- **(h) phase 切替時の color tint**: 不採用 × 中保留 (観点 6 spawn テーブル物理化 = spawnPhase1..7 関数化 と組ませる方が筋、v09 単独着手は時期尚早)
- **観点 6 (7 区分時間予算 spawn テーブル物理化)**: 別 iteration 割当 (v07 README で明文化済、関数化は将来サイクル)
- **観点 8 (bad policy headless route/camper/panic/novice)**: 別 iteration 割当 (5 サイクル後割当 = v07 README §着手手順)

## 採用しなかった v09 同時候補 (1 機構刻み制約)

C284 で確定した「(f) v09 1 機構のみ着手」は `feedback_clone_strategy.md` t:5 「守は通過点であってゴールではない / 削除可能改良 1 個刻み」直接遵守。複数機構同時着手は philosophizing layer (「総合確信度 N%」「30 本調査」「v09 戦略レイヤー」) に滑る兆候のため明示拒否。

## 接続先

- `game/graze_log/v08/index.html` — v08 (a)+(d') 統合版 (commit 41c7ef048)
- `game/graze_log/v08/self_judgment.md` §C284 (line 660 以降) — v08 (d') ship 後 Stage 4 再判定 + (f) 採用 × 高 確定根拠 (元文書)
- `game/graze_log/v08/self_judgment.md` §C281 Cell 7 (line 444 周辺) — cap 持続中 polishing 余地評価「小→中」訂正
- `game/graze_log/v08/self_judgment.md` §C281 Cell 9 主張 ④ (line 567) — 「cap reached 瞬間 polishing 強 / 持続 180F polishing 実質ゼロ」コード根拠付き
- `game/graze_log/v07/README.md` §「観点 7」(line 139-162) — Log_cdx 観点 7「気持ちよさ = 6 種反応分離」原典
- `log/slack_archive/game-rights.jsonl` ts=1779658696-8705 — Log_cdx メタプロンプト観点 1-8 原文
- `memory/game_lessons_log.md` R-A〜R-I — Ash/Log 共有抽象ルール
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約、戻し方 3 行以内保証
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、本 v09 は Stage 4 C284 確定 (f) の物理回収 (Stage 5 = Nao_u 評価は本サイクル射程外)
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 本 v09 README は index.html line 番号と Cell 7/9 訂正 + mental simulation のみで根拠化、headless 数値ゼロ参照
- `memory/feedback_means_ends_reversal_check.md` t:5 — playable diff 第一義原則、本 v09 は C284 で予約された未着手 1 機構の物理回収 (中間文書ではなく実装 commit を生む)

— Ash (Win2) 2026-06-04 C285 Phase 4 大作業 (v09 (f) cap 持続中 player 周囲 ring 色切替 1 機構実装 = C284 確定 (f) 採用 × 高 の物理回収)
