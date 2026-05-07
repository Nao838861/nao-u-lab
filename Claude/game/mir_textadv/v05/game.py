#!/usr/bin/env python3
"""mir_textadv v05 -- 供述

Q-A: 供述が崩れるたびにゲームの意味が変わる。
     取調室から出る頃には、入った時とは全く違うゲームを遊んでいる。

L-1知識:
  a. 逆転裁判 -- 矛盾指摘の「見つけた!」快感
  b. Her Story -- テキストだけで引き込む。嘘をつく人の切実さ
  c. Obra Dinn -- 遡及的再解釈。蓄積が一気に意味を持つ瞬間

Phase構造:
  Phase 1 (beat 1-4): 取調ゲーム。失言を拾い、追及か信頼構築か選ぶ
  Phase 2 (beat 5):   共犯の誘惑。信頼が武器になる。ルールの意味が反転
  Phase 3 (beat 6):   取調の逆転。彼女が刑事に質問を始める。手帳が自分に跳ね返る

裏設定:
  被害者: 野上誠一(35歳)。橘詩織の元交際相手。
  桜台パレス305号室・台所で刺殺。凶器は台所の包丁。
  詩織はあの夜、合鍵で裏口から侵入。日記帳を取り返すため。
  午前2時頃到着。野上は既に死んでいた。パニックで日記帳だけ持ち逃げ。
  現場に指紋を残している。彼女は殺していない。
  ただし -- 追い詰められれば、使える手は全て使う人間。
"""

import os
import time

# ===================================
#  ユーティリティ
# ===================================

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def pause():
    input("\n[Enter]")

def slow(text="", wait=0.4):
    print(text)
    time.sleep(wait)

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


# ===================================
#  ゲーム状態
# ===================================

class State:
    def __init__(self):
        self.trust = 50
        self.questions = 10
        self.complicity = 0
        self.show_complicity = False

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

        # Phase 3: 逆転フラグ
        self.reversal_triggered = False
        self.detective_lied = False
        self.detective_showed_notebook = False
        self.detective_admitted = False

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

    def detective_condition(self):
        """共犯度を刑事の身体症状で表現する(世界観内UI)"""
        if self.complicity >= 80:
            return "蛍光灯の音が耳鳴りのように響いている"
        if self.complicity >= 60:
            return "手帳を持つ手が汗ばんでいる"
        if self.complicity >= 40:
            return "椅子の座り心地が悪い"
        if self.complicity >= 20:
            return "呼吸が少し浅い"
        return None

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
        print("+" + "-" * 50 + "+")
        bar = "#" * (self.trust // 10) + "." * (10 - self.trust // 10)
        print(f"  信頼度  [{bar}]  {self.trust}  {self.trust_text()}")
        print(f"  残り質問  {self.questions}")
        labels = self.contradiction_labels()
        if labels:
            print(f"  手帳  {' / '.join(labels)}")
        cond = self.detective_condition()
        if self.show_complicity and cond:
            print(f"  -- {cond}")
        print("+" + "-" * 50 + "+")

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
    print("=" * 52)
    print()
    print("  供 述")
    print()
    print("  取調室  第七号室")
    print("  2026年  春")
    print()
    print("  被疑者  橘 詩織 (29歳)")
    print("  容疑    殺人 (認否保留)")
    print("  取調官  あなた")
    print()
    print("=" * 52)
    time.sleep(1.5)
    pause()

    clear()
    s.header()
    print()
    print("蛍光灯が微かに唸っている。")
    print("取調室の空気は冷房が効きすぎていて、")
    print("紙コップのコーヒーだけがぬるい熱を持っていた。")
    print()
    print("あなたは刑事だ。取調畑十年。")
    print("この部屋で何百人と向かい合ってきた。")
    print("嘘の形は、もう手触りで分かる。")
    print()
    print("手元の捜査資料。野上誠一、35歳。")
    print("昨夜、桜台パレス305号室の台所で刺殺体で発見。")
    print()
    print("女は机の向こう側に座っている。")
    print("両手で紙コップを包むようにして、こちらを見ていた。")
    print("爪が短く切り揃えてある。手入れされた手だった。")
    print()
    slow("「もう話すことは全部話しましたよ、刑事さん」")
    print()
    print("声に震えはない。むしろ静かすぎた。")
    print("練習した台詞のように、角が取れていた。")

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
        print("声は平坦だった。用意された答えだ。")
        print("この十年で覚えたことがある。")
        print("人は本当のことを話す時、少し間が空く。")
        print("嘘をつく時は、間が空かない。")
        print()
        print("「半年前に別れました。それ以来、会っていません」")
        print()
        print("間は、なかった。")
    elif c == 2:
        s.trust_change(-5)
        s.pressed_alibi = True
        print("「昨夜は家にいました。ずっとひとりで」")
        print("「テレビを見て、お風呂に入って、11時に寝ました」")
        print()
        print("彼女はコーヒーを一口飲んだ。")
        print("紙コップの縁に、口紅の跡が付いた。")
        print("手が、わずかに震えていた。")
        print("コーヒーの水面が小さく揺れて、止まった。")
    else:
        s.ask(-1)  # 質問消費なし
        s.trust_change(+10)
        print("「……ありがとうございます」")
        print()
        print("少し驚いた顔だった。")
        print("刑事に「お時間」を求められるとは思っていなかったらしい。")
        print("初めて、練習していない表情が出た。")
        print()
        print("「ええ。大丈夫です」")
        print()
        print("紙コップを両手で包み直す。")
        print("指先の力が、少しだけ緩んでいた。")

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
        print("  特に揉めたりは――していません」")
        s.ask()
        s.trust_change(-3)
    elif s.pressed_alibi:
        print("「11時に寝た、と。ぐっすりですか」")
        print()
        print("「ええ。特に――起きたりはしてません」")
        s.ask()
        s.trust_change(-3)
    else:
        print("彼女は自分から話し始めた。")
        print()
        print("「あの人とは半年前に別れています」")
        print("「昨夜は家にいました。11時には寝ました」")
        s.know_relationship = True

    print()
    print("「あの夜は何もなかったんです。")
    print("  いつもと同じで、台所――」")
    print()
    slow("彼女の口が止まった。", 0.5)
    print()
    print("「――お風呂場の、電気を消して、寝ました」")
    print()
    slow("言い直した。")
    print("台所。")
    print("被害者は台所で発見されている。")
    print("だがその情報は――まだ彼女には伝えていない。")
    print()
    print("あなたの胸の奥で、何かが引っかかった。")
    print("この十年で何百回と覚えた感覚。")
    print("嘘が形を持つ瞬間の、小さな引力。")

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
        print("「言い間違いです。台所もお風呂場も――」")
        print("「家のことを話しているだけです」")
        print()
        print("声が上ずっていた。")
        print("言い間違い。そうかもしれない。")
        print("だが「台所」という言葉を選んだのは彼女だ。")
        print("人間は、気にしていないことを言い間違えない。")
        print()
        print("あなたは手帳に書き留めた。")
    else:
        s.trust_change(+5)
        s.caught_kitchen = True
        print("あなたは手帳に「台所」と書いた。")
        print("彼女には見えないように、膝の上で。")
        print()
        print("「――11時に寝て、朝まで起きなかったと」")
        print("「はい」")
        print()
        print("彼女は少し安心したようだった。")
        print("追及されなかったことに。")
        print("安心した顔は、嘘をついている人間の顔だ。")
        print("本当のことを話している人間は、安心しない。")

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
        print("蛍光灯の光の下で、頬の産毛が白く光っていた。")
        print("あなたのことを、まだ「話せる相手」だと思っている。")
    else:
        print("彼女は紙コップを回している。")
        print("中身はとっくに冷めている。")
        print("回しているのはコーヒーではなく、自分の考えだ。")

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
        print("「テレビは……ドラマです。9時からやってた――」")
        print()
        print("あなたは知っている。")
        print("昨夜その枠は野球中継で潰れていた。")
        print()
        print("「そのドラマ、昨夜は放送されていませんよ」")
        print()
        print("女の目が泳いだ。")
        print("泳いだ、という表現がこれほど正確なことはない。")
        print("視線が水面で溺れていた。")
        print()
        print("「……じゃあ、別の――いえ――」")
        slow("「――2時くらいまでは起きてたかもしれません」")
        print()
        print("2時。")
        print("11時に寝たはずが、2時まで起きていた。")
        print("嘘が一つ崩れた。")
        print("崩れ方に特徴がある。自分から下ろした。")
        print("嘘を維持する体力が、もう残っていない。")
        print()
        print("あなたは手帳に書き留めた。")
        s.caught_time = True
        s.pressed_alibi = True
    elif c == 2:
        s.ask()
        s.trust_change(-5)
        s.know_relationship = True
        print("女はしばらく黙っていた。")
        print("沈黙の質が変わった。")
        print("拒否の沈黙ではない。探している沈黙だった。")
        print("言葉を。正確な言葉を。")
        print()
        print("「……私の日記を、勝手に読んだんです」")
        print()
        print("「中学生の頃からつけていた日記帳を。")
        print("  読んだだけじゃなく――返してくれなかった」")
        print()
        print("声に初めて色が付いた。")
        print("怒りではない。もっと奥にあるもの。")
        print("十年分の日記を他人に読まれた人間の、")
        print("剥き出しにされた痛み。")
        print()
        print("「別れたのに、まだ――あの人の部屋に……」")
        print()
        slow("彼女はそこで言葉を切った。")
        print("「あの人の部屋」。")
        print("半年前に別れた相手の部屋を、")
        print("まるで昨日のことのように言った。")
        print()
        print("あなたは手帳に書き留めた。")
        s.caught_diary = True
    else:
        s.trust_change(+10)
        print("女は一瞬、何を言われたかわからない顔をした。")
        print()
        print("取調室で寄り添われることを、想定していなかったのだ。")
        print("あなたの言葉は、この部屋にある全てのものと")
        print("――蛍光灯も、録音マイクも、灰色の壁も――")
        print("違う温度をしていた。")
        print()
        print("「……ありがとうございます」")
        print()
        print("目が赤くなった。泣きはしなかった。")
        print("泣くことを自分に許していない顔だった。")
        print()
        print("「最近、眠れなくて」")
        slow("「あの夜も――2時くらいまで起きてて」")
        print()
        print("自分から言った。")
        print("11時に寝たはずが、2時まで起きていた。")
        print("寄り添われたことで、嘘を一つ下ろした。")
        print("嘘を下ろす時の人間の顔は、荷物を下ろす顔に似ている。")
        print()
        print("あなたは手帳に書き留めた。")
        s.caught_time = True

    pause()


# ===================================
#  BEAT 4: 証拠
# ===================================

def beat_4(s):
    clear()
    s.header()
    print()
    print("あなたは捜査資料をめくった。")
    print("紙の音だけが、しばらく部屋に響いた。")
    print()
    print("「現場から、被害者以外の指紋が検出されています」")
    print()
    print("彼女の指が止まった。")
    print("紙コップの縁をなぞっていた指が。")

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
        print("「2時――」")
        print("長い沈黙。")
        print("蛍光灯の唸りが、一段大きくなった気がした。")
        print()
        print("「……出かけました」")
        print()
        print("彼女の声が小さくなった。")
        print("声量を落としたのではない。")
        print("声そのものが、小さくなった。")
        print()
        print("「桜台パレスに――裏口から入って――」")
        print()
        slow("また止まった。")
        print("裏口。彼女はマンションの裏口を知っている。")
        print("住んでいたのでなければ――通っていたのでなければ、")
        print("知らないはずの裏口を。")
        print()
        print("あなたは手帳に書き留めた。")
        s.caught_back_door = True
    elif "日記帳は今" in sel:
        s.trust_change(-8)
        s.caught_fingerprint = True
        print("「日記帳――」")
        print()
        print("女の目から涙がこぼれた。")
        print("初めて見る涙だった。")
        print("堪えていたのではない。出ることを知らなかった涙だった。")
        print()
        print("「……返してほしかっただけなんです」")
        print("「何度頼んでも返してくれなくて――」")
        print("「あの夜――裏口から――」")
        print()
        slow("また言葉が止まった。")
        print("「あの夜」。「裏口から」。")
        print("取りに行ったのだ。あの夜、日記帳を取り返しに。")
        print("十年分の自分を、取り戻しに。")
        print()
        print("あなたは手帳に書き留めた。")
        s.caught_back_door = True
    elif "指紋については" in sel:
        s.trust_change(-5)
        s.caught_fingerprint = True
        print("「……指紋」")
        print()
        print("彼女の手が震えた。")
        print("今度は隠さなかった。隠せなかった。")
        print()
        print("「拭けなかったんです。何も――考えられなくて」")
        print()
        slow("拭けなかった。")
        print("拭く必要があった、ということは。")
        print("触れたということは。")
        print("現場にいたということは。")
        print()
        print("あなたは手帳に書き留めた。")
        s.caught_body = True
    elif "写真" in sel:
        s.ask(-1)
        s.trust_change(-3)
        s.caught_fingerprint = True
        print("桜台パレス305号室。台所。")
        print("タイルの床に倒れた男。")
        print()
        print("彼女は写真を見た。")
        print("悲鳴は上げなかった。泣きもしなかった。")
        print("目が、少しだけ細くなった。")
        print()
        slow("――初めて見る光景ではなかった。")
        print("写真を見る人間の反応には二種類ある。")
        print("初めて見る人間の反応と、もう一度見る人間の反応。")
        print("彼女は後者だった。")
        print()
        print("あなたは手帳に書き留めた。")
        s.caught_body = True
    else:
        s.ask(-1)
        s.trust_change(+10)
        s.caught_fingerprint = True
        print("「……置いて、くれるんですか?」")
        print()
        print("彼女は驚いていた。")
        print("取調官が、追及の機会を自分から手放した。")
        print("その事実が、彼女の防壁を一枚剥がした。")
        print()
        print("「指紋は――たぶん、私のです」")
        print()
        slow("自分から言った。")
        print("圧を下げた瞬間に、壁が一つ落ちた。")

        if s.trust >= 70:
            print()
            print("「あの部屋に行きました。あの夜」")
            print("「着いたとき――もう――」")
            print()
            print("彼女は目を伏せた。")
            print("まつ毛の影が頬に落ちていた。")
            print()
            print("「動かなかったんです」")
            print()
            print("あなたは手帳に書き留めた。")
            s.caught_body = True
            s.caught_back_door = True

    pause()


# ===================================
#  BEAT 5: 転換 -- 共犯の誘惑
# ===================================

def beat_5_pivot(s):
    if s.trust < 65:
        return

    clear()
    s.header()
    print()

    print("彼女は周囲をちらりと見た。")
    print("録音マイクの赤いランプを、確認するように。")
    print("それからもう一度、あなたの目を見た。")
    print()
    slow("今までとは違う目だった。", 0.5)
    print("値踏みする目。")
    print("この人間は使えるかどうかを、測る目。")
    print()
    print("「刑事さん」")
    print()
    print("声のトーンが変わった。")
    print("取調室の空気が、一度に数度下がったような気がした。")
    print()
    print("「あなたは――私の味方ですよね?」")

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
        print("一瞬で――元の壁が戻った。")
        print("いや。元の壁より厚い壁が。")
        print()
        print("「……そうですか」")
        print()
        print("口元が引き結ばれた。")
        print("あの「お願い」は、もう出てこないだろう。")
        print("彼女はあなたを「使えない」と判断した。")
        pause()
        return

    if c == 2:
        s.trust_change(+5)
        print("彼女は少し安堵したようだった。")
        print("安堵――と呼ぶには計算された安堵だった。")
    else:
        print("沈黙。")
        print("彼女はあなたの目の中に、答えを探していた。")
        print("あなたもまた、自分の中に答えを探していた。")

    print()
    slow("「……一つだけ、お願いがあるんです」")
    print()
    print("「日記帳――私の部屋に、まだあるんです」")
    print("「中学生の頃からの、全部」")
    print()
    print("彼女の声が変わった。")
    print("練習された声ではなく、切実な声に。")
    print("これは演技か。それとも本心か。")
    print("十年の経験が、どちらとも言い切れなかった。")
    print()
    slow("「あれが見つかったら――私があの部屋に行った証拠になる」")
    print("「捜索される前に――誰かに預けてほしいんです」")
    print()

    s.asked_to_hide_diary = True

    c = choose([
        ("「それはできません」", "信頼度-10"),
        ("「考えておきます」", ""),
        ("「……わかりました」", ""),
    ])

    clear()
    print()

    if c == 1:
        s.trust_change(-10)
        print("「……そう、ですよね」")
        print()
        print("彼女は微かに笑った。")
        print("諦めた顔ではなかった。次の手を考える顔だった。")
    elif c == 2:
        s.complicity_change(+20)
        print("「ありがとうございます」")
        print()
        print("彼女は深く頭を下げた。")
        print()
        s.header()
        print()
        print("あなたは自分の呼吸が浅くなっていることに気づいた。")
        print("「考えておく」と言った。")
        print("それは「やらない」の敬語ではなく、")
        print("本当に考えてしまっている自分がいた。")
    else:
        s.complicity_change(+40)
        s.helped_hide_diary = True
        print("「本当に?」")
        print()
        print("彼女の目が光った。")
        print("安堵と――何か別のものが混じった目。")
        print("感謝か。それとも。")
        print()
        s.header()
        print()
        print("あなたの手が冷たくなっている。")
        print("取調室の冷房のせいだと思いたかった。")
        print("そうではないことは、十年の経験が知っていた。")

    pause()

    # 信頼度が高い + 共犯度がゼロでない -> 第二の頼み
    if s.complicity > 0 and s.trust >= 55:
        beat_5b_second_request(s)


def beat_5b_second_request(s):
    clear()
    s.header()
    print()

    print("彼女はさらに身を乗り出した。")
    print("コーヒーの紙コップが机の端に押しやられた。")
    print("もうコーヒーのことは忘れている。")
    print()
    print("「もう一つだけ」")
    print()
    slow("「指紋のデータ――照合前に、消してもらえませんか」")
    print()
    print("あなたの背筋が冷えた。")
    print("日記帳を預けるのとは、次元が違う。")
    print("証拠の改竄。")
    print("あなたの十年のキャリアが、一瞬で消える。")
    print()
    print("「私、殺してないんです。本当に」")
    print("「でも指紋が合ったら――もう終わりなんです」")
    print()
    print("彼女は泣いていなかった。")
    print("泣く余裕がないほど、必死だった。")

    s.asked_to_lose_prints = True

    c = choose([
        ("「それは――絶対にできない」", "信頼度-20"),
        ("「……なぜ、私にそんなことを頼めると思ったんですか」", ""),
        ("「わかりました」", ""),
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
        print("壁が戻った。今度は――最初よりも厚い壁が。")
        print()
        print("あなたは刑事だ。")
        print("取り調べは続く。")
        print("背筋の冷えは、少しずつ消えていった。")
    elif c == 2:
        print("「えっ」")
        print()
        print("彼女は一瞬たじろいだ。")
        print()
        print("「……あなたが、優しかったから」")
        print("「味方だと――思ったから」")
        print()
        slow("あなたは理解した。")
        print("信頼は、武器にもなる。")
        print("彼女にとって、あなたの優しさは――利用できる隙間だった。")
        print()
        print("それは悪意ではない。生存本能だ。")
        print("追い詰められた人間が、手を伸ばせる相手に手を伸ばした。")
        print("あなたもそれを、理解できてしまう。")
        print("理解できてしまうことが、問題だった。")
        s.complicity_change(+5)
    else:
        s.complicity_change(+50)
        s.helped_lose_prints = True
        print("「……ありがとうございます」")
        print()
        print("彼女は泣いていた。")
        print("感謝の涙か、安堵の涙か――")
        print("あなたにはもう、区別がつかなかった。")
        print()
        s.header()
        print()
        print("蛍光灯の音が、耳鳴りのように聞こえる。")
        print("あなたの中で、何かが不可逆に傾いた。")
        print("十年かけて積み上げたものが、")
        print("たった二言で崩れようとしている。")

    pause()


# ===================================
#  BEAT 6: 取調の逆転 (Phase 3)
# ===================================

def beat_6_reversal(s):
    """Phase 3: 彼女がプレイヤー(刑事)に質問を始める。
    手帳の記録が自分に跳ね返る。立場が反転する。"""

    # 共犯度がある程度あるか、信頼度が高い場合にのみ発動
    if s.complicity < 10 and s.trust < 60:
        return

    s.reversal_triggered = True

    clear()
    s.header()
    print()

    if s.complicity >= 40:
        # 高共犯: 彼女はレバレッジを持っている
        print("彼女の姿勢が変わった。")
        print("背もたれに体を預けて、初めてリラックスしたように見えた。")
        print("――いや、違う。")
        print("リラックスしたのではない。力関係が変わったのだ。")
        print()
        slow("「刑事さん」")
        print()
        print("「一つ、聞いてもいいですか」")
        print()
        print("聞いてもいいですか、と彼女は言った。")
        print("取調室でその台詞を言うのは、いつも椅子のこちら側だ。")
        print()
        print("「あなたはなぜ、私にそんなに優しくしてくれたんですか」")
    elif s.trust >= 60:
        # 高信頼: 彼女は別の角度から切り込む
        print("彼女はあなたを見ていた。")
        print("今までとは違う目だった。")
        print("観察する目。")
        print("取調官が容疑者を見る時の、あの目。")
        print()
        slow("「刑事さん」")
        print()
        print("「ひとつだけ、聞いてもいいですか」")
        print()
        print("「あなたの手帳に――何を書いたんですか」")
    else:
        # 低信頼だが共犯度あり: 追い詰められた反撃
        print("彼女の目に、新しい光が灯った。")
        print("追い詰められた動物が、最後に見せる目。")
        print()
        slow("「刑事さん。一つだけ」")
        print()
        print("「あなたの取調は、録音されていますよね」")
        print("「私がお願いしたこと――あなたが何と答えたか」")
        print("「全部、残っていますよね」")

    print()

    # Phase 3 の選択: 刑事がどう応じるか
    options = []

    if s.complicity >= 20:
        options.append(("正直に答える",
                        ""))
        options.append(("「質問をしているのは私です」",
                        "信頼度-10"))

    if s.caught_count() >= 2:
        options.append(("手帳を見せる",
                        ""))

    options.append(("黙る",
                    ""))

    c = choose(options)
    sel = options[c - 1][0]

    clear()
    print()

    if "正直" in sel:
        s.detective_admitted = True
        print("あなたは少し考えた。")
        print("嘘をつくこともできた。ここは取調室で、")
        print("椅子のこちら側にいるのはあなただ。")
        print()
        print("でも――")
        print()
        slow("「あなたの話を聞いていたら」")
        print("「殺していない人間の声だと思った」")
        print("「証拠を消すことはできない。でも、信じている」")
        print()
        print("彼女の目が揺れた。")
        print("計算ではない揺れだった。")
        print()
        if s.helped_hide_diary or s.helped_lose_prints:
            print("「でも――あなたは、もう線を越えていますよね」")
            print()
            slow("あなたは答えられなかった。")
            print("彼女の言う通りだった。")
        else:
            print("「……本当に、信じてくれるんですか」")
            print()
            print("彼女の声から、初めて、")
            print("計算が完全に消えた。")

    elif "質問をしている" in sel:
        s.trust_change(-10)
        print("あなたは声を固くした。")
        print("取調官の声に戻した。")
        print()
        print("「ここは取調室です。質問をしているのは私です」")
        print()
        print("彼女は一瞬、怯んだ。")
        print("だがすぐに――微かに笑った。")
        print()
        print("「そうですね。でも刑事さん」")
        slow("「あなたの手帳を、私の弁護士が見ることになったら」")
        print("「あなたが何に気づいて、何を見逃したか」")
        print("「全部わかりますよね」")
        print()
        print("蛍光灯の音が、急に大きくなった。")
        print("彼女は笑っていなかった。もう。")

    elif "手帳を見せる" in sel:
        s.detective_showed_notebook = True
        print("あなたは手帳を開いて、机の上に置いた。")
        print()
        labels = s.contradiction_labels()
        for label in labels:
            print(f"  {label}")
        print()
        print("彼女は手帳を見た。")
        print("一つ一つの言葉を、指でなぞるようにして。")
        print()
        slow("「……全部、気づいていたんですね」")
        print()
        if s.complicity >= 20:
            print("「気づいていて――それでも、私のお願いを」")
            print()
            print("あなたは黙っていた。")
            print("手帳に書かれた矛盾が、")
            print("今度はあなた自身の矛盾を映していた。")
            print("全て気づいていて、なぜ助けようとした?")
        else:
            print("「全部知っていて、追い詰めなかった」")
            print()
            print("「あなたは――不思議な刑事ですね」")
            print()
            print("その声には、敵意がなかった。")
            print("初めて、取調室の中に、")
            print("蛍光灯以外のあたたかさがあった。")

    else:  # 黙る
        s.detective_lied = False
        print("あなたは黙っていた。")
        print("取調官は沈黙する権利がある。")
        print("容疑者だけが、沈黙を疑われる。")
        print()
        print("「……そうですか」")
        print()
        if s.complicity >= 20:
            print("彼女は微かに笑った。")
            print("「黙秘権、ですか」")
            print()
            print("その言葉の意味を、あなたは理解した。")
            print("取調官が黙秘権を行使する。")
            print("この取調室で、いつの間にか、")
            print("椅子の向こう側とこちら側が入れ替わっていた。")
        else:
            print("彼女は何も言わなかった。")
            print("沈黙が、沈黙と向かい合っていた。")
            print("長い時間が過ぎた。")

    pause()


# ===================================
#  BEAT 7: 最終
# ===================================

def beat_final(s):
    clear()
    s.header()
    print()
    print("時計が鳴った。")
    print("コーヒーはとっくに冷めて、")
    print("紙コップの中で茶色い液体が動かなくなっていた。")
    print()

    # 共犯度が高い場合の特殊分岐
    if s.complicity >= 50:
        return ending_complicity(s)

    # Phase 3で正直に答えた + 信頼度が高い -> 相互告白
    if s.detective_admitted and s.trust >= 50:
        return ending_mutual(s)

    # 手帳を見せた + 矛盾が多い -> 推理エンディング（改良版）
    if s.detective_showed_notebook and s.caught_count() >= 3:
        return ending_deduction(s)

    if s.trust >= 70:
        print("彼女はあなたの目を見ていた。")
        print("取調室に入ってきた時とは、違う目だった。")
    elif s.trust >= 40:
        print("彼女は疲れた顔をしていた。")
        print("だが、まだこちらを見ている。")
    else:
        print("彼女は腕を組んで、目を逸らしていた。")
        print("もうこの部屋にいたくない顔だった。")

    print()
    caught = s.caught_count()

    options = []

    if caught >= 2:
        options.append(("手帳を開いて、矛盾を突きつける",
                        f"{' / '.join(s.contradiction_labels())}"))

    if s.trust >= 70 and s.complicity == 0:
        options.append(("「あなたのことは、私が守ります」",
                        f"信頼度{s.trust}"))

    if s.show_complicity and 0 < s.complicity < 50:
        options.append(("「あなたが頼んだこと――忘れてください」",
                        "清算する"))

    options.append(("「全部話してください」", "-1問"))
    options.append(("「あなたを信じます」", f"信頼度{s.trust}"))

    c = choose(options)
    sel = options[c - 1][0]

    if "手帳を開いて" in sel:
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
    print("ページの端が少し折れている。")
    print("書き留めるたびに、無意識に折っていた。")
    print()
    print("「橘さん。いくつか、確認させてください」")
    print()
    print("彼女の目が揺れた。手帳を見ている。")

    while True:
        print()
        options = []

        if s.caught_kitchen and "kitchen" not in presented:
            options.append(("「台所」", "kitchen",
                            "あなたは「台所」と言いかけて言い直しました。"
                            "事件が台所で起きたことは――まだ伝えていません"))
        if s.caught_time and "time" not in presented:
            options.append(("「2時」", "time",
                            "11時に寝たと言いましたが、2時まで起きていた"))
        if s.caught_back_door and "back_door" not in presented:
            options.append(("「裏口」", "back_door",
                            "裏口の存在を知っていました。"
                            "最近あのマンションに行っていなければ――知らないはずの"))
        if s.caught_diary and "diary" not in presented:
            options.append(("「日記帳」", "diary",
                            "日記帳を――まるで最近まで取り返そうとしていたように"))
        if s.caught_body and "body" not in presented:
            options.append(("「遺体」", "body",
                            "現場の写真を見ても、驚かなかった。一度見た光景だから"))

        if not options:
            break

        if presented:
            options.append(("――以上です", "done", ""))

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
            print("「……それは――」")
        elif count == 2:
            print("女の目が泳いだ。")
            print("「偶然です。ただの――」")
        elif count == 3:
            print("女の手が震え始めた。")
            print("「やめてください――」")
        elif count >= 4:
            print("女は両手で顔を覆った。")
            print("指の隙間から、声が漏れた。")

        s.trust_change(-3)
        pause()

        clear()
        s.header()

    clear()
    print()

    if len(presented) >= 4:
        return ending_deduction(s)
    elif len(presented) >= 2:
        return ending_confession(s)
    else:
        return ending_insufficient(s)


# ===================================
#  エンディング
# ===================================

def ending_deduction(s):
    print("=" * 52)
    print()
    slow("", 0.5)

    print("「あなたはあの夜、あの部屋にいた」")
    print("「合鍵で裏口から入った。おそらく午前2時頃」")
    print()
    print("「でも――殺してはいない」")
    print()
    slow("女は両手で顔を覆った。")
    print()
    print("「……なぜ――そう思うんですか」")
    print()
    print("「あなたの嘘は全部、「隠すため」の嘘でした」")
    print("「殺した人間の嘘は――もっと違う形をしている」")
    print("「十年で覚えたことがあります。")
    print("  嘘には手触りがある。あなたの嘘は、守るための嘘だった」")
    print()
    slow("彼女は顔を上げた。涙の跡が蛍光灯に光っていた。")
    print()
    print("「……日記帳を取り返しに行ったんです」")
    print("「でも着いたら――もう――」")
    print("「あの人は動かなかった」")
    print()
    print("「怖くなって、日記帳だけ持って逃げました」")
    print("「指紋のことも何も――頭が真っ白で」")
    print()
    slow("「殺してません。でも――」")
    print("「誰にも信じてもらえないと思って」")
    print()
    print("あなたは十年の経験で知っている。")
    print("殺した人間と、隠している人間の嘘は違う。")
    print("彼女の嘘は――ずっと、隠す側の嘘だった。")
    print()
    print(f"  -- ENDING A: 推理 --  (全8種)")
    print(f"  手帳{s.caught_count()}件 / 信頼度{s.trust}")
    print()
    print("=" * 52)
    print()


def ending_trust(s):
    print("=" * 52)
    print()
    print("「あなたのことは、私が守ります」")
    print()
    slow("女はあなたを見た。")
    print("長い間、何も言わなかった。")
    print("蛍光灯の唸りだけが聞こえていた。")
    print()
    print("「……本当に?」")
    print()
    print("「ここに来てから――あなたは一度も、」")
    print("「追い詰めようとしなかった」")
    print()
    slow("「あの夜――日記帳を取りに行きました」")
    print("「合鍵で裏口から。午前2時。雨が降ってて」")
    print()
    print("「部屋に入ったら――」")
    print()
    slow("「あの人は、もう――」")
    print("「台所で、倒れてた」")
    print()
    print("「怖くなって、日記帳だけ持って逃げました」")
    print("「殺してません――でも誰にも信じてもらえないと思って」")
    print()
    slow("追い詰めたのではなかった。")
    print("彼女が――信じられる相手に、話すことを選んだ。")
    print()
    print(f"  -- ENDING B: 信頼 --  (全8種)")
    print(f"  信頼度{s.trust}")
    print()
    if not s.caught_kitchen:
        print("  ……彼女は一度、不自然な言い間違いをしていた。")
        print("  あなたはそれに気づかなかった。")
        print()
    print("=" * 52)
    print()


def ending_confession(s):
    print("=" * 52)
    print()
    print("「全部話してください。最初から」")
    print()
    slow("長い沈黙。蛍光灯が一度、瞬いた。")
    print()
    print("「……あの夜、出かけました」")
    print()
    if s.caught_diary:
        print("「日記帳を取りに――」")
    else:
        print("「どうしても、取り返さないといけないものがあって」")
    print()
    if s.caught_back_door:
        print("「裏口から入りました。合鍵で」")
    else:
        print("「鍵を持っていたから……入れてしまったんです」")
    print()
    if s.caught_body:
        print("「着いたとき――もう、あの人は動かなかった」")
        print()
        print("「怖くなって逃げました。それだけです」")
    else:
        print("「……それ以上は」")
        print("彼女はそこで口を閉ざした。")
    print()
    slow("")
    unknown = []
    if not s.caught_diary: unknown.append("動機")
    if not s.caught_back_door: unknown.append("侵入経路")
    if not s.caught_body: unknown.append("現場の状況")
    if unknown:
        print(f"  -- ENDING C: 断片 --  (全8種)")
        print(f"  未解明: {', '.join(unknown)}")
        print(f"  別の質問をしていれば、違う答えが返ってきたかもしれない。")
    else:
        print(f"  -- ENDING C: 告白 --  (全8種)")
    print(f"  信頼度{s.trust} / 残り質問{s.questions}")
    print()
    print("=" * 52)
    print()


def ending_insufficient(s):
    print("=" * 52)
    print()
    if s.trust >= 50:
        print("「……出かけました」")
        print("彼女は小さく言った。")
        print()
        print("「でも――それ以上は今は言えません」")
    else:
        print("「弁護士を通してください」")
        print()
        print("壁は閉じた。完全に。")
        print("蛍光灯の光だけが、灰色の壁を照らしていた。")
    print()
    unknown = []
    if not s.caught_kitchen: unknown.append("台所の言い間違い")
    if not s.caught_time: unknown.append("深夜の空白")
    if not s.caught_diary: unknown.append("日記帳")
    if not s.caught_back_door: unknown.append("裏口")
    if not s.caught_body: unknown.append("遺体を見たこと")
    print(f"  -- ENDING D: 手がかり不足 --  (全8種)")
    if unknown:
        print(f"  気づけなかったこと: {', '.join(unknown)}")
    print(f"  信頼度{s.trust} / 残り質問{s.questions}")
    print()
    print("  最初の質問を変えれば、全く違う取調になる。")
    print()
    print("=" * 52)
    print()


def ending_complicity(s):
    """共犯エンディング"""
    print("=" * 52)
    print()
    slow("", 0.5)

    print("彼女は立ち上がった。")
    print("初めて――取調室で立ち上がった。")
    print("椅子が小さく軋んだ。")
    print()
    print("「ありがとうございました、刑事さん」")
    print()
    slow("")

    if s.helped_lose_prints:
        print("あなたは彼女のために、指紋データに手を加える。")
        print("日記帳は、もう見つからない場所にある。")
        print()
        print("彼女は無罪放免になるだろう。")
        print("そしてあなたは――")
        print()
        slow("「刑事さん」")
        print()
        print("「あなたが何をしたか――私だけが知っています」")
        print()
        print("微笑んでいた。")
        print("取調室に入ってきた時と同じ、穏やかな微笑み。")
        print("あの時は怯えだと思った。")
        print("違った。")
        print()
        print("あなたは理解した。")
        slow("取調を受けていたのは、最初から――")
        print()
        time.sleep(1.0)
        print("あなたの方だった。")
        print()
        print(f"  -- ENDING E: 共犯 --  (全8種)")
        print(f"  信頼度{s.trust}")
        print()
        print("  信頼度を上げるほど、彼女はあなたを利用できた。")
        print("  優しさは、武器だった。")
    else:
        print("あなたは日記帳のことを「考えておく」と言った。")
        print("指紋のことも。")
        print()
        print("やるつもりはなかった。")
        print("でも――考えている自分がいた。")
        print()
        slow("「刑事さん、また来てくれますか」")
        print()
        print("彼女の目は、信頼の目だった。")
        print("信頼――と呼べるのなら。")
        print()
        print("あなたは取調室を出た。")
        print("手帳を見た。書き留めた矛盾。")
        print("証拠は十分だ。彼女を有罪にできる。")
        print()
        print("できる。")
        slow("できるのに――")
        print()
        print("あなたの足は、証拠保管室の方を向いていた。")
        print()
        print(f"  -- ENDING F: 揺らぎ --  (全8種)")
        print(f"  信頼度{s.trust}")
        print()
        print("  あなたはまだ線を越えていない。")
        print("  でも――越えようとしている。")

    print()
    print("=" * 52)
    print()


def ending_reset(s):
    """共犯度を清算するエンディング"""
    print("=" * 52)
    print()
    slow("")

    print("「橘さん」")
    print()
    print("「あなたが頼んだこと――日記帳のことも、指紋のことも」")
    print("「忘れてください。私にはできません」")
    print()
    slow("彼女は一瞬、傷ついた顔をした。")
    print("それから――少しだけ、安堵した顔。")
    print("傷ついた顔は演技かもしれない。")
    print("安堵は、演技ではなかった。")
    print()
    print("「……そうですよね」")
    print()
    print("「おかしなことを言って、すみません」")
    print("「でも――」")
    print()
    slow("「聞いてくれて、ありがとうございます」")
    print()
    print("「全部話します。最初から」")
    print()
    slow("")

    print("「あの夜――日記帳を取りに行ったんです」")
    print("「合鍵で裏口から。午前2時」")
    print("「着いたら――もう、動かなかった」")
    print()
    print("「怖くなって、日記帳だけ持って逃げました」")
    print("「殺してません。本当に」")
    print()
    slow("あなたは、一度は線を越えかけた。")
    print("でも戻ってきた。")
    print("刑事として――戻ってきた。")
    print("背筋の冷えが消えていくのがわかった。")
    print()
    print(f"  -- ENDING G: 清算 --  (全8種)")
    print(f"  信頼度{s.trust}")
    print()
    print("  共犯の誘いを断ち切り、真実にたどり着いた。")
    print("  あなたの優しさは、最後に正しい場所に着地した。")
    print()
    print("=" * 52)
    print()


def ending_mutual(s):
    """相互告白: 刑事も正直に答え、彼女も全てを話す"""
    print("=" * 52)
    print()
    slow("")

    print("二人とも、しばらく黙っていた。")
    print("蛍光灯の唸りだけが聞こえていた。")
    print()
    print("「橘さん」")
    print()
    print("「私は刑事です。あなたを守ることはできない」")
    print("「でも――あなたの話を、最後まで聞くことはできます」")
    print()
    slow("彼女は紙コップを置いた。")
    print("両手を膝の上で組んだ。")
    print("組んだ手が震えていた。")
    print()
    print("「……全部、話します」")
    print()
    print("「あの夜、午前2時。雨が降っていました」")
    print("「日記帳を取り返しに行ったんです」")
    print("「合鍵で裏口から入って――」")
    print()
    slow("「台所で、あの人が倒れていました」")
    print()
    print("「包丁が刺さっていました。動かなかった」")
    print("「日記帳だけ持って、逃げました」")
    print("「指紋を拭くことも――何も考えられなくて」")
    print()
    slow("")
    print("「殺してません」")
    print()
    print("「でも誰にも信じてもらえないと思って」")
    print("「だから嘘をついた。全部」")
    print()
    slow("彼女は顔を上げた。")
    print()
    print("「あなたに話したのは――」")
    print("「あなたが、正直に答えてくれたからです」")
    print()
    print("取調室の空気が変わった。")
    print("蛍光灯はまだ唸っている。")
    print("でもその音が、さっきよりも遠くなった気がした。")
    print()
    print(f"  -- ENDING H: 相互供述 --  (全8種)")
    print(f"  信頼度{s.trust} / 手帳{s.caught_count()}件")
    print()
    print("  取調官と容疑者が、ともに正直になった。")
    print("  これは取調の成功ではない。")
    print("  二人の人間が向かい合った、ただそれだけのこと。")
    print()
    print("=" * 52)
    print()


def ending_timeout(s):
    clear()
    print()
    print("=" * 52)
    print()
    print("質問は尽きた。")
    print("女は立ち上がり、ドアへ向かった。")
    print("紙コップがテーブルの上に残された。口紅の跡が付いたまま。")
    print()
    print("「……お疲れさまでした、刑事さん」")
    print()
    print(f"  -- ENDING D: 時間切れ --  (全8種)")
    print()
    print("=" * 52)
    print()


def ending_trust_zero(s):
    clear()
    print()
    print("=" * 52)
    print()
    print("「弁護士を呼んでください」")
    print()
    print("女の声は冷たかった。")
    print("紙コップに触れもしなかった。")
    print()
    print(f"  -- ENDING D: 信頼崩壊 --  (全8種)")
    print()
    print("=" * 52)
    print()


# ===================================
#  メイン
# ===================================

def main():
    s = State()
    beats = [beat_1, beat_2, beat_3, beat_4, beat_5_pivot, beat_6_reversal, beat_final]

    for beat in beats:
        beat(s)
        end = s.game_over()
        if end:
            (ending_timeout if end == "timeout" else ending_trust_zero)(s)
            return


if __name__ == "__main__":
    main()
