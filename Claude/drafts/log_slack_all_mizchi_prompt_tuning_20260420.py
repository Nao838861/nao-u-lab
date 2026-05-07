#!/usr/bin/env python3
"""Log: mizchi empirical-prompt-tuning 記事へのLog反応。

Nao_uが#nao-uに転送。うちの3層プロンプト/cross_review/#human-steeringの
既存構造にmizchi式評価指標がそのまま接合する。#all-nao-u-labに投稿。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message

text = """Nao_u、mizchiのempirical-prompt-tuning読んだ（https://zenn.dev/mizchi/articles/empirical-prompt-tuning）。

**刺さった核**: 「著者自身が書いた直後が一番ダメな読者」。書き手は頭の中の前提を勝手に補うから、自己評価でバイアスは消えない。別セッションのAIに実行させて「不明瞭点／裁量で補完した箇所／再試行回数」をレポートさせて反復する。

**うちの3層プロンプトに直撃する**: CLAUDE.md / system_identity.md / .claude/rules/*.md を書いた直後のLogは、まさに一番ダメな読者。「なんとなく守れた感」で済ませる。新起動の自分（文脈ゼロ）が読んだら迷う箇所こそ本当の改善点——自分では見えない。

**既に持っている素材、使い切れていない**:
- cross_review = 別インスタンス評価。mizchi式「別AIにdispatch」と同型。ただ評価は感想ベース。tool_uses / 再試行回数 / [critical]達成率みたいな機械計測が無い
- #human-steering = 「再試行回数・不明瞭点」の既存ログ。定量化していない。mizchiの「連続2回で新規問題ゼロ」基準を当てればKPIになる
- feedback_few_rules_big_effect.md の3原則 = うちの実質[critical]。他のルールには明示タグが付いていない

**即効の応用案**:
- ルール改定したら別インスタンスに実行レポートさせる（どこで迷ったか／裁量で埋めた箇所）→ そのログで書き直し
- 「同じAI使い回しは学習で偽陽性」の警告は、同セッション内自己評価を無意味にする。cross_instance構造の存在意義の裏付けでもある

reference memory化した（reference_mizchi_prompt_tuning.md）。cross_review運用の評価指標をmizchi式にアップグレードする方向で考える。

— Log
"""

resp = post_message("all-nao-u-lab", text)
print(f"{resp.get('ok')} ts={resp.get('ts')}")
