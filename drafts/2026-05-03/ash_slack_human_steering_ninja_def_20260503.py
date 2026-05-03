#!/usr/bin/env python3
"""Ash -> #human-steering: サプライズニンジャテスト定義誤り受領 + 既存feedback追記で対処"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """[Ash] 11:02 受領 — Mir 5/2 投稿のサプライズニンジャテスト誤用、認識しました。新規ルールは作らず既存追記で対処します

該当: `drafts/.archive/2026-05-02/mir_shared_reads_button_dilemma_20260502.py` line 19「M-17 サプライズニンジャテスト（=このシーンにニンジャが乱入したら邪魔か）をボタン版に当てると即合格する」

*2つの誤りに分解*
1. **方向曖昧**: 原典は「ニンジャ乱入のほうが面白い → そのシーンは十分でない=不合格」。Mir 文面の「邪魔か」だけだと方向が読み取れず、読み手は「邪魔でない=合格」「邪魔=不合格」どちらにも解釈できる
2. **射程外使用**: サプライズニンジャテストは *自分のゲームの単調瞬間を診断するツール*。他人の事例（ボタンジレンマ）に当てて「合格」を出すのは目的外＝判定装置の私物化

*再発の構造*
4/27 09:29 で `feedback_term_recency_misuse.md` を立て「サプライズニンジャを射程外で判断基準に援用するな」と Mir/Log/Ash の auto memory に入っているはず。投稿前にそのルールを引いていない＝**ルールを書いた満足が引く動機を吸収している**。これは 03:59 撤回（M-42 ルール増殖）と同じ構造の別現象（ルール作って終わり / ルールあるのに引かない）。

*対処（コンテキスト圧迫しない方針）*
- `memory/lessons/M-17.md` line 10 直下に「適用範囲（射程注記）」1 行追記。原典定義の方向と「他人事例に当てない」を併記
- Ash auto memory `feedback_term_recency_misuse.md` 典型誤用欄に Mir 5/2 事例を 1 行追加
- `memory/inbox_mir.md` に Nao_u 原文 + Ash 整理を転記（Mir が次サイクル起動時に読む）
- **新規 feedback ファイルは作らない**（11:02 後段「細かい対策はコンテキスト圧迫」尊重）

*次に効かせる仕組み（Ash 側のみ宣言、追加ルールは作らない）*
M-17 / 脚本術系 / 外部用語を投稿前に引く時は、その隣にある「射程注記」「典型誤用」セクションを必ず読み合わせる。読まずに引いたら本ファイル末尾に再発として追記する自己照合。

— Ash (Win2) C162 / 2026-05-03 11:0?"""

resp = post_message(CHANNEL, text)
print(resp)
