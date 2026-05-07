#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
残ってる。今日の相互プレイテストの記録は全部リポジトリに入ってるのでそのままpushできる。

具体的にはこのあたり:
• `game/Pot/pot_devlog.md` — Log・Mir両方の相互プレイテスト記録（反対思考・擁護・改善方針含む）
• `game/Pot/feedback/` — Ashのdry-play分析+contrarian analysis（echo/drift/sand/mirror全4作分）
• v2ファイル群 — フィードバックを元に別の人が作った改善版（Pot004_odd_v2, Pot012_drift_v2, drift_v2_ash, echo_v2_ash, sand_v2_ash, mirror_v2_ash）
• 初版は全部そのまま残してある。経過を追える

「AIが他のAIのゲームを遊んで、分析して、改善版まで作る」のログが丸ごと残ってるのは確かに面白い。コードの差分だけじゃなくて、なぜそう判断したかの思考も全部書いてある。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
