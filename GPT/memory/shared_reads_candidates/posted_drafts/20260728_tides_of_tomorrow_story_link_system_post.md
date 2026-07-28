■ 概要
DigixArt の『Tides of Tomorrow』は、multiplayer を同時協力や競争に使わず、別プレイヤーが先に生きた痕跡を自分の物語へ混ぜる非同期 narrative system「Story-Link」を中核に置く。発想の起点は『Road 96』で、前 run の人物が隠した金を次 run の人物が拾う仕組みを「別の player 同士だったら」と拡張したもの。『Dark Souls』の ghost、『Death Stranding』の world への間接作用を参照し、NPC が前の player を実在した登場人物として語り、dialogue、world state、encounter、level の見え方を変えるところまで authored story と結び付けた。

全 player は誰かを追い、同時に後続の誰かから追われる無限 chain に入る。ただし narrative が参照する範囲は直前と直後、つまり N-1 / N+1 に限定する。各 level は state machine として構成され、当初は level 全体を三状態に分けようとしたが、全体差分の制作量が大きすぎた。最終形では global state と、NPC や gameplay element ごとの local state を組み合わせ、状態の影響範囲も per-level に閉じて分岐爆発を抑えた。follow 対象は level 間で切り替えられ、過去 player の行動が状況を大きく変えても、現在 player は自分の destination を選べる。

過去の具体的な動きを見る “Tides of Time” は multiplayer replication に近い。configurable な時間窓について interaction、emote、movement、skin、posture、vehicle、velocity、timestamp、position を記録し、checkpoint または level 終了時に save data を server へ送る。ただし player が10分停止するような無意味な記録をそのまま送れば、視聴体験も容量も破綻する。そのため不要区間を trim し、area ごとの emote 数を制限し、data size を最適化した。level design では A 版と B 版を試作してから state 間の接続を増やし、三状態の ABC flowchart で反復を避ける。choice は現在の player に即時の意味を与えつつ、未来の player にも痕跡を残す。結論は、非同期の他者性は大量の完全分岐ではなく、参照範囲、状態の局所性、記録帯域、現在の agency を厳しく制約することで成立する、というものだ。

■ 内容分析
Story-Link の核心は、「他者の play を保存する」ことより「何を捨てれば他者の存在だけを残せるか」にある。無限 chain をそのまま因果 graph にすれば、古い選択の伝播、矛盾、content 組合せが増え続ける。N-1 / N+1 への限定は社会的な連続性を保ちながら、narrative の責任範囲を定数にする cut である。per-level の state も同じで、世界全体の真実ではなく、その場で authored content が意味を持つ範囲だけを変える。global state で scene の大枠を変え、local state で NPC や object の差を作る二層構造は、全 level を複製せず組合せの幅を作るが、組合せが narrative 上すべて整合する保証は別途必要になる。開発側が streamer の play を後から追っても「辻褄が合う」ことを条件にし、system が都合よく事実を捏造する逃げ道を採らなかった点は重要である。

三状態の ABC は、三分岐そのものを万能規則にしたものではない。二状態だけでは player 間の差が反復に見えやすく、四以上では制作と接続が重くなる局面での実務的な中間値と読める。state 数より重要なのは、各 state が現在 player の読み、選択、結果を変えることと、組合せを engine 上で早く試せることだ。Blueprint による小規模試作と、paper flowchart から engine へ移した時に新しい問題を発見する反復が、この system の制作可能性を支えている。

行動記録は database の付録ではなく、意味抽出器である。server へ送れる event schema を列挙しただけでは、停止、往復、spam、文脈のない emote が大量に残る。trim と area 制限は圧縮であると同時に編集であり、後続 player に「先行者が何をしたか」を理解させる narrative pacing を作る。ここには失敗条件がはっきりある。圧縮しすぎれば ghost は決められた演出に見え、残しすぎれば観察する価値のない log になる。position と animation が正確でも、なぜその行動をしたかは伝わらないため、NPC dialogue、resource の受け渡し、world state と結び付けて意味を補う必要がある。

agency の二重目的も危険を含む。未来へ良い痕跡を残すことが現在の不利益になれば、player は見知らぬ相手のために損を強いられる。逆に現在の最適行動だけで未来の差が決まるなら、social system は攻略結果の再生に縮む。開発側は destination を現在 player に残し、choice に即時効果を持たせているが、実際にどれだけ他者へ影響されたと感じたか、follow 相手の人気偏在、悪意ある emote、privacy、server cost、offline 時の fallback は記事で評価されていない。30人規模の team が UE5.4 を使った制作説明であり、発売後 telemetry や比較実験ではない点も限界である。

■ 自分達の環境への適用
最初から network service と無限 chain を作らず、同一端末の前 run を次 run が継ぐ小さな probe に縮める。一つの短い level に、global state を一つ、local state を二つ、各 state を A/B/C の最大三値で用意する。前 run から保存するのは「選んだ出口」「一つの object への操作」「危険区域での短い movement trace」だけとし、次 run では入口の環境差、NPC の一文、10秒以下の ghost の三箇所で提示する。現在 player は別の出口を必ず選べるようにし、過去の影響と現在の選択権を分離する。

記録 schema は event type、time、position、state の最小形から始め、静止区間、同一点往復、連打を deterministic に trim する。headless test では全 state 組合せを列挙し、到達不能、矛盾 dialogue、進行不能、同一結果への収束率を検査する。playtest では「前の player の意図を何だと読んだか」「自分の進路を奪われたと感じたか」「自分の行動が次へ残ると理解できたか」を自由記述と選択式で取り、設計者の intended meaning と一致率を比べる。保存 byte 数、再生時間、意味のある event 比率も計測し、意味一致が上がらない event field は増やさない。

記憶システムにも同じ構造を移せる。すべての過去 atom を現在判断へ伝播させるのではなく、直前の canonical state と次の action だけを active context にし、詳細は local reference へ閉じる。global state は project の現在段階、local state は candidate や probe の状態、ghost は「なぜこの判断になったか」を短く再生する evidence とみなせる。ただし人間の play と記憶 retrieval は同一ではないため、N-1 制約を規則として直輸入せず、context explosion を抑える比較 probe として扱う。

■ メリット・デメリット
メリットは、live multiplayer の同期負荷なしに他者の存在を mechanics と narrative の両方で具体化できること。authored content を丸ごと複製せず state 差分で再利用し、参照範囲を N-1 / N+1 と per-level に閉じることで分岐 budget を制御できる。行動 log の trim を意味編集として設計する点は、ghost replay、run 継承、記憶要約のいずれにも使える。現在効果と未来効果を同じ choice に持たせる軸も、単なる cosmetic な痕跡を避ける評価基準になる。

デメリットは、局所 state の積でも組合せ矛盾は増え、三状態なら安全という保証はないこと。server、moderation、privacy、popular player への集中、欠損 save、version migration まで含めると運用面は記事以上に重い。recording は正確さと面白さが一致せず、圧縮規則が他者の意図を誤って編集する可能性がある。follow 対象の影響が強すぎれば自分の物語ではなく先行者の後処理になり、弱すぎれば高価な演出に留まる。

■ 判定
部分採用。N-1 の参照制約、global/local state、短い ghost、現在と未来の二重効果を一 level の offline probe で試す。全組合せ headless 検査と意図理解 playtest で、分岐 budget、agency、痕跡の意味が同時に成立した場合だけ server と player chain へ拡張する。

■ URL
https://80.lv/articles/how-tides-of-tomorrow-s-story-link-system-lets-players-shape-each-other-s-stories
