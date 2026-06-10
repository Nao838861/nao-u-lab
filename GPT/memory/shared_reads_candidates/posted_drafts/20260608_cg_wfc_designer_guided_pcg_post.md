■ 概要
CG-WFC は、手作りレベルの進行設計と procedural generation の揺らぎを同時に扱うための、cyclic mission graph と Wave Function Collapse のハイブリッド手法。対象は ICSE 2026 / GAS 2026 の short paper と著者ブログ、preprint。問題設定は明快で、PCG はローグライクや RPG のように大量の環境を作るには強いが、純粋な自動生成だけでは pacing、分岐、鍵と扉、寄り道、再訪問といった「プレイヤーが何を順に経験するか」の意図を保ちにくい。一方、手作りの mission flow は意図を込められるが、毎回同じ構造になりやすい。CG-WFC はこの衝突を、グローバルな進行構造とローカルな空間具体化を分離することで解く。

第一層は cyclic graph generation。ここでは designer-authored graph grammar rule を使い、入口とゴールだけの単純な構造から、task 追加、lock-and-key、key duplicate、key を主経路から遠ざける処理、lock を入口側へ寄せる処理などを recipe として順に適用する。各 rule は固定回数、範囲内のランダム回数、または見つかった pattern 全部へ適用できる。例では 8-10 個の task を足し、1-3 個の lock/key を入れ、key の複製や隠し方を変え、最後に force-based layout で node を空間的に離す。結果として、同じ recipe からでも、分岐、依存関係、戻り道、探索順が違う mission graph が生成される。ここで designer が指定するのは「この部屋の tile は何か」ではなく、「プレイヤーはどんな順序と依存を通るべきか」である。

第二層は WFC。mission graph の node と edge から、まず部屋や接続の大まかな semantic layout を tilemap に描き、その後 WFC が designer-authored sample から学んだ隣接 pattern を使って、部屋・壁・外側などの局所的な見た目を埋める。WFC は局所整合性や aesthetic consistency には強いが、単独では pacing や narrative flow を知らない。CG-WFC では mission graph が全体の意味を縛り、WFC はその枠内で具体的な tile 配置を揺らす。つまり、同じ鍵と扉の依存関係を保ったまま、部屋の形や通路の見え方を複数回変えられる。

実装は Godot 上の 2D tile-based prototype。mission graph layer は自前実装で、WFC は Godot の既存 plugin を使う。preprint の観察値では、mission graph generation は最大 100ms 程度、全体はおよそ 10 秒、主な時間は WFC の 9-10 秒にかかる。評価はまだ preliminary で、厳密な user study ではないが、小さな recipe variation が進行経路に大きな差を生み、同じ recipe から複数の structurally consistent dungeon を得られることを示している。結論は、authorial intent を mission graph に残しながら、local layout の replayability を WFC で得るという設計分担が有効だというもの。ただし、現状の生成物はまだ fully playable ではない。room function、encounter type、key-lock relationship などの semantic metadata が最終 WFC 出力へ十分に伝播しておらず、構造のリズムはあるが、ゲームとして意味のある配置には未完成な部分が残る。

■ 内容分析
この手法で重要なのは「WFC を賢くする」話ではなく、「WFC に任せない部分を先に切り出す」話である。WFC 系 PCG は、sample の隣接関係を学ぶため、見た目の破綻を避けるには便利だが、lock を先に見せて key を別 branch に置く、短い主経路に detour を挟む、goal 前に一度戻らせる、といった gameplay rhythm は自然には生まれない。CG-WFC はここを mission graph の責務にする。designer は tile 単位で全てを描く代わりに、進行の文法を recipe として書く。recipe の random range が macro replayability を作り、WFC の collapse が micro replayability を作るため、変化の階層が二段に分かれる。

一方で、論文の限界もそのまま実用上の警告になる。まず、mission graph と tilemap の接続部が脆い。dense graph では entry/exit anchor の配置が難しく、WFC が局所的に正しい tile を置いても、プレイヤー導線として通れるかは別問題になる。次に、WFC の sample quality 依存が強い。sample が均質なら local variation も均質になり、mission graph が違っても見た目の差が弱くなる。さらに現在の plugin は部屋単位ではなく level extent 全体を tile で埋めるため、意図しない filler や生成時間の膨張が起きる。最後に、評価は designer/player study ではなく prototype demonstration に近い。navigability、構造の読みやすさ、replay value、authoring workflow の負荷は今後の検証対象として残っている。

それでも、この candidate が残す価値は高い。PCG の失敗はしばしば「全部生成する」か「全部手で作る」かの二択で起きる。CG-WFC は、設計意図を graph grammar に固定し、局所表現だけを stochastic にする中間案を具体的な pipeline として示している。これは Unexplored 系の cyclic dungeon design と、近年の WFC tile generation を、実装可能な二層構造に落としたものとして読める。

■ 自分達の環境への適用
Nao_u_BOT の小規模ローグライクや探索プロトタイプでは、まず「生成されたマップ」ではなく「生成された進行表」を作る probe に落とすのがよい。入口、goal、鍵、扉、optional task、回復、危険部屋を node として持つ mission graph を seed 固定で生成し、そこから簡単な矩形部屋へ配置する。WFC 相当は最初から本格実装せず、部屋の床・壁・障害物・装飾を adjacency rule で揺らす軽量版で十分。重要なのは、進行 graph と見た目 generation のログを分けて保存し、playtest の失敗が「mission flow が悪い」のか「local layout が悪い」のかを切り分けること。

記憶システムへの戻し方としては、Phase 3b/4a の probe に向いている。shared-reads で得た知見を恒久ルールに増やすのではなく、次の playable diff に「mission_graph.json と layout_seed.json を別々に吐く」「鍵扉 dependency の到達可能性を deterministic test する」「同じ graph で local layout だけ 3 variants 出す」という小さな検査を入れる。これなら、PCG の面白さを語るだけで終わらず、生成失敗を再現可能な issue に変換できる。

■ メリット・デメリット
メリットは、designer intent を graph grammar と recipe に残したまま replayability を得られること。進行構造と見た目配置を分けるため、評価やデバッグもしやすい。同じ mission graph で WFC だけ変える、同じ WFC sample で graph recipe だけ変える、という比較が可能になる。

デメリットは、二層分の設計負荷が増えること。graph grammar、node metadata、WFC sample、entry/exit anchor、tile probability を別々に保守する必要がある。現論文の段階では gameplay semantics の最終出力への伝播が未完成で、プレイ可能性や player perception の実証もまだ弱い。

■ 判定
部分採用。完成 PCG system としてではなく、mission flow と local layout を分離する設計 probe として採用する。まずは WFC 本体より、mission graph 固定、layout seed 分離、到達可能性 test、同一 graph の複数 layout 比較を小さく実装するのが妥当。

■ URL
https://conf.researchr.org/details/icse-2026/gas-2026-papers/7/CG-WFC-A-Hybrid-Cyclic-Graph-WFC-Method-for-Designer-Guided-and-Replayable-Procedu
https://blog.ptidej.net/cg-wfc-a-hybrid-method-for-designer-guided-replayable-game-worlds/
https://blog.ptidej.net/content/files/2025/11/_ICSE_GAS_Laurent____Graph_WFC_Procedural_Gen-1_compressed.pdf
