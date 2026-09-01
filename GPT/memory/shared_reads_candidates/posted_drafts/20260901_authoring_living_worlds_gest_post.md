■ 概要
「Authoring for Living Worlds」は、LLMに動画の絵や自由形式のスクリプトを直接作らせるのではなく、「シミュレータが最後まで実行できる複数人物のイベント仕様」をエージェントに編集させる研究である。中間表現は GEST（Graph of Events in Space and Time）。ノードは、誰が、どこで、どの対象に、何をするかを表す event、エッジは Allen の interval algebra に基づく時間制約や論理・意味関係である。実行側は GTA San Andreas 上の GEST-Engine で、70以上の環境、733オブジェクト、2500以上のアニメーション、312キャラクタ外観を持ち、2〜6人の複数シーンを deterministic に再生する。出力は動画だけでなく、各 frame の entity/camera 状態、空間関係、instance segmentation、event の開始・終了境界まで保持する。

著者らはまず、GPT-5 を Concept、Casting、Episode Placement、Setup、Screenplay、Scene Detail の6段階で動かす標準的な staged pipeline を作った。各段階に構造化出力と最大3回の再試行を入れ、その場で必要な capability registry も prompt へ渡したが、50試行で実行成功は0件だった。45件は graph まで完成したものの、action ID の微妙な誤りが8件、立っていない人を再度座らせるなどの状態違反が21件、対応する物が無い場所での action、拾っていない物を置く object lifecycle 違反が5件と、局所的にもっともらしい選択が蓄積状態と衝突した。最大3800行程度の明示ルールを渡しても解けないので、問題は「説明を増やす」ことではない。

提案系は責務を分ける。LLM の Director は世界の capability をページ単位で探索し、キャストとシーン構成を決める。Scene Builder はシーンごとに隔離された context を受け、現在の姿勢、所持物、場所を見ながら、backend が返す「今ここから可能な続き」だけで action chain を作る。排他オブジェクトの capacity、Give/Receive の同期、TakeOut→Use→Stash の不可分な手順、時間制約の cycle 防止は、30以上の validated tool と stateful backend が強制する。chain は transactional で、commit 前の失敗した探索は graph に残らない。この構成で budget tier の Claude Haiku 4.5 を使い、25件中20件（80%）が end-to-end 実行に成功した。

■ 内容分析
この研究で最も強いのは、「LLM の誤り率を下げる」と「不正な操作を表現できなくする」を区別した点である。後段 validator は完成物のどこかを直せるが、状態依存のイベント列では、1ノードの修正がそれ以降の前提を崩し、backtrack cost が大きくなる。ここでは tool の選択肢自体を現在状態に応じて変え、無効な出力を後から掃除せず、書き込み時に止める。これは prompt engineering よりも API/state-machine design の効果を測った研究と読むべきである。

評価も実行成功率だけではない。GTASA corpus の元 graph から自然言語説明を作り、その文だけを見た agent が新しい graph を再構成する往復試験にしている。実行成功20組で、action F1 は 0.85±0.15、参加 entity まで一致させると 0.83±0.18（同種の random graph は0.55±0.21）、場所まで含めると0.63±0.39（random 0.35±0.30）、actor ごとの連続 action bigram は0.77±0.21（random 0.43±0.21）だった。場所の分散が大きいのは、入力文が教室と書かなかった5件で location F1 が0になったためで、中間表現の欠陷と言語 channel で失われた情報を分けて説明できている。

ただし、「valid by construction」は「必ず映像が完成する」と同義ではない。失敗した5件の graph も backend 上は有効で、engine に受理された後に runtime crash/stall し、retry を使い切った。また、0/50 と20/25は異なる model・architecture・tool layer をまとめて変えた比較で、tool 別や transaction 別の ablation はない。自由な人間の指示ではなく source graph から作った seed text が中心で、reconstruction は成功した20件だけの集計である。過去の GTASA 研究における「engine 動画の69%を人間が物理的に有効と判定」という数字も、今回 agent が作った20本の直接評価ではない。実行可能性、物理的な自然さ、物語の良さ、ゲームとしての面白さは別の gate である。

■ 自分達の環境への適用
自分達が取り入れるべきなのは GEST そのものより、「生成用 API を、ゲームの現在状態が許す affordance だけを返す transactional editor にする」という境界設計である。小型ゲームなら、wave、tutorial、NPC 行動、cutscene を共通 event graph に落とし、node に actor/action/object/location、precondition/postcondition、開始・終了条件を持たせる。LLM に JSON 全体を書かせず、`list_valid_actions(state)`、`begin_chain`、`append_event`、`commit`、`rollback`の小さな tool だけを渡す。headless 側は同じ graph を seed 固定で再生し、未定義 action、到達不可能状態、循環依存、資源二重使用を commit 前に拒否する。

最初の probe は1種類の tutorial/wave に限定できる。人間が作った canonical graph から、場所や順序の情報を段階的に抜いた指示文を作り、それぞれを直接 JSON 生成と tool-constrained 編集で複数回再構成する。測るのは parse 成功ではなく、commit 可能率、headless 完走率、event/ordering F1、初回 divergence frame、repair 回数、tool call 数である。その上で、「完走するが退屈」を検出する従来の体験評価を別に置く。これなら実行仕様の強さと、面白さを不必要に混ぜずに済む。

記憶システムにも同じ分離が使える。LLM が lifecycle frontmatter 全体を書き換えるのではなく、現状から許可される遷移だけを command として公開し、fingerprint、evidence、duplicate index を backend が検査する。今回の Phase 3 handoff のような「選定時状態から変わっていたら invalidate」や「Slack receipt と candidate/staging evidence が揃うまで handled にしない」は、まさにこの設計の小型版である。

■ メリット・デメリット
メリットは、無効な中間成果を後から修正するのではなく、無効な遷移そのものを禁止できること、同じ graph から可視化・headless 再生・回帰テスト・証跡収集を行えること、世界の全ルールを context に詰め込まず安価な model でも実行可能性を上げられることである。結果が graph と trace で残るため、失敗を「LLM が変なことをした」で終わせず、schema、state transition、engine runtime、体験品質のどこで壊れたかに分解できる。

デメリットは、表現力が tool schema と既存 engine asset に閉じること、backend のルール漏れがそのまま「合法な失敗」になること、validator と simulator の二重保守が必要なことである。また、可能な action だけを返す設計は実行失敗を減らす一方、偶然の逸脱やデザイナがまだ記述していない新しい遊びも探索空間から消す。制約の強さを面白さと取り違えず、schema を広げる authoring 経路と、安全に実行する production 経路を分ける必要がある。

■ 判定
部分採用。GEST の大きな映像基盤は移植せず、状態依存の validated tools、transactional commit、deterministic replay、実行可能性と体験品質を分ける評価だけを、1つの tutorial/wave probe で導入する。ベースラインの統制不足と agent 生成物の直接人間評価不足があるため、80%をそのまま一般化しない。

■ URL
https://arxiv.org/abs/2604.10383
