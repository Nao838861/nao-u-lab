■ 概要
『Vanishing Point』は、物体の大きさと質量を変えて道を作る一人称 puzzle platformer である。2015年の USC Advanced Games Project として11か月、延べ27人、同時期17〜23人で制作され、lead designer の Kevin Wong が成功と失敗を振り返っている。狙いは、強制遠近法に近い scale 操作を核にしつつ、精神疾患を悪役化する表現を避け、知覚の状態を持つ主人公 Rose が自ら治療施設を訪れる物語を作ることだった。しかし記事の結論は、善意の社会的目標だけでは作品の thesis にならず、mechanic、level、tone、物語を束ねる精密な creative direction がなければ、避けたかった ableist な権力構造を別の形で再生産し得る、という厳しい自己評価から始まる。

制作上うまくいった第一の判断は downscope だった。複数の player ability と、それ専用の level を削り、scale と mass の単一 mechanic に集中した。全20 encounter では、物体を固定する stasis field、質量依存 button、破壊可能 mesh を組み合わせ、同じ操作の性質を段階的に展開した。400×400単位の tile editor も作り、特殊属性や texture を付けた部屋を素早く組み、変更を保存または revert できるようにした。専用 modeling を待たず level の仮説を試せた一方、空間が箱型で臨床的に見える副作用も残った。

authored puzzle では、設計者が意図しない emergent behavior が「この挙動が正解条件だ」という誤った推論を player に教える。そこで頻繁な playtest を使い、必要な情報と道具をいつ渡すか、途中進行をどう明示するかを調整した。初期には mechanic 全体が機能していないと判明し、それまでの level を捨てて根本から作り直した。結果は学習しやすく、designer が組合せを発見しやすい形になった。展示会で初見の人が遊ぶ条件に向け、UI、usability、障害のある player への accessibility も調整した。

一方、前半は tone、theme、purpose の最終決定者と制約が曖昧で、superhero origin、gritty drama、magical-girl adventure の間を揺れた。Unity から Unreal 4 へ移行して新しい lighting と Blueprint を使おうとしたが、数か月を学習と workflow 移行に費やし、探索期が第一 semester の終わりまで延びた。展示できた内容は実質的に次の一 semester で作り直したものだった。さらに core mechanic は、大規模な level production を始める前の prototype が浅く、designer に十分な創造余地があるかを検証し切れていなかった。記事が示すのは、scope を削ること、試作を深くすること、素早く戻せる道具、誤学習を観測する playtest は別々の工夫ではなく、探索の損失を安くし、単一 mechanic の実際の深さを見極める一つの制作系だということだ。

■ 内容分析
最も重要なのは、「mechanic を実装できた」と「作品規模を支える design space がある」を分けている点である。初期版は動いていても、level と追加要素を何か月も生み続ける土台としては浅かった。20 encounter を完成させた事実は mechanic の十分性を自動的に証明しない。後から downscope、全面改修、補助 object の組合せで深さを引き出したからである。着手 gate で問うべきは動作の成否ではなく、同じ操作から異なる判断を少なくとも複数作れるか、説明を増やさず新しい状況を学習できるか、失敗が情報になるかである。

playtest の役割も単なる難易度調整ではない。authored puzzle は偶然通れた経路、物理挙動、提示順の欠陥から偽の規則を学習させ、その誤解が後続 level で遅れて破裂する。clear rate だけを見ると偶然の成功を理解と誤認する。観測すべきなのは、最初の仮説、操作理由、誤った規則を確信した箇所、修正に必要だった情報である。進行の区切りを明確にするのも、正解を教えるためではなく、どの行動が世界状態を変えたかを player が因果として読めるようにするためだ。

tile editor の価値は高機能さではなく reversibility にある。level 仮説を asset pipeline から切り離し、変更を短時間で試して戻せるため、全面改修の損失を抑えた。ただし tool の表現単位は完成物の美学を固定する。400×400 tile は一貫性と速度を与える一方、boxy な見た目を生んだ。制作 tool は中立ではなく、検証速度と表現上限を交換する design decision である。

評価証拠の限界も大きい。記事は一人の lead designer による定性的な回顧で、playtest 人数、clear rate、改修前後の比較、20 encounter ごとの学習結果は示さない。完成したことや展示対応は production evidence だが、各施策の因果効果を分離した実験ではない。最大23人の学生・volunteer team、新 engine 習熟、外部委託の art pipeline、期限前の morale 低下が同時に動いているため、商用 team や小人数制作へ数値を外挿できない。ただし、失敗を「人手不足」で閉じず、曖昧な決定権、engine 選択、prototype 不足、asset 受入条件、lead の感情状態まで接続した点は、再利用可能な診断材料になっている。

■ 自分達の環境への適用
新規ゲームの着手時に、core-loop prototype gate を一段深くする。playable になった時点で量産へ進まず、同じ mechanic から判断の異なる小 encounter を3〜5個作る。各 encounter について「新しい判断」「必要な既知規則」「起き得る偽の学習」「失敗から読める情報」を一行で記録する。差分が演出、数値、配置替えだけなら design space は未確認とし、追加 system より mechanic 自体の改修か downscope を先に行う。

headless 評価は到達可否や平均時間だけで終えず、agent の action trace から仮説遷移を近似する。最初に選んだ対象、同じ失敗の反復、無関係な操作への逸脱、状態変化後の方針更新を取り、偶然 clear と規則理解を分ける。人間 playtest では発話または直後インタビューで「何が起きたと思ったか」を残す。level ごとに false-rule ledger を持ち、後続 level で破裂した誤解を、最初に教えた encounter へ逆向きに結ぶ。

制作 tool は完成 editor を先に作らず、仮説の追加、差し替え、revert、seed 固定、before/after 比較だけを最小要件にする。表現制約は明記し、boxy な blockout が最終美術へ漏れる時点を gate にする。creative direction も長文設定集ではなく、作品が player に何を感じて判断してほしいか、採らない表現、mechanic と主題の接点、最終決定者を短い constraint sheet にする。精神疾患など現実の当事者性を扱う場合は、善意や trope 回避だけで合格にせず、mechanic が誰に権力を与え、治療・正常性・成功をどう定義しているかを別レビューに掛ける。

小さな probe は既存 prototype 一つで行える。現在の mechanic から3 encounter を作り、各5 run の trace と人間2〜3人の規則説明を集める。①独立した判断が三つ生まれる、②偶然 clear を識別できる、③level 変更を10分以内に戻せる、④偽の規則が ledger から導入元まで追える、の四条件を確認する。満たさなければ level 数を増やさず、mechanic、提示、tool のどこが律速かを切り分ける。

■ メリット・デメリット
メリットは、downscope を単なる工数削減ではなく、単一 mechanic の学習可能性と組合せ深度へ集中投資する判断として扱えること、playtest を誤学習の検出に使えること、revert 可能な tool で大胆な改修を安くできることだ。prototype gate、trace、false-rule ledger を組み合わせれば、完成量では隠れる浅さを量産前に発見しやすい。creative constraint と最終決定者の明示は、共同所有を保ちながら方向性の漂流も抑える。

デメリットは、単一事例の回顧なので閾値に科学的根拠がなく、3〜5 encounter や少人数 test は局所的な安全確認に留まることだ。強い downscope は mechanic の弱さを露呈させる一方、本来必要な補完 system まで早期に捨てる危険がある。可逆性を優先した tile tool は空間表現を均質化し、trace 中心の headless 評価は物語の含意、身体性、驚き、当事者への害を測れない。social theme の評価を mechanic test に混ぜず、当事者性と表象のレビューを独立して残す必要がある。

■ 判定
部分採用。core mechanic の量産前 gate、誤学習を遡る playtest、変更をすぐ戻せる level workflow は、次の prototype から小さく導入する。記事の人数や期間を基準にはせず、独立した判断が複数生まれることと、偽の学習を導入元まで追えることを採用条件にする。主題と mechanic の整合は headless 指標で代替せず、別の人間レビューとして維持する。

■ URL
https://www.gamedeveloper.com/design/vanishing-point-postmortem
