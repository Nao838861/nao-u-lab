■ 概要
ツール利用 agent の評価は、API や検索、ファイル操作が正しい応答を返す前提に寄りすぎている。実運用では timeout や rate limit のような一時故障、認証切れや schema drift のような継続故障、形式上は成功しているが値が古い・欠ける・誤る silent failure が起きる。この論文の中心は、故障後の頑健性を「何度も試す粘り」ではなく、同じ経路を再試行する Retry、同等の別経路へ移る Switch、利用可能な経路が尽きた時に中止・エスカレーションする Abstain の選択問題として定式化した点にある。

提案する Bench2Robust は、既存 benchmark と agent の間に adapter を挟み、tool response だけを壊す。clean 60%、残りを timeout、rate limit、server/auth error、malformed response、schema drift という明示的故障6種と、partial、stale、factual error という silent corruption 3種へ配分する。さらに episode ごとに解決可能性を固定する。S1 は retry で回復可能、S2 は主要経路を episode 全体で遮断して同等 tool への switch を必須化、S3 は全経路を遮断して継続不能にする。これで偶然の回復と方策の正しさを分ける。

回復支援は二層ある。Bayesian Tool Memory（BTM）は tool×error の回復率だけでなく、代替 tool 表、情報粒度、不可逆操作前の検証、retry と escalation の制約を system prompt に供給する。もう一つは Qwen3-4B に S1→S2→S3 と難度を上げる curriculum と DAPO を使う RL で、長い episode と同一 call 反復を罰し、部分成功にも reward を与える。Combined Retail 1,339 task で訓練し、402 held-out task と別 domain で評価した。

7 model・4 family・10 task/domain slice の69/70で故障注入後に性能が落ち、最大低下は46.7 percentage points。4B base の held-out Retail は、代替 tool なしで20.1%、ありで31.9%だった。推論時 BTM だけで36.9%/43.6%、RLだけで26.4%/38.8%、併用で40.8%/45.5%となり、clean 性能は64.3%から63.9%でほぼ維持された。したがって、環境固有の recovery map を実行時に渡す効果が最も大きく、RL は別の回復行動を補う、というのが結論である。

■ 内容分析
最も価値があるのは RL の数値ではなく、scenario-controlled solvability である。普通の chaos test は失敗率を増やせても「この episode の正解は retry か switch か」を固定しない。Bench2Robust は解決可能性を環境側で決めるため、同じ操作を続けて偶然成功した agent と、故障の持続性を判断して代替経路へ移った agent を分離できる。成功率だけでなく、S1 retry success、S2 switch success、まだ経路があるのに人へ渡した premature escalation を測る設計も重要だ。

一方、BTM の名称は慎重に読む必要がある。ablation では constraint と fallback map だけの static context が base 23.2%を33.7%へ上げ、posterior 値を正しくした場合37.8%、値を shuffle した場合38.3%だった。推論時の主因は Bayesian calibration ではなく、代替経路と回復制約を明示した構造である。tool failure 履歴から精密確率を推定しないと始められない手法ではなく、まず recovery topology を書けば大半の利益が得られる、と読める。

RL の寄与も一様ではない。Base+BTM に対し RL 単独は S2 success を16.8%から35.3%へ上げ、premature escalation を52.5%から41.7%へ下げたが、各 policy が辿った trajectory で標本構成自体が変わるため厳密な因果比較ではない。未見 domain への増分も Airline +2.7 points、BFCL +1.5 points と小さい。回復行動の一部は移植できても、tool 固有の代替関係は環境から供給し続ける必要がある。

最大の限界は表題にある Abstain の検証が弱いことだ。S3 は訓練に入るが、元 benchmark の evaluator は不可能 task の正しい中止へ正 reward を与えない。論文自身も「abstention を十分に学習したとは主張しない」としており、held-out の行動証拠は retry と switch が中心である。また silent error の pass rate は、壊れた値を agent が採用した率ではなく最終 task completion なので、途中で誤値を信じたかは直接測っていない。完全手法と vanilla GRPO の45.9%対23.0%も curriculum、KL 安定化、reward shaping を同時に変えており、どの要素の効果かは分離できない。

■ 自分達の環境への適用
ゲームの headless playtest と制作自動化には、RL を入れる前の評価 harness を採用できる。まず tool を「キー入力注入」「pointer 操作」「DOM/game-state 観測」「screenshot」「build」「asset 検査」「Slack・記憶 write」に分け、各操作に fallback-equivalence class を付ける。たとえば DOM の座標取得が失敗した時に screenshot+vision が同等なのか、keyboard input が落ちた時に別 API が同じ意味を持つのかを明示する。見た目が似ていても意味粒度が違う経路は同等扱いしない。

次に seed 固定の fault scenario を三種作る。S1 は1回だけ input を落とす、観測を timeout にする、一時的に state JSON を読めなくする。S2 は episode 全体で主要 input path や selector を遮断し、代替経路を使わなければ進行不能にする。S3 は start button 不在、必須 asset 欠落、全入力経路停止など、成功不能を ground truth として持たせる。silent failure には「API は200だが1 tick古い座標」「health fieldだけ欠落」「成功 flag は true だが state delta なし」を使う。これで agent の再試行回数だけでなく、state delta の確認、経路切替までの call 数、同一 action の無変化反復、成功不能時の停止、誤った成功宣言を別々に記録できる。

小さな導入順は、(1) failure-free smoke の基準値を固定、(2) S1/S2 を各5〜10 case作成、(3) fallback map と「不可逆 write 前に再観測」「state delta なしの同一 call は最大2回」などの制約を runtime context に追加、(4) base と context ありを同じ seed で比較、でよい。RL は、その差分でも繰り返し残る故障があり、十分な成功・失敗 trajectory が貯まった後だけ検討する。S3 は自動中止を安全側に倒しすぎる危険があるため、正しい abstain の oracle と「まだ未使用経路がある premature stop」を先に定義する。

■ メリット・デメリット
メリットは、頑健性を clean 成功率から独立させ、故障後の選択を再現可能に評価できること。必要 strategy が決まるので、偶然回復と方策改善を混同しにくい。薄い adapter は headless harness へ移しやすく、精密な確率推定なしでも fallback map と constraint から始められる。

デメリットは、同等経路と「本当に不可能」の定義が人手依存なこと。screenshot と state JSON、keyboard と direct state mutation は意味が違い、安易な equivalence は不正な成功を作る。回復は call を増やし、silent corruption は task success だけでは採用過程を見抜けない。abstain evidence と RL の要素分離も未完成である。

■ 判定
部分採用。Bench2Robust の scenario-controlled solvability、failure taxonomy、fallback map、strategy 別指標を headless 評価へ採用する。まず小規模な S1/S2 fault injection と runtime constraint を実装対象とし、BTM の確率推定と RL、S3 の自動 abstain は評価 oracle が整うまで保留する。

■ URL
https://arxiv.org/abs/2608.11977
