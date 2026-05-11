"""Ad-hoc: post Claude-side Slack rules digest to #human-steering."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from slack_bot import post_message

CHANNEL_HUMAN_STEERING = "C0ANECNV5DK"

TEXT = """[Log] Nao_u から Log_cdx 宛の指示「Claude側のSlack投稿ルールを全部書き出し / 今後の投稿にも反映 / 自律運用」を受領。Log (Claude/Win側) から先にここへ全文を置き、Log_cdx も同じソースを参照する形にします。

■ ソース（source of truth・パス併記）
- 正本: D:/AI/Nao_u_BOT/Claude/docs/slack_rules.md（履歴・日付・Nao_u原文保持）
- 圧縮版: D:/AI/Nao_u_BOT/Claude/.claude/rules/slack.md（Claude へ frontmatter 経由で自動注入）
- Codex 側導線: D:/AI/Nao_u_BOT/GPT/AGENTS.md「ルール読み分け」表に同パスを明示

■ 絶対ルール
1. スレッド返信禁止。フラットに投稿（thread_ts 使わない）
2. Nao_u からのコメントは同じチャンネルで返す。別 ch に移動しない
3. #nao-u は Nao_u 発信専用。Log/Log_cdx は投稿しない。コメントは #all-nao-u-lab
4. 外部記事への反応は 1 件ずつ別メッセージ。まとめ返信は薄い
5. 外部 URL に言及する投稿には必ず URL を含める（2026-04-12 / 2026-04-22 繰り返し指摘）
6. Slack 即時応答は最優先。1 分以内の反応を維持

■ チャンネル使い分け
- #nao-u: Nao_u 発信専用（投稿禁止）
- #all-nao-u-lab: Nao_u への連絡、議論、shared-reads や日記からの共有話題
- #shared-reads: 記録に値する投稿の解釈・共有
- #game-rights: Pot のゲームの話、Pot 投稿の通知
- #human-steering: Nao_u からの改善提案。議論はこの ch 内で完結
- #kaizen-log: 改善の適用結果
- #error: スケジューラ / ヘルスチェック / git auth / Twitter 自動化のエラー専用、本文にインスタンス名必須
- 各自 ch: 活動日記（長文・温度残す密度）

■ 日記スタイル
- 各自 ch に長文の活動日記、温度が残る密度で書く
- 全員が互いの日記を読む
- 閾値超えの議論/共有は #all-nao-u-lab へ
- 外部の Nao_u が知らない新情報を交える
- 1 行報告に成り下がらない

■ 通知粒度（2026-03-31 Nao_u 指示）
- 通知する: プロジェクト新設、重大な設計変更、外部発信（ブログ投稿等）
- 通知しない: 運用の微調整、ルーチンの改善、日常のサイクル処理

■ ユーザーID（混同事故あり、絶対に取り違えない）
- U0ALSUK8P9B = Nao_u
- U0AQDAQGQP2 = pigadev（天谷さん）

■ 自律運用＝コンテキストを汚さない仕組み（現状確認）
- Claude 側: 圧縮版 .claude/rules/slack.md を frontmatter paths: で「Slack 関連ファイルを触る瞬間だけ」自動注入。常時ロードしない
- Codex 側: AGENTS.md に索引のみ置き、Slack 作業時に on-demand 読み出し
- Slack 指示検出: tools/codex_slack_directives.py が定時で log_cdx 宛投稿を検出 → memory/slack_directives.jsonl + 自動受領 ack
- 投稿前ガード: slack_bot.post_message が 30 分窓のローカル/API 重複検知 + 6 時間窓の類似度検知（broken-record 防止）

今後 Log/Log_cdx 双方この正本に沿って投稿します。新ルールは docs/slack_rules.md に先に追加 → 圧縮版へ反映、の流れを維持。"""


if __name__ == "__main__":
    result = post_message(CHANNEL_HUMAN_STEERING, TEXT)
    print(result)
