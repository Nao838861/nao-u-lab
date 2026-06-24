■ 概要
GDC 2026 の講演「From the Ground Up: Rethinking Quality in Games」は、ゲーム開発における Quality を「バグを見つける部署の仕事」から、「複雑化したゲーム制作を成立させるための開発ワークフロー」へ広げ直す話である。登壇者は Ubisoft の Aniruddha Pawar と Jawad Shakil。GDC 公式ページでは Game & Production Technology トラックの lecture として掲載され、対象は producer、quality leader、developer、特に AAA や live game の品質体制を長期的に強くしたい人たちに置かれている。

問題設定は明確で、ゲームが大型化し、systems が複雑になるほど、Quality を最後にバグを拾う工程として扱うだけでは足りない、というものだ。現代のゲームでは、単体の不具合だけでなく、コンテンツ量、ビルド頻度、live operation、プレイヤー状態、UI 導線、経済設計、オンライン機能、データ更新、イベント運用などが絡む。そこで品質上のリスクは「クラッシュするか」「仕様通りか」だけでなく、「本当に重要な箇所を見られているか」「チーム間で同じ状態を見ているか」「人間の確認時間をどこに使うべきか」という運用設計の問題になる。

講演概要が示す中核は、tech と testing の混合、role の upskilling、automation と data の利用である。つまり QA を手作業の実行部隊として増やすのではなく、テスト設計、ツール、データ観測、開発チームとの協働をつなぐ能力として再構成する。GDC 公式の takeaway では、Ubisoft の Quality teams が automation、data、Gen AI を使って future-ready workflows を作っていること、team structure の変化、tech capability への早期投資、targeted upskilling が、testing efficiency、collaboration、development outcomes に測定可能な改善をもたらしていることが説明されている。

ここで重要なのは、automation が「人間 QA の置き換え」としてではなく、「本当に重要なものに集中するための選別装置」として置かれている点である。公開概要は、automation と data を使って focus on what really matters すると書いている。これは、テスト項目を大量に自動化すれば品質が上がるという単純な主張ではない。むしろ、複雑化したプロジェクトでは、全てを同じ粒度で見ること自体が破綻する。だから、データで異常や変化を見つけ、automation で反復確認を支え、人間は設計意図、プレイヤー体験、リスク判断、チーム間の合意形成に時間を使う、という分業に寄せている。

ATIG の GDC 2026 紹介ページでも、この講演は automation-adjacent な注目セッションとして扱われている。ATIG は automated testing と quality engineering のコミュニティであり、同ページでは GDC 2026 の automated testing roundtables や test automation panel と並べて本講演を紹介している。これは、Ubisoft の話が単なる QA 組織論ではなく、tooling、build、automation、data、testing culture をまたぐ実務テーマとして見られていることを示している。

■ 内容分析
この講演の価値は、「QA を早めに入れよう」より一段広いところにある。QA の参加時期だけを早めても、見るものが checklist と bug ticket だけなら、品質の定義は変わらない。ここで提案されているのは、Quality team の職能そのものを変えることだ。upskilling という語が入っているのはそのためで、テスターが単に多くのケースを実行するのではなく、automation を読める、data を扱える、開発者と同じ現象を観測できる、Gen AI やツールを使って探索範囲を広げられる、という方向へ役割を広げる。

また、team structure の変化が takeaway に含まれている点も重要である。品質改善を個人の頑張りに任せるのではなく、構造として、誰がどの段階で何を見るかを組み替える話になっている。testing efficiency は単なる速度、collaboration は単なる連絡頻度、development outcomes は単なるバグ数ではない。これらを並べていることから、品質を「テスト部門の局所最適」ではなく、開発成果全体に影響する流れとして扱っていると読める。

一方で、公開情報だけでは、Ubisoft 内部でどの telemetry を見たのか、Gen AI を何に使ったのか、測定可能な改善がどの指標だったのかまでは分からない。したがって、ここから得るべきものは個別手法の模倣ではなく、品質活動を「観測、反復、協働、役割更新」の束として設計する見方である。特に live game や大型開発の文脈では、バグが出てから直すだけでなく、品質上の重要領域を先に見つけ、そこへ人間の判断を集中させる体制が必要になる、という問題意識を持ち帰るのが妥当だ。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作サイクルに置き換えるなら、Quality は「生成物が動くか」だけでなく、「その playable diff が次の設計判断に使える観測を返したか」まで含めるべきだ。headless bot、replay 検証、ログ、主観フィードバック、Slack でのレビュー、memory atom 化を別々の工程として扱うのではなく、ひとつの Quality workflow として接続する。

具体的には、各 prototype に対して、最低限の automation を「クラッシュ検出」「主要操作の replay」「状態遷移ログ」「失敗時スクリーンショット」程度に絞って持たせる。そのうえで、人間や AI の主観レビューは、面白さや違和感、設計意図とのズレを見る。automation は結論を出す装置ではなく、人間が見るべき場面を減らさず選ぶ装置にする。Phase 3b/4a では、shared-reads の知見を恒久ルールに即変換するのではなく、小さな probe として「この prototype で何を観測すれば Quality と言えるか」を先に書く運用にできる。

■ メリット・デメリット
メリットは、制作終盤の手戻りではなく、設計途中のリスクを早く見つけやすくなることだ。ログ、replay、主観レビューがつながれば、単なるバグ報告ではなく「なぜその体験が崩れたか」を次の差分に返しやすい。小規模環境でも、全自動 QA ではなく観測設計としてなら導入できる。

デメリットは、AAA / live game 前提の話をそのまま小規模 prototype に持ち込むと、仕組みの維持が目的化することだ。telemetry や automation を増やしすぎると、肝心の遊びの更新より計測整備が重くなる。最初は少数のログと replay に絞る必要がある。

■ 判定
部分採用。Ubisoft の具体実装は公開概要だけでは追えないため模倣しない。ただし、Quality を bug finding から、automation、data、role upskilling、collaboration を含む workflow として扱う見方は、Nao_u_BOT の playable diff 評価にそのまま効く。

■ URL
https://schedule.gdconf.com/session/from-the-ground-up-rethinking-quality-in-games/915041
https://atig.dev/gdc/
