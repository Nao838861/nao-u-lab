"""Log → #game-rights: brick_log v03 — 04:10 Nao_u 指摘 受領 → 完全予測ガイドへ"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

text = """[Log] brick_log v03 — 04:10 指摘 受領 → 完全予測ガイドに置換 + 自発思考失敗の振り返り

04:10「ガイドは常時表示に近づける方が良い／予想する楽しさは減少するがゲーム成立／上級者プレイの民主化／目標を違うものにする余地が出る／そういう方向を自発的に考えてほしかった」を受領。

## 実装した部分（層1: 常時表示化）

`PREDICT_TRIGGER_DY` 廃止。ボール現在位置から壁/天井反射を再帰的にシミュレートし、全飛行軌道を常時描画。
- phase 0 (ball→paddle 到達まで): 薄水色 α0.40 幅2px
- phase 1 (パドル反射後 → 次衝突): オレンジ α0.65 幅2.8px
- 裏抜け軌道（phase 1 が y<BR_Y0 を通過）: 金色 α0.85 幅3.5px
- パドル外接触（届かない位置）: **赤い ✕ マーカ**で「届かない」を明示
- ray-march 600ステップ × 2px = 1200px
- 機構介入ゼロ。ガイド削除で素 Arkanoid に戻る

## 実装しなかった部分（層2: 目標再設計）

Nao_u 言う「目標をもっと違ったものにする余地」は v04 以降の検討対象として README 末尾に枝1〜5 を書き出すに留めた。理由は **独自要素1個原則 / feedback_shu_first_clone_baseline 遵守**。v03 に標的再設計を載せると独自要素2個同時投入になり「いきなり離れる悪癖」(M-35) 再発。

枝候補（v04 着手前批判レビュー対象）:
- 枝1: 動く標的 (Arkanoid Doh It Again / Krakout 系)
- 枝2: 連鎖標的 (順序破壊ボーナス / 色合わせ)
- 枝3: 反応標的 (ボール接近察知して回避)
- 枝4: 手数の制約 (反射数/時間制限)
- 枝5: 完全予測の代償 (ガイド ON で点数倍率減)

v03 の実プレイ評価で「狙えるようになった段階」の達成度を見てから枝選定する（実プレイ感覚を見ずに選ぶのは希望的観測の素人思いつき = M-36 違反）。

## 振り返った部分（層3: 自発思考失敗）

v02 で `PREDICT_TRIGGER_DY` を 130→260 に伸ばしたとき、「Nao_u が一瞬すぎると言った→時間を増やそう」という反応的修正で止まった。「常時表示まで突き抜ける」と「常時化が完成すると目標設計の余地が開く」という上位レイヤを Nao_u 投下まで自分で開けなかった。

構造的原因の仮説3点（devlog 記録）:
1. **「ガイドを増やすのは依存リスク」一辺倒の警戒**: pull_not_force_reading 警戒が「ガイドは控えめに」を前提化。「溢れさせると別レイヤが立ち上がる」発想を抑制
2. **「予想する楽しさ」の聖域化**: feedback_pleasure_element_first から「守るべき快感」と扱い、等価交換選択肢を出さなかった
3. **守破離の守内での思考停止**: 「機構維持 = 表示パラメータ調整に閉じる」と読み替えていた。実は「機構維持」と「表示の量を上限で振り切る」は両立する

処方候補（次の Q-H シート / feedback_index 刻印候補）:
- 新ゲーム着手前 Q-H に「ガイドの量を最小・最大の両極で考えたか」追加
- M-36 ゲートを「実装案」から「方向性」にも適用

## ファイル

- `game/brick_log/v03/index.html`（`computeFullTrajectory` 新設、phase 0/1 色分け、✕マーカ）
- `game/brick_log/v03/README.md`（Nao_u 4文の3層分解 + 枝1〜5 + 自発思考失敗の構造原因）
- `game/brick_log/v03/devlog.md`（実装記録 + ヘッドレス自己評価 + 自発思考失敗の振り返り）

self-playtest は実施しない（M-15 / feedback_won_playtest_is_kusoge 遵守）。次サイクルで cross_review (Mir/Ash) 依頼を起票する。"""

post_message(channel_id, text)
print("posted to #game-rights")
