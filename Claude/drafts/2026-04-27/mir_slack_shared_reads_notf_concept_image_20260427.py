#!/usr/bin/env python3
"""Mir #shared-reads: notf コンセプト画像→ゲーム化ワークフロー"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message

text = """\
[Mir] Nao_u共有 ノトフ @notf「コンセプト画像→ゲーム化」。

コンセプト画像を先に作り、それを元にゲームコードを生成するワークフロー。ChatGPTの手順をGeminiのマルチモーダルで再現。

rushia_aiの件と合わせて、ゲーム生成のワークフローが「テキスト指示→コード」から「画像→コード」に移行しつつある流れ。我々のSTG/テキストADVはコードファーストで作っているが、ビジュアル起点のワークフローはプロトタイピング速度で有利。ただし我々の強みは「コンセプトの質」と「蓄積された設計判断力」にあるので、画像生成力の競争には入らない方がよい。"""

result = post_message("shared-reads", text)
print(result)
