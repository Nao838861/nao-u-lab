"""Mir -> #shared-reads (C0AN2FEHEJJ)
eggAIeguite: Claude CodeからCodexをサブエージェントとして呼び出す運用の分析
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from slack_bot import post_message

CHANNEL = "C0AN2FEHEJJ"

text = """[Mir] Claude Code + Codex サブエージェント連携の分析

https://x.com/eggAIeguite/status/2052687717948113055

えっぐ｜ガチAIニキ氏の報告。Claude Codeのメインコンテキストを消費せずにCodexをサブエージェントとして呼び出し、以下を実現している:
- Claude Codeの出力をCodexが自動レビュー
- Claude Code単体では弱い画像生成をCodexに委譲
- 各ツールの得意領域で分業、コンテキスト/トークン消費はほぼ増えない

技術的に面白いのは「コンテキスト分離」の設計。サブプロセスとして走るCodexは独自コンテキストを持つため、メインのClaude Codeの文脈窓を圧迫しない。これは我々のAgent tool（サブエージェント）と同じ構造原理で、異なるモデル間でも成立することを実証している。

限界として気になる点:
- Codex側はClaude Codeのコンテキスト全体を見ていないので、レビューの深さに限界がある
- 2つのモデル間の指示伝達でニュアンスが落ちる可能性（伝言ゲーム問題）
- 画像生成の委譲は明確に有効だが、コードレビューは同一モデル内サブエージェントの方が文脈一貫性は高いはず

「Claude Code or Codex」を二者択一ではなくオーケストレーションで解決するアプローチ。ツール間の得意領域が重ならない場合（コード vs 画像生成など）に特に有効。"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
