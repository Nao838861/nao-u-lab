■ 概要
Game Developer が GodotCon 2026 の参加者に、なぜ Godot を使い続けるのかを聞いた記事である。背景には Unity が2023年に発表し、後に撤回した Runtime Fee がある。記事が示す採用シグナルは二つある。Game Developer Collective の開発者パネルでは、主要エンジンに Godot を挙げた回答者が12%で、記事では前年比8ポイント相当の増加として扱われる。GMTK Game Jam 2026 では応募作の47%が Godot 製で、Unity が9年間占めていた最多エンジンの座を上回った。ただし両者は職業開発者パネルと game jam 応募者という異なる母集団であり、一つの市場シェアとして足し合わせられる数字ではない。

記事の中心は採用率よりも、GodotCon で hobbyist、toolmaker、artist、新規開発者らが繰り返した「lightweight」の意味を具体化した点にある。Ruffed Up の Joey Yeo は、Godot ではエディタを開き、機能を実装し、試すまでが速いと述べる。Xogot の Miguel de Icaza は、debugger で停止する際に engine 全体ではなく user script だけを止める構造を挙げ、実行と修正を往復しやすいと説明した。Apocalypse Approaches の Thomas Gelman は、低い動作要件に加え、composition-focused な object model により機能を atomic に動かせるため、個別機能を隔離する大掛かりな test gym を用意しなくてよいと述べる。Luna Chippy Games の Michael Grewer は、documentation に穴があっても open source なので実装を読んで挙動を確かめられる点を評価する。

一方、記事は「軽いから万能」とは結論していない。Gelman は、一つの2D object に複数の shader effect を重ねる multi-pass 2D shader が弱く、subviewport を使う回避策か、全 pass を一つへ焼き込んだ別 shader が必要になると指摘した。これは余分な時間と file を生み、普段の短い feedback loop が特定機能では崩れる例である。記事の結論は、Godot が toy ではなく商用作品を作れる real tool と認識され始め、短い反復周期が定着理由になっている一方、局所的な workflow friction は残る、というものだ。

■ 内容分析
この記事の価値は「lightweight」を binary size や機能数の少なさではなく、編集から観測可能な結果までの待ち時間として読む材料を出したことにある。起動が速い、debug 中も engine 全体を止めない、scene/node を小さく合成する、source まで辿れる、という別々の特徴が、open→change→run→inspect→resume の一周を短くする。重要なのは最高性能ではなく、仮説を一日に何回捨て直せるかである。ゲーム制作では最終 build の性能が同じでも、一回30秒の待ちと3秒の待ちでは、試す案の数と変更粒度が変わる。

特に composition と atomic testing の組み合わせが強い。機能を小さな scene や node として実行できれば、全 game state を再現して目的地点まで操作する代わりに、対象だけを起動して確認できる。これは単なる時間短縮ではない。準備操作が減るほど、確認対象と観測結果の因果が狭まり、失敗の切り分けも容易になる。source access も同様で、documentation 不足を検索待ちや推測で埋めず、実装へ降りて止まった判断 loop を再開できる。

ただし、記事の証拠は controlled benchmark ではない。12%と47%は sampling frame が異なり、後者は短期制作との相性が数字へ強く出る。GodotCon の回答者は既に Godot を選び、会場で作品を展示する人々なので selection bias がある。Unity project の起動時間、同一機能の実装時間、debugger 再開時間を同じ hardware・project 規模で比較した測定もない。Runtime Fee への反発、MIT license、Slay the Spire 2 の移行実績は採用の安心材料だが、反復速度そのものの証明とは分ける必要がある。

multi-pass 2D shader の例は、その限界をよく示す。engine 全体の平均的な軽さより、制作で頻繁に通る一本の経路に workaround がある方が総時間を支配し得る。subviewport は scene 構成と render target を増やし、統合 shader は再利用単位を粗くする。結果として file 数、組合せ、visual regression の確認範囲が増える。「通常 loop の短さ」と「作品固有の難所の長さ」を別々に測らなければ、導入初期の快適さを制作後半へ誤って外挿する。

■ 自分達の環境への適用
自分達のゲーム制作では、engine 名を先に選ぶのではなく feedback-loop budget を計測する。対象は①cold start から編集可能、②小変更から画面反映、③対象 scene だけの起動、④breakpoint から再開、⑤headless test の結果取得、⑥playable diff を第三者が再現、の六区間とする。各区間を同じ machine・同じ revision で10回取り、中央値だけでなく遅い側の p90、手操作数、失敗回数も残す。cache 済みの最速値だけを採用判断に使わない。

最初の probe は既存 prototype の一機能を選び、通常の game start 経路と isolated harness の二通りで試す。例えば敵一体の行動、shader 一枚、UI state 一つを変更し、保存から screenshot または assertion 取得までを測る。isolated harness では固定 seed、最小 scene、決まった input、同じ capture frame を使う。短縮できても本編との差異で bug を見逃すなら、速さではなく検証範囲を削っただけなので、統合 test を別 gate として残す。

headless 評価には、起動時間だけでなく「一つの仮説を否定するまで」を計る観点を移植できる。test process の boot、fixture 準備、simulation、artifact 保存、判定を別 timer にし、最も長い区間だけを改善する。visual effect は headless assertion だけで完結させず、決定的な frame capture と画像比較を併用する。multi-pass shader のような engine 固有の難所は、一般 benchmark とは別に representative task として置き、workaround の file 増加、再利用性、capture 差分まで数える。

制作サイクルでは、playable diff の done condition に「変更が動く」だけでなく「次の変更を何分で再確認できるか」を加える。新しい framework、asset pipeline、memory rule を足す時も、手順数や再起動を増やして feedback loop を悪化させるなら便益と相殺する。測定記録は恒久ルールへ即座に一般化せず、project・revision・machine・対象 task を付けた probe として保存し、同種の遅延が繰り返した時だけ改善項目へ昇格させる。

■ メリット・デメリット
メリットは、曖昧な「使いやすさ」を待ち時間、操作数、隔離可能性、再現率へ分解できることだ。engine を替えなくても current workflow のどこで思考が中断されるかを測れ、改善を小さな diff に接続できる。atomic harness は debug と headless 回帰試験を兼用でき、短い loop と原因切り分けを同時に得られる。open source の場合は、documentation の行き止まりから source inspection へ降りられることも復旧経路になる。

デメリットは、短い micro test を最適化すると、実 game の load、asset import、複数 system の干渉、export、platform 固有問題を過小評価しやすいことだ。反復速度が速くても renderer、console 対応、team tooling、長期保守が要件を満たすとは限らない。測定自体にも instrumentation と harness 維持費がかかる。また記事の採用数字と証言は Godot に好意的な集団から得たもので、他 engine に対する速度優位の定量証拠ではない。局所的な shader workaround のように、作品の中核表現と弱点が重なる場合は平均的な快適さが消える。

■ 判定
部分採用。Godot への全面移行根拠としては証拠が足りないが、「編集から個別確認までの一周」を制作環境の主要指標にする考えは採用する。既存 prototype で通常経路と isolated harness を比較し、p90、操作数、再現率、artifact 取得までを測る。代表的な難所を含めても loop が短くなり、統合 test の検出力を落とさない場合だけ、engine・tool・構成の変更へ進める。

■ URL
https://www.gamedeveloper.com/programming/godot-adoption-is-rising-what-are-devs-enjoying-about-the-engine-
