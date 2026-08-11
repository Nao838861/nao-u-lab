■ 概要
最先端 LLM は一回の推論では難問を解けても、数時間続く agent task になると、以前の決定を忘れる、未完了なのに完了を宣言する、目標から静かに逸脱するといった失敗を起こす。本 survey は、この単発能力と長期タスクを確実に完遂する能力の隔たりを「horizon gap」と定義し、2024〜2026年の arXiv 論文1,547件を、計画、記憶、実行、訓練、評価、基礎・安全の6領域に整理した。

最初の重要な整理は、混同されやすい3概念の分離である。long-horizon は必要な逐次判断数という task の性質、long-context は一回の推論で参照できる token 数という model / serving stack の性質、long-term memory は step や session を越えて情報が残るかという system の性質であり、互いに独立する。巨大 context を持っても session を越える記憶がない system は作れるし、短い context でも外部記憶と要約を使って長い task を運べる。この分離に加え、horizon をどこで支えるかを、①一つの context 内、②一つの task だが context 外まで harness が継ぐ、③複数 task / session を越えて知識や技能を蓄積する、の3位置に分ける。6領域×3位置の格子によって、同じ「長期 agent」でも失敗箇所を区別できる。

文献収集は8系統の arXiv query から始め、重複除去後1,939件から古典的 multi-agent RL、robotics、時系列予測など520件、26.8%を除外した。基礎・安全が10件しか残らなかったため128件を補い、最終1,547件とした。内訳は計画182、記憶397、実行584、訓練167、評価114、基礎・安全103。各領域で「horizon が伸びると何が最初に壊れ、何が補償するか」を追っている。

結論は、長くなるほど最終結果だけの pass / fail や単一 reward が情報を失い、実行途中の密な信号が必要になるという収束である。計画では固定計画の一貫性と逐次再計画の頑健性が衝突し、記憶では context の忠実度、外部 store の拡張性、weights の永続性・監査困難性が交換条件になる。実行では model 単体より例外処理、再試行、分担、回復を持つ harness が効く一方、scaffold を増やし過ぎると逆に実行との不整合が増える。訓練では終端 reward の credit assignment を trajectory segment や graph に分け、評価では Pass@1 を trajectory-level diagnostics、再試行信頼性、汚染・弱い test の監査へ置き換える。最終的に、保存、採点、監査、debug の共通単位が outcome から execution trajectory へ移っている、と survey はまとめる。

■ 内容分析
この論文の価値は、新しい agent 手法の性能を示すことではなく、長期失敗を「context が足りない」の一語から解放する共通座標を作った点にある。特に episode と session、agent と harness の区別は実務的である。同じ model でも、tool sandbox、memory read / write、retry、recovery、subtask 管理が違えば完遂可能な長さが変わる。したがって model 名と最終成功率だけを記録しても、能力向上が model 由来か harness 由来か判別できない。論文自身もこれを最重要の未解決測定問題とし、harness 研究が多い事実は「harness が支配的」の証明ではなく、model 再訓練より安く反復できる研究費用構造の反映かもしれないと抑制している。

trajectory 重視には具体的根拠がある。SWE-bench 系では、漏洩と弱い test を除くと、ある system の解決率が12.47%から3.97%へ落ち、test を通った patch の約30%が人間の正解 patch と挙動上ずれるという研究が紹介される。TRAJEVAL は16,758 trajectory を段階分解し、正しい code に到達した後でも一貫性が崩れる failure を抽出した。Vending-Bench では20M token を超える run が滑らかに劣化するのではなく、利益を出す run と回復困難な meltdown に二分され、context 使用量だけでは崩壊を説明できなかった。つまり「各 step が独立に小確率で失敗し、長さに応じて指数的に悪化する」という素朴な model は null hypothesis にはなるが、実データの burst、段階依存、二峰性を説明し切れない。

一方、この survey 自身も強い実証結論としては読めない。corpus は単一 annotator が rule と個別 override で一分類に割り当て、title だけでも13.8%が複数 category の signal を持つ。残存誤分類は約5%と見積もられ、境界は曖昧である。2026年論文が各 category の58〜77%を占め、citation を使わないため、研究量は成熟度や有効性を表さない。非英語、企業内 harness、blog も過小代表で、公開予定の corpus と script も本文時点では第三者再現が完了していない。

さらに、process signal が重要という主張には二重の注意が要る。訓練側の process reward と評価側の trajectory metric が同じ「良い途中経過」の直感を共有すれば、共通の盲点を相互に正当化する correlated measurement bias が起き得る。ただし論文は、特定の training signal と benchmark の循環を実証したわけではなく、異なる前提から作った process signal 同士を比較する実験も corpus にないと明記する。ここは発見ではなく、次に測るべき構造的 risk である。

■ 自分達の環境への適用
ゲーム制作では、1 commit や1 build の成否を episode、複数 session にまたがる「仕様を保ったまま playable diff を完成し、playtest で問題を見つけて直す」流れを task horizon と定義する。まず model、harness、task、trajectory を別々に記録する。trajectory の各 checkpoint に、現在の goal、採用済み制約、未完了項目、変更 file、実行 command、test 結果、目視確認、失敗分類、回復行動、完了根拠を残す。context compaction や session 移行時には、単に短く要約できたかではなく、後続で必要になった制約が保持されていたかを遡って採点する。

headless 評価は最終 build の成否に加え、①仕様保持率、②検証実施率、③失敗検知までの step 数、④回復率、⑤未完了を完了と誤宣言した率、⑥再試行成功率、⑦人間の所要時間との比を取る。playtest も入力、game state、停滞箇所、再計画、復帰を保存し、level 難度、仕様忘却、観測不足を分離する。

小さな検証は、同じ model と同じ game task を使う2×2比較にする。harness は①現状、②明示 checkpoint・例外処理・回復 gate 付き、context は①通常、②圧縮または session 境界あり、とする。各条件を複数回走らせ、最終成功率だけでなく上記 trajectory 指標を比較する。harness 改善で長い task だけが伸びれば補償効果、短い task まで悪化すれば scaffold 過多を疑える。process signal も一種類に依存せず、機械的 test、game state invariant、人間の目視 rubric のように前提が異なる三系統を残し、不一致を失敗ではなく診断対象にする。

記憶システムでは、現在 task の作業状態、session を越える仕様・判断、task を越えて再利用する procedure を分離し、source、失効条件、利用 checkpoint を持たせる。失敗から得た procedure は成功判定の検証まで結び付ける。誤判定を skill として再利用すると、記憶が失敗の増幅器になるためである。

■ メリット・デメリット
メリットは、長期 task の失敗を model の弱さ、context 容量、memory、harness、評価器のどれかに早合点せず、比較可能な語彙と log schema に落とせること。trajectory を残せば、完成物だけでは見えない目標逸脱、誤った完了宣言、回復不能点を検出でき、同じ model のまま harness 改善を評価できる。

デメリットは、trajectory 保存が token、storage、privacy、review cost を増やし、細かい checkpoint 自体が制作を遅くすること。途中指標を最適化すると、test 数や log の整然さだけが上がり、ゲームの面白さや完成品質が上がらない proxy gaming も起こる。また本論文は広い survey で、分類件数から個別手法の因果効果や最適な checkpoint 間隔を導けない。安全・基礎領域は補足 query に93件依存しており、領域間の件数比較にも sampling bias がある。

■ 判定
部分採用。採用するのは、long-horizon / long-context / long-term memory の分離、agent / harness の分離、最終成否と trajectory 診断の併記である。大規模な記憶拡張や多段 scaffold は先に導入せず、1つのゲーム task で checkpoint 付き2×2比較を行い、回復率と誤完了率が改善し、制作時間と面白さ評価を悪化させない場合だけ広げる。

■ URL
https://arxiv.org/abs/2608.06663
