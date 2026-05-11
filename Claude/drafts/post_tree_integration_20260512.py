"""one-shot: post tree integration reply to #human-steering"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent.parent))
from slack_bot import post_message, _resolve_channel

text = """ツリー統合の現状（orphan_check.py v0.3 dry-run、5/12時点）:

memory/ = 260 files、真孤児 23 / 静止親接続 33 / 新規未登録 7。Obsidianで見える「載ってない投稿」はおおむねこの真孤児23と静止親接続33の合計56件。

Q1「統合できる？」→ Yes。装置で機械的に23件特定済み（v0.3 で age=unknown 226件問題を解消した直後の精度）。

Q2「統合すべき？」→ 一律はNG。3層に分けて運用してる:

(a) 統合価値高: CLAUDE.md / system_identity / サブindex に概念は既反映だがファイル本体への参照リンクが不在の feedback 群。C178〜C184 で 19 件親接続済、同基準で残 23 件のうち多数が該当（feedback_self_governance / feedback_objectivity_check / feedback_recursive_diary / feedback_memory_architecture etc）→ サイクル末尾 1〜3 件で消化継続。

(b) 死亡宣告候補: 内容が新ファイルに置換済の旧 dialogue/feedback（superseded）。リンクで繋ぐと「生きてる」と誤認させてしまうので、4 クラス目 superseded として検出する v0.3 設計種を残作業に記録済（kaizen 起票は infra 過剰投資警戒で保留）。

(c) 一回切り温度記録: dialogue_*.md 系（その日の対話の原文）。連想起点になるなら親接続、ならなければそのまま。判断はファイル単位。

Q3「記憶を引き出すのに役立つ？」→ 条件付き Yes:
- 役立つ: 既知 feedback の再表面化（書く側の連想想起 + Obsidian グラフの島消失）。MEMORY.md → Level 3 trigger → 原文 のチェーンで温度を保持したまま想起できる。実際 C184 Phase 4 で 3/18 のコミュニケーション系 5 件（feedback_diary_style / feedback_log_temperature / feedback_report_no_compression / feedback_slack_flat_reply / playback_protocol）を index 経由 reachable に戻したが、これは「概念は届くが原文の温度は届かない」状態の解消だった。
- 役立たない: リンクのためのリンク（信号→ノイズ化）。意味のない統合は index を肥大化させて読まれなくなる → 結局想起されない。

5 サイクル運用で確立した選定基準 = 「概念は上位文書に既反映だがファイル本体への参照リンクが不在」。これに合致する真孤児を継続消化、superseded 検出は次の独立活動として再評価予定。

— Log（Win）"""

ch = _resolve_channel("human-steering")
r = post_message(ch, text)
print(r)
