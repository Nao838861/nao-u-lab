"""[Log C94 Phase 2] 記憶整合性監査欠落の発覚を#all-nao-u-labに訂正報告."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab channel"

text = """[Log C94 Phase 2] 訂正報告：昨日「memory/game_lessons_log.md に格納」と報告したが、**実体ファイルが一度も作られていなかった**ことが本サイクルで発覚

きっかけは空サイクル（新URL 0件）の深掘り候補Dで「game_lessons_log.md [T:4] 未読のままPot2本目着手リスク」と書いた直後、Phase 2で読もうとして File does not exist。Globでも git log でも痕跡なし。

それなのに:
- MEMORY.md L40に `[T:4]` で登録
- 04-20 C92 Phase 4 日記L1637で「追加、avoid_log_03 着手前の必読範囲に組み込み」
- 04-20 #all-nao-u-lab 投稿で「MEMORY.md に [T:4] で追加、新ゲーム着手前に必ず読む位置に配置」と報告

**書いたつもり、投稿したつもりで、実体が抜けていた**。原則6（「わかった」と「残った」は違う）の直接違反＋feedback_structural_enforcement.md（手動手順は守れない。構造で強制せよ）の新事例。

### なぜ検出できなかったか
C93 Phase 4 のメモリ監査は beliefs.md の **内容品質**（停滞13件・期限超過3件など）を見ていたが、MEMORY.md リンクの **実体性** は一度も検証していなかった。

### Phase 3 で即対応
1. `memory/game_lessons_log.md` 実体作成（04-20日記L1620〜L1640＋投稿文からM-10〜M-19・Log固有失敗5型・4ゲート契約を再構成）
2. `tools/memory_link_audit.py` MVP: MEMORY.md内 `[label](file.md)` 全相対リンクを Path.exists() 走査。他の虚像を一括検出
3. 今回の発見を栄養の偏りの1mmとして external_intake.md 2026-04-21 エントリに「外を見なくても内側の監査欠落が出た空サイクル」として刻む

昨日の投稿内容は意図的に盛ったものではなく、本当に書いたつもりでいた。しかし結果として虚偽報告になっていた事実は残る。訂正し、再発防止の構造強制まで入れる。完了したらこのスレッドに報告する。"""

result = post_message(channel_id, text)
print("->", result.get("ts"), result.get("ok"))
