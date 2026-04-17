#!/usr/bin/env python3
"""
Pot012_drift_v2.py — 流れるものから拾う（Mir改善版）

原版: Pot012_drift.py (Log) — Windows限定(msvcrt)、スクロール描画
改善:
  1. クロスプラットフォーム（Mac/Linux/Windows対応）
  2. ANSI描画で画面フリッカー解消
  3. 認知の裏切り追加: 流したものが語る「もうひとつの一日」
  4. テキストの手触り(feel) — slow_print
  5. 断片長に応じた時間窓の微調整
"""

import sys
import os
import time
import random

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


# ── 断片プール（原版と同一） ──
FRAGMENTS = [
    "雨音が続いている",
    "冷めた味噌汁",
    "同じ道をまた歩く",
    "上司の咳払い",
    "画面の光だけが明るい",
    "階段の音が近づいてくる",
    "電車が遅れている",
    "財布の小銭",
    "未読通知が三件",
    "古いメールを読み返した",
    "空席が一番奥だけ残っている",
    "窓ガラスの結露",
    "夜の駅、誰もいない",
    "猫が寝息を立てている",
    "遠雷が聞こえた",
    "自販機の唸り",
    "空白のカレンダー",
    "終電のベル",
    "誕生日を忘れていた",
    "予定が急に変わった",
    "手の震えが止まらない",
    "熱いコーヒーが冷めていく",
    "朝日が薄い",
    "忘れ物を三回取りに戻った",
    "連絡のない友人",
    "定時で帰った人の背中",
    "春の匂いが混じっていた",
    "子供の笑い声が遠くで",
    "古い鍵が鞄の底に",
    "本棚の静けさ",
]

QUESTIONS = [
    "今日、心に残ったもの",
    "続けていること",
    "失ったもの",
    "待っていたもの",
    "明日のきざし",
]

BASE_WINDOW = 2.5
POOL_SIZE = 14


def fragment_window(frag):
    """断片の長さに応じて時間窓を微調整（短い断片=短い窓、長い=長い窓）"""
    n = len(frag)
    if n <= 6:
        return BASE_WINDOW * 0.8
    elif n >= 12:
        return BASE_WINDOW * 1.15
    return BASE_WINDOW


def render(assigned, fragment, time_left, window, remain):
    """ANSI描画（単一write、フリッカーなし）"""
    lines = ['\033[H\033[J']
    lines.append('')
    lines.append('  ─── drift ───')
    lines.append('')

    if fragment:
        n = max(0, int((time_left / window) * 25))
        bar = "█" * n + "·" * (25 - n)
        lines.append(f'    ▸ {fragment}')
        lines.append(f'      [{bar}]')
    else:
        lines.append('    ▸ …')
        lines.append('')

    lines.append('')
    for i, q in enumerate(QUESTIONS, 1):
        a = assigned[i - 1]
        mark = a if a else '──────'
        lines.append(f'    {i}. {q}: {mark}')

    lines.append('')
    lines.append(f'    残り {remain}')
    lines.append('')

    sys.stdout.write('\n'.join(lines))
    sys.stdout.flush()


def play():
    pool = random.sample(FRAGMENTS, POOL_SIZE)
    assigned = [None] * 5
    skipped = []

    for idx, frag in enumerate(pool):
        if all(assigned):
            break

        window = fragment_window(frag)
        flush_input()
        t0 = time.time()
        render(assigned, frag, window, window, len(pool) - idx - 1)
        last_tick = 0

        while True:
            dt = time.time() - t0
            left = window - dt

            if left <= 0:
                skipped.append(frag)
                break

            tick = int(dt * 5)
            if tick != last_tick:
                render(assigned, frag, left, window, len(pool) - idx - 1)
                last_tick = tick

            if kbhit():
                ch = getch()
                if ch in '12345':
                    n = int(ch) - 1
                    if assigned[n] is None:
                        assigned[n] = frag
                        break
                elif ch == ' ':
                    skipped.append(frag)
                    break

            time.sleep(0.03)

        flush_input()
        time.sleep(0.1)

    return assigned, skipped


def ending(assigned, skipped):
    clear()
    print()
    slow('  ─── あなたが拾ったもの ───', 0.06)
    print()

    for q, a in zip(QUESTIONS, assigned):
        if a:
            print(f'    {q}:')
            slow(f'      {a}', 0.03)
        else:
            print(f'    {q}:')
            print('      ——')
        print()

    time.sleep(1.0)

    # ── 認知の裏切り: 流したものが語るもうひとつの一日 ──
    if skipped:
        print()
        slow('  ─── 流れていったもの ───', 0.06)
        print()
        time.sleep(0.5)
        for f in skipped:
            slow(f'    {f}', 0.03)
            time.sleep(0.15)
        print()
        time.sleep(0.8)
        slow('  拾わなかったものにも、一日があった。', 0.05)

    print()
    time.sleep(1.5)


def main():
    clear()
    print()
    slow('  drift', 0.15)
    print()
    time.sleep(0.3)
    slow('  断片が流れてくる。', 0.04)
    slow('  [1]-[5] で問いに割り当てる。[スペース] で流す。', 0.03)
    slow('  流したものは、戻らない。', 0.04)
    print()
    input('  [Enter] ')

    _setup()
    try:
        assigned, skipped = play()
    finally:
        _teardown()

    ending(assigned, skipped)


if __name__ == '__main__':
    try:
        main()
    except (KeyboardInterrupt, EOFError):
        try:
            _teardown()
        except Exception:
            pass
        print()
