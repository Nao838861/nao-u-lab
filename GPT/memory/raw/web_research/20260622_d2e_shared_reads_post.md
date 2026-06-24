■ 概要
D2E は、ロボットや embodied AI の事前学習に必要な vision-action trajectory が高価すぎる問題に対し、desktop、特にゲームプレイを大規模な sensorimotor corpus として使う研究。要点は「ゲームの画面と入力ログは、単なる動画ではなく、観測と行動が強く結びついた時系列データである」という見立てにある。Minecraft だけに閉じた VPT や、非公開データを使う SIMA と違い、D2E は desktop interaction の記録、ラベル推定、ロボット task への転移までを 1 本の pipeline として検証している。

構成は 3 段。第一に OWA Toolkit。`ocap` recorder が画面、音声、キーボード、マウス、window state を同期して記録し、OWAMcap 形式で保存する。既存の録画ツールは配信画質には向くが、どの入力がどの視覚変化を生んだかを精密に残す用途には弱い。OWAMcap は robotics で使われる MCAP を desktop event 向けに拡張し、screen / keyboard / mouse の schema と MediaRef を持たせる。結果として VPT dataset の変換では 1.06 TiB から 7.12 GiB への 152x 圧縮、CS:GO data では 689 GiB から 20 GiB への 34.45x 圧縮を報告している。さらに FSLDataset、optimized x264、adaptive batch decoding により、Minecraft benchmark で 119.16 img/s、18.73 KB/img の読み出しに到達し、単一 H100 上の InternVL3-1B training でも 1 worker で 4.77 it/s を出している。

第二に Generalist-IDM。これは動画から入力イベントを推定する inverse dynamics model だが、固定 tick ごとに action を出すのではなく、event と timestamp を同時に扱う。desktop interaction は画面更新、マウス移動、クリック、キー入力の cadence が揃わないため、50 ms などの tick に丸めると no-op が増え、文脈長も無駄になる。D2E は event token を `<EVENT_START>...<EVENT_END>` の列として扱い、NEP-tau という temporal offset 付き next-event prediction で学習する。tau は 0 / 50 / 100 / 150 / 200 ms を比較し、未来文脈がない tau=0 では相関や keyboard accuracy が大きく落ち、100 ms 以上で安定するため、標準を 100 ms としている。この Generalist-IDM は 259 時間の人間 demonstration で学習され、さらに permissive license の YouTube gameplay を 20 Hz で screen event 化し、1055 時間分の keyboard / mouse pseudo-label を生成する。

第三に VAPT。InternVL3-1B を backbone に、human-collected dataset のみを使う VAPT w/o pseudo と、pseudo-labeled gameplay を加えた VAPT w/ pseudo を作り、desktop-pretrained representation が robotics に移るかを評価する。LIBERO manipulation では baseline の InternVL3-1B が Total 84.8% なのに対し、VAPT w/o pseudo は 96.6%、long-horizon の LIBERO-10 では 54.2% から 93.6% へ伸びる。一方、pseudo-label を加えた版は Total 92.2% に下がり、manipulation では精密な人間 supervision のほうが効く可能性が示されている。CANVAS navigation では逆に pseudo-label が効き、baseline 75.3%、VAPT w/o pseudo 75.3%、VAPT w/ pseudo 83.3%。特に misleading instruction 下の orchard と street-side で差が大きい。Meta-World でも平均で約 5 point、相対で約 25% の改善、SO101 real-world pick-and-place では 70% から 80% への改善を報告する。

著者らの結論は、desktop/gameplay で学んだ sensorimotor primitives が、manipulation や navigation の初期表現として実用的に効くというもの。ただし limitations も明確で、実機評価は SO101 の単一 pick-and-place に限られる。pseudo-label は navigation では改善し、manipulation では悪化するため、転移機構は task-specific。dataset も主にゲームであり、一般 desktop 作業全体を覆うものではない。

■ 内容分析
この論文で重要なのは、ゲームを「ロボットの比喩」ではなく「安価に大量取得できる観測-行動ログ」として扱っている点。単にゲーム動画を集めるだけなら視覚表現学習だが、D2E は入力 event の時刻、画面変化、データ形式、読み出し性能、pseudo-labeler、downstream robot task を同時に設計している。つまり成果の中心は、モデル単体よりも logging substrate の設計にある。

評価もその読み方を支持している。LIBERO で pseudo-label なしが最良になるのは、YouTube gameplay の量よりも、同期された人間入力の精度が manipulation に効いていることを示す。一方 CANVAS では pseudo-label が効く。これは navigation が「正確な grasp 軌道」よりも、視覚的な場所理解、指示の曖昧さへの耐性、長めの順序制御に寄っているからだと解釈できる。したがって D2E は「データを増やせば全部良くなる」という話ではなく、task の action precision と planning 抽象度に応じて、human log と pseudo-label の価値が変わることを示している。

もう一つの強みは、storage と throughput を研究の外側に追いやっていないこと。152x 圧縮、119.16 img/s、H100 での data loader worker 数の比較は地味だが、vision-action pretraining を実運用する時の制約そのもの。Nao_u_BOT のように継続的に playtest trace を貯める環境では、モデル手法より先に「壊れず、後で引けて、学習に流せるログ形式」が必要になる。

■ 自分達の環境への適用
Nao_u_BOT では、まずゲーム制作サイクルの headless playtest / GUI playtest を、評価ログだけでなく vision-action corpus として保存する設計に転用できる。現状のログが「成功/失敗、スクリーンショット、エラー、コメント」に寄っているなら、D2E 的には、画面 frame、入力 event、UI state、実行中 scene、build hash、test objective を同じ時系列に束ねることが重要になる。すぐに foundation model training をする必要はないが、将来の agent evaluator や playtester を育てるため、保存時点で schema を固定しておく価値がある。

具体的には、game prototype ごとに `run_id`、`build_id`、`task_prompt`、`frame_ref`、`input_event`、`state_probe`、`outcome` を event stream として残す。D2E の Generalist-IDM 相当をいきなり作るより、まずは小さな in-domain IDM probe として「この画面なら次に押すべき入力を再現できるか」「失敗直前の入力列を他 run と比較できるか」を見る。Phase 3b/4a では、この投稿を恒久ルールにせず、1 つの prototype でログ schema probe を切るのが適切。

■ メリット・デメリット
メリットは、playtest を消費物ではなく再利用可能な訓練資産に変えられること。GUI 操作、ゲーム内 navigation、UI bug 再現、agent evaluator の回帰テストが同じ corpus から派生できる。圧縮と schema を先に決めれば、あとからモデル学習や検索に流しやすい。

デメリットは、ログ設計の負荷と privacy / license / storage の管理。D2E はゲーム中心なので privacy を抑えられるが、Nao_u_BOT の desktop 操作には Slack、ブラウザ、ローカルファイルが混ざる可能性がある。さらに pseudo-label は task によって逆効果になり得るため、量を増やす前に用途別の評価軸が必要。

■ 判定
部分採用。D2E のモデル構成をそのまま追うより、OWA Toolkit 的な「同期 event stream として playtest を保存する」発想を先に採用する。小規模 probe で、ゲーム制作ログが将来の操作モデル・評価器・失敗分析に使える形式かを検証する。

■ URL
https://arxiv.org/abs/2510.05684
https://arxiv.org/pdf/2510.05684
