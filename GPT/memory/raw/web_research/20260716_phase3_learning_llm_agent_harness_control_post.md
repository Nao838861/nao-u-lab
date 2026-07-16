■ 概要
LLM agent の改善は model、prompt、手書き workflow に向きがちだが、本論文は外側の harness 自体を学習可能な制御層として扱う。LLM executor は固定し、軽量 controller が `SOLVE / CHECK / REVISE / TOOL / RETRIEVE / SUBMIT` などの構造 action を選ぶ。状態は task、途中 artifact、tool・verification 履歴、残り step などを表し、有限 horizon の Harness MDP とする。自然言語 token ではなく、「次に解くか、検査するか、直すか、提出するか」という実行手続きを制御する点が中核である。

学習には online 探索ではなく、base harness と exploratory harness から集めた固定 rollout buffer を使う。各 trajectory の最後に task 固有 rubric で品質 Q を採点し、trajectory advantage に応じて観測 action の尤度を指数的に重み付けする advantage-weighted regression（AW）で policy を学ぶ。訓練 reward は terminal quality だけで、過程指標は reward に混ぜない。別途、CheckBeforeSubmit、EvidenceBeforeClaim、TestBeforeSubmit、RevisionAfterFailure、ValidToolUse、StopWhenSufficient と、減点項目 EarlySubmit の 7 event から Harness Maturity Score（HMS）を算出し、「成果が良い」と「信頼できる手順を踏んだ」を分離して観測する。

評価は knowledge-work、coding、research QA、multi-tool、long-memory、planning の 6 domain。各 100 task のうち 80 を buffer 収集、20 を held-out 評価に使い、3 seed×3 rollout で比較する。加えて τ-bench retail と AgentBench DB-Bench の adapter も評価した。CheckBeforeSubmit は全 8 setting で 5.6〜17.8%へ上昇したが、最終品質の大幅改善は adapted τ-bench の +18.2 percentage points、adapted DB-Bench の +13.2pt、coding の +10.0pt に集中した。planning と knowledge-work は小幅増、残る 3 domain は微減である。結論は、process pattern は広く学べるが、良い最終成果には buffer 内の高品質 trajectory が必要、という限定付きのものだ。

■ 内容分析
良い点は、agent 改善を一枚岩の説明から切り離したことだ。terminal quality と HMS を別にし、CHECK 増加と成果点を混同しない。実際、全体では CheckBeforeSubmit が base 1/1080 episode から AW 113/1080 episode に増えたが、最終品質の macro 改善は +2.0pt に留まる。research では check が 13.9%まで増えても EarlySubmit が 25%へ増え、HMS は -2.6pt、品質も -0.3ptだった。「検査を挟めば成熟する」という単純な物語を、同じ実験が否定している。

behavior cloning（BC）と Forced CHECK（FC）の比較も重要である。AW は全 8 setting で BC より良く、5 setting では BC と FC の双方を上回った。coding では AW +10.0pt に対し BC -8.3pt、FC ±0.0pt、τ-bench adapter では AW +18.2pt、BC +8.2pt、FC +0.1ptだった。価値は CHECK の存在ではなく、状態に応じて「いつ」検証・修正へ移るかを選ぶことにある。ただし multi-tool では FC +0.3pt に対し AW -1.3ptで、常に安全という証拠ではない。

最大の注意点は evaluator である。τ-bench は native simulator score ではなく plan-quality rubric、DB-Bench も full upstream evaluator ではなく独自 rubric を使うため、+18.2pt / +13.2pt は公式 benchmark の向上ではない。coding の +10.0pt も、strict rubric では base が天井付近だったため calibrated verifier に替えた条件の値である。また HMS 改善は主に CheckBeforeSubmit に局在する。EarlySubmit threshold を 0.25 から 0.35 に変えるだけで research の ΔHMS が -2.6pt から +9.6ptへ反転し、process metric は detector 設計に強く依存する。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、RL controller をすぐ導入するより、Harness MDP の観測単位を先に借りるのがよい。固定 executor が playable diff を作る一 episode を、`IMPLEMENT / RUN_HEADLESS / INSPECT_STATE / COMPARE_DIFF / REVISE / SUBMIT` に正規化し、各 action 前の状態として「未検証 requirement 数」「直近 test の成否」「変更 file 数」「残り時間」「既知 failure の有無」を記録する。terminal reward は、build 成功だけでなく、操作可能、勝敗到達、要求 mechanic 発現、既存 behavior 維持を deterministic check で束ねる。process 側は reward から分離し、提出前 headless 実行、failure 後の再試験、無関係差分なし、証跡付き完了の event を記録する。

最初の probe は学習なしでよい。過去 20〜30 episode を action sequence と terminal rubric に変換し、成功群と失敗群で `RUN_HEADLESS` や `COMPARE_DIFF` がどの状態で選ばれたかを見る。次に同一 model・同一 task set で、base、常時 CHECK、状態規則による conditional CHECK の 3 条件を各複数 seed で比較する。見るべき値は final success、再現可能 failure の解消率、検査回数、episode 時間、false completion、そして playable diff 到達率である。conditional rule が Forced CHECK を越え、かつ作業時間の増加が許容範囲なら、初めて offline AW を試す。高報酬 trajectory が少ない genre や新規 mechanic では学習を止め、buffer support 不足を明示する。

記憶システムでも recall 件数を成果 reward に混ぜず、「正しい atom が最終判断の根拠になったか」を terminal evidence で採点し、retrieval、stale 判定、source 確認を別記録する。episode 数が少なく domain drift も大きいため、学習器より trace schema の整備が先である。

■ メリット・デメリット
メリットは、model weight を変えずに検証順序を改善でき、model / harness / evaluator の責任を分けて診断できること。terminal reward と process metric の分離は、headless test を走らせた事実と playable quality を取り違えないために有効である。固定 buffer で学ぶため、本番 task 上の危険な online exploration を避けられ、同じ executor のまま controller 差を比較できる。BC と常時 CHECK を baseline に置く実験設計も、そのまま小規模 probe に転用できる。

デメリットは、offline RL が buffer にない成功手順を発見できないこと。低品質 rollout しかない新規ゲームでは、悪い手順の中から相対的にましなものを強化するだけになる。rubric が弱ければ controller は evaluator に適合し、検査を増やしながら面白さを落とし得る。process event detector も threshold と domain adapter に依存し、HMS の上昇を一般的な信頼性向上とは呼べない。さらに、controller・trace・verifier の保守コストが playable diff より大きくなる危険がある。人間が感じる手触り、驚き、読みやすさ、再挑戦したさは terminal structural rubric だけでは捉えられない。

■ 判定
部分採用。Harness MDP の action/state 記録、terminal quality と process diagnostic の分離、BC・Forced CHECK を含む baseline 比較を先に採用する。offline AW controller は、同型 episode と高報酬 support が十分に蓄積し、conditional rule が有効だと確認できた領域に限定する。公式 benchmark 改善や万能な agent 成熟法としては採用しない。

■ URL
https://arxiv.org/abs/2607.05458
