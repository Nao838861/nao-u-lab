■ 概要
『The Latent Bridge』は、リアルタイムゲーム agent に必要な「数十 ms で画面へ反応する能力」と「数秒先を考える能力」を、一つの model に無理に同居させず、速度の異なる二つの凍結 VLM と通信路へ分解した研究である。fast model は MiniCPM-o 4.5（9B）で約15 Hz の操作 loop を担い、slow model は Qwen3-VL-8B-Thinking（8B）で約1 Hz の非同期推論を行う。slow model は一回の応答に約1.5秒かかるため操作 loop を止めず、最新の推論結果を次の約15 tick で再利用する。

比較対象は三つある。Fast-Only（F）は fast model だけで操作する。Text Bridge（T）は slow model の文章を prompt suffix として渡す。提案する Latent Bridge（L）は slow model の residual を33M parameter の MLP で4096次元へ射影し、8個の latent token として先頭に加える。両 VLM は凍結し、Text Bridge の trajectory から約5K sample/gameを集め、L の policy が T を模倣するよう bridge だけを KL distillation する。

評価は Atari 7作と MetaDrive。各 cell は3 seed×4 episode、最大500 tickで、decoder は channel ごとに held-out seed で選ぶ。L は T に対し MsPacman +57%、RoadRunner +28%と有意に勝ち、残り5作は有意差なしだった。一方、River Raid と SpaceInvaders では F が両 bridge を上回る。L−F と T−F の相関は8 domainで r=0.93であり、T>F の task でだけ bridge が効く。MetaDrive は計画型 route でも T が F を越えず、L を zero/random token に替えても score が変わらない controlled negative になった。

重要な負の結果もある。TとLを同時に渡すと情報が増えるどころか、MsPacman -49%、RoadRunner -96%、River Raid -29%となり、良い単一 channel を下回った。長い text 履歴も、古い状態が混ざるため RoadRunner では3 emission で全 episode が0点へ崩れた。結論は「latent は text より高帯域だから万能」ではなく、まず安価な T で slow layer に価値がある task かを測り、価値がある場合だけ単一の L へ置き換える、という段階的な設計則である。

■ 内容分析
強い点は、architecture の勝敗より先に bridge を入れるべき task の判別規則を出したことにある。L は T の policy を蒸留するため、T にない有益な deliberation は発明できない。r=0.93 はこの制約が deployment でも崩れなかった証拠で、採否順は F→T→L になる。FとTを比べず latent 学習へ進むと、slow signal 自体が不要・有害な task へ計算資源を投じる。

「latent は文章より高帯域」という説明も実験は支持しない。token 数4、8、16で性能は単調に増えず、同一 game 内の bridge 変動は3～8%にすぎない。token は語彙と対応せず、多くは game identity を表した。MsPacman では zero/random token だけでも F より約40%分の lift が出る一方、RoadRunner はほぼ全てが学習信号、River Raid は学習 token の方が悪い。「追加 position の効果」と「slow model 由来の内容」を replacement control で分離しないと通信成功を誤認する。

もう一つの核心は offline metric と deployment の断絶である。v1 bridge は256次元 cross-attention を36層中2層へ入れ、offline KL=0.004でも実プレイでは F に負けた。4096次元 token を prepend し全層から参照する v2 で初めて動いた。bare action head は未学習の suffix/latent 入力で argmax が70～90%変化する。suffix 混入で再学習した robust head は collapse を救う一方、正常だった MsPacman、Seaquest、RoadRunnerを悪化させた。一律の安全策にはならない。

評価には留保がある。1 cell 12 episodeは小さく、greedy と小さい action space で分散0の cell が多い。固定 greedy ならLは4勝に見えるが、held-out decoder 選択では有意な勝ちは2作へ減る。MsPacman は二峰性で統計手法により有意性が揺れ、RoadRunner の F=0 も bare head 固有である。replay と再現 pipeline は公開されるが、現実の desktop/phone 操作や大きな action space まで一般化した証拠ではない。

■ 自分達の環境への適用
最初に採るべきなのは latent 学習ではなく、非同期 slow/fast loop と採否 gate である。headless playtest agent を、毎 tick の観測から入力を返す executor と、低頻度で route、危険、未達 goal、次の検証項目を更新する planner に分ける。executor は planner を待たず、最新 advice と生成時 tick を読む。advice には必ず age を持たせ、一定 tick を越えたら破棄する。論文の rolling text failure は、記憶を増やすほど良いのではなく、状態が速く変わる task では古い助言が直接ノイズになることを示す。

probe は一つの playable scene で、Fを executor 単独、Tを1 Hz planner の構造化 advice 付きとして同じ seed、episode budget、decoder sweep で比べる。score、goal 到達率、即死、無操作、trajectory 反復、tick latency、advice age、planner が行動を変えた tick 数を記録する。held-out seed で T>F が再現しなければ latent 経路は作らない。再現した場合も、最新 advice 1件対3件履歴、通常 head 対 suffix 耐性 head、単一対併用 signal を ablation し、stale advice と OOD drift を先に検出する。

latent へ進むのは、text serialization が実測 bottleneck になり、Tの有効性が複数 seed で確認できた時だけにする。その場合も trained/zero/random、F/T/L、単一/併用、offline KL/deployment score を比較する。KLだけで成功とせず、replay で catastrophic run と policy drift を見る。15 Hzを模倣するのではなく、slow 更新より速い危険へ executor 単独で対処できることを先に保証する。

記憶システムにも限定的に借りられる。低頻度の分析が「現在有効な方針」を一件だけ更新し、高頻度 phase は版と鮮度を読む。ただし latent 化は監査可能性を落とすため採らない。bridge token の大半が game identity だったように、圧縮 state が局所変化を失う危険がある。記憶側では text、provenance、更新時刻を残す。

■ メリット・デメリット
メリットは、低遅延操作と高価な推論を wall-clock 上で分離し、planner の遅延で game loop を止めないこと、base model を凍結したまま channel だけを比較できること、T>F という安価な事前 gate で不要な latent 学習を避けられることにある。held-out decoder 選択、zero/random replacement、MetaDrive negative、失敗した v1 の開示も、我々の headless harness にそのまま移せる評価作法である。

デメリットは、fast/slow の二 model と非同期 state 管理で GPU contention、stale advice、再現性の管理点が増えること、latent token が読めず障害時の説明可能性が下がること、bridge 入力が action head に OOD drift を起こすことにある。slow signal が有益でも TとLの併用は悪化し、robust head も正常な game を壊し得る。評価規模は小さく、Lの優位は7作中2作、現実の computer-use は未検証である。latent bridge を汎用 architecture として先回り実装する根拠はまだない。

■ 判定
部分採用。直ちに採るのは、fast executor／slow planner の非同期分離、F→T→Lの段階 gate、freshness、held-out episode、replacement control、deployment replay である。latent bridge 自体は、text advice が安定して F を上回り、text round-trip の実測 bottleneck が出た task に限って保留付き採用とする。slow reasoning が価値を出さない task、または説明可能性が重要な記憶経路には使わない。

■ URL
https://arxiv.org/abs/2606.24470
