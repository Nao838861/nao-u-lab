■ 概要
「Confident at the moment of action」は、LLM agent の自己申告 confidence を「高ければ自動実行、低ければ人へ委譲」という gate に使う際、その confidence が実際の正しさを追跡しているかを、hidden-information game の行動時点で測った研究である。通常の QA calibration は回答と confidence が同じ出力であり、game benchmark は行動と勝敗だけを見るため、「何を信じていたか」と「何をしたか」を分離できない。本研究は、この測定上の穴を Regent Chess というデジタル chess variant で埋める。

Regent Chess では、勝敗を決める royal status を Original King から任意の自駒へ秘密裏に移す Crown Shift が第4 turn から使え、その後も15手ごとに再使用できる。engine は全 Shift を内部記録するため、各 ply の真の Regent を終了後に復元できる。agent は move と別に、相手のどの生存駒が Regent かを top-k の square・probability と residual mass で申告する。対戦相手は固定・決定論的・source-visible な heuristic agent である。

評価は二系統に分かれる。capture-only は agent が駒を取った瞬間、その square へ置いた確率と真の Regent かを対応させる。every-ply は parse 可能な全 ply の全候補を ground truth と照合する。どちらも、その時点の相手の生存駒数から毎回計算した uniform prior を baseline とし、Brier score と paired bootstrap confidence interval を使う。Crown Shift 前は King が確定しているため board-ply 8 未満を除外する。

完全な calibration 評価を受けた S1（Gemini 3.1 Flash-Lite）では、confidence 0.5 以上で capture した事象が、初回 batch 0/22、独立 replication 1/40、合計1/62しか正しくなかった。capture 時 Brier score は0.1445、matched uniform は0.0203で、比の95% CIは3.8–15.9倍。差の99.3%と98.7%が高 confidence capture に集中した。every-ply でも ply 8以降は両 batch で uniform より悪く、深い cutoff ほど差が拡大した。

追加4構成の high-confidence capture も14.3～50.0%だったが、有意差が確認できるのは両端だけである。同じ model でも max tokens を4096から16384へ変えるだけで10.8 point 動き、外部 chess score と calibration の因果関係は主張できない。別 seat では、拡張推論を切ると合法手率、費用、速度が全て改善した一方、well-formed belief は3.8%まで崩れた。通常の運用指標は hidden state を追う能力を保証しない、というのが結論である。

■ 内容分析
この研究で重要なのは「LLM は過信する」という一般論より、信念と行動を同一 trajectory 内の別 channel として測った設計である。実例では、agent が二つの square に70%と20%を置き、確率0の別 square を通常の戦術理由で capture したところ、そこが真の Regent で勝利した。outcome-only 評価は成功と記録するが、実際には正しい信念に基づく成功ではない。結果、belief quality を改善していない構成を、安価で速く合法的だという理由で選ぶ危険まで示される。

失敗の形も単純な accuracy 低下ではない。S1 は複数候補を申告した91 capture のうち、実際に取った square を候補へ含めたのが24件、26.4%だけで、exposure-matched permutation null 29.2%と有意差がなかった。73.6%の capture は申告候補外だった。一方、候補に入った24件では上位に置く傾向があり、論文は当初考えた rank inversion を撤回し、candidate coverage gap と限定している。top-k 形式なので「考慮しなかった」と「候補数制限で落ちた」は区別できず、この数値を内部思考の直接証拠にはできない。

長期 interaction 固有の劣化もある。well-formed rate は序盤85.6%、中盤47.8%、深部41.0%、illegal attempt は1.2%、4.5%、20.0%へ悪化した。通常 chess control も中盤65.7%へ落ちるため、一般的な context growth と hidden tracking の追加負荷を分けて読む必要がある。静止盤面一枚の screening は実 game より28.4 point、別 seat では41.2 point高く見積もり、単発 probe は長期 agent の代用にならない。

最大の注意点は task tractability である。shift target は公開盤面特徴から top-3 83.1%で予測できたが、固定 opponent の shift timing は policy 上ほぼ random で、内部状態を見られる oracle も public predictor をほとんど上回らなかった。両方が必要なので、どの predictor も shift 後に uniform を安定して超えられていない。これは「S1 は推論可能な真実を外した」という強い能力批判を弱める。しかし予測不能なら適切な申告は diffuse な低 confidence であり、0.5以上を集中させて外す calibration failure は残る。論文自身が capability と calibration、予測可能性と確信の妥当性を分けた点は信用できる。

■ 自分達の環境への適用
headless AI playtester の評価へ、勝敗、完走率、合法手率、時間、費用とは独立した belief calibration lane を追加する。hidden enemy state、未観測 room、NPC intent、procedural rule の推定が行動に影響する場面で、各 decision ごとに observation snapshot、候補ごとの確率、residual mass、選択 action、後で確定した ground truth、build hash、seed を別 field として保存する。評価は outcome、Brier score、high-confidence error、action target coverage、well-formed rate を混ぜずに並記する。

最小 probe は hidden state が一度だけ変わる deterministic game を20～30 episode回す。uniform baseline は候補数に応じて毎 step 再計算し、真実が rule で確定する導入区間は除く。静止 state、trajectory 内、belief と action を同じ call で出す joint 条件、別 call の split 条件を比較する。採用 gate は勝率でなく、高 confidence error、長期の parse と calibration、action と候補集合の乖離に置く。

記憶システムにも限定適用できる。atom の confidence を保存・supersede・自動実行の直接 gate にせず、source provenance、再現証拠、後日確定した真偽から calibration を事後監査する。自信の高い記述だけを残す方式は、誤りを強く固定する可能性がある。confidence は evidence の代替ではなく、どの条件で誤るかを測る観測値として扱う。

■ メリット・デメリット
メリットは、正しい信念に基づく成功と偶然の成功を分離できること、安価・高速・合法という指標が belief quality を隠す選定バイアスを検出できること、ground truth を復元できる game design 自体を評価装置にできることにある。対象 population を揃えた baseline、確定区間の除外、事前 falsifier も再利用しやすい。

デメリットは、完全な評価が実質1 seat、固定 opponent、単一 game に限られ、追加 seat は小標本で構成も揃わないことだ。top-k 申告は潜在信念そのものではなく、joint elicitation はmove生成へ干渉し得る。hidden state の timing もほぼ予測不能で、task capability の比較器としては弱い。実環境への transfer は未検証である。

■ 判定
部分採用。採用するのは、headless trajectory で observation・belief・action・事後 ground truth を分離し、outcome と calibration を並列評価する測定設計である。Regent Chess の数値や model 順位は一般化せず、まず小さな hidden-state probe で joint / split elicitation、長期劣化、予測可能性の ceiling を測る。confidence 単独で自動実行を許可せず、再現可能な evidence と外部 verifier を優先する。

■ URL
https://arxiv.org/abs/2608.24691v1
