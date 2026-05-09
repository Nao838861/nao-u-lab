# graze_log v03 — Psyvariar 型 grazeStreak → active 防御

**status**: v02 からの**削除可能改良 1個刻み**。brainstorm.md §2 候補A 採択分。
**実装前ゲート**: predicted_play.md / self_judgment.md は実装着手前 (commit cbea7b51a, 2026-05-10 04:50) に作成済み。実装本体 commit 時刻 ＞ ゲート commit 時刻 が M-39+M-40 の物理的閉鎖の証拠。

## v02 → v03 の差分 (1機構のみ)

### 追加した1機能

graze 連続発生回数 `grazeStreak` を別変数として持ち、閾値 `GRAZE_STREAK_TH = 5` 到達で SPACE 押下が「1秒の自機無敵 + 半径 80px の周辺弾消去」(active 防御) を発火する。発火後 `grazeStreak = 0` リセット。

**Lv 進行とは独立**に発火する。Lv3 到達後でも graze し続ければ active 防御が継続的に発火可能 = brainstorm.md §2 候補A の「Lv3 動機消失問題の直接打開」仮説の実装。

### SPACE の文脈切替

| 状態 | SPACE の効果 | HUD 表示 |
|---|---|---|
| `gauge >= G_MAX` (= 従来の BOMB ready) | BOMB 発火 (v02 同等) | `SPACE [B]OMB` (黄) |
| `grazeStreak >= GRAZE_STREAK_TH` | active 防御発火 | `SPACE [D]EF` (cyan-green) |
| どちらでもない | 何もしない | `SPACE [-]` (灰) |

gauge MAX が BOMB を**優先する**。両方満たした状態で SPACE を押すと BOMB が発火し、grazeStreak は保持される。

### HUD 追加要素 (合計 v02+1 行 / SPACE 表示は色変化のみ)

- 既存 `LV / GRAZE / KILL` 行に **`STREAK n/5  DEF n`** を追加（同一行内）
- 既存 BOMB 表示位置に SPACE 文脈表示 (B/D/-) を**色付き 1 ラベル**で兼用
- 自機表示の追加: streak 閾値到達中は cyan-green の小リング、active 防御発動中は cyan-green の太リング (BOMB の黄色とは別系統色)
- ゲームオーバー画面: `DEF` (active 防御発動回数) を 1 行追加

### 触っていない既存機構 (v02 と完全同一)

- 自機操作・移動速度
- BOMB の挙動 (gauge MAX 必要・全画面消去・敵 HP 半減・gauge を G_LV2 に減衰)
- gauge の蓄積方法 (graze=+6 / kill_small=+2 / kill_med=+4)
- Lv1〜Lv3 の閾値 (G_LV2=35 / G_LV3=99 / G_MAX=208)
- shotCount / shotCooldownF / wave 1〜N のスポーン構成
- 敵弾速度・graze 半径・hit 半径
- onHit 段階ダメージ (Lv3→Lv2 / Lv2→Lv1 / Lv1→GAMEOVER)
- 星空背景・particle・ring エフェクト
- seed 再現性

## 戻し方 (削除可能性の保証)

v03 → v02 に戻すには以下を消す:

1. 定数 3 個: `GRAZE_STREAK_TH` / `ACTIVE_DEF_FRAMES` / `ACTIVE_DEF_RADIUS`
2. state 内 3 変数: `grazeStreak` / `activeDefT` / `activeDefCount`
3. `startGame()` 内 v03 reset 3 行
4. 関数 1 個: `triggerActiveDef()`
5. 関数 1 個: `spaceContext()`
6. `update()` 内 SPACE 分岐の `else if(state.grazeStreak>=GRAZE_STREAK_TH){triggerActiveDef();}` 1 行
7. `update()` 内 `if(state.activeDefT>0)state.activeDefT--;` 1 行
8. `onGraze()` 内 `state.grazeStreak++;` と DEF READY ポップアップ 4 行
9. `draw()` 内自機シールド表示 2 ブロック (active def 中 / streak 閾値到達中)
10. `drawHUD()` の STREAK/DEF テキスト追加 + SPACE 文脈表示の D/- 分岐 (B のみ残せば v02 同等)
11. `drawTitle()` / `drawOver()` の v03 関連テキスト

合計 約 60 行。残りは v02 と同一バイト列 (コピー後の差分なので diff で確認可能)。

## 判定方針 (本ゲームに適用される禁止)

**headless 数値 (到達率/生存秒/成功率) は judgment / cross_review / Slack の根拠にしない**

根拠: feedback_headless_unfit_for_unfinished_eval.md t:5 (Nao_u 2026-05-09 05:01 #game-rights 三度目「やめて」)。校正前の headless は未完成ゲームの設計判定根拠に使えない。完成済み Log ゲームでの校正実績が出るまでは不可。

self_judgment.md は実装直後の Ash プレイ後でも書き換えない (Nao_u プレイ後の差分検証用に予測値を保存する。M-40 物理閉鎖の検証)。

## 接続先

- game/graze_log/v03/brainstorm.md — 候補A の確信度 70% 表明 + R-1 Psyvariar verbatim 抜粋 + 削除可能性宣言
- game/graze_log/v03/predicted_play.md — 実装前に書いた Nao_u 体感予測 (時間帯別 A/B/C/D 確率)
- game/graze_log/v03/self_judgment.md — 着手前自己判定 + Nao_u プレイ後埋める空欄
- game/graze_log/v02/index.html — 本実装の 1 機構を消した状態 = v02
- memory/feedback_clone_strategy.md t:5 — 守段階の削除可能改良 1個刻み制約
- memory/feedback_prediction_responsibility.md t:5 — Stage 3 実装後・人間プレイ前予測の事例
- memory/feedback_headless_unfit_for_unfinished_eval.md t:5 — 判定根拠から headless を外した直接根拠
