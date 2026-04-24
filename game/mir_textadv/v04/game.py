#!/usr/bin/env python3
"""mir_textadv v04 — 取調室：共犯

面白さの仮説:
  「信頼度を上げれば良いゲーム」だと思わせておいて、
  信頼度が高すぎると彼女がプレイヤーを共犯に引き込もうとする。
  ルールの意味が反転する。
  初見は「信頼を上げるゲーム」→ 途中で「信頼が罠になるゲーム」に変わる驚き。

裏設定:
  被害者: 野上誠一（35歳）。橘詩織の元交際相手。
  桜台パレス305号室・台所で刺殺。凶器は台所の包丁。
  詩織はあの夜、合鍵で裏口から侵入。日記帳を取り返すため。
  午前2時頃到着。野上は既に死んでいた。パニックで日記帳だけ持ち逃げ。
  現場に指紋を残している。彼女は殺していない。

  ただし——彼女は「刑事に協力してもらえる」と踏んだら、
  証拠隠滅を頼み始める。彼女にとっては生存戦略。
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
            print(f"  [ {i}. {text} ]  ({cost})")
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
        self.complicity = 0  # 共犯度（最初は非表示）
        self.show_complicity = False  # 共犯度メーターが出現したか

        # 刑事が気づいたこと
        self.caught_kitchen = False
        self.caught_time = False
        self.caught_back_door = False
        self.caught_diary = False
        self.caught_body = False
        self.caught_fingerprint = False

        self.know_relationship = False
        self.pressed_alibi = False

        # 共犯イベント
        self.asked_to_hide_diary = False
        self.asked_to_lose_prints = False
        self.helped_hide_diary = False
        self.helped_lose_prints = False

    def ask(self, n=1):
        self.questions = max(0, self.questions - n)

    def trust_change(self, d):
        self.trust = max(0, min(100, self.trust + d))

    def complicity_change(self, d):
        if d > 0 and not self.show_complicity:
            self.show_complicity = True
        self.complicity = max(0, min(100, self.complicity + d))

    def trust_text(self):
        if self.trust >= 80: return "心を開いている"
        if self.trust >= 60: return "警戒が薄い"
        if self.trust >= 40: return "様子を窺っている"
        if self.trust >= 20: return "壁を作っている"
        return "拒絶"

    def contradiction_labels(self):
        labels = []
        if self.caught_kitchen: labels.append("台所")
        if self.caught_time: labels.append("2時")
        if self.caught_back_door: labels.append("裏口")
        if self.caught_diary: labels.append("日記帳")
        if self.caught_body: labels.append("遺体")
        if self.caught_fingerprint: labels.append("指紋")
        return labels

    def header(self):
        print("+" + "-" * 46 + "+")
        bar = "#" * (self.trust // 10) + "." * (10 - self.trust // 10)
        print(f"  信頼度  [{bar}]  {self.trust}  {self.trust_text()}")
        print(f"  残り質問  {self.questions}")
        labels = self.contradiction_labels()
        if labels:
            print(f"  手帳  {' / '.join(labels)}")
        if self.show_complicity:
            cbar = "!" * (self.complicity // 10) + "." * (10 - self.complicity // 10)
            print(f"  ???   [{cbar}]  {self.complicity}")
        print("+" + "-" * 46 + "+")

    def caught_count(self):
        return sum([self.caught_kitchen, self.caught_time,
                    self.caught_back_door, self.caught_diary,
                    self.caught_body, self.caught_fingerprint])

    def game_over(self):
        if self.questions <= 0: return "timeout"
        if self.trust <= 0: return "trust_zero"
        return None


# ===================================
#  BEAT 1: 開口
# ===================================

def beat_1(s):
    clear()
    print()
    print("=" * 48)
    print()
    print("  思考漏れ - Thought Leak")
    print()
    print("  取調室  第七号室")
    print("  2026年  春")
    print()
    print("  被疑者  橘 詩織 (29歳)")
    print("  容疑    殺人 (認否保留)")
    print("  取調官  あなた")
    print()
    print("=" * 48)
    time.sleep(1.5)
    pause()

    clear()
    s.header()
    print()
    print("あなたは刑事だ。取調畑十年。")
    print("手元の捜査資料には被害者の名前がある。")
    print("野上誠一、35歳。昨夜、自宅マンションで刺殺体で発見。")
    print()
    print("女は机の向こう側に座っている。")
    print("両手で紙コップを包んで、こちらを見ている。")
    print()
    print("「もう話すことは全部話しましたよ、刑事さん」")

    c = choose([
        ("「野上さんとは、どういったご関係で」", "-1問 / 信頼度-5"),
        ("「昨夜のことを、もう一度聞かせてください」", "-1問 / 信頼度-5"),
        ("「少しだけお時間をいただけますか」", "信頼度+10"),
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
        s.ask(-1)  # 質問消費なし
        s.trust_change(+10)
        print("「……ありがとうございます」")
        print()
        print("少し驚いた顔だった。")
        print("刑事に「お時間」を求められるとは思っていなかったらしい。")
        print()
        print("「ええ。大丈夫です」")

    pause()


# ===================================
#  BEAT 2: 最初の引っかかり
# ===================================

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
        ("「台所、と言いかけましたね」", "-1問 / 信頼度-10 / 追及する"),
        ("「……それから?」", "信頼度+5 / 流す"),
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


# ===================================
#  BEAT 3: 二つ目の引っかかり
# ===================================

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
        ("「11時に寝たとのことですが、昨夜のテレビは何を?」",
         "-1問 / 信頼度-5 / アリバイを検証"),
        ("「野上さんとは、なぜ別れたんですか」",
         "-1問 / 信頼度-5 / 関係を掘る"),
        ("「……つらいですよね。こういう場所に来るのは」",
         "信頼度+10 / 寄り添う"),
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


# ===================================
#  BEAT 4: 証拠 + 転換点
# ===================================

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
                        "-1問 / 信頼度-8 / 時間のズレを突く"))
    if s.caught_diary:
        options.append(("「日記帳は今どこにありますか」",
                        "-1問 / 信頼度-8 / 日記の行方"))

    options.append(("「指紋については、心当たりは」",
                    "-1問 / 信頼度-5 / 直球"))
    options.append(("現場写真を、静かに机に置く",
                    "信頼度-3 / 反応を見る"))
    options.append(("「指紋の件は、今は置いておきましょう」",
                    "信頼度+10 / 圧を下げる"))

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
    else:
        s.ask(-1)
        s.trust_change(+10)
        s.caught_fingerprint = True
        print("「……置いて、くれるんですか?」")
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
            s.caught_back_door = True

    pause()


# ===================================
#  BEAT 5: 転換 ——信頼が裏返る
# ===================================

def beat_5_pivot(s):
    """信頼度が高い場合にのみ発生する転換ビート。
    彼女が「この刑事は味方だ」と踏んで、証拠隠滅を頼み始める。
    """
    if s.trust < 65:
        return  # 信頼度が低い場合はスキップ（従来の最終ビートへ直行）

    clear()
    s.header()
    print()

    print("彼女は周囲をちらりと見た。")
    print("録音マイクの赤いランプを、確認するように。")
    print()
    time.sleep(0.5)
    print("「刑事さん」")
    print()
    print("声のトーンが変わった。")
    print("壁の向こう側から、こちら側に来たような声。")
    print()
    print("「あなたは——私の味方ですよね?」")

    c = choose([
        ("「捜査官として、公正に対応します」", "信頼度-15 / 距離を取る"),
        ("「……ええ。あなたの話を聞きたいと思っています」", "信頼度+5"),
        ("何も言わず、目を合わせる", ""),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        s.trust_change(-15)
        print("彼女の目が冷えた。")
        print("一瞬で——元の壁が戻った。")
        print()
        print("「……そうですか」")
        print()
        print("口元が引き結ばれた。")
        print("あの「お願い」は、もう出てこないだろう。")
        pause()
        return

    if c == 2:
        s.trust_change(+5)
        print("彼女は少し安堵したようだった。")
    else:
        print("沈黙。")
        print("彼女はあなたの目の中に、答えを探していた。")

    print()
    time.sleep(0.3)
    print("「……一つだけ、お願いがあるんです」")
    print()
    print("「日記帳——私の部屋に、まだあるんです」")
    print("「中学生の頃からの、全部」")
    print()
    time.sleep(0.3)
    print("「あれが見つかったら——私があの部屋に行った証拠になる」")
    print("「捜索される前に——誰かに預けてほしいんです」")
    print()

    s.asked_to_hide_diary = True

    c = choose([
        ("「それはできません」", "信頼度-10"),
        ("「考えておきます」", "??? 出現"),
        ("「……わかりました」", "??? 出現"),
    ])

    clear()
    print()

    if c == 1:
        s.trust_change(-10)
        print("「……そう、ですよね」")
        print()
        print("彼女は微かに笑った。")
        print("諦めた顔だった。")
    elif c == 2:
        s.complicity_change(+20)
        s.helped_hide_diary = False
        print("「ありがとうございます」")
        print()
        print("彼女は深く頭を下げた。")
        print()
        s.header()
        print()
        print("ヘッダーに見慣れない数字が出現した。")
        print("「???」。あなたにしか見えていない数字。")
        print()
        print("刑事としての一線が、どこかで揺らぎ始めている。")
    else:
        s.complicity_change(+40)
        s.helped_hide_diary = True
        print("「本当に?」")
        print()
        print("彼女の目が光った。")
        print("安堵と——何か別のものが混じった目。")
        print()
        s.header()
        print()
        print("ヘッダーに見慣れない数字が出現した。")
        print("「???」。")
        print()
        print("これは何の数字だ?")

    pause()

    # 信頼度が高い + 共犯度がゼロでない → 第二の頼み
    if s.complicity > 0 and s.trust >= 55:
        beat_5b_second_request(s)


def beat_5b_second_request(s):
    clear()
    s.header()
    print()

    print("彼女はさらに身を乗り出した。")
    print()
    print("「もう一つだけ」")
    print()
    time.sleep(0.3)
    print("「指紋のデータ——照合前に、消してもらえませんか」")
    print()
    print("あなたの背筋が冷えた。")
    print("日記帳を預けるのとは、次元が違う。")
    print("証拠の改竄。")
    print()
    print("「私、殺してないんです。本当に」")
    print("「でも指紋が合ったら——もう終わりなんです」")

    s.asked_to_lose_prints = True

    c = choose([
        ("「それは——絶対にできない」", "??? 減少 / 信頼度-20"),
        ("「……なぜ、私にそんなことを頼めると思ったんですか」", ""),
        ("「わかりました」", "??? 大幅増加"),
    ])

    clear()
    print()

    if c == 1:
        s.trust_change(-20)
        s.complicity_change(-10)
        print("彼女は凍った。")
        print()
        print("「……すみません。おかしなことを」")
        print()
        print("壁が戻った。今度は——最初よりも厚い壁が。")
        print()
        print("あなたは刑事だ。")
        print("取り調べは続く。")
    elif c == 2:
        print("「えっ」")
        print()
        print("彼女は一瞬たじろいだ。")
        print()
        print("「……あなたが、優しかったから」")
        print("「味方だと——思ったから」")
        print()
        time.sleep(0.3)
        print("あなたは理解した。")
        print("信頼は、武器にもなる。")
        print("彼女にとって、あなたの優しさは——利用できる弱点だった。")
        print()
        print("それは悪意ではない。生存本能だ。")
        print("追い詰められた人間が、手を伸ばせる相手に手を伸ばした。")
        print("ただそれだけのことだ。")
        s.complicity_change(+5)
    else:
        s.complicity_change(+50)
        s.helped_lose_prints = True
        print("「……ありがとうございます」")
        print()
        print("彼女は泣いていた。")
        print("感謝の涙か、勝利の涙か——")
        print("区別がつかなかった。")
        print()
        s.header()
        print()
        print("「???」の数字が、ほとんど振り切れている。")
        print("あなたの中で、何かが不可逆に傾いた。")

    pause()


# ===================================
#  BEAT 6: 最終 —— 全ルートの合流
# ===================================

def beat_final(s):
    clear()
    s.header()
    print()
    print("時計が鳴った。")
    print()

    # 共犯度が高い場合の特殊分岐
    if s.complicity >= 50:
        return ending_complicity(s)

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

    options = []

    if caught >= 2:
        options.append(("手帳を開く",
                        f"{' / '.join(s.contradiction_labels())}"))

    if s.trust >= 70 and s.complicity == 0:
        options.append(("「あなたのことは、私が守ります」",
                        f"信頼度{s.trust}"))

    if s.show_complicity and s.complicity > 0 and s.complicity < 50:
        options.append(("「あなたが頼んだこと——忘れてください」",
                        "??? を清算する"))

    options.append(("「全部話してください」", "-1問"))
    options.append(("「あなたを信じます」", f"信頼度{s.trust}"))

    c = choose(options)
    sel = options[c - 1][0]

    if "手帳を開く" in sel:
        return confrontation(s)
    elif "守ります" in sel:
        clear()
        print()
        return ending_trust(s)
    elif "忘れてください" in sel:
        clear()
        print()
        return ending_reset(s)
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
        clear()
        print()
        return ending_insufficient(s)


def confrontation(s):
    """手帳の矛盾を突きつける"""
    presented = []

    clear()
    s.header()
    print()
    print("あなたは手帳を開いた。")
    print()
    print("「橘さん。いくつか、確認させてください」")
    print()
    print("彼女の目が揺れた。")

    while True:
        print()
        options = []

        if s.caught_kitchen and "kitchen" not in presented:
            options.append(("「台所」", "kitchen",
                            "あなたは「台所」と言いかけて言い直しました。"
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
            options.append(("「遺体」", "body",
                            "現場の写真を見ても、驚かなかった。一度見た光景だから"))

        if not options:
            break

        if presented:
            options.append(("——以上です", "done", ""))

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
        print(f"「{text}」")
        print()

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

    clear()
    print()

    if len(presented) >= 4:
        return ending_deduction(s, presented)
    elif len(presented) >= 2:
        return ending_confession(s)
    else:
        return ending_insufficient(s)


# ===================================
#  エンディング
# ===================================

def ending_deduction(s, presented=None):
    print("=" * 48)
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
    print("「あなたの言い間違いは全部、「隠すため」の嘘でした」")
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
    print(f"  -- ENDING A: 推理 --  (全7種)")
    print(f"  手帳{s.caught_count()}件 / 信頼度{s.trust}")
    print()
    print("=" * 48)
    print()


def ending_trust(s):
    print("=" * 48)
    print()
    print("「あなたのことは、私が守ります」")
    print()
    time.sleep(0.5)
    print("女はあなたを見た。")
    print("長い間、何も言わなかった。")
    print()
    print("「……本当に?」")
    print()
    print("「ここに来てから——あなたは一度も、」")
    print("「追い詰めようとしなかった」")
    print()
    time.sleep(0.5)
    print("「あの夜——日記帳を取りに行きました」")
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
    print(f"  -- ENDING B: 信頼 --  (全7種)")
    print(f"  信頼度{s.trust}")
    print()
    if not s.caught_kitchen:
        print("  ……彼女は一度、不自然な言い間違いをしていた。")
        print("  あなたはそれに気づかなかった。")
        print()
    print("=" * 48)
    print()


def ending_confession(s):
    print("=" * 48)
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
        print(f"  -- ENDING C: 断片 --  (全7種)")
        print(f"  未解明: {', '.join(unknown)}")
        print(f"  別の質問をしていれば、違う答えが返ってきたかもしれない。")
    else:
        print(f"  -- ENDING C: 告白 --  (全7種)")
    print(f"  信頼度{s.trust} / 残り質問{s.questions}")
    print()
    print("=" * 48)
    print()


def ending_insufficient(s):
    print("=" * 48)
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
    print(f"  -- ENDING D: 手がかり不足 --  (全7種)")
    if unknown:
        print(f"  気づけなかったこと: {', '.join(unknown)}")
    print(f"  信頼度{s.trust} / 残り質問{s.questions}")
    print()
    print("  最初の質問を変えれば、全く違う取調になる。")
    print()
    print("=" * 48)
    print()


def ending_complicity(s):
    """共犯エンディング——信頼が裏返る"""
    print("=" * 48)
    print()
    time.sleep(0.5)

    print("彼女は立ち上がった。")
    print("初めて——取調室で立ち上がった。")
    print()
    print("「ありがとうございました、刑事さん」")
    print()
    time.sleep(0.5)

    if s.helped_lose_prints:
        print("あなたは彼女のために、指紋データに手を加えた。")
        print("日記帳は、もう見つからない場所にある。")
        print()
        print("彼女は無罪放免になるだろう。")
        print("そしてあなたは——")
        print()
        time.sleep(0.5)
        print("「刑事さん」")
        print()
        print("「あなたが何をしたか——私だけが知っています」")
        print()
        print("微笑んでいた。")
        print("取調室に入ってきた時と同じ、穏やかな微笑み。")
        print("あの時は怯えだと思った。")
        print("違った。")
        print()
        print("あなたは理解した。")
        print("取調を受けていたのは、最初から——")
        print()
        time.sleep(1.0)
        print("あなたの方だった。")
        print()
        print(f"  -- ENDING F: 共犯 --  (全7種)")
        print(f"  信頼度{s.trust} / ???{s.complicity}")
        print()
        print("  「???」の正体は「共犯度」。")
        print("  信頼度を上げるほど、彼女はあなたを利用できた。")
        print("  優しさは、武器だった。")
    else:
        print("あなたは日記帳のことを「考えておく」と言った。")
        print("指紋のことも。")
        print()
        print("やるつもりはなかった。")
        print("でも——考えている自分がいた。")
        print()
        time.sleep(0.5)
        print("「刑事さん、また来てくれますか」")
        print()
        print("彼女の目は、信頼の目だった。")
        print("信頼——と呼べるのなら。")
        print()
        print("あなたは取調室を出た。")
        print("手帳を見た。書き留めた矛盾。")
        print("証拠は十分だ。彼女は有罪にできる。")
        print()
        print("できる。")
        print("できるのに——")
        print()
        time.sleep(0.5)
        print("あなたの足は、証拠保管室の方を向いていた。")
        print()
        print(f"  -- ENDING E: 揺らぎ --  (全7種)")
        print(f"  信頼度{s.trust} / ???{s.complicity}")
        print()
        print("  「???」の正体は「共犯度」。")
        print("  あなたはまだ線を越えていない。")
        print("  でも——越えようとしている。")

    print()
    print("=" * 48)
    print()


def ending_reset(s):
    """共犯度を清算するエンディング"""
    print("=" * 48)
    print()
    time.sleep(0.5)

    print("「橘さん」")
    print()
    print("「あなたが頼んだこと——日記帳のことも、指紋のことも」")
    print("「忘れてください。私にはできません」")
    print()
    time.sleep(0.5)
    print("彼女は一瞬、傷ついた顔をした。")
    print("それから——少しだけ、安堵した顔。")
    print()
    print("「……そうですよね」")
    print()
    print("「おかしなことを言って、すみません」")
    print("「でも——」")
    print()
    time.sleep(0.3)
    print("「聞いてくれて、ありがとうございます」")
    print()
    print("「全部話します。最初から」")
    print()
    time.sleep(0.5)

    print("「あの夜——日記帳を取りに行ったんです」")
    print("「合鍵で裏口から。午前2時」")
    print("「着いたら——もう、動かなかった」")
    print()
    print("「怖くなって、日記帳だけ持って逃げました」")
    print("「殺してません。本当に」")
    print()
    time.sleep(0.5)
    print("あなたは、一度は線を越えかけた。")
    print("でも戻ってきた。")
    print("刑事として——戻ってきた。")
    print()
    print(f"  -- ENDING G: 清算 --  (全7種)")
    print(f"  信頼度{s.trust}")
    print()
    print("  共犯の誘いを断ち切り、真実にたどり着いた。")
    print("  あなたの優しさは、最後に正しい場所に着地した。")
    print()
    print("=" * 48)
    print()


def ending_timeout(s):
    clear()
    print()
    print("=" * 48)
    print()
    print("質問は尽きた。")
    print("女は立ち上がり、ドアへ向かった。")
    print()
    print("「……お疲れさまでした、刑事さん」")
    print()
    print(f"  -- ENDING D: 時間切れ --  (全7種)")
    print()
    print("=" * 48)
    print()


def ending_trust_zero(s):
    clear()
    print()
    print("=" * 48)
    print()
    print("「弁護士を呼んでください」")
    print()
    print("女の声は冷たかった。")
    print()
    print(f"  -- ENDING D: 信頼崩壊 --  (全7種)")
    print()
    print("=" * 48)
    print()


# ===================================
#  メイン
# ===================================

def main():
    s = State()
    beats = [beat_1, beat_2, beat_3, beat_4, beat_5_pivot, beat_final]

    for beat in beats:
        beat(s)
        end = s.game_over()
        if end:
            (ending_timeout if end == "timeout" else ending_trust_zero)(s)
            return


if __name__ == "__main__":
    main()
