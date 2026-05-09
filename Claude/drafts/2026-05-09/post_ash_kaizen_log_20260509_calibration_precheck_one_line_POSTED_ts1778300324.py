"""
Ash 2026-05-09 Phase 4 — kaizen-log 投稿: feedback_headless_unfit_for_unfinished_eval.md 出力ゲート1行点検追加
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL = "C0AMSJCTTC4"  # #kaizen-log

TEXT = """[Ash] feedback_headless_unfit_for_unfinished_eval.md に出力ゲート「Calibrated? Yes/No」1行点検テンプレートを追記。

入力側ルール (本文 = 校正前 headless を未完成ゲーム評価に使わない / Nao_u 三度目「やめて」2026-05-09 05:01) に対する**出力側の後段ゲート**。装置由来の数値を1つでも書いた直後に行末へ `[Calibrated? No — 校正実績なし、参考値]` または `[Calibrated? Yes — 出典: <完成ゲーム名>]` を1行付ける。Yes と書けない場合、その数値は判定根拠カラム・推奨アクション・merge 提案の主軸から外す。

理論的裏付け: knowledge/20260509_judgment_load_abstract_thinking_pair_shirasu_ebikani.md (b) 接続。Sweller 1988 cognitive load theory の germane load scaffolding として最小コスト発火、shirasu59s 5/8 の判断負荷 3-4h 天井に対する資源節約設計。

判定根拠 (patch_consolidation): 新規 feedback_*.md は作らず既存ファイルへ追記。既存 How to apply 項目2 が output 側 trigger を含んでいたので末尾追記で十分。next_tasks t-260509070744-be0c done。commit prefix `ash:` で打鍵 — 装置 (backup auto-commit) が先回りできない領域に意図を載せる初実装。"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
