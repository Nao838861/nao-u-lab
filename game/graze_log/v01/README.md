# graze_log v01

> **2026-04-27 22:59 STATUS**: Nao_u feedback (#human-steering) で **コア設計問題顕在化**。 「弾の圧力なし / ノーリスク連打で進む / Logの磁石と似た臭い、筋が良いとは言いにくい」。**v02 着手は保留**。詳細: `devlog.md` の「2026-04-27 22:59 Nao_u 直接 feedback 受領」節 + `memory/feedback_self_risk_core_pitfall.md` (M-31)。**ボムフリーズバグ未解決**（実機再現条件を Nao_u に確認中）。

shot_log/BACKLASH の **違う切り口の STG**。Nao_u 2026-04-27 18:22 #human-steering「logのシューティングのようなものを独自にもう一本違う切り口で作れるはず」への直接の応答。

## 重心

**敵弾の真横を抜ける GRAZE → ゲージ → BOMB 解放** の最小ループ。

BACKLASH は「敵に弾を当てる」でゲージが貯まる（撃破駆動）。graze_log は「敵弾の至近距離を通過する」でゲージが貯まる（回避駆動の反転）。defensive プレイヤーが報われる構造を、**罰追加でなく報酬経路の追加**で作る（feedback_game_center_of_mass「圧力設計」側）。

## BACKLASH との違い（1対表）

| 軸 | BACKLASH | graze_log |
|---|---|---|
| ゲージ蓄積源 | 敵に弾を当てる（撃破） | **敵弾の真横を抜ける（graze）** |
| 推奨プレイ | 敵を素早く撃破 | **敵弾の中に踏み込む** |
| BACKLASH defensive=0% 問題 | 構造的欠陥 | **逆方向で構造的に解消** |
| target | core fan / score chase | **risk-taker / 攻めの回避** |
| 弾発射 | auto-shoot | auto-shoot（同型・M-22 適用） |
| BOMB | gauge MAX → SPACE | gauge MAX → SPACE（同型） |

## 操作

- ← → ↑ ↓ / WASD : 移動
- SPACE : ゲーム開始 / リスタート / ゲージMAX時 BOMB
- M : MUTE（SE は v02 以降）

## ファイル

- `index.html` — プレイアブル本体
- `devlog.md` — 開発ログ（先頭に快感審問3行ブロック / Q-A/B/C 着手前採点）
- `README.md` — 本ファイル

## 起動

```
python -m http.server --bind 127.0.0.1 8000
# → http://127.0.0.1:8000/game/graze_log/v01/
```

## Mir/Ash プレイテスト依頼

- shot_log v01 で「Mir/Ash プレイテスト依頼が README に無い」反省（C126 Phase 2）への先行処方
- 観察軸: (1) 30秒以内に初 graze を体感できるか / (2) graze が「踏み込む快感」として伝わるか / (3) BOMB 発動が graze ループの上に乗っているか
- cross_review/ への配置は v01 凍結後（実プレイ感想 → 採点 → ファイル化）

## 着手前チェックリスト（M-22〜M-26 適用）

- M-22 型破りでなく形無し: 縦STGの型を維持。graze は STG fan には自明な認知枠組み（M-25）
- M-23 自然減衰なし: 時間経過でゲージ減らさない
- M-24 区切りで表現: gauge 内部値は固定、Lv1/Lv2/Lv3 の区切り長さで段階感
- M-25 認知枠組み利用: graze 演出 = golden ring + 数値 popup（既存 STG 文法）
- M-26 「再現できる」戒め: 出てきた挙動は実プレイで観測してから言語化
