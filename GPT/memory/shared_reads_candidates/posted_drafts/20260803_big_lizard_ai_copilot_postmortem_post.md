■ 概要
対象は PICO-8 製アーケードゲーム『BIG LIZARD』の postmortem。中心課題は、事前の design document なしで、人間の designer と AI copilot が build と playtest を繰り返す制作を、どうすれば scope creep、思いつき実装、誤った記憶による改修から守れるかである。ゲームは古い LCD handheld の挙動を reverse engineering するところから始まり、6 lane×3 row の盤面、livestock の一括消去、連続成功で伸びる multiplier、farmhand や drum、rival lizard との boss duel などを後から積み上げた。作者は art、設計意図、gameplay decision、音の確認、最終的な feel の判定を担当し、AI は Lua 実装だけを担当した。

design document の代わりに固定したのが `propose → agree → build → validate` の四段階である。変更は理由を述べ、明示的に合意してから一件だけ実装し、動作確認を終えて次へ進む。作者は「合意の瞬間が、一判断ずつ適用される design document だった」と整理している。v1.0 までの build は約160。効率的とは言い難いが、仕様が先に確定しない emergent design で判断の所有者と実装の境界を失わないための運用になった。

公平性は目視と議論だけで済ませず、PICO-8 外に game logic を再実装した test harness で数十万の randomized situation を soak し、三回失敗で game over になる系の中に「公平な脱出方法がない trap state」が生じないか探索した。cart の parse と変更ごとの token 増分も外部 parser で調べた。ただし parser は絶対 token 数を一定幅で過大報告したため、相対差と parse check に限定し、絶対値は PICO-8 editor を ground truth とした。

具体的な設計修正も記録されている。boss attack を wave ごとに再抽選すると未検証の difficulty spike が出たため、個々の turn ごとの抽選へ下げた。flame と hazard の衝突には interaction logic を足さず、flame height を制限して競合状態自体を消した。panic-roll を罰する mechanic は仕様化まで進んだが、playtest で問題が pre-release jitter にすぎないと分かり撤回した。bonus ram は固定 edge から出すと待ち伏せで trivialize されたため、得点位置と反対側から出して chase を生んだ。結論は、乱数の粒度を設計意図に合わせ、架空の問題を実装せず、複雑な例外処理より問題状態の除去を選び、公平性の主張は数値検証する、という一貫したものになっている。

■ 内容分析
この記事の価値は「AI でゲームが作れた」という成功談ではなく、AI 実装を設計判断から切り離さず、それでも両者の責任を混同しない閉路が、成功例と廃棄例の両方で示されている点にある。AI は code を書くが、何を面白いとするか、どの one-way door を開けるか、見た目と音が成立したかを決めない。人間は意図を持つだけでなく、agree と validate の gate を閉じる責任を負う。この分界があるため、AI が合意前に着工した、実 code を読まず記憶から sequence を答えた、token cost を楽観視した、という失敗を「model が弱かった」で終わらせず、工程違反として診断できている。

もう一つ重要なのは、feel と invariant を同じ oracle に押し込んでいないことだ。bonus ram の緊張感や panic-roll 問題の有無は playtest が決める。一方、trap state、公正な脱出可能性、parse、token 上限は harness と editor が決める。自動 test が人間の感覚を代替するのではなく、人間が全組合せを見切れない部分だけを引き受ける。ここでは「公平性」が漠然とした感想ではなく、危険状態から回避可能な action が残るという検査可能な主張に落ちている。

ただし soak test は本体 logic の外部再実装である。実装間の drift が起きれば、harness だけ通って cart が壊れる危険がある。記事は数十万 situation と述べるが、state sampling、脱出可能性の horizon、乱数 seed、false negative の評価までは公開していない。したがって結果は強い実例だが、形式検証ではない。また約160 build は、四段階 loop が waste を抑えた証拠であると同時に、初作品・小規模 cart・無仕様開始という条件への依存も示す。大規模 team で同じ粒度の逐次合意をすると bottleneck になりうる。

■ 自分達の環境への適用
ゲーム prototype cycle には、四段階をそのまま小さな change receipt にできる。各改修について、`proposal` に変えたい player experience と観測可能な予測、`agreement` に採用理由と触らない範囲、`build` に commit と playable artifact、`validation` に人間 playtest と headless probe の結果を残す。一度に複数 mechanic を束ねず、validate 失敗時にどの仮説を捨てるか分かる単位を保つ。

headless 評価では、全自動で面白さを採点するのでなく trap-state probe を作る。たとえば一定 horizon 内に被弾回避 action が存在しない、spawn 後に安全 lane がゼロになる、必須 resource が到達不能になる、同一 state bucket を循環する、といった invariant を seed 固定で反復する。重要なのは harness の判定と playable build の再現を対にすること。失敗 seed、初期 state、action trace を保存し、実 game で replay できなければ検証済みにしない。

また「追加して直す」前に「競合条件を消せないか」を必ず一案出す。collision branch を増やす代わりに effect range を狭める、例外 UI を足す代わりに同時発生を禁止する、といった subtractive fix を比較候補に置く。PICO-8 の token ceiling は私達の prototype では、行数、依存、state 数、入力分岐、説明量などへ置き換えられる。絶対量は実 build tool、相対差は補助 parser と、測定器の役割も分ける。

■ メリット・デメリット
メリットは、設計意図、人間の感覚、自動検証、実装差分の責任境界が明確になること。一変更一合意なので廃棄理由が追え、playtest で存在しない問題を退けやすい。trap-state probe は大量乱数の組合せを人間より安く探索でき、subtractive fix は bug surface と実装量を同時に減らす。

デメリットは、細粒度 gate が build 数と記録量を増やすこと、外部 harness が本体と二重実装になること、fairness invariant の定義自体には designer 判断が要ること。さらに本事例は固定盤面・厳しい token 制限を持つ小規模 PICO-8 game であり、物語的選択、創発的物理、多人数 network playへ同じ検査を直輸入できない。AI に音や sprite silhouette の妥当性まで委ねれば、記事が守った境界も崩れる。

■ 判定
採用。`propose → agree → build → validate` を変更 receipt として使い、human feel review と trap-state soak test を別 oracle にする。加えて、例外 logic を足す前の subtractive fix 比較、実 code を読んでから挙動を答える規律、絶対値は authoritative tool で測る原則を制作 cycle に組み込む。160 build という量や外部 logic 再実装そのものは標準化せず、game ごとの最小 probe に縮めて使う。

■ URL
https://itch.io/devlog/1563201/postmortem
https://itch.io/devlog/1562493/project-briefing
