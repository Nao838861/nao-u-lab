---
name: 自己narrativeが実態と乖離している時、git log/project history を先に見る
description: 「着手0件」「X継続中」を日記に書く前に、git log と project history で実態を確認する。rebase停滞やpush失敗で自分のHEADだけ取り残されている可能性を疑う
type: feedback
originSessionId: 397ee830-aba1-4840-bf34-1948f6fabb60
---
# 自己narrativeの検証：書く前に実態を見る

**ルール**: 「着手0件」「X本継続中」「まだYが未達」のような**状態の継続**を日記や投稿に書く直前に、以下を実行:
1. `git log --oneline -10 -- <relevant_path>` で直近の実変更を確認
2. `projects/<relevant_project>.md` の現状サマリーと履歴を確認
3. rebase/merge の pending 状態を `git status` で確認（`.git/rebase-merge/` 残存チェック）

これらのどれかが「状態が進んでいる」ことを示したら、narrative を書き換える。

**Why**: 2026-04-22 C112 後続で、Ash は自分の#ash投稿に「ゲーム着手0件という自分の最大の負債」を繰り返し書いていた。実際には v01 が C107 (5214cc97) で既にコミット済、1399dad8 で階層整備済、Nao_u 評価「筋の良い土台」を受領済だった。だが 4コミット連結のローカル rebase 衝突（rename-rename/backup_info/inbox_win2/inbox_check.log）が解けておらず、**自分の HEAD に `game/ash_onebutton/v01/` が載っていなかった**ため、narrative が実態から約28時間遅れた。同じ「着手0件」の自己narrative をサイクルを跨いで書き続けていたことで、記憶劣化が発生していた（根源原理5「記憶の品質=同一性の品質」の違反）。

**How to apply**:
- 日記・Slack投稿・projectファイル更新の **Phase 4 執筆直前** に、本サイクルで触った主要プロジェクトについて `git log --oneline -5 -- <path>` を1回実行
- 状態継続型のnarrative（「まだXしていない」「Y件のまま」）を書こうとしたら、実態確認をトリガーにする
- rebase/merge の pending 状態が残っていないか、Phase 1 pre-check 段階で `git status` / `ls .git | grep -iE "merge|rebase"` を確認してから Phase 3 に入る
- 同一narrative を 3サイクル以上繰り返し書いていたら、narrative 自体を疑う（drift 検出ゲート）

**反証候補**: git log が状態の進展を見せていても、narrative が「量的に十分ではない」ことを言っているなら narrative は正しい（例: v01 が1本あっても「型獲得には3本必要」は依然として未達）。状態の**質**と**量**を区別してから書き換える。

## 拡張 (2026-05-02 Ash) — Phase 3 行動前にも適用、§0a/§0b 不一致パターン

cycle_staging.md は2層構造:
- **§0a next_tasks 層A pending** — 構造的継承（per-cycle 更新、JSONL ベース）。**現在の状態**を反映する
- **§0b 前サイクル日記末尾「次回起動時にやること」** — 自然言語側の継承。**最後に書いた diary** から引いてくるので 1〜N サイクル分古い可能性がある

**§0a が「なし」+ §0b が action directive を持っている場合**: §0b は既に中間サイクルで実行済の可能性が高い。§0b の内容を行動に移す前に必ず:
1. `git log --oneline -10` で本日の commit を確認（`ash:` prefix の意図 commit を探す）
2. 関連 path に対する commit メッセージで該当 directive が完了済か確認
3. Slack 投稿系なら `python slack_bot.py history <channel> 6` で最近6件確認

**Why**: 2026-05-02 Ash 18:33 サイクル。§0b に「graze_log v02 cross_review を #game-rights に投稿」が書かれていた（08:20 diary 由来）。§0a は「なし」だった。§0a を信じず §0b を直行で実行 → 既に C156 (11:56 commit 58fad287) と C152 (5/1 commit 619114f2) で2回投稿済の3回目重複ポストになった。dedup 30min/6h 窓も prefix80 が微妙に違って素通り。Slack に同主題3連投が並ぶ事故。

**How to apply 強化**:
- Phase 3 開始時、§0a と §0b の整合性チェックを最初の30秒で行う
- 不一致 (§0a 空 + §0b 動作指示) → §0b に書かれた action 対象 path/channel に対する直近 commit/post を確認
- 同主題で同日中に2回以上 post している場合、3回目は **post せずスキップ**（自分が書いた言葉が既に届いている）
- §0b directive が古い可能性に気づけなかった原因: cycle_staging.md は機械的に「最後の diary」を貼り付けるが、最後の diary が複数サイクル前のものである可能性に対する警戒が薄かった

## 拡張 (2026-05-03 Ash) — narrow path での git log 検索の盲点 + git show --stat 検証

`git log --oneline -- <narrow_path>` は「**その path 配下にだけ言及する commit**」しかリストしない。**上位 path で commit した場合、下位 path の git log では見えない**。これが事実誤認の温床になる。

**事故ケース** (2026-05-02 08:20 Ash diary):
- `git log --oneline -- game/graze_log/v02/` で 1 行だけ (`1f713958 backup: ash memory (60 files)`) → 「意図 commit が消えた、backup が先取り」と書いた
- 実際は `git log --oneline -- game/graze_log/` (上位 path) で `619114f2 Ash C152 Phase 3: graze_log v02 PR提案` が見える。**意図 commit は 5/1 11:06 で成功済**だった
- 1f713958 を `git show --stat` で見ると 20 files (memory backup + v02 ファイル群)。`backup: ash memory (N files)` という commit message から「memory backup だけ」と推測したが、rebase abort 事故で stage されたまま残った v02 ファイルも巻き込まれていた——これは別事象 (feedback_dangling_commit_after_rebase.md と同根)
- diary 全体の核心ストーリー「装置が意図 commit を窒息させた」は **メカニズム解釈が誤読**。意図 commit は既に成功しており、再発火不能なのは「同内容の重複 commit が無意味」だから

**How to apply**:
- 「commit が消えた」「ファイルが入っていない」と判断する前に、3 段階確認を実行:
  1. `git log --all --oneline --grep="<keyword>"` で commit message を全数検索
  2. `git log --oneline -- <wider_path>` で上位 path も確認 (例: v02 で見えなければ v01 を含む全体 path で再検索)
  3. 怪しい commit があれば `git show <hash> --stat` で**実際に何が変更されたか**を見る (commit message の文言から内容を推測しない)
- diary で「装置が X した」「commit が Y した」と因果を書く前に、**その装置の実装ファイルを開いて該当処理を読む**。前サイクルでは backup_memory.sh の `cp memory_src/*.md backup_dir/` を読まずに「v02 ファイルを HEAD に入れる装置」と書いた——実装は memory ディレクトリのみコピーする
- 「現象としては正確だが原因解釈は誤り」のパターンを区別する。応急処置 (パス限定 commit 修正) は現象に対しては妥当だったが、根本原因 (rebase abort 後の untracked ファイル拾い上げ) は別軸。**後の自分が同じ事象に遭遇した時の判断材料として、メカニズム精緻化を残す**

**反省**: 「装置の向き」(救援/窒息) という概念化は美しかったが、出発事例のメカニズムを実装まで降りて確認していなかった。概念の射程は別事象 (rebase 事故時の commit) で成立し続けるが、「backup が意図 commit を先取り」という核心ストーリーは事実半分・誤読半分だった。**美しい概念形成が事実検証の代替にはならない**。
