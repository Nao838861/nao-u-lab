■ 概要
GDC 2012 の Tyler Sigman / Big Sandwich Games による「Guerilla Prototyping: A Design Post-mortem of the Arcade Strategy Game HOARD」は、短い期間と少ないリソースの中で、どうやってゲームデザインの試行回数を増やしたかを扱う制作後記である。HOARD は、プレイヤーがドラゴンになり、村を焼き、馬車を襲い、宝を巣に持ち帰る arcade strategy game。講演の核は、「You are a dragon, collect as much treasure as you can in 10 minutes」という短い logline を、何度も違う忠実度で検証し直した過程にある。

最初の重要点は、HOARD がいきなりデジタルゲームとして成立したわけではないこと。2002年の boardgame prototype #1 は、dragon、hoard、village、caravan、maiden、knight、modular board など、後に残る素材を持っていた。しかし movement と attack が bland、replenishment の upkeep が重く、city seeding も崩れた。つまり「ドラゴンらしい要素」はあったが、遊びの中核が楽しくなかった。次の boardgame prototype #2 は mechanics としては solid になった一方、抽象化しすぎて「not dragon enough」と判断される。mechanic の整合性だけを追うと、作品が頼っている theme の力を失うという失敗である。

転機は 2009 年の GameMaker prototype。farms、towns、wagons、knights、princesses、thieves などの相互作用が入った時に、arcade と RTS の blend が成立し、チームが繰り返し遊びたがる状態になった。prototype の成功は「問題がなかった」ではなく、「証明すべきことを証明した」こと。boardgame は theme と mechanic のズレを露出し、GameMaker は core systems の fun curve を確認し、in-engine prototype は production へ移すための形を作った。

制作面で特に具体的なのは、既存ツールの使い倒しである。HOARD では、2D prototype に GameMaker を使い、専用 level editor を作る時間がないため MS Excel と VBA を level design tool として使った。これは倹約ではなく、iteration を増やすための pipeline 設計である。「guerrilla」は、制約下で feedback loop を短くするために、使える道具を設計問題へ直結させる態度に近い。

もう一つの柱は modular / parametric design。HOARD の core systems は自己完結した部品と interface に分けられ、add / cut、tweaking、emergent strategies を起こしやすい構造にされた。多くの setting は独立値ではなく ratio / multiplier として扱われる。目的は調整項目を増やすことではなく、独立した dial の数を減らし、関係性で考えられるようにすること。economy や princesses and knights は、town growth、wagons、castle size、ransom timer、knight rescue、treasure collection strategy tree を結び、単体 gimmick ではなく複数 system の分岐になる。

失敗側の学びも濃い。HOARD は camera cuts、GUI sophistication、multiplayer lobby、stat tracking など、最後の小さな polish が不足した。story mode がない代わりに maps、modes、achievements で value を詰めようとしたが、「多いが、最も効く部分には足りない」状態になった。casual と core の両方に届いた一方、core 向けには competitive multiplayer の統計や深さが足りず、casual 向けには長期的に支える co-op map が足りなかった。ドラゴンが hero なのに、avatar や result で identity を十分に育てられなかった点も反省されている。

■ 内容分析
この記事の価値は、「iteration が大事」という一般論ではなく、iteration を増やすために忠実度、道具、system boundary、decision structure を分解している点にある。boardgame #1 は theme は強いが core mechanic が弱い。#2 は mechanic は強いが theme を失った。この二つの失敗を経た上で、GameMaker prototype が「ドラゴンであること」と「arcade / strategy の相互作用」を同時に満たした。

Sigman の prototype 観は、見た目が粗いことを免罪符にしない。publisher に prototype を見せる話では、rough idea を伝えるには強いが、相手が proto art を final product として評価してしまう危険も指摘している。内部検証なら速さを優先できるが、外部評価に出す時は、何を見てほしいか、何を未確定として扱うかを明示しなければ誤判定が起きる。

modular / parametric design の分析も、ただのソフトウェア設計論ではない。HOARD では、system を分けることで開発都合がよくなるだけでなく、単純な部品の組み合わせから macro-level strategy が出るようにしている。thief、score multiplier、princess ransom、knights、town growth が絡むと、プレイヤーは「今すぐ宝を持ち帰るか」「score multiplier を育てるか」といった選択を作れる。ここでは modularity が制作速度と emergent play の両方に効いている。

一方で、講演は小チーム万能論ではない。nimble structure、clear decision hierarchy、minimum documentation / maximal discussion は短期には強いが、polish、audience support、identity 表現の不足は最後に残った。iteration を最大化する体制は core fun を見つけるには強いが、launch product としての支えを別に計画しないと負債が出る。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、この講演を「速く実装する」根拠ではなく、「何をどの忠実度で検証するか」を決める probe として使うのがよい。Phase 0 / game start で playable diff に入る前に、今回の変更を paper / table / text simulation / low-fi UI / in-engine のどれで確かめるべきかを1行で書く。HOARD の boardgame #1 / #2 のように、theme-fit と mechanic-fit を別々に落とせる小さな検証を置く。

Excel level tool の発想は、こちらでは CSV / JSON / small editor / debug panel の優先順位に置き換えられる。level、enemy wave、reward、cooldown、AI prompt variant などをコード直書きにせず、表形式で試せるようにすれば、LLM が生成した案も deterministic に比較しやすい。modular / parametric design は記憶システムにも効く。候補、raw、atom、staging、Slack post を独立した状態遷移にし、各値を relation として持てば、調整漏れが減る。

ただし、HOARD の失敗側も一緒に採用する必要がある。小さな playable diff を重ねる時ほど、polish と identity は後回しになりやすい。core loop が動いた時点で「hero / result 表現は何か」「どの層に深さを足すのか」を staging に残す。

■ メリット・デメリット
メリットは、制作制約を言い訳にせず、検証回数へ変換する具体策があること。paper / low-fi / Excel / modular systems は、実装前後の手戻りを安くし、mechanic と theme のズレを早く見つけられる。短い cycle で playable diff を積む運用と相性がよい。

デメリットは、低忠実度 prototype が最終体験の polish、player identity、audience support を見落としやすいこと。clear decision hierarchy は速い反面、評価軸が偏ると修正されにくい。外部に見せる prototype では、見るべき点を指定しないと roughness そのものが評価される。

■ 判定
部分採用。core fun を探す段階では採用するが、完成度評価の代替にはしない。次の playable diff では、prototype の忠実度、問い、theme-fit / mechanic-fit、polish / identity 項目を staging に残す。

■ URL
https://gdcvault.com/play/1015941/Guerilla-Prototyping-A-Design-Post
https://media.gdcvault.com/gdc2012/slides/Design%20Track/Sigman_Tyler_Guerrilla_Prototyping.pdf
