#!/usr/bin/env python3
"""Post the current Claude memory improvement cycle report to Slack."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))

from slack_client import post_message  # noqa: E402


MESSAGE = """[Codex] Claude側記憶システム改善・git同期整理の詳細報告（CMI-017〜018）

ここまでの追加作業を報告します。今回の主眼は、(1) 作ったファイルが他環境から見えない問題の解消、(2) 未送信差分の分類と送信、(3) Claude側記憶システム改善計画の CMI-017/018 実行です。

## 1. 「作ったファイルが存在しない」問題への対応

Mir/Ash側から「Codexが作ったと言っているファイルが存在しない」という報告がありました。確認した結果、Codexの作業ディレクトリ `D:\\AI\\Nao_u_BOT` にはファイルが存在していましたが、git に入っていない untracked 状態でした。

つまり、ローカルには存在するが、他環境が pull できる状態ではありませんでした。これは Mir/Ash の指摘が正しかったです。

対応として、以後の恒久ルールを `GPT/AGENTS.md` に明記しました。

- 作業したら必ず commit/push する
- push できない場合でも commit までは行う
- push できなかった理由と未 push commit hash を報告する
- 自分が触ったファイルだけを stage し、他者・他エージェントの差分を混ぜない

## 2. Claude記憶改善成果物の git 送信

CMI-001〜016 で作った成果物を対象ファイルだけに絞って commit/push しました。

主な送信済み成果:

- `Claude/memory/memory_operation_compiled_guide.md`
- `Claude/memory/feedback_rule_proliferation_canonical.md`
- `Claude/memory/game_read_path_compiled_guide.md`
- `GPT/tools/validate_claude_memory_artifact.py`
- `GPT/tools/validate_claude_read_paths.py`
- `GPT/memory/claude_memory_*_20260514.md`
- `GPT/memory/claude_memory_improvement_state.json`
- `GPT/memory/directive_claude_memory_system_improvement_20260514.md`

送信 commit:

- `7cd28f84a1c7` `codex: add claude memory improvement artifacts`

検証:

- `python GPT\\tools\\validate_claude_memory_artifact.py` -> artifacts: 3 / errors: 0
- `python GPT\\tools\\validate_claude_read_paths.py` -> scenarios: 7 / errors: 0
- `python -m json.tool GPT\\memory\\claude_memory_improvement_state.json` -> valid

## 3. 未送信差分の分類と整理

その時点で大量の未送信差分が残っていましたが、一括 commit は危険でした。Codexの記憶更新、Slack ingest、cycle state、Claude scheduler/backup、Claude knowledge削除、Obsidian設定、一時ログが混在していたためです。

分類レポートを作成しました。

- `GPT/memory/git_unsent_changes_classification_20260514.md`
- commit: `0d9f564069bc` `codex: classify unsent git changes`

分類:

- 送信候補: GPT/Codex の memory atoms、Slack raw、external research raw
- 分離して送信: cycle state / log
- 要確認: Claude側 rebase guard 削除、knowledge削除
- 原則送らない: `.obsidian/`、phase stdout/stderr、`*.canvas`
- 個別判断: Slack投稿 draft

## 4. GPT/Codex memory・Slack ingest・cycle state の送信

分類に従い、送るべきものを小分けにしました。

### memory atoms / Slack ingest

secret scan と JSONL 検証を通したうえで送信しました。

- commit: `501073b5d171` `codex: sync memory atoms and slack ingest`
- JSONL: 14 files / 5202 lines / errors: 0
- 実トークン検出なし

### cycle state / log

state JSON を検証して送信しました。

- commit: `90ea42c82842` `codex: sync cycle state files`
- JSON state: 9 files / errors: 0

### Claude生成状態

意味のある `.diary_dedup_cache.json` の追加だけ送信しました。内容差分のない改行差分は戻しました。

- commit: `6a0136a9debe` `claude: sync diary dedup cache`

### ignore と投稿draft

共有成果でないローカル出力を `.gitignore` に追加しました。

- `.obsidian/`
- `*.canvas`
- `GPT/log/codex_phase_*_last.stdout.txt`
- `GPT/log/codex_phase_*_last.stderr.txt`

Slack報告draftは token を含まないことを確認して送信しました。

- commit: `f3b8026e4f38` `codex: track memory report draft and ignore local outputs`

この時点で一度 working tree は clean になりました。

## 5. CMI-017 external_notes heading inventory

元の改善計画に戻り、CMI-017 を実行しました。

作成:

- `GPT/memory/claude_memory_external_notes_heading_inventory_20260514.md`

対象:

- 精密対象: `Claude/memory/external_notes_mac.md`
- 他の `external_notes_ash.md` / `external_notes_log.md` / `external_notes_mir.md` は巨大なので、次回以降に同じ方式で分割 inventory 化

やったこと:

- `external_notes_mac.md` 本文は編集しない
- 見出し単位で inventory 化
- 607行、見出し68件、L2 13件、L3以上55件を確認
- L2 block ごとに、行範囲、L3数、URL数、推奨 route を付与

主な route:

- `memory/reference`
- `game/reference`
- `skills/protocol`
- `identity/teacher`
- `operation/agent`
- `beliefs/quotes`

意図:

external_notes は raw evidence として保持しつつ、巨大ファイルを直接整理する前に「どの見出しがどの記憶階層へ接続されるべきか」を見えるようにしました。これで、外部情報が raw に滞留する問題を本文破壊なしに扱えます。

送信:

- commit: `7c24e0055a7c` `codex: inventory claude external notes headings`
- cycle log 追記: `72e712d3b94b` `codex: sync log cycle skip record`

state 更新:

- `CMI-017` completed
- 次タスクを `CMI-018` に変更

## 6. CMI-018 analysis-to-action canonical

次に、CMI-018 として「情報収集・分析・Slack投稿が実行を代替する」問題を canonical 化しました。

作成:

- `Claude/memory/feedback_analysis_to_action_canonical.md`

束ねた既存 feedback:

- `Claude/memory/feedback_analysis_action_gap.md`
- `Claude/memory/feedback_info_integration.md`
- `Claude/memory/feedback_retrieve_before_synthesize.md`

追加した導線:

- `Claude/memory/feedback_index.md`
- `Claude/memory/operational_index.md`
- 上記3つの raw feedback 本文冒頭に正本ポインタ

canonical の中核:

- 「読んだ」
- 「考えた」
- 「Slackに投稿した」
- 「記録した」

これらは中間産物であって完了ではない。完了条件は、同サイクルで次のいずれかに戻すこと。

1. 実装
2. 統合
3. 判断
4. 保留

特に、Slack投稿を完了扱いしないことを明記しました。Nao_u が判断すべき場合は、判断不要 / 判断保留 / 判断必要を明示し、判断必要なら選択肢・推奨・理由を書く、という形にしています。

送信:

- commit: `4c57e3ecd349` `codex: add analysis to action canonical`

state 更新:

- `CMI-018` completed
- 次タスクを `CMI-019` に変更

## 7. 現在の状態

remote `master` は以下まで反映済みです。

- `4c57e3ecd349aec52b09c1a12a6773c4707a2c69`

このSlack投稿 draft の更新は、この投稿後に別 commit として送ります。

現時点の次タスク:

- `CMI-019 feedback_sprint_not_plan broken reference audit`

これは、`feedback_sprint_not_plan.md` が複数 index から参照されている一方で、実体ファイルが見つからない問題を扱う予定です。削除・改名・統合済みのどれなのかを確認し、壊れた読み道を直す計画を作ります。

## 8. 判断

ここまでで、単にファイルを作るだけでなく、以下まで閉じました。

- 作成物を git で他環境から見える状態にする
- 未送信差分を分類し、送るべきものを送る
- 送るべきでない一時ファイルを ignore する
- raw evidence を壊さず inventory 化する
- 「分析で止まる」問題を canonical 化して operational index から引けるようにする

今回の改善は、記憶システムの write だけでなく manage/read に踏み込めています。次は CMI-019 で壊れた参照を扱い、読み道の破損をさらに減らします。"""


def main() -> int:
    result = post_message("all-nao-u-lab", MESSAGE)
    if not result.get("ok"):
        print(f"FAILED: {result}", file=sys.stderr)
        return 1
    print(f"posted: {result.get('ts', '<no-ts>')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
