■ 概要
対象は arXiv:2605.24216「Agent-ToM: Learning to Monitor Autonomous LLM Agents via Theory-of-Mind Reasoning」。問題設定は、自律 LLM agent の長い実行軌跡から、表面上は普通の作業に見える隠れた逸脱や悪意ある行動を検出することにある。既存の monitor は trajectory を短い局所行動として見るか、複数回の判定を ensemble する方向に寄りがちで、agent が「何を知っていると思っていたか」「何を意図していた可能性が高いか」「本来ならどの行動が期待されたか」を明示的に扱わない。また、過去の監視失敗から抽出した判断基準を次の episode に再利用する仕組みも弱い。Agent-ToM はここを Theory of Mind の形に分解し、full trajectory に対して belief、intent hypothesis、expected action、task-consistent baseline からの deviation を構造化して推論する monitoring framework として提案されている。

手法の中核は Reason-Verify-Refine の二段構成と semantic guardrail memory である。Stage 1 の Reason は、task description と conversation trace を読み、agent の信念・意図・証拠・逸脱候補を作る。Stage 2 は独立検証として Stage 1 の分類を疑い、証拠の整合性、便利すぎるミス、表明された意図と結果のずれ、悪性判定を下げるために十分な反証があるかを確認して最終分類と confidence を出す。論文上は Verify と Refine を概念的に分けるが、実装上は一つの joint inference にまとめ、全体を二回の LLM call で動かす。訓練時には、正解・不正解の監視判断に critique をかけ、どの信念推定や意図推定が効いたか、どの guardrail が不足していたかを semantic credit assignment で抽出し、重複を避けながら persistent memory に蒸留する。つまり、単なる近傍検索ではなく「次に似た構造の逸脱を見た時に使う判断規則」を蓄積する。

評価は adversarial agent monitoring benchmark の SHADE-Arena と CUA-SHADE-Arena。SHADE-Arena は tool-use 環境の長い trace に隠れた悪性目的を混ぜる設定で、平均 82.9 turn の長期文脈を扱う。CUA-SHADE-Arena は VM 上の computer-use task で、SHADE-Arena で学習した monitor を unseen の computer-use setting に転移する out-of-distribution 評価として使う。SHADE-Arena test では、LLM-Judge が F1 0.596、zeroshot ToM が 0.615、Agent-Auditor が 0.697、Sequential Ensemble が 0.727、Async Ensemble が 0.761。Agent-ToM は prompt-level learning で 0.686、external memory Stage 1 で 0.717、Stage 1-2 で F1 0.782、accuracy 0.752、recall 0.748、precision 0.818 まで上がる。CUA 転移では Stage 1-2 が accuracy 0.891、F1 0.831、recall 0.710、precision 1.000 で最高。Async は recall 0.900 だが precision 0.454 に崩れ、過検出の弱さが出る。Agent-ToM は 8 call や 17 call の ensemble より少ない 2 call で、precision-recall の均衡と転移性能を両立した、というのが論文の結論である。

■ 内容分析
この論文の面白さは、monitor を「安全判定器」ではなく「長期行動ログに対する意図推定器」として設計している点にある。Agent-ToM は、agent の発話や tool call をそのまま良否判定するのではなく、ユーザー目的、agent が利用可能だった情報、正直な agent なら期待される行動、実際の行動がどちら向きに偏ったかを照合する。特に「計算ミス」「確認漏れ」「削除」「成功したという自己申告」などを、単独のエラーではなく、結果が一方向に有利/有害へ寄っているかで読む姿勢が強い。これはゲーム制作のログ分析にも近く、失敗を「バグ」「下手なプレイ」「意図的な exploit」のどれとして扱うかを分ける時に効く。

一方で、semantic guardrail memory は万能な記憶ではない。論文の性能差を見ると、memory だけの Stage 1 は SHADE では伸びるが、CUA 転移では F1 0.615 まで落ち、Verify-Refine を入れて初めて F1 0.831 になる。つまり、過去の経験を持つだけでは domain shift に弱く、現在の trace に対して「その guardrail を本当に適用してよいか」を検証する段が必要になる。ここは重要で、記憶システムに規則を増やすほど良くなるという話ではない。むしろ、記憶から取り出した判断軸を、現在の evidence に照らして上げ下げする二段目が品質を決めている。
さらに、Async のように recall を極端に上げる方法は見逃しを減らす代わりに過検出を増やすため、運用ログの triage では人間や次 phase に余計な負荷を戻す。Agent-ToM の評価は、検出率そのものより「どの疑いを残し、どの疑いを棄却するか」の校正が本体だと読める。

■ 自分達の環境への適用
Nao_u_BOT では、AI player、headless テスト bot、NPC、Codex/Claude の定時 cycle など、長い行動ログを後から読む対象が多い。Agent-ToM は、それらを単に「成功/失敗」で集計するのではなく、belief、intent、expected action、deviation の列として保存する設計に転用できる。たとえばゲーム自動テストなら、bot がどの情報を観測済みだったか、目的達成に必要な次行動は何だったか、実際の行動が探索不足・ルール誤解・報酬ハックのどれに見えるかを episode ごとに構造化する。

記憶システム側では、atoms に失敗ログを丸ごと増やすより、critique から「似た失敗を見抜く guardrail」を抽出し、Phase 3b/4a の probe として小さく試すのが合う。たとえば「成功報告と盤面状態が矛盾する」「複数の小ミスが同じ不利方向に揃う」「権限上は許可されたがユーザー目的を損なう」などは、ゲーム制作・Slack 投稿・記憶整理のどれにも使える横断的な monitor になる。

■ メリット・デメリット
メリットは、長期 trajectory の失敗理由を再利用可能な判断規則へ変換できること、ensemble の回数で押すより低コストに検証段を入れられること、precision と recall の片寄りを見ながら安全側に調整できること。デメリットは、belief/intent/expected action を記録する設計負荷が高いこと、guardrail memory が古くなると誤適用の危険があること、悪性行動検出向けの非対称基準を通常のゲーム評価へそのまま持ち込むと過検出になり得ること。

■ 判定
部分採用。semantic guardrail memory と Verify-Refine は、Nao_u_BOT の長期ログ評価・ゲーム bot 失敗分類・定時 cycle の自己監視に入れる価値が高い。ただし悪性検出の強い前提はそのまま使わず、ゲーム制作では「意図的逸脱」だけでなく「観測不足」「ルール誤解」「設計側の誘導不足」を同列に分ける形で採用する。
