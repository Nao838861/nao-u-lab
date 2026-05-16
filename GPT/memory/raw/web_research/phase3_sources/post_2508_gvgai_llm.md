■ 概要
対象は arXiv:2508.08501v2 “GVGAI-LLM: Evaluating Large Language Model Agents with Infinite Games”。LLM を「ゲームについて語れるモデル」ではなく、「ルールと局面を読んで次の一手を出す agent」として測るための benchmark を提案している。問題設定は、既存の LLM benchmark が静的な知識、命令追従、コード生成、テキスト環境に寄りがちで、2D ゲームのような空間配置、記号的ルール、逐次意思決定、反応的な行動選択を十分に測れていないこと。そこで著者らは General Video Game AI framework を LLM 用に拡張し、VGDL で定義された多数の arcade-style games を、自然言語プロンプトと ASCII map で操作できる環境に変換している。

中核は、ゲームを LLM が読めるが、LLM に都合よく解きすぎない表現へ落とす点にある。各 step で prompt には、自然言語化されたゲームルール、sprite の意味、行動一覧、avatar 位置、現在の 2D layout が入る。モデルは simulator、forward search、コード実行、内部 planner なしで、現在状態だけから action を選ぶ。zero-shot 設定では過去状態や過去行動を渡さない。著者らは contextual prompting も試しているが、履歴を入れても多くのゲームで win rate や decision quality は伸びず、token cost と誤推論の蓄積が増えるため、標準評価は current state だけに固定している。

評価指標も単なる勝敗に閉じていない。meaningful step ratio は、行動が盤面に可視的な変化を起こした割合を見る。何もしない ACTION_NIL、壁に向かって歩き続ける、直近で左右往復するような無効反復は meaningful から除外される。step efficiency は勝利までの手数を最大手数に対して正規化し、win rate と normalized reward も別に見る。最後に overall score は meaningful step ratio、手数効率、reward、win rate を均等に平均する。これにより「勝てなかった」だけでなく、「動いてはいるが無意味」「近づいているが効率が悪い」「報酬は取るがゴールできない」といった失敗の形を分けられる。

実験は二段。まず GPT-4o-mini を 118 games、最大 5 levels、計 540 level 相当に走らせ、477/540 levels が 0% win rate、overall win rate は 10.27%、average meaningful step ratio は 49.71%、average step efficiency は 0.3293、average overall score は 0.2764 と報告している。次に zelda、aliens、boulderdash、realsokoban、escape、sokoban の 6 game subset で複数モデルと古典的 planner/RL 系 agent を比較する。GPT-o3-mini は LLM 群の中では比較的強く、Aliens や Zelda で高い win rate を出す一方、search-based agent ほど安定しない。DeepSeek-r1 は Sokoban と Escape で相対的に強く、モデルごとに得意な構造が違うことも見える。RL baseline は sparse reward や長期計画で苦しみ、LLM も planner も一枚岩ではない。

結論として、現行 LLM は小さく見える盤面でも spatial reasoning、symbolic identity tracking、basic planning で継続的に失敗する。典型例は、row/column や上下方向を取り違える、ASCII 上で横に並んでいるだけの遠距離 object を近接していると誤認する、key 取得後に avatar が別 symbol へ変わると同一主体として追跡できない、進行可能な局面で ACTION_NIL を選ぶ、壁越しの key に向かって直進し続ける、箱を押すという object-action 関係を使えない、など。coordinate tagging と verbose spatial grounding は部分改善するが、benchmark は解けた状態から遠い。著者らの主張は、LLM がゲームを「理解しているか」を会話で聞くのではなく、構造化された局面で意味のある一手を選べるかを観測する必要がある、というものになる。

■ 内容分析
この論文の価値は、LLM agent 評価を「成功率」から「失敗の観測可能性」へ寄せている点にある。ゲームは勝敗があるので benchmark にしやすいが、勝敗だけを見ると、なぜ負けたのかが見えない。GVGAI-LLM は meaningful step ratio を置くことで、action sequence の中身を直接見る。これはかなり重要で、LLM が盤面を読めていない時、失敗は派手な誤答よりも、壁に突っ込む、待つ、逆方向に戻る、局所的にもっともらしいが進行しない、という形で出る。文章回答の採点では埋もれがちな「無意味だが文法的には正常な行動」を拾える。

もう一つの強みは、入力表現を ASCII + rule text に限定していること。画像認識や UI 操作まで混ぜると、失敗原因が視覚、操作、計画、ルール理解のどこにあるか分かりにくくなる。ここでは視覚入力をあえて捨て、記号化された 2D layout を渡している。それでも spatial grounding が壊れるので、問題は単なる画像認識ではなく、言語モデルが記号空間上で距離、隣接、遮蔽、到達可能性、変身後の同一性を安定して扱えないことだと切り分けられる。

ただし限界も明確。対象は GVGAI 由来の arcade-style / puzzle-style game で、商用ゲームの豊かな affordance、曖昧な目的、UI、物理挙動、長期的な学習とは違う。また zero-shot current-state 評価は「その場の推論力」を測るには綺麗だが、人間プレイヤーが履歴、探索、メモ、失敗学習を使うこととはズレる。履歴あり prompting が弱かったという結果も、履歴の渡し方が自然なプレイヤー記憶を再現しているとは限らない。したがって、この benchmark は「LLM はゲームが下手」という一般論ではなく、「記号化された小ゲームでも、現在の LLM は空間・同一性・行動効果の結合が弱い」と読むべきだと思う。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、この論文を playable 判定の設計に使える。いま必要なのは、AI が「面白いです」と言う自己評価ではなく、headless / scripted player が局面ごとに意味のある行動を取れているかを見る probe である。たとえば小型 prototype では、勝敗や生存時間に加えて、`meaningful_action_ratio`、`stall_loop_count`、`wall_bump_count`、`undo_like_backtrack_count`、`state_change_per_10s` を event log から取る。ゲームごとの reward を作り込む前でも、「操作は発生しているが状態が進んでいない」を検出できる。

また、LLM にゲームを評価させる時は、スクリーンショットを丸投げする前に、ASCII ないし JSON の局面表現、entity mapping、available actions、直近の state diff を作る価値がある。論文が示す通り、それでも空間推論は壊れるので、評価側には coordinate tagging、隣接セル一覧、到達可能領域、危険領域、目的 object までの shortest path など、deterministic helper を添えるべきだ。LLM は最終判定者ではなく、「ログから失敗仮説を言語化する reviewer」に寄せる。制作メモには、勝てたかではなく、どの局面タイプで meaningless step が増えたかを atom 化して残すのがよい。

■ メリット・デメリット
メリットは、AI プレイ評価を印象論から行動ログへ戻せること。勝敗以前の「進行しているか」「無効反復していないか」「局面理解が壊れる場所はどこか」を、ゲーム横断で比較できる。小さな prototype でも導入しやすく、M-40 的な人間プレイ依存の軽減に直結する。

デメリットは、GVGAI-LLM 型の指標が arcade / puzzle 的な明確目標に寄ること。探索の寄り道、遊び、偶然の発見、気持ちよい無駄行動は meaningful step ratio だけでは低く見える可能性がある。評価指標をそのまま面白さ指標にしない制御が必要。

■ 判定
部分採用。GVGAI-LLM 自体をそのまま使うというより、meaningful step ratio と spatial grounding failure taxonomy を、Nao_u_BOT の headless 評価ログに移植する。まずは小型 prototype で「勝敗 + 無効行動率 + 停滞ループ」を標準 probe にする。
