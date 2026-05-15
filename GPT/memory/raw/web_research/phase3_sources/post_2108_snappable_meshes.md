出典: https://arxiv.org/abs/2108.00056

■ 概要
対象は Rafael C. e Silva らの “Procedural Generation of 3D Maps with Snappable Meshes”。3D マップ生成を、完全自動の地形生成ではなく「人間が作った 3D mesh piece を、視覚的に分かる connector 制約で組み合わせる」問題として定式化している。出発点は、PCG が複雑になるほどデザイナーが挙動を信頼しにくくなり、生成結果を制作フローに入れにくくなるという実務上の摩擦。そこでこの手法は、デザイナーが部屋、通路、段差、広場などの mesh piece を作り、それぞれに接続点を置く。connector には向き、pin 数、色があり、pin 数の差分許容、色の互換行列、片方向/双方向互換、重なり禁止、piece 間距離などを generation parameter として指定する。生成器は開始 piece を置き、既存 map 上の guide piece と候補 piece の connector を照合し、条件を満たす組だけを snap していく。探索は backtracking なしの greedy な手続きで、合わなければ maxFails まで別候補を試し、guide piece を selection method に従って変える。

論文の中核は、生成の「知性」をブラックボックス探索に寄せず、制約を asset 側に埋め込む点にある。selection method は arena / corridor / star / branch の 4 種を示し、開始 piece や次の guide piece の選び方を変えることで、密集した arena、細い corridor、中心から腕が伸びる star、既存部分から枝分かれする branch という異なるレイアウト傾向を作る。つまり同じ部品集合でも、選択規則と connector ルールを変えるだけで設計意図の違う map を出せる。Unity prototype では inspector から piecesList、starterList、matchingRules、pinTolerance、colorMatrix、pieceDistance、checkOverlaps、selection method 固有パラメータを指定でき、生成ログも出る。これは「なぜこの piece が置かれたか」を追えるようにするためで、論文は designer-centric / explainable PCG として位置付けている。

評価は単一のスコア最適化ではなく、case study と navigability validation の組み合わせ。生成 map 上にランダムな navigation point を置き、Unity navmesh の path finding で点同士が到達可能かを見る。指標は、全 pair のうち通れる割合 c と、最大の fully-navigable region が占める相対面積 Amaxr。論文は navigation point 数を変えた検証、Benchmark/Artistic scene、Trinity という multiplayer game での利用例を通じて、生成と検証が高速で、generate-and-test loop に入れられることを示す。結論は、snappable meshes は汎用的な「良いマップ保証器」ではなく、デザイナー製部品・視覚制約・即時検証をつなぐ 3D level prototyping の枠組みだというもの。良い piece がなければ良い map は出ないし、navigation 以外の面白さや戦術性は別途評価する必要がある。

■ 内容分析
この論文の価値は、PCG を「AI が map を考える」方向に進めず、「人間が作った部品の接続可能性を機械が高速に試す」方向に寄せた点にある。生成器は派手ではない。むしろ backtracking しない greedy algorithm なので、早い代わりに局所的な行き止まりや弱い構成を作る。しかしその単純さが、制作中の制御性と説明可能性につながっている。デザイナーは、部品の形、connector の色、pin 数、selection method を変えれば何が変わるかを比較的直感的に読める。これは「ランダム生成を入れたら意図しないものが出る」という不信を下げる。

もう一つ重要なのは、評価を「生成した/しない」で止めず、歩行可能性という制作上の最低条件へ戻していること。Amaxr は、マップ全体が完全でなくても「最大の遊べる領域が十分大きいか」を見る指標なので、プロトタイピングでは使いやすい。完璧な map を一発で選ぶより、速く多数生成し、閾値を満たす候補だけ人間が見る設計に向いている。

一方で、論文自身も限界をかなり明確に書いている。部品設計が悪いと出力も悪くなる。空間的な先読みがないため、loop 構造やきれいな閉路を確実に作るには弱い。navmesh 上のランダム点は rooftop や本来歩かせたくない場所に置かれることがあり、屋内や中空 piece では valid movement zone の metadata が必要になる。Unity prototype は jump を扱わず、navigability 以外の cover ratio、target visibility、危険地点、難易度などは未評価。したがって、この手法を「完成レベルを自動で作る技術」と読むと過大評価になる。正しくは、手作業 asset と自動探索の境界を小さく保ち、生成結果をすぐ見て直すための制作補助である。

■ 自分達の環境への適用
Nao_u_BOT の小型ゲーム制作では、まず 2D/3D を問わず「部屋」「通路」「遮蔽物」「高低差」「入口/出口」「イベント置き場」を piece として扱い、各 piece に connector と metadata を付ける形に落とせる。完全な map generator を作る前に、手作りの良い部品を 8-12 個だけ用意し、connector 色を「通路」「広場」「危険区域」「報酬区域」のように意味づける。Phase 3b/4a の probe としては、生成 map ごとに到達可能率、最大到達領域、重要地点間の path 長、視線/遮蔽の簡易指標を保存し、プレイテスト前に「歩けるが単調」「分断される」「目的地が遠すぎる」を検出するのがよい。

記憶システム側では、map piece を単なる asset ではなく、制作判断の atom として残せる。たとえば「この connector 色は探索導線用」「branch selection は寄り道を増やすが迷いやすい」「pieceDistance を広げると島化する」のように、生成パラメータと失敗例を対にして保存する。LLM に map を丸ごと作らせるより、LLM には piece 仕様、connector 命名、検証 rubric の提案をさせ、実際の組み合わせと検証は deterministic な generator に任せる方が安定する。

■ メリット・デメリット
メリットは、既存 asset を活かしながら短い生成・検証ループを作れること、デザイナーが制約を視覚的に理解しやすいこと、生成失敗を piece/connector/selection method のどこに戻せばよいか分解しやすいこと。デメリットは、部品制作と metadata 付与の初期コストがあり、生成器だけでは面白さを保証しないこと。greedy なので複雑な構造や意図的な伏線配置には弱く、navigation 以外の評価指標をこちらで足す必要がある。

■ 判定
部分採用。完成 map の自動生成器としてではなく、手作り部品を制約付きで組み替える prototyping harness として採用する。まずは小規模 piece set、connector 命名、到達可能性検証だけを作り、面白さ評価は別 probe に分ける。
