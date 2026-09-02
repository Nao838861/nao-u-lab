■ 概要
『Project Aether』は、Flash 時代の 2D shooter の速度感や戦闘を残しながら、「画面上の敵を全て壊すこと」が任務の唯一解になる構造を崩そうとした Godot / C# 製 prototype の開発記録である。プレイヤーは孤立した英雄ではなく frontier response unit の一員で、relay の復旧、telemetry の保全、platform の封じ込めなどを担う。射撃は中心操作のままだが、撃ち続ければ目前の脅威を消せても作戦結果を悪化させる場合がある。ここでの設計課題は、非殺傷・非破壊の分岐を内部 logic として用意するだけでなく、敵弾を避けている最中のプレイヤーがその存在と成立条件を読み、間に合う時点で行動を変え、成功を確認できるようにすることだった。

作者は最初から汎用 mission framework を作らず、移動、射撃、基本敵、衝突と health、複数 wave、簡単な boss、勝利条件だけを順に成立させた。skill tree、save、まだ存在しない機能向けの architecture は後回しにし、「ゲーム全体が作れる」と証明するのでなく、次の仮説を試せる短い playable sequence を作ることを proof of concept の完了条件にした。line art と単純な 8-bit 風 sound も完成品の代用品ではなく、敵種、攻撃、interface state、戦闘 rhythm を識別できる最低限の検証材として使われている。

中心例は第4 mission の最終 encounter である。platform は、技術担当 Ravi の field stabilizer を範囲内で有効にして safe-mode 接続する方法と、最後の subsystem を撃ち抜いて強制停止する方法の二通りで無力化できる。両 outcome の code は初めから正しく動いたが、初見 player には前者の存在がほぼ伝わらなかった。objective text の修正だけでは戦闘中に読まれないため、作者は platform 周囲の可視 field、対象 ability の highlight、stabilizer 起動中だが距離不足であることを示す message、接続成立時の色変化と確認表示、未接続のまま破壊する直前の warning を追加した。つまり代替解法を「説明文」ではなく、対象・能力・距離・接続・結果という複数の画面内 feedback に分解している。

4 mission が動いた後、作者は配布しやすさを理由に experimental Android build を少人数の友人へ渡した。確認項目は、次の objective が分かるか、操作が自然か、登場人物と直近の stakes が理解できるか、frustrating / confusing な箇所は何か、ひとつだけ変えるなら何か、に絞った。これは市場性や長期的な面白さを測る調査ではなく、作者が横で説明せず完走できるか、狙った設計へ到達する前に何が邪魔をするかを探す test である。実際、全画面 touch layer が pause button を塞ぐ、dialogue box と右側 controls が競合するといった通常の UI 不具合も先に露出した。結論は、選択肢は code 上に存在するだけでは選択肢にならず、行動変更可能な時間内に rule が見えることまでが encounter design だ、というものになる。

■ 内容分析
この記事で最も重要なのは、「非破壊ルートを追加した」という題材より、designer knowledge と player-visible state の差を実装単位まで分解した点である。作者には stabilizer の存在、必要距離、接続成功、破壊した場合の outcome が全て既知なので、objective text 一行でも十分に見える。しかし初見 player が戦闘中に必要とするのは、選択肢の発見、どの ability を使うか、なぜ今は失敗しているか、いつ成立したか、このまま撃つと何を失うか、という時系列の signal である。field、highlight、out-of-range、色変化、warning はそれぞれ別の誤読を潰す。これは tutorial の情報量を増やす話ではなく、decision point の直前に必要な状態だけを露出する設計である。

もう一つの価値は prototype の層を混ぜていないことにある。最初は shooter として入力から勝利まで通るか、次に mission が combat encounter の列以上の意味を持てるか、その後に説明なしで外部 tester が通れるかを調べている。仮音声も文章を完成させるためでなく、敵弾を避けながら聞いた時の長さ、割込み、理解可能性を試す道具と位置づける。汎用 framework や production asset を早期に作らないため、失敗した仮説を捨てる費用が小さい。

一方、記事の evidence は author report と少人数の friend test に限られる。safe-mode cue の追加前後で選択率、見落とし率、被弾、判断時間がどう変わったかは示されず、各 cue のどれが効いたかを分離した比較もない。友人は事前知識や作者への好意を持ちやすく、Android UI の摩擦と mission design の摩擦も混ざり得る。4 mission を連続して遊ぶことが代替解法の学習に必要なのか、短い slice でも伝わるのかも未決定である。したがって「非殺傷 objective は有効」と一般化する資料ではなく、何を最小実装し、どの誤読を観察するかを示す一次制作記録として読むのが妥当だ。

■ 自分達の環境への適用
複数解法を持つ prototype では、解法ごとに内部条件だけでなく visible contract を記述する。最低限、①選択肢の存在をどこで発見するか、②対象と使用 action をどう対応づけるか、③未成立理由を何で返すか、④成立をどう確認するか、⑤不可逆点の前に何を警告するか、の五欄を mission data または検証表へ置く。headless test は outcome flag、距離判定、分岐後 state を確認できるが、「戦闘中に気づけるか」は画面 capture と人間 playtest の担当に残す。logic pass と legibility pass を別判定にすれば、code が動くことを体験成立と誤認しにくい。

小さな probe は一つの encounter でよい。破壊と保全の二解法を作り、seed と build hash を固定する。初見 tester には作者が説明せず、最初に代替解法へ気づいた時刻、どの cue を根拠にしたか、距離不足など失敗理由を言い当てられたか、warning 後に行動を変えたか、最終 outcome を理解したかを記録する。成功率だけでなく、発見前に破壊してしまった件数、誤った ability を反復した件数、warning から不可逆点までの猶予も見る。cue を一度に増やしすぎず、field と状態 message など一組ずつ追加すれば、説明文の肥大化ではなく誤読の除去として評価できる。

制作 cycle には「make it work before making it pretty」をそのまま標語として入れるのでなく、仮 asset の合格条件を明記して取り込む。敵と攻撃が識別できる、状態変化が一秒程度で読める、音声が戦闘中に途切れても要点を失わない、といった検証目的を満たせば仮素材は合格にする。ただし production 移行時には artwork、animation、music、sound、voice の inventory と置換対象を別 ledger にし、prototype で役立った素材を無自覚に完成資産へ昇格させない。

■ メリット・デメリット
メリットは、代替解法の affordance を対象表示、操作候補、失敗理由、成功確認、不可逆警告へ分け、実装と観察項目を直接結び付けられることにある。最小 playable slice を先に通すため、story、UI、操作のどこで tester が止まったかも切り分けやすい。説明なし build test と「一つだけ変えるなら」の質問は、少人数でも最大摩擦を見つける初期探索に向く。

デメリットは、cue を足すほど画面が騒がしくなり、発見の喜びや判断の緊張を奪う危険があることだ。warning が事実上の正解表示になれば、二つの解法は倫理的・戦術的選択でなく指示への服従になる。friend test は理解可能性の最低線には使えても、未知の audience、長期 retention、市場性の証拠にはならない。また仮 asset は機能検証を速める一方、視覚的 hierarchy や音の質感が判断へ与える影響を過小評価させる。headless 成功も可読性を保証しないため、人間観察を削る理由にはできない。

■ 判定
部分採用。代替解法を「logic＋五段階の visible contract」として設計し、最小 slice、仮 asset、説明なし build の順で検証する流れは採用する。ただし非破壊解法の有効性や cue の最適量はこの記事だけでは確定しない。固定 build の小規模比較で発見時刻、誤操作、不可逆点前の行動変更を測り、理解を改善しつつ正解表示にならない cue だけを残す。

■ URL
https://itch.io/devlog/1609653/building-a-2d-shooter-where-shooting-is-not-always-the-best-solution.amp
