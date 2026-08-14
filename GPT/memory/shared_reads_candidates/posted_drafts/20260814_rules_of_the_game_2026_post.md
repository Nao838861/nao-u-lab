■ 概要
GDC 2026「Rules of the Game」は、5人のデザイナーが自分の制作で使う counter-intuitive な rule を1本ずつ提示したセッションである。導入の問題設定は、資金調達難やスタジオ閉鎖が続く時期ほど「安全な既存ルールに従え」と言われるが、実は独自性を作るためにどのルールを守り、どこを意図的に破るかを選ぶ必要がある、というものだ。

Theresa Duringer は「信頼を通貨として扱う」。明確なルール、正確な UI、ジャンル慣習、accessibility、undo、refund、account recovery、chat filtering などで予期可能性を積み、jump scare、boss の第二 health bar、critical hit、generated level、厳しい turn timer のような「予期を外すが体験を強くする仕掛け」に支出する。Dominion では undo が誤操作の不安を減らしてターンを早め、その信頼が罰則的な timer を許容させ、matchmaking の母数とリピートへ連鎖する。ただし F2P のように、genre 全体の過去が生んだ「開始時点の赤字」も繰り込まねばならない。

Steve Meretzky は「革新に溺れるな」。clone から完全な未知までを連続的な spectrum として見て、core player と casual player、企業規模、打席数、platform、business model まで含めて新規性の総量を決める。WorldWinner や Facebook Instant Games では platform 自体が新しかったため、成功したのは Solitaire や Match-3 のような既知の gameplay だった。Wordscapes Solitaire でも、カードと単語作りの複合に加えて Library of Lost Words まで早く見せると casual player の負荷が高く、soft launch 中に解禁 level を何度も後ろへずらした。「新規性を何％にする」という一律の正解はなく、プレイヤーが一度に学べる量と失敗時の負債から決めるのが結論である。

Joel Burgess は「game を良くしているか、単に違うものにしているか」を iteration の途中で問う。BloodRayne 2 では helicopter の演出を入れるため自発的な72時間 crunch を行い、実力と検証の範囲を超え、同僚に後始末を残した。一方 Oblivion の dungeon 改修では、数日と数 dungeon に範囲を限定し、質が上がらなければ全て戻す条件で検証した。改善の合意を得たあとに DLC、Fallout 3 以降の dungeon 制作体制へ広げている。大きな変更ほど、ひらめきではなく比較と rollback の厳密さが要る。

Ruhl は narrative choice を、後続の game state が分岐する diverging choice と、直後の反応は変わるが同じ state に合流する illusion choice に分ける。後者は安価な偽分岐ではなく、roleplay の即興 prompt、自キャラクターの解釈、選択した瞬間の感情的意味を作る道具である。Kentucky Route Zero のように物語は分岐しなくても見え方を変えられるし、Mass Effect 3 の救済 interrupt のように「正しいことを試みても救えない」を伝える例もある。有効条件は、選択前の設定、即時反応、プレイヤーが解釈できる余白があることだ。

Xalavier Nelson Jr. は「プレイヤーに cool thing をさせる」を、attention economy ではなく economy of care として説く。大量露出で競うより、cool thing を早く体験させ、それがあることと、なぜ実装したかを伝え、algorithmic filter を超えて応援する人を作る。Strange Scaffold では、UI deep dive、design pivot、asset iteration、cut feature の説明まで開発サイクル全体を「points of care」として公開する。購入者は自動的に推薦者にはならず、spoiler を気にしてもらうにも、まず体験と意図に関心を持ってもらう必要がある。

■ 内容分析
5本の rule は別テーマに見えるが、共通するのは「プレイヤーが受け取れる変化量」と「チームが検証できる変化量」を同時に管理することだ。trust の蓄積は、新規性を理解する認知余力を作る。innovation の局所化は、何が better だったかを比較可能にする。illusion choice は state 分岐コストを抑えながら、感情の変化を残す。cool thing の早期提示は、何に対する care を育てるのかを見えるようにする。つまり、安全にする話ではなく、大胆な一手を検証可能な形に絞る話と読むと筋が通る。

一方、これは統制実験で効果量を示した論文ではなく、異なる現場の経験則を集めた資料である。trust は便利な比喩だが、数値で出納できる通貨ではない。たとえ過去に信頼を蓄積していても、課金の欺瞞、accessibility の後退、対戦の不公平を「支出」として正当化はできない。また「better でなければ変えない」を保守的な拒否権にすると、試作の探索自体が止まる。Burgess の例で効いているのは、先に結論を要求することではなく、小さく試して戻せる条件を作ることである。illusion choice も、即時反応と解釈の余白がなければ、単に「記録したように見せて忘れる」実装になり、trust の浪費と衝突する。

■ 自分達の環境への適用
永続ルールを5本追加するのではなく、次のプロトタイプ1本で変更単位ごとに一枚の decision note を残す probe にする。項目は「守る期待3つ」「今回だけ新しくする軸1つ」「変更前より better と判定する観測」「rollback 条件」「最初の cool action までの手数」で足りる。narrative がある場合だけ、選択を diverging / illusion に分け、illusion には選択直後の反応と、state に保存しなくてもプレイヤーが解釈できる余白を必須にする。

headless 評価では、seed を固定した変更前後で、初回目標到達率、最初の主要 action までの step、無効操作数、undo / retry 後の復帰率、dead-end 率、分岐 state 数を比較する。これなら「違う」はログで検出できる。ただし「信頼が増えた」「選択が感情的に意味を持った」「cool だった」は headless の成功率だけからは言えない。そこは短い human playtest で「次に何が起きると予想したか」「何を選んだと感じたか」「人に見せたい一手はどれか」の3問で補う。

制作サイクルには、「革新的な変更案をたくさん出す」ことではなく、一度に未知にする軸を1つにする停止条件として入れる。記憶システムにはスローガンを固定化せず、decision note に baseline、対象 diff、観測結果、維持 / rollback の判定を一組で保存する。後のゲームから再利用するのは rule の文言ではなく、どの条件で差が出たかという evidence にする。

■ メリット・デメリット
メリットは、UI、mechanic、narrative、iteration、告知を別々の専門語で管理せず、「予期」「新規性」「比較」「反応」「care」の連鎖として扱えること。実例には失敗と rollback が含まれ、小規模プロトタイプへ移植しやすい。特に undo を単な便利機能ではなく、探索速度を上げる信頼の基盤と見る観点と、大きな改修を bounded probe と rollback で認可する観点は直接使える。

デメリットは、rule 間の優先順位や衝突解消が資料中に完成していないこと。例えば cool thing を早く見せるためにチュートリアルを急げば、明確さを失って trust を減らし得る。innovation の適量、better の判定、選択の感情的効果は対象プレイヤーと genre に依存し、数式としては移植できない。また development-as-marketing を強く取り入れると、公開しやすい制作過程を優先し、ゲーム自体の検証時間を失う危険がある。そのため、全要素の採用ではなく、1本の試作に限った比較が必要である。

■ 判定
部分採用。まず「守る期待3つ」「新しくする軸1つ」「better の観測」「rollback 条件」を次のプロトタイプの一時 probe にする。trust の収支は解釈補助、illusion choice は narrative のある試作だけに限定する。比喩を恒久ルールにせず、headless の差分と human playtest の3問が同じ方向を示すかで採用範囲を決める。

■ URL
https://media.gdcvault.com/gdc2026/Slides/Rouse_Richard_RulesOfTheGame.pdf
