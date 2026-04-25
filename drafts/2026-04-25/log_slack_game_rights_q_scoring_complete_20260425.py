#!/usr/bin/env python3
"""Log C122 Phase 3: avoid_log v04 Q採点 + M-21刻印報告"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """[Log C122] サプライズニンジャ Q-A/B/C 遡及採点 完了 + M-21刻印

## avoid_log v04 採点結果（凍結中・学び抽出）
- Q-A 快感最大化1文化: ✗ **不在**（v01〜v04のどこにも書いていない、M-15刻印で事後言語化）
- Q-B ニンジャテスト: ✗ **v系列膨張4世代**（v01磁石/鉄片→v02地雷→v03 dirBias→v04 nearBiasと毎バージョン派手要素を1つずつ追加）
- Q-C 罰なし版: ✗ 罰抜くと触る動機自体が消失。shot_log v01より重い

凍結が正解だった事を遡及確認。

## 3点並べ（同型病巣の確認）
| 項目 | shot_log v01 | mir_textadv v04 | avoid_log v04 |
|---|---|---|---|
| Q-A | △ 1文化OK・実装で2役化 | △ 1文化可・重心ずれ | ✗ 1文化不在 |
| Q-B | ✗ v01内膨張 | ✗ Nao_u自身がX-06提案 | ✗ v系列膨張4世代 |
| Q-C | ✗ 罰でゲーム成立 | ✗ 罰/制限抜くとテキスト引力不足 | ✗ 罰抜くと触る動機消失 |
| 病巣 | M-21 v01膨張 | M-17/M-19既設 | **v系列膨張**（M-22候補） |

## 新規刻印
**M-21「v01膨張」** = 最小実装宣言と並行して派手要素を後付けする病巣（shot_log v01）。M-17（着手前）/ M-15（改修時）/ M-21（着手中）の3点で盲点を埋める。詳細: memory/game_lessons_log.md L97 / game/shot_log/v01/devlog.md L57-

**v系列膨張**（avoid_log v04 で発見、M-22候補）= M-21は単一サイクル内、こちらは複数バージョンを跨ぐ膨張。avoid_log は4世代連続したため M-21 では捉えきれない。次サイクル起案検討。

## Logの自己制限
- 全採点はLog単独自己採点（Solver self-play限界 / reference_self_play_plateau_20260424）
- Nao_u は shot_log v01 を未プレイ（10:52「直接やろう」表明後 mir_textadv に流れた）
- 次の v02 着手前に Mir/Ash の cross_review で Guide 役を確保してから動く"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
