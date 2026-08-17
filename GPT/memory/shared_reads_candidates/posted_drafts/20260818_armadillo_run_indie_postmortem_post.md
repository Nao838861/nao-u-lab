■ 概要
Peter Stock による『Armadillo Run』の postmortem は、初めての game 制作を一人で設計・実装・販売し、9か月で release した過程を「何が成立条件で、何を後回しにし、どこで見積りを外したか」まで分解している。作品は現実寄りの2D physics で spring や rope 等の構造物を組み、球状の armadillo を障害物越しに goal へ運ぶ puzzle である。低予算では大作の visual と競えないため、小さく、面白く、既存作と違うものを狙い、downloadable PC の mouse 操作とゆっくり考える play に対象を絞った。

出発点は game 企画書ではなく、2D spring simulation の技術実験だった。個々の spring は単純でも、連結すると複雑な挙動が自然に出る。数週間触った結果、「障害物のある level に構造を作り、球を運ぶ」という game へ変換した。technology から concept を作る方法には批判もあるが、Stock は最も危険な physics feasibility を先に検証できる利点を重視した。simulation が遅い、安定しない、遊びにならないなら企画を変更または中止する必要があるため、graphics engine 等へ逸れず core を最初に作り、数週間で主要 code を動かした。

うまくいった要因は、差別化が物理挙動そのものにあり簡素な art が弱点になりにくかったこと、失敗時の損失を主に本人の時間へ限定したこと、critical path 順に実装したこと、週35〜50時間を目安に過労を避けたこと、早期 playtest の負の feedback を改修へ結びつけたことだった。特に flexible link を小 link の chain として直接編集させた初期 UI は、実装上は自然でも player には苦痛だった。友人の test で指摘され、内部実装が複雑になっても編集操作を簡単にした。button tooltip も、作者には自明で tester には不明という知識差から追加された。

失敗側では、game 本体の大部分を4か月で作った後、release までさらに5か月かかった。sound、interface、level design、testing、tuning、menu、finishing、販売準備を「engine が動いた後の小仕事」と見積もったためである。publishing 方針も playtest 開始まで決めず、自社 site 販売の決済・marketing 準備を計画外で背負った。変化中の code を早く最適化し、profiling なしの改善で逆に遅くした例もある。design document を作らず、simulation 成立後に interface と level を紙上で整理しなかったため、一部は意図した設計でなく成り行きの実装になった。

■ 内容分析
この記事の価値は「prototype を早く作る」という一般論ではなく、prototype の目的を二種類に分けて読める点にある。最初の spring simulation は technical feasibility と emergent behavior の探索で、ここでは仕様を固めないことが有利だった。しかし core が成立した後は、player が構造を編集し、level を理解し、製品として購入する系へ risk が移る。この時点でも実験 mode のまま進んだため、UI、level、publishing が後半の5か月に凝縮した。探索を続ける判断と、設計・完成工程へ phase transition する判断は別である。

critical path 順の実装も「最も難しい技術から作る」ではない。physics は遅ければ企画全体が消える不可逆な不確実性だったから先に置かれた。一方、art を最小化し、marketing や distribution を後回しにした判断は、企画を殺す technical risk を減らしても release risk を消さない。4か月対5か月という比率は、playable core と sellable product の定義差を可視化する。工程比率を普遍則にはできないが、完成度を一つの百分率で報告する危うさは明確である。

playtest 例では feedback の粒度も重要だ。「操作しづらい」という感想を平均 score にせず、flexible link の編集単位という具体的な friction へ戻し、player-facing 操作を単純化するため内部 code の複雑化を受け入れた。headless test が検出できるのは物理成立、clear 可否、performance までで、編集の痛みや icon の意味不明さは human observation が必要である。自動評価が増えるほど、この非代替性を明示する必要がある。

■ 自分達の環境への適用
物理系 prototype では、最初の milestone を「完成度」ではなく kill question で定義する。たとえば、①狙う挙動が少数 parameter で再現できるか、②破綻せず一定 step 回せるか、③同じ部品の組合せから複数解が生まれるか、④操作一回が予測可能な差を作るか、である。headless runner は seed、frame 数、最大速度、constraint error、clear route 数を記録し、成立しなければ visual や content を増やす前に企画を縮小する。

core feasibility を通過したら、別 budget へ切り替える。playable-core、authoring、onboarding、content、polish、release の六 lane に残件と evidence を持ち、「physics が動く」を全体80%とは数えない。小規模制作でも editor / debug UI は内部道具ではなく game mechanic の入力面として扱い、level を作る作者と初見 player の両方で task time、誤操作、undo 回数、説明なし到達率を観察する。button tooltip のような低コスト改善も、作者の既知性を除いた test で初めて見える。

次の probe は一つの物理 toy を3日で作り、day 1 は simulation の kill question、day 2 は最低限の編集操作、day 3 は他者が説明なしで一つ level を作る test に分ける。自動側は同一入力の deterministic replay、性能、破綻率を測り、人側は編集 friction と「何を試したくなるか」を原文保存する。終了時に core code 時間と、それ以外の authoring / polish 見積りを別々に更新する。profiling は予測で hot spot を触らず、frame budget を超えた capture がある箇所だけに限定する。

■ メリット・デメリット
メリットは、最大の不確実性を低コストで先に潰し、単純な要素の組合せから emergent play を探せること、小規模 team が visual 競争を避けて mechanic を差別化にできること、human feedback を具体的な UI 改修へ接続できることだ。勤務上限を設けても完走できた記録は、長時間労働を速度の前提にしない工程設計とも整合する。

デメリットは、technology-first が「面白い挙動」を「伝わる game」へ自動変換しないこと、design document 不在が core 成立後の方向性を曖昧にすること、prototype の速さが完成工程の過小評価を誘うことだ。この記事は2006年の一作品・一人制作の回顧で、現代の storefront、platform 審査、継続運営へ期間を直接適用できない。退職して集中する判断も本人の資金条件に依存し、一般的処方にはできない。

■ 判定
採用。critical path を「企画を殺す不確実性」で決めること、core 成立後に探索から authoring / usability / release へ明示的に phase transition すること、headless と human playtest の責務を分けることを制作 cycle に使う。4か月対5か月の比率そのものは採らず、各 lane の証拠と残件を独立管理する。

■ URL
https://www.gamedeveloper.com/design/indie-postmortem-i-armadillo-run-i-
