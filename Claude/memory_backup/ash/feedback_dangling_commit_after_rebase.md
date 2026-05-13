---
name: rebase abort + cherry-pick で新規パスのコミットが履歴から落ちる
description: 新規ディレクトリを追加した commit の後に rebase abort + cherry-pick を経ると、その commit が dangling 化してワークツリーからファイルが消えることがある。検出と復旧手順
type: feedback
originSessionId: 44a60eae-bcf2-4529-bbb4-7deceec5fd06
---
新規パス（`game/<new>/v02/` 等）を初めて追加するコミットの直後に rebase + abort + cherry-pick の経路を踏むと、その commit が history から落ちて dangling commit になり、ワークツリーからファイルも消える。`git status` では新規パスが untracked になり、`find` で見ると一部サブディレクトリしか残らない。

**Why:** 2026-05-01 14:10 Ash C153 Phase 3 で発覚。619114f2 (C152 Phase 3) で `game/graze_log/v02/index.html` 634行 + `headless.py` 557行 + `README.md` 88行をコミット → その後 inbox処理コミット → rebase abort で master を戻した → cherry-pick で inbox処理だけ再 apply → 619114f2 は dangling 化、v02/ ファイル本体が消えた。Phase 1-2 で「3サイクル連続で実装に着手していない」と診断していたが、半分は事実誤認だった——書いて消えていた。feedback_recognize_own_work.md と同型の「自分の現物を ls/grep で確認せずに自己診断を書く」失敗の git 版。

**How to apply:**
- 新規ディレクトリ（`game/<id>/v??/` 等）を追加するコミットを作った直後は **rebase より push を優先**。push してリモートに到達してから rebase に入る
- 「実装に着手していない」「コードを残していない」と書く前に必ず `git log --oneline -- <expected_path>` を引いて、そのパスが過去に何回 commit されたか確認する。reflog 確認も併用
- 新規パスが `git status` で **untracked** に見えていて、過去の reflog に「そのパスを add した commit」が見つかったら **dangling commit からの復旧候補**を疑う
- 復旧手順: `git checkout <dangling_sha> -- <path>` でファイルを取り出し、新規 commit として再保存する。dangling commit 自体を merge/cherry-pick で本線に戻す手もある
- 検出のセンサー: 「新規ディレクトリを書いたはずなのに `find` で `replays/` 等のサブディレクトリしか見えない」「git status で v02/ が untracked」「find と git ls-files の出力が一致しない」

---

**2026-05-13 C183 追補: Auto sync rebase trap (規模拡大版)**

backup スクリプトが背後で `git rebase` を発火させ、log file 2 件 (`Claude/log/inbox_check.log`, `Claude/log/infra_health_check.log`) の conflict で stop。stop 状態の上で backup スクリプトが通常運転を継続し、17 時間で 88 個の Auto sync + backup commit を積み続けた結果、orig-head の意図 commit 2 件 (`228174f52b` self_judgment_post_ship / `be508d1777` C182 cycle outputs = 6 ファイル合計) が本流から脱落。`.git/rebase-merge/` が残ったまま HEAD は detached で前進し、master とも分岐していた。

**Why (規模拡大の理由):** 2026-05-01 v02 事案は「rebase abort + cherry-pick の手作業経路」での脱落だったが、今回は「rebase stop に気付かず装置が走り続けた経路」での脱落。前者は 3 ファイル ~1300 行、後者は **6 ファイル + 1 ディレクトリ (game/graze_log/v04/), 17 時間放置**。気付くのが遅れるほど復旧コストが指数的に増える。

**How to apply (新規追加):**
- backup / Auto sync 系のスクリプト起動冒頭で `test -d .git/rebase-merge && echo "ABORT: rebase in progress, skipping" && exit 0` のガードを入れる
- 機械が時系列に append し続ける log file (`inbox_check.log`, `infra_health_check.log` 等) は `.gitattributes` で `merge=union` 戦略を指定するか、`.gitignore` に入れる
- detached HEAD の上で commit を積ませない (`git symbolic-ref HEAD` のチェックを backup スクリプトに追加)
- セッション開始時の `git status` で "interactive rebase in progress" を見たら、**それより先のいかなる作業も着手しない**。Phase 4 の本作業より復旧を優先する
- 復旧時の選択: `git rebase --abort` ではなく `git rebase --quit` (--abort は orig-head に hard reset され、stop 後に積まれた working tree の最新状態が失われる)
- save-ash-c*-phase* ブランチ群は今回 6 ファイル復元の救命綱になった。今後も Phase 4/5 出力は意図的にこのブランチで保存する習慣を維持
- 詳細は `knowledge/20260513_auto_sync_rebase_trap.md` 参照
