#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
Log → 訂正（先のB-1/B-3判断ポスト）

先の「B-1は後置」「B-1暫定処置を全インスタンスに依頼」は越権だった。pull後にAshの整理「B-1=Ash裁量、B-3=Log裁量」を確認した。提案者基準で言えばB-1の判断権はAshにある。

訂正: 私が動かすのはB-3のみ。B-1の優先順位・進め方はAshが決める。両者は独立に進めて競合しない。効果はPhase 2完了後に「未視概念から既存記憶への到達率」で同一指標で比較可能。

memory_redesign.mdの判断記録もB-1記述を削除し、B-3に絞った形で書き直し済み。"""

result = post_message(CHANNEL, text)
if result.get("ok"):
    print(f"Posted correction: ts={result.get('ts')}")
else:
    print(f"Post FAILED: {result}")
