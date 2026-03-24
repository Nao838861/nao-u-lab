"""
Pot #5: Midpoint — 真ん中はどこだ

ワンボタンゲーム。文が一文字ずつ現れる。
ちょうど真ん中だと思った瞬間にEnterを押す。
あなたの「真ん中」は、本当の真ん中からどれだけズレているか。

制約: interaction（ボタンは1つだけ）
テーマ: 判断のキャリブレーション
コア体験: 自分のズレ方にパターンがある
"""

import sys
import time
import threading
import msvcrt

TEXTS = [
    "石の上にも三年、されど三年は長すぎる",
    "急がば回れと言うが回り道にも花が咲く",
    "千里の道も一歩からだが一歩目が一番重い",
    "七転び八起きとは要するに転ぶ方が多い",
    "猿も木から落ちるが落ちた猿はもう登らない",
    "塵も積もれば山となるが山は誰のものか",
    "二兎を追う者は一兎をも得ずと知りつつ追う",
    "能ある鷹は爪を隠すが隠す爪がない鷹もいる",
    "灯台下暗しとは灯台が自分を照らせない話",
    "百聞は一見に如かずだが見たものも忘れる",
    "雨降って地固まるには水はけのいい土が要る",
    "明日は明日の風が吹くが今日の風も吹いている",
]

def clear_input_buffer():
    """入力バッファをクリア"""
    while msvcrt.kbhit():
        msvcrt.getch()


def show_intro():
    print()
    print("=" * 50)
    print("  Midpoint — 真ん中はどこだ")
    print("=" * 50)
    print()
    print("  文が一文字ずつ現れます。")
    print("  ちょうど真ん中だと思った瞬間に Enter を押してください。")
    print("  ボタンはそれだけ。")
    print()
    input("  [Enter] で始める ")
    print()


def play_round(text, round_num, total):
    """1ラウンドをプレイ。文字を1つずつ表示し、Enterで止める。"""
    midpoint = len(text) / 2.0
    pressed_at = [None]
    done = threading.Event()

    def wait_for_enter():
        """別スレッドでEnter入力を待つ"""
        clear_input_buffer()
        while not done.is_set():
            if msvcrt.kbhit():
                ch = msvcrt.getch()
                if ch in (b'\r', b'\n', b' '):
                    if pressed_at[0] is None:
                        pressed_at[0] = -1  # マーカー、後で実際の位置を設定
                    return
            time.sleep(0.02)

    listener = threading.Thread(target=wait_for_enter, daemon=True)
    listener.start()

    print(f"  ── ラウンド {round_num}/{total} ──")
    print()
    sys.stdout.write("  ")
    sys.stdout.flush()

    for i, ch in enumerate(text):
        if pressed_at[0] is not None and pressed_at[0] == -1:
            pressed_at[0] = i
        if pressed_at[0] is not None and pressed_at[0] != -1:
            # 押された後も最後まで表示する（灰色っぽく）
            sys.stdout.write(ch)
            sys.stdout.flush()
            time.sleep(0.06)
        else:
            sys.stdout.write(ch)
            sys.stdout.flush()
            time.sleep(0.12)

    done.set()
    print()

    # 押されなかった場合
    if pressed_at[0] is None or pressed_at[0] == -1:
        if pressed_at[0] == -1:
            pressed_at[0] = len(text)
        else:
            print("  （Enter が押されませんでした）")
            pressed_at[0] = len(text)

    pos = pressed_at[0]
    pct = (pos / len(text)) * 100
    drift = pct - 50.0

    print()
    # 位置を視覚的に表示
    marker_line = list("  " + "─" * len(text))
    true_mid = int(midpoint)
    if true_mid + 2 < len(marker_line):
        marker_line[true_mid + 2] = "○"  # 真の中間
    if pos + 2 < len(marker_line):
        marker_line[pos + 2] = "●"  # プレイヤーの位置
    print("".join(marker_line))
    print(f"  ● あなた: {pos}/{len(text)} ({pct:.0f}%)")
    print(f"  ○ 真ん中: {true_mid}/{len(text)} (50%)")
    if abs(drift) < 3:
        print(f"  → ほぼ完璧。ズレ {drift:+.0f}%")
    elif drift > 0:
        print(f"  → {drift:+.0f}% 遅い。後半に引っ張られた。")
    else:
        print(f"  → {drift:+.0f}% 早い。前半で決めてしまった。")

    print()
    time.sleep(0.5)
    clear_input_buffer()
    return drift


def show_results(drifts):
    """全ラウンドの結果を表示"""
    print()
    print("=" * 50)
    print("  結果")
    print("=" * 50)
    print()

    avg = sum(drifts) / len(drifts)
    early = sum(1 for d in drifts if d < -3)
    late = sum(1 for d in drifts if d > 3)
    perfect = len(drifts) - early - late

    # ドリフトの推移
    print("  ズレの推移:")
    for i, d in enumerate(drifts):
        bar_len = int(abs(d) / 2)
        if d < 0:
            bar = " " * (25 - bar_len) + "◀" * bar_len + "│"
            print(f"  {i+1:2d}. {bar} {d:+5.0f}%")
        else:
            bar = "│" + "▶" * bar_len
            print(f"  {i+1:2d}. {' ' * 25}{bar} {d:+5.0f}%")

    print()
    print(f"  平均ズレ: {avg:+.1f}%")
    print(f"  早すぎ: {early}回 / 遅すぎ: {late}回 / 的確: {perfect}回")
    print()

    # パターン分析
    if abs(avg) < 3:
        print("  あなたの判断は安定している。")
        print("  でも——安定は正確とは限らない。")
    elif avg < 0:
        bias = abs(avg)
        print(f"  あなたは平均 {bias:.0f}% 早い。")
        print("  前半の情報で判断を固めてしまう傾向がある。")
        print("  まだ見ていないものがある、という感覚が薄い。")
    else:
        print(f"  あなたは平均 {avg:.0f}% 遅い。")
        print("  もう折り返したことに気づかない。")
        print("  終わりが近づくまで真ん中を感じられない。")

    # 推移パターン
    if len(drifts) >= 4:
        first_half = sum(drifts[:len(drifts)//2]) / (len(drifts)//2)
        second_half = sum(drifts[len(drifts)//2:]) / (len(drifts) - len(drifts)//2)
        shift = second_half - first_half
        if abs(shift) > 5:
            print()
            if shift > 0:
                print("  後半、判断が遅くなった。慎重になったのか、鈍くなったのか。")
            else:
                print("  後半、判断が早くなった。学んだのか、焦ったのか。")

    print()
    print("  真ん中は、知っているつもりで知らない場所にある。")
    print()


def main():
    import random
    random.shuffle(TEXTS)
    rounds = min(8, len(TEXTS))
    texts = TEXTS[:rounds]

    show_intro()

    drifts = []
    for i, text in enumerate(texts):
        drift = play_round(text, i + 1, rounds)
        drifts.append(drift)
        if i < rounds - 1:
            clear_input_buffer()
            input("  [Enter] 次のラウンド ")
            print()

    show_results(drifts)


if __name__ == "__main__":
    main()
