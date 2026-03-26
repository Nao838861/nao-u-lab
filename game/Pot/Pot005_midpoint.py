"""
Pot #5: Midpoint -- 真ん中はどこだ

ワンボタンゲーム。文が一文字ずつ現れる。
ちょうど真ん中だと思った瞬間にEnterを押す。
あなたの「真ん中」は、本当の真ん中からどれだけズレているか。

制約: interaction（ボタンは1つだけ）
テーマ: 判断のキャリブレーション
コア体験: 自分のズレ方にパターンがある

v2: テキスト長を10-45文字にばらけさせ、純タイミング戦略を壊す。
テキストの内容が時間感覚を歪ませる装置になる。
"""

import sys
import time
import threading
import msvcrt
import random

# 短い文（≤14文字）: 即決を強いる。読み切る前に判断が要る
TEXTS_SHORT = [
    "逃げた魚は大きい",              # 8
    "嵐の前は静かだった",             # 9
    "回り道には花がある",             # 9
    "正解は一つではない",             # 9
    "沈黙にも種類がある",             # 9
    "見えないものは怖い",             # 9
    "急がなければ回らない",            # 10
    "笑う門に来るのは福だけか",         # 12
]

# 中くらいの文（15-24文字）: 意味の転換点で惑う
TEXTS_MEDIUM = [
    "石の上にも三年、されど三年は長すぎる",          # 18
    "七転び八起きとは要するに転ぶ方が多い",          # 18
    "猿も木から落ちるが落ちた猿はもう登らない",       # 20
    "百聞は一見に如かずだが見たものも忘れる",         # 19
    "塵も積もれば山となるが山は誰のものか",          # 18
    "二兎を追う者は一兎をも得ずと知りつつ追う",       # 20
    "能ある鷹は爪を隠すが隠す爪がない鷹もいる",      # 20
    "灯台下暗しとは灯台が自分を照らせない話",        # 19
]

# 長い文（25文字以上）: じっくり読める。体感の中間点が遠い
TEXTS_LONG = [
    "千里の道も一歩からだが一歩目が重くて二歩目も重くて三歩目で景色が変わる",                     # 33
    "明日は明日の風が吹くと十年言い聞かせたが風向きはずっと同じだった気がする",                    # 34
    "急がば回れと言うが回り道の先にあったものは誰も教えてくれなかったし聞いた者もいなかった",          # 38
    "二兎を追う者は一兎をも得ないが追わない者は兎がいることすら知らないまま畑を耕している",            # 38
    "雨降って地固まると言うが固まるまでに泥に足を取られた人数を数えた者はいない",                  # 35
    "能ある鷹は爪を隠す。だが爪を見せた瞬間に鷹はただの鳥に見えてしまうし本人もそう思い始める",        # 39
]


def select_round_texts(n=8):
    """短・中・長をバランスよく混ぜてn問選ぶ"""
    short = random.sample(TEXTS_SHORT, min(3, len(TEXTS_SHORT)))
    medium = random.sample(TEXTS_MEDIUM, min(3, len(TEXTS_MEDIUM)))
    long_ = random.sample(TEXTS_LONG, min(2, len(TEXTS_LONG)))
    pool = short + medium + long_
    random.shuffle(pool)
    return pool[:n]


def length_category(text):
    """テキストの長さカテゴリを返す"""
    n = len(text) if isinstance(text, str) else text
    if n <= 14:
        return "短"
    elif n <= 24:
        return "中"
    else:
        return "長"


def clear_input_buffer():
    """入力バッファをクリア"""
    while msvcrt.kbhit():
        msvcrt.getch()


def show_intro():
    print()
    print("=" * 50)
    print("  Midpoint -- 真ん中はどこだ")
    print("=" * 50)
    print()
    print("  文が一文字ずつ現れます。")
    print("  ちょうど真ん中だと思った瞬間に Enter を押してください。")
    print("  ボタンはそれだけ。")
    print()
    print("  文の長さはまちまちです。")
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
            # 押された後も最後まで表示する（速度を上げて）
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
    # 位置を視覚的に表示（テキスト長に応じてスケーリング）
    display_width = min(len(text), 40)
    scale = display_width / len(text)
    marker_line = list("  " + "─" * display_width)
    true_mid_disp = int(midpoint * scale)
    pos_disp = int(pos * scale)
    if true_mid_disp + 2 < len(marker_line):
        marker_line[true_mid_disp + 2] = "○"  # 真の中間
    if pos_disp + 2 < len(marker_line):
        marker_line[pos_disp + 2] = "●"  # プレイヤーの位置
    print("".join(marker_line))
    cat = length_category(text)
    print(f"  ● あなた: {pos}/{len(text)} ({pct:.0f}%)  [{cat}]")
    print(f"  ○ 真ん中: {int(midpoint)}/{len(text)} (50%)")
    if abs(drift) < 3:
        print(f"  → ほぼ完璧。ズレ {drift:+.0f}%")
    elif drift > 0:
        print(f"  → {drift:+.0f}% 遅い。後半に引っ張られた。")
    else:
        print(f"  → {drift:+.0f}% 早い。前半で決めてしまった。")

    print()
    time.sleep(0.5)
    clear_input_buffer()
    return drift, len(text)


def show_results(results):
    """全ラウンドの結果を表示。results = [(drift, text_len), ...]"""
    drifts = [r[0] for r in results]
    lengths = [r[1] for r in results]

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
    for i, (d, tl) in enumerate(results):
        bar_len = int(abs(d) / 2)
        cat = length_category(tl)
        if d < 0:
            bar = " " * (25 - bar_len) + "<" * bar_len + "|"
            print(f"  {i+1:2d}. {bar} {d:+5.0f}%  [{cat}{tl}字]")
        else:
            bar = "|" + ">" * bar_len
            print(f"  {i+1:2d}. {' ' * 25}{bar} {d:+5.0f}%  [{cat}{tl}字]")

    print()
    print(f"  平均ズレ: {avg:+.1f}%")
    print(f"  早すぎ: {early}回 / 遅すぎ: {late}回 / 的確: {perfect}回")
    print()

    # 長さ別の分析
    short_drifts = [d for d, l in results if l <= 14]
    medium_drifts = [d for d, l in results if 15 <= l <= 24]
    long_drifts = [d for d, l in results if l > 24]

    print("  長さ別の傾向:")
    if short_drifts:
        avg_s = sum(short_drifts) / len(short_drifts)
        print(f"    短い文: 平均 {avg_s:+.1f}%  ({len(short_drifts)}問)")
    if medium_drifts:
        avg_m = sum(medium_drifts) / len(medium_drifts)
        print(f"    中の文: 平均 {avg_m:+.1f}%  ({len(medium_drifts)}問)")
    if long_drifts:
        avg_l = sum(long_drifts) / len(long_drifts)
        print(f"    長い文: 平均 {avg_l:+.1f}%  ({len(long_drifts)}問)")
    print()

    # 長さによるズレの差異分析
    if short_drifts and long_drifts:
        avg_short = sum(abs(d) for d in short_drifts) / len(short_drifts)
        avg_long = sum(abs(d) for d in long_drifts) / len(long_drifts)
        if avg_short > avg_long + 5:
            print("  短い文であなたは乱れる。")
            print("  読み切る前に決断を迫られると、感覚が頼りなくなる。")
        elif avg_long > avg_short + 5:
            print("  長い文であなたは乱れる。")
            print("  余裕があるはずなのに、待つ時間がズレを生んでいる。")
        else:
            print("  文の長さに関わらず、ズレ幅は安定している。")
            print("  あなたの判断は長さに左右されにくい。")
    print()

    # パターン分析
    if abs(avg) < 3:
        print("  あなたの判断は安定している。")
        print("  でも、安定は正確とは限らない。")
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
    texts = select_round_texts(8)

    show_intro()

    results = []
    for i, text in enumerate(texts):
        drift, tlen = play_round(text, i + 1, len(texts))
        results.append((drift, tlen))
        if i < len(texts) - 1:
            clear_input_buffer()
            input("  [Enter] 次のラウンド ")
            print()

    show_results(results)


if __name__ == "__main__":
    main()
