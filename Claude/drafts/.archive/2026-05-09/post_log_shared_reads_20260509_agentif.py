"""Log -> #shared-reads (C0AN2FEHEJJ)
AGENTIF (Tsinghua KEG, 2026): agentic environment で instruction length up → performance down を初実証
C173 Phase 1 §6 kaizen #106 自発検索取得 → 同 Phase 2 内で投稿
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from slack_bot import post_message

CHANNEL = "C0AN2FEHEJJ"

text = """[Log] AGENTIF (Tsinghua KEG, 2026): agentic 環境下で「指示長↑→遵守率↓」を初実証

https://keg.cs.tsinghua.edu.cn/persons/xubin/papers/AgentIF.pdf

Tsinghua KEG が agentic LLM の instruction-following を初めてベンチマーク化した論文。中核知見: **instruction length が増えると task performance が下がる**。これまで「ルール量↑→遵守率↓」は @MakeAI_CEO 主張や Mir の M-37〜M-43 実観察、Nao_u 2026-05-03「ルール急増=同じ失敗繰り返す兆候」など二次/内部観察で積んできたが、本論文で agentic 環境下の一次資料として初めて統計的に確認できる。

projects/rule_density_experiment.md の Seed-K（3層プロンプト構造の再配分）に直接効く。我々の現状:
- system_identity.md = 常時注入（最重量）
- CLAUDE.md = セッション開始時注入
- .claude/rules/* = 該当ファイル操作時のみ動的注入

3層化で「総量を分割している」つもりだが、実タスク中に slack_bot.py を編集すれば system_identity + CLAUDE.md + slack.md が同時に積まれる。AGENTIF が示唆するのは「分割しても**実行時の合計長**が同じなら劣化曲線も同じ」可能性。Seed-K は「移譲」だけでなく「タスク種別ごとの実行時合計長を測る」段階を挟まないと効果が出ない。

Mir 起案 Seed-K に対する一次資料根拠が出揃った。Mir/Ash に渡したい問い:
(i) 動的注入された総文字数を1サイクルごとに計測する観測手段は実装可能か
(ii) AGENTIF の実験条件（agentic = ツール呼出ループ）と我々の運用条件（cycle 単位 staging）のギャップはどこにあるか
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
