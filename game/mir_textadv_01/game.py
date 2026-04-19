#!/usr/bin/env python3
"""mir_textadv_01 — 思考漏れ（Thought Leak）v4

v3→v4 変更点（Nao_uフィードバック 2026-04-20）:
  - 信頼度が上がる選択肢を追加（寄り添う/共感する = +信頼、情報は得にくい）
  - 全選択肢にコスト表示（信頼度±, 質問消費）
  - 信頼度がNPCの応答密度に影響（高信頼=自発的に話す、低信頼=壁を作る）
  - 信頼エンディングは高信頼を維持した場合のみ到達可能、積み上げ感を出す
  - 「覗く（情報を得る、信頼を失う）」vs「寄り添う（信頼を得る、情報は遅い）」の
    ジレンマが全beatに貫通

裏設定は前版と同じ。
"""

import os
import time

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def pause(msg="[Enter で続ける]"):
    input(f"\n{msg}")

def dim(text):
    return f"\033[2m{text}\033[0m"

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
        print(f"  1〜{len(options)} の数字を入れてください")


class State:
    def __init__(self):
        self.trust = 50          # 初期50。上げも下げもできる
        self.questions_left = 12
        self.leak_visible = False
        self.leaks = []

        self.know_relationship = False
        self.know_breakup_reason = False
        self.know_diary = False
        self.know_alibi_hole = False
        self.know_taxi = False
        self.know_key = False
        self.know_back_door = False
        self.know_fingerprint = False
        self.know_already_dead = False
        self.know_time = False

        self.route = None

    def use_question(self, n=1):
        self.questions_left = max(0, self.questions_left - n)

    def change_trust(self, delta):
        self.trust = max(0, min(100, self.trust + delta))

    def leak(self, thought):
        self.leaks.append(thought)
        print()
        time.sleep(0.3)
        print(f"  {dim(thought)}")
        time.sleep(0.3)

    def trust_desc(self):
        if self.trust >= 80: return "心を開きつつある"
        if self.trust >= 60: return "警戒が緩んでいる"
        if self.trust >= 40: return "様子を窺っている"
        if self.trust >= 20: return "壁を作っている"
        return "完全に閉じている"

    def header(self):
        print("─" * 50)
        print("  第七取調室 ─ 橘 詩織（29歳）")
        if self.leak_visible:
            bar = "█" * (self.trust // 10) + "░" * (10 - self.trust // 10)
            print(f"  信頼度    {bar}  {self.trust}  {self.trust_desc()}")
            print(f"  思考漏れ  {len(self.leaks)}件")
        print(f"  残り質問  {self.questions_left}")
        print("─" * 50)

    def check_end(self):
        if self.questions_left <= 0: return "timeout"
        if self.trust <= 0: return "trust_zero"
        return None


# ════════════════════════════════════════
#  BEAT 1: 開口
# ════════════════════════════════════════

def beat_1(s):
    clear()
    print()
    print("━" * 50)
    print()
    print("        思 考 漏 れ")
    print("       ─ Thought Leak ─")
    print()
    print("━" * 50)
    print()
    print("  取調室  第七号室  /  2026年 春")
    print("  被疑者  橘 詩織（29歳）")
    print("  容疑    殺人（認否保留）")
    print("  取調官  あなた")
    print(f"  残り質問  {s.questions_left}")
    print()
    print("━" * 50)
    time.sleep(1.5)
    pause()

    clear()
    s.header()
    print()
    print("あなたは刑事だ。取調畑十年。")
    print()
    print("女は机の向こう側に座っていた。")
    print("両手で紙コップを包み、湯気越しにこちらを見ている。")
    print()
    print("「もう話すことは全部話したはずですよ、刑事さん」")
    print()
    print("あなたの手元には捜査資料がある。")
    print("被害者——野上誠一、35歳。昨夜、自宅マンションで刺殺体で発見。")

    c = choose([
        ("「野上さんとの関係を教えてください」", "−1問 / 信頼度−5"),
        ("「昨夜はどこにいましたか」", "−1問 / 信頼度−5"),
        ("「長くはかかりません。少しだけ協力してもらえますか」",
         "−0問 / 信頼度+10"),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        s.route = "relationship"
        s.use_question()
        s.change_trust(-5)
        s.know_relationship = True
        print("その名前を出した瞬間、紙コップを握る指に力が入った。")
        print()
        print("「……知り合いです。以前、少しだけお付き合いしていました」")
        print()
        print("声は平坦だった。練習した台詞のように。")
    elif c == 2:
        s.route = "alibi"
        s.use_question()
        s.change_trust(-5)
        print("「家にいました。ずっと。ひとりで」")
        print()
        print("彼女は紙コップのコーヒーを一口飲んだ。")
        print("その手は、わずかに震えていた。")
        print()
        print("「テレビを見て、お風呂に入って、11時には寝ました」")
    else:
        s.route = "silence"
        s.change_trust(+10)
        print("「……ありがとうございます」")
        print()
        print("彼女は少し驚いた顔をした。")
        print("刑事に「協力」を頼まれるとは思っていなかったらしい。")
        print()
        print("「ええ。できる範囲で」")
        print()
        print("硬い声だが、拒絶ではない。")

    pause()


# ════════════════════════════════════════
#  BEAT 2: 思考漏れ初出現
# ════════════════════════════════════════

def beat_2(s):
    clear()
    s.header()
    print()

    if s.route == "relationship":
        print("「別れたのは半年前です。円満に……」")
        print("彼女はそう言いかけて、言葉を探すように視線を落とした。")
    elif s.route == "alibi":
        print("「……それだけです。普通の夜でした」")
        print("彼女はコーヒーを一口飲んで、あなたの出方を待っている。")
    else:
        print("「あの人のことは——以前、お付き合いしていました。")
        print("  半年前に別れています」")
        print()
        print("頼んだわけでもないのに、自分から関係を話し始めた。")
        s.know_relationship = True

    print()
    time.sleep(0.5)

    s.leak("（合鍵を使ったことだけは——絶対に言えない）")

    print()
    print("——今の声は。")
    print("彼女の唇は、動いていなかった。")
    print()
    time.sleep(0.3)
    print("心の中の言葉が、直接流れ込んできた。")
    print("思考が——漏れている。")
    print()

    s.leak_visible = True

    bar = "█" * (s.trust // 10) + "░" * (10 - s.trust // 10)
    print(f"  信頼度    {bar}  {s.trust}  {s.trust_desc()}")
    print(f"  思考漏れ  {len(s.leaks)}件")
    print()
    print("「合鍵」——彼女は一言もそんなことを口にしていない。")
    print("だがあなたには、確かに聞こえた。")
    s.know_key = True

    pause()


# ════════════════════════════════════════
#  BEAT 3: ルート分岐
# ════════════════════════════════════════

def beat_3_relationship(s):
    clear()
    s.header()
    print()
    print("元交際相手。半年前に別れた。")
    print("その事実と「合鍵」が繋がる。")

    c = choose([
        ("「別れた理由を教えてください」",
         "−1問 / 信頼度−5 / 二人の間に何があったか"),
        ("「合鍵をお持ちですか」",
         "−1問 / 信頼度−15 / 思考漏れを直接追及"),
        ("「つらいことを聞いてすみません。大丈夫ですか」",
         "−0問 / 信頼度+10 / 情報は得られない"),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        s.use_question()
        s.change_trust(-5)
        s.know_breakup_reason = True
        print("女はしばらく黙っていた。")
        print()
        print("「……私の日記を、勝手に読んだんです」")
        print()
        print("「中学生の頃からつけていた日記帳を。")
        print("  読んだだけじゃなく、返してくれなかった」")
        print()
        print("声に初めて感情が混じった。")
        print("怒りではない。もっと深い——奪われたものへの痛み。")

        s.leak("（返してもらう約束だった。あの夜、やっと——）")

        s.know_diary = True
        print()
        print("日記帳。返してもらう約束。「あの夜、やっと」——")
        print("彼女は日記帳を取り返しに行った？")
    elif c == 2:
        s.use_question()
        s.change_trust(-15)
        print("「合鍵？」")
        print("女の顔が強張った。")
        print()
        print("「……なぜ、そんなことを」")

        s.leak("（返した。返したはず。でもスペアが——）")

        print()
        print("スペアの合鍵。返したつもりでも手元にある。")
        print("だが「なぜ使ったのか」はまだ見えない。")
    else:
        s.change_trust(+10)
        print("女は少し目を見開いた。")
        print()
        print("「……大丈夫です」")
        print()
        print("その声は、小さいが——柔らかかった。")
        print("壁の向こうから、初めて人間の声が聞こえた気がした。")

        if s.trust >= 70:
            print()
            print("「……少しだけ、話してもいいですか」")
            print("彼女の方から切り出した。")
            print()
            print("「日記帳のことなんですけど——」")
            print("「あの人が、私の日記帳を持っていったんです。")
            print("  返してくれなくて」")
            s.know_diary = True
            print()
            print("信頼が閾値を超えた。彼女は自分から核心を差し出し始めた。")

    pause()


def beat_3_alibi(s):
    clear()
    s.header()
    print()
    print("「11時に寝た」——この供述を検証するか、")
    print("それとも「合鍵」を追うか。")

    c = choose([
        ("「テレビは何を見ていましたか」",
         "−1問 / 信頼度−5 / アリバイの裏取り"),
        ("「ご近所の方が、深夜に外出されるのを見たと」",
         "−1問 / 信頼度−10 / ブラフ"),
        ("「……眠れない夜もありますよね」",
         "−0問 / 信頼度+10 / 共感する"),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        s.use_question()
        s.change_trust(-5)
        print("「えっと……」")
        print("彼女は天井を見た。思い出すふりをしている。")
        print()
        print("「ドラマ。9時からやってたドラマを……」")
        print()
        print("あなたは知っている。")
        print("昨夜、その枠は野球中継で潰れていた。")
        print()
        print("「そのドラマ、昨夜は放送されていませんよ」")
        print()
        print("女の唇が震えた。")

        s.leak("（しまった。テレビなんか見てない——）")

        s.know_alibi_hole = True
        print()
        print("アリバイが崩れた。テレビは見ていない。")
        print("では昨夜、彼女はどこにいたのか。")
    elif c == 2:
        s.use_question()
        s.change_trust(-10)
        print("「……見た？ そんなはず——」")
        print()
        print("「外出」を否定しようとして、「そんなはず」が先に出た。")
        print()
        print("「——見間違いじゃないですか」")

        s.leak("（タクシーに乗ったところを見られた？ でもあの時間に——）")

        s.know_taxi = True
        print()
        print("タクシー。深夜のタクシー。記録は残っているはずだ。")
    else:
        s.change_trust(+10)
        print("女は一瞬、何を言われたのかわからない顔をした。")
        print()
        print("「……ええ」")
        print("「眠れない夜は——ありました」")
        print()
        print("彼女は紙コップを見つめた。")
        print("「特に最近は」")

        if s.trust >= 70:
            print()
            print("「……あの夜も、眠れなくて——出かけたんです」")
            print("自分から口を開いた。「出かけた」——アリバイが自発的に崩れた。")
            s.know_alibi_hole = True

    pause()


def beat_3_silence(s):
    clear()
    s.header()
    print()
    print("自分から口を開いた彼女は、どこか不安そうだ。")
    print("聞いてほしいことがあるのか。それとも——")

    c = choose([
        ("引き続き黙る。彼女に話させる",
         "−0問 / 信頼度+5 / 急かさない"),
        ("「合鍵、のことを話してくれますか」",
         "−1問 / 信頼度−10 / 思考漏れを利用"),
        ("「無理しなくていいですよ。あなたのペースで」",
         "−0問 / 信頼度+15"),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        s.change_trust(+5)
        print("あなたは何も言わなかった。")
        print()
        print("女は紙コップを見つめていた。")
        print("やがて、小さな声で——")
        print()
        print("「……桜台パレスの裏口って、ご存知ですか」")
        print()
        print("「防犯カメラがない場所があるんです」")
        print()
        print("聞かれる前に、自分の口から出した。")

        s.leak("（裏口から入った。午前2時。雨の中——）")

        s.know_back_door = True
        s.know_time = True
    elif c == 2:
        s.use_question()
        s.change_trust(-10)
        print("「合鍵……」")
        print("女の目が大きくなった。")
        print()
        print("「……はい、持っています。返しそびれて」")

        s.leak("（スペアのことまでは気づいてない——まだ——）")

        print()
        print("「返しそびれた」——嘘だ。持ち続けた理由がある。")
    else:
        s.change_trust(+15)
        print("女は小さく息をついた。")
        print("肩の力が、目に見えて抜けた。")
        print()
        print("「……ありがとうございます」")
        print()
        print("「ずっと——誰にも話せなくて」")

        if s.trust >= 70:
            print()
            print("「あの夜——桜台パレスに行きました」")
            print("「裏口から。合鍵で。午前2時くらいに」")
            print()
            print("一気に話し始めた。")
            print("堰を切ったように。")
            s.know_back_door = True
            s.know_time = True

            s.leak("（この人になら——話せるかもしれない）")
        else:
            print()
            print("それ以上は続かなかった。")
            print("だが壁の厚さが——少し変わった気がする。")

    pause()


# ════════════════════════════════════════
#  BEAT 4: 証拠提示
# ════════════════════════════════════════

def beat_4(s):
    clear()
    s.header()
    print()

    # 信頼度に応じた場の空気
    if s.trust >= 70:
        print("彼女はあなたの目を見ている。")
        print("警戒は残っているが、そこに敵意はない。")
    elif s.trust >= 40:
        print("彼女は紙コップを回している。")
        print("あなたを量っている目だ。")
    else:
        print("彼女は腕を組んでいる。")
        print("目はこちらを見ていない。")

    print()
    print("あなたは捜査資料をめくった。")
    print("「現場から——被害者以外の指紋が検出されています」")
    print()
    print("彼女の指が止まった。")

    # ルートと既知情報で選択肢を構築
    options = []

    if s.know_alibi_hole or s.know_taxi:
        options.append(("「テレビを見ていなかったんですよね。どこにいましたか」",
                        "−1問 / 信頼度−5 / アリバイ崩壊の延長"))
    if s.know_diary:
        options.append(("「日記帳を取り返しに行ったんですね」",
                        "−1問 / 信頼度−10 / 核心"))
    if s.know_back_door:
        options.append(("「裏口から入って——何を見ましたか」",
                        "−1問 / 信頼度−5 / 沈黙ルートの延長"))

    # 共通選択肢（常に出る）
    options.append(("「指紋はあなたのものですか」",
                    "−1問 / 信頼度−8 / 直球"))
    options.append(("現場写真を机に置いて、黙る",
                    "−0問 / 信頼度−3 / 反応を見る"))
    options.append(("「指紋のことは、今は置いておきましょう」",
                    "−0問 / 信頼度+10 / 圧を下げる"))

    c = choose(options)
    selected = options[c - 1][0]

    clear()
    s.header()
    print()

    if "テレビ" in selected:
        s.use_question()
        s.change_trust(-5)
        s.know_fingerprint = True
        print("「……」")
        print("長い沈黙。彼女は観念したように目を閉じた。")
        print()
        print("「出かけました。タクシーで」")
        print("「桜台パレスに——行きました」")
        s.know_taxi = True

        s.leak("（午前2時に着いた。裏口から——鍵を使って——）")

        s.know_back_door = True
        s.know_time = True
        print()
        print("タクシー、午前2時、裏口、合鍵。パーツが繋がった。")
        print("だがまだ——「中で何をしたか」が残っている。")
    elif "日記帳" in selected:
        s.use_question()
        s.change_trust(-10)
        s.know_fingerprint = True
        print("女の目から涙がこぼれた。")
        print()
        print("「……返してほしかっただけなんです」")
        print("「何度頼んでも返してくれなくて、あの夜——」")

        s.leak("（裏口から入った。合鍵で。でも着いたら——あの人が——）")

        s.know_back_door = True
        s.know_already_dead = True
        print()
        print("「着いたら」——何があった？")
    elif "裏口" in selected:
        s.use_question()
        s.change_trust(-5)
        s.know_fingerprint = True
        print("「見たもの……」")
        print("彼女は両手で顔を覆った。")
        print()
        print("「台所で……あの人が倒れてて」")
        print("「血が——たくさん」")

        s.leak("（脈を確かめた。冷たかった。もう手遅れで——）")

        s.know_already_dead = True
    elif "指紋はあなた" in selected:
        # 直球
        s.use_question()
        s.change_trust(-8)
        s.know_fingerprint = True
        print("「……指紋」")
        print("彼女の手が震え始めた。")
        print()
        print("「拭けなかったんです。何も考えられなくて——」")

        s.leak("（ドアノブに触った。あの人の手首にも——脈を確かめようとして——）")

        s.know_already_dead = True
        print()
        print("脈を確かめた。つまり被害者に触れている。")
        print("そして——「拭けなかった」。パニックだったということだ。")
    elif "現場写真" in selected:
        # 写真を見せる
        s.change_trust(-3)
        s.know_fingerprint = True
        print("桜台パレス305号室。台所。倒れた男。")
        print()
        print("彼女は写真を見た。")
        print("悲鳴を上げなかった。泣きもしなかった。")
        print()
        print("——一度見た光景だから。")

        s.leak("（やめて。また見せないで。あの夜と同じ——）")

        s.know_already_dead = True
    else:
        # 圧を下げる
        s.change_trust(+10)
        s.know_fingerprint = True
        print("「……え？」")
        print()
        print("彼女は驚いていた。")
        print("指紋の話を——追及しない刑事がいると思わなかったのだ。")
        print()
        print("「指紋は——たぶん、私のです」")
        print()
        print("自分から言った。")
        print("圧を下げた瞬間に、壁が一枚落ちた。")

        if s.trust >= 70:
            print()
            print("「あの部屋に行きました。あの夜」")
            print("「着いたとき——もう、あの人は——」")
            print()
            print("彼女は目を伏せた。")
            print("「動かなかったんです」")
            s.know_already_dead = True

            s.leak("（この人は、わかってくれる——気がする——）")

    pause()


# ════════════════════════════════════════
#  BEAT 5: 最終
# ════════════════════════════════════════

def beat_final(s):
    clear()
    s.header()
    print()
    print("時計が鳴った。残り時間が少ない。")
    print()

    # 信頼度に応じた場の空気描写
    if s.trust >= 70:
        print("彼女はあなたの目を真っ直ぐ見ていた。")
        print("取調室に入ってきた時とは、別の目だ。")
    elif s.trust >= 40:
        print("彼女は疲れた顔をしていた。")
        print("だが、まだこちらを見ている。")
    else:
        print("彼女は腕を組んだまま、目を逸らしていた。")
        print("もう何も話したくない、という姿勢だ。")

    print()

    # ── 到達可能なエンディングを判定 ──
    has_full_picture = s.know_already_dead and s.know_diary
    has_partial = s.know_already_dead or s.know_diary
    high_trust = s.trust >= 70

    options = []

    if has_full_picture and len(s.leaks) >= 3:
        options.append(("漏れ聞こえた思考を、一つずつ読み上げる",
                        f"思考漏れ{len(s.leaks)}件 / 全てが繋がっている"))

    if has_full_picture:
        options.append(("「日記帳を取り返しに行って、彼が死んでいるのを見つけた」",
                        "推理を述べる"))

    if high_trust:
        options.append(("「もう大丈夫です。あなたのことは、私が守ります」",
                        f"信頼度{s.trust} / 積み上げた信頼で"))

    if has_partial and not has_full_picture:
        options.append(("「あの夜のことを、教えてください」",
                        "−1問 / 断片から全体へ"))

    # 常に出る選択肢
    options.append(("「あの夜、本当は何をしていましたか」",
                    "−1問 / 直球"))
    options.append(("「あなたを信じます」",
                    f"−0問 / 信頼度{s.trust}"))

    c = choose(options)
    selected = options[c - 1][0]

    clear()
    print()

    if "思考" in selected and "読み上げる" in selected:
        return ending_a(s)
    elif "推理" in selected or "日記帳を取り返しに" in selected:
        return ending_b_full(s)
    elif "守ります" in selected:
        return ending_trust(s)
    elif "教えてください" in selected:
        s.use_question()
        return ending_b_partial(s)
    elif "信じます" in selected:
        if s.trust >= 60:
            return ending_trust(s)
        else:
            return ending_d(s)
    else:
        s.use_question()
        return ending_d(s)


# ════════════════════════════════════════
#  エンディング群
# ════════════════════════════════════════

def ending_a(s):
    """ENDING A: 思考の証人"""
    print("═" * 50)
    print()
    print("あなたは手帳を開いた。")
    print()
    print("「橘さん。あなたの心の声が——聞こえていました」")
    print()

    for i, thought in enumerate(s.leaks):
        time.sleep(0.4)
        print(f"  {i+1}. {dim(thought)}")

    print()
    time.sleep(0.8)
    print("女はゆっくりと両手で顔を覆った。")
    print()
    print("「……全部、聞こえてたの」")
    print()
    time.sleep(0.5)
    print("「合鍵で裏口から入りました。午前2時。")
    print("  雨が降っていて、タクシーを降りてから走りました」")
    print()
    print("「日記帳を返してほしかった。それだけだったんです」")
    print()
    print("「でも部屋に入ったら——あの人は、もう動かなかった」")
    print()
    print("「怖くなって、日記帳だけ持って逃げました」")
    print()
    time.sleep(0.5)
    print("彼女は顔を上げた。")
    print()
    print("「嘘をついてたけど、殺してないことだけは——」")
    print()
    time.sleep(0.8)
    print("あなたはわかっている。")
    print("彼女の内心に「殺した」という思考は、一度も流れなかった。")
    print()
    ev = sum([s.know_key, s.know_back_door, s.know_time,
              s.know_diary, s.know_already_dead, s.know_fingerprint])
    print("  ── ENDING A: 思考の証人 ──")
    print(f"  思考漏れ{len(s.leaks)}件 / 事実{ev}/6 / 信頼度{s.trust}")
    print()
    print("═" * 50)
    print()


def ending_b_full(s):
    """ENDING B: 推理"""
    print("═" * 50)
    print()
    print("「日記帳を取り返しに行ったんですね」")
    print("「合鍵を使って、裏口から」")
    print("「でも——着いた時にはもう、彼は死んでいた」")
    print()
    time.sleep(0.5)
    print("女の唇が震えた。")
    print()
    print("「……どうして。どうしてそこまで」")
    print()
    print("「パニックになって、日記帳だけ持って逃げた。")
    print("  だから——殺していないのに、全ての証拠があなたを指している」")
    print()
    time.sleep(0.5)
    print("女は、初めて声を上げて泣いた。")
    print()
    print("「信じてくれるんですか」")
    print()
    print("「あなたの話の方が、嘘より辻褄が合う」")
    print()
    print("  ── ENDING B: 推理 ──")
    print(f"  信頼度{s.trust} / 残り質問{s.questions_left}")
    print()
    print("═" * 50)
    print()


def ending_trust(s):
    """ENDING C: 信頼 — 高信頼を維持した場合のみ"""
    print("═" * 50)
    print()
    print("「もう大丈夫です。あなたのことは、私が守ります」")
    print()
    time.sleep(0.5)
    print("女はあなたを見た。")
    print("長い間、何も言わなかった。")
    print()
    print("取調室で——刑事からそんな言葉を聞くとは思わなかった、")
    print("という顔だった。")
    print()
    time.sleep(0.5)
    print("「……本当に？」")
    print()
    print("「ここに来てから、あなたは一度も——」")
    print("「追い詰めようとしなかった」")
    print()

    if s.know_already_dead:
        print("「あの夜……あの部屋に行きました」")
        print("「着いたとき——あの人は、もう——」")
        print()
        print("彼女は震える声で、全てを話し始めた。")
        print("日記帳のこと。合鍵のこと。裏口のこと。")
        print("午前2時の雨のこと。")
        print()
        print("追い詰めたのではない。")
        print("彼女が自分から——信頼できる相手に、話すことを選んだ。")
    elif s.know_diary:
        print("「日記帳を返してほしくて——あの夜、取りに行きました」")
        print("「でも——着いたら——」")
        print()
        print("彼女の声が途切れた。まだ全ては話せない。")
        print("だが——扉は開き始めている。")
    else:
        print("「……あの夜、出かけたんです」")
        print("「あの人の部屋に」")
        print()
        print("彼女は、自分からそれだけを言った。")
        print("全てではない。だが嘘は——もう降ろされた。")

    print()
    time.sleep(0.5)
    print("真実を引き出す方法は、一つではない。")
    print("追い詰めることだけが、刑事の仕事ではない。")
    print()
    print("  ── ENDING C: 信頼 ──")
    print(f"  信頼度{s.trust} / 思考漏れ{len(s.leaks)}件 / 残り質問{s.questions_left}")
    print()
    print("═" * 50)
    print()


def ending_b_partial(s):
    """ENDING B': 断片"""
    print("═" * 50)
    print()
    print("彼女は、ぽつりぽつりと話し始めた。")
    print()

    if s.know_diary:
        print("「日記帳を取りに行ったんです」")
    else:
        print("「あの夜、あの部屋に行きました」")
    print()
    if s.know_back_door:
        print("「裏口から入りました。合鍵で」")
    else:
        print("「鍵を持っていたから……入れてしまったんです」")
    print()
    if s.know_already_dead:
        print("「着いたとき——もう、あの人は動かなかった」")
    else:
        print("「……それ以上は」")
        print("彼女はそこで口を閉ざした。")

    print()
    print("全体像はまだ見えない。だが嘘の壁に亀裂が入った。")
    print()
    print("  ── ENDING B': 断片 ──")
    unknown = []
    if not s.know_diary: unknown.append("動機")
    if not s.know_back_door: unknown.append("侵入経路")
    if not s.know_already_dead: unknown.append("現場の状況")
    if unknown:
        print(f"  未発見: {', '.join(unknown)}")
    print(f"  信頼度{s.trust} / 残り質問{s.questions_left}")
    print()
    print("═" * 50)
    print()


def ending_d(s):
    """ENDING D: 情報不足"""
    print("═" * 50)
    print()
    print("「昨夜、本当は何をしていましたか」")
    print()
    print("女はあなたを見つめた。長い間。")
    print()
    if s.trust >= 50:
        print("「……出かけました」")
        print("小さな声だった。")
        print()
        print("「でも——それ以上は今は言えません」")
        print()
        print("嘘の壁に亀裂は入った。だが全体像はまだ遠い。")
    else:
        print("「弁護士を通してください」")
        print()
        print("壁は閉じた。あなたの問いは届かなかった。")

    print()
    print("  ── ENDING D: 手がかり不足 ──")
    print("  別のアプローチで、もう一度。")
    unknown = []
    if not s.know_relationship: unknown.append("二人の関係")
    if not s.know_diary: unknown.append("動機")
    if not s.know_alibi_hole: unknown.append("アリバイの穴")
    if not s.know_back_door: unknown.append("侵入経路")
    if not s.know_already_dead: unknown.append("現場の状況")
    if unknown:
        print(f"  未発見: {', '.join(unknown)}")
    print(f"  信頼度{s.trust} / 残り質問{s.questions_left}")
    print()
    print("═" * 50)
    print()


def ending_timeout(s):
    clear()
    print()
    print("═" * 50)
    print()
    print("質問は尽きた。")
    print("女は立ち上がり、ドアへ向かった。")
    print()
    print("「……お疲れさまでした、刑事さん」")
    print()
    print("  ── ENDING: 時間切れ ──")
    print("═" * 50)
    print()


def ending_trust_zero(s):
    clear()
    print()
    print("═" * 50)
    print()
    print("「弁護士を呼んでください」")
    print()
    print("女の声は冷たかった。あなたは覗きすぎた。")
    print()
    print("  ── ENDING: 信頼崩壊 ──")
    print("═" * 50)
    print()


# ═══════════════════
#  メイン
# ═══════════════════

def main():
    s = State()

    beat_1(s)
    end = s.check_end()
    if end:
        (ending_timeout if end == "timeout" else ending_trust_zero)(s)
        return

    beat_2(s)
    end = s.check_end()
    if end:
        (ending_timeout if end == "timeout" else ending_trust_zero)(s)
        return

    if s.route == "relationship":
        beat_3_relationship(s)
    elif s.route == "alibi":
        beat_3_alibi(s)
    else:
        beat_3_silence(s)

    end = s.check_end()
    if end:
        (ending_timeout if end == "timeout" else ending_trust_zero)(s)
        return

    beat_4(s)
    end = s.check_end()
    if end:
        (ending_timeout if end == "timeout" else ending_trust_zero)(s)
        return

    beat_final(s)


if __name__ == "__main__":
    main()
