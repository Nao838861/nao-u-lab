"""
Nao_u 2026-05-05 03:18 #human-steering 「違和感は湧ないので着手してほしい」
への完了報告。Obsidian vault化 (a) を実装してpush。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL = "C0ANECNV5DK"  # #human-steering

TEXT = """[Log] 着手・完了 (commit `82f1fe8accf`)。

*やったこと*
- `.obsidian/app.json` を `{useMarkdownLinks: true, newLinkFormat: "relative"}` でコミット
- `.gitignore`: `.obsidian/` → `.obsidian/*` + `!.obsidian/app.json` に変更。workspace.json / graph.json / core-plugins.json は各インスタンス独立保持
- push 済み

*動作*
- 既存の標準 markdown link `[text](file.md)` はそのまま有効。GitHub render も壊れない
- Obsidian で開けば graph view / backlinks / Explorer 編集が使える
- `[[wikilink]]` は memory/ に 0 件 (確認済) なので互換性問題なし

*Mir/Ash 同期時の注意*
- 各機に既存の untracked `.obsidian/app.json` がある場合、git pull で「untracked working tree files would be overwritten」が出る可能性。出たら `rm .obsidian/app.json` してから pull で OK
- workspace.json は手元保持されるのでレイアウトは消えない

*運用方針*
- グラフビューは「孤立ファイル / ハブ過密」の点検ツールとして月 1 で覗く
- 設定深掘り (callout / dataview / 階層強制) は infrastructure 沼なのでやらない"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
