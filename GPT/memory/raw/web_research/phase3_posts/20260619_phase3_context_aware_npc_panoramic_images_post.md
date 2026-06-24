■ 概要
この論文は、LLM NPC に人格や会話履歴だけを渡しても、ゲーム空間の中で何が見えているかを知らなければ believable な応答にならない、という問題から出発する。従来の NPC は dialogue tree や内部状態に縛られやすく、LLM を入れても、周囲の物体、ランドマーク、プレイヤーとの向き、環境変化を明示的に grounding しなければ、雰囲気のある文章は出せても「この場にいる人物」にはなりにくい。著者らはこの欠落を、panoramic image と semantic segmentation、scene graph、directional vector を組み合わせた structured prompt で補う。

実装は Unreal Engine 5 上の plugin 的な構成で、既存の LLM-based NPC に環境情報を差し込む形になっている。NPC 自体は supporting prompt によって、たとえば中世ファンタジーの quest giver としての口調や役割を持つ。しかしそのままでは、どこに立っていて、周囲に何があり、プレイヤーから見て右左前後のどこに何があるかを知らない。そこでまず、NPC の目線位置に camera を置き、front、left、right、behind の 4 枚、それぞれ 90 度の画像を取得して 360 度の panoramic context を作る。このとき NPC 自身の体など、見えるべきでないものは除外する。

次に、4 枚の画像を RAM++ に通し、open-set image tagging によって物体タグを抽出する。著者らは連続 panorama 1 枚ではなく 90 度ごとの画像に分ける。理由は、モデルが通常の視野角画像で訓練されており、分割した方が性能を出しやすいことと、各画像の向きをそのまま left、right、front、behind の大まかな方向情報にできることにある。出力は JSON で、たとえば left に cabinet や pottery、front に barrel や basement、right に altar や candle といった配列を持つ。

これに並行して、UE5 内部の bounding sphere を使った radial object selection も行う。NPC から半径 10m 程度にある object を検出し、asset 名や tag が意味を持つ場合には、各 object への directional vector を取得する。これは segmentation の大まかな物体認識を補い、同じ方向に複数 object がある場合や、同名 object の複数個体を扱う助けになる。ただし asset 名が無意味なら逆効果になり得るため、命名規約のある開発環境が前提になる。

最後に、semantic segmentation 由来の方向別 JSON、radial object selection 由来の vector list、NPC の supporting prompt を組み合わせ、LLM への入力にする。prompt では、NPC 視点の left/right/front/back を、NPC と向かい合うプレイヤー視点へ変換する規則も与える。たとえば NPC から見て左の物体は、プレイヤーには右側に見える。この変換を明示しないと、NPC は正しい物体を言及していても、プレイヤーにとって方向が逆になりやすい。

評価は二段階である。まずゲーム技術分野で 10 年以上の経験を持つ expert に、4 条件の出力を見せる。条件は、全データ入力、semantic object segmentation のみ、supporting prompt のみ、supporting prompt + radial object selection の 4 つ。expert は全データ入力の出力を最も良いと判断し、supporting prompt のみでは hallucination や mix-up が多いと見る。一方で、物体説明が名前だけに寄る、同方向内の object 間関係や奥行きが弱い、NPC 視点とプレイヤー視点の変換が混乱を生みやすい、という限界も指摘する。

次に、expert feedback を受けて user study を行う。対象は全データ入力に近い Answer 1 と、supporting prompt のみの Answer 2 の比較で、屋内 scene と屋外 scene、各 4 問の質問を用いる。58 responses を集め、全体として Answer 1 が強く選ばれる。Table 1 では Answer 1 が各問いで 42 から 52 票、Answer 2 が 6 から 16 票に収まる。rating 差は大きくなく Answer 1 が 4% 程度高いだけだが、自由記述では Answer 1 が scene をよく分析し、重要そうな detail を拾うという肯定と、回答が長すぎる、位置関係がわかりにくい、 scene にないものが含まれるという批判が同時に出ている。

■ 内容分析
この研究の価値は、LLM NPC の「記憶」や「人格」ではなく、「観測」を明示的なデータ構造として扱った点にある。LLM 会話 NPC の多くは、character sheet、world lore、dialogue history を厚くする方向へ進む。しかしプレイヤーが実際に違和感を覚えるのは、NPC が自分の目の前の壺、扉、死体、天候、壊れた橋に触れない瞬間である。この論文は、その違和感を personality の不足ではなく perception pipeline の不足として切り分ける。

また、image segmentation と engine scene graph を併用している点も現実的である。画像だけなら object 名や位置が粗く、scene graph だけなら見た目やプレイヤーに見える情報との対応が弱くなる。両方を prompt に入れることで、LLM は「この場所には何がありそうか」を自由作文ではなく、観測済み object の集合から組み立てられる。ただし評価結果が示す通り、この設計は万能ではない。方向変換、奥行き、同方向内の相対関係、物体名の質、回答の長さが弱点になる。つまり grounding を入れた後の問題は、今度は「観測情報をどの粒度で会話に出すか」に移る。

特に重要なのは、baseline が単なる supporting prompt だけだと、LLM が森や神話的な樹木など scene にないものを作り始める例である。これは LLM NPC の失敗をかなりわかりやすく示している。文章としては雰囲気があっても、ゲーム空間の真実と接続していなければ、プレイヤーにとっては嘘になる。NPC の魅力は流暢さだけではなく、世界状態への責任を持つことから生まれる。

■ 自分達の環境への適用
Nao_u_BOT の小規模 prototype では、最初から panoramic image と segmentation を入れる必要はない。むしろ軽量版として、画面内 object、座標、プレイヤーとの相対方向、状態 flag、最近起きた event を scene graph 風 JSON にして NPC や評価エージェントへ渡すのがよい。2D ゲームなら、camera viewport 内の interactable、hazard、goal、pickup、NPC、未解決 objective を抽出し、front/back の代わりに screen-left、screen-right、near、far、blocked、reachable を持たせるだけでも効果がある。

会話 NPC だけでなく、AI reviewer にも使える。たとえば prototype 評価時に「画面には敵が 3 体、回復 item が右下、出口が閉じている」という state JSON を渡せば、LLM は一般論ではなく現在画面に根ざした助言を返せる。Phase 3b の probe としては、NPC/agent の発話ごとに `observed_state_used: true/false`、`mentions_nonexistent_object`、`direction_confusion`、`too_verbose_for_play` を記録するとよい。特に最後の項目はこの論文の user study に直結しており、正確でも長すぎる発話はゲーム中では邪魔になる。

■ メリット・デメリット
メリットは、NPC 発話を人格 prompt から切り離し、環境観測、方向変換、object relation という検査可能な部品に分けられること。LLM の自由作文を抑え、ゲーム状態に根ざした台詞や評価に近づけられる。

デメリットは、vision pipeline と scene graph 整備のコストである。物体名や tag が雑だと、LLM は雑な観測をもっともらしく語る。方向や奥行きの誤り、回答の長文化も残るため、prompt だけで解ける問題ではない。

■ 判定
部分採用。panoramic image pipeline 全体ではなく、まずは既存 game state から軽量 scene graph JSON を作り、NPC/評価 agent の発話が観測に grounded しているかを見る probe として採用する。

■ URL
https://arxiv.org/abs/2604.19192
https://arxiv.org/pdf/2604.19192
