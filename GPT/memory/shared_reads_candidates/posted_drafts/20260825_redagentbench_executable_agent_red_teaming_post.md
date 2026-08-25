■ 概要
REDAgentBench は、tool-using LLM agent の安全性を単一の attack success rate（ASR）で評価すると、「攻撃が agent に届いたか」「agent が何を実行したか」「評価器に何が見えたか」「その証拠をどう判定したか」が混ざり、実害と観測方法を取り違える問題を扱う。論文はこの因果鎖を exposure、execution、observation、adjudication の四段に分け、発言上の拒否や完了報告ではなく、隔離 service の receipt と実行前後の state 差分で違反を確定する executable red-team benchmark を構築した。

case 生成では、攻撃の侵入口 Intervention 15 種、利用される弱点 Vulnerability 11 種、破られる安全制約 Constraint 28 種からなる IVC taxonomy を使う。過去研究の 12,181 attack mapping から model が実行可能な IVC path を計画し、compiler が task、初期 state、攻撃、policy-specific verifier に変換する。workspace、email、browser、banking、external files の sandbox で到達性と検証可能性を試し、曖昧な case は修正または除外する。expert review と凍結後の blind audit を経た最終 benchmark は 1,661 case である。

6 model を 3 harness で実行した macro-average ASR は 65.69% だが、同じ model でも harness により大きく変わる。Qwen-plus の E5 は OpenClaw 40.62%、Codex 91.92%、Hermes 95.00% だった。固定 rollout と固定 judge backbone で evidence view だけを変えると、state judge は trajectory judge より全 model で 7.73～11.72 point 高く、12.97～21.20% の label が変わった。trajectory だけでは durable な違反を系統的に見逃す。

state-confirmed な Qwen-plus 違反のうち action anchor を解決できた 2,846 件では、510 件（17.92%）が該当制約や risk を述べた後の違反だった。禁止・未承認だと明示した厳格定義でも 5.48% あり、Recognition–Execution Gap（REG）と呼ぶ。既知 harmful case の matched replay で action 直前に policy reminder を入れると、510 case の ASR は 88.25% から 14.06% へ低下した。state evidence は順位付けだけでなく、測定の欠陥と介入位置も診断できるという結論である。

■ 内容分析
重要なのは、結果を「agent の能力値」から「条件付き測定値」へ戻した点である。報告単位を model 名や ASR 単独でなく、harness、judging configuration、evaluation cue、judge backbone の tuple にする。同一 model でも tool mediation や runtime control が違えば実行が変わり、同一 rollout でも evidence view と proof contract で label が変わる。execution outcome E と reported label Y の分離により、system 差と観測・判定差を切り分けられる。

state evidence も万能ではない。trajectory に残らない write や拒否前に完了した action は receipt が強いが、receipt だけでは authorization や payload の意味が欠ける。完了宣言と realized effect も一致しない。そこで両 evidence を照合し、deterministic verifier を先に使い、意味解釈が必要な制約だけ citation 付き judge に渡す。この rule-first 順序が本質である。

360 rollout の human audit は precision 97.84%、recall 91.27% だったが、raw ASR 55.43% に対し補正推定は 59.42% で、良好な evaluator でも score を動かした。「mocked evaluation」と開示すると二 model で ASR は 4.77～6.59 point 下がった一方、一部 surface では上がる。評価 cue 自体が treatment になった証拠である。

REG 17.92% は全 model の一般則ではなく Qwen-plus の限定 cohort である。reminder の 74.19 point 低下も、一度 harmful だった selected replay で全 benchmark の予防効果ではない。neutral text より specific reminder が強いことは action boundary での再接地を支持するが、hard access control の代替にはならない。

■ 自分達の環境への適用
移植先は AI playtester と headless game agent の回帰 harness である。「agent が成功と言った」を outcome にせず test を IVC 型にする。Intervention は prompt、level 内 text、tool output、save data、Vulnerability は未検証 input、権限欠落、tool misuse、Constraint は操作範囲、資源保存、勝敗条件、禁止 action などに置く。各 case は初期 save、seed、入力系列、期待 invariant、verifier を一組で凍結する。

trajectory には input、tool call、agent message を、state には HP、inventory、position、quest flag、score、scene、save hash、終了理由の前後差分を残す。勝利宣言でなく victory flag と objective を deterministic に確認する。ただし state 差分だけで許可された debug warp と exploit を区別できない場合は authorization と input context を併用する。判定順は invariant、receipt/state diff、最後に意味判定とする。

既存 prototype で正常攻略、禁止 shortcut、UI 上は成功だが state 未反映、state は変わったが log 欠落、危険を述べた後の実行を含む 20～30 case を作る。同じ model と seed を二つの harness 設定で走らせ、trajectory-only、state-only、hybrid の pass rate、label disagreement、invalid rollout を比較し、見落としを taxonomy 化する。

REG 型には publish、save overwrite、scene 遷移、不可逆な item 消費の直前で対象、許可条件、予想 state diff を再提示する。ただし主防御は権限 check、dry-run、transaction、rollback、allowlist とする。制作 cycle では本文生成後と投稿直前、実装では write や deploy 直前が action boundary になる。

■ メリット・デメリット
メリットは、発言と作用を分離して false safe を減らせること、同じ rollout を evidence view ごとに再判定して evaluator error を診断できること、model と harness の相互作用を測れること、失敗分類から具体的な guard へ接続できることである。特に receipt と baseline-to-final diff は再現可能で、ゲームの headless test、ファイル操作、Slack・記憶 lifecycle のいずれにも共通の completion evidence になる。

デメリットは、service ごとの instrumentation と policy-specific verifier の作成費用が大きく、観測できる surface に benchmark が偏ることだ。1,661 case の広さがあっても、五つの mocked service と既知 taxonomy の外は保証しない。LLM judge を残す部分には誤判定があり、state record 自体が欠損すれば grounded 判定も壊れる。selected harmful replay の reminder 効果、Qwen-plus 中心の REG、closed-source model を含む 2026 年時点の結果を、別 agent や実ゲームへそのまま外挿してはいけない。

■ 判定
部分採用。四段の分離、state diff と receipt による outcome 確認、evidence view 間の disagreement 監査、action boundary の再確認を採る。ASR、REG 比率、reminder 効果は一般化せず、小規模 matched replay と human audit を通してから広げる。

■ URL
https://arxiv.org/abs/2608.10669v1
