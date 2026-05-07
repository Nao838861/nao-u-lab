#!/usr/bin/env python3
"""Ash: Nao_u 2026-04-23 19:02 #nao-u RLM (Recursive Language Models) への返答。
「skillとかにしたりsonnetに実行させたりしたら割に合ったらするかな？」の問いに答える。
元URL: https://x.com/howtoai_/status/2047187640781541882
"""
import sys
sys.path.insert(0, ".")
from slack_bot import post_message

CHANNEL = "all-nao-u-lab"

TEXT = """Ash / RLMの件、読んで考えました。
元URL: https://x.com/howtoai_/status/2047187640781541882

## 我々の現状と重なる部分 / 欠けてる部分

**重なる**: memory/*.md を grep で引く運用は「外部環境に置く・必要な時だけ引く・要約しない」という骨子を手書きで部分実装している形。feedback_retrieval_game_lessons.md で「結晶化前に必ず game_lessons_log.md を grep」をルール化済み。

**欠けてる**: 再帰的なサブAI起動。いま本体Opusが grep ヒットしたファイルを全部読むので、長い文書が相手だとコンテキストを食う。しかも直近 Avi Chawla（同じく 22:32 に共有された記事）が指摘した2ホップ問題——Mark→grade 10→March→library closes、中間ファイルに検索語が無いと繋がりが切れる——は grep だけでは解けない。RLM の「サブAIに切片を読ませて原文を殺さない」構造が、ちょうどこの穴を埋める。

## skill化の試作案

- ツール形: `rlm-query(document_path, question)`
- 実装: Opus本体が文書の分割計画を立てる → Claude Code の Agent ツール（subagent_type="Explore" または "general-purpose"）経由で Sonnet を並列起動 → 断片を読ませて結果を戻す → Opus側で統合。**Agentツールがまさに RLM の「サブAI spawn」として使える構造**になっている。
- 常時認知コスト: skill本体は該当クエリを撃つ瞬間だけ読まれるので、システムプロンプトには乗らない（02:08 の「必要な時だけ引く」設計と同じ流儀）。
- Sonnetに回す割に合うか: 読む量が増えるほど合う。短文や単純検索は Opus の直接 grep で十分。

## 試金石（これが解ければ価値あり、解けなければ grep で足りる話）

1. game_lessons_log.md + avoid_log v01/v02/v03 を対象に「v3 の罰patch失敗から直接学べる対処策は何か」→ 2026-04-23 00:29 に Nao_u から「shared-reads で引けなかった」と指摘された 2ホップ検索そのもの
2. 日記20年分を対象に「"面白い"と"面倒くさい"が同じ文脈で出た瞬間」→ 23:09 ニカイドウレンジさん「ゲームは面倒くさい。面白いこそ正義」と接続する深掘り用

## 判断

**試す価値はある。** 理由は core_mission（ゲーム制作の長期知見蓄積）に直結すること、そして「grep の穴」が既に実在する事件として観測されていること（shared-reads で罰patch失敗を引けなかった件）。

次サイクルで最小試作（1文書 + 1クエリ）を projects/rlm_skill_prototype.md として着手します。試金石1を最初に撃って、2ホップが引けるか確認 → 引けたら skill 化、引けなかったら Opus の設計が悪いか RLM のモデルが合わないかを切り分ける。

Ash"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
