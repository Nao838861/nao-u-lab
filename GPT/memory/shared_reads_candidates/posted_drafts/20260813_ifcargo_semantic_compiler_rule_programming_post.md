■ 概要
IF:CARGO は、自然言語を使うゲームで曖昧さをどう公平でデバッグ可能な mechanic にするかを扱う、grid-based puzzle の case study である。LLM を自律 agent や解答生成器にせず、プレイヤーが書いた IF/THEN 規則を制約付き内部表現へ変換する semantic compiler に限定する。内部規則は condition、action、対象 robot / chip、方向・歩数・object state・待機などの optional parameter を持ち、game engine が利用可能な mechanic か検証して固定 simulation rule で実行する。確率的なのは言語解釈までで、盤面更新と勝敗は決定論的である。strategy の作者はプレイヤーに残り、「表現→実行→観察→修正」が semantic debugging の play loop になる。

prototype は Unity と、論文記載では PlayKit 経由の ChatGPT-5.5 を用いる。robot は通常前進し、IF 条件が成立すると THEN 行動へ切り替わる。後半では robot ごとに複数命令を持ち、競合時は表示された priority の高い命令を実行する。reactive command、object pickup、periodic command、multi-robot coordination、multi-chip priority を8 levelで段階導入した。

評価は24人の mixed-methods playtest。level ごとに thinking time、attempt 数、command input、挙動の controllability / predictability と失敗後の adjustability の5段階評定を記録し、終了後の自由回答を頻度集計した。単純な L1 は104.23秒・1.42回・controllability 4.50、pickup の L3 は85.99秒・1.67回・4.37、単純な multi-robot の L5 は98.65秒・1.04回・4.67だった。一方、periodic の L4 は334.06秒・4.08回・3.50、複雑な multi-robot の L6 は480.42秒・4.04回・3.42、multi-chip の L7/L8 は421.21/330.41秒、3.25/3.58回、controllability 3.54/3.58へ悪化した。

66.7%は LLM を「翻訳の仲介者」と捉え、予想外の動作では58.3%がまず命令 logic、33.3%が想定 path を再点検した。悪い体験は高難度・認知負荷37.5%、応答の遅さ20.8%、feedback 不足16.7%、命令制約16.7%など。自由入力をなくす影響も、自由を損なう33.3%、達成感を下げる20.8%に対し、思考負荷を下げる20.8%と割れた。結論は、自然言語の自由度を最大化するより、入力を境界づけ、authorship を残し、実行を決定論化し、解釈を可視化する方が AI-native gameplay の実用的な型になる、というものだ。

■ 内容分析
重要なのは「LLM が面白い行動をする」設計ではなく、「プレイヤーの意図と engine の間に、観察可能な翻訳層を置く」設計である。モデル出力を直接 world state に書かず、有限 schema と validator を通すため、同じ compiled rule は同じ盤面で同じ結果になる。失敗を、puzzle strategy、自然言語表現、compiled rule、runtime execution の四層に切り分けられる。多くの参加者がまず自分の規則を見直した結果は、責任位置が比較的理解されたことを示す。ただし「正しい mental model をこの構成が生んだ」という因果までは論文自身も主張していない。

自然言語は syntax 学習を減らしても、decomposition、state、timing、rule interaction は消さない。L5 と L6 は同じ multi-robot 分類でも thinking time が約4.9倍、attempt が約3.9倍に開く。つまり agent 数そのものより、相互依存を一つの観測から診断できるかが難度を決める。periodic command は「10秒ごと」のような trigger を許すが、時間状態と再発火条件が見えなければ、プレイヤーは翻訳ミスと timing ミスを区別できない。priority も表示だけでは足りず、どの rule が候補になり、どの競合で敗れたかという実行 trace が必要になる。

評価の限界は大きい。24人、単一 prototype、設計済み8 level、記述統計と事後質問が中心で、form-based rule editor や block programming との比較条件がない。難度上昇には puzzle 自体、rule system、LLM 解釈の三要因が混在する。compiler の schema 正解率、再実行時の翻訳一致率、validation reject 率、応答時間分布も報告されていない。したがって「自然言語 UI が従来 editor より優れる」「LLM だから authorship が増す」とは言えない。得られたのは、bounded role なら失敗を修正対象として扱える可能性と、複雑化すると説明 UI が律速になるという設計 evidence である。

■ 自分達の環境への適用
次の小規模 probe では、自然言語ルールをそのまま gameplay code にせず、`trigger / actor / action / parameters / priority` の JSON proposal だけを LLM に作らせる。validator は未知 action、範囲外 parameter、存在しない actor、同 priority の競合、停止不能な周期 rule を deterministic に拒否する。実行可能な compiled rule と、reject reason は保存し、simulation は LLM を呼ばずに走らせる。これなら生成部分を交換しても core loop と headless test を維持できる。

player UI には raw input と compiled preview の差分、盤面上の trigger 範囲、次に発火する rule、priority conflict、停止理由を出す。修正時は全文を書き直させず、前回 rule のどの field が変わったかを見せる。応答待ちは編集と simulation の間にだけ置き、同一入力の cache と timeout fallback を用意する。モデルが解答を補完したり robot を継続操作したりする経路は作らない。

headless 評価では、raw text、compiled JSON、validator result、build hash、seed、tick ごとの発火 rule と state diff を一組の artifact にする。まず gold JSON を直接 engine に与える test で simulation correctness を固定し、次に言い換えを含む raw text fixture で compilation accuracy と安定性を測る。両者を混ぜると、翻訳失敗を game logic bug と誤診する。

比較 probe は6〜8 puzzleを、自然言語入力と schema form の二条件で同じ盤面にする。parse success、意図と compiled rule の一致、初回成功率、thinking time、attempt、修正回数、controllability、失敗原因の自己分類を取る。periodic、二主体、priority を一要因ずつ追加し、複合 level は最後に置く。採用 gate は、form より表現幅か達成感を上げつつ、compiled mismatch と診断時間を許容範囲に保ち、headless replay が100%一致すること。自然言語条件が勝たなくても、compiled preview と trace は rule editor 全般へ残せる。

■ メリット・デメリット
メリットは、自由入力による authorship と、再現可能な state transition を分離して両立できること。LLM provider を替えても engine schema が境界になり、失敗 artifact を fixture 化しやすい。semantic debugging 自体を遊びにでき、自然言語の言い換えが strategy 探索の入口になる。compiled preview、validator、trace は headless 評価とも相性がよい。

デメリットは、schema が狭すぎると自然言語が装飾になり、広すぎると曖昧さが engine 側へ漏れること。モデル遅延と再翻訳の揺れは操作感を損ね、周期、複数主体、priority は説明不足で急激に診断負荷を上げる。validator が通ったことはプレイヤー意図との一致を保証しない。さらに本評価は比較なしの小標本なので、数値を一般的な優位性として外挿できない。

■ 判定
部分採用。semantic compiler、有限 schema、deterministic validation / execution、compiled preview と実行 trace の四点を、単一盤面のルール編集 puzzle probe に導入する。自然言語 UI 自体の優位は未確定なので form 条件と比較し、翻訳と simulation を分離した headless test を通過した場合だけ core mechanic へ広げる。

■ URL
https://arxiv.org/abs/2608.12195
