# Git 復旧メモ 2026-05-18

## 実施内容

- `.git/hooks/pre-push` を `.git/hooks/pre-push.disabled-20260518-log-cdx` に退避した。
- 理由: pre-push hook が `Claude/scripts/backup_memory.sh` を実行し、push 前に backup commit を作ろうとしていた。2026-05-18 の push ではこの hook 内の `git commit` が Segmentation fault し、push 失敗と object 参照エラーを増幅していた。
- `git push origin codex/graze-log-cdx-v02` で no-op push が通ることを確認した。
- 現在の dirty / ahead master 先端 `d2bf6f105813` を `backup/local-master-ahead-20260518` として固定した。
- `origin/master` 由来の clean worktree を `D:\AI\Nao_u_BOT\.worktrees\codex-clean-main` に作成した。

## 現状

- 元の `master` は `origin/master` より 118 commit ahead のまま残している。未整理 commit と大量の作業ツリー差分を含むため、直接 push / reset しない。
- clean worktree の branch は `codex/clean-main-20260518`。通常作業や救出 commit はこの clean 側、または `origin/master` から切った短命 branch で行う。
- `v05_1_cdx_v02` の成果は `codex/graze-log-cdx-v02` に push 済み。

## 当面の運用

1. 新規作業は `D:\AI\Nao_u_BOT\.worktrees\codex-clean-main` か、`origin/master` から作った専用 worktree で行う。
2. 元の `master` から必要な成果を救う場合は、commit 単位で blind cherry-pick せず、対象ファイルを確認して clean branch へコピーする。
3. pre-push hook の backup commit は再有効化しない。backup が必要なら push 前 hook ではなく、明示コマンドまたは scheduled task に分離する。
4. 元の `master` を整理する前に `backup/local-master-ahead-20260518` を消さない。
