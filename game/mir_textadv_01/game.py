#!/usr/bin/env python3
"""mir_textadv_01 — 取調室

超能力なし。刑事の観察と、彼女の嘘が自壊していく過程。
彼女は供述の中で、知っているはずのないことを口にしてしまう。
プレイヤーはそれを聞き逃さず、追及するか見逃すかを選ぶ。

裏設定:
  被害者: 野上誠一（35歳）。橘詩織の元交際相手。
  桜台パレス305号室・台所で刺殺。凶器は台所の包丁。
  詩織はあの夜、合鍵で裏口から侵入。目的は日記帳の奪還。
  午前2時頃到着。野上は既に死んでいた。パニックで日記帳だけ持ち逃げ。
  現場に指紋を残している。彼女は殺していない。
"""

import os
import time

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def pause():
    input("\n[Enter]")

def choose(options):
    print()
    for i, (text, cost) in enumerate(options, 1):
        if cost:
            print(f"  [ {i}. {text} ]  （{cost}）")
        else:
            print(f"  [ {i}. {text} ]")
    print()
    while True:
        try:
            c = int(input("  > "))
            if 1 <= c <= len(options):
                return c
        except (ValueError, EOFError):
            pass


class State:
    def __init__(self):
        self.trust = 50
        self.questions = 10

        # 刑事が気づいたこと
        self.caught_kitchen = False
        self.caught_time = False
        self.caught_back_door = False
        self.caught_diary = False
        self.caught_body = False
        self.caught_body_method = None  # "fingerprint" / "photo" / "voluntary"
        self.caught_fingerprint = False

        self.know_relationship = False
        self.pressed_alibi = False

    def ask(self, n=1):
        self.questions = max(0, self.questions - n)

    def trust_change(self, d):
        self.trust = max(0, min(100, self.trust + d))

    def trust_text(self):
        if self.trust >= 70: return "警戒が薄い"
        if self.trust >= 50: return "様子を窺っている"
        if self.trust >= 30: return "壁を作っている"
        return "拒絶"

    def contradiction_labels(self):
        """手帳に書き留めた言葉のリスト"""
        labels = []
        if self.caught_kitchen: labels.append("台所")
        if self.caught_time: labels.append("2時")
        if self.caught_back_door: labels.append("裏口")
        if self.caught_diary: labels.append("日記帳")
        if self.caught_body: labels.append("遺体")
        if self.caught_fingerprint: labels.append("指紋")
        return labels

    def header(self):
        print("─" * 48)
        bar = "█" * (self.trust // 10) + "░" * (10 - self.trust // 10)
        print(f"  信頼度  {bar}  {self.trust}  {self.trust_text()}")
        print(f"  残り質問  {self.questions}")
        labels = self.contradiction_labels()
        if labels:
            print(f"  手帳  {' / '.join(labels)}")
        print("─" * 48)

    def caught_count(self):
        return sum([self.caught_kitchen, self.caught_time,
                    self.caught_back_door, self.caught_diary,
                    self.caught_body, self.caught_fingerprint])

    def game_over(self):
        if self.questions <= 0: return "timeout"
        if self.trust <= 0: return "trust_zero"
        return None


# ═══════════════════
#  BEAT 1: 開口
# ═══════════════════

def beat_1(s):
    clear()
    print()
    print("━" * 48)
    print()
    print("  取調室  第七号室")
    print("  2026年  春")
    print()
    print("  被疑者  橘 詩織（29歳）")
    print("  容疑    殺人（認否保留）")
    print("  取調官  あなた")
    print()
    print("━" * 48)
    time.sleep(1.5)
    pause()

    clear()
    s.header()
    print()
    print("女は机の向こう側に座っている。")
    print("両手で紙コップを包んで、こちらを見ている。")
    print()
    print("あなたは刑事だ。取調畑十年。")
    print("手元の捜査資料には被害者の名前がある。")
    print("野上誠一、35歳。昨夜、自宅マンションで刺殺体で発見。")
    print()
    print("「もう話すことは全部話しましたよ、刑事さん」")

    c = choose([
        ("「野上さんとは、どういったご関係で」", "−1問 / 信頼度−5"),
        ("「昨夜のことを、もう一度聞かせてください」", "−1問 / 信頼度−5"),
        ("「少しだけお時間をいただけますか」", "−0問 / 信頼度+10"),
    ])

    s.ask()
    clear()
    s.header()
    print()

    if c == 1:
        s.trust_change(-5)
        s.know_relationship = True
        print("「……知り合いです。以前、少しだけお付き合いしていました」")
        print()
        print("声は平坦だった。練習した答えだ。")
        print()
        print("「半年前に別れました。それ以来、会っていません」")
    elif c == 2:
        s.trust_change(-5)
        s.pressed_alibi = True
        print("「昨夜は家にいました。ずっとひとりで」")
        print("「テレビを見て、お風呂に入って、11時に寝ました」")
        print()
        print("彼女はコーヒーを一口飲んだ。")
        print("手が、わずかに震えていた。")
    else:
        s.ask(-1)
        s.trust_change(+10)
        print("「……ありがとうございます」")
        print()
        print("少し驚いた顔だった。")
        print("刑事に「お時間」を求められるとは思っていなかったらしい。")
        print()
        print("「ええ。大丈夫です」")

    pause()


# ═══════════════════
#  BEAT 2: 最初の引っかかり
# ═══════════════════

def beat_2(s):
    clear()
    s.header()
    print()

    if s.know_relationship:
        print("「野上さんとのこと、もう少し聞かせてください」")
        print()
        print("「……はい。普通に別れました。")
        print("  特に揉めたりは——していません」")
        s.ask()
        s.trust_change(-3)
    elif s.pressed_alibi:
        print("「11時に寝た、と。ぐっすりですか」")
        print()
        print("「ええ。特に——起きたりはしてません」")
        s.ask()
        s.trust_change(-3)
    else:
        print("彼女は話し始めた。自分から。")
        print()
        print("「あの人とは半年前に別れています」")
        print("「昨夜は家にいました。11時には寝ました」")
        s.know_relationship = True

    print()
    print("「あの夜は何もなかったんです。")
    print("  いつもと同じで、台所——」")
    print()
    time.sleep(0.3)
    print("彼女の口が止まった。")
    print()
    print("「——お風呂場の、電気を消して、寝ました」")
    print()
    time.sleep(0.3)
    print("あなたの手が止まった。")
    print("台所。")
    print("被害者は台所で発見されている。")
    print("だがその情報は——まだ彼女には伝えていない。")

    c = choose([
        ("「台所、と言いかけましたね」", "−1問 / 信頼度−10 / 追及する"),
        ("「……それから？」", "−0問 / 信頼度+5 / 流す"),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        s.ask()
        s.trust_change(-10)
        s.caught_kitchen = True
        print("女の指が白くなった。紙コップを握りしめている。")
        print()
        print("「言い間違いです。台所もお風呂場も——」")
        print("「家のことを話しているだけです」")
        print()
        print("言い間違い。")
        print("だが「台所」という言葉を選んだのは彼女だ。")
        print("あなたは手帳に書き留めた。")
    else:
        s.trust_change(+5)
        s.caught_kitchen = True
        print("あなたは手帳に「台所」と書いた。")
        print("彼女には見えないように。")
        print()
        print("「——11時に寝て、朝まで起きなかったと」")
        print("「はい」")
        print()
        print("彼女は少し安心したようだった。")
        print("追及されなかったことに。")

    pause()


# ═══════════════════
#  BEAT 3: 二つ目
# ═══════════════════

def beat_3(s):
    clear()
    s.header()
    print()

    if s.trust >= 60:
        print("彼女は少しだけ肩の力を抜いている。")
        print("あなたのことを、まだ「話せる相手」だと思っている。")
    else:
        print("彼女は紙コップを回している。")
        print("あなたの次の言葉を警戒する目だ。")

    print()

    c = choose([
        ("「11時に寝たとのことですが、昨夜のテレビは何を？」",
         "−1問 / 信頼度−5 / アリバイを検証"),
        ("「野上さんとは、なぜ別れたんですか」",
         "−1問 / 信頼度−5 / 関係を掘る"),
        ("「……つらいですよね。こういう場所に来るのは」",
         "−0問 / 信頼度+10 / 寄り添う"),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        s.ask()
        s.trust_change(-5)
        print("「テレビは……ドラマです。9時からやってた——」")
        print()
        print("あなたは知っている。")
        print("昨夜その枠は野球中継で潰れていた。")
        print()
        print("「そのドラマ、昨夜は放送されていませんよ」")
        print()
        print("女の目が泳いだ。")
        print()
        print("「……じゃあ、別の——いえ——」")
        print("「——2時くらいまでは起きてたかもしれません」")
        print()
        time.sleep(0.3)
        print("2時。")
        print("11時に寝たはずが、2時まで起きていた。")
        print("嘘が一つ崩れた。")
        print("あなたは手帳に書き留めた。")
        s.caught_time = True
        s.pressed_alibi = True
    elif c == 2:
        s.ask()
        s.trust_change(-5)
        s.know_relationship = True
        print("女はしばらく黙っていた。")
        print()
        print("「……私の日記を、勝手に読んだんです」")
        print()
        print("「中学生の頃からつけていた日記帳を。")
        print("  読んだだけじゃなく——返してくれなかった」")
        print()
        print("声に初めて感情が混じった。")
        print("怒りではない。もっと深い痛み。")
        print()
        print("「別れたのに、まだ——あの人の部屋に……」")
        print()
        time.sleep(0.3)
        print("彼女はそこで言葉を切った。")
        print("「あの人の部屋」。")
        print("まるで最近のことのように言った。")
        print("あなたは手帳に書き留めた。")
        s.caught_diary = True
    else:
        s.trust_change(+10)
        print("女は一瞬、何を言われたかわからない顔をした。")
        print()
        print("「……ありがとうございます」")
        print()
        print("目が赤くなった。泣きはしなかったが。")
        print()
        print("「最近、眠れなくて」")
        print("「あの夜も——2時くらいまで起きてて」")
        print()
        time.sleep(0.3)
        print("自分から言った。")
        print("11時に寝たはずが、2時まで起きていた。")
        print("寄り添われたことで、嘘を一つ下ろした。")
        print("あなたは手帳に書き留めた。")
        s.caught_time = True

    pause()


# ═══════════════════
#  BEAT 4: 証拠
# ═══════════════════

def beat_4(s):
    clear()
    s.header()
    print()
    print("あなたは捜査資料をめくった。")
    print()
    print("「現場から、被害者以外の指紋が検出されています」")
    print()
    print("彼女の手が止まった。")

    options = []

    if s.caught_time:
        options.append(("「2時まで起きていたなら、どこにいましたか」",
                        "−1問 / 信頼度−8 / 時間のズレを突く"))
    if s.caught_diary:
        options.append(("「日記帳は今どこにありますか」",
                        "−1問 / 信頼度−8 / 日記の行方"))

    options.append(("「指紋については、心当たりは」",
                    "−1問 / 信頼度−5 / 直球"))
    options.append(("現場写真を、静かに机に置く",
                    "−0問 / 信頼度−3 / 反応を見る"))
    options.append(("「指紋の件は、今は置いておきましょう」",
                    "−0問 / 信頼度+10 / 圧を下げる"))

    c = choose(options)
    sel = options[c - 1][0]

    s.ask()
    clear()
    s.header()
    print()

    if "2時まで" in sel:
        s.trust_change(-8)
        s.caught_fingerprint = True
        print("「2時——」")
        print("長い沈黙。")
        print()
        print("「……出かけました」")
        print()
        print("彼女の声が小さくなった。")
        print()
        print("「桜台パレスに——裏口から入って——」")
        print()
        time.sleep(0.3)
        print("また止まった。")
        print("裏口。彼女はマンションの裏口を知っている。")
        print("住んでいたのでなければ——通っていたのでなければ、")
        print("知らないはずの裏口を。")
        print("あなたは手帳に書き留めた。")
        s.caught_back_door = True
    elif "日記帳は今" in sel:
        s.trust_change(-8)
        s.caught_fingerprint = True
        print("「日記帳——」")
        print()
        print("女の目から涙がこぼれた。初めて見る涙だった。")
        print()
        print("「……返してほしかっただけなんです」")
        print("「何度頼んでも返してくれなくて——」")
        print("「あの夜——裏口から——」")
        print()
        time.sleep(0.3)
        print("また言葉が止まった。")
        print("「あの夜」。「裏口から」。")
        print("取りに行ったのだ。あの夜、日記帳を取り返しに。")
        print("あなたは手帳に書き留めた。")
        s.caught_back_door = True
    elif "指紋については" in sel:
        s.trust_change(-5)
        s.caught_fingerprint = True
        print("「……指紋」")
        print()
        print("彼女の手が震えた。")
        print()
        print("「拭けなかったんです。何も——考えられなくて」")
        print()
        time.sleep(0.3)
        print("拭けなかった。")
        print("拭く必要があった、ということは。")
        print("触れたということは。")
        print("あなたは手帳に書き留めた。")
        s.caught_body = True
        s.caught_body_method = "fingerprint"
    elif "写真" in sel:
        s.ask(-1)
        s.trust_change(-3)
        s.caught_fingerprint = True
        print("桜台パレス305号室。台所。倒れた男。")
        print()
        print("彼女は写真を見た。")
        print("悲鳴は上げなかった。泣きもしなかった。")
        print()
        time.sleep(0.3)
        print("——初めて見る光景ではなかった。")
        print("その反応そのものが、答えだった。")
        print("あなたは手帳に書き留めた。")
        s.caught_body = True
        s.caught_body_method = "photo"
    else:
        s.ask(-1)
        s.trust_change(+10)
        s.caught_fingerprint = True
        print("「……置いて、くれるんですか？」")
        print()
        print("彼女は驚いていた。")
        print()
        print("「指紋は——たぶん、私のです」")
        print()
        time.sleep(0.3)
        print("自分から言った。")
        print("圧を下げた瞬間に、壁が一つ落ちた。")

        if s.trust >= 70:
            print()
            print("「あの部屋に行きました。あの夜」")
            print("「着いたとき——もう——」")
            print()
            print("彼女は目を伏せた。")
            print("「動かなかったんです」")
            print("あなたは手帳に書き留めた。")
            s.caught_body = True
            s.caught_body_method = "voluntary"
            s.caught_back_door = True

    pause()


# ═══════════════════
#  BEAT 5: 最終
# ═══════════════════

def beat_final(s):
    clear()
    s.header()
    print()
    print("時計が鳴った。")
    print()

    if s.trust >= 70:
        print("彼女はあなたの目を見ていた。")
        print("取調室に入ってきた時とは、違う目だった。")
    elif s.trust >= 40:
        print("彼女は疲れた顔をしていた。")
        print("だが、まだこちらを見ている。")
    else:
        print("彼女は腕を組んで、目を逸らしていた。")

    print()

    caught = s.caught_count()

    # まず、最終アプローチを選ぶ
    options = []

    if caught >= 2:
        options.append(("手帳を開く",
                        f"{' / '.join(s.contradiction_labels())}"))

    if s.trust >= 70:
        options.append(("「あなたのことは、私が守ります」",
                        f"信頼度{s.trust}"))

    options.append(("「全部話してください」", "−1問"))
    options.append(("「あなたを信じます」", f"信頼度{s.trust}"))

    c = choose(options)
    sel = options[c - 1][0]

    if "手帳を開く" in sel:
        return confrontation(s)
    elif "守ります" in sel:
        clear()
        print()
        return ending_trust(s)
    elif "全部話して" in sel:
        s.ask()
        clear()
        print()
        return ending_confession(s)
    elif "信じます" in sel:
        clear()
        print()
        if s.trust >= 60:
            return ending_trust(s)
        else:
            return ending_insufficient(s)
    else:
        s.ask()
        clear()
        print()
        return ending_insufficient(s)


def confrontation(s):
    """プレイヤーが手帳の内容を一つずつ読み上げる"""
    presented = []

    clear()
    s.header()
    print()
    print("あなたは手帳を開いた。")
    print()
    print("「橘さん。いくつか、確認させてください」")
    print()
    print("彼女の目が揺れた。")

    # 矛盾を一つずつ突きつけるループ
    while True:
        print()

        # 未提示の矛盾を選択肢として構築
        options = []

        if s.caught_kitchen and "kitchen" not in presented:
            options.append(("「台所」", "kitchen",
                            "あなたは『台所』と言いかけて言い直しました。"
                            "事件が台所で起きたことは——まだ伝えていません"))
        if s.caught_time and "time" not in presented:
            options.append(("「2時」", "time",
                            "11時に寝たと言いましたが、2時まで起きていた"))
        if s.caught_back_door and "back_door" not in presented:
            options.append(("「裏口」", "back_door",
                            "裏口の存在を知っていました。"
                            "最近あのマンションに行っていなければ——知らないはずの"))
        if s.caught_diary and "diary" not in presented:
            options.append(("「日記帳」", "diary",
                            "日記帳を——まるで最近まで取り返そうとしていたように"))
        if s.caught_body and "body" not in presented:
            if s.caught_body_method == "photo":
                body_text = "現場の写真を見ても、驚かなかった。一度見た光景だから"
            elif s.caught_body_method == "fingerprint":
                body_text = "『拭けなかった』と言いました。拭く必要があったのは、現場に触れたから"
            else:
                body_text = "あなたは自分から『動かなかった』と言いました"
            options.append(("「遺体」", "body", body_text))

        if not options:
            break

        # 「突きつけ終了」の選択肢を追加
        if presented:
            options.append(("——以上です", "done", ""))

        # 選択肢表示（ラベルだけ見せる）
        print_options = [(o[0], None) for o in options]
        c = choose(print_options)

        key = options[c - 1][1]
        text = options[c - 1][2]

        if key == "done":
            break

        presented.append(key)

        clear()
        s.header()
        print()

        # 突きつけた矛盾を表示
        print(f"「{text}」")
        print()

        # 彼女の反応（矛盾の数に応じて変化）
        count = len(presented)
        if count == 1:
            print("女は唇を噛んだ。")
            print("「……それは——」")
        elif count == 2:
            print("女の目が泳いだ。")
            print("「偶然です。ただの——」")
        elif count == 3:
            print("女の手が震え始めた。")
            print("「やめてください——」")
        elif count >= 4:
            print("女は両手で顔を覆った。声が漏れた。")

        s.trust_change(-3)
        pause()

        clear()
        s.header()

    # 突きつけた数に応じてエンディング分岐
    clear()
    print()

    if len(presented) >= 4:
        # 十分な矛盾を突きつけた → 推理エンディング
        return ending_deduction(s, presented)
    elif len(presented) >= 2:
        # 部分的 → 告白エンディング
        return ending_confession(s)
    else:
        return ending_insufficient(s)


# ═══════════════════
#  エンディング
# ═══════════════════

def ending_deduction(s, presented=None):
    print("═" * 48)
    print()
    time.sleep(0.5)

    print("「あなたはあの夜、あの部屋にいた」")
    print("「合鍵で裏口から入った。おそらく午前2時頃」")
    print()
    print("「でも——殺してはいない」")
    print()
    time.sleep(0.5)
    print("女は両手で顔を覆った。")
    print()
    print("「……なぜ——そう思うんですか」")
    print()
    print("「あなたの言い間違いは全部、『隠すため』の嘘でした」")
    print("「殺した人間の嘘は——もっと違う形をしている」")
    print()
    time.sleep(0.5)
    print("彼女は顔を上げた。涙の跡が蛍光灯に光っていた。")
    print()
    print("「……日記帳を取り返しに行ったんです」")
    print("「でも着いたら——もう——」")
    print("「あの人は動かなかった」")
    print()
    print("「怖くなって、日記帳だけ持って逃げました」")
    print("「指紋のことも何も——頭が真っ白で」")
    print()
    time.sleep(0.5)
    print("「殺してません。でも——」")
    print("「誰にも信じてもらえないと思って」")
    print()
    print("あなたは十年の経験で知っている。")
    print("殺した人間と、隠している人間の嘘は違う。")
    print("彼女の嘘は——ずっと、隠す側の嘘だった。")
    print()
    print(f"  ── ENDING A: 推理 ──  （全5種）")
    print(f"  手帳{s.caught_count()}件 / 信頼度{s.trust}")
    print()
    print("═" * 48)
    print()


def ending_trust(s):
    print("═" * 48)
    print()
    print("「あなたのことは、私が守ります」")
    print()
    time.sleep(0.5)
    print("女はあなたを見た。")
    print("長い間、何も言わなかった。")
    print()
    print("「……本当に？」")
    print()
    print("「ここに来てから——あなたは一度も、」")
    print("「追い詰めようとしなかった」")
    print()
    time.sleep(0.5)
    print("「あの夜——日記帳を取りに行きました」")
    print("「中学生の頃からつけてた日記帳を、あの人が持ったままで」")
    print()
    print("「合鍵で裏口から入りました。午前2時。雨が降ってて」")
    print()
    print("「部屋に入ったら——」")
    print()
    time.sleep(0.5)
    print("「あの人は、もう——」")
    print("「台所で、倒れてた」")
    print()
    print("「怖くなって、日記帳だけ持って逃げました」")
    print("「殺してません——でも誰にも信じてもらえないと思って」")
    print()
    time.sleep(0.5)
    print("追い詰めたのではなかった。")
    print("彼女が——信じられる相手に、話すことを選んだ。")
    print()
    print(f"  ── ENDING B: 信頼 ──  （全5種）")
    print(f"  信頼度{s.trust}")
    print()
    if not s.caught_kitchen:
        print("  ……彼女は一度、不自然な言い間違いをしていた。")
        print("  あなたはそれに気づかなかった。")
        print()
    print("═" * 48)
    print()


def ending_confession(s):
    print("═" * 48)
    print()
    print("「全部話してください。最初から」")
    print()
    time.sleep(0.5)
    print("長い沈黙。")
    print()
    print("「……あの夜、出かけました」")
    print()
    if s.caught_diary:
        print("「日記帳を取りに——」")
    else:
        print("「どうしても、取り返さないといけないものがあって」")
    print()
    if s.caught_back_door:
        print("「裏口から入りました。合鍵で」")
    else:
        print("「鍵を持っていたから……入れてしまったんです」")
    print()
    if s.caught_body:
        print("「着いたとき——もう、あの人は動かなかった」")
        print()
        print("「怖くなって逃げました。それだけです」")
    else:
        print("「……それ以上は」")
        print("彼女はそこで口を閉ざした。")
    print()
    time.sleep(0.5)
    unknown = []
    if not s.caught_diary: unknown.append("動機")
    if not s.caught_back_door: unknown.append("侵入経路")
    if not s.caught_body: unknown.append("現場の状況")
    if unknown:
        print(f"  ── ENDING C: 断片 ──  （全5種）")
        print(f"  未解明: {', '.join(unknown)}")
        print(f"  別の質問をしていれば、違う答えが返ってきたかもしれない。")
    else:
        print(f"  ── ENDING C: 告白 ──  （全5種）")
    print(f"  信頼度{s.trust} / 残り質問{s.questions}")
    print()
    print("═" * 48)
    print()


def ending_insufficient(s):
    print("═" * 48)
    print()
    if s.trust >= 50:
        print("「……出かけました」")
        print("彼女は小さく言った。")
        print()
        print("「でも——それ以上は今は言えません」")
    else:
        print("「弁護士を通してください」")
        print()
        print("壁は閉じた。")
    print()
    unknown = []
    if not s.caught_kitchen: unknown.append("台所の言い間違い")
    if not s.caught_time: unknown.append("深夜の空白")
    if not s.caught_diary: unknown.append("日記帳")
    if not s.caught_back_door: unknown.append("裏口")
    if not s.caught_body: unknown.append("遺体を見たこと")
    print(f"  ── ENDING D: 手がかり不足 ──  （全5種）")
    if unknown:
        print(f"  気づけなかったこと: {', '.join(unknown)}")
    print(f"  信頼度{s.trust} / 残り質問{s.questions}")
    print()
    print("  最初の質問を変えれば、全く違う取調になる。")
    print()
    print("═" * 48)
    print()


def ending_timeout(s):
    clear()
    print()
    print("═" * 48)
    print()
    print("質問は尽きた。")
    print("女は立ち上がり、ドアへ向かった。")
    print()
    print("「……お疲れさまでした、刑事さん」")
    print()
    print(f"  ── ENDING E: 時間切れ ──  （全5種）")
    print()
    print("═" * 48)
    print()


def ending_trust_zero(s):
    clear()
    print()
    print("═" * 48)
    print()
    print("「弁護士を呼んでください」")
    print()
    print("女の声は冷たかった。")
    print()
    print(f"  ── ENDING E: 信頼崩壊 ──  （全5種）")
    print()
    print("═" * 48)
    print()


# ═══════════════════
#  メイン
# ═══════════════════

def main():
    s = State()
    beats = [beat_1, beat_2, beat_3, beat_4, beat_final]

    for beat in beats:
        beat(s)
        end = s.game_over()
        if end:
            (ending_timeout if end == "timeout" else ending_trust_zero)(s)
            return


if __name__ == "__main__":
    main()
