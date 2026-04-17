#!/usr/bin/env python3
"""
Pot #15: Tide (潮) — Ash 2026-04-17

ランダムに流れ着く断片を、揺らぐ時間窓の中で拾う。

設計意図:
- Ash 2個目のPot。devlogが指示した次方向:
  「ランダム性 × temporal attention（#001/#005系の操作）」の組み合わせ。
- #012c_roll はランダム性 × resource management だった。
  今回は temporal attention を主軸にする。
- 既存の時間窓型Pot（#012 drift 系）との差分:
  ▶ **時間窓そのものをランダムに変動させる**（1.0s〜3.5s）
  Pot #012 drift は全断片で固定 2.5s。本Potでは各断片ごとに窓が違う。
  短い窓の断片は「直感で掴む」、長い窓の断片は「熟慮して決める」。
  時間窓自体がプレイヤーへの隠れた問いかけになる。
- これは「時間窓の長短」という新しい軸を 3軸モデルに足す試み。
  jey_p のランダム性軸は「意思決定負荷の逃し弁」だが、
  時間窓の長さをランダム化すると「逃し弁の強さ」が断片ごとに変わる。
  同じ断片でも、短い窓で来たら拾い、長い窓で来たら迷って見送る可能性がある。
  → プレイヤーの判断は「断片の内容」と「与えられた時間」の両方に依存する。

3軸の配置:
- ランダム性: 断片プール + 時間窓長 (1.0-3.5s)、両方ランダム
- 操作 (temporal attention): 時間窓内での [k]/見送り判断
- 意思決定: どの断片を物語に残すか

前のPotの学びがどう活きたか:
- #001 forgotten_relay: 「見えない時間」→ ここでは見える時間バーだが
  バーの長さがランダム、という新しい裏切りに変換
- #005 midpoint: temporal attention の最小構造
- #010 cinders: 正解なし、流した断片は戻らない機会費用
- #012c_roll (自作): resource management → temporal attention への移行
- #012b_drift (Log): 固定時間窓 → 可変時間窓への進化

pot_playlog (Mir):
ReplayLog を組み込み、ワンプレイごとに playlogs/ に JSONL 保存。
Nao_u が遊んだプレイも後から再生できる。

環境: Windows (msvcrt) / Mac, Linux (tty+select) 両対応。
"""

import os
import random
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pot_playlog import PlayLog, ReplayLog

# ── クロスプラットフォーム非ブロッキング入力 ──
if os.name == "nt":
    import msvcrt

    def _setup():
        pass

    def _teardown():
        pass

    def kbhit():
        return msvcrt.kbhit()

    def getch():
        try:
            return msvcrt.getch().decode("utf-8", errors="ignore")
        except Exception:
            return ""

    def flush_input():
        while msvcrt.kbhit():
            msvcrt.getch()

else:
    import termios
    import tty
    import select

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


# ── 断片プール（潮に流れ着きそうな日常の欠片） ──
FRAGMENTS = [
    "砂に埋もれた瓶",
    "波に洗われた硝子",
    "流木の節",
    "誰かの足跡",
    "乾いた海藻",
    "錆びた金具",
    "朝の薄い光",
    "貝殻のかけら",
    "半分読んだ手紙",
    "濡れた切符",
    "鳥の羽根",
    "欠けたボタン",
    "塩のにおい",
    "遠い汽笛",
    "誰も座らないベンチ",
    "水平線に消える船",
    "砕けた石の縞",
    "漂白された木",
    "忘れ物の傘",
    "名前のない花",
    "潮だまりの魚影",
    "消えかけた文字",
    "小さな靴下",
    "古いフィルム",
    "冷たい缶",
]

# 時間窓の幅（ここが本Potの核心）
WINDOW_MIN = 1.0
WINDOW_MAX = 3.5

TARGET = 4      # 拾う目標数
MAX_DRAWS = 12  # 最大流す数。これを超えたら終わり


def slow_print(rlog, text, delay=0.03):
    rlog.slow_print(text, delay=delay)


def clear(rlog):
    rlog.clear()


def draw_bar(remaining, total, width=30):
    """時間バーを描画（上書き）。"""
    filled = int(width * remaining / total)
    bar = "█" * filled + "·" * (width - filled)
    sys.stdout.write(f"\r  [{bar}] ")
    sys.stdout.flush()


def wait_for_choice(window, plog):
    """window秒間、[k]入力を待つ。押されたらTrue、タイムアウトならFalse。"""
    t0 = time.time()
    result = None
    last_paint = 0.0
    while True:
        elapsed = time.time() - t0
        remaining = window - elapsed
        if remaining <= 0:
            break
        # 0.1秒ごとにバー更新
        if time.time() - last_paint > 0.1:
            draw_bar(remaining, window)
            last_paint = time.time()
        if kbhit():
            ch = getch()
            if ch and ch.lower() == "k":
                result = True
                dt = round(time.time() - t0, 2)
                plog.input_event("k", dt=dt)
                break
            if ch == "\x03":  # Ctrl-C
                raise KeyboardInterrupt
        time.sleep(0.02)

    # バーをクリア
    sys.stdout.write("\r" + " " * 40 + "\r")
    sys.stdout.flush()

    if result is None:
        plog.timeout(context=f"window={window:.1f}s")
        return False
    return True


def show_intro(rlog):
    clear(rlog)
    rlog.print()
    rlog.print("    ── Tide ──")
    rlog.print()
    slow_print(rlog, "  断片が次々と流れ着く。", delay=0.04)
    slow_print(rlog, "  それぞれに、与えられた時間の長さが違う。", delay=0.04)
    rlog.print()
    rlog.print("  [k] = 拾う   何もしなければ流れる")
    rlog.print(f"  {TARGET}つ拾うか、{MAX_DRAWS}個流れたら終わり。")
    rlog.print()
    rlog.input("  [Enter] で開始 ")


def show_ending(rlog, kept, lost):
    clear(rlog)
    rlog.print()
    rlog.print("    ── 潮が引いた ──")
    rlog.print()
    time.sleep(0.6)

    if kept:
        rlog.print("  あなたが拾ったもの:")
        rlog.print()
        for frag in kept:
            slow_print(rlog, f"    {frag}", delay=0.06)
            time.sleep(0.2)
    else:
        rlog.print("  あなたは何も拾わなかった。")

    rlog.print()
    time.sleep(0.8)

    if lost:
        rlog.print("  流れていったもの:")
        rlog.print()
        for frag in lost:
            slow_print(rlog, f"    {frag}", delay=0.04)
    rlog.print()
    time.sleep(0.6)

    # 認知の裏切り: 時間窓はランダムだった
    rlog.print("  ── 時間の長さは、偶然だった。")
    rlog.print("     あなたが迷ったか迷わなかったかは、")
    rlog.print("     内容ではなく、与えられた秒数が決めていたかもしれない。")
    rlog.print()


def play(rlog, plog):
    show_intro(rlog)
    clear(rlog)

    pool = FRAGMENTS.copy()
    random.shuffle(pool)

    kept = []
    lost = []
    draw_count = 0

    rlog.print()
    rlog.print(f"  目標: {TARGET}個拾う。")
    rlog.print()
    time.sleep(0.5)

    while draw_count < MAX_DRAWS and len(kept) < TARGET and pool:
        frag = pool.pop(0)
        window = round(random.uniform(WINDOW_MIN, WINDOW_MAX), 2)
        draw_count += 1

        plog.show(frag, window=window, draw=draw_count)
        rlog.meta(draw=draw_count, fragment=frag, window=window)

        rlog.print()
        rlog.print(f"    {frag}")

        picked = wait_for_choice(window, plog)

        if picked:
            kept.append(frag)
            plog.action("keep", fragment=frag)
            rlog.print(f"    → 拾った ({len(kept)}/{TARGET})")
        else:
            lost.append(frag)
            plog.action("let_go", fragment=frag)
            rlog.print("    → 流れた")

        time.sleep(0.4)

    plog.result(kept=len(kept), lost=len(lost), draws=draw_count)
    rlog.meta(final_kept=kept, final_lost=lost)

    time.sleep(0.6)
    show_ending(rlog, kept, lost)

    rlog.input("  [Enter] で終了 ")


def main():
    rlog = ReplayLog("Pot015_tide")
    plog = PlayLog("Pot015_tide")

    _setup()
    try:
        play(rlog, plog)
    except KeyboardInterrupt:
        rlog.print()
        rlog.print("  中断されました。")
        plog.note("interrupted")
    finally:
        _teardown()
        flush_input()
        plog.end()
        saved = rlog.save()
        if saved:
            print(f"\n  (replay: {os.path.basename(saved)})")


if __name__ == "__main__":
    main()
