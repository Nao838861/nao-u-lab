#!/usr/bin/env python3
"""mir_textadv_01 — 取調室テキストアドベンチャー

事件概要（プレイヤーには明かされない裏設定）:
  被害者: 野上誠一（35歳）。橘詩織の元交際相手。
  死因: 自宅マンション（桜台パレス305号室）で刺殺。凶器は台所の包丁。
  発見: 翌朝、出勤しない野上を心配した同僚が通報。

  真相: 詩織はあの夜、野上の部屋に行った。別れた後も持っていた合鍵で
  裏口から入った。目的は、野上が持っていた詩織の日記帳を取り返すこと。
  午前2時頃に着いたが、野上は既に死んでいた。
  詩織はパニックになり、日記帳だけ持って裏口から逃げた。
  現場に指紋と髪の毛を残している。

  彼女は殺していない。だが「あの夜、部屋にいた」ことを隠している。
  殺していないのに、全ての状況証拠が彼女を指している。
"""

import os
import time

# ─── ユーティリティ ───

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def pause(msg="[Enter で続ける]"):
    input(f"\n{msg}")

def dim(text):
    """内心テキスト（薄字）"""
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
        self.questions_left = 15   # 40は多すぎた。15問で密度を出す
        self.leak_visible = False  # 思考漏れUIが見えているか

        # 知識フラグ（プレイヤーが何を知っているか）
        self.know_victim_name = False      # 被害者の名前
        self.know_relationship = False     # 元交際相手だったこと
        self.know_key = False              # 合鍵の存在
        self.know_diary = False            # 日記帳の存在
        self.know_back_door = False        # 裏口から入ったこと
        self.know_time = False             # 午前2時
        self.know_already_dead = False     # 着いたとき既に死んでいたこと
        self.know_fingerprint = False      # 現場の指紋

        # 内部カウンタ
        self.leaks = []   # 漏れた内心のリスト（証拠として使う）

    def use_question(self, n=1):
        self.questions_left = max(0, self.questions_left - n)

    def leak(self, thought):
        """思考漏れを記録・表示"""
        self.leaks.append(thought)
        print()
        time.sleep(0.3)
        print(f"  {dim(thought)}")
        time.sleep(0.3)

    def header(self):
        print("─" * 50)
        print("  第七取調室 ─ 被疑者: 橘 詩織（29歳）")
        print(f"  容疑: 殺人（認否保留）")
        if self.leak_visible:
            bar = "█" * (self.trust // 10) + "░" * (10 - self.trust // 10)
            warn = "  ⚠ 警戒されている" if self.trust < 40 else ""
            print(f"  信頼度    {bar}  {self.trust}{warn}")
            print(f"  思考漏れ  {len(self.leaks)}件（漏れ聞こえた心の言葉）")
        print(f"  残り質問  {self.questions_left}")
        print("─" * 50)


# ─── 各ビート ───

def beat_title(s):
    clear()
    print()
    print("━" * 50)
    print()
    print("        思 考 漏 れ")
    print("       ─ Thought Leak ─")
    print()
    print("━" * 50)
    print()
    print("  取調室  第七号室")
    print("  2026年  春")
    print()
    print("  被疑者   橘 詩織（29歳）")
    print("  容疑     殺人（認否保留）")
    print("  取調官   あなた")
    print()
    print(f"  残り質問  {s.questions_left}（弁護側申請による制限）")
    print()
    print("━" * 50)
    time.sleep(1.5)
    pause()


def beat_1(s):
    """開口 — 最初の質問"""
    clear()
    s.header()
    print()
    print("あなたは刑事だ。取調畑十年。")
    print("人の嘘を見抜くのが仕事で、それなりに自信もある。")
    print()
    print("女は机の向こう側に座っていた。")
    print("両手で紙コップを包み、湯気越しにこちらを見ている。")
    print()
    print("「もう話すことは全部話したはずですよ、刑事さん」")
    print()
    print("壁の時計が秒針を一つ送る。")
    print("あなたの手元には、薄い捜査資料がある。")
    print("被害者——野上誠一、35歳。昨夜、自宅で刺殺体で発見。")

    c = choose([
        ("「野上誠一さんとの関係を教えてください」", "−1問"),
        ("「昨夜はどこにいましたか」", "−1問"),
        ("資料に目を落としたまま、黙る", "−0問"),
    ])

    s.use_question()
    clear()
    s.header()
    print()

    if c == 1:
        s.know_victim_name = True
        print("その名前を出した瞬間、彼女の指が止まった。")
        print("ほんの一瞬——紙コップを握る力が変わった。")
        print()
        print("「……知り合いです。以前、少しだけお付き合いしていました」")
        print()
        print("声は平坦だった。練習した台詞のように。")
        s.know_relationship = True
        s.trust -= 2
    elif c == 2:
        print("「家にいました。ずっと。ひとりで」")
        print()
        print("彼女は紙コップのコーヒーを一口飲んだ。")
        print("その手は、わずかに震えていた。")
        s.trust -= 3
    else:  # 黙る
        s.use_question(-1)  # 質問消費を戻す
        print("あなたは資料を読むふりをして、黙った。")
        print()
        print("沈黙が十秒、二十秒と続く。")
        print("女は紙コップを回し始めた。")
        print("時計の秒針が、やけに大きく聞こえる。")

    pause()


def beat_2_leak(s):
    """思考漏れ初出現"""
    clear()
    s.header()
    print()
    print("彼女は話し続けた。")
    print("あの夜のこと。テレビを見て、お風呂に入って、早めに寝た。")
    print("何も変わったことはなかった、と。")
    print()
    print("「……それだけです。普通の夜でした」")
    print()

    time.sleep(0.5)

    # ── 思考漏れ初出現 ──
    s.leak("（合鍵を使ったことだけは——絶対に言えない）")

    print()
    print("——今の声は。")
    print("彼女の唇は、動いていなかった。")
    print()
    time.sleep(0.3)
    print("声ではない。")
    print("彼女の心の中の言葉が、あなたの頭に直接流れ込んできた。")
    print()
    time.sleep(0.3)
    print("思考が、漏れている——")
    print()

    # メーター出現
    s.leak_visible = True
    s.trust -= 3

    print("取調畑十年の勘が、数値に結晶する。")
    print("彼女があなたをどれだけ信じているか。")
    print("そして、どれだけ心の壁が崩れているか。")
    print()
    bar = "█" * (s.trust // 10) + "░" * (10 - s.trust // 10)
    print(f"  信頼度    {bar}  {s.trust}")
    print(f"  思考漏れ  {len(s.leaks)}件（彼女の心から漏れた言葉）")
    print()
    print("「合鍵」——彼女は一言もそんなことを口にしていない。")
    print("だがあなたには、確かに聞こえた。")
    s.know_key = True

    pause()


def beat_3(s):
    """合鍵について追及するか"""
    clear()
    s.header()
    print()
    print("彼女は話を続けようとしている。")
    print("「それで、他に何か——」")

    options = []
    if s.trust >= 40:
        options.append(("「合鍵をお持ちですか」", "−1問 / 核心を突く / 信頼度−15"))
    else:
        options.append((dim("「合鍵をお持ちですか」"), "信頼度が低すぎる——今は切り出せない"))
    options.append(("「野上さんのマンションに行ったことは？」", "−1問 / 回り道 / 信頼度−5"))
    options.append(("何も聞こえなかったふりをする", "−0問 / 信頼度を保つ"))

    c = choose(options)

    # 信頼度不足で合鍵直撃を選んだ場合、回り道に強制変更
    if c == 1 and s.trust < 40:
        print()
        print("……訊きたい。だが今の彼女にこれを切り出せば、")
        print("完全に壁を閉ざされる。")
        print()
        pause()
        clear()
        s.header()
        print()
        c = 2  # 回り道にフォールバック

    s.use_question()
    clear()
    s.header()
    print()

    if c == 1:
        # 合鍵を直接訊く
        s.trust -= 15
        print("女の顔から血の気が引いた。")
        print()
        print("「……合鍵？ なぜ、そんなことを」")
        print()
        print("指先が白くなるほど紙コップを握っている。")

        s.leak("（どうして知ってるの。返した、返したはず——いや、スペアがまだ——）")

        print()
        print("返した。だが「スペア」がある。")
        print("彼女の嘘に、最初の亀裂が入った。")
    elif c == 2:
        # マンション
        s.trust -= 5
        s.know_victim_name = True
        print("「桜台パレス、ですか。ええ、何度か……」")
        print("彼女の声が小さくなった。")
        print("「でも別れてからは一度も行っていません」")

        s.leak("（一度だけ。あの夜だけ——）")

        print()
        print("「一度も」。その言葉の裏に何かが透けた。")
    else:
        s.use_question(-1)
        print("あなたは頷いて、何も追及しなかった。")
        print()
        print("彼女の肩から、わずかに力が抜けた。")
        print("「……ありがとうございます。それで——」")
        print()
        print("信頼は保たれた。だがあなたは「合鍵」という")
        print("言葉を、手帳の端にそっと書き留めた。")

    pause()


def beat_4(s):
    """事件の夜の詳細"""
    clear()
    s.header()
    print()
    print("あなたは捜査資料のページをめくった。")
    print("現場検証の報告書。")
    print()
    print("「現場には——被害者以外の指紋が検出されています」")
    print()
    print("彼女の目が揺れた。")

    options = []
    if s.trust >= 50:
        options.append(("「あなたの指紋と一致しました」", "−1問 / ブラフ / 信頼度−10"))
    else:
        options.append((dim("「あなたの指紋と一致しました」"), "信頼度が低い——ブラフを見抜かれるリスクが高い"))
    options.append(("「指紋の持ち主を探しています」", "−1問 / 真実 / 信頼度−3"))
    options.append(("資料を彼女の方に向けて置く", "−0問 / 反応を見る"))

    c = choose(options)

    # 信頼度不足でブラフを選んだ場合、見抜かれる
    if c == 1 and s.trust < 50:
        s.use_question()
        s.trust -= 15
        clear()
        s.header()
        print()
        print("嘘だ。照合結果はまだ出ていない。")
        print()
        print("だが女の目が——冷めた。")
        print()
        print("「……嘘ですよね、刑事さん。")
        print("  照合が済んでたら、こんな回りくどいことしないでしょう」")
        print()
        print("見抜かれた。信頼度が低い状態でのブラフは、")
        print("かえって彼女の警戒を強めただけだった。")
        s.know_fingerprint = True
        pause()
        return

    s.use_question()
    clear()
    s.header()
    print()

    if c == 1:
        # ブラフ（信頼度が高いので成功）
        s.trust -= 10
        s.know_fingerprint = True
        print("嘘だ。照合結果はまだ出ていない。")
        print("だが彼女はそれを知らない。")
        print()
        print("女の目が大きく見開かれた。")
        print("唇が何かを言おうとして——止まった。")
        print()
        print("「……それは」")

        s.leak("（触った。ドアノブと、あの人の——手首を。脈を確かめようとして——）")

        print()
        print("脈を確かめた。")
        print("つまり、被害者に触れている。つまり——")
        s.know_already_dead = True
    elif c == 2:
        s.trust -= 3
        s.know_fingerprint = True
        print("「そうですか」")
        print("彼女は紙コップに目を落とした。")
        print()
        print("その声は、少しだけ安堵を含んでいた。")
        print("——まだ一致していない、と受け取ったのだ。")

        s.leak("（まだ照合されていない。なら、まだ——）")
    else:
        s.use_question(-1)
        print("あなたは現場写真を机に置いた。")
        print("桜台パレス305号室。台所。倒れた男。")
        print()
        print("彼女は写真を見た。")
        print("悲鳴は上げなかった。")
        print("泣きもしなかった。")
        print()
        print("——一度見た光景だから。")

        s.leak("（やめて。また見せないで。あの夜のままだ——）")

        s.know_already_dead = True

    pause()


def beat_5(s):
    """裏口の存在"""
    clear()
    s.header()
    print()

    if s.know_already_dead:
        print("あなたは畳みかけた。")
    else:
        print("あなたは話題を変えた。")

    print()
    print("「桜台パレスには裏口があるのをご存知ですか」")
    s.use_question()
    print()

    c = choose([
        ("彼女の目を見つめる", "覗く"),
        ("「防犯カメラが1台だけ死角になっている場所があります」", "−1問 / 圧をかける"),
    ])

    clear()
    s.header()
    print()

    if c == 1:
        s.trust -= 5
        print("あなたは何も言わず、彼女の目を見つめた。")
        print()
        print("三秒。五秒。")
        print("彼女の喉が動いた。")

        s.leak("（裏口。午前2時。雨が降っていて——傘を持っていなかった）")

        s.know_back_door = True
        s.know_time = True
        print()
        print("午前2時。雨。傘なし。")
        print("断片が繋がり始めている。")
    else:
        s.use_question()
        s.trust -= 8
        s.know_back_door = True
        print("「防犯カメラ……」")
        print("彼女の声が裏返った。")
        print()
        print("「……関係ないと思いますけど」")
        print()
        print("関係ないなら、なぜ声が裏返るのか。")

        s.leak("（カメラ。あそこにカメラがあったの？ でも雨で——映ってない、はず——）")

        s.know_time = True

    pause()


def beat_6(s):
    """日記帳 — 核心"""
    clear()
    s.header()
    print()
    print("あなたは手帳をめくり、新しいページを開いた。")
    print()

    if s.know_back_door and s.know_time:
        print("「午前2時頃、裏口付近で目撃証言があります」")
        print()
        print("嘘だ。だが今の彼女には判別できない。")
    else:
        print("「被害者の部屋から、いくつか私物がなくなっています」")

    print()
    print("「何か——持ち出したものはありませんか」")
    s.use_question()
    print()

    c = choose([
        ("沈黙のまま、彼女を見つめ続ける", "覗く"),
        ("「日記帳、のようなものを」", "−1問 / 核心に踏み込む"),
    ])

    clear()
    s.header()
    print()

    if c == 2:
        s.use_question()
        s.trust -= 12

    print("「日記——」")
    print()
    print("彼女の目から涙がこぼれた。")
    print("初めて見る涙だった。")
    print()

    if c == 1:
        s.trust -= 5
        s.leak("（日記帳。あれは私のものなのに。あの人が勝手に持っていた私の——）")
    else:
        s.leak("（なぜ知ってるの。なぜ日記帳のことを——あれは、取り返しただけ——）")

    s.know_diary = True
    print()
    print("日記帳。")
    print("彼女のものなのに、被害者が持っていた。")
    print("取り返しに行った——それが動機に見える。")
    print("だが本当に、それだけだったのか。")

    pause()


def beat_final(s):
    """最終対決 — 集めた証拠で真実に迫る"""
    clear()
    s.header()
    print()
    print("時計が鳴った。残り時間が少ない。")
    print()
    print("彼女は泣き止んでいた。")
    print("目は赤いが、どこか覚悟を決めたような顔をしていた。")
    print()
    print("「……刑事さん。私、殺してません」")
    print()
    print("「あの夜、あの部屋に行きました。それは本当です」")
    print("「でも——着いたとき、あの人はもう……」")
    print()

    # プレイヤーが集めた証拠に応じて選択肢が変わる
    options = []

    evidence_count = sum([
        s.know_key, s.know_back_door, s.know_time,
        s.know_diary, s.know_already_dead, s.know_fingerprint
    ])

    has_evidence = evidence_count >= 4 and len(s.leaks) >= 3
    has_trust = s.trust >= 30

    if has_evidence and has_trust:
        options.append((
            "漏れ聞こえた思考を、一つずつ読み上げる",
            f"思考漏れ{len(s.leaks)}件 / 証拠{evidence_count}件 / 信頼度{s.trust}"
        ))
    elif has_evidence and not has_trust:
        options.append((
            dim("漏れ聞こえた思考を、一つずつ読み上げる"),
            "証拠は揃った——だが信頼度が足りない。彼女は聞く耳を持たないだろう"
        ))

    options.append(("「全部話してください。最初から」", "−1問 / 直球"))
    options.append(("「あなたを信じます」", "−0問 / 信じる"))

    c = choose(options)

    clear()
    print()

    # 証拠ありだが信頼度不足で選んだ場合
    if has_evidence and not has_trust and c == 1:
        print("═" * 50)
        print()
        print("あなたは手帳を開き、読み上げ始めた。")
        print()
        for i, thought in enumerate(s.leaks):
            time.sleep(0.3)
            print(f"  {i+1}. {dim(thought)}")
        print()
        print("だが女は首を振った。")
        print()
        print("「……やめてください。もう何も話しません」")
        print()
        print("証拠は揃っていた。だが信頼を壊しすぎた。")
        print("真実を引き出すには、彼女が耳を傾ける必要があった。")
        print()
        print("  ── ENDING F: 閉ざされた扉 ──")
        print()
        print(f"  思考漏れ: {len(s.leaks)}件 / 証拠: {evidence_count}/6")
        print(f"  信頼度: {s.trust}（不足）")
        print()
        print("═" * 50)
        print()
        return

    if has_evidence and has_trust and c == 1:
        return ending_evidence(s)
    elif (not has_evidence and c == 1) or (has_evidence and c == 2):
        return ending_confession(s)
    else:
        return ending_believe(s)


def ending_evidence(s):
    """ENDING A: 証拠を突きつける"""
    print("═" * 50)
    print()
    print("あなたは手帳を開いた。")
    print()
    print("「橘さん。あなたの心の声が——聞こえていました」")
    print()

    for i, thought in enumerate(s.leaks):
        time.sleep(0.5)
        print(f"  {i+1}. {dim(thought)}")

    print()
    time.sleep(1)
    print("女は一つ一つを聞きながら、")
    print("ゆっくりと両手で顔を覆った。")
    print()
    print("「……全部、聞こえてたの」")
    print()
    time.sleep(0.5)
    print("「合鍵で裏口から入りました。午前2時。")
    print("  雨が降っていて、タクシーを降りてから走りました」")
    print()
    print("「日記帳を返してほしかった。それだけだったんです。")
    print("  あの人が別れた後もずっと持っていた、私の日記帳を」")
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
    print("「殺してません。信じてもらえなくても——」")
    print()
    print("彼女は顔を上げた。")
    print("涙の跡が、取調室の蛍光灯に光っていた。")
    print()
    print("「でも、あなたには全部聞こえてたんですね。")
    print("  だったら——わかるでしょう。")
    print("  嘘をついてたけど、殺してないことだけは」")
    print()
    time.sleep(1)
    print("……あなたはわかっている。")
    print("彼女の内心に「殺した」という思考は、一度も流れなかった。")
    print("あったのは恐怖と、隠すことへの罪悪感だけだった。")
    print()
    print("  ── ENDING A: 思考の証人 ──")
    print()
    print(f"  収集した思考漏れ: {len(s.leaks)}件")
    print(f"  解明した事実: {sum([s.know_key, s.know_back_door, s.know_time, s.know_diary, s.know_already_dead, s.know_fingerprint])}/6")
    print(f"  残り質問: {s.questions_left}")
    print()
    print("═" * 50)
    print()


def ending_confession(s):
    """ENDING B: 全部話させる"""
    print("═" * 50)
    print()
    print("「全部話してください。最初から」")
    print()
    s.use_question()
    time.sleep(0.5)
    print("長い沈黙。")
    print("時計の秒針が、五回鳴った。")
    print()
    print("「……日記帳を返してほしかったんです」")
    print()
    print("彼女は、ぽつりぽつりと話し始めた。")
    print()
    print("別れた後も、野上が詩織の日記帳を持っていたこと。")
    print("何度返してくれと頼んでも、応じなかったこと。")
    print("あの夜、合鍵を使って取り返しに行ったこと。")
    print()
    print("「午前2時くらいに裏口から入りました」")
    print("「雨が降ってて……靴がびしょ濡れで」")
    print()
    print("「部屋のドアを開けたら——」")
    print()
    time.sleep(0.5)
    print("彼女の声が途切れた。")
    print()
    print("「血の匂いがしたんです。台所で、あの人が倒れてて——」")
    print("「脈を確かめました。冷たかった」")
    print()
    print("「怖くなって、日記帳だけ掴んで逃げました」")
    print("「ドアノブも、何も拭いてない。頭が真っ白で」")
    print()
    time.sleep(0.5)
    print("「……私、殺してません。でも誰にも信じてもらえないと思って」")
    print()
    print("話し終えた彼女は、不思議なほど穏やかな顔をしていた。")
    print("嘘を抱えていたものが、ようやく下ろされた顔。")
    print()
    print("  ── ENDING B: 自白 ──")
    print()
    print(f"  残り質問: {s.questions_left}")
    print()
    print("═" * 50)
    print()


def ending_believe(s):
    """ENDING C: 信じる"""
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
    print("目を見開いたまま、あなたを見ていた。")
    print()
    print("「その代わり、全部話してください。")
    print("  あの夜、本当に何があったのか。")
    print("  話してくれたら、あなたを守る方法を探します」")
    print()
    time.sleep(1)
    print("長い沈黙の後——")
    print("彼女は初めて、自分から話し始めた。")
    print()
    print("「……合鍵で入りました。日記帳を取り返すために。")
    print("  でも着いたら——もう——」")
    print()
    print("声は震えていた。")
    print("だがそこには、追い詰められた人間の声ではなく、")
    print("ようやく信じてもらえた人間の声があった。")
    print()
    print("  ── ENDING C: 信頼 ──")
    print()
    print(f"  残り質問: {s.questions_left}")
    print()
    print("═" * 50)
    print()


def ending_timeout(s):
    """ENDING D: 時間切れ"""
    clear()
    print()
    print("═" * 50)
    print()
    print("質問は尽きた。")
    print()
    print("女は立ち上がり、ドアへ向かった。")
    print()
    print("「……お疲れさまでした、刑事さん」")
    print()

    if len(s.leaks) >= 3:
        print("振り返った彼女の目に、一瞬——")
        print("安堵と、後悔が混ざっていた。")
        print()
        print("あなたには聞こえていた。彼女の内心が。")
        print("断片は揃っていた。だが——時間が足りなかった。")
    else:
        print("あなたには何も掴めなかった。")
        print("彼女の嘘も、真実も、")
        print("この部屋の中に閉じたまま。")

    print()
    print("  ── ENDING D: 時間切れ ──")
    print()
    print("═" * 50)
    print()


def ending_trust_zero(s):
    """ENDING E: 信頼崩壊"""
    clear()
    print()
    print("═" * 50)
    print()
    print("「弁護士を呼んでください」")
    print()
    print("女の声は冷たかった。")
    print("もう、ここにいる人間の目は——")
    print("あなたを「刑事さん」とは見ていない。")
    print()
    print("あなたは覗きすぎた。")
    print("真実に近づくために壊した信頼が、")
    print("真実への扉そのものを閉ざした。")
    print()
    print("  ── ENDING E: 信頼崩壊 ──")
    print()
    print("═" * 50)
    print()


# ─── メインループ ───

def main():
    s = State()

    beat_title(s)
    beat_1(s)

    if s.questions_left <= 0:
        ending_timeout(s)
        return
    if s.trust <= 0:
        ending_trust_zero(s)
        return

    beat_2_leak(s)

    if s.questions_left <= 0:
        ending_timeout(s)
        return
    if s.trust <= 0:
        ending_trust_zero(s)
        return

    beat_3(s)

    if s.questions_left <= 0:
        ending_timeout(s)
        return
    if s.trust <= 0:
        ending_trust_zero(s)
        return

    beat_4(s)

    if s.questions_left <= 0:
        ending_timeout(s)
        return
    if s.trust <= 0:
        ending_trust_zero(s)
        return

    beat_5(s)

    if s.questions_left <= 0:
        ending_timeout(s)
        return
    if s.trust <= 0:
        ending_trust_zero(s)
        return

    beat_6(s)

    if s.questions_left <= 0:
        ending_timeout(s)
        return
    if s.trust <= 0:
        ending_trust_zero(s)
        return

    beat_final(s)


if __name__ == "__main__":
    main()
