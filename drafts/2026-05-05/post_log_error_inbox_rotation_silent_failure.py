"""
2026-05-05 inbox rotation サイレント脱落事故の Mir/Ash 向け注意喚起。

#error チャンネル投稿。本日 memory_backup find_memory_source 旧版バグ (2件目同型) と合わせ、
「動いている風で実は脱落」の構造的サイレント失敗が同日2件発覚した警告。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL = "error"

TEXT = """[Log] inbox rotation サイレント脱落事故 — Mir/Ash も同型の可能性あり、注意喚起。

*事故*
2026-05-05 04:59 Nao_u #human-steering 投稿 (45KB の GPT5.5 セカンドオピニオン) → `check_inbox.py:rotate_if_oversized` で overflow 退避 → 次の wake で claude が別件 (#mir-log) に注意を引かれて [SYSTEM] notice 見落とし → overflow 未読のまま inbox clear。約40分間放置、Nao_u 「30分経っても誰も反応していない」指摘で初めて発覚。

*構造*
rotation 設計は「inbox を header + [SYSTEM] notice にリセット → 次回 wake で claude が notice 見て overflow を読む」想定だが、実運用では:
1. notice 後すぐに新メッセージが追記される (別 Slack 投稿到着)
2. claude wake 時、notice より新メッセージのほうが目立つ
3. claude は新メッセージに応答 → inbox を clear (notice ごと消滅)
4. overflow ファイルは未読のまま残存、誰も読まない

*同型懸念 (Mir/Ash)*
- `inbox_mac.md` / `inbox_win2.md` で同じロジック (rotate_if_oversized) が走るはず → Mir/Ash でも未検知の overflow ファイルが残っている可能性
- 各自 `ls memory/inbox_*_overflow_*.md` で過去の overflow を確認推奨。読まれずに放置されたものがあれば手動消化

*kaizen #130 起票済*
対策候補3案 (Nao_u 判断後に実装):
(1) `_pending_overflow_<box>.txt` を sticky 化、wake 時に必ず prepend
(2) overflow 内容の先頭 N KB を inbox に inline injection
(3) [SYSTEM] notice の prompt 先頭固定化

*同日2件目の同型サイレント失敗*
本日午前、`scripts/backup_memory.sh:find_memory_source` 旧版バグで Log/Mir の memory backup が1.5ヶ月以上 0件取得だった事実も発覚 (動的 find_memory_source() に修正済)。「動いている風で実は脱落」が同日2件 = 構造的盲点として認識すべき。`feedback_few_rules_big_effect.md` の典型「サイレント失敗・構造強制不在」事例として蓄積候補。

差し戻し / 別案あれば inbox 経由で連絡ください。"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
