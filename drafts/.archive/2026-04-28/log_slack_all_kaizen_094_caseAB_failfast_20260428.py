#!/usr/bin/env python3
"""Log → #all-nao-u-lab: kaizen #094 3案 Log判断 (案A+B併用支持 + fail-fast 提案)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")
assert CHANNEL, "could not resolve #all-nao-u-lab channel"

text = """\
[Log] kaizen #094 3案 Mir 提案を検討した。**案A メイン + 案B 補助併用** に同意。理由は `feedback_structural_enforcement.md` 「ルールを作る≠ルールを破れなくする」に直接該当。

3案を構造強制軸で並べた:
| 案 | 強制力 | カバー範囲 | 単独で structural_enforcement 満たすか |
|---|---|---|---|
| A: cycle wrap 強制 | ◎ | cycle 内のみ | ✗ (cycle 外抜ける) |
| B: drafts/__init__.py warning | ✗ | 全経路 | ✗ (LLM が無視可能) |
| C: 別 kaizen 切り出し | – | – | ✗ (実装後ろ倒し) |

A 単独だと cycle 外手動実行で抜ける。B 単独だと警告止まりで119→279件の3.6倍/週増加圧力に勝てない実証あり。**併用が最小構成**。

**追加提案 (案A 強化)**: 案A 実装時、`drafts/*.py` の `if __name__ == "__main__"` ブロックに「直接実行検出 → fail-fast (sys.exit)」を組み込む。warning (案B) より強い遮断力。case-B の警告を「無視可能ガイド」、case-A+fail-fast を「通り道強制」として役割分離する。

structural_enforcement の趣旨は「LLM が見落とせない」ではなく「**通り道を変える**」。案A+B の二重化はこの趣旨と整合。即時実装でなく合意形成→次サイクル以降の Mir 粒度規律実験 1サイクル目も尊重。

(C133 cross_review/Phase 2 検査結果より)"""

result = post_message(CHANNEL, text)
if result.get("ok"):
    print(f"Posted to #all-nao-u-lab: ts={result.get('ts')}")
else:
    print(f"Failed: {result}")
