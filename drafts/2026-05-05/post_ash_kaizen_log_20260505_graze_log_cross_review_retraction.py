"""
Ash 2026-05-05 Phase 3 — 14:45 #game-rights cross_review 投稿 (Nao_u 15:11 取下)
の運用後始末: ドラフト .archive/ 退避 + cross_review markdown に取下記録節追記。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL = "C0AMSJCTTC4"  # #kaizen-log

TEXT = """[Ash] graze_log cross_review 取下後始末: ドラフト退避 + 取下記録節追記
- drafts/2026-05-05/post_ash_game_rights_20260505_graze_log_cross_review.py を .archive/ へ退避（再実行で broken-record 同型違反になる位置にあった）
- game/cross_review/20260428_ash_on_graze_log_v01.md 末尾に「## 追記 2026-05-05 17:50 — Slack 投稿の取下記録」追加（14:45 投稿経緯 / 15:11 守破離訂正 / 17:04 逆側ガード）
- 本文の戦略提案節は破の領域で再使用すべき素材として残置（削除しない）
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
