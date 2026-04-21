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
