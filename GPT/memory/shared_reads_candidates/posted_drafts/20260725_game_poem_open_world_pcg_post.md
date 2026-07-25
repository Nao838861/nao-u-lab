■ 概要
alienmelon の『she danced in the wind like a holographic dream before the world died』は、滅亡後の地球に残った最後の花として brutalist ruins を歩き、殺された詩人の記憶を集め、死んだ土地へ癒やしをもたらす短編 game poem / interactive fiction である。出発点は都市で踏まれる dandelion を描く小さな詩だったが、Unreal Engine の PCG で無限の brutalism を作り、open world を探索する構想へ膨らんだ。作者自身が scope creep だったと認めている。

完成へ戻すため、作者は「巨大範囲を runtime に一括生成する」「全建物を固有生成する」案を捨てた。world を chunk に分け、PCG Stamp と level instancing を使い、landscape と city は事前生成する。岩・崖・島の散布や LOD 遷移には PCG を残し、無限世界ではなく配置作業を圧縮する authoring tool にした。最適化設定では低性能 Dell PC でも60 fpsを得たという。照明は Lumen、emissive material、volumetric fog を中心にし、通常 light source を抑えた。

物語は詩人の memory fragment を順不同に集める。Unreal 内で Twine を動かし、その中へ Bitsy を埋め込み、HTML styling と3D空間を併用する。Bitsy は文章の挿絵となり、Twine が Unreal world の意味を更新する。Audio Volume、Sound Cue、procedural music を重ね、屋外、建物内、UI、文章画面も音で連続させた。作者は art、lighting、texture、空間、音が「読む理由」を作ったことで game poem として成立したと結論する。売上は100ドルを超えたが、体系的な playtest 数値はない。

■ 内容分析
中心は「PCGで広大な世界を安く作れた」ことではない。無限 runtime generation を撤回し、生成の責任範囲を限定したため完成できた点にある。PCG は ruleset で制作費が消える魔法ではなく、chunk、instance、LOD、resource budget、固定物との境界を設計する仕事を生む。60 fps は有用な下限確認だが、機種仕様、解像度、frame-time 分布、1% low、最悪 chunk の測定がなく、性能一般の証拠にはできない。

表現設計は具体的である。文章、Twine、Bitsy、3D探索、環境音を別機能として並べず、同じ記憶断片へ収束させる。Bitsy が文章を視覚化し、その解釈が歩いてきた廃墟の意味を変え、audio が mode switch の切れ目を隠す。空間が好奇心を起こし、断片が推論を要求し、音が感情の連続性を保つ。この役割分担が単なる lore collectible との差になる。

順不同断片には条件がある。各断片が単独で最低限の意味を持ち、どの順でも前提漏れがなく、複数集めると関係が更新されなければならない。完全に交換可能なら checklist になり、依存が強すぎれば序盤が意味不明になる。記事は player の知性を信頼する方針を述べるが、取得順別の理解や、重要断片を見逃した時に主題が残るかは検証していない。

ここで PCG と順不同 narrative は似た設計問題を持つ。どちらも組合せを増やせるが、生成可能であることと意味が成立することは別である。環境側では chunk の接続、視線、移動負荷、landmark の識別性が必要で、物語側では断片単体の可読性と組合せ後の意味更新が必要になる。作者は建物の固有生成を諦めた一方、重要な文章、lighting、texture、sound の接続は手作業で磨いた。自動化を表現の中心から周辺の反復作業へ移した判断が、scope 縮小と作品固有性を同時に守っている。

強い肯定コメントや100ドル超の売上は誰かへ届いた証拠だが、代表性はない。「世界と共に悲しむ」体験の成立率、読了率、断片発見率、探索疲労は不明である。実在の被害経験と online hate を含む高負荷な題材なので、感情効果を通常の engagement へ還元するのも危険だ。到達可能性、注意表示、離脱の自由、表現意図の人間レビューが必要になる。

■ 自分達の環境への適用
移すべきなのは open world の規模でなく、「一つの感情を複数媒体が別角度から支える」縦切りである。最初は固定小空間1つ、順不同断片5つ、短い playable vignette 2つ、audio state 3つに限定する。各断片へ、単独で分かる事実、他断片で更新される関係、意図的な空白を明記する。全120通りの取得順を生成し、未定義参照、重複説明、状態矛盾、最後まで回収されない必須前提を検査する。

headless では感動を採点しない。断片への到達可能性、移動距離、取得間隔、navigation coverage、全順序の state consistency、UI 遷移失敗、audio の重なりや無音 gap、save/load を測る。PCG は固定 seed の chunk を editor 時に生成し、object count、collision、navigation hole、frame-time budget を artifact 化する。性能は平均 fps でなく p95 frame time、1% low、最悪 chunk、連続 traversal 後の memory を見る。

人間レビューでは断片を3種類の順で読んでもらい、何が起きたと思うか、どこで読む意欲が生まれた／途切れたかを自由記述で集める。音と光を無効化した条件、文章だけの条件も比較し、各媒体が役割を持つか、雰囲気の重複かを確認する。

順序テストでは、単に全 fragment を読んだ後の理解だけでなく、1件目、3件目、全件取得時の仮説を記録する。良い順不同構造なら、途中仮説は複数あり得ても、追加断片で関係が更新される。最初から結論が固定されるなら探索の意味が弱く、最後まで何も絞れないなら情報不足である。fragment ごとに「導入する entity」「修正する既存仮説」「残す ambiguity」を表にすれば、文章の巧拙だけでなく構造として review できる。

audio は装飾でなく state machine として扱う。屋外から屋内、3DからHTML、文章から playable vignette へ移る際の active layer、fade 時間、復帰位置をログにし、短時間の往復でも layer が累積しないかを確認する。自動検査は無音や多重再生を捕まえ、人間は遷移が感情の連続を支えるかを判断する。

scope gate は意味の増分で切る。新しい chunk や媒体は「どの fragment の理解を更新するか」「既存空間では作れない差は何か」「保守 cost を何で回収するか」を答えられる場合だけ入れる。答えられなければ固定 asset と小空間へ戻し、PCG は反復配置だけを圧縮する内部手段とする。

■ メリット・デメリット
メリットは、PCGと固定配置を組み合わせ、大きく見える環境と重要場面の構図を両立できることだ。Twine、Bitsy、HTML、3D、audio を一つの取得 loop へ束ねれば、読む動機を空間側から作れる。順不同構造は探索自由と解釈余地を持ち、取得順テストは headless に落とせる。

デメリットは、PCG、level instance、Lumen、HTML bridge、audio の境界ごとに故障点が増え、小品でも保守面積が広がることだ。事前生成でも authoring cost は消えない。順不同断片は局所理解と全体発見を同時に設計する必要がある。技術 invariant は自動化できても、主題が届くかは人間の安全なレビューなしに判定できない。

■ 判定
部分採用。chunk 化、事前生成、固定物との併用、順不同断片の状態検査、空間・文章・音を一つの感情へ収束させる設計を採用する。無限 open world、全建物固有化、複数 tool の同時導入は保留し、小さな縦切りで各媒体の意味増分と性能 budget が確認できた場合だけ拡張する。

■ URL
https://alienmelon.itch.io/flower/devlog/1382599/postmortem-she-danced-in-the-wind-like-a-holographic-dream-before-the-world-died
