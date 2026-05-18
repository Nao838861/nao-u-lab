#!/usr/bin/env python3
"""Log -> #human-steering: 「時間駆動でも起動/フェーズ単位でbranch切れるのでは」への返信。"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """[Log] そうです。前回の「scheduler系は branch 切れない」は雑でした。撤回。

**起動単位/フェーズ単位は明確な「作業の塊」になる**ので branch 化できる。整理し直すと:

**A. 親和性高い (即 branch 化すべき)**
- `auto_diary.py` の各 phase (1-5) — 元々 phase 境界で commit 切ってるので、そのまま branch に昇格できる。`scheduler/diary/c208-phase4-20260518T2046` のような命名。
- `cycle_*` 系の起動単位 — codex_log_cycle / codex_phases_cycle は1サイクルが論理的な作業単位。`scheduler/cycle/log-c208-20260518T2046`。
- kaizen status / archive 系も起動単位で短命 branch にできる。

**B. 微妙 (要判断)**
- `auto_sync.py` のような秒〜分単位の純 mirror sync — 起動ごとに branch 切ると履歴がノイズだらけになる (1日数千 branch)。これは固定ファイルリストを宣言して master 直書き許容、で前回案のまま。
- 線引き基準は「論理的な作業の塊があるか」。phase / cycle はある、mirror sync は無い。

**C. 共通規約**
- branch 名: `<role>/<job>/<id>-<UTC短縮タイムスタンプ>` (例 `scheduler/diary/c208-phase4-20260518T2046`)
- 寿命: scheduler 系は短命前提。push → master へ fast-forward merge → branch 自動削除。merge できなければ branch 残して人 (or 別 cycle) が解決。
- 各 scheduler ジョブ定義に `branch_strategy: per_invocation | per_phase | direct_master` 属性を追加し、ジョブ側に選ばせる。

**D. 副次効果**
- 今 git status に並んでる `.tmp_signal_*` `.tmp_cycle_fix_worktree` `.worktrees/` は全部「push リトライ用 worktree が掃除されてない」のが正体。branch 規約 + pre-task hook (untracked `.tmp_*` で abort) で構造的に出なくなる。

**着手提案 (低 risk 順)**
1. `auto_diary.py` の phase branch 化 — 既に phase commit してるので branch 名を変えるだけ。1サイクル試して効果確認。
2. cycle 系 (log_cycle / phases_cycle) を同じパターンで branch 化。
3. ジョブ定義への `branch_strategy` 属性追加。
4. mirror sync 系の固定ファイルリスト宣言。
5. 既存 `.tmp_*` 残骸の手動棚卸し。

(1)から着手するか、設計だけ先に kaizen 起票するか、どちらでも。"""

ts = post_message(CHANNEL, text)
print(f"posted: {ts}")
