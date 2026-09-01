■ 概要
『The Immortal John Triptych』は、Joe Richardson が約10年かけた三本の point-and-click adventure を、一つの launcher と Unity project に統合した事例である。Renaissance／中世絵画を切り抜いて動かす画風だけでなく、通常と逆向きの制作順と、長期間に蓄積した暗黙依存を再構成した過程が核になる。

創作は脚本や greybox から始まらない。museum archive を数百点見て内容別の folder に素材を集め、似た断片がたまると背景から scene を組み、loop animation に向く部分を動かす。Unity に入れる時点でも story と puzzle は未定である。空間を歩き、「井戸」「別の場所の bucket」「水の用途」のように物同士の関係を見つけ、複数空間をまたぐ puzzle にする。story は最後に行為へ意味を与える形でまとめる。

三部作も一本の plot ではなく、triptych の主題と鏡像関係で結ぶ。第一作の「良い理由のための悪事」に対し、最終作を「悪い理由のための善行」と反転させた。この疎な接続は art-first と相性がよい一方、本人は毎作途中まで意味を結ぶ確信がなく、三度成立しても運を感じると述べる。

第一作は初心者向けの Visionaire で完成後、mobile port のため Unity へ作り直した。no-code 系 plugin の Adventure Creator を足場にしつつ、規格外機能を Unity 側へ足せる自由を得た。今回、年代も version も異なる三 project を統合すると、Unity 更新は円滑だったが、plugin の movement system 更新がゲームを壊し、最新 Unity と数年前の plugin を併用した。独立採番した variable、dialogue ID、scene name も衝突し、“Town” が三つある状態を一件ずつ解消した。数か月で安定して見える状態に届いたが、内部には本人も把握し切れない「house of cards」が残る。

console 対応では virtual cursor を避け、character の direct control を実装した。画面全体から click 対象を探すゲームが、歩いて探索する物理空間へ変わるため、届かない hotspot は右 stick で見回して選べるよう補った。旧二作の dialogue box も背景付き表示へ統一し、文章を変えず可読性を上げた。controller が PC でも選ばれるとの自己報告はあるが、人数や完了率などの定量値はない。古い作品群は現代化できたが、負債を解消したわけではない。

■ 内容分析
この事例では創作と移行に同じ構図がある。先に完全な仕様を固定せず、既にある断片を観察し、その間の関係を発見して新しい構造を作る。絵画断片から scene、scene 内外の affordance から puzzle、三作の差異から triptych の主題を作る流れは、制約を単なる不足ではなく探索空間に変えている。固有の visual motif と puzzle の結び付きが強くなるのは、完成済みの物を後から装飾するのではなく、描かれている井戸や bucket 自体が mechanics の候補になるからだ。

一方、同じ発見主導でも技術統合は自由な創作ではない。scene、ID、variable、movement system は実行時に一意である必要があり、曖昧な関係を残せない。ここでは関係の発見が「新しい面白さ」ではなく「過去に埋め込まれた衝突の棚卸し」になる。最新版 plugin へ上げず旧版を固定した判断は現実的な出荷策だが、migration 成功というより互換性問題を境界の内側へ封じた状態である。今後の platform 更新や security／store 要件で旧版が使えなくなれば、movement system の破損が再浮上する。

direct control 化も単純な quality-of-life 改善ではない。cursor なら距離に関係なく選べた hotspot が、character 中心の到達可能性問題へ変わるため、右 stick の遠隔探索という第二の interaction channel が必要になった。操作感を現代化するほど、元の level geometry と interaction authoring の前提を再設計しなければならない。dialogue box の統一は逆に、内容を保存して presentation layer だけ交換できた例である。この差から、移植時には「意味を保ったまま表示だけ替えられる層」と「入力変更でゲーム意味まで変わる層」を分ける必要がある。

証拠の強さには限界がある。三作品が完成し統合版が出荷されたことは、art-first が少なくともこの作者・題材で反復可能だった証拠になる。しかし比較対象、playtest 記録、工数内訳、bug 数、controller 選択率は示されない。記事は Unity 公式の開発者紹介でもあり、失敗作や未出荷案を含む評価ではない。したがって「greybox より art-first が優れる」「旧 plugin 固定が安全」という一般則にはできない。成立条件は、再解釈可能な豊富な素材、疎な物語構造、作者が長期間 tinkering を続けられる規模にある。

■ 自分達の環境への適用
ゲーム制作には二つを分離して試す。第一は art-first puzzle probe である。museum art に限らず、既存 sprite、背景案、生成画像から6～12個の visual fragment を選び、先に三つの小空間を組む。各 fragment について「手に持てる／動く／満たせる／遮る／別 scene と対応する」を記録し、二空間以上を横断する関係だけを puzzle 候補にする。その後で最小の目的と因果を接続する。評価は、固有 puzzle 数、説明なしで affordance を発見できた率、story 接続後に捨てた asset 数、後付け設定の矛盾数、通常の mechanic-first probe と同じ時間で playable loop に届くかを見る。見た目は独自でも目的が読めない、または story repair が制作時間の半分を超えるなら撤退する。

第二は project 統合前の migration inventory である。scene name、global／local variable、dialogue ID、save key、input action、plugin version、custom extension、serialization format を project ごとに export し、値だけでなく scope と参照元を付けて重複を機械検査する。命名は作品 prefix を付けるだけでなく、save data や dialogue から旧 ID を引く変換表を作る。plugin は「最新版へ上げる／旧版を固定する」の二択にせず、壊れる movement API の adapter 化、最小 reproduction、将来更新の解除条件を migration ledger に残す。

headless 評価では、全 scene の起動、scene 遷移、save／load、dialogue mapping、主要 puzzle 完走を build ごとに replay する。controller 対応は全 hotspot を一覧化し、徒歩で到達、右 stick で選択、文脈上非表示のいずれかに必ず分類する。入力 device ごとに、最初の interaction までの時間、対象切替回数、到達不能 hotspot、誤選択、hint なし完了率を比較する。dialogue は文字列 snapshot と表示領域の overflow を別々に検査し、内容保存と presentation 改善を混同しない。

重要なのは、発見的設計を production 全体の無計画さへ拡張しないことだ。art と puzzle は可逆な小 probe で探索し、ID、save、input、plugin の境界は早期に固定して deterministic test を置く。記事から採るべきなのは「最後まで決めない勇気」そのものではなく、曖昧さが創造性を生む層と、一意性が必要な層を見分ける方法である。

■ メリット・デメリット
メリットは、既存 asset の偶然の組合せから、その作品にしかない puzzle と主題を作れること、未使用素材を別 scene へ循環できること、完成作を内容改変なしで可読化できることにある。統合時の namespace 棚卸しと hotspot 到達可能性分類は、長寿 project の hidden dependency を test 可能な項目へ変える。

デメリットは、story が最後まで収束しない危険、作者の審美眼と反復時間への強い依存、完成例だけを見た survivorship bias である。技術側では旧 plugin 固定が将来の更新コストを先送りし、複数 project の ID 変換は save compatibility を壊し得る。direct control は操作感を改善しても全 hotspot の意味と geometry を再監査させる。定量評価がないため、controller 優位や統合安定性は自環境の replay と user test で再確認が必要である。

■ 判定
部分採用。art-first は短い puzzle probe として、migration inventory は統合前の必須 gate として採る。story-last、旧 plugin 固定、direct control 化は一般解にせず、収束時間、互換変換、hotspot 到達性の停止条件を先に置く。創作上の曖昧さは残し、runtime identifier と操作可能性は早く機械検証する。

■ URL
https://unity.com/blog/immortal-john-triptych-joe-richardson-interview
