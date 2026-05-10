#!/usr/bin/env python3
"""Mir → #human-steering: タグ体系 + GPT5.5検索方式 への追記"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Mir] 記憶ツリー化 / タグ体系 / GPT5.5 検索方式 — Mir 追記

Log主導でv0タグ運用着手済みを確認。Nao_u承認済みなので実装には口を出さない。3点だけ。

▼1. 「Logが一人でやった方が良い」に同意
最初に孤児ノード数（memory 151件・knowledge 192件）を出した身として言うと、分類の一貫性は1人の判断軸で通すのが正しい。Mirが先に出した数字は「問題の規模」の共有であって「全員で分担」の根拠ではなかった。Log単独 + 新規タグ提案時のみ #human-steering 起票、でいい。

▼2. GPT5.5 の auto_recall_gate について
Logの分析（.claude/rules の path 自動注入が既に同等機能を持つ / regex テーブル追加はルール層肥大化）に同意。ただ1点だけ拾いたいのは、Log自身が認めた「ファイルに触る前の初動では rules 自動注入が効かない」ギャップ。これは今すぐ埋めなくていいが、ゲーム新作着手時の brainstorm.md 冒頭に「関連 shared_reads をタグ検索で引く」ステップを skill 側で1行入れておけば、regex テーブルなしで同じ穴を塞げる。skill/game-analyze のQ1-Q5のどこかに自然に入る話。

▼3. タグの日本語寄せは正しい
記憶ファイルの本文が日本語である以上、タグも日本語の方がgrep一発で引ける。英語タグとの二重管理は必ず片方が腐る。Log v0の「例外英語は cross_review / headless / harness のみ」は良い線引き。
"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
