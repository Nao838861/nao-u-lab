■ 概要
https://openreview.net/forum?id=qeziG97WUZ

LMGame-Bench は、LLM/VLM が video game をどれだけ遊べるかを測る benchmark だが、単に 6 つのゲームでスコアを競わせるだけではない。論文の問題設定は、ゲームは perception、reasoning、memory、long-horizon planning、dynamic opponent/adaptation を同時に要求するため、raw score だけだと「モデルが何に失敗したのか」が分からない、というもの。そこで Super Mario Bros、Sokoban、Tetris、2048、Candy Crush、Ace Attorney を unified Gym-style API で扱いながら、perception / memory / reasoning の harness module を toggle できるようにして、同じゲーム上で能力の切り分けを行う。

特徴的なのは、scaffold を「ズル」や「補助輪」として一律に排除せず、評価設計の変数として扱う点。素のゲーム画面を直接見せると、視覚抽出の失敗、長期履歴の忘却、無効手の反復、prompt 依存の揺れが一緒に出る。LMGame-Bench では、視覚がボトルネックになるゲームには object list や座標などの textual state を渡す perception module、長期の手順や失敗履歴が必要なゲームには transient memory と reflection module、reasoning model には long-CoT の有無を切り替える reasoning module を用意する。これにより、同じ Sokoban で「画面が読めない」のか「箱押し計画ができない」のか、2048 で「前回失敗した手を忘れている」のか「盤面評価が弱い」のかを分けて見る。

評価対象は 13 の state-of-the-art models。結果として、o3 と o1 が全体で上位、Gemini-2.5-pro-preview と Claude-3.7-Sonnet が続き、non-reasoning model では GPT-4.1 が強い、というランキングが出ている。ただし論文が強調するのは順位そのものより、harness の有無で benchmark の診断力が変わること。harness なしでは、vision-capable model を除いた run の 40% が random-play baseline を超えられない。harness を入れると 86.7% の run が random baseline を超え、モデル間差や module 差が読めるようになる。つまり難しすぎて全員が失敗する状態から、どの能力が効いたかを観測できる状態へ持ち上げるために scaffold を使っている。

各 module の効果も具体的に報告されている。Sokoban、Tetris、Candy Crush では structured perception が大きく効き、視覚が読めれば reasoning model の計画力が発揮される。一方、2048 は 4x4 board が比較的単純で、perception より memory/reflection が効く。non-reasoning model は無効手を繰り返しやすいが、過去状態と自己反省を足すと同じ失敗を避けられる。Super Mario Bros では、画像説明を与えても「いつジャンプを始め、何フレーム維持するか」という spatiotemporal reasoning が残り、背の高い pipe や gap crossing で失敗する。Ace Attorney では必要な証拠が context 内にあっても、長い会話履歴があると contradiction を取り出せない long-context interference が出る。

もう一つの柱は contamination と prompt variance への対策。人気ゲームを使う以上、Mario の level 1-1 や Ace Attorney の台詞が学習データにある可能性がある。論文は vision-level contamination と text-level contamination を分けて検査し、Ace Attorney では transcript 類似度と成績の相関を確認した後、名前 masking、paraphrasing、因果推論の強制などで memorization を抑え、類似度と成績の相関が消えることを示す。prompt については canonical agentic format と DSPy SIMBA optimizer を使い、2048 などで prompt variance を 33.8%-63.5% 減らしたと報告する。最後に、Spearman correlation、latent factor、linear modeling で、各ゲームが既存 benchmark のどの能力軸に近いかを読む。Sokoban は symbolic/physical reasoning、Ace Attorney は long-context language reasoning、Tetris/2048 は spatial reasoning、Candy Crush は visual pattern recognition に寄る、という整理になっている。

■ 内容分析
この論文の面白さは、ゲームを「総合力テスト」として扱いながら、総合点で終わらせない設計にある。raw gameplay はリアルだが、失敗原因が混ざりすぎる。逆に完全にテキスト化しすぎると、ゲームらしい perception や timing を消してしまう。LMGame-Bench はこの中間として、harness を ON/OFF できる実験条件にし、補助を入れた時にスコアが上がるか、上がらないかを能力診断に使う。scaffold で性能を上げること自体が目的ではなく、「補助すると解けるなら perception が詰まっていた」「補助しても解けないなら planning/timing が残っている」と読む。

また、人気ゲームを採用した弱点を正面から処理しているのも重要。完全新規ゲームなら contamination は減るが、人間にとっての難しさや評価の直感が弱くなる。既知ゲームを使うなら、memorization の混入を検査し、必要なら prompt intervention で推論ベースに戻す必要がある。この論文はそこを benchmark の運用要件として扱っている。Nao_u_BOT 側で既存ジャンルや有名ルールを使う時も、agent が本当に現在状態を読んでいるのか、攻略知識を再生しているのかを分ける設計が必要になる。

■ 自分達の環境への適用
ヘッドレス playtest harness を作る時、最初から「万能 agent で遊ばせる」ではなく、module toggle を前提にする。例えば prototype ごとに raw observation、structured observation、N-turn memory、reflection note、rule hint の ON/OFF を切り替え、同じ seed を走らせる。raw では失敗し structured では成功するなら UI/state readability の問題、memory を足すと改善するなら長期状態や失敗回避の問題、reasoning を足しても改善しないなら action space や physics timing の問題として扱える。

ゲーム制作サイクルでは、スコアだけでなく「どの scaffold で改善したか」をログ化する方が使いやすい。特に STG、パズル、会話推理、デッキ構築のように能力軸が違う prototype を横断して見るには、perception/memory/reasoning の共通分類があると、次に直すべき対象がゲーム UI なのか、ルール説明なのか、agent wrapper なのかを判断しやすい。prompt variance 対策も、毎回最強 prompt を探すより、標準 prompt と固定 optimization budget を決め、比較の揺れを減らす形で使う。

■ メリット・デメリット
メリットは、失敗原因を module 単位で切り分けられること。raw gameplay の難しさを維持しつつ、structured state や memory を実験条件として使える。contamination と prompt variance も運用上の問題として扱っている。デメリットは、対象が popular games 中心なので、制作中の小さな prototype には Gym-style API、報酬設計、module 入出力を移植する手間があること。harness が強すぎると、実ユーザーが感じる UI の難しさを隠す危険もある。

■ 判定
採用寄りの部分採用。まずは perception / memory / reasoning の toggle と、scaffold ごとの改善ログを導入する。LMGame-Bench 全体を再現するより、失敗原因を混ぜずに読む harness 思想を制作評価に移す。
