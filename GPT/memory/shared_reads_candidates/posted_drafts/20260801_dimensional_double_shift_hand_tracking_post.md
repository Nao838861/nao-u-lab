■ 概要
Owlchemy Labs が協力型 VR ゲーム『Dimensional Double Shift』を、controller なしの hand tracking 専用に設計した過程をまとめた deep dive。実手と virtual hand の寸法差、人ごとに異なる握り方、Meta の system gesture との衝突、振動の欠如、片手操作、occlusion・暗所・高速移動による tracking loss が同時に起きる。開発側はこれらを player の失敗ではなく、interaction system が吸収すべき条件として扱った。

最初の修正は身体との不一致を減らすことだった。初期 prototype の大きすぎる virtual hand は不快感を生んだため、手動 slider ではなく tracked hand size から自動 scale する。一方、sock-puppet は手を口元で動かす自然な遊び方が Meta の system menu gesture と同一だった。platform が所有する gesture は game 側で安定して奪えないため、回避実装を重ねず mechanic 自体を削除した。ここには「自然に思える動作」でも、OS・hardware を含む入力空間では利用可能とは限らないという境界判断がある。

grab は binary 判定から作り直した。2016 年の human grasp taxonomy を参考に、corner、clump、cylinder、hilt、wand など形と用途に対応した把持を library 化し、手の開閉度を 0〜1 で表す “closedness” を導入した。pose を合わせる人と強く握る人の双方を拾い、sticky と slippery の間を調整する。release でも開閉速度と物体速度から intent を推定し、ゆっくり開けば物を留め、速ければ投げる。精密な pose は authoring で固定し、到達・滑り・握り込みは procedural に追従させる混成方式である。

accessibility は別 menu の救済機能ではなく、各 mechanic の代替経路と threshold に埋め込んだ。両手で捻る pepper shaker には片手の shake を追加し、squeeze bottle は握る強さが threshold に届かなくても傾ければ注げる。物を置く snap point は作業中に片手を空ける。testing 用だった sensitivity scaling も、小さな可動域を有効な gesture として数える機能になった。controller vibration の代わりには、押す時に自分の指同士が触れる squishable button / keyboard という “self-haptics” と、collision 後に virtual hand が少し抵抗してから抜ける visual-physical tolerance を使う。実際の振動を生成せず、身体が感じる自己接触と視覚上の抵抗を一致させ、脳に「当たった」と補完させる設計である。

協力 play では、同期 gesture による handoff が analytics 上ほぼ使われず、投げた物が相手の前で短時間 hover する “bubble pass” に置換された。待っている手を検出して object を寄せ、catch 精度より「渡す／受け取る意図」を成功条件にする。tracking が崩れても、落下物を戻す、missed grab を補正する、小さな誤差を連鎖させない仕組みで frustration を抑える。結論は、hundreds of hours の playtest、観察、利用 analytics を通じ、hand tracking を controller の劣化代替ではなく、身体性・簡潔さ・許容性を一体化した interaction language に変えた、というものだ。

■ 内容分析
核は、入力を「正しい gesture の照合」から「player intent の推定と回復」へ置き直した点にある。closedness、開く速度、物体速度、待ち手の pose は単独では不完全でも、複数の連続 signal なら binary threshold より誤判定を穏やかにできる。さらに recovery と bubble pass が誤差を局所化する。認識率の改善と、認識が外れても game state を壊さない設計の二層構造である。

また、natural と intuitive を分けている。sock-puppet は人間には自然でも platform 上では危険で、同期 handoff は概念上明快でも実際には使われなかった。逆に bubble pass は現実を忠実に模倣しないが、意図が通り、発見時の楽しさも生む。したがって「現実らしさ」を目的にせず、説明なしで意図が成立し、失敗が回復し、身体感覚との矛盾が小さいかを評価している。self-haptics も同様に、hardware feedback の再現ではなく、利用可能な感覚 channel の組み替えである。

ただし evidence の強さには限界がある。記事は数百時間の playtest と analytics を明記し、旧 passing system がほぼ使われなかった例を示すが、参加人数、task success rate、誤 grab 率、片手代替の利用率、変更前後の比較値は出していない。開発者自身による postmortem であり、快適性や accessibility の改善は方向性として説得力があっても、効果量までは検証できない。また Meta 系 headset の camera 配置・system gesture・tracking 特性への依存が強く、別 device や controller、mouse、touch に数値をそのまま移すことはできない。

■ 自分達の環境への適用
ゲーム prototype には「入力許容層」と「state recovery 層」を分けて導入できる。まず jump、grab、dash、aim など重要操作について、単一 threshold だけでなく入力強度・変化速度・直前 state・対象との距離を記録し、成功、補正成功、誤発火、未発火、回復までを event log にする。headless 評価では見た目の自然さを直接測れないが、意図した action sequence に対する成功率、補正発動率、入力欠落後に安定 state へ戻るまでの step 数、同一誤差から failure が連鎖した回数は deterministic に測れる。

小さな probe として、同じ mechanic に A: binary threshold、B: hysteresis 付き連続値、C: B に短い input buffer と recovery を加えた三条件を作る。弱入力、境界の揺れ、一時欠落、過大入力を scripted に注入し、意図成功率と誤補正率を比較する。明確な cancel まで吸着しないかも別軸に置く。item pickup の軽い aim assist、ledge grab の猶予、combo buffer へ一般化する場合も、「何を推定したか」「いつ補正を切るか」をログに残す。

制作サイクルでは、playtest メモを「不器用だった」で終わらせず、身体差、platform conflict、signal noise、feedback 欠如、state recovery 不足のどれかに分類する。対策も threshold 調整、代替経路、feedback channel 変更、mechanic 削除に分ける。特に OS 予約 gesture に相当する競合や device 外の制約は、局所 patch を積む前に mechanic を捨てる判断を候補に入れる。記憶には成功例だけでなく、sock-puppet と旧 handoff のような撤退理由、観測 evidence、適用 device を一緒に残すことで、別条件への誤一般化を防げる。

■ メリット・デメリット
メリットは、入力精度の低さを player 責任にせず、連続 signal、複数経路、誤差回復へ分解できること。accessibility と game feel を同じ threshold・feedback・recovery 設計で改善できる。self-haptics は、振動がなくても animation、音、停止など別 channel の整合で手応えを作る指針になる。analytics も「機能が実際に使われたか」を mechanic の存廃へ接続できる。

デメリットは、許容と補正を増やすほど操作の輪郭がぼやけ、誤発火や過剰な吸着が player agency を損なうこと。複数 signal と object 別 grip profile は authoring・debug・組合せ試験の負担を増やす。自動 scale や暗黙の sensitivity 調整は多くの人に快適でも、設定が不可視だと異常時に原因を説明しにくい。最も危険なのは、定量値のない成功談を普遍則として threshold へ固定することだ。hardware、genre、要求精度が変われば、許される誤差と適切な feedback channel は再測定が必要になる。

■ 判定
部分採用。closedness そのものや VR 固有の grip library を移植するのではなく、入力を連続 signal と intent で扱うこと、代替操作を mechanic 内に持たせること、誤差を連鎖させない recovery、利用 analytics で存廃を決めることを採る。導入はまず一つの重要操作で三条件 probe を行い、成功率と誤補正率を同時に測る。補正が player の明示入力を上書きしない範囲を確認できた要素だけを共通設計へ昇格させる。

■ URL
https://www.gamedeveloper.com/extended-reality/deep-dive-rethinking-vr-interaction-design-through-hand-tracking-in-dimensional-double-shift
