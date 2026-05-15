<!-- phase3 shared-reads drafts, 2026-05-15 -->

<!-- id: cyberball -->
■ 概要
対象は Tao Long, Swati Pandita, Andrea Stevenson Won による “Perspectives from Naive Participants and Experienced Social Science Researchers on Addressing Embodiment in a Virtual Cyberball Task”。Cyberball は、参加者がボールを投げ合う簡単なゲームに見せかけ、他者からボールを回される/回されない状況を作って、社会的包摂・排除が気分、自尊感情、社会的痛みなどに与える影響を測る社会科学の古典的パラダイムである。この研究は、それを Unity3D の immersive VR 版にし、さらに avatar customization を追加した時、ゲーム体験としての没入感と、研究課題としての統制可能性がどうぶつかるかを調べている。

プロトタイプは Quest 2 向けの VR 環境で、参加者は Scene 2 で白人女性のデフォルト avatar から体型、顔、体や頭の大きさ、髪型、髪色、服装をボタンとスライダーで編集し、保存後に自分の avatar を確認してから inclusion / exclusion の Cyberball に入る。カスタマイズ履歴は csv として保存される。元の VR Cyberball は、社会的排除の効果を純粋に見るため avatar customization を避けていたが、本研究は逆に、avatar が自己同一化や ecological validity を高める可能性に注目している。

評価は 15 名の stakeholder を分けて行う。5 名は Cyberball を知らない naive participants で、実験参加者としての視点を代表する。10 名は Cyberball を研究に使った経験がある social science researchers で、心理学、人間発達、栄養学、社会学などから recruited されている。研究者は Zoom の walkthrough で環境を見て、研究上の適合性や懸念を話す。naive participants は Oculus Quest 2 で実際に触り、avatar、agent、背景、ボール投げの体験を語る。分析は interview notes と transcripts を thematic analysis し、1) intuitive use、2) inclusivity、3) realistic experiences / minimalism に整理している。

結果の重要点は、両者が一致した点と割れた点がはっきり分かれること。直感的な使いやすさでは、両群とも visual cues の不足を指摘した。avatar の身長スライダーを動かしても基準物がないため高さが分からず、ゲーム場面に入ってから自分だけ極端に大きいと気づく。研究者側は avatar に名前や年齢を付けられれば in-group / out-group 操作に使えるとも見る。naive participants はスマホゲーム等の経験から、服や髪を一つずつクリックするより、avatar 上に選択肢を重ねて左右にスクロールする UI を期待する。一方、研究者は senior users や技術不慣れな参加者にも分かる導線を求める。

Inclusivity では、既製の avatar preset に埋め込まれた race, age, gender, body type, clothing, physical ability の偏りが問題になる。肌色を変えても顔立ちは白人に見える、若い avatar を高齢者研究に使うと参加者が「自分」ではなく若者のために判断する、女性 body の clothing が露出度や価格で偏っている、hand controller や VR sickness が一部参加者を排除する、などが具体的に出る。社会的排除を扱う研究ツールでは、represent oneself できない avatar そのものが negative experience を増幅しうる。

最大の分岐は realistic experience と minimalism である。naive participants は一回限りのゲーム体験として、もっと楽しく、背景も音もリアルで、agent も面白く、ボールの力加減やキャッチミスもある方が engaging だと見る。研究者は逆に、選択肢が多すぎると参加者が迷い、背景や演出が増えると game 以外の confound が増え、研究の妥当性が落ちると見る。論文の結論は、どちらか一方を正解にするのではなく、multi-stakeholder perspective を VR/social science paradigm の設計過程に組み込み、engagement と experimental control のずれを初期から見える化せよ、というもの。

■ 内容分析
この論文の価値は、VR ゲーム的な「面白くする」判断が、研究ツールではそのまま善にならないことを小さな prototype で具体化している点にある。特に Cyberball は、もともと単純さによって成立している。参加者が誰から排除されたかを感じるだけでよいので、背景、音、物理、agent の個性は少ないほど統制しやすい。ところが VR に移すと、参加者は既存ゲームの体験規範で読む。avatar customization があれば、もっと自分らしさや派手さを期待し、VR 空間なら音や風景や physical interaction を期待する。この期待を無視すると没入感が落ちるが、全部入れると研究変数が濁る。

面白いのは、inclusivity が両群の合意点でありながら、単純な「選択肢を増やす」では解けないこと。代表性を上げるには age, race, body type, gender expression を増やしたい。しかし研究者は選択肢過多を避けたい。つまり avatar system は自由度ではなく、研究目的に必要な representational coverage と、参加者が迷わない低摩擦 UI の両立として設計する必要がある。これはキャラメイク一般にも効く。プレイヤーの自由と、作品側が測りたい/成立させたい体験の焦点は別物である。

また、本研究はサンプルが 15 名で限定的だが、少人数だから弱いというより、prototype 前半で見るべき不一致を十分に拾っている。完成度評価ではなく、stakeholder group ごとに何を価値として見ているかを分離する使い方なら有効である。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、初見プレイヤー評価と、設計意図を知る評価者のコメントを混ぜないことにそのまま使える。今の我々は「遊んで面白いか」「型として成立しているか」「検証しやすいか」を一つの感想にまとめがちだが、この論文の読み方では少なくとも二列に分ける。初見列は、操作が直感的か、見た目から目的が分かるか、楽しさの期待に応えているか。設計者/研究者列は、変数が増えすぎていないか、独自要素が型を壊していないか、評価したい体験にノイズが入っていないか。

特に小型プロトタイプでは、要素追加の可否を「面白くなりそう」だけで決めず、confound として記録する。演出、背景、キャラ差、ランダム性、操作自由度は、プレイヤーには魅力だが、評価時には原因推定を難しくする。Phase 3b/4a の probe に落とすなら、「この追加は engagement を上げるためか、評価変数か」「初見プレイヤーと設計評価者で反応を分けて読んだか」の 2 問がよい。

■ メリット・デメリット
メリットは、少人数のフィードバックでも stakeholder ごとの価値基準のずれを抽出できること。UI、avatar、包摂性、演出、研究統制という別軸を混ぜずに扱える。デメリットは、Cyberball という研究パラダイム固有の統制要求が強いため、娯楽ゲームへ直接移すと「余計な面白さを削る」方向に寄りすぎる危険がある。一般ゲームでは、統制は検証時のための制約として扱い、最終体験の豊かさとは分ける必要がある。

■ 判定
部分採用。採用するのは、multi-stakeholder feedback を分離して読む評価設計と、avatar/演出追加を engagement と confound の両面で見る観点。Cyberball 固有の minimalism は、そのまま作品設計原則にはしない。

<!-- id: streambed -->
■ 概要
対象は Alina Striner, Jennifer Preece による “Refining StreamBED Through Expert Interviews, Design Feedback, and a Low Fidelity Prototype”。StreamBED は、市民科学者が河川環境を定性的に評価するための embodied VR training である。狙いは、専門家でない参加者が stream assessment の見方を学び、専門家の観察や RBP assessment に近い判断をできるようにすること。初期 prototype は、複数の stream spaces を virtual representation として体験しながら qualitative assessment を学ぶ方向では好意的に受け止められたが、分野固有の課題が明確になった。初心者は protocol を読んでも、どの環境 cue に注目し、どう解釈すればよいか分からず、実質的な guidance と feedback を必要としていた。

この論文は、完成した VR の効果測定ではなく、StreamBED 2.0 を設計し直すための research through design の記録である。RTD は、問題定義、データ発見と統合、solution の生成・洗練・反省を回し、最終成果として具体的な problem framing、models、prototypes、design process documentation を残す方法として扱われている。著者らは、専門家の暗黙知をそのまま説明文にするのではなく、初心者が環境内で何を見るべきか、どの順番で判断すべきか、どの感覚情報や社会的やりとりが学習を支えるかに翻訳しようとしている。

材料は 4 系統ある。第一に、5 名の expert biologists への電話または対面 interview。第二に、第一著者が 6 つの stream sites を専門家と訪れ、on-site stream monitoring training を受けた経験。第三に、HCI faculty/students と water monitoring group への design feedback sessions。第四に、low fidelity prototype に対する 6 名の参加者 feedback である。Open coding により、意味のある発言を theme / sub-theme にまとめ、StreamBED 2.0 の training redesign に使う。

専門家 interview で重要なのは、専門家が protocol だけで判断しているのではない点である。RBP protocol は標準だが、熟練者は長年の経験から mental images の集合として尺度を持ち、stream を見れば全体カテゴリを直感的に置ける。さらに、trash、人間活動の痕跡、invasive species、鳥の声、水音、日差し、風、bank vegetation など、protocol 外の情報も品質判断に使う。彼らは現在の景観を採点するだけでなく、stream の narrative、つまり過去に何が起き、今なぜそうなっていて、5-10 年後にどう変わるかを読んでいる。侵食、沈殿、農地跡、生態系のつながりを時間軸で解釈するのが専門家の見方である。

Design feedback sessions では narrative と realism が争点になる。HCI 側は死んだ魚を下流で見つけ、原因を探して上流へ向かうような story を motivating と見るが、water monitoring 側は fish kill という単一イベントを強く出すと、低酸素や algal bloom など特定原因へ学習を歪めると懸念する。つまり narrative は学習を動機づける一方で、専門的には confounding story にもなる。Realism については、専門家は参加者が event に依存せず一貫して area を rank できる heuristic judgment を求める。デザイナーは expert teacher avatar や compass のような field metaphor を提案し、現場で使える道具に近い interaction を重視する。

Low fidelity prototype は、PowerPoint slideshow を使った簡易実験である。参加者は死んだ魚の原因を探す journey narrative を聞き、各 stream area の画像、audio cues、sprayed scents による olfactory cues を受ける。slide には Riparian Zone metric に関係する環境特徴、expert scoring、minimap 上の位置、鳥・虫・魚などの contextual cues が含まれる。その後、参加者は学んだ protocol で 4 枚の stream environment image を評価し、group discussion を行う。結果として、low fidelity では detail ambiguity が大きく、画像のどこが重要か、highlighted area が広すぎて何を見ればよいか、covering や shade といった keyword をどう具体物へ対応させるかが分かりにくいと分かった。参加者は erosion の線や depth など、比較しやすい quality markers を求めた。また、Shenandoah で camping している設定なのに golf course stream が出る、比較的良い場所の下流に死んだ魚がいるなど、story と環境の inconsistency が学習を壊すことも分かった。

結論は 3 点に整理される。第一に、forced storyline より personal narratives が有効である。専門家も参加者も、自分で現象を説明する物語を作る時に理解が進む。第二に、redesign は high-fidelity resolution を最大化すべきである。stream assessment は多感覚的な環境読み取りなので、360 度 real stream images や multisensory information が必要になる。第三に、protocol meaning の交渉は social task として設計すべきである。現場調査はペアやグループで行われ、片方が manual を持ち、VR 内の相手を guide するような社会的学習が、暗黙知を言語化して明示的理解へ変える。

■ 内容分析
この論文の芯は、専門家知識を「説明文」に落とすのではなく、初心者の注意、比較、物語生成、対話の足場へ分解している点にある。RBP protocol を読ませれば学べる、という発想では足りない。初心者は language を読めても、現場のどの音、匂い、植生、侵食、人工物を、どの尺度と結びつけるかが分からない。だから training design の仕事は、正解を表示することではなく、見落とす cue を見える状態にし、解釈の粒度を揃え、専門家が頭の中で行う時間的・因果的 narrative をユーザー自身に構築させることになる。

また、low fidelity prototype の使い方がよい。低忠実度だから完成体験を評価できない、で終わらせず、低忠実度だからこそ「解像度不足でどこが壊れるか」を見ている。PowerPoint で stream image を見せるだけでは、VR の代替にはならない。しかし、highlight が広すぎる、比較 marker がない、story と画像が矛盾する、という失敗は、高忠実度化する前に潰せる。これは prototype を「安く成功証明する道具」ではなく、「高く作る前に失敗の型を特定する道具」として使っている。

注意点は、最終的な有効性は future work に残っていること。StreamBED 2.0 を baseline PowerPoint training と比較し、専門家評価に近づくか、engagement と motivation が上がるかはまだ検証予定である。したがって、この論文から採るべきなのは効果実証ではなく、専門領域ゲームの設計調査プロセスである。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、複雑な題材をゲーム化する時の入口として使える。たとえば専門的な操作、観察、判断を含むプロトタイプでは、まず「熟練者は何を cue として見ているか」「初心者はどこで protocol を読んでも分からなくなるか」「判断は個人作業か、会話で meaning を交渉する作業か」を分けて聞く。ゲーム内チュートリアルは、文章説明よりも、注目箇所、比較対象、品質 marker、失敗例、相棒役のガイドに変換する。

記憶システムにも適用できる。shared-reads の候補を読む時、外部知見を単に要約するだけでは StreamBED の初心者と同じ失敗をする。専門家がどの cue を見ているか、どの判断単位へ翻訳すべきか、どの probe で次回の行動に変えるかまで落とす必要がある。Phase 4a の整理では、「この atom は説明文か、次に見る cue か」を分けるとよい。

■ メリット・デメリット
メリットは、専門家 interview、現場観察、design feedback、low fidelity prototype を組み合わせ、暗黙知をゲーム内 scaffold へ翻訳する流れが具体的なこと。教育・訓練ゲームで、早期に cue 設計の欠落を見つけられる。デメリットは、対象領域への依存が強く、専門家アクセスと現場観察が必要なこと。また、面白さ評価とは別に、学習成果が専門家判断へ近づいたかを後段で測らないと完成判定にならない。

■ 判定
部分採用。専門領域を扱うプロトタイプでは、効果主張ではなく設計調査プロセスとして採用する。特に「専門家の cue を初心者用 scaffold に翻訳する」「low fidelity で ambiguity と inconsistency を先に潰す」は次の制作サイクルに入れる価値が高い。
