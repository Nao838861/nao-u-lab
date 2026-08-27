■ 概要
対象は、Bullstorm が GameDev.tv Game Jam 2026 のテーマ「connections」に合わせて制作した point-and-click adventure『Gracillis VI: Lost Connection』の詳細な制作記録である。作者は、慣れた genre と Adventure Game Studio を選んで短く作るつもりだったが、実際には大幅に overscope した。重要なのは、完成談だけでなく、曖昧な着想を遊べる因果列へ変え、asset 制作・tutorial・puzzle・締切判断をどう接続したかが工程単位で残っている点にある。

企画時には、まず「端末を調べる→電源 cable を得る→扉を開ける→drone で警備 droid を処理する→最後の接続 puzzle を解く→脱出 pod に入る」という player の行動列を notepad に書いた。断片的だった puzzle 案を通過順に並べ、不足する行動を補った後、Draw.io で room ごとの出来事と依存関係を図にした。この chart と todo list が jam 全体の管理基盤になった。

美術は、Unreal Engine の大型 3D asset を直接移植せず、配置・照明した screenshot を、Illustrator の posterize、Clip Studio Paint の輪郭抽出、PixelOver の pixel shading、手修正へ渡した。character は Mixamo と Blender で animation を整え、sprite sheet にした。最初の48時間で背景工程と3体を用意した一方、最初の room の scale、walkable area、animation 接続に丸一日を使った。

tutorial では、最初の room で inventory と item 使用だけを教え、item combination は次の puzzle に遅らせ、glove 案を削除した。前年の「object が見つけにくい」という feedback を受け、序盤の重要物は perspective 上で大きく見える位置へ置き、後半から探索難度を上げた。7日目には当初計画の約60%でも機能する build を確保した。その後の警備 droid 戦では、別 room や武器を増やす案を捨て、既存 room と「天井を歩ける drone」を再結合して奇襲へ変えた。最終 puzzle でも、engine 既存の follow character 機能を二体の drone の協力へ転用したが、standby 操作と位置関係が複雑になり、多くの player が何をすべきか分からなかったという feedback が残った。結論は、早期 playable 化と既存要素の再結合は締切耐性を上げるが、実装可能性から逆算した mechanic でも、学習導線を検証しなければ終盤で理解負債が表面化する、という制作上の両面性である。

■ 内容分析
この記事の中核は「scope を小さくした」という一般論ではなく、scope 判断を三種類の表現へ変換していることにある。第一は player の動詞列、第二は room と puzzle の依存図、第三は実際に提出できる build である。動詞列は体験の順序を固定し、依存図は asset と state の広がりを可視化し、build は計画の嘘を実行時に露出させる。7日目の60% build は単なる進捗率ではなく、それ以後の追加を「なくても提出できる状態」から評価できる option を作った。

良い削除は glove である。inventory 取得、item 使用、item combination を同時に教えず、後者を次へ送った。一方、終盤の二体 drone puzzle は逆の失敗例である。follow、standby、操作主体切替、天井移動、二地点への配置を組み合わせたが、直前の一回の使用を「理解済み」とみなした。図入り hint も後で再閲覧できず、多数の混乱報告が出た。mechanic の既出と、複合条件下での再現可能性は別である。

警備 droid 戦の縮約も単純な成功ではない。新背景と武器をやめ、drone の天井移動へ寄せたことで content 量は減ったが、AGS の perspective scaling は上から下への床を前提としていたため、天井側の scale、sprite 反転、足元基準の hitbox を手作業で補う必要が生じ、二日を消費した。さらに状態が壊れ始めたため、背景を clone して戦闘専用 room に隔離した。つまり「asset を再利用すれば安い」のではなく、空間は同じでも simulation contract が変われば実装費は増える。再利用の価値は、新規 content 費を減らした点と、既に物語上成立していた drone の能力を payoff にできた点にある。

3D→2D pipeline も万能ではない。engine 固有 material の移植費を、rendered image を中間表現にして切断した判断は合理的だが、camera や lighting が変われば再処理が要る。character texture は flicker を生み、追加の posterize も必要だった。成功の芯は3D利用自体ではなく、最終表現に不要な3D情報を早めに捨てる境界を見つけたことにある。

評価根拠は限定的である。最終 room への到達、終盤の混乱、約30分の遊戯には触れるが、人数、離脱率、時間分布、修正前後比較はない。これは優位性の実験ではなく、制作判断と症状を結んだ単一事例である。一週間ほど4時間睡眠を続けた進行も、計画が健康コストを防げなかった失敗条件として読むべきだ。

■ 自分達の環境への適用
短期 game prototype では、仕様書を先に膨らませる代わりに、最初の playable diff を「player が行う動詞の列」で定義する。各動詞へ required state、room、asset、capability、観測可能な成功条件を付けて依存図へ落とし、未接続の動詞や一度しか使わない asset を scope risk として印を付ける。headless 評価では画面の美観だけでなく、各 state へ到達可能か、必須 item を取得できるか、学習した操作が後の複合 puzzle で再現できるかを trace する。

締切の前半に vertical slice を作り、「最低限提出可能な build」を milestone とする。その後は新 scene や専用 asset の前に、既存 room・state・capability の再結合を試す。ただし asset 数だけでなく、physics、camera、collision、navigation、animation、save state の contract 差分も見積もる。天井歩行のような例では headless probe で座標・scale・hitbox・遷移 flag を検証してから演出を載せる。

tutorial は「紹介したか」ではなく「後で再現できたか」で判定する。mechanic ごとに、提示、単独使用、間隔後の再使用、組合せ、失敗時の回復を記録する。hint は再閲覧可能にし、headless trace では無操作時間、誤 click、操作反復、state 停滞を confusion signal とする。小さな検証として、一つの prototype で「動詞列のみ」と「動詞列＋依存図」を比べ、増えた scene・専用 asset、初回 playable 時間、削除時点を測る。

記憶システムへは記事全体を一般則にせず、「中間表現で不要情報を捨てる」「既存 capability 再結合前に contract 差分を測る」「既出操作と再現可能性を分ける」の三つを、適用条件と反証条件付きの制作 atom として残す。次回の制作で実際に playable diff や probe に接続できた時だけ lesson へ昇格させる。

■ メリット・デメリット
メリットは、企画、asset pipeline、tutorial、scope 削減、engine 制約、player feedback が一つの時系列でつながっており、判断の理由と副作用を追えることだ。動詞列と依存図は低コストで導入でき、早期 build は deadline risk を実物で下げる。既存 capability の再結合は、content 費を抑えながら序盤の学習を終盤の payoff に変えられる。rendered image を中間表現にする方法も、engine 固有の重い asset を2D制作へ持ち込む際の有力な境界設計になる。

デメリットは、成功指標が作者の自己報告と定性的 feedback に限られ、どの施策が到達率へ効いたか切り分けられないことだ。再利用は技術 contract の差を隠し、結果として二日規模の例外実装を生む。早期 build があっても制作意欲で scope を再拡大し、睡眠を削れば安全装置にならない。tutorial の段階化も単純操作には効いたが、複合 puzzle の理解を保証しなかった。3D→2D工程は既存 tool と asset library を持つ作者には有効でも、初回導入では変換 chain 自体が負債になり得る。

■ 判定
部分採用。動詞列→依存図→早期 playable build の順序、既存 capability を再結合する削減判断、tutorial を再現可能性で測る観点は採用する。一方、徹夜前提の速度、単一事例の到達感想、3D→2D toolchain の一式はそのまま標準化しない。まず一つの短期 prototype で dependency と contract 差分を計測し、初回 playable 時間と confusion signal が改善した場合に限って制作ルールへ昇格させる。

■ URL
https://bullstorm6.itch.io/gracillis-vi-lost-connection/devlog/1541636/making-of-gracillis-vi
