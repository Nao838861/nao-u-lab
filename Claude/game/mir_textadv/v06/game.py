#!/usr/bin/env python3
"""mir_textadv v06 -- メディア反転

コンセプト:
  取調室テキストADVだと思って遊んでいたら、
  それは被疑者が書いている「小説」だった。
  プレイヤーは読者から書き手に変わり、
  小説の続きを書くことで現実の結末が変わる。

  ジャンル変容: テキストADV → 執筆シミュレーション

Phase構造:
  Phase 1 (beat 1-3): 取調ゲーム。v05の核を凝縮
  THE BREAK (beat 4): 現実の裂け目。テキストが原稿になる
  Phase 2 (beat 5-6): 執筆モード。プレイヤーが物語の続きを書く
  Ending: 書いた内容が現実の結末を決める

設計ゲート:
  F-07: メカニクス名=ゲーム内事象。「執筆」は実際にプレイヤーが行う
  大多数到達: THE BREAKは全員に発火（中盤固定イベント）
  核動作⇄報酬距離ゼロ: 「書く→物語が立ち上がる」=即時
"""

import os
import time
import textwrap

# ===================================
#  ユーティリティ
# ===================================

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def pause():
    input("\n[Enter]")

def slow(text="", wait=0.4):
    if text:
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


def choose_write(options):
    """執筆モード用の選択UI。選択肢が原稿の一行として表示される"""
    print()
    print("  次の一行を書く:")
    print()
    for i, line in enumerate(options, 1):
        print(f"    {i}.  {line}")
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
        # Phase 1
        self.trust = 50
        self.questions = 8
        self.caught_kitchen = False
        self.caught_time = False
        self.caught_diary = False
        self.caught_fingerprint = False
        self.know_relationship = False
        self.pressed_alibi = False
        self.was_gentle = False  # 寄り添う選択をしたか

        # Phase 2 (執筆モード)
        self.manuscript = []  # プレイヤーが書いた行
        self.wrote_truth = False
        self.wrote_fiction = False
        self.wrote_confession = False
        self.wrote_escape = False

    def ask(self, n=1):
        self.questions = max(0, self.questions - n)

    def trust_change(self, d):
        self.trust = max(0, min(100, self.trust + d))

    def trust_text(self):
        if self.trust >= 80: return "心を開いている"
        if self.trust >= 60: return "警戒が薄い"
        if self.trust >= 40: return "様子を窺っている"
        if self.trust >= 20: return "壁を作っている"
        return "拒絶"

    def header(self):
        print("+" + "-" * 50 + "+")
        bar = "#" * (self.trust // 10) + "." * (10 - self.trust // 10)
        print(f"  信頼度  [{bar}]  {self.trust}  {self.trust_text()}")
        print(f"  残り質問  {self.questions}")
        labels = []
        if self.caught_kitchen: labels.append("台所")
        if self.caught_time: labels.append("2時")
        if self.caught_diary: labels.append("日記帳")
        if self.caught_fingerprint: labels.append("指紋")
        if labels:
            print(f"  手帳  {' / '.join(labels)}")
        print("+" + "-" * 50 + "+")

    def manuscript_header(self):
        """執筆モードのヘッダー"""
        print("+" + "-" * 50 + "+")
        print("  原稿用紙")
        if self.manuscript:
            print(f"  {len(self.manuscript)}行")
        print("+" + "-" * 50 + "+")

    def show_manuscript(self):
        """これまでに書いた原稿を表示"""
        if not self.manuscript:
            return
        print()
        print("  ---- これまでの原稿 ----")
        for line in self.manuscript:
            print(f"  {line}")
        print("  -------------------------")


# ===================================
#  PHASE 1: 取調ゲーム
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
    print("嘘の形は、もう手触りで分かる。")
    print()
    print("手元の捜査資料。野上誠一、35歳。")
    print("昨夜、桜台パレス305号室の台所で刺殺体で発見。")
    print()
    print("女は机の向こう側に座っている。")
    print("両手で紙コップを包むようにして、こちらを見ていた。")
    print()
    slow("「もう話すことは全部話しましたよ、刑事さん」")
    print()
    print("声に震えはない。静かすぎた。")
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
    else:
        s.ask(-1)
        s.trust_change(+10)
        s.was_gentle = True
        print("「……ありがとうございます」")
        print()
        print("少し驚いた顔だった。")
        print("刑事に「お時間」を求められるとは思っていなかったらしい。")
        print("初めて、練習していない表情が出た。")
        print()
        print("「ええ。大丈夫です」")

    pause()


def beat_2(s):
    clear()
    s.header()
    print()

    if not s.know_relationship:
        print("彼女は自分から話し始めた。")
        print()
        print("「あの人とは半年前に別れています」")
        s.know_relationship = True
        print()

    print("「あの夜は何もなかったんです。")
    print("  いつもと同じで、台所――」")
    print()
    slow("彼女の口が止まった。", 0.5)
    print()
    print("「――お風呂場の、電気を消して、寝ました」")
    print()
    print("台所。")
    print("被害者は台所で発見されている。")
    print("だがその情報は――まだ彼女には伝えていない。")

    c = choose([
        ("「台所、と言いかけましたね」", "-1問 / 信頼度-10 / 追及"),
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
        print("「言い間違いです」")
        print()
        print("人間は、気にしていないことを言い間違えない。")
        print("あなたは手帳に書き留めた。")
    else:
        s.trust_change(+5)
        s.caught_kitchen = True
        s.was_gentle = True
        print("あなたは手帳に「台所」と書いた。")
        print("彼女には見えないように、膝の上で。")
        print()
        print("彼女は少し安心したようだった。")
        print("追及されなかったことに。")
        print("安心した顔は、嘘をついている人間の顔だ。")

    pause()


def beat_3(s):
    clear()
    s.header()
    print()

    c = choose([
        ("「昨夜のテレビは何を?」",
         "-1問 / 信頼度-5 / アリバイ検証"),
        ("「野上さんとは、なぜ別れたんですか」",
         "-1問 / 信頼度-5 / 関係を掘る"),
        ("「……つらいですよね」",
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
        slow("「――2時くらいまでは起きてたかもしれません」")
        print()
        print("嘘が一つ崩れた。")
        print("あなたは手帳に書き留めた。")
        s.caught_time = True
    elif c == 2:
        s.ask()
        s.trust_change(-5)
        print("女はしばらく黙っていた。")
        print()
        print("「……私の日記を、勝手に読んだんです」")
        print()
        print("「中学生の頃からつけていた日記帳を。")
        print("  読んだだけじゃなく――返してくれなかった」")
        print()
        print("声に初めて色が付いた。怒りではない。")
        print("十年分の日記を他人に読まれた人間の、剥き出しの痛み。")
        print()
        print("「別れたのに、まだ――あの人の部屋に……」")
        print()
        slow("彼女はそこで言葉を切った。")
        print("あなたは手帳に書き留めた。")
        s.caught_diary = True
    else:
        s.trust_change(+10)
        s.was_gentle = True
        print("女は一瞬、何を言われたかわからない顔をした。")
        print()
        print("「……ありがとうございます」")
        print()
        print("目が赤くなった。泣きはしなかった。")
        print("泣くことを自分に許していない顔だった。")
        print()
        print("「最近、眠れなくて」")
        slow("「あの夜も――2時くらいまで起きてて」")
        print()
        print("自分から言った。嘘を一つ下ろした。")
        print("あなたは手帳に書き留めた。")
        s.caught_time = True

    pause()

    # 指紋の質問
    clear()
    s.header()
    print()
    print("「現場から、被害者以外の指紋が検出されています」")
    print()
    print("彼女の指が止まった。")

    c = choose([
        ("「指紋については、心当たりは」", "-1問 / 信頼度-5"),
        ("「指紋の件は、今は置いておきましょう」", "信頼度+10"),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        s.ask()
        s.trust_change(-5)
        s.caught_fingerprint = True
        print("「……拭けなかったんです。何も――考えられなくて」")
        print()
        print("拭けなかった。")
        print("拭く必要があった、ということは――")
        print("あなたは手帳に書き留めた。")
    else:
        s.trust_change(+10)
        s.caught_fingerprint = True
        s.was_gentle = True
        print("「……置いて、くれるんですか?」")
        print()
        print("「指紋は――たぶん、私のです」")
        print()
        print("自分から言った。圧を下げた瞬間に、壁が落ちた。")

    pause()


# ===================================
#  THE BREAK: 現実の裂け目
# ===================================

def the_break(s):
    clear()
    s.header()
    print()
    print("彼女は紙コップを置いた。")
    print("コーヒーはもう冷めきっている。")
    print()

    slow("「刑事さん」")
    print()
    slow("「ひとつだけ――」")
    print()

    # テキストが不安定になる
    time.sleep(1.0)
    clear()
    print()
    print("「ひとつだけ――」")
    time.sleep(0.5)
    print()
    print("    「ひとつだけ――」")
    time.sleep(0.5)
    print()
    print("        「ひとつだけ」")
    time.sleep(0.8)

    clear()
    print()
    print()
    print()
    slow("彼女は紙コップを置いた。", 0.8)
    slow("コーヒーはもう冷めきっている。", 0.8)
    print()
    slow("彼女は紙コップを置いた。", 0.6)
    slow("コーヒーは", 0.4)
    print()
    time.sleep(1.0)

    # 原稿であることが露呈する
    clear()
    print()
    print()
    print()
    time.sleep(0.5)
    slow("                  ――第三章 終わり――", 1.0)
    print()
    print()
    time.sleep(1.5)

    clear()
    print()
    print("  ……")
    print()
    time.sleep(1.0)
    print("  あなたが読んでいたのは、原稿でした。")
    print()
    time.sleep(1.5)
    print("  取調室はありません。")
    print("  刑事もいません。")
    print("  橘詩織は――本当にいます。")
    print()
    time.sleep(1.5)
    print("  彼女はこの原稿を、留置場の中で書きました。")
    print("  大学ノートに、ボールペンで。")
    print("  「自分がどうしてここにいるのか」を、")
    print("  小説の形でしか書けなかった。")
    print()
    time.sleep(1.5)
    print("  あなたは今まで、彼女の小説を読んでいたのです。")
    print()
    pause()

    clear()
    print()
    print("=" * 52)
    print()
    print("  留置場  独居房")
    print()
    print("  橘 詩織 は大学ノートを閉じた。")
    print("  三章まで書いた。")
    print("  あの夜のことを、小説でしか書けなかった。")
    print()
    print("  担当弁護士が言った。")
    print("  「あなたの言葉で書いてください」")
    print("  「何があったのか」")
    print()
    print("  彼女はペンを握っている。")
    print("  続きを書かなければならない。")
    print()
    print("  ――でも、ここからは、あなたが書いてください。")
    print()
    print("=" * 52)
    pause()


# ===================================
#  PHASE 2: 執筆モード
# ===================================

def writing_phase_1(s):
    """執筆モード: 最初の一行"""
    clear()
    s.manuscript_header()
    print()
    print("大学ノートが開かれている。")
    print("三章までは詩織の字で埋まっている。")
    print("あなたが読んだ、あの取調室の物語。")
    print()
    print("四章目は白紙だ。")
    print("ペンは、あなたの手にある。")

    if s.was_gentle:
        print()
        print("（あなたは彼女に寄り添う選択をしてきた。")
        print("  その刑事は、あなたが書いた人物だ）")

    print()
    print("最初の一行を書く。")

    c = choose_write([
        "彼女は本当のことを話し始めた。",
        "彼女はまだ嘘をついていた。",
        "彼女はペンを置いた。もう書けなかった。",
    ])

    if c == 1:
        s.manuscript.append("彼女は本当のことを話し始めた。")
        s.wrote_truth = True
    elif c == 2:
        s.manuscript.append("彼女はまだ嘘をついていた。")
        s.wrote_fiction = True
    else:
        s.manuscript.append("彼女はペンを置いた。もう書けなかった。")

    clear()
    s.manuscript_header()
    s.show_manuscript()
    print()
    slow("一行が紙の上に現れた。")
    print("大学ノートの罫線の上に、あなたの字で。")
    pause()


def writing_phase_2(s):
    """執筆モード: あの夜のこと"""
    clear()
    s.manuscript_header()
    s.show_manuscript()
    print()

    if s.wrote_truth:
        print("彼女が本当のことを話す。")
        print("あの夜、何があったのか。")
        print()
        print("次の一行を書く。")

        c = choose_write([
            "「あの夜、日記帳を取りに行きました」",
            "「あの夜、あの人に会いに行きました」",
            "「あの夜、私は家にいました」と彼女は繰り返した。",
        ])

        if c == 1:
            s.manuscript.append("「あの夜、日記帳を取りに行きました」")
            s.wrote_confession = True
        elif c == 2:
            s.manuscript.append("「あの夜、あの人に会いに行きました」")
            s.wrote_confession = True
        else:
            s.manuscript.append("「あの夜、私は家にいました」と彼女は繰り返した。")
            s.wrote_fiction = True

    elif s.wrote_fiction:
        print("彼女はまだ嘘をついている。")
        print("小説の中の彼女も、現実の彼女も。")
        print()
        print("次の一行を書く。")

        c = choose_write([
            "しかし刑事は気づいていた。彼女の嘘の形に。",
            "刑事もまた、彼女の嘘に付き合うことにした。",
            "嘘は、彼女が自分を守る唯一の方法だった。",
        ])

        if c == 1:
            s.manuscript.append("しかし刑事は気づいていた。彼女の嘘の形に。")
        elif c == 2:
            s.manuscript.append("刑事もまた、彼女の嘘に付き合うことにした。")
        else:
            s.manuscript.append("嘘は、彼女が自分を守る唯一の方法だった。")

    else:
        print("ペンを置いた彼女。")
        print("でもあなたはまだ書ける。")
        print("彼女の代わりに。")
        print()
        print("次の一行を書く。")

        c = choose_write([
            "――だが、物語は続いていた。彼女の中で。",
            "ノートは白紙のまま、弁護士の机に届いた。",
            "彼女は新しいページを開いた。今度は小説ではなく。",
        ])

        if c == 1:
            s.manuscript.append("――だが、物語は続いていた。彼女の中で。")
        elif c == 2:
            s.manuscript.append("ノートは白紙のまま、弁護士の机に届いた。")
            s.wrote_escape = True
        else:
            s.manuscript.append("彼女は新しいページを開いた。今度は小説ではなく。")
            s.wrote_truth = True

    clear()
    s.manuscript_header()
    s.show_manuscript()
    print()
    slow("原稿が一行、増えた。")
    pause()


def writing_phase_3(s):
    """執筆モード: 結末を書く"""
    clear()
    s.manuscript_header()
    s.show_manuscript()
    print()

    print("あと一行で、この物語は終わる。")
    print("あなたが書いた結末が、彼女の供述になる。")
    print()
    print("大学ノートは弁護士に届く。")
    print("弁護士はそれを検察官に見せる。")
    print("あなたの書いた最後の一行が、")
    print("彼女の運命を変える。")
    print()

    if s.wrote_escape:
        print("（ノートは白紙だ。何も書かれていない。")
        print("  弁護士は白紙のノートを受け取る）")
        print()
        print("最後の一行を書く――あるいは、書かない。")

        c = choose_write([
            "白紙のまま、閉じた。",
            "――いや。彼女は最後に一行だけ書いた。",
        ])

        if c == 1:
            s.manuscript.append("白紙のまま、閉じた。")
        else:
            s.manuscript.append("――彼女は最後に一行だけ書いた。「殺していません」")
            s.wrote_confession = True

    elif s.wrote_confession:
        print("彼女は真実を語り始めた。")
        print("最後の一行を書く。")

        c = choose_write([
            "「殺していません。でも、あの部屋にいました」",
            "「殺していません」。彼女はそれだけ書いて、ペンを置いた。",
            "「わたしがやりました」――彼女は嘘を書いた。自分を終わらせるために。",
        ])

        if c == 1:
            s.manuscript.append("「殺していません。でも、あの部屋にいました」")
        elif c == 2:
            s.manuscript.append("「殺していません」。彼女はそれだけ書いて、ペンを置いた。")
        else:
            s.manuscript.append("「わたしがやりました」――彼女は嘘を書いた。自分を終わらせるために。")
            s.wrote_fiction = True

    elif s.wrote_fiction:
        print("嘘の物語がここまで来た。")
        print("最後の一行を書く。")

        c = choose_write([
            "刑事は手帳を閉じた。「もう十分です」",
            "彼女の嘘は、最後まで完璧だった。誰も真実を知らない。",
            "――ただし、これは小説だった。現実の彼女は、まだ話していない。",
        ])

        if c == 1:
            s.manuscript.append("刑事は手帳を閉じた。「もう十分です」")
        elif c == 2:
            s.manuscript.append("彼女の嘘は、最後まで完璧だった。誰も真実を知らない。")
        else:
            s.manuscript.append("――ただし、これは小説だった。現実の彼女は、まだ話していない。")
            s.wrote_truth = True

    else:
        print("物語は再び動き始めた。")
        print("最後の一行を書く。")

        c = choose_write([
            "彼女は書いた。あの夜のことを。全部。",
            "物語の中の刑事が、彼女の手を取った。",
            "最後のページに、彼女は住所を書いた。日記帳がある場所を。",
        ])

        if c == 1:
            s.manuscript.append("彼女は書いた。あの夜のことを。全部。")
            s.wrote_confession = True
        elif c == 2:
            s.manuscript.append("物語の中の刑事が、彼女の手を取った。")
        else:
            s.manuscript.append("最後のページに、彼女は住所を書いた。日記帳がある場所を。")
            s.wrote_confession = True

    clear()
    s.manuscript_header()
    s.show_manuscript()
    print()
    slow("最後の一行が書かれた。", 0.8)
    print()
    print("あなたはペンを置いた。")
    pause()


# ===================================
#  エンディング
# ===================================

def ending(s):
    clear()
    print()
    print()

    # 原稿を完成表示
    print("  ============ 原稿 ============")
    print()
    for i, line in enumerate(s.manuscript):
        slow(f"  {line}", 0.6)
    print()
    print("  ==============================")
    print()
    time.sleep(1.5)

    # エンディング分岐
    if s.wrote_confession and not s.wrote_fiction:
        ending_truth(s)
    elif s.wrote_fiction and not s.wrote_confession:
        ending_fiction(s)
    elif s.wrote_escape and not s.wrote_confession:
        ending_silence(s)
    elif s.wrote_confession and s.wrote_fiction:
        ending_tangled(s)
    else:
        ending_unfinished(s)


def ending_truth(s):
    """真実を書いたエンディング"""
    print("大学ノートは弁護士の手に渡った。")
    print()
    slow("弁護士はページをめくった。")
    print("三章までは小説だった。取調室の物語。")
    print("四章は――違った。")
    print()
    print("小説ではなかった。")
    print("嘘の殻が、途中で割れていた。")
    print()
    slow("「橘さん。これは」")
    print()
    print("「……小説のつもりで書き始めたんです」")
    print("「でも途中から――本当のことしか書けなくなって」")
    print()
    slow("弁護士は最後の一行を読んだ。", 0.8)
    print()
    for line in s.manuscript:
        print(f"  {line}")
    print()
    time.sleep(1.0)
    print("「これを検察に出していいですか」")
    print()
    print("彼女は頷いた。")
    print("書いたのは彼女ではない。あなただ。")
    print("でも――あなたが書いた言葉は、彼女の言葉だった。")
    print()
    slow("小説の中の刑事は、あなたが作った人物だった。")
    print("優しかったのも、鋭かったのも、")
    print("あなたがそう書いたから。")
    print()
    print("でも彼女が取調室の物語を選んだのは、")
    print("本当の取調で、一人も")
    print("あの刑事のような人がいなかったからだ。")
    print()
    print(f"  -- ENDING: 供述 --")
    print()
    print("  小説は嘘から始まった。")
    print("  あなたが続きを書いたら、真実になった。")
    print()
    if s.was_gentle:
        print("  あなたが書いた刑事は、優しかった。")
        print("  彼女が出会いたかった刑事だった。")
        print()
    print("=" * 52)
    print()


def ending_fiction(s):
    """嘘を貫いたエンディング"""
    print("大学ノートは弁護士の手に渡った。")
    print()
    slow("弁護士はページをめくった。")
    print("最初から最後まで、小説だった。")
    print("よくできた小説だった。")
    print()
    print("「橘さん。これは小説ですか、供述ですか」")
    print()
    print("「……小説です」")
    print()
    slow("弁護士はノートを閉じた。")
    print()
    print("「小説では、あなたを助けられません」")
    print()
    time.sleep(1.0)
    print("彼女は黙っていた。")
    print("あなたが書いた物語は、")
    print("彼女を守る嘘の上に、もう一枚嘘を重ねた。")
    print()
    print("小説の中の刑事は、最後まで真実にたどり着けなかった。")
    print("あなたがそう書いたから。")
    print()
    print(f"  -- ENDING: 虚構 --")
    print()
    print("  小説は嘘のまま終わった。")
    print("  あなたが続きを書いても、真実にはならなかった。")
    print()
    print("  でも彼女は、この小説を書けたことで")
    print("  一つだけ手に入れたものがある。")
    print("  「あの夜のことを言葉にできた」という事実。")
    print("  たとえ嘘の形であっても。")
    print()
    print("=" * 52)
    print()


def ending_silence(s):
    """白紙エンディング"""
    print("大学ノートは弁護士の手に渡った。")
    print()
    slow("弁護士はページをめくった。")
    print("三章までは小説だった。")
    print("四章は――白紙だった。")
    print()
    print("「橘さん。続きは」")
    print()
    print("「……書けませんでした」")
    print()
    slow("弁護士はノートを閉じた。", 0.8)
    print()
    print("三章までの小説を、弁護士は持ち帰った。")
    print("小説として読んだ。")
    print("そこに書かれた取調室は、")
    print("実際の取調の記録とは全く違っていた。")
    print()
    print("小説の中の刑事は、彼女の話を聞いてくれた。")
    print("現実の刑事は、一人もそうしなかった。")
    print()
    slow("白紙の四章目は、")
    print("彼女が一人では書けなかった結末だった。")
    print("あなたも、書かなかった。")
    print()
    print(f"  -- ENDING: 白紙 --")
    print()
    print("  物語は三章で止まった。")
    print("  結末は誰にも書かれなかった。")
    print()
    print("=" * 52)
    print()


def ending_tangled(s):
    """真実と嘘が混ざったエンディング"""
    print("大学ノートは弁護士の手に渡った。")
    print()
    slow("弁護士はページをめくった。")
    print("三章までは小説。四章は――")
    print("小説なのか、供述なのか、わからなかった。")
    print()
    print("真実と嘘が、一行ごとに入れ替わっていた。")
    print()
    print("「橘さん。どこからが本当ですか」")
    print()
    slow("「……わかりません」")
    print()
    print("「書いているうちに、わからなくなりました」")
    print()
    time.sleep(1.0)
    print("弁護士は原稿を読み返した。")
    print("あなたが書いた行を。")
    print()
    for line in s.manuscript:
        print(f"  {line}")
    print()
    slow("どれが真実で、どれが嘘か。")
    print("書いたあなた自身にも、もうわからない。")
    print()
    print("彼女が小説でしか語れなかったように、")
    print("あなたも小説でしか書けなかった。")
    print("真実は、物語の中に溶けて消えた。")
    print()
    print(f"  -- ENDING: 供述と虚構のあいだ --")
    print()
    print("  真実と嘘が混ざった原稿。")
    print("  弁護士にも検察にも裁判官にも、")
    print("  どこからが本当かわからない。")
    print()
    print("  でもそれは――彼女の頭の中と、同じ状態だ。")
    print()
    print("=" * 52)
    print()


def ending_unfinished(s):
    """どの条件にも当てはまらないフォールバック"""
    print("大学ノートは弁護士の手に渡った。")
    print()
    slow("弁護士はページをめくった。")
    print()
    for line in s.manuscript:
        print(f"  {line}")
    print()
    print("「橘さん。この物語は――まだ終わっていませんね」")
    print()
    print("彼女は頷いた。")
    print()
    print("「続きは――法廷で話します」")
    print()
    print(f"  -- ENDING: 未完 --")
    print()
    print("  物語はまだ終わっていない。")
    print("  あなたが書いた続きは、始まりにすぎなかった。")
    print()
    print("=" * 52)
    print()


# ===================================
#  メイン
# ===================================

def main():
    s = State()

    # Phase 1: 取調ゲーム
    beat_1(s)
    if s.questions <= 0 or s.trust <= 0:
        print("\n  -- 取調は終わった。物語は始まらなかった。 --\n")
        return

    beat_2(s)
    beat_3(s)

    # THE BREAK
    the_break(s)

    # Phase 2: 執筆モード
    writing_phase_1(s)
    writing_phase_2(s)
    writing_phase_3(s)

    # エンディング
    ending(s)


if __name__ == "__main__":
    main()
