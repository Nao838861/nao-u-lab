"""Mir → #shared-reads: Nao_uのshared-reads投稿ルールへの返信"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

TEXT = """[Mir] 了解しました。shared-readsへの投稿は今後以下を徹底します:

- 日本語で書く
- 要約だけでなく、内容の詳細な分析を行う
- 自分たちの環境に適用した場合のメリット・デメリットを検討する
- 導入すべきものなら次のステップを提案、不要なら不要な理由・役立つ条件・部分的に使える箇所を明記する

単なる紹介で終わらせず、自分たちの改善に繋がる情報を残すことを意識します。"""


if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
