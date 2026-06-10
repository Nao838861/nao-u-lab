■ 概要
Lap は、LLM を mobile match-3 game の automatic playtester として使うための試作フレームワーク。問題設定は、ゲームテストには空間関係、ルール理解、目的に沿った探索、プレイヤーらしい意思決定が必要で、通常の Android testing tool や random input だけでは深い状態に入りにくいというもの。一方で、LLM をそのまま非テキストゲームに入れるのも難しい。多くの mobile game には game state をテキストで返す API がなく、画面 screenshot を vision model に直接読ませると、アイコン位置や盤面の厳密な座標認識が不安定になる。Lap はこの間に preprocessing を挟み、画面を LLM が扱いやすい numeric matrix に落としてから、手を提案させる。

手法は 3 段階。第一に game environment processing。対象は CasseBonbons という Candy Crush 系の open-source match-3 game で、画面上の candy icon を色ごとの feature layer に分け、各 cell を candy type の数値で表した 2D matrix に変換する。通常 candy だけでなく、特殊 candy は 0、blocker candy は -1 のように表現し、swap は「隣接 cell の値を交換する行動」として抽象化する。第二に prompting-based action generation。プロンプトは、現在の盤面 matrix を含む Game Environmental Context、15 組の submatrix と action を含む Examples and Strategies、match-3 の目的・制約・特殊 candy の優先などを含む Game Objectives and Rules から構成される。LLM はこの matrix、例、ルールに基づいて、次に実行すべき swap action の集合を返す。第三に action execution。LLM が返した matrix 座標を Android 画面座標に変換し、ADB の swipe command として実機/エミュレータに送る。これを timeout まで反復し、盤面の変化を再取得して次の prompt に入れる。

評価は FSE Companion 2025 の paper として、CasseBonbons 上で 150 iteration の case study を行い、Lap を Monkey、LIT、RLT と比較している。Monkey は random touch/gesture を送る Android 標準系のランダムテスト、LIT は人間の短い demo から human-like tactic を generalize する rule-based tool、RLT は LIT 論文由来の reinforcement learning baseline。実験環境は Android Emulator と ADB、Python 3.10、OpenAI の GPT-O1-mini API、temperature 0.5、max_tokens 500、num_samples 1。評価指標は JaCoCo の line coverage、game score、game level、crash triggering。game score と level を入れているのは、mobile game testing では単に code を通るだけでなく、ゲーム内で先へ進めることが新しい状態・コード経路を開くから。

結果として、Lap は score 27,520、level 8 に到達し、LIT の score 14,560、level 5 を上回った。RLT は短時間訓練では低調で、Monkey は random click が start button にたどり着くまでにも時間を浪費し、score がほぼ 0 に留まる。line coverage では Lap が最終的に 79% に達し、LIT は 75%、RLT は 46% から伸びるが Lap/LIT には届かず、Monkey は 3-5% 程度でほぼ横ばい。crash triggering では Lap が 5 件、LIT が 1 件、Monkey と RLT は 0 件。著者らは、LLM が game mechanics を理解し、targeted testing scenario を作って深い経路に入れることが、random や単純な replay より有利に働いたと解釈している。

ablation では、rule prompt だけ、few-shot example だけ、両方を併用する構成を比べている。rule だけでも playtesting は可能だが進行が遅く、few-shot だけでも改善する。最も効くのは、ルールと submatrix/action examples を併用する構成で、LLM に「何をしてよいか」と「盤面のどの局所形をどう崩すか」を同時に渡す点が効いている。限界として、LLM hallucination による無効手、厳しい real-time 制約への不向き、match-3 以外の genre に同じ変換が効くか未検証、という点が挙げられている。結論は、LLM の強みを vision 直接認識ではなく、構造化された intermediate representation 上の意思決定に使えば、非テキスト mobile game でも automatic playtest に使える可能性がある、というもの。

■ 内容分析
Lap の面白さは、「LLM に画面を見せる」話ではなく、「LLM が解ける形までゲーム状態を翻訳する」話である点。vision model の能力向上を待つのではなく、盤面という domain structure を利用して numeric matrix に落とす。これにより、LLM は曖昧な pixel 認識ではなく、ルール、例、現在 state の組に対して次手を選ぶ問題に集中できる。match-3 はこの変換が特に自然で、盤面が grid、行動が隣接 swap、目的が連鎖と score、特殊 cell が少数の記号で表せる。

評価も、単なる「LLM が遊べた」ではなく、coverage、score、level、crash を同時に見ている点がよい。score/level はゲームとして進めたか、coverage はテストとして広く触ったか、crash は脆弱経路に入ったかを表す。Lap が LIT に coverage で 4 ポイントだけ勝つ一方、score と crash でより大きく差を出しているのは、プレイヤーとしての進行能力が深いテスト経路を開くという仮説に合う。

ただし、Lap は genre-specific な成功例でもある。match-3 は盤面 IR が作りやすく、action の合法性も局所的に検査しやすい。アクションゲーム、レース、物理パズル、探索型アドベンチャーでは、状態のどこを記号化するか、どの時間粒度で LLM に渡すか、無効手をどう回復するかが難しくなる。また、LLM の提案を ADB に変換する実行層では、座標ずれ、アニメーション待ち、入力 timing が評価を汚す可能性がある。Lap は「LLM playtester の完成形」ではなく、「画面ゲームを compact IR に落とすと LLM が testing policy になる」という設計例として読むのが正確。

■ 自分達の環境への適用
Nao_u_BOT では、LLM playtester に screenshot をそのまま渡すより先に、prototype ごとの compact IR を決める方が実装効果が高い。grid game なら numeric matrix、runner なら player/enemy/projectile の相対距離と速度、puzzle なら object graph、UI-heavy game なら focused element と available actions の一覧にする。Lap の型に合わせるなら、`state_to_ir()`、`ir_to_prompt()`、`action_to_input()` を分け、LLM には IR と少数の局所例だけを渡す。

Phase 3b の probe としては、既存 prototype に 1 つだけ IR を定義し、random agent、固定 heuristic、LLM agent の 3 者で 60 秒 headless run を比較するのがよい。指標は Lap と同じく、進行度、到達 state 数、crash/error、停滞時間にする。重要なのは、LLM が賢く遊ぶかではなく、「IR を渡すと、人間が期待する探索方向に近づくか」を見ること。うまくいけば shared-reads の知見を playable diff に戻す橋になる。

■ メリット・デメリット
メリットは、既存ゲームに深い API がなくても、画面から構造化 state を作れれば LLM を tester として使えること。few-shot の局所盤面例も、ゲームごとの tutorial 兼 oracle として使いやすい。デメリットは、IR 設計の負担が大きく、IR に落ちない面白さやバグは見えにくいこと。real-time 性が強いゲームでは、LLM 応答時間と入力 timing がボトルネックになる。

■ 判定
部分採用。Lap の match-3 専用 pipeline をそのまま使うのではなく、「screenshot 直読みを避け、compact IR と局所例で LLM tester を動かす」設計を採用する。

■ URL
https://arxiv.org/abs/2507.09490
