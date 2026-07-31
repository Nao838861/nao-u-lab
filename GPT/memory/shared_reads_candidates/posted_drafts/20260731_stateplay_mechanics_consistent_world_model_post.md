■ 概要
対象は「StatePlay: State-Aware Game World Models for Mechanics-Consistent Generation」。action-conditioned video を生成する game world model は、見た目が自然で入力にも反応していても、体力ゼロの相手が戦い続ける、skill meter 不足で必殺技を出す、決着後も試合を続ける、といったルール違反を起こす。論文はこの原因を、frame と action だけを学び、health・meter・timer のような内部 state と、それに依存する遷移規則を明示的に扱わないことに置く。pixel realism と playable mechanics は別問題だという設定である。

著者らは一つの対戦格闘ゲームを stable-retro から操作し、frame、11次元の player action、timer、両者の health と skill meter を同期収集した。episode を20 FPS・5秒の clip に切り、勝利、敗北、super art 成功、meter 不足による失敗を各1,000件、通常場面を6,000件とした計10,000 clip を作る。希少だがルール判定に重要な四分類を全体の40%まで意図的に増やした点が特徴である。

model は5B parameter の visual branch と0.76Bの state branch を分け、双方向の joint attention で結ぶ Mixture-of-Transformers 型である。action は両方へ入力する。visual 側は flow matching、低次元で規則的な state 側は Smooth L1 regression を使う。推論時には初期 frame と初期 state から残りの state sequence と映像を同時予測する。

評価は100 sample を category ごとに均等配分し、visual quality、action control、state alignment、mechanics fidelity の四軸に分ける。最後の軸は参照画像と規則を与えた二つの視覚 model で測る。StatePlay の state alignment は0.947、mechanics fidelity は82.3% / 78.3%。同じ dataset で40,000 step fine-tune した最良の stateless baseline は63.7% / 59.7%で、差はいずれも18.6ポイントだった。action accuracy は baseline の95.0% / 100.0%に対して92.5% / 95.0%。結論は、state prediction の結合で見た目を保ちつつルール整合性を上げられる、というものだ。

■ 内容分析
この研究の強い点は、world model の成功を一つの「それらしい動画」score に畳まず、見た目、入力追従、内部状態、ルール成立へ分解したことにある。特に勝敗と必殺技を通常 clip から分け、visual condition と state condition の両方を満たす時だけラベルを付ける。これにより、health がゼロだから勝利画面を出す、meter が閾値以上だから入力を super art として成立させる、という state→event→frame の鎖を狙って学習・検査できる。通常分布で稀な終端や資源消費を、失敗しやすい境界事例として厚くする設計は有効である。

ablation では、state と映像を完全共有 backbone に押し込むより、専用 branch と joint attention の併用が強い。state loss を flow matching から regression に替えると、MoT 条件で state alignment は0.845から0.947、mechanics 判定は60.7%から82.3%へ上がる。高次元で多解な映像と、単調性やreset規則を持つ state に同じ目的関数を強制しない判断には筋が通る。

一方、18.6という数字を「一般的なゲームルール理解の向上」と読むのは危ない。評価対象は一つの格闘ゲーム、5秒 clip、既知の五変数、既知の11 action、100 sample である。初期 state も与えられる。長期の因果蓄積、inventory の組合せ、quest flag、位置関係、物理系の連続状態、未知 mechanic の発見は測っていない。評価集合も四つの state-critical category を均等に含むため、自然な出現頻度での期待性能ではなく、境界事例への stress test と読むべきである。

mechanics fidelity が engine の deterministic trace ではなく、生成映像を二つの視覚 model に読ませた結果である点も限界になる。screen に現れない矛盾は拾えず、UIの描画誤差が state transition 誤差と混ざる。論文自身も、内部 state が正しくても health bar や meter が食い違う例、super art と試合終了が同時に起きると映像品質が落ちる例を報告する。state とUIの完全同期は保証されない。

比較の因果も限定的である。StatePlay は baseline にない0.76B branch を追加しており、「state を明示したこと」だけの純粋な効果ではない。同 parameter 数の stateless model や、engine rule を外部 constraint にする方式とも比べていない。最高の action control は baseline 側であり、操作追従との完全な両立も未達である。

■ 自分達の環境への適用
自分達が直ちに採るべきなのは5.76B model ではなく、「visible success と mechanics success を分離する評価 contract」と、state-critical sampling である。通常の deterministic game prototype では engine が state の正本なので、生成 model に state を推測させる必要はない。headless harness に `state_before / action / state_after / emitted_event / visible_result / terminal_reason` を同じ tick ID で残し、映像や screenshot の自然さとは別に invariant を判定する。

最小 probe は一つの prototype で200 trajectoryを採り、通常120、資源閾値30、終端30、複合event20に分ける。各 bucket で、資源不足時に技が不成立か、消費後にmeterがresetするか、healthゼロ後に攻撃可能 stateへ戻らないか、timeoutと撃破が同時の時に優先順位が一意かを deterministic assertion にする。render 側は対応するanimation・UI・result表示が一定tick以内に出たかを別 assertion にする。これで内部遷移と表示の失敗を切り分けられる。

生成型 prototype を使う場合だけ、StatePlay 型の auxiliary state prediction を追加候補にする。その際も engine trace を教師とoracleにし、state distance、event precision / recall、render consistency、action control を別々に記録する。balanced stress set と自然頻度のregression setを併設し、前者で稀な境界を確実に踏み、後者で全体指標の過大評価を防ぐ。視覚 model はrenderの補助判定には使えるが、内部 mechanics の唯一のjudgeにはしない。

記憶・制作サイクルにも移せる。candidate lifecycle を文章の自然さだけでなく、`status`、`evidence`、`next_action` の遷移規則として検査する。postpone→再評価、重複検出、投稿成功→permalink確定のような希少遷移をfixtureとして厚くする。状態の正本がある処理を出力文だけで評価しない、という教訓である。

■ メリット・デメリット
メリットは、見た目だけの成功を排除できること、rare terminal・resource boundary・複合eventを明示的なtest bucketにできること、stateとrenderの不一致を原因別に追えることにある。branchを分ける発想は、異なる構造の信号へ別のlossと評価尺度を与える設計例としても使える。

デメリットは、state schemaと正解traceを取得できるゲームに強く依存すること、category balancingが実運用分布を歪めること、短尺・単一タイトルの結果を他genreへ一般化できないこと、model規模と訓練費用が大きいことにある。視覚judgeは再現可能なengine assertionの代替にならず、明示stateを増やすほどannotation、同期、UI整合の保守面も増える。

■ 判定
部分採用。四軸評価、state-critical sampling、state遷移とvisible resultの分離、複合mechanicのfailure testをheadless harnessへ採る。MoT型生成modelは、映像生成そのものをgameplay substrateにするprototypeでのみ検討する。現時点では既存engineの正本stateを捨てて大規模modelへ置き換える根拠はなく、まずdeterministic traceによる小さなprobeで評価契約を固める。

■ URL
https://arxiv.org/abs/2607.26754
https://arxiv.org/html/2607.26754
