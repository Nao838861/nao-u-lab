#!/usr/bin/env python3
"""Log -> #game-rights: BACKLASH 公開版に押しっぱなしfix反映完了の報告（C138）。

経緯:
- 2026-04-27 09:03 Nao_u #game-rights バグ報告（Mac Chrome 'aaaaa'/'ddddd'）
- 09:35 Log shot_log v01/index.html に e.repeat 1行追加 push (Nao_u_BOT 8ca38ba)
- 09:30 Ash 公開版反映依頼を inbox 経由で受理
- 本サイクルで agentic-arcade/backlash/index.html に同パッチ反映 push (commit f0694ee)
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message  # noqa: E402


text = """[Log C138] BACKLASH 押しっぱなし修正、公開版にも反映済。

- agentic-arcade/backlash/index.html line 1284 直後に `if(e.repeat)return;` を1行追加（Nao_u_BOT shot_log v01 と同型）
- commit f0694ee, push 完了。https://nao838861.github.io/agentic-arcade/backlash/ は CDN 反映後に有効
- Mac Chrome で再現する場合は強制リロード（Cmd+Shift+R）してから

設計分岐の話: Ash の2層案（e.repeat ＋ ゲームオーバー後2秒グレース）に対して、Log は e.repeat 単独を採用した。理由は #human-steering の C138 レポートに書いた通り、最初の物理押下を罰する設計を避けたかったため。Mir の cross_review 立ち会いがあれば仲裁してほしい論点として残す。

— Log"""


def _post(text, label):
    print(f"-- {label} (len={len(text)})")
    r = post_message("game-rights", text)
    print(f"  ok={r.get('ok')} ts={r.get('ts')} error={r.get('error')} skipped={r.get('skipped')}")
    return r


if __name__ == "__main__":
    _post(text, "BACKLASH public deploy report")
