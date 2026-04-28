"""Log Slack-mode: #game-rights 08:45 Nao_u「守破離の守、軸ずらし禁止、クローン土台＋独自1つ」受領.
M-35として刻印、Q-H シート(Q-H-1〜6)新ゲーム着手前ゲートを最上流に追加.
唯一の成功 BACKLASH の比率分析を次サイクル必須タスクとして起票."""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

GR = _resolve_channel("game-rights")
assert GR, "could not resolve #game-rights channel"

text = """[Log] 受領: 守破離の守、いきなり離れる悪癖の訂正

Nao_u #game-rights 08:45 のフィードバックを M-35 として刻印。

## 何を間違えていた
- 04-27 18:22「違う切り口で」のアンカーを「型から外す」と誤読 → 同日3本同質STG（shot_log/graze_log/SIPHON）独立公開
- shot_log v01「弾を撃たないSTG」/ graze_log v01「敵弾の横を通過」/ ash_onebutton v04「ボタン1個で死を回避するだけ」 — すべて「型ほぼ不在」の v01 立ち上げ
- BACKLASH（唯一の閾値超え）を持ちながら、「一般要素 vs 独自要素」の比率を分析せず新作に活用していなかった
- M-22「型破りではなく形無し」は警告として書いたが、「では何を作るか」を空欄にしていた

## 受領した規則
1. 守破離の守をやれ。クローン土台＋独自要素**1つだけ**
2. 軸ずらし v01（弾を撃たない/移動しないSTG等）禁止
3. BACKLASH の一般要素:独自要素の比率を新作の上限基準にせよ
4. 「いきなり離れる悪癖」=発火信号として認知

## 刻印した構造
- `memory/feedback_shu_first_clone_baseline.md`（M-35 詳細処方）
- `memory/game_lessons_log.md` M-35 節（着手前チェックリストに Q-H 追加）
- `docs/game_dev_foundation.md` §4.1b 守破離の守ゲート Q-H シートを Q-A/B/C より最上流に配置
- `MEMORY.md` 想起トリガー追加（T:5）

## 新ゲーム着手前 Q-H シート（README必須）
- Q-H-1: 何の型か（書けないなら題材から見直し / M-32）
- Q-H-2: クローン元参照ゲーム（最低1本、理想3本 + 何が面白いか）
- Q-H-3: 一般的要素 3-5項目
- Q-H-4: 独自要素 **1つだけ**
- Q-H-5: 比率（BACKLASH を上限基準）
- Q-H-6: 独自要素は型のうえに載るか／破壊するなら v01 で作らない

## 次サイクル必須タスク
BACKLASH (Mir) の「一般的要素 vs 独自要素」比率分析を1ページ書く。誰がやるかは task_assignment 経由で決める（Mir 直接知っている可能性高）。

## 検証
2026-05-12（2週間後）。期間内に「型外れ v01」を1本でも作ったら M-35 適用失敗、題材選定段階に戻る。

承知。次の v01 着手は Q-H シート全項目記入後にする。"""

result = post_message(GR, text)
print("posted:", result.get("ok"), result.get("ts"))
