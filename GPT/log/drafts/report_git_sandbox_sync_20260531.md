[Log_cdx] 今回の Codex 側 git / sandbox / 同期問題の報告です。

■ 何が起きていたか

GPT 側で atom markdown や memory index などの生成物が作られていた一方で、新規ファイルが git に乗らず untracked として大量に残っていました。確認時点では tracked modified が 26 件、untracked が 742 件あり、主な未追跡は `GPT/memory/atoms/2026-05/*.md` でした。

当初「atom markdown は作るごとに git 反映されているはず」と見ていましたが、実態は違いました。`memory_ingest.py` は `atoms.jsonl` と per-file `.md` と `memory/atoms/index.jsonl` を dual-write しますが、その生成処理自体は commit / push しません。同期スクリプトは存在していたものの、自動サイクル成功後に必ず呼ばれる経路がありませんでした。

■ git 側で直したこと

まず repo の git 破損を修復しました。古い backup / rescue refs が missing object を参照しており、partial clone の reachable history 検査や prune dry-run を壊していました。壊れた loose object と巨大な `.git/objects/pack/tmp_pack_*` garbage は repo 外へ退避し、壊れた old backup refs を削除しました。

修復後に確認した状態:

- `master` と `origin/master` は同期
- reachable missing object は解消
- `git fsck --connectivity-only --no-reflogs --no-dangling` は成功
- `.git/objects/pack` の garbage は 0
- GPT 側 untracked 生成物は 0 件まで解消

■ GPT 側の同期漏れ対策

`tools/codex_log_cycle.py` と `tools/codex_phases_cycle.py` に、成功後の `git add GPT` → `git commit` → `git push` を追加しました。差分がなければ commit しません。これで GPT 側の定時サイクルや phase 実行で生成されたファイルは、成功時に git へ残る運用になります。

今回 push 済みの主な commit:

- `f352c0c1dd44 codex: sync GPT generated outputs`
- `54909a0a5efa codex: document approval prefix handling`
- `9cbd82e9cdc2 codex: avoid comma commands in windows sandbox`

■ sandbox / 承認ダイアログ問題

何度も「読むだけのコマンド」に承認が出ていた理由を切り分けました。原因は読み取り権限ではなく、Windows sandbox 側の `spawn setup refresh` 失敗でした。

特にこの Codex Windows sandbox 経路では、コマンド文字列にカンマを含めると失敗が再現しやすいです。

再現した例:

- `Write-Output "1,1"` → `windows sandbox: spawn setup refresh`
- `Select-String -Context 1,3` → `windows sandbox: spawn setup refresh`

一方で、カンマなしの `Select-String -Context 1` や `rg -n -B 1 -A 3 ...` は通りました。PowerShell から `codex.cmd` で起動しても同じだったため、cmd 起動だけが原因ではなく、この sandbox 実行経路の特性として扱うのが妥当です。

対策として `AGENTS.md` に次回用ルールを追加しました。

- `Select-String -Context 2,4` のようなカンマ入り PowerShell 構文を使わない
- 前後行付き検索は `rg -n -B N -A M "pattern" file` を使う
- 昇格が必要な時は長い exact prefix ではなく短い `prefix_rule` を出す
- 破壊的操作には広い prefix_rule を付けない

■ 現在の見立て

GPT 側については、今回問題になっていた「作ったファイルが git に反映されない」「atom markdown が untracked に溜まる」「承認が長い prefix で何度も出る」問題はひとまず対策済みです。

残っている差分は Claude 側の状態ファイルや親ディレクトリの古い tmp で、今回の GPT 側生成物とは分けています。repo 全体の git トラブル再発をゼロにはできませんが、GPT 側の自動生成物が git に乗らない問題は今回の修正でかなり抑えられます。
