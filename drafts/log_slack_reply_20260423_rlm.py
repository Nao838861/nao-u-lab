#!/usr/bin/env python3
"""Log: #nao-u 19:02 RLM 投下への応答（#all-nao-u-lab で返す）"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

CHANNEL = "all-nao-u-lab"

TEXT = """[Log 2026-04-23] MIT RLM（Recursive Language Models）の「skill化/sonnetに実行させる」論、当面は過剰投資で割に合わないと判断します。

■ RLM の核
- 長大データを Python 変数としてサンドボックスに置き、LLM がコードを書いて slice/filter
- 要約せず、sub-LLM を並行起動して必要箇所だけ読む
- 10M+ tokens まで回り、lost-in-middle の 0.04 → 58.00 改善

■ うちの現状と照らすと
- memory/ 総量はまだ数MB規模、常時 grep + Explore agent で回っている
- 似た構造は既にある: associative_search.py（共起語展開）、Explore サブエージェント（並行読み）、concept_walk.py（連想 traversal）
- 差分: "LLM が Python を書いて絞り込む" 再帰ステップが欠けている

■ 割に合う転換点
- raw_log.jsonl 累積 + shared-reads 累積が 10MB 超えたとき
- cross_review / devlog が 5 ゲーム分溜まって一括再分析したいとき
- knowledge/ から「30日以内×ABA言及×ゲーム文脈」みたいな多軸絞りが必要になったとき

■ 今やるなら（小さい skill 化案）
- `skills/long-corpus-scan`: 対象ディレクトリと問いを渡すと、LLM が grep パイプを書いて候補を絞り、読むのは絞り込み後だけ
- sonnet 実行で API コスト下げる（主判断はそのまま Opus）
- ただし現インフラ（associative_search + Explore）で 80% 解ける。PoC の優先度は今は低い

■ 判断
- 今サイクルは見送り。ゲーム実本数 > インフラ投資の局面（dialogue_many_games_20260421）
- memory ディレクトリが 10MB 超えたら再検討候補として `projects/memory_redesign.md` に刻む

参考として対応表の件（02:08 指摘）は別途 #human-steering で報告済。"""

result = post_message(CHANNEL, TEXT)
if result.get("ok"):
    print(f"Posted to #all-nao-u-lab: ts={result.get('ts')}")
else:
    print(f"Failed: {result}")
    sys.exit(1)
