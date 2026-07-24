■ 概要
retro sci-fi puzzle / arcade game『Cosmic Hero 2 Prologue』の作者が、公開後の YouTube playthrough を見て onboarding 仮説の崩れを整理した postmortem。作品は HUD も score もなく、起動後すぐ世界へ入り、目的と mechanics は play から発見する設計だった。Sokoban 由来の操作なら8-bit Atari に慣れた想定 audience には通じ、8 map の短編なら多少難しくても挑む、と考えていた。しかし主人公と目的が分からず、manual を読まない player は core mechanic も掴めなかった。

強い反証は2～6分の playthrough である。最初の3 mapで止まる例があり、第1 map冒頭の laser barrier を開けられず、main area へ入る前に離脱した。短い全長は我慢の理由ではなく、導入を圧縮して spike を早めていた。作者は序盤を10～12 mapへ広げ、最初の10～20分は滑らかに難度を上げ、前より簡単な breathing map も挟むべきだったと振り返る。

第5 mapの laser redirect では、beam を turn block で曲げる発見に、blaster の手動起動、自由に動く block、進路を開く puzzle、次 section 用の余分な block を同時に置いた。改善案は、最初は switch を外し、piece を crate で固定し、一つの明白な行動だけで redirect を目撃させ、その後に switch、可動 block、puzzle を足すことだ。

さらに8 map中7 mapに secret があり、全発見せず完走すると end screen で再挑戦を促す。初回は存在も明示しないため、player は周回方針を選ぶ前に事実上二周を要求される。記事の結論は、初見では目標、操作、障害、結果予測を同時に解かせず、一つの行動と結果に分けること。難度には呼吸を入れ、replay は後出しで義務化しないことだ。

■ 内容分析
価値は「tutorial を置け」ではなく、三つの仮説が別々に崩れた点にある。genre familiarity は、作品固有の barrier 解除条件や目的を説明しない。短い作品でも、player が直面するのは現在の停止なので friction は割り引かれない。発見学習も、結果をどの操作へ帰属すべきか曖昧なら、探索空間を増やすだけになる。

laser redirect は cognitive load を「同時に仮説を立てる可変要素数」として示す。電源、block の位置・向き、通路、余分な部品が同時に可変なら、失敗後に何を戻すかも分からない。crate で piece を固定するのは反実仮想を一つに絞り、beam が曲がった原因を帰属可能にする。その後に自由度を解禁すれば、発見済みの因果を使う puzzle になる。discovery と mastery を同じ場面で試験しない分離である。

breathing map は易しい filler ではない。新要素を足さず既知 mechanic だけで解ける map は、player には回復、制作者には習得確認になる。ただし difficulty graph は概念図で、clear time、retry、離脱率を測った controlled test ではない。10～20分や10～12 mapを普遍的閾値にはできない。

証拠は数件の公開動画で母集団を代表せず、短時間終了の理由も難度、録画都合、興味、操作環境に分離できない。改善版との A/B test もない。friction を消しすぎれば HUD なしの発見性まで失う。採るべきなのは常に簡単にすることではなく、導入変数を固定し、観察可能な因果を作り、初見 trace から仮説を更新する方法である。

secret の問題も informed choice の欠如にある。最後に未達成を告げると初回方針を選べない。replay value は二周目に異なる目的や技術が生まれるかで評価し、存在と未発見数を任意目標として示せば self-selected challenge に変えられる。

■ 自分達の環境への適用
prototype の最初の10分を level 単位ではなく、player が解く未知変数で分解する。各 scene に、目的、使用可能 action、新 object、変化する rule、失敗時の復帰、任意 goal を記録し、初回導入では新しい因果を原則一つにする。これは文章 tutorial を必須にする規則ではない。最初は環境を固定し、唯一の有効 action を取ると視覚・音・state change が同時に返るようにし、次の scene で自由度を一段だけ増やす。説明なしを維持するなら、なおさら結果の帰属可能性を強くする。

headless では開始 state から progress action 数、不可逆 action 数、distractor 数、最短 path、再試行までの step を算出する。mechanic M の初回 scene は最短 trace が短く、未知のまま破綻する不可逆 branch がなく、次 scene には M を意図して使う trace があることを fixture にする。

人手 test では recording と input log を同期し、見回す、同じ操作を反復する、menu を探す、開始地点へ戻るといった repair behavior を記録する。停止時の仮説、期待、実結果を聞き、time-to-first-progress、誤仮説、失敗反復、初見完了、mechanic 再実行率を分ける。少数 trace は原因仮説に使い、採用は改善版の再試験で決める。

difficulty curve は平均値一本でなく、導入負荷、execution 負荷、planning depth、失敗損失を別々に見る。新 mechanic の直後に新要素なしの consolidation scene を置き、そこで失敗するなら前の発見が定着していない。breathing scene の役割を「易しくする」ではなく「既知 rule だけで成功を再現させる」と定義すれば、作品の鋭さを失わず pacing を整えられる。secret は序盤で存在と任意性を知らせ、初回完走を塞がず、二周目に新しい route や mastery が生じる場合だけ replay goal として残す。

■ メリット・デメリット
メリットは、初見離脱を抽象的な「難しすぎた」ではなく、同時に未知だった変数と最初の誤仮説へ分解できること。固定された初回遭遇から自由な応用へ段階化すると、発見の快感を残しながら因果の読み違いを減らせること。headless contract と input trace を組み合わせれば、level 改修で入口を再び塞ぐ regression を検出できること。breathing scene を習得確認として設計すると、pacing と評価を同じ content で兼ねられること。secret の任意性を早く示せば、replay を強制せず自発的な mastery goal に変えられる。

デメリットは、「一度に一要素」を字義通り守ると導入が細切れになり、驚き、探索、世界の密度を損なうこと。progress action 数の少なさは明快さの proxy でしかなく、面白さを保証しないこと。少数の動画 trace は強い異常検知にはなるが離脱率の推定には使えず、声の大きい失敗例へ過適合しやすいこと。最初の10～20分や10～12 mapを固定 rule にすると、作品尺や audience の違いを無視すること。secret の事前提示も、未知の発見そのものを価値にする作品では報酬を弱め得るため、存在、位置、報酬のどこまでを知らせるかは分けて決める必要がある。

■ 判定
採用。初見 trace から designer 仮説を反証し、mechanic discovery と mastery を分離し、初回遭遇の可変要素を固定する方法は小さな prototype でも即時に試せる。導入を一律に易しくすること、10～20分を絶対視すること、少数動画を母集団評価に使うことは採らない。次の probe では一つの mechanic を「固定された観察」「一変数の操作」「自由な応用」の3 sceneに分け、input trace と短い事後質問で因果理解が移ったかを測る。

■ URL
https://pazur3d.itch.io/cosmic-hero-2-prologue/devlog/1375110/postmortem-the-negatives
