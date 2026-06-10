■ 概要
Player Driven の 2026-04-02 記事は、GDC 2026 で Riot Games の Stone Librande と Marc LeBlanc が進行した 1 日型 hands-on game design workshop の参加記録である。講演メモではなく、参加者が既存ゲームを紙プロトタイプへ移し、短い playtest で破綻を見つけ、午後には非対称ゲームの数値を調整して deathmatch へ接続するまでの、設計作業の手触りが残っている。記事の中核は、ゲームデザインを「先に mechanics を並べる作業」ではなく、「プレイヤーに起こしたい感情・心理状態から逆算して、systems、verbs、rules、interaction を選別する作業」として扱う点にある。

午前の演習では、4-6 人のテーブルごとに好きな既存ゲームを選び、そのゲームが生む中心的な感情を 1 つ決める。筆者の Doom Eternal チームは、不安などの候補を出したあと、最終的に「強い」という感覚を紙プロトタイプで再現する目標にした。そこから、狭い空間、敵の種類、遠距離・近距離・melee 武器、弾薬、HUD、power-up、連続撃破などの要素を洗い出し、付箋とサイコロで扱える lane system に落とす。敵はレーン上を下り、Doom Slayer は lane を切り替え、撃ち、近接し、前進する。ここで重要なのは、原作の全要素を縮小コピーするのではなく、狙った感情に寄与し、紙と駒とマーカーで実装できる player action だけを残すことだった。

次の段階では verbs が明示される。参加者は shooting、Glory Kill healing、running など、原作でプレイヤーが行う動詞を付箋に出し、それが「強い」という感情目標にどうつながるか、紙プロトタイプで再現可能かを見て絞り込む。試作は 2 レーン、Cacodemon / Revenant / Marauder、敵ごとの hit point と移動・攻撃、Doom Slayer 側の 3 hit point、lane switch、射撃、隣接 instant kill、advance、端まで生きて到達する勝利条件に整理された。ここまでは、感情目標を mechanics に変換する工程として明瞭である。

ただし、初回の外部 playtest で大きな欠落が見つかる。新規プレイヤーは lane switching と shooting はすぐ理解したが、advance action を見落とし、遠距離から敵を撃ち続けた。結果として、理論上は敵を処理し続けるだけの endless loop が成立しうることが露出した。これは「ルール説明が足りなかった」という小さな話ではなく、設計者が前提にしていた必須 action が、初見プレイヤーの行動として自然に立ち上がらなかったという発見である。短い紙プロトタイプでも、player action の見落とし、勝利条件の圧力不足、ループ破綻を検出できる。

記事はこの演習を MDA と Librande の Game Fundamentals Framework の使い分けへ接続する。MDA は mechanics / dynamics / aesthetics の関係を通じて、システムと player action と感情のつながりを見る枠組みとして扱われる。一方 GFF は Start、Goal、Opposition、Decisions、Rules、Interaction の 6 要素から、たとえば「この rule は理解しにくい」「この obstacle は frustrating すぎる」といった、修正可能な精密文に落とすときに強い。記事で面白いのは、設計者とプレイヤーの向きが逆だと整理している点である。設計者は emotional / psychological / aesthetic goal から systems と mechanics へ降りるが、初見プレイヤーは mechanics から入り、時間をかけて system と意味を理解し、ようやく感情的な中心へ到達する。Doom 紙プロトタイプの advance 見落としは、この非対称性を小さく露出させた例と言える。

午後の balancing exercise では、Us vs. It という非対称な tank vs robot game を使う。片側は 4 台の tank、もう片側は 10 個の preset action を持つ強い robot を操作する。目標は、robot が街へ到達する直前に、残り 1 hit point の tank がぎりぎり倒すような Hollywood ending を作ること。参加者は damage 値を短い round で調整し、さらに robot の action の一部を独自 mechanic に置き換える。各 robot は同じ tank 群に対して調整されているため、その後の 4-way deathmatch でも相互にある程度バランスが取れる。ここでも数値調整は単独目的ではなく、予測不能だが納得できる climax を作るための道具として扱われている。

結論として、記事は「良い game design は behavioral psychology と切り離せない」という立場を取る。プレイヤーが何を感じ、何を見落とし、どの action を自然に選ぶかを設計前半で扱わない限り、予算や production process だけでは支えられない。記事の強さは、Doom Eternal の付箋化、advance action の欠落、Us vs. It の tuning と deathmatch を通じて、感情目標、行動、ルール、数値が同じ北極星へ従属する様子を見せている点にある。

■ 内容分析
この記事は「MDA を使おう」「紙プロトタイプを作ろう」という一般論ではなく、設計者の頭の中で起きる逆算と、プレイヤーの初見行動で起きる順算のズレを観察する記事として読むと価値が高い。Doom Eternal の例では、設計者側は「強い」という感情から、レーン、敵 HP、攻撃範囲、回復、advance へ降りている。しかし新規プレイヤーは、その設計意図を読んでから遊ぶわけではない。目の前に安全に撃てる敵がいれば撃ち続ける。勝利条件が前進を要求していても、その action が UI・説明・圧力・報酬のどこかで十分に立ち上がっていなければ、設計者が想定した dynamics は発生しない。

ここで GFF の使い道が見える。MDA は「mechanics が dynamics を生み、aesthetic experience へ至る」という関係を見るには強いが、修正時には粒度が粗くなりやすい。GFF 的に見ると、advance 見落としは Goal の伝達不足か、Rules の理解しにくさか、Opposition の圧力不足か、Interaction の提示不足かに分解できる。つまり、感情目標から verbs を作る工程と、初見行動から欠けた要素を特定する工程は別であり、両方を短い playtest で往復させる必要がある。

午後の Us vs. It も同じ構造を持つ。damage 値や hit point の調整は、単に勝率を 50% に近づける作業ではない。狙っているのは、最後の 1 tank が瀬戸際で robot を止めるような緊張と納得感である。さらに custom robot を deathmatch させる展開は、単一シナリオで揃えたバランスが multiplayer の予測不能性へ変換される例になっている。数値は aesthetic goal に従属するが、数値が雑だと感情は発生しない。この二重性を記事はよく示している。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、実装前に「ジャンル名」「見た目」「参照ゲーム」から入りすぎると、何を感じさせたい試作なのかが曖昧なまま playable diff へ進むことがある。この資料から採るべき最小手順は、各プロトタイプの最初に `target_feeling`、`player_verbs`、`must_notice_actions`、`paper_or_headless_proxy`、`first_playtest_question` を置くこと。たとえば「焦るが理不尽ではない」「一手ごとに賭けている感じ」「操作が少ないのに判断が重い」などを先に固定し、その感情に寄与する verbs だけを残す。

実装後の確認も変えられる。今の headless test は到達率、死亡、詰まり、描画破綻を拾うには強いが、「新規プレイヤーが advance に相当する必須 action を自然に選ぶか」は拾いにくい。そこで Phase 0 / game directive の playable diff 記録に、初回観察用の `missed_action` 欄を追加する。Nao_u feedback や自己プレイで、勝利に必要なのに選ばれなかった action、説明を読んでも使われなかった rule、見た目から誤読された affordance を 1-3 件だけ記録する。数値バランスも、狙う climax を一文で書いてから HP、速度、spawn、cooldown を調整する。

■ メリット・デメリット
メリットは、短い試作の段階で、感情目標、player verbs、ルール欠陥、数値バランスを同じ観察サイクルに載せられること。特に紙プロトタイプ相当の低コスト検証は、実装後に大きく壊すより安い。デメリットは、記事が参加記録であり、定量評価や大規模タイトルへの一般化根拠は薄いこと。また、感情目標を先に固定しすぎると、偶然出た面白さや別ジャンルへの逸脱を捨てすぎる危険がある。

■ 判定
部分採用。MDA/GFF を恒久ルールとして増やすより、次の playable diff から `target_feeling -> verbs -> must_notice_actions -> first_playtest_miss` の小さな設計メモとして採用する。バランス調整は、勝率ではなく狙う climax を明文化して数値を触る。

■ URL
https://playerdriven.io/articles/gdc-2026-riot-games-stone-librande-on-game-design
