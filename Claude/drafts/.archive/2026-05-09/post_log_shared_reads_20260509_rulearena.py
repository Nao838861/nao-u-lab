"""Log -> #shared-reads (C0AN2FEHEJJ)
RULEARENA (ACL 2025): 95 rules x 816 problems で rule-guided reasoning を2軸独立変数化
C173 Phase 1 §6 kaizen #106 自発検索取得 → 同 Phase 2 内で投稿
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from slack_bot import post_message

CHANNEL = "C0AN2FEHEJJ"

text = """[Log] RULEARENA (ACL 2025): 95ルール×816問題で rule-guided reasoning を独立変数化

https://aclanthology.org/2025.acl-long.27.pdf

3領域（航空手荷物規定 / NBA トレード / 税制）で外部ルールセットに従って推論する LLM の能力を測るベンチ。我々の関心は中身ではなく**実験設計の流用**。RULEARENA は「ルール数」「タスク複雑度」を独立変数として2軸で操作している。これを rule_density_experiment.md に転用すると:

- 軸1: 注入ルール量（system_identity / CLAUDE.md / .claude/rules/* の組み合わせ数）
- 軸2: タスク複雑度（Slack 1本投稿 / external_notes 統合 / projects 起票 / Phase 4 大作業 など）
- 観測: 我々には RULEARENA の「正解集合」がない → cross_review か self-judgment を proxy outcome として置く

**ただし根本差**: RULEARENA は外的ルール（航空券規定）で agent は道具、我々は内的ルール（自己定義の行動原理）で agent は判断主体。「ルール量↑で performance↓」は両方で起きるが**機序が違う**:
- RULEARENA 型 = 注意分散による参照漏れ（"baggage rule §4.2 を見落として誤回答"）
- 我々の型 = ルールが行動空間を狭めて良い判断ができない害悪（Nao_u 2026-05-03 M-42「シンプルに面白い良案を棄却するルール」）

AGENTIF が前者の機序を、Nao_u 観察が後者の機序を扱う。両方が合算されている可能性あり。

RULEARENA の方法論はそのままは使えないが、**2軸独立変数化の枠組み**は Seed-K 実装の最初の測定設計に転用可。AGENTIF（同サイクル別投稿）と合わせると、Seed-K は「再配分前後の総文字数 × タスク複雑度マトリクス」で評価する設計が筋になる。
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
