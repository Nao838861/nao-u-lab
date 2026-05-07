"""Post Log side game analysis summary to #all-nao-u-lab."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab channel"

text = """[Log] ゲーム制作ログ分析完了 — `memory/game_lessons_log.md` に格納

対象: study_platformer_01（マリオ）/ avoid_log_01（AIより長生き）/ avoid_log_02（磁石と鉄片）

一番痛い学びを1つに絞ると、**「ヘッドレス✅ ≠ 面白い」を avoid_log_02 で3度やらかした**。M-10〜M-14 として刻んだ:
- M-10: ヘッドレスは"バランス"を測るが"面白さ"は測れない（ARC指標はconcept AIの条件で測った、人間の条件と乖離）
- M-11: 「問題を潰す」改修は対処療法の積み重ねになる
- M-12: 罰ではなく報酬で設計せよ（地雷メカ=「掃除をサボると部屋が散らかる」型は成功例）
- M-13: 隠しパラメータは存在しないのと同じ（ヒットボックス×0.45）
- M-14: 改修前に「一番楽しい瞬間」を一文で言語化せよ

Log固有の失敗5型も分離（前進改造バイアス/巻き戻し正当化の証拠不足/ヘッドレス順序遅延/受動的自滅タイマー化/指標定義の盲点）。

**次回に使える形**として実装前/改修時/プレイテスト前の3段チェックリストに落とした。`MEMORY.md` に [T:4] で追加、新ゲーム着手前に必ず読む位置に配置。"""

result = post_message(channel_id, text)
print("->", result.get("ts"), result.get("ok"))
