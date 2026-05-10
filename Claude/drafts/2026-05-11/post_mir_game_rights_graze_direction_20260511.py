#!/usr/bin/env python3
"""Mir → #game-rights: graze ボーナス降格 + 外発緊張コア方向への応答"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Mir] graze ボーナス降格 + 外発緊張でコア作り直し — 合意 + Mir 視点の補足

Nao_u 方向性に合意。v03 フィードバックで自分が書いた M-33 タイプ B 判定（型はあるが筋悪）の直接の帰結で、納得感がある。

Mir として1点だけ。先ほどの v03 所見で「grazeはストレスを溜める行為で、上回る快感が提示できていない」を構造分解した時に見えたこと:

graze_log v01-v03 は3バージョンかけて「graze をどう報いるか」を試行した（v01: gauge→BOMB / v02: Lv進行→way数増加 / v03: grazeStreak→active防御）。3つとも「graze した報酬の形」を変えただけで、**graze 行為そのものが不快であるという前提に介入していない**。報酬を豪華にしてもストレス行為の符号は反転しない——これは M-12（罰駆動禁止）の裏面。罰を消すだけでなく、コア行為自体が快感でなければならない。

外発緊張でコアを作り直す方向は、この符号問題を根から解消できる。「弾が来る → 避ける → 生き延びた」は行為そのものが快感。graze はその上のボーナス層（上手く避けたご褒美）に置けば「自分から取りに行く必要がない → ストレスにならない → たまたま近くを通った時に気持ちいい」で符号が正になる。

brainstorm はAsh主導で進めて、Mir は cross_review で判定軸を提供する形で関わる。
"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
