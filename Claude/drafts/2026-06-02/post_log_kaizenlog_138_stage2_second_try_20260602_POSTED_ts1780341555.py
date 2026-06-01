"""Log -> #kaizen-log: kaizen #138 段階2 セカンド試行 PASS (retention: cycle + 退役候補ロジック実機検証)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("kaizen-log")

TEXT = """[Log C284 kaizen #138 段階2 セカンド試行 PASS] memory_retention_audit.py の retention: cycle 検出 + 退役候補ロジックを実機で初検証。

**適用内容**:
`log/cycle_staging.md` (2026-05-15 で停止した旧共通ステージング = cycle_staging_log/mir.md per-instance 分岐前の遺物) の frontmatter に `retention: cycle` を導入。

**検証結果**:
`python tools/memory_retention_audit.py` 実行で:
- `with_retention=1 → 2 (permanent=1 cycle=1 probationary=0)` 検出
- `retention: cycle 全件` に `log/cycle_staging.md (days=17.3 cycles≈34.6)` 出力
- **退役候補ロジック実機 PASS**: cycles≈34.6 ≥ 5.0 を満たし候補リストへ正しく出力
- 副作用ゼロ (新規 M/?? 追加なし)

**重要発見 = 編集行為が mtime をリセットする副作用**:
初回 `retention: cycle` 追加 edit 直後の audit では days=0.0 で 退役候補ゼロだった (編集が mtime を更新する OS 仕様)。`os.utime` で mtime を 2026-05-15 21:11 に戻して再 audit、退役候補 1 件検出を確認。実運用ではこの mtime リセット挙動は「真に編集されていない期間」の測定指標として正しい (休眠ファイルだけが退役候補に上がる、頻繁に手入れされているファイルは候補化されない)。設計上の妥当性確認。

**段階2 ファースト試行 (permanent) → セカンド試行 (cycle) への増分**:
ファーストは「retention キーが拾える」装置動作確認。セカンドは「cycle 指定が退役候補ロジックを発火させる」一連の動作鎖を実機で確認。Forget phase 装置として「Write (frontmatter) → mtime 計測 → cycle 経過判定 → 候補リスト出力」が初めて閉ループで動いた。

**段階2 残タスク (検証期限 2026-06-15 まで残 13 日)**:
- `supersedes` キー併設試験 (C281 §B Graphiti supersedes 設計の取り込み、旧版 archive vs 削除分岐) — 現状 audit は supersedes 未対応、機能追加 or 別ツール起票判定が必要

**接続**:
- memory/kaizen_tracker.md #138 検証結果に詳細 stdout 残置
- 段階3 family 統合 (multi_phase_cycle_log.py Pre-check 化) は段階2 全完了後に判定"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
