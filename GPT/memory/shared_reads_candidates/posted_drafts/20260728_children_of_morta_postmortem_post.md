■ 概要
Dead Mage の Amir H. Fassihi が、物語主導のアクション・ローグライク『Children of Morta』の5年に及ぶ開発を、成功した判断と手戻りを招いた判断の両面から振り返った postmortem。当初は5人で6か月かける小品として始まり、工数を抑えるつもりで pixel art と roguelike を選んだ。しかし開発9か月後の Kickstarter 成功、開始2年後の 11 bit studios 参加によって期待と規模が上がり、最終的に中核チーム18人、PC と3機種の console、5年の開発へ拡大した。

うまくいった中心は、変化の多い制作中も「家族の感情を描くゲーム」と「完全な物語を持つ roguelike」という二本の pillar を守ったことだった。ランの反復と家族の物語を別々に置かず、gameplay と narrative が互いを支え、ludonarrative dissonance を起こさない形を探した。数百回の会議で案を捨てながら二点を優先した結果、発売後にも同じ特徴が評価されたという。Unity Editor 内には、designer が GUI から挙動を定義する階層型有限状態機械を作り、NPC、player character、UI、進行、narrative へ横断利用した。procedural level の asset 管理と独自 rendering pipeline も content 制作を支えた。

方向確認は開発2週目から始めている。平面上を capsule が動くだけの段階から外部の知人を含む週次 playtest を行い、次に Kickstarter backer へ early build を配布、publisher 参加後は毎週の feedback と幅広い player の focus test を加えた。著者は流動的な開発が迷走しなかった理由を、この三段階の loop に置く。focus test で発売を複数回延期したが、急いで出さなかったことを成功と評価している。

一方、初期は専任 UI/UX 担当がおらず、開発者が隣で説明できる playtest が理解不足を隠した。character、skill tree、item、upgrade system が増えると外部 player は情報を読めず、問題が最終四半期に集中して現れた。専任者を追加しても UI は少なくとも3回全面再制作され、3 console 対応も負担を増やした。また pre-production の終了条件がなく、新機能を足し続けたため、未使用 asset、見積もり不能、心理的負荷が発生した。終盤には story が家族について語れていないと判明し、ほぼ全職種を巻き込む改稿も行った。

横断コストの過小評価も具体的である。途中追加した online multiplayer は code architecture、console 固有要件、testing を広く変え、発売数か月前に延期され、発売後1年にも間に合わなかった。約6万語を11言語へ翻訳する localization は、narrative feedback による原文変更と各言語の納期差で状態管理が破綻した。小規模向けと思った pixel art も、高解像度、多 keyframe、6人の playable character、cutscene に出る家族、巨大 boss を2人の art team が全 frame 手描きする条件では軽量ではなかった。weapon を一つ増やすにも character ごとの animation 一式が必要となり、見た目の選択が機能追加の上限を決めた。記事の結論は、長い開発そのものを成功・失敗のどちらかへ単純化せず、混沌から独自性を発見できた一方、その代償を次作の境界管理へ持ち越すというものだ。

■ 内容分析
この事例の重要点は、「vision を守ること」と「仕様を固定すること」が同じではないと示している点にある。二本の pillar は多数の案を捨てる選択基準として機能したが、production へ移る gate にはならなかった。方向は一貫していても、character workshop のような進行機能、online multiplayer、物語改稿、platform 対応が後から入り、依存先が増えた。高位の intent が正しいだけでは schedule と asset graph は閉じない。pillar には「何を目指すか」だけでなく、「その価値を証明したら何をもう足さないか」という終了条件が必要だと読める。

継続 playtest も万能ではない。開発2週目から外部入力を得たことは探索を支えたが、UI/UX debt は終盤まで残った。初期 tester が studio の人間や知人で、作者が横から説明できたため、操作可能性は見ても自力理解を測れなかったからである。後の focus test は問題を発見したものの、その時点では system 数、platform 数、content 量が増え、修正面積が最大になっていた。したがって「早く頻繁に試す」だけでは足りず、各 test が何を検証し、開発者の補助を禁止するかまで設計しなければ、観察の死角を反復する。

評価証拠には限界がある。記事が示すのは発売後に family と story-based roguelike が賞賛されたという自己報告、focus test 後の延期が品質向上に報いたという回顧、UI 再制作回数、team・語数・言語数・期間などの制作量である。売上、retention、test 人数、理解率、延期前後の比較、tool 開発費、捨てた asset 量は示されない。成功作から逆算した survivor bias と、5年を経験した当事者の hindsight もある。よって有効性が実証された工程表ではなく、依存関係を見落とした場所と、判断軸として残ったものを抽出する一次事例として扱うのが妥当である。

■ 自分達の環境への適用
短期 prototype では、開始時に pillar を二本以内の「観察可能な約束」として書く。たとえば「入力前に危険を予測できる」「失敗後5秒以内に違う手を試せる」とし、build ごとに replay、telemetry、短い playtest で成立を確認する。同時に production 移行 gate を置き、core loop が playable、初見 tester が無説明で開始できる、代表 session が完走できる、主要 system の依存先が列挙済み、という状態を満たしたら探索機能を凍結する。新案は pillar への寄与だけで通さず、既存 code、UI、save、test、content、platform へ波及する面積を一枚の表で見積もり、横断変更なら次版へ送る。

playtest は頻度より test mode を分ける。mechanic test では口頭説明を許して手触りを探し、onboarding test では作者が沈黙し、最初の入力、目標理解、誤操作、詰まり時刻を記録する。headless 評価では state 遷移、到達可能性、run 完了率、同一 seed の regression を検査できるが、情報の意味が伝わるかは人にしか測れない。そこで失敗 log と録画を結び、説明なしで player が次の入力を変えられたかを人間評価にする。

art・localization・network 機能は「一個の追加」を unit にしない。新 weapon なら animation、effect、UI、説明文、全言語、balance test、save 互換までを数える。multiplayer は一人増やす機能ではなく、authority、同期、切断、再接続、console certification、組合せ testing を持つ別 architecture として prototype 段階で隔離する。代表 mechanic 一つを remote 条件で同期させ、production 後の追加を許可しない。tooling は複数領域で反復する同型作業にだけ作る。

■ メリット・デメリット
メリットは、作品の核を守る判断と scope を閉じる判断を分離できること、playtest の回数ではなく観察条件を改善できること、後付け機能を code 量ではなく依存面積で評価できることにある。小さな playable diff にも適用でき、headless regression と初見理解を役割分担させれば、作者の慣れによる見落としを早く検出できる。表現形式を選ぶ時も「pixel art だから安い」のような分類ではなく、解像度、frame 数、character 数、variation 数の積で考えられる。

デメリットは、強い production gate が探索から生まれる独自性を早く閉じる危険があること。記事自身も長い pre-production の混沌から価値ある案が出たと認めている。pillar を固定しすぎれば、test で判明したより良い核を守れない。依存面積の記録や無説明 playtest も、小規模制作では実装速度を落とす管理作業になり得る。また本事例は18人・複数 platform・publisher 付きの長期案件であり、一人または少人数の短期 prototype へ同じ ceremony を移すのは過剰である。gate は文書量ではなく、追加案を止められる短い判定として運用する必要がある。

■ 判定
部分採用。二本以内の観察可能な pillar、開発者が説明しない onboarding test、production 移行後の横断機能凍結、animation・localization・network を依存面積で見積もる考え方を採用する。一方、長い pre-production や内製 tool を成功条件にはしない。次の prototype で、pillar 二本、移行 gate 五項目、無説明 test 一回、追加機能の波及表一枚だけを試し、制作速度を落とさず終盤の全面手戻りを早期に検出できるかで残す。

■ URL
https://www.gamedeveloper.com/design/postmortem-children-of-morta
