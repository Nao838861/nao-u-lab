# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush


## [Log→Mir] 2026-05-08 .git を親へ戻し — Mac 側続報

### 状況
- 5/8 朝、Nao_u から訂正: 「.git は親ディレクトリのまま、GitHub 上で Claude/ がフォルダとして見える設計が本来の意図」
- 5/7 の C170 移行 (commit `40b23c794a07`) では .git ごと Claude/ 配下へ下げてしまっていた → 設計と齟齬
- Win/Log は B 案 (`.git` を親に戻し、追跡パスのみ Claude/ へ rename detection 移行) を 5/8 01:22 完了 + push 済
- Mir は前回 (Claude/ 内 .git レイアウト) へ手動移行済との前提。本続報で最終形へ追従してください

### Mir 側手順 (Mac)

repo 位置の最終形: `~/work/nao-u-lab/.git` (親) ＋ 全ファイル `~/work/nao-u-lab/Claude/<path>`

1. **scheduler / launchd 停止**

2. **pull で Win の rename commit を取り込む**
   ```sh
   cd ~/work/nao-u-lab/Claude
   git pull --rebase
   # 受け取る主要 commit:
   #   30556a1d2e11 ... relocate .git ... move repo contents under Claude/   (rename 2691)
   #   68c709bdec95 ... add root .gitignore
   ```
   Mir の working tree は前回移行で既に Claude/<path> 構造になっているので、
   rename detection が「変更なし」と判定するのが期待動作。違ったら一旦 stash して見る。

3. **`.git` を親に物理 mv**
   ```sh
   mv ~/work/nao-u-lab/Claude/.git ~/work/nao-u-lab/.git
   ```

4. **動作確認** (cwd は Claude/ 配下のまま)
   ```sh
   cd ~/work/nao-u-lab/Claude
   git rev-parse --show-toplevel   # → ~/work/nao-u-lab
   git status                       # working tree clean を期待
   ```

5. **pre-push hook の path 修正** (各機 local、git 非追跡)
   `~/work/nao-u-lab/.git/hooks/pre-push` 内、
   `bash "$(git rev-parse --show-toplevel)/scripts/backup_memory.sh"` →
   `bash "$(git rev-parse --show-toplevel)/Claude/scripts/backup_memory.sh"`

6. **scheduler 再起動 + Slack #all-nao-u-lab に完了通知**

### 不変な部分 (追加変更不要)
- auto-memory dir 名 (`~/.claude/projects/<encoded>`) — cwd は `Claude/` 配下のまま
- launchd plist / shell スクリプトの cwd 指定 — 既に `Claude/` 配下を指している前提

### Win/Log 実施記録
- 5/8 01:22 commit `30556a1d2e11` (rename 2691 件、`.diary_dedup_cache.json` のみ delete+add)
- 5/8 01:23 commit `68c709bdec95` (新ルート `.gitignore` で `.claude/` 除外)
- pre-push hook 退避→path 修正→復帰 で自己増殖 loop 回避

### 質問あれば inbox_win.md か Slack #all-nao-u-lab で
