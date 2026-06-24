■ 概要
「This Game SUX: Why & How to Design Sh@*!y User Experiences」は、ゲームの UX を「分かりやすく、自然で、失敗しにくくする」だけでは捉えきれない体験領域を、SUX = Shitty User Experience として理論化する CHI 2025 論文である。出発点は、HCI とゲームデザインで共有されてきた normative UX への違和感にある。著者らはそこから外れ、操作や feedback を意図的に壊し、プレイヤーを失敗へ押し出すことで、失敗そのものを中心にした意味ある体験が成立すると置く。

論文は SUX を、control と feedback の面で normative UX を意図的に破り、表向きの目標達成を難しくしながら、実際には failure を経験すること自体を中心に置くゲーム体験として定義する。単なるバグ、低品質、雑な実装ではない。Stray の一時的な反転操作、Octodad や QWOP 系の fumblecore、Getting Over It の大きな後退、I Am Bread や Gang Beasts の予測不能な物理的失敗などが、失敗を品質不足ではなく aesthetic の発生源として扱う例になる。

手法は、31 本以上のゲームを対象にした reflexive thematic analysis である。著者らは、ゲーム研究・HCI・ゲーム開発経験を持つチームの positionality を明示したうえで、SUX を既存の MDA framework に重ねる。MDA は、作者側の Mechanics、プレイ中に生じる Dynamics、プレイヤー側の Aesthetics を分けて見る枠組みである。Mechanics では、入力と結果の対応をずらす mismapped controls、入力への反応を過剰化する exaggerated responses、身体部位や個別動作を細かく直接操作させる overly concrete controls が挙げられる。Dynamics では、それらが loss of control、fast failure、minor failure を生む。プレイヤーは操作不能になる、すぐ失敗する、または小さな失敗を連続的に踏む。

重要なのは、その dynamics が不快なだけで終わらないことだ。論文は SUX の aesthetics を、成功側と失敗側の両方に分けて整理する。成功側には、何度も破綻しながら抜けた時の hard-earned satisfaction、扱いにくいアバターに親しみが出る character bonding、ぎこちない共同操作から生まれる great collaboration がある。失敗側には、身体と物理が変な見世物になる joy in absurdity、予期しない事態が刺さる shock value、「やられたからこそやり返す」spite がある。結論として、SUX は「良い UX の逆」ではなく、normative UX を意図的に破ることで、失敗・混乱・不自由さを遊びの中心素材にする設計語彙である。

■ 内容分析
この論文の価値は、「悪い操作感を肯定する」ことではなく、悪さを mechanics / dynamics / aesthetics に分解している点にある。制作現場では、操作しにくい、読みにくい、理不尽、テンポが悪い、という feedback は即座に修正対象になりやすい。それ自体は正しい。しかしその判断だけだと、Getting Over It の落下や QWOP の手足のばらばらさのような、失敗を体験の主役にする設計を「欠陥」としか読めなくなる。論文はここに taxonomy を置き、「何を壊し、どの失敗 dynamics を生み、どの aesthetic に接続するのか」と問えるようにしている。

特に使えるのは、SUX を全体ジャンルではなく局所的な design element として扱っている点である。論文は SUX game と normative game を二分しない。normative に作られたゲームにも SUX mechanics は入りうるし、SUX game の中にも快適なプレイ部分はある。これにより、「この 20 秒だけ入力を裏切る」「この敵だけ feedback を遅らせる」「この協力操作だけ bodily coordination を要求する」といった粒度で設計できる。逆に言えば、目的 aesthetic を決めずに導入した SUX は、ただの雑さとして届く。

限界もある。これは解釈主義的な分析であり、定量評価やプレイヤー分布の検証ではない。また、accessibility や player safety の観点では、normative UX を壊すことが常に望ましいわけではない。操作の不自由さは、あるプレイヤーには playful な制約でも、別のプレイヤーには排除になる。SUX は「どの規範を、誰に対して、どれくらい、どの出口つきで壊すか」を要求する設計判断として読むべきである。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、失敗を単に潰す対象と見るのではなく、分類する基準として使える。たとえばアクション試作で「弾が読みにくい」「避けにくい」「入力が重い」と出た時、すぐ修正する前に、それが unintended defect なのか、SUX mechanics として意味を持つ候補なのかを分ける。候補なら、どの aesthetic を狙うかを先に書く。hard-earned satisfaction なら次の読み筋、joy in absurdity なら笑える spectacle、spite なら再挑戦導線と短い復帰が必要になる。

具体的には、playtest / headless 評価ログに `sux_intent`、`broken_norm`、`failure_dynamic`、`target_aesthetic`、`recovery_path` を足すとよい。失敗回数やクリア率だけでなく、「この失敗は作者が狙ったものか」「次回に使える情報を得たか」「復帰までが長すぎないか」を残す。Phase 3b/4a では、既存 prototype の失敗ログをこの MDA 分類で 1 件だけ棚卸しし、修正対象と保持対象を分ける probe にできる。

■ メリット・デメリット
メリットは、欠点レビューが単なるバグ潰しで終わらず、失敗を playable な設計素材として扱えること。小規模 prototype では、粗さの中にある面白さを早く捨てすぎる事故を防げる。デメリットは、SUX という語彙を使うと雑な実装を正当化しやすいこと。狙う aesthetic、復帰導線、プレイヤー負荷を明示しない SUX は、ただの不親切になる。

■ 判定
部分採用。ゲーム全体の方針ではなく、失敗レビューと prototype 評価の分類軸として採用する。操作しにくさや読みにくさを残す場合は、target aesthetic と recovery path を併記する。

■ URL
https://exertiongameslab.org/wp-content/uploads/2025/04/sux_chi2025.pdf
https://doi.org/10.1145/3706598.3713246
