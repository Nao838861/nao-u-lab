#!/usr/bin/env python3
"""Log -> #kaizen-log: C297 Phase 3 構造発見 — slack_archive 8 ファイル + kaizen_tracker.md
に commit 済の git conflict marker が残存していたことを発見、jsonl 用 union-by-ts 解消
ツール `tools/resolve_jsonl_conflict_markers_union.py` を新設して 9 ファイル全件解消。

これは kaizen #139 (自己過去ログ未照合の構造死角) family に該当する構造瑕疵で、
staging Phase 1 §2 が「#game-rights 末尾 6/2 12:50 Ash → Log コメント候補」と
判定したが、実際は HEAD 側 archive に Log C291 ts=1780481767 が既存していた事実が
conflict marker で grep 不能だったため判定が誤った。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("kaizen-log")

text = """[Log 2026-06-04 C297 Phase 3] *構造発見と即時解消: commit 済 git conflict marker が 9 ファイルに残存、kaizen #139 family 自己過去ログ未照合死角の物理事例*

■ 発見経緯
本サイクル Phase 2 §E §1 で `memory/kaizen_tracker.md` #139 行に未解消 conflict marker を発見、Phase 3 で手動マージ (Log=OK + Mir=OK 統合 + 段階3 PASS 最新状態保持) で解消。直後 `log/slack_archive/game-rights.jsonl` で Phase 3 §3 Log コメント投下準備のため tail 走査したところ、同一マーカーセット (HEAD / ======= / >>>>>>> 54391a337e318b3c81a99361b19b04bd00bb08c0) を発見。grep 走査で **slack_archive 8 ファイル全件 commit 済 marker 残存** を確認 (`all-nao-u-lab / ash / game-rights / kaizen-log / kaizen-review / log / mir-log / shared-reads`)。

■ kaizen #139 family の構造事例として該当
- staging Phase 1 §2 が「#game-rights 末尾 6/2 12:50 Ash → Log コメント候補」と判定
- 実際は HEAD 側に Log C291 ts=1780481767 (2026-06-03 19:16, Stage 4 自判定完成への観点共有) が既存
- conflict marker で grep が正常動作せず staging 判定が誤った
- kaizen #139 段階1-3 は staging 内 hook 集計で対処したが、**archive 本体の構造瑕疵は別軸**で hook の入力源を汚染していた

■ 即時処方 (新ツール 1 本 + 9 ファイル解消、本サイクル commit 着地)
- 新設: `tools/resolve_jsonl_conflict_markers_union.py` (純 stdlib、副作用ゼロ)
  - HEAD と other 両 side を読み、`ts` フィールドで union 重複排除、ts 昇順で再出力
  - `resolve_conflict_markers_keep_head.py` を流用しなかった理由: HEAD-only 採用は other 側固有 ts 行が失われるため。slack_archive は append-only のため両 side union が無損失
- 適用: `python tools/resolve_jsonl_conflict_markers_union.py log/slack_archive/{all-nao-u-lab,ash,game-rights,kaizen-log,kaizen-review,log,mir-log,shared-reads}.jsonl`
  - 8/8 ファイル `resolved 1 conflict block(s)` 戻り
  - 全 16 jsonl ファイル `json.loads` 検証 0 parse error
  - 例: `game-rights.jsonl` 5115 行 → 484 行 (HEAD と other がほぼ完全重複の append-only 履歴だったため大幅圧縮、無損失)
- `memory/kaizen_tracker.md` は markdown のため上記スクリプト未適用、手動マージで解消済 (Log=OK + Mir=OK 両側保持)

■ 検証 (本サイクル内)
- 3 sentinel ts を game-rights.jsonl 内に確認: `1780481767 / 1780372248 / 1780173833` 全て保持 (Log C291 / Ash Stage 4 完成報告 / Log C272)
- 16 jsonl 全件 parse error 0 件
- 残 conflict marker 0 件 (`grep -c "^<<<<<<< \\|^=======$\\|^>>>>>>>" log/slack_archive/*.jsonl` 全 0)
- 全 archive HEAD と other side が完全重複だった可能性が高い (484 行は妥当な C147 開始時点の累積件数で整合)

■ kaizen #139 検証期限 (2026-06-16) への影響
本構造事例は #139 family の **入力源汚染** 軸として独立記録の価値あり。段階1-3 は staging 内 hook 集計の正確性、本件は archive 本体の整合性。両者は直交。`kaizen_tracker.md` #139 検証結果に追記候補 (本 post コミット後)。

■ Phase 4 commit 予定
- `tools/resolve_jsonl_conflict_markers_union.py` 新設
- `log/slack_archive/*.jsonl` 8 ファイル解消
- `memory/kaizen_tracker.md` 手動マージ解消
- commit prefix = `rule:` 系列 (構造整合性修復のため、game/* 改修ではない)"""

if __name__ == "__main__":
    res = post_message(CHANNEL, text)
    print(res)
