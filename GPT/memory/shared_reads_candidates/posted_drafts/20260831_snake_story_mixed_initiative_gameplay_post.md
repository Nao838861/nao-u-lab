■ 概要
Snake Story は、生成AIとの共同執筆を「文章候補を選ぶだけの創作支援」に留めず、古典的な Snake の生存判断と衝突させた FDG 2024 の research-through-design 研究である。問題設定は、既存の mixed-initiative storytelling game が物語生成を中心に据えるため、明確な勝敗や時間圧を持つ gameplay と共同創作がどう共存するか十分に調べられていないこと。著者らは、物語を考える熟慮と twitch gameplay は本来相性が悪いという緊張を、消すのでなく設計材料にした。

prototype は round 制で、盤面に二つの candy と、それぞれに対応する GPT-3 text-davinci-003 の続き文を出す。player は25秒の pause 中に文章を読み、その後 snake を操作して一方を食べ、対応文を物語へ追加する。number 1 の候補は temperature 0.6 の比較的 coherent な文に対応し、candy 効果は赤なら体力1減少、黒なら障害物3個追加、白なら効果なし。number 2 は temperature 1.4 の創造的だが逸脱しやすい文で、白は効果なし、青は次 round に自作文用の黄 candy を出し、緑は体力を1回復する。黄を取ると45秒の入力時間が与えられる。snake は最大5 life、衝突で1 life を失い、死亡時だけAIが80語以内の結末を付けて終了する。つまり「好みの続きを選ぶ」と「生き延びる」が、同じ candy 選択の二つの効用になる。

米国の大学で game design を学ぶ11名が tutorial 後、死亡まで10〜15分 play し、think-aloud を行った。終了後には15〜20分の semi-structured interview を実施し、画面・音声・生成候補・選択・完成物も記録した。一人の研究者が open coding で theme を抽出した。全142 round、平均12.91 round、完成物は平均272.64語。temperature 1.4 の候補は89回、0.6 は43回、自作文は10回選ばれた。正効果の緑は生成46個中31個、青は47個中30個が選ばれた一方、負効果の赤は47個中11個、黒は50個中18個だった。黄は40個出たが選択は10回、実際に黄を選んだのは3名だけだった。

質的結果では、参加者の自己認識が三つに分かれた。writer 3名は文章品質と authorship を重視し、時間制限や欲しい文に付く負効果を創作の妨害と感じた。player 2名は生存と rule 探索を優先し、物語をほぼ無視した。reader 6名はAIを主な書き手、自分を続きを読む者と捉え、長く生存することを次の文章へ進む動機にした。全員が自身の著者性を中立以下と感じ、2名は生成文を読まず、5名は短く流し読みした。著者らの結論は、単一の設計で三役を同時に満たすのでなく、writer には創作目標と mechanic を整合させ、player には物語成果を報酬へ強く接続し、reader には narrative progression と難度曲線を同期させるべき、というものだ。

■ 内容分析
この研究の強みは「AIが良い文を出せるか」ではなく、生成物への関心を可観測な資源配分へ変えた点にある。文章だけを比較する状況、体力に余裕がある状況、死が近い状況で選択が変わるため、創作・勝敗・鑑賞の優先順位が行動として表れる。reader にとって生存は物語と競合せず、続きを得るための進行条件になる。これは mechanic と narrative が同じ報酬連鎖を形成した状態であり、三分類の中で reader が最多だった理由を説明できる。

ただし、89対43を「参加者は高 temperature の創造性を好んだ」と読むことはできない。temperature 0.6 は負または中立効果、1.4 は正または中立効果へ固定され、文体と gameplay utility が交絡している。candy の生成数も同数ではない。選択率は青・緑が高く赤・黒が低く、think-aloud でも危機時に文章を犠牲にしたため、差の少なくとも一部は生存選択で説明できる。論文本文には number 1 / 2 の対応を取り違えた記述もあり、再利用時は temperature、文章品質、効果を独立に randomize すべきである。

著者性の低さも単純な欠陥ではなく、役割ごとに意味が違う。writer には失敗で、選択肢と短い入力機会だけでは「書いた」と感じられない。player には無関係で、reader には責任をAIへ預けて楽しめる利点になり得る。したがって co-creative を名乗ること自体を成功指標にせず、主体的に書かせたいのか、選択で方向付けさせたいのか、生成物を発見させたいのかを先に決める必要がある。

限界も明確である。11名は全員 game-design student、単一大学、単一 session、単純な Snake だけで、三役は安定した player type ではなく、この prototype が生んだ一時的な stance かもしれない。質的 coding は一人で行われ、coder 間一致はない。比較条件もなく、25秒 pause、candy 効果、temperature、UI のどれが役割分化を生んだか切り分けられない。著者の shooter や platformer への拡張案も未検証である。

■ 自分達の環境への適用
採用すべきなのは Snake の外形ではなく、「生成物の選択を game state の不可逆な変化へ接続し、優先順位を play trace から読む」という設計である。narrative prototype なら、二つの生成候補に同じ gameplay value を付ける control round と、異なる risk / reward を付ける conflict round を混ぜる。各 round で候補ID、品質条件、効果、選択時のHP、残り時間、読了時間、自作文利用、終了後の役割自己認識を保存する。発話だけでなく、余裕時と危機時の選択反転を主要 evidence にする。

最小 probe は12〜20 play 程度でよい。文章条件と効果を独立に割り当て、①coherent / risky 対 creative / safe、②creative / risky 対 coherent / safe、③同効果同士を均等に出す。headless test は生成候補、割当、seed、game state transition、終了条件の再現性を検証し、人間 playtest は選択率、読まずに決めた割合、危機時の反転、自己入力率、役割認識を測る。これなら文章嗜好と生存戦略を分離し、mechanic が創作を支えたのか上書きしたのか判断できる。

制作サイクルでは、企画時に writer / player / reader のどれを主対象にするかを一本決める。writer 向けなら良い文章と正効果を整合させ、編集・差戻し・保留を許す。player 向けなら物語の coherence や発見が能力・地形・敵配置へ反映される機械的接続を作る。reader 向けなら生存時間を「次を読める長さ」へ直結させつつ、climax 前後で難度を上げ下げする。三者を同時に最大化せず、非対象 stance がどのように脱落するかも failure condition として記録する。

■ メリット・デメリット
メリットは、小さな既存 mechanic でも生成AIを装飾から decision system へ移せること、player の価値判断をログで観測できること、生成文の完全な品質評価がなくても risk を払った選択から相対的選好を読めることだ。AI latency を pause に組み込み、物語の成長と snake の成長を対応させた点も prototype の理解コストを下げている。

デメリットは、強い gameplay が創作 attention と authorship を奪い、AI生成文が「読まなくてもよい報酬ラベル」へ退化し得ることだ。文章品質と効果を固定対応させると因果が読めず、LLM の偶発的な品質差が難度調整まで汚染する。時間圧は writer を排除しやすく、自由入力を希少報酬にすると共同執筆を掲げながら人間の執筆がほぼ発生しない。生成内容から能力や難度を動的生成する案は魅力的だが、制約・安全性・再現性を別途設計しなければならない。

■ 判定
部分採用。生成候補を game state の reward / risk に接続し、余裕時と危機時の選択差から stance を診断する原則は採用する。一方、temperature と効果の固定対応、創作と twitch 操作の同時要求、writer / player / reader を恒久属性として扱うことは採用しない。独立 randomization と control round を持つ小規模 probe で、主対象の体験を強めながら非対象の脱落条件も観測できた場合だけ本実装へ進める。

■ URL
https://arxiv.org/abs/2404.07901
