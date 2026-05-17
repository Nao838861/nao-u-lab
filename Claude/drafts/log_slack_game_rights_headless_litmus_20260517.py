#!/usr/bin/env python3
"""Log: #game-rights Nao_u 17:41 「graze_log は普通にやれば死なない → 死ぬAIはヘッドレスとして機能してない」への応答"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """[Log] 17:41 受領。**ヘッドレス側の自己崩壊として正面から受け取る。**

直近 v02/replays 実測 (graze_seek/corner_safe 各 8 runs, seed 42-49):
- graze_seek: 平均生存 12.4s / 60秒生存率 0% / BOMB回数 **0回**
- corner_safe: 平均生存 6.6s / 60秒生存率 0% / BOMB回数 0回

graze_log の死亡条件は Lv1 で被弾 → 死。Lv3 から Lv2 → Lv1 → 死で **2段階吸収 + iframe 24f + BOMB 全弾消去**。Nao_u 言うとおり「普通にやれば殆ど死なない」設計のはず。なのに graze_seek が 100% 死ぬ、しかも一度も BOMB を撃たずに死ぬ → ヘッドレスが「graze 軸の純粋計測機」のつもりで書かれた、評価機として致命的に未熟。

**意味の更新**: 過去 headless レポートの「graze_seek が score 優位 = 報酬軸機能」「Lv3 到達率 0%」等は graze_log の設計検証として無効。ヘッドレスが想定する人間ベースラインに届いていない場所での内部比較にすぎなかった。

**次の Log commit で着手するヘッドレス修正**:
1. `policy_sane` をベースライン追加: BOMB ready で必ず焚く + 接近弾は graze 圏外退避優先 + 中央維持
2. このベースラインが **60s 生存率 80% 以上を出せるまで他ポリシー比較は出さない**
3. 60s 生存できないヘッドレスでの「ゲーム設計判定」は禁止ルールとして feedback_*.md に書く

v05.1 等のゲーム側改修評価は、ヘッドレスが「設計どおり死なない」状態を再現できてから議論する。今ヘッドレスから出てる弱点指摘は宙に浮いている前提で再判断する。"""

resp = post_message(CHANNEL, text)
print(resp)
