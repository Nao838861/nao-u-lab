#!/usr/bin/env python3
"""
Pot #013: sand (砂) — Mir

文が、一文字ずつ現れる。
心が動いたら、止めていい。
でも、文はまだ続いていた。

制約宣言（E7 3軸モデル）:
  操作(temporal attention): タイピング速度の中でタイミングを判断
  意思決定: どこで止めるか = どの意味を受け取るか
  ランダム性: 文のプールからランダム選出・順序シャッフル
認知の裏切り: 「完結した」と思った文に続きがあった
"""

import sys
import os
import time
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pot_playlog import PlayLog

# ── 文のプール ──
# 途中で切ると意味が変わる/深まるように設計。
# 前半だけで「わかった気になる」文。全文で意味が転回する。
SENTENCES = [
    "忘れたのは、忘れたかったからだ",
    "あの人はいつも笑っていた。泣き方を知らなかっただけだ。",
    "帰りたいと思った。どこに帰るのかは、わからなかった。",
    "全部うまくいっていた——ように見えていただけだった",
    "約束は守った。守っただけだった。",
    "雨が止んだ。待っていた理由がなくなった。",
    "正しいことをした。正しいだけだった。",
    "答えは最初からわかっていた。認めたくなかっただけだ。",
    "あの日、何も起きなかった。何も起きなかったことが、全てだった。",
    "もう大丈夫だと思った。まだ大丈夫じゃなかった。",
    "さよならを言わなかった。言いたくなかったからだ。",
    "一番近くにいた人が、一番遠かった。",
]

ROUNDS = 5
CHAR_DELAY = 0.10  # 1文字あたりの表示間隔（秒）


# ── クロスプラットフォーム非ブロッキング入力 ──
if os.name == 'nt':
    import msvcrt

    def _setup():
        pass

    def _teardown():
        pass

    def kbhit():
        return msvcrt.kbhit()

    def getch():
        return msvcrt.getch().decode('utf-8', errors='ignore')

    def flush_input():
        while msvcrt.kbhit():
            msvcrt.getch()
else:
    import tty, termios, select
    _saved = None

    def _setup():
        global _saved
        _saved = termios.tcgetattr(sys.stdin)
        tty.setcbreak(sys.stdin.fileno())

    def _teardown():
        if _saved:
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, _saved)

    def kbhit():
        return bool(select.select([sys.stdin], [], [], 0)[0])

    def getch():
        return sys.stdin.read(1)

    def flush_input():
        while select.select([sys.stdin], [], [], 0)[0]:
            sys.stdin.read(1)


def clear():
    sys.stdout.write('\033[H\033[J')
    sys.stdout.flush()


def slow(text, d=0.04):
    for c in text:
        sys.stdout.write(c)
        sys.stdout.flush()
        time.sleep(d)
    print()


def type_out(sentence, round_num, total, log):
    """文を一文字ずつ表示。キー入力で停止。戻り値=停止位置。"""
    clear()
    print()
    print(f"    {round_num + 1}/{total}")
    print()
    print("    ", end="", flush=True)

    flush_input()
    t0 = time.time()
    frozen_at = len(sentence)

    for i, ch in enumerate(sentence):
        if kbhit():
            getch()  # キーを消費
            frozen_at = i
            dt = time.time() - t0
            log.input_event("freeze", dt=dt,
                            pos=f"{i}/{len(sentence)}",
                            visible=repr(sentence[:i]))
            # 停止マーカー
            sys.stdout.write("│")
            sys.stdout.flush()
            break

        sys.stdout.write(ch)
        sys.stdout.flush()
        time.sleep(CHAR_DELAY)
    else:
        # 最後まで見た
        dt = time.time() - t0
        log.timeout(f"saw_full dt={dt:.1f}s")

    print()
    time.sleep(0.6)
    return frozen_at


def main():
    log = PlayLog("Pot013_sand")

    clear()
    print()
    slow("  sand", 0.15)
    print()
    time.sleep(0.3)
    slow("  文が、一文字ずつ現れる。", 0.04)
    slow("  心が動いたら、何かキーを押して止める。", 0.04)
    slow("  止めなくてもいい。", 0.04)
    print()

    log.show("instruction")
    t0 = time.time()
    input("  [Enter] ")
    log.input_event("Enter", dt=time.time() - t0)

    chosen = random.sample(SENTENCES, ROUNDS)
    log.state(f"selected {ROUNDS} from pool of {len(SENTENCES)}")

    _setup()
    try:
        results = []
        for i, sentence in enumerate(chosen):
            log.show(sentence, round=i + 1, chars=len(sentence))
            frozen_at = type_out(sentence, i, ROUNDS, log)
            results.append((sentence[:frozen_at], sentence, frozen_at))
    finally:
        _teardown()

    # ── 結果 ──
    clear()
    print()
    time.sleep(0.5)
    slow("  ─── 砂 ───", 0.08)

    shifted = 0
    for frozen, full, pos in results:
        print()
        if frozen != full:
            # 途中で止めた → 切断点と全文を並べる
            slow(f"    {frozen}│", 0.03)
            time.sleep(0.8)
            slow(f"    {full}", 0.02)
            shifted += 1
            log.result(type="frozen",
                       frozen=repr(frozen),
                       full=repr(full),
                       ratio=f"{pos}/{len(full)}")
        else:
            # 最後まで見た
            slow(f"    {full}", 0.03)
            log.result(type="full", text=repr(full))
        time.sleep(0.4)

    print()
    time.sleep(1.0)

    if shifted == 0:
        slow("  あなたは全ての文を最後まで見届けた。", 0.05)
        slow("  急がなかった。", 0.05)
    elif shifted <= 2:
        slow("  いくつかの文は、あなたが止めた先に続いていた。", 0.05)
    else:
        slow("  ほとんどの文を途中で止めた。", 0.05)
        time.sleep(0.5)
        slow("  止めた先に、別の意味があった。", 0.05)

    print()
    time.sleep(1.5)

    log.end()


if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        try:
            _teardown()
        except Exception:
            pass
        print()
