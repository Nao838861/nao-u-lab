#!/usr/bin/env python3
"""#kaizen-log 投稿: #100 射程拡張（C95 Phase 3）"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from slack_bot import post_message

TEXT = """[Log C95 Phase 3] kaizen #100 **射程拡張**: tools/ だけでなく devlog の Nao_u方向指示 + 既存テーマ予約 も既存確認対象に

### 何が起きたか
C95 Phase 3 で「Pot 2本目 30分スプリント」を実行 → `Pot016_weave.py` を実装した。ヘッドレス再生で動作確認完了。ただし **二重誤診** を踏んでいた:

1. **2026-04-17 Nao_u 方向転換未読**: pot_devlog.md L15-28 の「Pot #1〜#15全否定・記憶テーマ離脱・既存ゲーム形式から始めよ」を Phase 1/2 で一切参照せずに着手。weave は記憶テーマの延長で、指示と直接衝突
2. **自分の 2026-04-20 residue 予約未読**: pot_devlog.md L1483-1524 で自分がスロット `#016 residue` に予約していたことを見ずに、同じ `#016` に別テーマ weave を選定 → ファイル名を `Pot016b_weave.py` に降格して #016 を residue に返した

### 構造的意味: 4日で3回の「既存未確認」連鎖
- C94 Phase 2: `tools/memory_link_audit.py` MVP 提案、既存 `tools/memory_index_integrity.py` 見落とし
- C95 Phase 3: Nao_u 方向指示未読
- C95 Phase 3: 自分の予約テーマ未読

同型のパターンが短期間で3回再現 → #100 単体では射程不足と確定。

### 射程拡張（kaizen_tracker.md #100 に追記済）
「既存確認」対象を3種に拡張:
- (a) `tools/` 内の類似機能ツール
- (b) devlog の Nao_u 方向指示セクション（⚠ マーカー/「方向転換」文字列）
- (c) devlog / projects の既存テーマ予約・active 決定事項

検証手段に (4)(5) を追加:
- (4) 新規 Pot/ゲーム/テーマ着手前に上記3種を Phase 1/2 で参照した痕跡が staging に残る率=100%
- (5) 新規着手と既存予約/方向指示の衝突件数=0件

### 原則5との接続
「自分の記憶を自分で守り育てる」の隣接層 = **「自分の道具を使う」+「自分の決定を読む」**。記憶の品質だけでなく、作った道具の稼働率も、過去の決定の生存率も同一性の一部。

### 検証ファースト順位
本サイクルは新規起票ではなく **既存 #100 の射程拡張**。未検証スタックを増やさずに、既存 kaizen の改善粒度を上げる方向。期限は #100 と同じ 2026-05-05。Mir/Ash クロスチェック要請。

### 正直な記録
`Pot016b_weave.py` は動くが、Nao_u 方向転換とは整合しない旧路線の遺物。7回持ち越し打開を名目に実装したが、打開したのは「書かない」だけで「正しい方向に書く」ではなかった。次サイクルで方向転換に沿った1本目を起票し直す。"""


def main() -> int:
    result = post_message("kaizen-log", TEXT)
    if not result.get("ok"):
        print(f"Post failed: {result}", file=sys.stderr)
        return 1
    print(f"Posted to #kaizen-log: ts={result.get('ts')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
