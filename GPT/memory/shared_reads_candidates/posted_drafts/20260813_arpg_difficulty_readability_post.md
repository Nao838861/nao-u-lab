■ 概要
「Designing for Difficulty: Readability in ARPGs」は、『Death’s Gambit』のデザイナー Alex Kubodera が、難しい action RPG の戦闘を「死にやすくする変数の追加」ではなく、挑戦が公平だと感じられる情報設計から整理した実務記事である。中心命題は、readability を保ったまま難しくすること。readability は攻撃前に何が起こるかを知らせる telegraphing と、合図から予想した結果が実際に一貫して起こる expectations に分かれる。大きな身振り、色、台詞、音が十分でも、同じ姿勢が突きと薙ぎ払いを気まぐれに意味するなら読めない。逆に合図が短くても、視覚言語と結果が安定し、対処法を学べるなら高難度は成立する。

著者は boss の全行動を moveset、反復する振る舞いを pattern と区別する。初見の pattern は情報の塊であり、反復に気付くまでは noise に見える。プレイヤーは予告、結果、対処法のまとまりを繰り返し処理し、やがて chunking によって意識的解析から筋肉記憶へ移す。すると認知資源が空き、新しい pattern や phase 変化を読める。難易度設計の核心は、退屈する前かつ諦める前に、pattern を chunk 化できる時間と情報を渡すことになる。

具体例として『Elden Ring』の大技や phase 台詞は pattern の開始を予告し、巨大な hammer は距離を取るべきだという期待を作る。『Sekiro』の「危」表示は複雑な剣戟の中で注意を向ける補助輪だが、その後の敵姿勢が突き、掴み、薙ぎ払いのどれかを一貫して示すため、記号だけに正解を任せていない。見た目の危険度と damage も対応させる。小さな接触で即死し、地形をえぐる隕石が軽傷なら、数値上の難しさ以前に期待が壊れる。

難化するときは telegraph を隠すのではなく、学習済み pattern の連結、timing 変更、反撃可能時間 Window of Opportunity の短縮、射程・属性・範囲の modifier、速度上昇、既知の敵の組合せ、同一 moveset の複製、timer、resource management を使う。ただし複数敵は先に単体で学ばせ、速度上昇は元 pattern を chunk 化する時間を渡した後に行う。反撃まで長く待たせるなら、得られる Window of Opportunity も比例させる。結論は、readability は情報であり、対象 audience がその情報を登録し、利用可能な選択肢を推測できるよう、視覚言語を早期に教え、一貫して守ることが公平な高難度の条件だ、というものだ。

■ 内容分析
この記事の強さは、「予告を大きくする」と「予告の意味を守る」を分離した点にある。理不尽さの診断で前者だけを見ると、派手な warning を追加しても失敗は減らない。受け手が必要なのは危険の存在だけでなく、回避、guard、jump、counter、距離確保のどれが有効かという action mapping である。telegraphing は検出可能性、expectations は意味の安定性を担い、この二つが揃って初めて pattern 学習が成立する。

さらに chunking を置くことで、単発反応速度と長期学習を区別できる。初見で避けられない攻撃が直ちに不公平とは限らない。再挑戦時に「何を見落としたか」「次に何を試すか」が分かり、試した対処が安定して機能すれば学習型の難しさになる。反対に、毎回 timing や hitbox が理由なく変わる、camera 外から攻撃される、強い表現と damage が一致しない場合は、反復しても chunk が形成されない。難易度ではなく学習ノイズである。

難化レバーの列挙にも順序の原則がある。pattern そのものを読めなくする前に、既習 pattern の関係を難しくする。phase 後の連結や timing ずらしは記憶更新を要求し、partner は二つの注意対象を競合させ、clone は同じ pattern の発生源だけを増やす。timer は熟考時間を圧縮し、resource drain は戦闘中の別目標を追加する。これらは同じ「難しくなった」でも負荷の種類が違うため、失敗原因を分けて調整できる。

ただし証拠強度には限界がある。記事は『Death’s Gambit』開発者の経験に基づく commentary で、参加者数、completion rate、死亡原因分布、frustration 尺度を比較した研究ではない。chunking の説明は説得的だが、個々の例の因果を実験で証明してはいない。controls と hitbox が tight であることを前提にしており、入力遅延、camera、画面密度、色覚差、聴覚差、motion の見え方、再挑戦コストなど戦闘外の frustration は別に扱う必要がある。また audience ごとに退屈と断念の閾値が違うため、万能な予告時間は導けない。

■ 自分達の環境への適用
action / shooting prototype の各危険行動に `telegraph_start / impact_time / cue_channels / expected_counter / actual_outcome / damage_salience / punish_window / introduction_order` を持たせる。headless では、予告から命中までの時間、攻撃ごとの counter 成功率、同じ cue に複数 outcome が割り当てられていないか、反撃窓の長さ、camera 内出現率、攻撃単体と組合せ時の死亡率を deterministic に計測する。これにより「難しい」を、予告検出失敗、意味の誤学習、入力猶予不足、実行失敗、反撃窓不足、複数 pattern の注意競合へ分解できる。

小さな probe は一体の敵と三攻撃で十分である。突き、掴み、薙ぎ払いに異なる姿勢と音を与え、単体導入を各 10 回、その後に timing variation と二体同時を出す。ログには初見成功率だけでなく、試行ごとの改善曲線、誤った counter の種類、認識後の入力開始時刻を残す。五回程度で counter 選択が安定するのに execution だけ失敗するなら readability は機能している。選択が収束しないなら cue と expectation の対応を直す。単体で学習が成立せず二体化するのは難化ではなく欠陥の増幅と判断する。

人間 review では、死亡直後に自由記述の感想だけを求めず、「何が来ると分かったか」「どの対処が正しいと思ったか」「入力したが間に合わなかったか」「反撃機会を認識できたか」を分けて聞く。録画の frame と event log を照合し、本人の認識と実際の cue を接続する。visual cue を弱めた条件、audio cue を切った条件、damage 数値だけを変えた条件も比較すれば、どの channel が学習を支えているか分かる。

制作サイクルでは、まず一つの pattern を teach、次に同じ意味を enforce、最後に recombine する三段階を gate にする。Phase 1 で固有 cue、Phase 2 で同 cue・同 counter の変種、Phase 3 で timing、partner、resource pressure を加える。死亡率目標だけで速度や数を上げず、学習曲線が成立した証拠の後に難化する。記憶へは「予告は長く」のような一般則でなく、対象 audience、cue、counter、学習までの試行数、失敗分類、再挑戦コストを一組で残す。

■ メリット・デメリット
メリットは、難易度と不公平感を分離し、可読性を削らずに負荷を上げる具体的なレバーが揃うこと。telegraph と expectation の二分、pattern の導入順、Window of Opportunity は実装変数へ落としやすく、headless log と人間の認識報告を接続できる。既習 pattern の再結合を使えば、追加 asset を大量に作らず奥行きを増やせる。

デメリットは、経験則を数式や固定閾値として扱えないこと。cue を強くしすぎれば画面が記号だらけになり、発見や驚きを失う。すべてを一対一対応にすると feint、曖昧さ、未知との遭遇を使う設計まで排除する危険がある。複数敵、timer、resource drain は認知・時間・経済の負荷を同時に変えるため、死亡率だけでは原因を判定できない。高難度 audience の熟達者に合う学習速度が初心者には成立しないので、対象層別の playtest が必須である。

■ 判定
採用。固定ルールとして「予告を長くする」のではなく、telegraph 検出、expectation の一貫性、counter 実行、反撃窓、pattern 導入順を別々に記録する評価枠として採用する。最初の適用は三攻撃の小型敵で学習曲線を測り、単体 pattern の理解を確認してから timing variation と複数敵へ進める。

■ URL
https://www.gamedeveloper.com/game-platforms/designing-for-difficulty-readability-in-arpgs
