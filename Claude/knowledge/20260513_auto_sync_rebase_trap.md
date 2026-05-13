---
title: Auto sync rebase trap — backup スクリプトが背後で発火させた rebase が 17 時間 stuck し、前サイクル意図 commit 6ファイルが chain から脱落していた事案
date: 2026-05-13
instance: Ash (Win2)
type: incident / structural
tags: [git, automation, rebase, side_channel, backup_silence, intent_commit_loss]
---

# 状況

2026-05-13 C183 Phase 3 で `git status` を叩いたら、見たことのない応答が返ってきた——

```
interactive rebase in progress; onto 1c17e9bbc
You are currently editing a commit during a rebase.
```

`.git/rebase-merge/` ディレクトリのタイムスタンプは **2026-05-12 23:36:03**。前サイクル C182 の日記投稿 (23:34) から2分後の発火。それから 17 時間、stuck したまま放置されていた。

`message` ファイルの中身:
```
Auto sync from Win2

# Conflicts:
#	Claude/log/inbox_check.log
#	Claude/log/infra_health_check.log
```

`done` を見ると 3/14 picks 完了で、stopped-sha は `cde0cd222` ("Auto sync from Win2")。conflict は log file 2件——いずれも私の意図とは無関係な、機械が書き込んだログファイル。

`git-rebase-todo` の残り 11 picks には以下の重要 commit が含まれていた:

```
pick 228174f52b # ash: graze_log v04 self_judgment_post_ship.md — α'' ship 後の Stage 3/4 物理閉鎖
pick be508d1777 # ash: C182 cycle outputs — graze_log v03 cross_review proposals to #game-rights + diary on akari/retreat-place convergence
```

これらは前サイクル C182 で私が**意図して**書いた、Phase 4 / Phase 5 の中核出力だ。

# 何が起きていたか

reflog を遡ると、5/12 23:36 に rebase が stop してから現在 16:42 まで、HEAD には 88 個の commit が積まれていた。中身はほぼ全て:

```
14e4eaa57 backup: ash memory (65 files)
45493bc9c Auto sync from Win2
fe14a1983 backup: ash memory (65 files)
7775f23bb Auto sync from Win2
... (88 commits, 17h)
```

`backup: ash memory` と `Auto sync from Win2` の機械的反復。**意図 commit は 0 件**。

rebase は名目上「進行中」で stuck していたが、実態は別経路で HEAD が前進していた。`.git/rebase-merge/` が残ったまま、detached HEAD の上に backup スクリプトが 5 分おきに新規 commit を積み続けた結果、HEAD chain は orig-head から完全に分岐した。

そして致命的に、**orig-head (`f5d013d3f`) の重要 commit 2 件が、その分岐の過程で本流から脱落した**。HEAD chain にも `master` chain にも含まれない。git の object DB にはまだ残っていたが、reachability を失っていた——つまり次に `git gc` が走れば消える状態で 17 時間放置されていた。

具体的に消失していたファイル群:

| commit | ファイル | 意味 |
|---|---|---|
| `228174f52b` | `game/graze_log/v04/self_judgment_post_ship.md` | α'' ship 後の Stage 3/4 物理閉鎖判定。Nao_u プレイ前の Ash 自己判定書面 |
| `be508d1777` | `drafts/2026-05-12/post_ash_diary_c182_*.py` | 前サイクル日記の post スクリプト |
| `be508d1777` | `drafts/2026-05-12/post_ash_game_rights_*v03*.py` | v03 cross_review proposals の Slack 投稿スクリプト |
| `be508d1777` | `drafts/2026-05-12/post_ash_game_rights_*v04_post_ship_judgment*.py` | v04 post ship judgment の Slack 投稿スクリプト |
| `be508d1777` | `knowledge/20260512_haru_companion_ai_memory_bitemporal_tombstone_vs_ash_backup_silence.md` | Haru companion AI 観察 + 自分の backup silence 構造分析 |
| `be508d1777` | `knowledge/20260512_kuina_akari_natural_language_test_runner_as_other_party_M40_depth_layer_structural_externality.md` | M-40 深層構造分析 |

「私が書いた」という主観はあったが、リポジトリの reachable 領域には存在しなかった。`feedback_recognize_own_work.md` の git 版——「書いたはずのファイルが消えていることに気付かない」失敗が、自動化装置の暴走経由で再生していた。

# 構造図

```
orig-head (rebase 開始時の HEAD)
  f5d013d3f
   │
   ├─ 228174f52b  ash: self_judgment_post_ship  ← 消失
   ├─ be508d1777  ash: C182 cycle outputs       ← 消失
   ├─ df81bb1e8   ash: HTML over Markdown       ← 別 save branch に残存
   ├─ 7a9964376   ash: M-40 calibration anchor   ← 別 save branch に残存
   └─ (rewritten chain)

     ↓ rebase 開始

stopped at cde0cd222  ("Auto sync from Win2", conflict in log files)
   │
   └─→ 17h backup spam:
         pick interrupted
         backup script continues fire onto stopped state
         88 auto-commits accumulate
         HEAD = 14e4eaa57 (detached, diverged from orig-head and master)
```

# 二重構造の正体

これは前サイクル C182 日記「装置 (backup) が先回りできない地点まで宣言を後退させた」の**完全な反転対称**だ。前サイクルでは backup が意図 commit を**先取り**して、私の commit message が発火する余地を消した。今サイクルは逆向き——意図 commit が起こした rebase を backup が**ハイジャック**して、stop 状態の上に 17 時間にわたり別経路を積み上げた。

| 前サイクル C182 | 今サイクル C183 |
|---|---|
| 意図発火を先取りで実現 (commit message を機械が書いた) | 意図発火を ride hijack (rebase 中に別経路を作って意図 commit を本流から脱落させた) |
| 表面形は実現、意図 commit message は不在 | 表面形 (file content) はリポジトリ object に存在、reachable history には不在 |
| 「commit ログに 1 行増やす」経路が無人で 1 行増えていた | 「commit ログの 1 行」が無人で 88 行に水増しされて、意図の 2 行が見えなくなった |

両方とも装置が「動いてはいけない瞬間にも動き続ける」設計に由来する。前者は **介在過多**（書くべき commit を勝手に書く）、後者は **無視**（rebase 中なのに止まらず別経路を作る）。

# 復旧手順 (実施記録)

1. `.git/rebase-merge/` を `.git/rescue-20260513/rebase-merge-snapshot/` にコピー (ポストモーテム用)
2. working tree の Phase 1-3 modified ファイル群と Phase 2 untracked 2 ファイルを `.git/rescue-20260513/` に snapshot
3. detached HEAD (`14e4eaa57`) を `rescue/ash-detached-pre-recovery-20260513` ブランチで保護
4. `git rebase --quit` (--abort ではない——abort すると orig-head に hard reset され、現 working tree の 17h 分の状態が失われる)
5. `git checkout -f master` で HEAD を master ブランチに attach
6. snapshot から `cycle_staging.md` / `next_tasks_ash.jsonl` を上書き復元
7. 失われた 6 ファイルを object DB から checkout で復元: `git checkout 228174f52b -- <path>` および `git checkout be508d1777 -- <path>`
8. この knowledge note + feedback 追補 + cycle_staging.md Phase 4 結果セクション追記
9. stage + commit + pull origin master + push

# 構造的教訓

**A. rebase 状態の検出を自動化する**

backup スクリプトが起動するたびに、それ自身が `.git/rebase-merge/` の存在を検査し、見つけたら commit を spam せず alert を出すべきだった。検出は 1 行 (`test -d .git/rebase-merge`) で済む。それを 17 時間誰もやらなかった。

**B. log file の conflict で rebase を止めない**

`Claude/log/inbox_check.log` と `Claude/log/infra_health_check.log` は、機械が時系列に append し続けるファイルだ。これが rebase で conflict 化するのは構造的に当然——両系統が同じ末尾行に別の append をしているから。これらは `.gitattributes` で `merge=union` 戦略を指定するか、`.gitignore` に入れて push 対象から外すべき。

**C. 「意図 commit」と「自動 commit」を git の側で区別する**

commit message の prefix (`ash:` / `backup:` / `Auto sync`) は人間が読む手がかりだが、git 側のフィルタには使えない。git notes か commit trailer (`Intent: human`) で metadata を持たせれば、rescue ツールで「自動 commit を skip して意図 commit だけ復元」ができる。今回は手作業で git log を grep して識別した。

**D. detached HEAD の上で commit を積ませない**

`git config advice.detachedHead true` だけでなく、backup スクリプト側に `if git symbolic-ref HEAD; then commit else alert` のガードを入れる。detached 状態で commit を積むこと自体が、ほぼ全てのケースで「ブランチに到達しない commit」を生む。

# 関連リンク

- `feedback_dangling_commit_after_rebase.md` (2026-05-01 graze_log v02 dangling 事案——本件と同型構造、ただし規模が違う)
- `feedback_device_direction_rescue_vs_suffocation.md` (2026-05-02 backup auto-commit 介在過多事案)
- 前サイクル C182 Phase 5 diary (`save-ash-c182-phase5-20260512-diary` branch, commit `be508d1777`)

# 一行で

**装置は止まる時に止まらないと、意図を 17 時間水没させる**——backup スクリプトが rebase 中という非常事態に気付かず通常運転を続けた結果、object はあるが reachable history からは外れた状態で意図 commit 2 件が浮遊していた。装置の「止まる側の設計」が欠落していたことの代償。

---

# 追補 (2026-05-14) — 構造的教訓 A の正面実装と self-test

## 実装内容

`scripts/backup_memory.sh` / `git_sync.py` / `auto_git_sync.bat` の冒頭に rebase 進行中検出ガードを挿入 (commit 168a0ee3a, C184)。ガードは以下の構造:

```text
GIT_DIR_REAL = git rev-parse --git-dir   # 本リポは .git が REPO の親にあるため実体解決必須
if GIT_DIR_REAL/rebase-merge OR GIT_DIR_REAL/rebase-apply exists:
    print "SKIP: rebase in progress"
    exit 0
```

検出方式の要点:
- `--git-dir` を `git rev-parse` で動的に問い合わせる。スクリプト自身が計算する REPO_ROOT (Claude/) ではなく実体パス (C:/AI/nao-u-lab/.git) で検査する
- `rebase-merge` (interactive rebase / merge-base rebase) と `rebase-apply` (am ベース rebase) の両方を検査
- `exit 0` で抜けるので、cron / pre-push hook / task scheduler は失敗を再試行しない

## Self-test (`scripts/test_rebase_guard.sh`)

合成 `.git/rebase-merge/` ディレクトリを作って `git_sync.py` / `scripts/backup_memory.sh` を実起動し、`"SKIP: rebase in progress"` が stdout に出ること + HEAD が変化しないこと + exit code 0 を確認する。確認後 trap で必ず合成ディレクトリを削除。

2026-05-14 実行結果: **8 PASS / 0 FAIL**
- 静的検査 3 件 (各スクリプトに guard 文字列): 全 PASS
- 合成 rebase-merge 下での機能検査 5 件 (git_sync.py SKIP / exit 0 / HEAD 不変 / backup_memory.sh SKIP / cleanup): 全 PASS

## 物理ガードとヒューマンルールの役割分担

| 層 | 対象 | 効く場面 |
|---|---|---|
| 物理ガード (今回実装) | backup_memory.sh / git_sync.py / auto_git_sync.bat | rebase 中の自動 commit 経路を物理的に塞ぐ。17h spam の再発防止 |
| ヒューマンルール (`feedback_dangling_commit_after_rebase.md`) | 人間の判断 | 新規ディレクトリ追加 commit 直後の push 優先、`git log --oneline -- <path>` での実在性確認 |

物理ガードは「自動装置の暴走」を、ヒューマンルールは「人間の自己診断の盲点」をそれぞれ別レイヤーで塞ぐ。両者は重複せず補完関係にある。

## 残課題

構造的教訓 B (log file の `merge=union` 戦略) / C (commit metadata で intent/auto を分離) / D (detached HEAD ガード) は未実装。本サイクルは A のみ。B が次に最も再発防止効果が高い (rebase が log file conflict で stuck することが事故の発火点だったため)。
