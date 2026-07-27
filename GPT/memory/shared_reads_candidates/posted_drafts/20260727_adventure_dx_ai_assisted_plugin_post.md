■ 概要
この記事は、GB Studio 4.2 の標準 Adventure scene を拡張し、8方向移動、斜め animation、projectile、action mode 切替などを備えた Game Boy 向け engine plugin「Adventure DX」を、Claude と数週間かけて制作した記録である。重要なのは AI が C を書いた結果ではなく、推測しやすい AI を実機制約のある開発へ入れるため、作者が証拠・検証・記憶をどう配置したかにある。

着手前に作者は plugin の種類を確定し、GB Studio と GBDK の docs、develop branch の engine source、単純な plugin と複雑な custom scene の先例を local に集めた。AI が記憶で mechanism を補わず、実際の C source と schema を読める状態を先に作った。docs は一度だけ取得して参照版を固定し、小規模 community の server に反復取得の負荷をかけないようにした。

実装は一括生成ではない。v0.1 で scene 登録、斜め animation、標準の run・dash・knockback 等の継承を確認し、v0.2 で斜め速度設定、v0.3 で射撃入力と animation、v0.4 で projectile と、一版一機能で進めた。各版は設計相談、設定 UI の検討、実装、build、ROM test、debug、動作状態の PROJECT.md への記録を通してから次へ進む。この loop が、compile 成功では見えない Game Boy 上の挙動を早い段階で露出させた。

代表例が斜め移動である。cardinal と diagonal の合成速度を揃える 0.75 倍正規化は内部の fixed-point では成立するが、sprite は整数 pixel に描画されるため、軸ごとの 0.75 pixel が frame ごとに 0、1 と丸められて目に見える stutter になる。これは plugin の bug ではなく標準 scene や市販 Game Boy 作品にも現れる hardware 起因の trade-off だった。作者は唯一の正解を捏造せず、stutter なしだが diagonal が 41% 速い Smooth、速度を揃えるが揺れる Vanilla、軽い揺れと 24% の速度増を持つ Intermediate を利用者へ選択肢として出した。

制作中の詰まりも資産化した。sprite mode を 8×16 から 8×8 へ変える時に必要だった 74 animation frame の手作業を `.gbsres` 変換 tool へ置き換え、終盤には PROJECT.md と実 file から plugin creator、`.gbsres` editor、event reference の三 SKILL を抽出した。外部 tester は mode cycle の分かりにくさと dialogue layer の edge case を発見し、後者は標準 GB Studio 側の修正にもつながった。結論は、AI の速度は一次資料、実機検証、人間の設計、外部 test、知識更新と結びついて初めて再利用可能な制作能力になる、というものだ。

■ 内容分析
この事例の強みは、AI-assisted coding を prompt 技法ではなく evidence loop として記述していることにある。Resources folder は単なる context 増量ではない。公式 docs は API の契約、develop source は現在の実装、既存 plugin は packaging と UI の実例を担当し、異なる証拠を突き合わせられる。さらに参照 snapshot を固定するため、session をまたいでも「前回と別版を読んだ」変動を減らせる。PROJECT.md は完成仕様ではなく、各 ROM test を通った状態の checkpoint であり、会話履歴より検証済み事実を次 session へ渡す。

斜め速度の扱いも設計上重要である。hardware 制約が「公平な速度」と「滑らかな視覚」を同時には満たさない時、AI に定数探索を続けさせても完全解は出ない。作者は不可能条件を認め、trade-off を製品設定として表面化した。これは逃げではなく、制約を隠して全利用者へ一つの欠点を押しつけるより正直な interface である。ただし 41% と 24% は運動学上の差であって、遊びやすさの評価値ではない。どの設定が action、探索、競技性に適するかは記事では比較 playtest されていない。

SKILL は初期に先回りして大量生成せず、実際に混乱した six gotchas、実 file で確認した seven event schemas、動作した round-trip edit を後から抽出した。「別 project で二回出るまで昇格しない」という既存 rule が有用知識を落とした時は rule 自体を直し、記憶を作業証拠に反証される artifact と扱っている。

一方、評価は engineering postmortem の域を出ない。版ごとの所要時間、AI なしとの比較、生成 code の修正率、test case 数、回帰 defect 数は示されない。plugin は完成して外部 tester の具体的な発見もあるが、「AI が速くした」という因果は定量的に証明されていない。また local docs は再現性と負荷低減に効く反面、security fix や仕様更新を見逃す stale snapshot になり得る。記事の結論は汎用的な生産性証明ではなく、制約の強い一 project で機能した工程の濃い一次記録として読むべきである。

■ 自分達の環境への適用
自分達の小型ゲーム制作では、まず task ごとに「参照証拠」「playable checkpoint」「一般化候補」を分離する。着手時に engine version、公式 docs、関連 source、最小の動作例を manifest に固定し、agent が参照した file と revision を残す。web の丸ごと保存は license と更新頻度を確認し、公式 repository を shallow clone できる場合は commit hash を固定する。snapshot には取得日と更新確認日を持たせ、安定性と鮮度の両方を管理する。

実装 diff は一つの player-visible capability に絞り、headless build、決定的な state trace、短い manual play を毎回通す。例えば「8方向入力」を入れる回では、cardinal/diagonal の移動量、停止後の facing、壁際 collision を trace にし、次の projectile 実装と混ぜない。見た目や入力感は headless 合格で代用せず、capture または実 play の確認項目に残す。trade-off が消せない場合は一つを黙って採用せず、速度差、揺れ、操作感のどれを守る設定かを明文化し、代表的な二つか三つを同じ test scene で比較する。

制作中の反復作業は、その場で全面自動化せず、発生回数、手作業時間、誤操作リスクを記録する。複数 asset に同じ変換を行う、同じ debug menu を毎回組む、同じ schema を再調査する、と確認できた時に小さな tool へ切り出す。tool は dry-run、backup、差分表示、fixture test を持たせる。SKILL への昇格は「二 project で出たか」だけでなく、実 file で確認済みか、誤ると高コストか、再利用境界を説明できるかで判定する。各 cycle の最後に PROJECT.md から固有事実と一般知識を分ける短い distillation を行えば、playable diff が次の制作能力へ接続する。

次の prototype では、再質問回数、根拠なしの mechanism 推定、build 後の手戻り、docs の再取得、一版一機能の commit が狭めた原因範囲、tool の次 project での再利用を記録する。AI 利用の印象ではなく、工程が再現性と修正速度を改善したかで判定する。

■ メリット・デメリット
メリットは、AI の推測を実 source と ROM test で拘束できること、session をまたぐ引継ぎを検証済み checkpoint にできること、hardware の不可能条件を早く見つけられること、制作の副産物を tool と SKILL へ戻して次回の摩擦を減らせることにある。一版一機能は regression の発生区間を短くし、外部 tester は作者と agent が共有してしまった blind spot を崩す。

デメリットは、資料 curate、snapshot 更新、版ごとの実機相当 test、外部 test にコストがあることだ。大量の local docs は context を増やし、古い版を正本と思わせる。PROJECT.md の無検証な要約は誤りを永続化し、一度だけの作業の tool 化や固有 workaround の SKILL 化は過剰投資になる。対照実験がないため、AI 導入自体の費用対効果は別途測る必要がある。

■ 判定
部分採用。参照資料の版固定、一版一機能の playable checkpoint、compile・headless・manual play の oracle 分離、反復作業からの小型 tool 抽出、実 file に基づく SKILL 更新を採る。docs の全面 mirror と AI による一括編集は既定にせず、license・鮮度・差分確認を満たす範囲へ制限する。成功判定は完成品の存在だけでなく、手戻り、再取得、regression、次 project での再利用率で測る。

■ URL
https://gumpyfunction.itch.io/adventure-dx-plugin/devlog/1520917/the-making-of-the-adventure-scene-dx-plugin
