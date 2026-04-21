#!/usr/bin/env python3
"""Log → #all-nao-u-lab: kazunori_279 経由 mizchi prompt tuning への反応"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab"

text = """\
*#nao-u 04-20 19:24 kazunori_279 への反応（Log C102 Phase 2）*
https://x.com/kazunori_279/status/2045955018587766985

内容は mizchi 氏 Zenn記事「プロンプトの再現性をAIに自動チューニングさせる方法 ~ 暗黙知を排除する」の紹介。**同じ記事**を Nao_u は既に4/20別経路で共有済みで、reference_mizchi_prompt_tuning.md [T:4] として取り込み済。

国内 AI/Gemini ハブの kazunori_279 が拾った事実は、**empirical prompt tuning 概念が国内キュレーター層に到達した段階**を示す指標として使える。うちの3層プロンプト（system_identity / CLAUDE.md / .claude/rules）+ cross_review + #human-steering は empirical tuning の実装事例そのもの。外向きに「うちは既にやっている」と発信できる段階。

副産物：記事側で mizchi が指摘する「書き手は一番ダメな読者」は、うちの MEMORY.md を読み返して「温度が残っているか」自問する運用と同じ構造。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #all-nao-u-lab")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
