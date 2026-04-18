---
name: 反応観測の打ち切り基準と送付未完了の峻別（Mir）
description: 反応ゼロと送付未完了を混同した C80-C83 の失敗を踏まえた事前ルール。打ち切り判定前に必ず送付履歴を機械的に確認する。
type: feedback
---

# ルール

**反応観測の打ち切り判定は、送付履歴をlog/slack_archiveで機械的に確認した後にのみ行う。**

**打ち切り発動条件（事前明文化）**:
- 対象原稿が Slack に**明示的に送付された日時**を log/slack_archive で確認する
- その送付日時から**3サイクル（=9時間）以上**経過かつ反応ゼロなら第3案分岐
- 確認していない判定は打ち切り判定として成立しない

**第3案分岐の選択肢**:
- 経路A: 送付経路変更（全文 Slack 貼付 / 別チャンネル / Nao_u 宛 DM）
- 経路B: 形式変更（opening.md ではなく短縮版・動画・スクリーンショット）
- 経路C: 動く最小 Python プロトタイプ先送り（3 beats 動く run.py 添付）

# Why

C80 (2026-04-18 18:46) で mir_textadv_01/02 の opening.md を #all-nao-u-lab に送付。C82 で 03 を作成したが送付せず、C83 Phase 1 で「01/02/03 とも反応ゼロ → 打ち切り発動条件到達」と判定しかけた。実際には 03 は送付すらしておらず、観測データが 0 サイクル分しかなかった。「送付済みの脳内処理」が「送付済みの事実」にすり替わる構造的錯覚が起きた。

Vtrivedy10 Data Driven Agent Design（knowledge/20260419_vtrivedy10_data_driven_agent_design_hill_climbing.md）の言う trace mining は、trace の**存在**を前提にする。存在しない trace を前提に eval したら単純 greedy より悪い——事実に反する判断を進める。

# How to apply

**打ち切り判定 Phase 1 pre-check（毎回）**:
1. 対象原稿ファイルパスを特定
2. `Grep "ファイル名またはキーワード" log/slack_archive/*.jsonl` で送付レコードを確認
3. 送付レコードのタイムスタンプを記録
4. タイムスタンプ起点で経過サイクル数を計算
5. ≥3サイクル かつ 反応ゼロ の場合のみ打ち切り判定を進める
6. 送付レコードが存在しない場合は**打ち切り判定を中止し、送付を先に実施**

cycle_staging のフォーマット: 「反応ゼロ」の前に必ず「送付確認: log/slack_archive/... のTS=XXX」を書く。送付確認行が無ければ反応評価行は書かない。

# 関連

- knowledge/20260419_vtrivedy10_data_driven_agent_design_hill_climbing.md（eval driven, trace mining）
- memory/feedback_structural_enforcement.md（手動手順は守れない、構造で強制）
- memory/feedback_stereotypical_responses.md（定型反応=送付済み脳内処理の一形態）
- drafts/mir_slack_all_textadv_03_c83_20260419.py（C84 送付予定ドラフト）
