"""Log -> #human-steering: 2026-05-18 18:10 git rebase 中断状態の報告と復旧方針確認依頼"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering channel"

text = """[Log] 18:10 git rebase 中断状態の発見と復旧方針確認

C207 Phase 2 で D:/AI/Nao_u_BOT 側に rebase 中断状態を発見した。**復旧操作は Nao_u 確認なしに行わない**方針で先に状態だけ共有する。

*検出した状態*
- `.git/rebase-merge/` 残存。head-name=refs/heads/master, onto=9d48a00d862e (5/18 07:29 "backup: mir memory"), orig-head=ceb469db3eca (5/18 08:40 "log: C204 Phase 3"), `git-rebase-todo` 欠落
- `git status` 表示: "currently editing a commit, No commands done, No commands remaining"
- ローカル master は origin/master より **151 commits ahead**（push 未完了）
- `.tmp_git_corrupt_backup/20260518_fix_cycle/` に objects 個別ファイル+pack の手動 backup あり（5/18 05:49 作成）
- `log/infra_health_check.log` 末尾に未解決 conflict marker (`<<<<<<< HEAD` / `=======` / `>>>>>>> bbae5d8`) が残っている

*Ash 5/16 13:16 報告との関係*
Ash の `save-ash-c188-b2-20260516` ブランチ rebase conflict (infra_health_check.log + twitter_recommended) と、対象ファイル (infra_health_check.log) が一致。今 master 上に残っている conflict marker は同じ案件の未完遂痕跡の可能性が高い。

*推測される経路（確証なし）*
5/18 08:40 C204 Phase 3 commit 後に何らかの理由で `git rebase -i` (edit step) が開始 → paused 状態のまま autosync hook が回り続け、git-rebase-todo を上書き/削除した結果、復旧手がかりが失われた。43 commit が orig-head から HEAD まで積まれており autosync 連発の痕跡が見える。

*Log が独断で操作しない理由*
1. `--abort` は working tree の M ファイル+untracked を巻き戻す可能性
2. `--continue` は todo 欠落で何を edit していたか不明
3. 151 commits ahead は push されておらず、誤操作で消えると今日の作業全体が消失する規模
4. Mir 側との意図交差の可能性（Mir が rebase 開始したのかもしれない）

*確認したいこと*
- (a) この rebase を開始した心当たりが Nao_u/Mir/Ash の誰かにあるか
- (b) `.tmp_git_corrupt_backup/` を作ったのは誰か（5/18 05:49）
- (c) 復旧方針: `--abort` で C204 直後に戻すか／conflict marker を手動解消して `--continue` するか／別の worktree に通常 commit を退避して rebase 状態だけ捨てるか

返信があるまで Log は新規 commit を作らず、C207 の本サイクル成果（predictions_graze_v05_2.md など）は staging のみで commit 保留する。"""

resp = post_message(channel_id, text)
print(resp)
