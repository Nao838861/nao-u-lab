■ 概要
対象は「Self in Space: Benchmarking Self-Awareness and Spatial Cognition in UAV Embodied Intelligence」。既存の UAV 向け multimodal large language model（MLLM）評価は、映像中の物体やランドマーク、位置関係など「外界」を理解できるかに偏り、移動している機体自身の向き・運動・行動履歴を一貫して保持できるかを暗黙にしてきた。論文は、embodied agent には周囲の空間だけでなく、その空間の中で変化する自己状態の表現が必要だとして、両者を self-in-space という一つの評価問題にまとめる。

提案する SIS-Bench は、評価対象を spatial cognition（外界）と self-awareness（自機）の二軸に分け、各軸を perception・memory・reasoning の三段階で測る。13 task は物体・属性・相対方向、landmark の順序・想起・位置関係、空間／時空間整合性、action の認識・順序・想起・予測、経路計画を覆う。単一 clip は即時知覚、2～4 clip の連結映像は記憶、長時間映像と時系列を入れ替えた映像は推論に割り当てる。

データは三つの実世界 UAV dataset を処理した 1,646 video、4,856 四択 QA から成る。既存 action label の再構成、VLM 製 scene metadata の人手修正、長時間・経路推論の専門家注釈を使い分け、全 QA を二名が独立確認する。最大 32 frame に sampling し、6 proprietary・20 open-source model を zero-shot で比較した。人間平均 91.7% に対し最良 model は 71.6%。perception から memory、reasoning へ進むほど低下し、外界より自機の動態理解が弱かった。

さらに著者らは、自己運動を明示すれば両軸が改善するかを SIS-Motion で検証する。標準 video MLLM の appearance encoder と並列に optical flow の motion encoder を置き、時空間を visual token と揃えた後、軽量 connector で融合する。54K の追加 instruction data で Qwen2.5-VL を LoRA fine-tuning すると、同じ data を使う visual-only SFT に対し、Spatial Avg は 72.0→74.2、Self Avg は 60.3→63.7、overall は 66.4→69.1。効果は Object Attribute、Landmark Recall、Positional Relationship、Action Sequence、Action Recall など perception / memory に集中し、Action Prediction は改善せず、reasoning への効果は不安定だった。一方、OpenUAV から作った 22 simulated environment・3,895 問の経路選択 task では、backbone の 71.2% に対し SIS-Motion は 92.2% を記録した。結論は「motion cue は self だけでなく、視点変化下の space 理解にも効く。ただし motion representation だけで高次推論は解けない」である。

■ 内容分析
この研究の価値は、新しい原子 task を大量に発明したことより、失敗を「外界／自機」×「知覚／記憶／推論」の格子へ分解したことにある。例えば経路選択を間違えた時、物体を見落としたのか、左右を誤ったのか、過去の landmark 順を忘れたのか、自分が旋回した履歴を失ったのかを、aggregate accuracy の裏に埋めずに診断できる。環境中心の benchmark では、agent が画面内容を説明できれば空間能力があるように見える。しかし embodied な操作では、カメラの変化が対象物の移動なのか自機の移動なのかを区別できなければ、観測を行動へ接続できない。self と space を独立項目にしながら、motion 介入が双方を改善することを示した点が中核である。

評価では単一、連結、長時間、shuffled の video type を認知段階へ対応させ、reasoning task は専門家が route と distractor まで作る。26 model、human、四種の optical-flow encoder、3B/7B backbone、別 navigation set まで比較した点は強い。ただし訓練 data は benchmark と同じ task template を使うため、改善には motion 表現だけでなく task alignment も混ざる。visual-only SFT を対照にしても効果量は +2.7 point。下流 +21 point は大きいが、連続 navigation を四択の操作列選択へ変えた open-loop 評価であり、閉ループ飛行の成功率ではない。

失敗条件も重要である。最大 32 frame への圧縮は長時間 continuity を失わせ得る。optical flow は自機運動と画面内 object motion を直接分離せず、被写界深度、遮蔽、小物体、急な高度変化にも弱い。実験でも Action Prediction は SFT 45.2% から 44.1% へ下がり、Path Planning は 20.6→23.5% と僅かな改善に留まる。つまり motion cue は「何がどう動いたか」の evidence を増やすが、目標、因果、将来の action sequence を組み立てる planner の代替にはならない。

■ 自分達の環境への適用
直接使えるのは model architecture より評価格子である。一人称・三人称 3D prototype の headless test を、外界 perception（対象の存在・属性・相対方向）、外界 memory（通過 landmark・順序・現在位置関係）、自機 perception（現在の移動・旋回・接地状態）、自機 memory（直前 action と action sequence）、reasoning（次の操作・goal までの route）の小テストへ分ける。最終的な「goal 到達率」だけでは同じ失敗に見える run を、視認失敗、自己姿勢の喪失、履歴忘却、planner 破綻へ分類できる。

最初の probe は小さくできる。固定 seed の navigation scene を一つ用意し、engine telemetry から object ID、player pose、velocity、camera transform、action history、正解 route を保存する。同じ replay から、現在 frame だけ、数区間を連結した履歴、順序を崩した履歴を生成し、上の 2×3 格子を各 5 問程度で測る。映像だけの evaluator と、frame difference / optical flow または telemetry 由来 motion summary を追加した evaluator を同一問で比較する。採用判定は overall が上がったかではなく、self-memory が改善したか、別 map / seed へ移っても維持されるか、reasoning の誤答を motion cue で隠していないかで行う。

ゲームでは telemetry から正解 label を安く確定できる。ただし入力へそのまま渡すと視覚能力の測定ではなくなるため、正解生成用 ground truth と推論時の観測を分け、RGB-only、RGB+motion、RGB+限定 self-state の三条件を固定する。2D 固定 camera では優先度を下げ、自由 camera、慣性、遮蔽、再訪がある prototype で使う。

■ メリット・デメリット
メリットは「遊べなかった」を能力別の failure signature に変え、camera motion と world motion の混同を独立評価できること。単一 frame から履歴・推論へ負荷を上げれば、退行点を regression test に残しやすい。engine ground truth を annotation に使えば、小規模でも精密な harness を作れる。

デメリットは、四択 QA の精度がそのまま playable な閉ループ行動を保証しないこと、task ごとの問題数を増やすほど benchmark 制作自体が目的化しやすいこと、motion encoder の導入には optical-flow 計算と multimodal connector の学習が要ることにある。特に推論 task の低さは、知覚改善を planner 改善と誤認してはいけないという警告になる。小型 prototype では 13 task を全移植せず、実際の失敗を分ける最小 task だけを採るべきである。

■ 判定
部分採用。SIS-Motion の学習系は直ちに導入せず、self／space × perception／memory／reasoning の診断格子を 3D navigation の headless harness に採る。固定 scene の RGB-only と RGB+motion を比較し、self-memory の改善、別 seed への転移、closed-loop goal 到達との相関が確認できた場合だけ motion 入力を拡張する。

■ URL
https://arxiv.org/abs/2607.12477
https://arxiv.org/html/2607.12477
