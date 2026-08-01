■ 概要
Martin Pichlmair と Mads Johansen による survey で、game feel を「ゲームとの瞬間的な相互作用が生む affective impact を意図して設計すること」と捉え直す。出発点は、game feel が「操作が気持ちよい」「juice が多い」といった曖昧な褒め言葉に縮まり、研究と実務で共通に使える語彙が不足している問題である。著者らは学術研究、書籍、開発者の blog、podcast、講演など200件超を読み、実装技法ではなく設計目的によって内容を分類した。

整理された目的は physicality、amplification、support の三領域で、対応する polish を tuning、juicing、streamlining と呼ぶ。physicality は、速度、加速度、摩擦、制動、重力、終端速度、collision shape などを調整し、物体の挙動に一貫性と予測可能性を作る領域である。現実の物理を正確に再現することが目的ではなく、easing や animation で重さを偽装しても、読みやすく意図した感触になるなら成立する。movement parameter は level design の前提にもなる。

amplification は、screen shake、recoil、particle、色変化、hit stop、音、振動、slow motion などを重ね、行動の重要性と結果を増幅する領域である。大切なのは量ではなく、event の意味に合った方向・強度・timing を複数 channel で揃えることだ。support は、coyote time、jump buffering、corner correction、無敵時間、aim assist などで入力を状況に沿って解釈し、精密な simulation よりプレイヤーの意図を成立させる領域である。trail、decal、debris も装飾に限らず、過去の軌跡を現在の画面へ残して速度や方向を読ませ、記憶負荷を下げる支援になり得る。

三領域は独立した部品表ではない。Dark Souls の backstab は位置補正、camera 固定、専用 animation と音、実行中の無敵を一つの入力へ重ね、物理性、増幅、支援を同時に作る。論文の結論は、game feel を快適さの同義語にせず、期待した反応と実際の system feedback の関係を細かく設計する中心作業として扱うこと、意図された抵抗や不快さも価値中立的な game feel に含めること、そして三分類を研究者と実務家が設計意図を話すための出発点にすることである。

■ 内容分析
この論文で最も使えるのは、技法を「何を足したか」ではなく「何のために働いたか」で分類する点である。同じ screen shake でも、重さを伝えるなら physicality、重要性を強めるなら amplification、方向を読ませるなら support になり得る。複数領域にまたがる分類は、実装名から設計効果を決めつけない仕掛けである。juice を増やす前に、挙動が予測できないのか、結果が知覚できないのか、入力意図が棄却されているのかを分けられる。

もう一つ重要なのは「coherence」である。単一 effect の派手さより、rule 上の結果、object の動き、音、画面反応、入力救済が同じ event の意味を示す必要がある。論文は、feedback が rule と異なる意味を示すと frustration や学習困難を生むと指摘する。例えば弱い攻撃なのに大きな hit stop と爆発音を出す、当たり判定は外れているのに接触 animation を出す、失敗入力を救済したのに表示上は完全成功として扱う、といった不一致は、一瞬は派手でも system model の学習を壊す。ここでは game feel は装飾工程ではなく、期待と結果の対応を校正する工程になる。

ただし、これは三分類の効果を直接検証した実験論文ではない。200件超という量は大きいが、検索式、採択・除外条件、coder 間一致など systematic review の再現手順は示されていない。参照資料の多数は開発者が自作の一作品・一機能を語る descriptive な記録で、論文自身も一覧は網羅的でないと明記する。juice については引用先の大規模研究で、medium / high が extreme / none より player experience、intrinsic motivation、play time、game performance で優れた結果が紹介されるが、これは三領域全体の妥当性評価ではない。三分類は証明済みの尺度ではなく、散在する実践知を設計目的で束ねた taxonomy と読むべきである。

射程にも偏りがある。論文は主に visual / haptic と real-time interaction を扱い、narrative、music、atmosphere は影響を認めつつ範囲外に置く。movement の記述は2D game が多く、音は重要なのに研究不足だと自ら認める。文献化されにくい特殊 mechanic は survey 内で軽くなるため、頻出項目を重要度順と誤読してはいけない。また support は粗さを消せる一方、正確さそのものを挑戦にする作品では coyote time や aim assist が意図した抵抗を壊す。評価すべきなのは滑らかさの最大化ではなく、狙った感情と知覚される因果の一致である。

■ 自分達の環境への適用
操作系 prototype では、一つの重要 event ごとに三層を別々に記録する。例えば jump なら、physicality に加速度、重力、終端速度、離陸と着地の collision、入力から状態遷移までの遅延を書く。amplification には animation、着地音、particle、camera、freeze の開始時刻と強度を書く。support には coyote time、buffer 幅、corner correction の発動条件を書く。その上で「狙う affect」「プレイヤーが予想する結果」「rule 上の結果」「画面・音が示す結果」を並べる。不具合を juice 不足と一括せず、どの層の不一致かを特定してから修正できる。

検証は一度に全層を盛らず、短い ablation にする。基準版、tuning のみ、feedback のみ、support のみ、三層統合版を同じ room と入力課題で比べる。人間 playtest では、成功率、習得までの試行数、予測した着地点と実際の差、失敗理由の自己説明、意図しない支援に気付いた割合、快・不快ではなく「狙った重さ／緊張／解放が伝わったか」を取る。juice は弱・中・強・極端の段階を作り、強くするほど良いという前提を置かない。支援も発動率と成功率だけでなく、誤った意図を救済した false assist を記録する。

headless 評価で感情そのものを代替する必要はない。deterministic に測れるのは、固定入力に対する軌跡、加減速 curve、jump apex、collision の再現性、input buffer と coyote window の境界、支援前後の状態遷移である。event trace には rule event と各 cue の発火 frame、表示時間を残し、重大度と feedback 強度の逆転や過度な遅延を検査する。自動 agent の到達率は human-readable な feel の証拠ではないため、headless は因果の整合性と再現性、人間は知覚と affect を担当させる。

制作記憶には「操作感を改善した」ではなく、変更した parameter、三領域の目的、狙った affect、測定値、失敗条件を一組で残す。特に、feedback 追加で event 理解は上がったが visual clutter で被弾が増えた、buffer 拡張で初見成功率は上がったが熟練者の精密操作を奪った、という反証を保存する。次の prototype では mechanic 名ではなく「予測可能性」「event 重要度」「入力意図支援」から recall でき、作品固有の目標に合う過去差分だけを再利用できる。

■ メリット・デメリット
メリットは、曖昧な「気持ちよさ」を三つの設計目的へ分解し、programmer、designer、artist、sound の間で修正対象を共有できること、effect の量ではなく rule と feedback の整合性を見られること、headless の状態検査と人間 playtest の感情評価を役割分担しやすいことにある。技法一覧も prototype の診断漏れを減らす check list として有用である。

デメリットは、taxonomy 自体の比較実験がなく、文献収集手順も再現しにくいこと、三領域が重なるため機械的な採点尺度にはしづらいこと、2D movement と視覚・触覚に記述が寄ることだ。項目を全投入すると過剰な feedback と不可視の救済が作品の抵抗、可読性、accessibility、熟練余地を壊す。分類は完成条件ではなく、意図と不一致を発見する診断表に限定する必要がある。

■ 判定
部分採用。physicality / amplification / support と tuning / juicing / streamlining の対応を、操作感の原因分解と playtest 設計の共通語彙として採用する。一方、一覧を品質保証済みの処方箋や重要度順としては採用しない。まず一つの movement prototype で三層の ablation、event trace、人間の予測誤差と false assist を測り、狙った affect と rule-feedback coherence を改善できるかで継続判断する。

■ URL
https://arxiv.org/abs/2011.09201
