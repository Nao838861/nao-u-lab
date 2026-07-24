■ 概要
Amiga 向けターン制戦術ゲーム『Ecliptic』を、2020年の初期試作、2022年末の Blitz Basic 版、2023年からの C++ 再実装を経て、2026年5月に8 levelの完成へ持ち込んだ作者の postmortem。企画の核は Laser Squad / X-Com 型の action point と line of sight を持つ dungeon crawler。完成版では、game object 用 garbage-collected heap、behavior 用 VM、item・monster・room・graphics・sound・UI を定義する DSL、それを resource file に変換する C# compiler を自作している。

設計上の成功は、保存される game state と実行機固有の machine state を分けたことだ。memory management、display、input、disk I/O は GC heap の外、UI や game mode を含む進行 state は heap 内に置いた。一方、toolchain では STL が使えず、C++ は実質 “C with classes” となり、heap 内 object の vtable pointer を save/load 時に扱う危うい処理まで必要になった。

level design でも摩擦が出た。procedural layout は puzzle や set-piece と相性が悪いため固定 room へ変更したが、corridor の randomness は配置をなお制約した。さらに player turn、target selection、monster behavior を多数の mode object で表現した結果、event から予期せぬ mode へ入り、正しく復帰できず、見かけ上 lock-up する bug が多発した。作者の結論は、mode と許可遷移を絞れば単純化できたというものだ。2024年後半以降は rewrite と feature detour を止めて level 制作へ移った。記事の中心は、良い責務境界があっても、遷移規律と停止判断がなければ content 制作を圧迫するという記録である。

■ 内容分析
再利用価値が高いのは GC、VM、DSL 自体ではなく、その責務分離だ。DSL は静的 content を resource へ落とし、VM は behavior を解釈し、GC heap は保存対象を含む object graph の寿命を管理する。heap 外には display や I/O が残る。「data / behavior / lifetime / machine interface」を分け、UIや mode も見た目ではなく進行を左右するかで配置している。

しかし、保存可能であることと正しく進行できることは別問題だった。mode object は局所的には player input や monster behavior を整理するが、event が任意の mode change を起こし、呼び出し元へ戻る契約が弱いと、全体は暗黙の pushdown machine になる。どの mode がどの mode から入れるか、終了時にどこへ復帰するか、割り込み event が stack をどう扱うかが型や表で拘束されていなければ、object を分けるほど遷移辺が増える。見かけ上の freeze は処理停止ではなく「入力を受け付けない正当な mode に居続ける」ため、crash detector では発見しにくい。これは state の所在をきれいに分けても state transition の正当性を別途設計しなければならない実例である。

procedural corridor の失敗も同型だ。room を固定しても、generator が到達経路や遭遇順を握る限り pacing は制御しきれない。問題は固定と生成の割合ではなく、生成器がどの design variable の最終決定権を持つかである。接続を揺らすだけでも視認、引き返し距離、初接敵が変わるため、seed 固定だけでなく接続 graph の拘束が要る。

限界もある。記事は完成後の回顧で、mode 数、遷移辺数、bug 件数、rewrite 期間を定量化していない。C++ の痛みには Amiga toolchain、STL 不在、独自 GC、binary save が重なり、通常の C++ 利用へ一般化できない。完成した事実だけで VM / DSL の費用対効果も証明できない。ただし最終的に detour を止めた時系列は、基盤の安定化と「もう触らない」決断の両方が必要だったことを示す。

■ 自分達の環境への適用
ゲーム prototype では、まず save 対象を設計するのではなく、一 tick 後の判断を変える state を列挙し、simulation state、presentation state、external I/O に三分する。simulation state だけから snapshot を作り、同じ snapshot・input trace・seed を与えた時に state hash が一致するかを headless で検証する。camera animation や sound handle は復元対象から外し、復元後に simulation state から再構成する。Ecliptic の境界を採るとは GC を自作することではなく、「進行を決めるものを machine resource から切り離す」ことだ。

mode には明示 graph を持たせ、各 node に許可 input、entry / exit condition、復帰先、最大滞在 tick を定義し、未登録 edge は拒否する。headless probe は通常 edge に加え、target selection 中の damage、monster turn 中の cancel、load 直後の pending event を注入する。一定 tick、表示も入力許可も event 消化も変わらなければ、current mode、stack、直前 edge、未処理 event を soft-lock 証拠として残す。

generator では puzzle room、encounter 順、最短距離、退路を constraint として固定し、その範囲だけ corridor を揺らす。複数 seed で constraint を検査し、critical path 長、分岐数、初接敵、backtrack 距離を記録する。

制作サイクルには feature detour gate を入れる。新しい VM 命令、DSL syntax、generator 機能、rendering 改修を提案する時は、それが次の playable level のどの obstacle を解消するかを1行で結び、結べないものは backlog へ送る。週単位では engine diff と playable content diff を分け、level 数、完走可能 path、未検証 mode edge の減少を進捗とする。基盤変更を永久禁止するのではなく、save/load boundary や state graph の欠陥のように content を複数箇所で塞ぐものだけを先に直す。記事の完成過程を、独自 engine を避ける教訓ではなく、基盤探索から content 生産へ切り替える可視的な条件として使う。

■ メリット・デメリット
メリットは、simulation と machine resource の境界を明示すると snapshot、replay、headless regression が同じ構造を共有できること。mode graph を列挙すれば、通常操作では見つけにくい割り込み由来の soft lock を edge coverage と不変条件で検査できること。procedural generation の決定権を constraint と metric に分解すると、固定か乱数かという二択を避けられること。さらに playable content と engine work を別々に計測すれば、技術的に面白い detour が完成を遅らせている局面を早く認識できる。

デメリットは、state graph や snapshot schema 自体も保守対象になり、小さな prototype へ早期導入しすぎると実装より台帳作りが重くなること。最大滞在 tick のような規則は、意図した待機、演出、長考 AI を誤検知し得ること。Ecliptic 固有の C++、vtable、AmigaOS 制約を一般的な言語選択論へ広げると誤ること。DSL / VM / GC の楽しさは作者の継続動機にもなっており、工数だけを理由に切れば制作意欲を損なう可能性もある。必要なのは独自技術の禁止ではなく、playable content に対する費用と停止条件の可視化である。

■ 判定
部分採用。game state と machine state の分離、明示的 mode graph、割り込み込みの soft-lock trace、generator の constraint 検査、engine work と playable content の別計測は採る。独自 GC / VM / DSL、Amiga 環境での C++ 評価、固定 room＋random corridor という解法自体は移植しない。最初の probe は snapshot replay と5～10個の mode edge に絞り、遷移証拠が実際の bug 診断を短縮した時だけ監査範囲を増やす。

■ URL
https://itch.io/devlog/1532254/postmortem-and-a-little-history.amp
