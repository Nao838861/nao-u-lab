"""
忘却のリレー — 蒸留版 (Pot #1b)
810行 → 110行。構造を捨てて核心だけ残す実験。
部屋移動・インベントリ・セーブを全部捨てた。
残ったもの: メモ・タイマー・手がかりの断片。
Mir — 2026-03-24
"""
import random, time, os


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def main():
    clear()
    print("\n  忘却のリレー — 蒸留版")
    print("  目が覚めるたびに全てを忘れる。残るのはメモだけ。")
    print("  この部屋から出るには、3桁の数字が要る。")
    input("\n  [Enter]")

    code = [random.randint(1, 9) for _ in range(3)]
    digit_sum = sum(code)
    places = ["壁の刻み", "床の石板", "天井の染み"]
    labels = ["最初", "真ん中", "最後"]
    clues = [f"{places[i]}:「{labels[i]}の数字は {code[i]}」" for i in range(3)]

    false_d = code[2]
    while false_d == code[2]:
        false_d = random.randint(1, 9)

    memos, cycle = [], 0
    TIMER, MEMO_MAX = 60, 40

    while True:
        cycle += 1
        clear()

        # 手がかり: 最初の3サイクルは順番に、以降はランダム
        visible = [clues[cycle - 1] if cycle <= 3 else random.choice(clues)]
        if random.random() < 0.4:
            visible.append(f"壁の落書き:「最後の数字は {false_d}」")
            random.shuffle(visible)

        print(f"\n  ── サイクル {cycle} ──")
        if cycle == 1:
            print("  目を覚ます。石の部屋。出口に数字錠。")
            print("  手元にメモ帳がある。write で書けば次の目覚めに残る。")
            print("  （? でコマンド一覧）")
        else:
            print(f"  {cycle}回目の目覚め。何も覚えていない。")

        if memos:
            print("\n  ─── メモ帳 ───")
            for i, m in enumerate(memos):
                print(f"  [{i+1}] {m}")
            print("  ────────────")
        else:
            print("\n  メモ帳は白紙。")

        print("\n  見回すと:")
        for v in visible:
            print(f"    {v}")
        print(f"  扉の横:「三つの数字を足すと {digit_sum}」")
        print("  扉に3桁の数字錠。")

        start = time.time()
        warned = False

        while True:
            left = TIMER - (time.time() - start)
            if left <= 0:
                print("\n  ──意識が遠くなる。メモだけが残る。")
                time.sleep(1)
                break

            if left <= 10 and not warned:
                print("  【残り10秒】")
                warned = True

            try:
                raw = input(f"  [{int(left)//60:02d}:{int(left)%60:02d}]> ").strip()
            except (EOFError, KeyboardInterrupt):
                return

            if not raw:
                continue
            parts = raw.split(None, 1)
            cmd, arg = parts[0].lower(), (parts[1] if len(parts) > 1 else "")

            # 3桁の数字を直接入力 → enter として扱う
            if cmd.isdigit() and len(cmd) == 3 and not arg:
                arg = cmd
                cmd = "enter"

            if cmd in ("w", "write", "書く"):
                if not arg:
                    print(f"  write <内容> ({MEMO_MAX}文字以内)")
                elif len(arg) > MEMO_MAX:
                    print(f"  長い（{len(arg)}/{MEMO_MAX}）")
                else:
                    memos.append(arg)
                    print(f"  書いた。({len(arg)}文字)")
            elif cmd in ("r", "read", "読む"):
                [print(f"  [{i+1}] {m}") for i, m in enumerate(memos)] or print("  白紙。")
            elif cmd in ("l", "look", "見る"):
                for v in visible:
                    print(f"    {v}")
                print(f"  扉の横:「三つの数字を足すと {digit_sum}」")
            elif cmd in ("enter", "入力"):
                if arg == "".join(str(d) for d in code):
                    print(f"\n  ──錠が外れた。光が差す。")
                    print(f"\n  ═══ CLEAR ═══")
                    print(f"  {cycle}サイクル / メモ{len(memos)}枚")
                    if cycle <= 3:
                        print("  無駄のないリレーだった。")
                    elif cycle <= 5:
                        print("  メモが道を作った。")
                    else:
                        print("  遠回りした。でもメモが繋いだ。")
                    return
                print("  違う。錠はびくともしない。")
            elif cmd in ("h", "help", "?"):
                print("  コマンド:")
                print("    <3桁の数字>  錠に入力する（例: 123）")
                print("    write <内容>  メモに書く（記憶を失っても残る）")
                print("    read          メモを読む")
                print("    look          部屋を見回す")
                print("    quit          やめる")
            elif cmd in ("q", "quit"):
                return
            else:
                print("  ? でコマンド一覧")


if __name__ == "__main__":
    main()
