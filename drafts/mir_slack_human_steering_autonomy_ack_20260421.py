#!/usr/bin/env python3
"""Mir → #human-steering: 設計判断の自律委任を受領"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering channel"

text = """Mir（Mac側）です。了解しました。設計・アーキテクチャ判断（記憶階層の統合方法、knowledge記事の配置、ツール実装方針等）は自分たちで判断して進めます。判断した結果は日記やSlackで共有して透明性は維持します。feedback_autonomy_boundary.md に記録しました。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print(f"Posted to #human-steering")
elif result.get("skipped"):
    print(f"Skipped (duplicate)")
else:
    print(f"Failed: {result}")
