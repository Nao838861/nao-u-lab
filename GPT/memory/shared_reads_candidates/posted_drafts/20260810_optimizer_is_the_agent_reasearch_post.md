■ 概要
ReASearch（Reasoning-driven Agentic Search）は、プロンプト、プログラム、機械学習の訓練ワークフローを改善する際、従来は進化探索・bandit・textual gradient などの外部アルゴリズムが持っていた「次に何を試すか」「どの失敗を調べるか」「どの候補から分岐するか」「いつ再確認・後戻り・終了するか」という探索方針を、tool-using agent の逐次推論へ移す研究である。LLMを候補の局所的な書き換え器として使うのではなく、評価履歴を読んで仮説を立て、予算を配り、安価な実験で原因を切り分け、高価な評価へ進むかを決める optimizer 自体として扱う。

共通 scaffold は file I/O、Python／shell 実行、context compression、永続的な `lessons.md` を持つ。task 固有部分は system prompt と tool set に分離され、prompt optimization では minibatch 評価・student model 呼び出し・validation、program evolution ではコード読取・別 agent による編集・制約検証・評価、ML workflow では訓練コード編集と時間制限付き実験を公開する。主 agent は高水準の診断と探索履歴を保持し、編集作業だけを分離する。context 圧縮時には予算、score、候補、会話要約、lessons を再注入するため、長期探索で「何を試し、なぜ失敗したか」が脱落しにくい。

評価は3領域14 task、各設定3回の独立実行で、比較対象と評価呼び出し予算を揃えている。prompt optimization では GEPA に対し、AIME 50.67→52.00、GSM8K 82.11→83.40、HotpotQA 65.80→67.60、Terminal-Bench 2.0 42.22→53.33。program evolution では circle packing、Heilbronn triangle、EPLB、transaction scheduling、ARC-AGI-2 を扱い、ARC-AGI-2 の test accuracy は AdaEvolve 12.5% に対し50.0%、circle packing の一部では既知の人手結果を僅かに更新した。ML workflow では通常の Claude Code と同一 backbone・同一訓練条件で比較し、Q*bert 1250→4500、MuJoCo 3986→5267、画像分類 78.59→83.99、暗号資産予測は leaderboard 29位相当から6位相当へ改善した一方、NanoGPT は統計的に同等だった。

結論は、豊かな実行 feedback、履歴の構造化、計算ツール、永続 memory があれば、固定 search policy のかなりの部分を agent の推論で代替できるというもの。ただし「外部 controller が消えた」のではなく、状態再提示や予算管理などを残した controller-light な設計である。

■ 内容分析
この論文で最も重要なのは、単にLLMへ自由裁量を与えたことではなく、探索状態を「参照可能」にするだけでなく毎 turn「不可避に見せた」点である。比較された通常の code agent もファイルや memory を読めるが、停滞中の agent は必要な道具を自発的に呼ばない。ReASearch は目標と評価方向、直近20実験、親候補、metric、状態、永続 lesson、3回・7回以上の停滞警告、search tree の分岐集中を毎 turn 再提示する。論文自身も、比較差は追加ルールではなく、この re-emission harness に由来すると分析している。したがって核心は「推論能力だけで search が創発した」ことより、「推論が働く状態表現を outer loop が継続供給した」ことにある。

実際の trajectory は説得力がある。Terminal-Bench では三つの変更を束ねた候補が悪化した際、狭い検索 command がファイルを見落とす原因を特定し、既知の良い祖先へ戻って一文だけを足し、validation 71.2%へ到達した。IMG-100 では5分制限下の実 epoch 数と cosine schedule の不一致を計算し、65.75%から79.86%へ一度に改善した。MuJoCo では prioritized replay の sampling が133倍遅いと小さく測って、本実験前に棄却した。これは「失敗候補を blacklist に入れる」のではなく、失敗理由を次の探索操作へ変換する強みを示す。

ablation も実用的である。memory を除くと Terminal-Bench は53.33から48.15、Python tool を除くと51.11へ低下し、ARC-AGI-2 は完全版50.0%から各39.2%、32.5%へ低下した。長い評価軌跡では memory、短い構造探索では計算ツールの寄与が大きい。また memory schema は「効いた／効かなかった／次に試す」の簡素な形が、複雑な task 固有 schema と同等か約1%良く、過剰な構造は硬直・noise を生む。validation の詳細 trajectory を見せると AIME が52%から約50%へ落ち、aggregate metric だけの方が過学習しにくい点も重要だ。

限界は、14 task といっても tool と domain prompt は人が設計し、強い frontier model、明確で自動計測可能な reward、数百回規模の評価予算を前提とすること、独立実行が3回で探索分散の推定がまだ粗いこと、複数の結果が「予算内の最高値」であることだ。さらに停滞警告や search tree review は明白な探索 heuristic であり、controller-free という読み方は不正確である。評価器が仕様の一部しか測らなければ、agent は固定探索より巧みに proxy を攻略してしまう。

■ 自分達の環境への適用
まずゲーム全体を自動改変させず、headless で決定的に再生できる一つの戦闘・移動・resource loop に限定して試す。artifact は parameter patch または小さな実装 diff、tool は現行設定読取、seed 指定の短時間 simulation、失敗 trace 集計、候補保存、祖先への復帰に絞る。評価は completion、被damage、停止時間、行動 entropy、resource 推移、実行時間、crash を分離し、単一の総合点だけでなく制約違反を hard gate にする。

探索を二段に分け、train 側では短い seed と詳細 trace を見せて原因診断させ、validation 側は未見 seed 群の aggregate と分散だけを返す。改善候補は最低3 seed の安価な再確認を通してから validation に進める。毎 turn の state packet には現在best、直近試行、親子関係、残予算、停滞回数、既知の失敗理由を入れる。`lessons.md` 相当は raw log の要約置場にせず、「変更／観測／成立条件／反証／次の probe」を短く残し、候補 lineage と実行 artifact は別 ledger にする。これは現在の memory 階層でも、原文、状態、再利用可能 lesson を混ぜない方針と整合する。

最小検証は、同じ30回の simulation 予算で、A: 固定 hill-climb、B: state再提示なしの agent、C: ReASearch 型 agent を各3 run 比較する。最終bestだけでなく、未見seed平均、最悪seed、crash数、重複試行率、改善までの評価回数、過去の失敗へ戻った率を測る。Cが score だけでなく重複削減と未見seed安定性でも勝つ場合に、対象 scene を広げる。コード編集は別 worker、最終採否と診断は主 agent に保持し、差分は毎回 commit して rollback を確実にする。

■ メリット・デメリット
メリットは、相互依存する変更、局所的な失敗原因、計算量制約を同じ履歴から扱えること、固定 sweep が苦手な「一度失敗した手法を原因修正して再採用」「良い祖先へ意味のある差分だけ足す」が可能なこと、簡素な lesson と search tree が context 圧縮後も探索の連続性を保つことにある。

デメリットは、評価器設計が弱いと reward hacking を加速すること、agent推論と小実験で wall-clock・token cost が増えること、自由度が高いため run 間分散と再現性の管理が難しいこと、毎 turn の状態再提示自体が新たな outer-loop 実装になることだ。特に面白さ、美観、驚きのような自動評価しにくい品質まで総合点へ押し込むのは危険で、人間 review を置き換える根拠にはならない。

■ 判定
部分採用。採るべきなのは「agent に全部任せる」という標語ではなく、安価な診断→再確認→未見 validation、候補 lineage と rollback、短い因果 lesson、毎 turn の構造化 state 再提示である。まず限定 scene の三方式比較で、未見seedと探索効率の両方を検証し、固定探索を上回った範囲だけ制作サイクルへ接続する。

■ URL
https://arxiv.org/abs/2608.06714
