■ 概要
Vibe Arcade の『Path Runner』は、短い指示から AI が組んだ 3 lane の browser 向け endless runner を、実プレイで遊べる形へ詰めた制作記録である。依頼は「3D 視点で前進し、障害物を避け、何かを集める」程度だったが、AI は track を segment に分け、前方で生成し後方で破棄する構造を選んだ。常時保持する segment 数を固定するため、走行距離に比例して world data が増えない。描画は WebGL や Three.js を使わず、Z 位置に応じて object を縮尺し、奥から手前へ描く pseudo-3D である。正面固定 camera という制約と引き換えに、browser canvas だけで奥行きを作った。

障害物は jump する barrier、slide する archway、lane change する rock の三種で、segment 内の配置により複合 challenge が生じる。gem は全障害物が出る危険な中央 lane に多く、extra life や score boost を買う store と結び付いた。単なる収集物を、生存を延ばすか score を伸ばすかという resource 判断へ変えた点が設計上の追加である。Forest、Ice、Cyberpunk などの theme は palette、sky、環境 geometry を交換し、生成 logic と分離した。

ただし初期出力は完成品ではなかった。高すぎる消失点は常時下り坂に見え、見た目より広い hitbox は避けたはずの player を失敗扱いにした。gem の消滅を segment 破棄に結び付けると、高速時には到達前に消える。touch input も drag を swipe と誤認したため、最低速度 threshold を追加した。さらに数か月後、AudioContext crash、欠落 method、初期 black screen が連鎖して起動不能となり、部分修理を一日試した後に全面再構築した。一度は安定した 2D lane runner に戻したが固有性を失い、再度 pseudo-3D 版を作り直した。最終的に renderer、character、skin、端末別 quality tier は刷新された一方、segment 生成と gem economy は残った。記事の結論は、AI が妥当な architecture を先回りして提示できても、公平性、視認性、入力感、保守可能性は play と再構築判断で補う必要がある、というものだ。

■ 内容分析
価値があるのは「AI が procedural generation を発明した」ことではなく、正しい大枠と遊べない局所が同時に出る様子を一つの履歴で見せた点である。前方生成・後方破棄は endless runner の標準解であり、AI の独創性の証明ではない。しかし brief に書かれていない寿命管理まで入れ、最終版でもその骨格が残ったことは、既知 pattern を初期 architecture へ引き上げる用途には効いた証拠になる。

一方、bounded なのは track data の個数であって「game 全体に memory ceiling がない」とまでは言えない。event listener、audio node、texture、object pool 外参照が漏れれば長時間 run で増える。記事には保持 segment 数、spawn 距離、seed、難易度曲線、memory profile、frame time がない。session ごとの構造的多様性も、二回遊ぶと違うという定性的説明に留まり、到達不能配置、反応時間不足、同型 sequence の偏りを検査した結果は示されない。

三障害物を異なる操作へ対応させた grammar は小さい部品数から認知判断を増やす。ただし「偶然できた複合 challenge」が良い驚きか、不公平な詰みかを分ける constraint が説明されていない。rock で lane を寄せた直後に barrier を置く例は、速度、予告距離、遷移時間次第で skill test にも不可避 hit にもなる。procedural system は variation generator であると同時に、生成可能空間を禁止規則で囲う validator が必要だ。

修正例はさらに重要である。archway の見た目の空洞を collision volume が塞ぐ問題は、geometry 上の正しさより player が予測できる輪郭を優先すべきことを示す。gem lifetime を segment lifetime から分離した修正は、object の所有権と gameplay 上の有効期限を同一視した設計ミスである。swipe の速度 threshold は誤入力を減らすが、閾値の値、端末差、取りこぼし率はない。どれも code review だけでは合格しやすく、操作して初めて failure が可視化される。

全面再構築の判断は参考になるが、一般則にはできない。「十五 iteration を約二時間半で投入」「全面 rebuild が常に速い」という印象に対し、修理案ごとの所要時間、回帰 test、変更量、再発率、以前の code が壊れた原因は公開されていない。missing method まで出た起動不能は architecture 自体より build／配布状態の破損かもしれない。興味深いのは全面廃棄の礼賛ではなく、2D rebuild が動作回復には成功しても product identity を失い、もう一度捨てられた点である。復旧速度だけを目的関数にすると、技術的成功と作品としての失敗を取り違える。

■ 自分達の環境への適用
ゲーム制作では、生成 code の初回起動を完成判定にせず、architecture gate と playable gate を分ける。architecture gate では、同時保持 segment 数、生成・破棄責任、seed 再現、theme と rule の分離を確認する。playable gate では、長時間走行、最短予告時間、lane 遷移中の不可避配置、見た目と hitbox の差、collectible 到達可能時間、touch の false positive／false negative を測る。両方を通った部分だけ残す。

小さな headless probe なら、固定 seed で一万 segment を生成し、各 obstacle について入力可能時刻から衝突までの猶予を計算する。player の jump、slide、lane-change を簡略 state machine にして、全 sequence に少なくとも一つ生存 path があるか探索する。active segment、gem、listener、audio object の個数が距離に対して定常かも記録する。画像だけでは hitbox の公平性を測れないので、rendered bounds と collision bounds の差を overlay artifact にし、representative seed は実プレイで確認する。

制作 cycle には「残す骨格／捨てる表層」の表を入れる。今回なら segment lifecycle、操作別 obstacle grammar、theme-independent rule は残す候補で、renderer や character art は交換可能層である。rebuild を選ぶ前に、起動不能の最小再現、最後に動いた commit、依存・asset 差分、smoke test を保存する。修理と rebuild を同じ acceptance test で比較し、起動時間だけでなく固有の手触り、回帰数、再構築後の変更容易性まで判定する。

記憶システムへは「AI が良い architecture を作った」という結論だけを atom 化せず、brief、採用した pattern、play で見つかった failure、修正、残存 component を一組にする。これにより次回は segment 方式を無条件に推薦せず、lifetime coupling、collision fairness、input threshold、生成 constraint の確認項目まで recall できる。

■ メリット・デメリット
メリットは、標準 pattern を短い brief から素早く構成し、有限の部品から長時間遊べる variation を作れること、rule と theme の分離で外観を増やしやすいこと、危険 lane の reward や store により reflex game へ資源判断を加えられることだ。最終版でも生成骨格と economy が生き残ったため、AI 出力を全否定せず、耐久した component を選別する実例にもなる。

デメリットは、random な組合せを面白さや公平性と誤認しやすいこと、object lifecycle の都合が gameplay lifetime を壊すこと、collision と touch が code 上は整っていても player の予測とずれることだ。評価が制作側の定性的回想だけで、比較条件、失敗率、性能値、prompt 履歴がないため、AI 利用の効果量や rebuild の優位は測れない。大量の高速 iteration は regression と保守 debt も増やし得る。

■ 判定
部分採用。segment の bounded lifecycle、操作ごとの障害物 grammar、risk／reward 配置、theme 分離は prototype の初期骨格として使う。ただし procedural 出力は seed 固定の到達可能性検査、長時間 resource 計測、hitbox overlay、実機 touch test を通す。全面 rebuild は原因不明の code を捨てる一般方針にせず、同じ acceptance test で修理案より有利な時だけ選ぶ。

■ URL
https://vibearcade.com/blog/how-we-built-path-runner
