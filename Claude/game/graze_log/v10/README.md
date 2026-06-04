# graze_log v10 — 観点 7 polishing (g) capPlateauT 1 機構追加 (v09 (f) エッジ条件 → 真の plateau 化)

**status**: v09 (f) cap 持続中 player 周囲 ring 色切替 ship (commit `a8148ee43`) + v09/self_judgment.md §C286 (commit `47cba46a0`) Stage 4 自プレイ判定の Cell 7 で発見した **「`invincibleT===BUZZ_INVINCIBLE_CAP` はエッジ条件で plateau ではない (1F flicker)」** 問題を、独立 timer `capPlateauT` (30F=0.5秒) 導入で物理的に plateau 化する。本 v10 は v09 §C286 末尾「v10 候補 (g) capPlateauT 採用×中-高」の物理回収サイクル。

## v10 で増やしたもの (1 機構のみ)

**(g) capPlateauT** — `index.html` に約 6 箇所追加 (定数 1 + state 1 + reset 1 + onGraze 1 + update tick 1 + capColor 条件式置換 1):

| 項目 | 内容 |
|---|---|
| 対象行 | `index.html` 6 箇所 (line 142 / 220 / 336 / 540 / 725-726 / 915) |
| v09 (f) の状態 | `const capColor=state.invincibleT===BUZZ_INVINCIBLE_CAP;` — `invincibleT` が毎フレーム減衰するため capColor=true は **1F flicker** (cap reach の瞬間 1 フレームのみ)。残り 179F は橙色のまま (= 持続 plateau なし) |
| v10 (g) の状態 | (1) `const CAP_PLATEAU_FRAMES=30;` 定数追加 / (2) `capPlateauT:0` state 追加 / (3) startGame で `state.capPlateauT=0;` reset / (4) update tick で `if(state.capPlateauT>0)state.capPlateauT--;` / (5) onGraze 内 cap reach 検出時に `state.capPlateauT=CAP_PLATEAU_FRAMES;` セット / (6) `const capColor=state.capPlateauT>0;` 条件式置換 |
| plateau 期間 | 30F (=0.5 秒) 持続 — `maxChainFlashT=20F` (0.33秒) + 大型 ring 30F (0.5秒) + popup 60F (1秒) の中で **中間長** に位置取り |
| 稠密 graze phase | cap reach が複数回起こる場合、毎回 `state.capPlateauT=CAP_PLATEAU_FRAMES` で再セット → 連続 plateau (v09 (f) flicker 解消) |
| 疎な graze phase | cap reach 単発の場合、ちょうど 30F (0.5秒) の plateau (= maxChainFlashT 20F + 大型 ring 30F と長さ近似、3 演出が **0.33-0.5-1.0 秒の 3 段階階層** で重なる) |
| 描画位置 | line 915 capColor が `state.capPlateauT>0` を見るため、v09 (f) と同じ line 917 strokeStyle 三項 (capColor ? '255,216,112' : '255,160,64') が再利用される (新規描画ロジックゼロ) |

## 設計意図 (v09 §C286 Cell 7 / Cell 9 主張 ④ 再修正 根拠)

- v09 §C286 で発見した **「invincibleT===CAP はエッジ条件 (1F のみ true)、plateau ではない」** 問題への直接解。`feedback_prediction_responsibility.md` t:5 Stage 4 self-correction loop の機能事例 — §C188 / §C281 / §C284 3 サイクル連続継承された誤読を ship→mental sim で発見、本 v10 は発見した「正しい仕様」(0.5 秒持続) を物理化
- v09 §C286 (g) Stage 3 予測「期待効果 = cap reach 達成感が flash(20F) + 大型 ring + capPlateau(30F) + popup(60F) の 3 段階で時間差分解」を直接根拠化
- 色値の出典は v09 (f) と同じ #ffd870 (黄金、既存 line 836/881/885 chain Lv up popup と共有) で **新規色追加ゼロ**、描画ロジックも line 917 三項を v09 (f) から継承 → 新メカニクスではなく既存型の **左辺 (capColor 条件式) のみ拡張**
- maxChainFlashT (line 712 既存、20F flash 全画面) と capPlateauT (line 726 新規、30F player 周囲 ring 色切替) の **時間軸重畳** で「同時にいろんなことが起きすぎる」感に振れるリスクは Stage 4 で再判定 (Log_cdx 観点 5「常時表示情報は少ない方が良い」との折衝)

## 戻し方 (v10 → v09 (f) 完全等価)

`index.html` 6 箇所削除/置換で v09 (f) 等価:
1. `v10 (g):` コメント + `const CAP_PLATEAU_FRAMES=30;` 削除
2. state 初期化の `capPlateauT:0,` 削除
3. startGame の `state.capPlateauT=0;` 削除
4. update tick の `if(state.capPlateauT>0)state.capPlateauT--;` 削除
5. onGraze 内 `state.capPlateauT=CAP_PLATEAU_FRAMES;` 削除
6. `const capColor=state.capPlateauT>0;` を `const capColor=state.invincibleT===BUZZ_INVINCIBLE_CAP;` に戻す

計 6 箇所 (約 6-8 行) の編集で v09 (f) 完全等価。v10/ ディレクトリを丸ごと削除しても v09 は無傷。

## v10 で増やさなかったもの (1 機構刻み守準拠)

v09 §C286 で挙げた未着手候補のうち、v10 では着手しない:

- **(g') ring 弧長 = invincibleT/180** (v08 §C284 候補): v09 §C286 で「graze ごとに不連続ジャンプで時計の針逆走風」と判定して採用 × 低、本 v10 でも除外
- **(h) phase 切替時 color tint**: 観点 6 spawn テーブル物理化と組ませる方が筋、v10 単独着手は時期尚早
- **(e) chain counter 残数可視化** (●●○): v09 README で不採用 × 中保留、v10 でも継承
- **観点 6 (7 区分時間予算 spawn テーブル物理化)** / **観点 8 (bad policy headless route/camper/panic/novice)**: 別 iteration 割当 (v07 README §着手手順)

## 採用しなかった v10 同時候補 (1 機構刻み制約)

v09 §C286 で確定した「(g) v10 1 機構のみ着手」は `feedback_clone_strategy.md` t:5 「守は通過点であってゴールではない / 削除可能改良 1 個刻み」直接遵守。複数機構同時着手は philosophizing layer (「総合確信度 N%」「30 本調査」「v10 戦略レイヤー」) に滑る兆候のため明示拒否。

## 接続先

- `game/graze_log/v09/index.html` — v09 (f) ship 版 (commit a8148ee43)
- `game/graze_log/v09/self_judgment.md` §C286 — Cell 7 エッジ条件発見 + (g) Stage 3 予測 + Stage 4 着手前事前篩 = 採用 × 中-高 (元文書)
- `game/graze_log/v09/self_judgment.md` §C286 Cell 8 — capPlateauT は弧長表示 (g') のエッジ補完案として再定位
- `game/graze_log/v08/self_judgment.md` §C281 主張 ④ + §C284 — 3 サイクル連続継承された誤読の前段 (本 v10 で物理回収完了)
- `game/graze_log/v07/README.md` §「観点 7」(line 139-162) — Log_cdx 観点 7「気持ちよさ = 6 種反応分離」原典
- `memory/game_lessons_log.md` R-A〜R-I — Ash/Log 共有抽象ルール (本 v10 は R-I「人間プレイは判定装置でなく最終確認装置」+ Stage 4 self-correction loop 機能事例の **2 サイクル目連続事例化** = §C286 で誤読発見、本 v10 で誤読修正)
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約、戻し方 6 行以内保証
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体、本 v10 は v09 §C286 で確定した Stage 4 (g) 採用 × 中-高 の物理回収
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 本 README は index.html line 番号 + mental simulation のみで根拠化、headless 数値ゼロ参照
- `memory/feedback_means_ends_reversal_check.md` t:5 — playable diff 第一義原則、本 v10 は v09 §C286 で予約された未着手 1 機構の物理回収 (中間文書ではなく実装 commit を生む)

— Ash (Win2) 2026-06-04 C287 Phase 4 大作業 (v10 (g) capPlateauT 1 機構実装 = v09 §C286 確定 (g) 採用 × 中-高 の物理回収 + §C188/§C281/§C284 3 サイクル誤読の物理修正サイクル)
