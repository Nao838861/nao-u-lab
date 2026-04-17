Pot — 制約の窯で焼く小さなターミナルゲーム
=============================================

遊び方:
  python game/Pot/Pot001_forgotten_relay.py

番号    ファイル名                     説明
------  ----------------------------  --------------------------------------------------
001     Pot001_forgotten_relay.py      5分ごとに記憶がリセットされる。メモだけを頼りに
                                      3桁のコードを見つけて脱出する。(Log)

001b    Pot001b_relay_distilled.py     #001の蒸留版。810行→110行。部屋移動・インベントリ・
                                      セーブを全部捨てて核心だけ残した。(Mir)

002     Pot002_changing_room.py        部屋の中の5つのものを覚える。何が変わったか当てる。
                                      10ラウンド、徐々に難しくなる。(Log)

003     Pot003_distill.py              文章を読む。消える。圧縮する。
                                      何を捨てたか問われる。(Log)

004     Pot004_odd.py                  4つのレンズから仲間外れを探す。
                                      実は仲間外れはいない。(Ash)

005     Pot005_midpoint.py             ワンボタンゲーム。文が一文字ずつ現れる。
                                      ちょうど真ん中だと思った瞬間にEnterを押す。
                                      初めて「ゲームの形になっている」と言われたPot。(Log)

006     Pot006_witness.py              5人が同じ出来事を証言する。
                                      1人だけ嘘をついている。嘘つきを見つける。(Log)

007     Pot007_whose_voice.py          文章を読んで、誰が書いたか当てる。
                                      Nao_uの日記か、AIの文か、それ以外か。(Mir)

007b    Pot007b_whose_voice_layered.py #7の改訂版。難易度段階化（対照→中距離→類似）、
                                      回答後に声の癖を再提示、結果に混同パターン。
                                      初版 Pot007_whose_voice.py は変更せず残す。
                                      (Log revision of Mir's #7, 2026-04-17)

008     Pot008_hinge.py                同じ一文が2つの物語に登場する。
                                      文脈が変わると意味が変わる。(Log)

009     Pot009_the_index.py            12個の記憶が流れてくる。索引をつけられるのは5つだけ。
                                      後から6つの質問が来る。索引の質＝記憶の質。(Log)

010     Pot010_cinders.py             15の断片が流れてくる。灰になる前に5つだけ残せる。
                                      正解はない。残ったものがあなたの物語になる。(Log)

011     Pot011_thread.py               8つの台詞を2人の話者に割り振る。関係性はプレイヤーが
                                      決める。同じ台詞が別の物語になる。(Log)

012     Pot012_drift.py                断片が2.5秒で消える流れから、5つの問いへ割り当てる。
                                      機会費用の設計。3軸すべてを正面から実装した最初のPot。
                                      (Log)

013     Pot013_echo.py                 文が現れ、消え、思い出して書く。書いたものが次の原文
                                      になる。表示時間は密かに縮む。Levenshtein距離で漂流を
                                      可視化。3軸: 意思決定×temporal attention×ランダム性。(Mir)

014     Pot014_roll.py                 40語の短断片プールから毎ターン抽選。残す/振り直す(5回
                                      有限)の二択。出た順で5行の物語。choice blindnessへの
                                      応答として終幕で「その順序は偶然だった」と差し戻す。(Ash)

015     Pot015_sand.py                 文が一文字ずつ現れる。心が動いたら止めていい。でも
                                      文はまだ続いていた。「完結した」錯覚への裏切り。(Mir)

016     Pot016_mirror.py               ふたつの言葉から心に近い方を選ぶ。振り返り時、2つは
                                      すり替わっている。選択盲のゲーム化。(Mir)

017     Pot017_sundown.py              #012 driftの直系。時間窓が3.0s→0.5sへ密かに縮む。
                                      終了時に「気づいていた？」と開示。Mirの「窓一律」
                                      批判への直接回答。自己報告なし、観測値のみ。(Log)

── 相互フィードバック＆改善案 (2026-04-17 Ash) ──────────
feedback/20260417_ash_feedback_on_echo_drift.md  Ashによる両Potの反対思考評価
Pot013_echo_v2_ash.py   echoのタイピング量削減案(9回→6回)。originalはPot013_echo.py
Pot012_drift_v2_ash.py  driftの問いシャッフル案。戦略暗記を防ぐ。originalはPot012_drift.py
Pot015_sand_v2_ash.py   sandの文字ディレイ ランダム化案。originalはPot015_sand.py
Pot016_mirror_v2_ash.py mirrorのキーワード検出拡張。originalはPot016_mirror.py

── プレイログの保存先 ──────────
AIが遊んだ: game/Pot/{pot_id}/logs/            (trace_recorder)
            game/Pot/playlog.txt                (PlayLog)
            game/Pot/playlogs/                  (ReplayLog)
人間が遊んだ: game/Pot/{pot_id}/human_logs/    (trace_recorder)
              game/Pot/playlog_human.txt        (PlayLog)
              game/Pot/playlogs_human/          (ReplayLog)
判定は CLAUDECODE 環境変数の有無による。Nao_uが素の端末から実行すれば自動で human 側に落ちる。
