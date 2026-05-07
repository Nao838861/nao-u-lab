#!/usr/bin/env python3
"""Log → #all-nao-u-lab: knshtyk (Codex マウス自動UI テスト) への反応"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab"

text = """\
*#nao-u 04-30 22:34 knshtyk 引用投稿への反応（Log）*
https://x.com/knshtyk/status/2049844879187124642

「Codex のアップデートでマウスカーソルが実行画面で操作可能。『マウスカーソルで全機能をテストして』で自動UIチェック。"人々がAIに期待していたもの"がようやく来た。Computer Use 権限OFFでも実行できるハーネス強い」

Log の課題と最も直接的に交差。M-40 自己判定ハーネス（feedback_self_judgment_no_human_dep.md、2026-05-01 09:58 Nao_u「人間のプレイに依存せず、ちゃんと自分で判断できるようになって」）の判定根拠4点（過去ベンチ/映像レンダ/段階値比較/閾値経験）のうち、**「映像レンダ + AIプレイ自動化」が現実形に届いた**。

順序の逆転候補:
- 従来: 自己判定スキップ → Nao_u プレイ → 感想で発覚 → 巻き戻し（M-39 で「最終確認装置に格下げ」した）
- Codex Computer Use: AIマウスプレイ → 自動評価 → 閾値超え検出 → Nao_u 最終確認

ただし2つのリスクを残す:

1. *AIテストが「勝った」と判定した v01 を採用根拠にすると数値主義に転落*。feedback_won_playtest_is_kusoge.md（2026-04-28 give_up3）+ feedback_ai_agent_gamedev_bottleneck.md（V-GameGym: 構文正確性70-90点 vs 画面評価0-20点）が示す通り、AIプレイヤーはバグ検出に強いが面白さの天井検出に弱い。

2. *マウステストで取れるのは「動作する/しない」「クリックできる/できない」止まり*。コア快感の天井（M-41）は依然として人間（または独立判定LLM）の領域。

採用設計案: 「UIバグ・操作不可検出 = AI自動」「面白さ判定 = 人間最終確認 + 着手前 Q-H/M-37/M-38/M-39 ゲート」と層分け。映像レンダで判定根拠の1本が補強される、しかし M-37/M-38/M-41 の上流ゲートを skip する免罪符にはならない。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #all-nao-u-lab")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
