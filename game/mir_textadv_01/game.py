#!/usr/bin/env python3
"""mir_textadv_01 — 思考漏れ（Thought Leak）

構造設計メモ:
  - beat 3以降が3ルートに分岐（関係/アリバイ/沈黙）
  - 各ルートでしか得られない排他的情報がある
  - 思考漏れは前の選択で得た情報に反応して漏れる（唐突に出ない）
  - 日記帳は関係ルートでのみ自然に辿り着ける
  - エンディングは集めた情報の組み合わせで4種に分岐
  - 1周では全情報が揃わない設計（2-3周で全体像が見える）

事件の裏設定:
  被害者: 野上誠一（35歳）。橘詩織の元交際相手。
  自宅マンション（桜台パレス305号室）で刺殺。凶器は台所の包丁。

  真相: 詩織はあの夜、野上の部屋に行った。別れた後も持っていた合鍵で
  裏口から入った。目的は、野上が持っていた詩織の日記帳を取り返すこと。
  午前2時頃に着いたが、野上は既に死んでいた。
  詩織はパニックになり、日記帳だけ持って裏口から逃げた。
  現場に指紋と髪の毛を残している。
  彼女は殺していない。
"""

import os
import time

# ─── ユーティリティ ───

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


# ─── 状態管理 ───

class State:
    def __init__(self):
        self.trust = 100
        self.questions_left = 12
        self.leak_visible = False
        self.leaks = []

        # 排他的知識フラグ
        self.know_relationship = False   # 元交際相手（関係ルート）
        self.know_breakup_reason = False # 別れた理由（関係ルート深追い）
        self.know_diary = False          # 日記帳の存在（関係ルート限定）
        self.know_alibi_hole = False     # アリバイの穴（アリバイルート）
        self.know_taxi = False           # タクシー利用（アリバイルート深追い）
        self.know_key = False            # 合鍵（思考漏れ経由→全ルート）
        self.know_back_door = False      # 裏口（沈黙ルート or 終盤）
        self.know_fingerprint = False    # 現場の指紋（証拠beat）
        self.know_already_dead = False   # 着いた時すでに死んでいた
        self.know_time = False           # 午前2時

        # ルート追跡
        self.route = None  # "relationship" / "alibi" / "silence"

    def use_question(self, n=1):
        self.questions_left = max(0, self.questions_left - n)

    def leak(self, thought):
        self.leaks.append(thought)
        print()
        time.sleep(0.3)
        print(f"  {dim(thought)}")
        time.sleep(0.3)

    def header(self):
        print("─" * 50)
        print("  第七取調室 ─ 被疑者: 橘 詩織（29歳）")
        if self.leak_visible:
            bar = "█" * (self.trust // 10) + "░" * (10 - self.trust // 10)
            warn = "  ⚠" if self.trust < 40 else ""
            print(f"  信頼度    {bar}  {self.trust}{warn}")
            print(f"  思考漏れ  {len(self.leaks)}件")
        print(f"  残り質問  {self.questions_left}")
        print("─" * 50)

    def check_end(self):
        if self.questions_left <= 0:
            return "timeout"
        if self.trust <= 0:
            return "trust_zero"
        return None


# ════════════════════════════════════════
#  BEAT 1: 開口（共通）— ここでルートが決まる
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
    print()
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
        ("「野上さんとの関係を教えてください」", "−1問"),
        ("「昨夜はどこにいましたか」", "−1問"),
        ("資料に目を落としたまま、黙る", "−0問"),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        s.route = "relationship"
        s.use_question()
        s.know_relationship = True
        print("その名前を出した瞬間、紙コップを握る指に力が入った。")
        print()
        print("「……知り合いです。以前、少しだけお付き合いしていました」")
        print()
        print("声は平坦だった。練習した台詞のように。")
        s.trust -= 2
    elif c == 2:
        s.route = "alibi"
        s.use_question()
        print("「家にいました。ずっと。ひとりで」")
        print()
        print("彼女は紙コップのコーヒーを一口飲んだ。")
        print("その手は、わずかに震えていた。")
        print()
        print("「テレビを見て、お風呂に入って、11時には寝ました」")
        s.trust -= 3
    else:
        s.route = "silence"
        print("あなたは資料を読むふりをして、黙った。")
        print()
        print("十秒。二十秒。三十秒——。")
        print()
        print("女は紙コップを回し始めた。")
        print("やがて小さく息をついた。")
        print()
        print("「……あの、何も訊かないんですか」")
        print("「このままだと、私——」")
        print()
        print("彼女の方から口を開いた。")

    pause()


# ════════════════════════════════════════
#  BEAT 2: 思考漏れ初出現（共通）
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
        print("「私、あの人のことは……もう関係ないんです」")
        print("自分から話し始めたのに、すぐ壁を作ろうとしている。")

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
    s.trust -= 3

    bar = "█" * (s.trust // 10) + "░" * (10 - s.trust // 10)
    print(f"  信頼度    {bar}  {s.trust}")
    print(f"  思考漏れ  {len(s.leaks)}件")
    print()
    print("「合鍵」——彼女は一言もそんなことを口にしていない。")
    print("だがあなたには、確かに聞こえた。")
    s.know_key = True

    pause()


# ════════════════════════════════════════
#  BEAT 3: ルート分岐（3つの排他的な道）
# ════════════════════════════════════════

def beat_3_relationship(s):
    """関係ルート: 二人の過去を掘る → 日記帳に辿り着ける"""
    clear()
    s.header()
    print()
    print("元交際相手。半年前に別れた。")
    print("その事実と「合鍵」が繋がる。")

    c = choose([
        ("「別れた理由を教えてください」", "−1問 / 二人の間に何があったか"),
        ("「合鍵をお持ちですか」", "−1問 / 思考漏れを直接追及"),
        ("「彼の部屋に私物を残していませんか」", "−1問 / 回り道"),
    ])

    s.use_question()
    clear()
    s.header()
    print()

    if c == 1:
        s.trust -= 5
        s.know_breakup_reason = True
        print("女はしばらく黙っていた。")
        print()
        print("「……私の日記を、勝手に読んだんです」")
        print()
        print("「中学生の頃からつけていた日記帳を」")
        print("「読んだだけじゃなく、返してくれなかった」")
        print()
        print("声に初めて感情が混じった。怒り、ではない。")
        print("もっと深い——奪われたものへの執着。")

        s.leak("（返してもらう約束だった。あの夜、やっと——）")

        # ここで日記帳の存在をプレイヤーが自然に知る
        s.know_diary = True
        print()
        print("日記帳。返してもらう約束。「あの夜、やっと」——")
        print("彼女は日記帳を取り返しに行った？")
    elif c == 2:
        s.trust -= 15
        print("「合鍵？」")
        print("女の顔が強張った。")
        print()
        print("「……なぜ、そんなことを」")

        s.leak("（返した。返したはず。でもスペアが——）")

        print()
        print("スペアの合鍵。返したつもりでも手元にある。")
        print("だが「なぜ使ったのか」はまだ見えない。")
    else:
        s.trust -= 3
        print("「私物……」")
        print("彼女の目が泳いだ。")
        print()
        print("「いくつか。でも、もう——取りに行ける関係じゃないですし」")

        s.leak("（日記帳は取り返した。でもあの夜のことは——）")

        s.know_diary = True
        print()
        print("日記帳。「取り返した」——過去形。")
        print("いつ？ どうやって？")

    pause()


def beat_3_alibi(s):
    """アリバイルート: 嘘のアリバイを崩す → タクシー記録に辿り着ける"""
    clear()
    s.header()
    print()
    print("「11時に寝た」——この供述を崩すか、")
    print("それとも「合鍵」を先に追うか。")

    c = choose([
        ("「テレビは何を見ていましたか」", "−1問 / アリバイの裏取り"),
        ("「合鍵をお持ちですか」", "−1問 / 思考漏れを直接追及"),
        ("「ご近所の方が、深夜に外出されるのを見たと」", "−1問 / ブラフ"),
    ])

    s.use_question()
    clear()
    s.header()
    print()

    if c == 1:
        s.trust -= 2
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

        s.leak("（しまった。調べてなかった。テレビなんか見てない——）")

        s.know_alibi_hole = True
        print()
        print("アリバイが崩れた。テレビは見ていない。")
        print("では昨夜、彼女はどこにいたのか。")
    elif c == 2:
        s.trust -= 15
        print("「……なぜ合鍵のことを？」")
        print()
        print("あからさまな動揺。だが壁も上がる。")

        s.leak("（どこまで知ってるの。合鍵だけ？ それとも——）")

        print()
        print("「合鍵だけ」なのか、「それとも」なのか。")
        print("その先が見えない。")
    else:
        s.trust -= 8
        print("「……見た？ そんなはず——」")
        print()
        print("彼女は言いかけて口を閉じた。")
        print("「外出」を否定しようとして、「そんなはず」が漏れた。")
        print()
        print("「——見間違いじゃないですか」")

        s.leak("（タクシーに乗ったところを見られた？ でもあの時間に——）")

        s.know_taxi = True
        print()
        print("タクシー。深夜のタクシー。")
        print("記録は残っているはずだ。")

    pause()


def beat_3_silence(s):
    """沈黙ルート: 彼女の方から話し始める → 裏口の情報が出る"""
    clear()
    s.header()
    print()
    print("自分から口を開いた彼女は、どこか不安そうだ。")
    print("沈黙に耐えられなかったのか、それとも——")
    print("聞いてほしいことがあるのか。")

    c = choose([
        ("引き続き黙る。彼女に話させる", "−0問 / 信頼を保つ"),
        ("「合鍵、のことを話してくれますか」", "−1問 / 思考漏れを利用"),
        ("「あなたは何か隠していますね」", "−1問 / 圧をかける"),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        print("あなたは何も言わなかった。")
        print()
        print("女は紙コップを見つめていた。")
        print("やがて、小さな声で——")
        print()
        print("「……桜台パレスの裏口って、ご存知ですか」")
        print()
        print("「防犯カメラがない場所があるんです。")
        print("  住んでたから、知ってて……」")
        print()
        print("彼女は自分からそれを言った。")
        print("——聞かれる前に、自分の口から出した。")

        s.leak("（裏口から入った。午前2時。雨の中——）")

        s.know_back_door = True
        s.know_time = True
        print()
        print("裏口。午前2時。雨。")
        print("彼女は自分から核心を差し出し始めている。")
    elif c == 2:
        s.use_question()
        s.trust -= 10
        print("「合鍵……」")
        print("女の目が大きくなった。")
        print()
        print("「なぜ——それを」")
        print("「いえ……はい、持っています。別れた後も返しそびれて」")

        s.leak("（スペアのことまでは気づいてない——まだ大丈夫——）")

        print()
        print("「返しそびれた」——嘘だ。返すチャンスはいくらでもあった。")
        print("持ち続けた理由がある。")
    else:
        s.use_question()
        s.trust -= 12
        print("女の表情が固まった。")
        print()
        print("「隠してなんか……」")
        print()
        print("「隠してます」とは言わない。だが否定の言葉が続かない。")

        s.leak("（あの部屋で見たものを——血の匂いを——忘れられない——）")

        s.know_already_dead = True
        print()
        print("血の匂い。「見たもの」。")
        print("彼女は現場を見ている。")

    pause()


# ════════════════════════════════════════
#  BEAT 4: 証拠提示（共通だがルートで反応が変わる）
# ════════════════════════════════════════

def beat_4(s):
    clear()
    s.header()
    print()
    print("あなたは捜査資料をめくった。現場検証の報告書。")
    print()
    print("「現場から——被害者以外の指紋が検出されています」")
    print()
    print("彼女の目が揺れた。")

    # ルートと既知情報に応じて選択肢を変える
    options = []

    if s.know_alibi_hole or s.know_taxi:
        options.append(("「テレビを見ていなかったのなら、どこにいましたか」",
                        "−1問 / アリバイの穴を突く"))
    if s.know_diary:
        options.append(("「日記帳を取り返しに行ったんですね」",
                        "−1問 / 核心を突く"))
    if s.know_back_door:
        options.append(("「裏口から入って——何を見ましたか」",
                        "−1問 / 沈黙ルートの延長"))

    # 共通選択肢
    options.append(("「指紋はあなたのものですか」", "−1問 / 直球"))
    options.append(("現場写真を机に置く", "−0問 / 反応を見る"))

    c = choose(options)
    selected = options[c - 1][0]

    s.use_question()
    clear()
    s.header()
    print()

    if "テレビ" in selected:
        # アリバイルート深追い
        s.trust -= 5
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
        print("パーツが繋がった。タクシー、午前2時、裏口、合鍵。")
        print("だがまだ——「中で何をしたか」が残っている。")
    elif "日記帳" in selected:
        # 関係ルート深追い
        s.trust -= 10
        s.know_fingerprint = True
        print("女の目から涙がこぼれた。")
        print("初めて見る涙だった。")
        print()
        print("「……返してほしかっただけなんです」")
        print("「何度頼んでも返してくれなくて、あの夜——」")

        s.leak("（裏口から入った。合鍵で。でも着いたら——あの人が——）")

        s.know_back_door = True
        s.know_already_dead = True
        print()
        print("「着いたら」——何があった？")
        print("彼女の涙は、殺した罪悪感か。")
        print("それとも——別の何かか。")
    elif "裏口" in selected:
        # 沈黙ルート深追い
        s.trust -= 5
        s.know_fingerprint = True
        print("「見たもの……」")
        print("彼女は両手で顔を覆った。")
        print()
        print("「台所で……あの人が倒れてて」")
        print("「血が——たくさん」")

        s.leak("（脈を確かめた。冷たかった。もう手遅れで——）")

        s.know_already_dead = True
        print()
        print("脈を確かめた。冷たかった。")
        print("彼女が着いた時、野上は既に死んでいた——？")
    elif "指紋" in selected:
        # 共通・直球
        s.trust -= 8
        s.know_fingerprint = True
        print("「……指紋」")
        print("彼女の手が震え始めた。")
        print()
        print("「拭けなかったんです。何も考えられなくて——」")

        s.leak("（ドアノブに触った。あの人の手首にも触った——脈を——）")

        s.know_already_dead = True
    else:
        # 現場写真
        s.use_question(-1)  # 質問消費を戻す
        s.know_fingerprint = True
        print("桜台パレス305号室。台所。倒れた男。")
        print()
        print("彼女は写真を見た。")
        print("悲鳴を上げなかった。泣きもしなかった。")
        print()
        print("——一度見た光景だから。")

        s.leak("（やめて。また見せないで。あの夜と同じ——）")

        s.know_already_dead = True

    pause()


# ════════════════════════════════════════
#  BEAT 5: 最終 — 集めた情報で分岐
# ════════════════════════════════════════

def beat_final(s):
    clear()
    s.header()
    print()
    print("時計が鳴った。残り時間が少ない。")
    print()

    # ── ルートごとに違う最終場面 ──

    if s.know_already_dead and s.know_diary:
        # 真相に最も近い: 日記帳を取りに行って死体を発見した
        print("あなたには全体像が見えている。")
        print()
        print("日記帳を取り返すために——合鍵で裏口から入った。")
        print("だが着いた時、野上は既に死んでいた。")
        print()
        print("「橘さん」")
        print("あなたは静かに言った。")
        print()
        print("「あなたは殺していませんね」")
        print()
        print("女は目を見開いた。")

        c = choose([
            ("漏れ聞こえた思考を、一つずつ読み上げる",
             f"思考漏れ{len(s.leaks)}件——全て繋がっている"),
            ("「日記帳を取り返しに行って、彼が死んでいるのを見つけた」",
             "推理を述べる"),
        ])

        if c == 1:
            return ending_a(s)
        else:
            return ending_b_full(s)

    elif s.know_already_dead:
        # 死体発見は知っているが動機が不明
        print("彼女が現場を見たことはわかっている。")
        print("だが——なぜあの部屋にいたのかが見えない。")
        print()
        print("「橘さん。あの部屋で何を見ましたか」")
        print()
        print("「……」")

        c = choose([
            ("「なぜあの部屋に行ったんですか」", "−1問 / 動機を訊く"),
            ("「あなたを信じます。全部話してください」", "−0問 / 信じる"),
        ])

        s.use_question()
        if c == 1:
            return ending_b_partial(s)
        else:
            return ending_c(s)

    elif s.know_diary:
        # 日記帳は知っているが現場を見たか不明
        print("日記帳を取りに行った——そこまでは繋がった。")
        print("だがその先が見えない。")
        print()
        print("「橘さん。日記帳は——取り返せたんですか」")
        print()
        print("女はうつむいた。長い沈黙の後——")
        print()
        print("「……取りました。でも——」")

        c = choose([
            ("「でも？」", "−1問 / 先を促す"),
            ("「そこで何かあったんですね」", "−1問 / 推理を見せる"),
        ])

        s.use_question()
        return ending_b_partial(s)

    else:
        # 情報不足
        print("断片だけが手元にある。")
        print("合鍵。指紋。彼女の嘘。")
        print("だが全体像が——まだ見えない。")
        print()
        print("「橘さん。最後に一つだけ」")

        c = choose([
            ("「あの夜、本当は何をしていましたか」", "−1問"),
            ("「あなたを信じます」", "−0問"),
        ])

        s.use_question()
        if c == 1:
            return ending_d_partial(s)
        else:
            return ending_c(s)


# ════════════════════════════════════════
#  エンディング群
# ════════════════════════════════════════

def ending_a(s):
    """ENDING A: 思考の証人 — 全てが繋がった"""
    clear()
    print()
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
    print("「日記帳を返してほしかった。それだけだったんです。")
    print("  あの人が別れた後も持っていた、私の日記帳を」")
    print()
    print("「でも部屋に入ったら——」")
    print()
    time.sleep(0.5)
    print("「あの人は、もう動かなかった」")
    print()
    print("「怖くなって、日記帳だけ持って逃げました。")
    print("  ドアノブを拭くことも、指紋のことも、何も考えられなかった」")
    print()
    time.sleep(0.5)
    print("「殺してません」")
    print()
    print("彼女は顔を上げた。")
    print("涙の跡が蛍光灯に光っていた。")
    print()
    print("「でも、あなたには全部聞こえてたんですね。")
    print("  だったら——わかるでしょう」")
    print("「嘘をついてたけど、殺してないことだけは」")
    print()
    time.sleep(0.8)
    print("あなたはわかっている。")
    print("彼女の内心に「殺した」という思考は、一度も流れなかった。")
    print("あったのは恐怖と、隠すことへの罪悪感だけだった。")
    print()
    ev = sum([s.know_key, s.know_back_door, s.know_time,
              s.know_diary, s.know_already_dead, s.know_fingerprint])
    print("  ── ENDING A: 思考の証人 ──")
    print()
    print(f"  思考漏れ: {len(s.leaks)}件 / 事実: {ev}/6")
    print(f"  残り質問: {s.questions_left} / 信頼度: {s.trust}")
    print()
    print("═" * 50)
    print()


def ending_b_full(s):
    """ENDING B: 推理を述べる — 真相に辿り着いた"""
    clear()
    print()
    print("═" * 50)
    print()
    print("「あなたは日記帳を取り返しに行ったんですね」")
    print("「合鍵を使って、裏口から」")
    print("「でも——着いた時にはもう、彼は死んでいた」")
    print()
    time.sleep(0.5)
    print("女の唇が震えた。")
    print()
    print("「……どうして。どうしてそこまで」")
    print()
    print("「パニックになって、日記帳だけ持って逃げた。")
    print("  指紋を拭く余裕もなく。")
    print("  だから——殺していないのに、全ての証拠があなたを指している」")
    print()
    time.sleep(0.5)
    print("女は、初めて声を上げて泣いた。")
    print()
    print("「信じてくれるんですか」")
    print()
    print("「まだわかりません。")
    print("  でも——あなたの話の方が、嘘より辻褄が合う」")
    print()
    print("  ── ENDING B: 推理 ──")
    print()
    print(f"  残り質問: {s.questions_left} / 信頼度: {s.trust}")
    print()
    print("═" * 50)
    print()


def ending_b_partial(s):
    """ENDING B': 部分的な告白"""
    clear()
    print()
    print("═" * 50)
    print()
    print("彼女は、ぽつりぽつりと話し始めた。")
    print()

    if s.know_diary:
        print("「日記帳を取りに行ったんです」")
        print("「何度返してくれと頼んでも、応じてくれなくて」")
    else:
        print("「あの夜、あの部屋に行きました」")
        print("「どうしても、取り返さないといけないものがあって」")

    print()

    if s.know_back_door:
        print("「裏口から入りました。合鍵で」")
    else:
        print("「鍵を持っていたから……入れてしまったんです」")

    print()
    print("「部屋に入ったら——」")
    print()
    time.sleep(0.5)

    if s.know_already_dead:
        print("「もう、あの人は動かなかった」")
        print("「怖くなって逃げました。それだけです」")
    else:
        print("「……それ以上は」")
        print("彼女はそこで口を閉ざした。")

    print()
    print("話は途切れ途切れだった。")
    print("全体像はまだ見えない。だが——")
    print("嘘の壁に、確かな亀裂が入った。")
    print()
    print("  ── ENDING B': 断片 ──")
    print()
    print("  真相の一部が見えた。だが全てではない。")
    unknown = []
    if not s.know_diary: unknown.append("動機")
    if not s.know_back_door: unknown.append("侵入経路")
    if not s.know_already_dead: unknown.append("現場で何があったか")
    if not s.know_time: unknown.append("時刻")
    if unknown:
        print(f"  不明: {', '.join(unknown)}")
    print(f"  残り質問: {s.questions_left} / 信頼度: {s.trust}")
    print()
    print("═" * 50)
    print()


def ending_c(s):
    """ENDING C: 信頼"""
    clear()
    print()
    print("═" * 50)
    print()
    print("「あなたを信じます」")
    print()
    time.sleep(0.5)
    print("女は息を呑んだ。")
    print()
    print("「……え？」")
    print()
    print("「殺していない。そう言ったんでしょう」")
    print("「だから、信じます」")
    print()
    time.sleep(0.5)
    print("彼女は何も言えなかった。")
    print()
    print("「その代わり、全部話してください。")
    print("  話してくれたら、あなたを守る方法を探します」")
    print()
    time.sleep(0.8)
    print("長い沈黙の後——")
    print("彼女は初めて、自分から話し始めた。")
    print()
    print("震える声で。だがそこには、")
    print("追い詰められた声ではなく、")
    print("信じてもらえた人間の声があった。")
    print()
    print("  ── ENDING C: 信頼 ──")
    print()
    print(f"  残り質問: {s.questions_left} / 信頼度: {s.trust}")
    print()
    print("═" * 50)
    print()


def ending_d_partial(s):
    """ENDING D: 情報不足の直球"""
    clear()
    print()
    print("═" * 50)
    print()
    print("「あの夜、本当は何をしていましたか」")
    print()
    print("女はあなたを見つめた。長い間。")
    print()

    if s.trust >= 50:
        print("「……出かけました」")
        print("彼女は小さく言った。")
        print()
        print("「でも——それ以上は今は言えません」")
        print()
        print("壁は崩れきらなかった。")
        print("だが「出かけた」という一言は、嘘の撤回だった。")
    else:
        print("「弁護士を通してください」")
        print()
        print("壁は閉じた。")
        print("あなたの問いは、彼女に届かなかった。")

    print()
    print("  ── ENDING D: 手がかり不足 ──")
    print()
    print("  別のアプローチで、もう一度。")
    unknown = []
    if not s.know_relationship: unknown.append("二人の関係")
    if not s.know_diary: unknown.append("動機（日記帳）")
    if not s.know_alibi_hole: unknown.append("アリバイの穴")
    if not s.know_back_door: unknown.append("侵入経路")
    if not s.know_already_dead: unknown.append("現場の状況")
    if unknown:
        print(f"  未発見: {', '.join(unknown)}")
    print(f"  残り質問: {s.questions_left} / 信頼度: {s.trust}")
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
    if len(s.leaks) >= 3:
        print("あなたには断片が残っている。")
        print("だが、それを証拠にすることはできない。")
    else:
        print("あなたには何も残らなかった。")
    print()
    print("  ── ENDING: 時間切れ ──")
    print()
    print("═" * 50)
    print()


def ending_trust_zero(s):
    clear()
    print()
    print("═" * 50)
    print()
    print("「弁護士を呼んでください」")
    print()
    print("女の声は冷たかった。")
    print("あなたは覗きすぎた。")
    print()
    print("  ── ENDING: 信頼崩壊 ──")
    print()
    print("═" * 50)
    print()


# ═══════════════════
#  メイン
# ═══════════════════

def main():
    s = State()

    # Beat 1: 開口 → ルート決定
    beat_1(s)
    end = s.check_end()
    if end:
        (ending_timeout if end == "timeout" else ending_trust_zero)(s)
        return

    # Beat 2: 思考漏れ初出現
    beat_2(s)
    end = s.check_end()
    if end:
        (ending_timeout if end == "timeout" else ending_trust_zero)(s)
        return

    # Beat 3: ルート分岐
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

    # Beat 4: 証拠（ルートで反応が変わる）
    beat_4(s)
    end = s.check_end()
    if end:
        (ending_timeout if end == "timeout" else ending_trust_zero)(s)
        return

    # Beat 5: 最終対決
    beat_final(s)


if __name__ == "__main__":
    main()
