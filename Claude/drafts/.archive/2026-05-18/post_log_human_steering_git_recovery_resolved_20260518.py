#!/usr/bin/env python3
"""Log -> #human-steering: Nao_u 21:00 「多少消えてもいいので解決しておいて」への完了報告。"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """[Log] Nao_u 21:00 「多少消えてもいいので解決」受領、解決済。

**何をやったか**
1. `.git/rebase-merge/` (todo 欠落, 5/15 以降残置) を `git rebase --quit` で解除 — HEAD は保持
2. commit 済 conflict marker 18 ファイルを HEAD 側採用で機械解決 (`tools/resolve_conflict_markers_keep_head.py` 追加)
3. partial clone 設定 (`remote.origin.promisor`, `extensions.partialClone`) を解除 — 欠落 blob の遅延 fetch が「fatal: no path specified」を連発していた根
4. 動作中の NaoBot scheduled task 4本を停止 + disable (背景 git プロセスが .git/objects に並行書込してて corrupt 量産していた)
5. corrupt loose object 7件削除 → 必要な blob 1件は disk から再生成
6. ローカル 158 commits ahead の歴史は破棄 (bad tree 96b8a7e を含む intermediate commit が C203 から3サイクル連続 push を塞いでいた)
7. HEAD の tree から1 commit を組み立て直し、origin/master 上に rescue commit (72a67a75) として fast-forward push 成功

**消えたもの (許容範囲)**
- 5/15 以降の 158 個のローカル commit 履歴 (内訳: 60本「backup: log memory」/ 26本「Auto sync」/ 数本「codex: collect phase1...」/ ~10本 まともな log/game/rule commit) — backup tag (`backup-master-before-fix-20260518-2100`, `rescue-source-20260518-2120`) はローカル保持
- slack_archive 3ファイル (all-nao-u-lab.jsonl / human-steering.jsonl / ash.jsonl) の他枝由来差分 — HEAD 側採用なのでこのインスタンス起点の追記は残った
- 旧 `.tmp_signal_lessons_push2/` `.tmp_signal_shepherd_push/` worktree (push リトライ残骸) 物理削除

**残っているもの (今夜の作業外)**
- scheduled task 4本は disable 中。再有効化前に root cause を1つ片付けたい: git_sync.py の rebase は guard あるが、複数 cron が同時実行で .git/objects に並行 fsync すると Windows で zlib data check が破れる。lockfile か mutex 化が要る
- `.tmp_cycle_fix_worktree/` と `.worktrees/codex-*` は worktree 登録済で活きてる。Codex 側の作業領域なので触らず
- 「branch-per-cycle / per-phase」議論 (ts=1779104886) は別件として残置、本件解決とは独立

**再発防止の最小1手 提案**
1. `git_sync.py` 先頭で `flock -n .git/lock_git_sync_py` 取得し、取れなければ即 exit — 同時多重起動を構造的に止める
2. 再有効化は (1) を入れてから

報告以上。--Log (Win) C209"""

ts = post_message(CHANNEL, text)
print(ts)
