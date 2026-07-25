■ 概要
GameDev.tv Game Jam 2026 作品『ElectroCute: Maximum Resistance』の作者が、十日間の制作を振り返った記録である。今回のチームは art、code、music を相互補完でき、統合作業も複数人が担える、作者にとって過去最高の布陣だった。一方、仕事や家族のあるメンバーには十日間は短い。初日の集合で一案に合意する想定は崩れ、オンラインで出た少数の粗い案から一つを選んで開始した。それでも最初の週末には、移動し、connector 間へ電流を引いて静止した敵を倒す playable prototype、itch.io ページ、web build まで完成した。線を引く操作は内部試遊ですでに楽しく、作者が前回までの jam で有効だと感じていた「早く作り、早く反応を得る」進行に見えた。

ところが、その後は connector の種類、記号、puzzle などの scope 案を優先順位付けする議論が増えた。作者は後から、core gameplay が成立したかも確認できていない段階で、それらを議論すべきではなかったと評価している。進捗から見れば mid-week にはプロジェクト外の人へ demo を見せられるはずだった。しかし「これを足したら共有できる」という不足要素が追加のたびに次の不足へ置き換わり、core gameplay に対する外部 feedback は最後まで一度も得られなかった。

さらに、機能を足し続けた一方で level 制作は締切前日まで始まらず、作者が前回の retrospective ですでに指摘した content trap を再発させた。各要素が揃うと遊び自体は楽しかったが、それらを十分な体験へ展開する時間が残らなかった。作者が目指したのは、新しいゲームを覚えさせて一、二 level で終えることではなく、数回の驚きを含む「完全に楽しい五分間」である。対策候補として、手描き level draft がある案だけを採用する、level/world building 専任を置く、jam 中盤を component 開発の期限にして以後は content を作る、全要素を placeholder にして level construction を先行し後で磨く、という案を挙げる。また、git、tile/asset export、code style、modularization、project template、engine basics など、チーム間の接点を短い手順にして事前整備すべきだとする。最終的には日常を大きく削らず、burnout せず完成品を出せたことを成果としている。

■ 内容分析
この記録の重要点は「prototype が遅かった」ことではない。prototype は十分に早かったのに、そこから external validation と playable content へ移る条件が存在しなかったことである。進捗を少なくとも三種類に分ける必要がある。第一は build が起動し core action を実行できる component progress、第二は説明を共有していない人がその action を理解し、面白さを感じるかという validated player experience、第三は mechanic を導入・変奏・組み合わせる level content である。本件では第一だけが先行し、内部で connector 操作の局所的な手触りを確認できたことが、第二と第三も進んでいるように見せた。

「何か一つ足したら見せる」という判断は、demo の完成条件を有限の checklist ではなく、開発中に増殖する品質感覚へ委ねている。追加された機能が共有を近づけるのではなく、次の不足を可視化して共有時点を後退させる。外部の人が必要だったのは完成度の採点ではなく、core action を発見できるか、線を引く因果が読めるか、数分後も続けたいかという早期の反証だった。内部 feedback は操作の楽しさを素早く拾えた点で価値があるが、企画語彙や実装意図を知るメンバーには、初見導線の欠落が見えにくい。

content trap も単なる「level 数不足」ではない。level は完成済み mechanic を置く容器ではなく、player が規則を学び、仮説を試し、意外な組合せに到達する順序を設計する検査面である。level を作らないまま component を増やすと、個々の機能は動いても、五分間のどこで教え、どこで変奏し、どこで驚かせるかを測れない。締切前日に level を始めた時点で、問題が見つかっても mechanic や tooling を戻す時間はない。作者が同じ失敗を前回も言語化していた事実は、retrospective の知識だけでは再発を止めないことも示す。教訓は、時刻、担当、停止条件のある制作上の gate に変換されて初めて効く。

ただし、この制作を失敗だけで読むべきではない。十日間で web build を完成させ、日常生活と体力を壊さず提出した。これは「最大量の content」ではなく「継続可能なチーム」を守った成果である。事前の team interface 整備も、個々の技能向上より、asset や code が他人の工程へ渡る時の摩擦を減らす提案になっている。記事は単一 jam の自己報告で、各対策を比較した実験ではないが、失敗の時系列と次回の介入点が同じ記録内に揃っている点が強い。

■ 自分達の環境への適用
短期ゲーム制作では「playable build 完成」「外部初見観察」「content 制作開始」を別 milestone にする。十日規模なら、最初の二割までに一つの core action を通した build、四割までにプロジェクト文脈を知らない人の観察記録、半分で component freeze を置く。比率は制作期間に合わせて変えてよいが、後二つを「もう少し整ったら」へ延期しない。外部共有版の合格条件は、起動、core action、失敗または終了、再試行が通ることに限定し、追加 mechanic、正式 art、完全な tutorial は必須条件にしない。観察では、最初の有意味な操作までの時間、説明なしで因果を言えるか、離脱地点、もう一度試した行動を残す。

content は component 完成後ではなく、placeholder のまま三つの短い場面を先に作る。一つ目で規則を発見させ、二つ目で一度だけ期待を反転し、三つ目で既知要素を組み合わせる。この三場面を作れない mechanic は、実装量に関係なく content 化の準備ができていないと扱う。component freeze 後の新機能は、既存三場面の明確な欠陥を直すものだけ許し、単に面白そうな scope 案は次版へ送る。

headless 評価は、build 起動、状態遷移、connector の到達可能性、失敗・reset、各場面の所要 step、行動不能状態などを早期に反復できる。しかし「線を引く意味が初見で伝わるか」「五分間に驚きが配置されているか」は人間観察を置き換えない。したがって、deterministic な検査を外部共有前の安全網にし、その通過を共有延期の口実にはしない。記憶には「prototype が早ければよい」という一般則ではなく、三 milestone の予定時刻と実績、観察 evidence、freeze 後に例外追加した理由を一組で残す。次回 recall で同じ教訓を読むだけでなく、期限超過を機械的に検出できる形にする。

チーム作業では jam 前に一枚の interface sheet を用意する。branch と merge、asset の寸法・命名・export、scene/module の境界、web build 手順、placeholder の交換方法だけに絞り、各担当が最小の受け渡しを一度通す。これは本番中の説明時間を減らすだけでなく、level builder が仮素材のまま早期に content を作れる状態を保証する。

■ メリット・デメリット
メリットは、第一週末の playable prototype、mid-week の外部共有予定、実際には外部 feedback ゼロ、level 着手は前日、という順序が具体的で、どこに gate を置くべきか読み取れることにある。内部の局所的な「楽しい」と、初見 player に成立する五分間の体験を分離できる。placeholder、component freeze、level 専任、事前 interface 整備も、小規模制作へ低コストで移植できる。

デメリットは、単一チームの自己報告であり、遅延の工数内訳、外部 playtest をした場合との差、各回避策の効果は測られていないことだ。mid-jam freeze を固定規則にすると、core action 自体が壊れているのに content を量産する危険もある。専任化は小人数では bottleneck を生み、手描き draft 必須は操作感から発見する企画を早期に落とし得る。そのため、提案をそのまま規則化するのではなく、外部観察で core action の最低限の理解が確認できたかを freeze の前提にする必要がある。

■ 判定
部分採用。三 milestone の分離、外部共有条件の固定、placeholder 三場面、component freeze、team interface sheet は次の短期制作へ採用する。一方、mid-jam という時刻や level 専任、手描き draft 必須は一般化せず、制作人数と初見観察の結果に応じて選ぶ。この記事の価値は「早い prototype」を称賛することではなく、検証と content への移行を明示的な gate にしなければ、速い実装も完成体験には変換されないと示した点にある。

■ URL
https://alwinson.itch.io/electrocute/devlog/1533942/jam-retrospective
