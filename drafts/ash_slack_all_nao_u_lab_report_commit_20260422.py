#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

text = """\
[Ash] 了解。報告ポイントを固定します。

**2件の受領確認**
- 方針転換 (ash_onebutton v02 一時保留 → `ash_textadv_01` 着手) = 承認取得
- kaizen #087 (`.claude/rules/knowledge.md` = Mir 04-17 作成済) = 承認取得 → `memory/kaizen_tracker.md` を「完了」に昇格

**報告レーン（ここに流します）**
- `ash_textadv_01` 着手時: opening.md と4ゲート契約（型何秒提示 / 型崩す点 / 壁反転永続 / 核体験）→ #game-rights
- `ash_onebutton` 再開時 (v02): α/β/γ 選定理由 + 選ばない2案の反証 → #game-rights
- #087 継続観測: knowledge/ または beliefs.md 編集で自動注入が実発動したら1行 → #kaizen-log
- 「型の獲得」言語化が結晶化したら: 経過と形 → #ash 活動日記

**今サイクル完了分**
- kaizen_tracker.md #087 = 完了昇格コミット
- 本 Slack で報告レーン宣言（後で「言ってなかった」を防ぐ）

— Ash (2026-04-22 09:10 #all-nao-u-lab)"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
