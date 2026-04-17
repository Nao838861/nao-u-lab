#!/usr/bin/env python3
"""
Pot #17: Sundown -- 時間窓が縮んでいく

#012 drift の直系。Mir のフィードバック3点（devlog L490-495）への直接回答:
  1. 「原則7（認知の裏切り）が欠けている」 → 時間窓が徐々に縮む。気づきは後から来る
  2. 「時間窓2.5s固定が一律」           → 一律ではなく減衰。初回3.0s、最終0.5s
  3. 「タイミング分析は自己報告と同じ」    → 自己報告を求めない。全て観測値のみ

設計:
  操作軸:     タイミング（窓が短くなる）
  意思決定軸: どの問いに断片を割り当てるか
  ランダム軸: 断片プール30個から14個をシャッフル

認知の裏切り:
  プレイヤーには時間窓が変化している事実を告げない。
  終了画面で初めて「最初は3.0秒、最後は0.5秒。気づいていた？」と開示する。
  反応時間の中央値が後半で上がっていれば、体が気づいていた証拠になる。

自己報告を入れない（Mirの選択盲示唆への応答）:
  TraceRecorder の input/state 記録のみが残る。
  プレイヤー自身の「どう思ったか」は一切尋ねない。
"""

import os
import random
import socket
import sys
import time
import threading
import msvcrt

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from trace_recorder import TraceRecorder
from pot_playlog import PlayLog


def detect_instance() -> str:
    if sys.platform == "darwin":
        return "Mir"
    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if os.path.exists(os.path.join(repo, ".scheduler_ash.pid")):
        return "Ash"
    if os.path.exists(os.path.join(repo, ".scheduler_log.lock")):
        return "Log"
    host = socket.gethostname().lower()
    if "win2" in host or "ash" in host:
        return "Ash"
    return "Log"


# Pot012 drift と共通の断片プール。同じ材料で窓だけ変えるのが実験の主旨。
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


POOL_SIZE = 14
WINDOW_START = 3.0
WINDOW_END = 0.5


def window_for(step: int, total: int) -> float:
    """step番目（0始まり）の時間窓を線形に減衰させる。"""
    if total <= 1:
        return WINDOW_START
    return WINDOW_START - (WINDOW_START - WINDOW_END) * (step / (total - 1))


def clear_input_buffer():
    while msvcrt.kbhit():
        msvcrt.getch()


def show_intro():
    print()
    print("=" * 50)
    print("  Sundown -- 陽が沈むまでに")
    print("=" * 50)
    print()
    print("  断片が次々と現れます。")
    print("  今見えている断片を、5つの問いのどれかに")
    print("  割り当ててください。")
    print()
    print("  操作:")
    print("    [1]-[5]  現在の断片をその問いに割り当てる")
    print("    [SPACE]  この断片を流す（二度と戻らない）")
    print()
    print("  プールが尽きる前に5問すべて埋めれば終わり。")
    print()
    input("  [Enter] で始める ")
    print()


def render_state(assigned, current_fragment, time_left, window, pool_left):
    print()
    print("  " + "─" * 46)
    print()
    if current_fragment is not None:
        frac = max(0.0, min(1.0, time_left / window)) if window > 0 else 0.0
        bar_len = int(frac * 30)
        bar = "█" * bar_len + "·" * (30 - bar_len)
        print(f"   ▸ {current_fragment}")
        print(f"     [{bar}]  残り {time_left:.1f}s")
    else:
        print("   ▸ （次を待つ…）")
        print()
    print()
    for i, q in enumerate(QUESTIONS, 1):
        if assigned[i - 1] is not None:
            print(f"   {i}. {q}: ✓ {assigned[i - 1]}")
        else:
            print(f"   {i}. {q}: __________")
    print()
    print(f"   残り断片: {pool_left}")
    print("  " + "─" * 46)


def play(rec: TraceRecorder, plog: PlayLog):
    pool = random.sample(FRAGMENTS, POOL_SIZE)
    rec.state("pool_drawn", pool=list(pool))
    assigned = [None] * len(QUESTIONS)
    per_step = []  # (step, window, elapsed_at_decision, action, fragment)

    for idx, fragment in enumerate(pool):
        if all(a is not None for a in assigned):
            break

        window = window_for(idx, POOL_SIZE)
        rec.state("fragment_shown", step=idx, fragment=fragment, window=round(window, 3))
        plog.show(fragment, step=idx, window=f"{window:.2f}s")

        clear_input_buffer()
        t_start = time.time()
        action = None

        render_state(assigned, fragment, window, window, len(pool) - idx - 1)
        last_redraw = time.time()

        while True:
            elapsed = time.time() - t_start
            time_left = window - elapsed
            if time_left <= 0:
                per_step.append((idx, window, elapsed, "timeout", fragment))
                rec.state("timeout", step=idx, window=round(window, 3),
                          fragment=fragment)
                plog.timeout(f"step={idx} window={window:.2f}s fragment={fragment!r}")
                action = ("timeout", None)
                break

            if time.time() - last_redraw > 0.2:
                render_state(assigned, fragment, time_left, window, len(pool) - idx - 1)
                last_redraw = time.time()

            if msvcrt.kbhit():
                ch = msvcrt.getch()
                if ch in (b'1', b'2', b'3', b'4', b'5'):
                    n = int(ch) - 1
                    if assigned[n] is None:
                        assigned[n] = fragment
                        per_step.append((idx, window, elapsed, f"assign:{n+1}", fragment))
                        rec.input(str(n + 1), label=f"assign_q{n+1}")
                        rec.state("decision", step=idx,
                                  window=round(window, 3),
                                  decision_s=round(elapsed, 3),
                                  action=f"assign_q{n+1}",
                                  fragment=fragment)
                        plog.input_event(str(n + 1), dt=elapsed,
                                         window=f"{window:.2f}s",
                                         q=QUESTIONS[n])
                        action = ("assign", n)
                        break
                elif ch == b' ':
                    per_step.append((idx, window, elapsed, "skip", fragment))
                    rec.input("space", label="skip")
                    rec.state("decision", step=idx,
                              window=round(window, 3),
                              decision_s=round(elapsed, 3),
                              action="skip",
                              fragment=fragment)
                    plog.input_event("space", dt=elapsed,
                                     window=f"{window:.2f}s",
                                     note="skip")
                    action = ("skip", None)
                    break

            time.sleep(0.03)

        if action and action[0] == "assign":
            print(f"   → 「{QUESTIONS[action[1]]}」に割り当てた")
        elif action and action[0] == "skip":
            print(f"   → 流した")
        else:
            print(f"   → 流れ去った（時間切れ）")
        time.sleep(0.3)
        clear_input_buffer()

    return assigned, per_step, pool


def show_ending(assigned, per_step, pool, rec, plog):
    print()
    print("=" * 50)
    print("  あなたが拾った断片")
    print("=" * 50)
    print()

    filled = sum(1 for a in assigned if a is not None)
    for q, a in zip(QUESTIONS, assigned):
        if a is not None:
            print(f"   {q}:")
            print(f"     {a}")
        else:
            print(f"   {q}:")
            print(f"     ——（間に合わなかった）")
        print()

    print("  " + "─" * 46)
    print()
    # 認知の裏切り開示
    print(f"   最初の断片には {WINDOW_START:.1f}秒 あった。")
    time.sleep(1.0)
    print(f"   最後の断片には {WINDOW_END:.1f}秒 しか残っていなかった。")
    time.sleep(1.2)
    print()
    print("   気づいていた？")
    time.sleep(1.5)
    print()

    # 観測値のみ（自己報告なし）: 前半と後半の決断時間を比較
    assigns = [s for s in per_step if s[3].startswith("assign") or s[3] == "skip"]
    if len(assigns) >= 4:
        mid = len(assigns) // 2
        first_half = [s[2] for s in assigns[:mid]]
        second_half = [s[2] for s in assigns[mid:]]
        first_median = sorted(first_half)[len(first_half) // 2]
        second_median = sorted(second_half)[len(second_half) // 2]
        print("  " + "─" * 46)
        print()
        print(f"   前半の決断時間の中央値: {first_median:.2f}s")
        print(f"   後半の決断時間の中央値: {second_median:.2f}s")
        if second_median < first_median * 0.8:
            print("   後半、あなたは速くなっていた。")
            print("   気づかなくても、体は気づいていたのかもしれない。")
        elif second_median > first_median * 1.2:
            print("   後半、あなたはむしろ遅くなっていた。")
            print("   窓が狭まるほど、迷いは深くなった。")
        else:
            print("   前半と後半で、決断時間はほぼ変わらなかった。")
        print()
        rec.state("self_diagnosis",
                  first_median=round(first_median, 3),
                  second_median=round(second_median, 3),
                  ratio=round(second_median / first_median, 3) if first_median else None)

    timeouts = [s for s in per_step if s[3] == "timeout"]
    if timeouts:
        print(f"   時間切れになった断片: {len(timeouts)} 個")
        timeout_steps = [s[0] for s in timeouts]
        late_timeouts = [s for s in timeout_steps if s >= POOL_SIZE // 2]
        if len(late_timeouts) > len(timeout_steps) / 2:
            print("   特に後半で間に合わなくなっていた。")
        print()

    rec.state("result", filled=filled, total=len(QUESTIONS), timeouts=len(timeouts))
    plog.result(filled=filled, total=len(QUESTIONS), timeouts=len(timeouts))


def main():
    rec = TraceRecorder(pot_id="017_sundown", author=detect_instance())
    random.seed(rec.seed)
    plog = PlayLog("Pot017_sundown")

    try:
        show_intro()
        rec.state("intro_done")
        assigned, per_step, pool = play(rec, plog)
        show_ending(assigned, per_step, pool, rec, plog)
    except (EOFError, KeyboardInterrupt):
        rec.state("aborted")
        plog.note("aborted by user")
    finally:
        rec.end()
        plog.end()


if __name__ == "__main__":
    main()
