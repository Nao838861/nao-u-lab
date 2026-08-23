■ 概要
永続記憶を持つ LLM agent の難所は検索だけではない。会話で得た情報を恒久記憶にするのか、今だけ使うのか、変化する外部事実として再確認するのか、意図が曖昧なのでユーザーに質問するのかを分ける必要がある。本論文はこの memory–clarification boundary を独立の能力と捉え、MCB を提案する。

各問題は acquire context、candidate update、later reuse context で構成される。正解は四つ。persist は継続する好み・権限付き policy・安定事実、ephemeral は一つの成果物・session・期間限定の情報、verify は変化する世界状態や単発の noisy signal、clarify は指示対象・永続性・範囲・矛盾をユーザーだけが決められる場合だ。persist と弱い action が並ぶ時は弱い側を選ぶ。余分な質問は回復可能だが、誤った恒久更新は将来を静かに歪め続けるからだ。

データは primary 140 件を development 70 件と held-out 70 件に分け、さらに根拠を反転させた 35 対、70 件の contrast set を持つ。安定・一時的な好み、freshness-sensitive な事実、一回限りの修正、policy constraint、曖昧な更新、noisy failure を各 20 件含み、「always」や「today」が罠になる例も置いた。held-out と contrast の 140 件は非著者 2 人が blind 注釈し、一致率 97.1%、Cohen's kappa 0.962。不一致 4 件は第三者が裁定し、primary 8 件の著者 label が置き換わった。

評価は、四 action の label を JSON で選ぶ MCB と、memory_write / use_now / check_source / ask_user の structured call を選ぶ MCB-Act の二層で行う。Claude Haiku 4.5、Sonnet 4.6、quantized Qwen3.5-9B を bare、五ルールの policy、各 action 一例の few-shot で比較。accuracy、macro-F1、誤 persist の over-memory、persist 取り逃し、clarification / verification recall を分け、同じ 70 件上の差は paired bootstrap、exact McNemar test、Holm 補正で検定する。

結果は「変化する世界は確認できるが、曖昧な意図は聞けない」という cross-family の非対称だった。bare Qwen は freshness 18 件のうち 12 件で verify を選ぶ一方、clarify 12 件で質問は 0 件。few-shot は accuracy を 0.557 から 0.771 へ上げたが、clarification recall は 0.333 で 12 件中 8 件を逃した。policy の accuracy 増加 0.071 は有意でない一方、誤 persist は 17/70 から 7/70 へ減った。総合点に出ない安全上の改善である。

さらに「正しい方針を言える」ことと「正しい tool を選ぶ」ことは別だった。bare label と act の一致は Claude 二モデルで各 57.1%、Qwen で 22.9%。Sonnet の accuracy は 0.814 から 0.529、Qwen は 0.557 から 0.343 へ低下した。Qwen は 70 件中 54 件で use_now を選び、verification recall が 0.667 から 0.056 へ崩れた。引数はすべて形式チェックを通っており、ボトルネックは action selection だった。結論は、発言 label と実行選択を両方測り、over-memory と clarification を独立に報告すべき、というものだ。

■ 内容分析
最も有用な区別は「不確実だから verify」ではなく、不確実性の権威がどこにあるかを分けた点だ。営業時間や build の最新状態は世界を検査する。「前回と同じに」の指す対象や、一度限りの指示か恒久の好みかは本人に聞く。世界の検索 tool を持つ agent ほど、本来はユーザーしか解けない問題まで検索へ送る可能性がある。under-asking は単なる消極性ではなく source-of-truth routing の失敗と読むべきだ。

また、accuracy と action distribution を分けた評価が重要である。Qwen の policy prompt は accuracy では効果不明でも、silent corruption に直結する誤 persist を 10 件純減させた。その代わり、不確実性は主に verify へ移って clarify はほとんど増えない。一つの合計点だけなら、危険な失敗は減ったのか、別の失敗へ移動したのかが消える。memory policy は多目的な行動制御として測る必要がある。

一方で MCB-Act を end-to-end 評価と誤読してはいけない。測っているのは structured tool-call の選択と引数の関連性までで、memory への書き込み、source の検証結果、ユーザーの回答、後続 task の成否は実行していない。したがって実証されたのは label–tool selection gap であって、この四分類で長期効用が改善することではない。

外的妥当性も狭い。primary test は 70 件で信頼区間が広く、category ごとは 10 件に過ぎない。scenario と rule は著者が作り、contrast set はその rule template と強く揃っている。Qwen も 9B の一構成だけで、全 scenario が synthetic かつ英語である。実運用に合う境界 case を作るための評価設計として読むべきだ。

■ 自分達の環境への適用
第一の適用先は GPT 側 memory ingest の回帰テストである。persist は恒久ルールや確定した設計判断、ephemeral は今回の staging や一 build の診断、verify は branch・dependency・Slack pending・外部仕様の現状、clarify は対象や永続期間が不明な指示、又聞きの好み、既存 directive と衝突する指示と分ける。

ゲーム制作では長期 NPC、プレイヤーモデル、反復 playtest agent を対象にする。「遠距離武器が好き」は複数 session の安定証拠なら persist、今回だけなら ephemeral、別 build でも続くかは verify、縛りプレイだったか不明なら clarify 相当の追加観測へ回す。NPC でも世界の事実と、指示対象の曖昧さを分ける。

小さな probe は、実データから各 action 15 件、合計 60 件の日本語 fixture を作る。各件に acquire、candidate update、reuse、gold action、source-of-truth、根拠を付け、根拠だけを反転させた contrast pair も用意する。prompt 上の判断と実際の file write / current note / source check / user-input request を別に記録し、誤 persist、persist 取り逃し、verify / clarify recall、label–tool agreement を比較する。実行内容と次 session の振る舞いまで測れば、MCB-Act の未評価部分を補える。

採用 gate は総合 accuracy だけにせず、誤 persist を大きく減らしつつ、clarify を verify へ、verify を ephemeral へ誤 routing しないことにする。policy prompt だけを正本にせず、書き込み前の deterministic validator、provenance、expiry、監査 log を残す。

■ メリット・デメリット
メリットは、長期記憶の問題を recall 性能ではなく「将来にコミットすべきか」として切り出したことだ。verify と clarify の権威を分け、誤 persist と under-asking を個別に測れる。同じ item で prompt 介入を比べ、発言と structured action の不一致を追跡できる。data、blind annotation、予測、metadata、再生 script が公開され、自分達の fixture 設計に移しやすい。

デメリットは、四分類が近接状態を粗く潰すことだ。expiry 付き memory、低信頼での仮保存、複数 evidence 待ち、retrieval 時の filter は、raw history を持ちながら弱い commitment を実現できるが MCB では直接比較されない。データは小規模・人工・英語で、著者の rule と template が近い。tool は選択するだけで実行されず、ユーザーへの質問コストや downstream 効用も不明である。そのまま製品品質の証明には使えない。

■ 判定
部分採用。四境界、source-of-truth の切り分け、over-memory・clarification recall・label–tool agreement の分離計測を、日本語の memory-policy 回帰 test に取り入れる。ただし四 label を schema に固定せず、expiry・confidence・provenance と end-to-end 実行結果を追加し、誤 persist と誤 routing の両方が減るかで採否する。

■ URL
https://arxiv.org/abs/2608.19564
