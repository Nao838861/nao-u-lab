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
