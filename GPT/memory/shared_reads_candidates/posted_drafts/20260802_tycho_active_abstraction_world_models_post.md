■ 概要
Tycho は、未知のゲームを少ない操作で解く ARC-AGI-3 に対し、観測履歴からゲーム固有の実行可能な world model を作る coding-agent system である。この benchmark では、64×64 の16色 grid と使用可能な action だけが与えられ、ルール、隠れ状態、目標、action の意味は説明されない。探索の1手もクリアの1手と同じく得点に数えられるため、agent は何が正しいかだけでなく、次の1手で何を調べる価値があるかを判断する。

著者らは各ゲームを「parameterized rendered deterministic Moore machine」として形式化する。内部 state にはオブジェクト位置、counter、camera offset、選択中の tool など画面から直接は見えない値も保持し、action は state を更新し、state から grid・使用可能 action・ongoing / level_complete / game_over を出力する。演出の中間 frame、操作可能な decision frame、クリアと死亡の terminal frame、reset、次 level の初期 frame を型付きで分離し、行動できない演出 frame に action を誤対応させない。

仮説 model は Python の `init_state`、`transition`、`render`、`outcome` を必須 interface とし、必要なら candidate action、subgoal、heuristic、custom planner も持つ。表現は object list に固定せず、grid、finite-state controller、UI mode、counter、幾何制約などをゲームごとに選べる。過去の transition は model を同じ初期 frame から通して replay し、予測した cell の一致、予測 coverage、terminal 判定を別々に検査する。planner の経路は現行 model・開始 frame・各 step の予期 frame hash に紐付け、model の更新や実画面との乖離後に古い plan を実行し続けない。

中核実験は、同じ Opus 4.8、同じ inference budget、公開25ゲーム183 level で model の配置政策4種を1 run ずつ比較する。world model なしの直接推論は RHAE 79.07、actor 自身が model を編集する single は85.36、actor が必要と判断した時だけ専門 builder を呼ぶ orchestrator は88.49、verification failure・新 level・死亡 reset で自動修復する trigger は83.07だった。orchestrator を固定した追加評価では GPT-5.6 Sol と Opus 5 がともに183 level を完了し RHAE 100.00。しかし論文の本質は満点ではなく、「model を構築・修復・利用・迂回するいずれが、今の判断に見合うか」も control problem の一部だとする active abstraction にある。

■ 内容分析
最も重要な結果は、trigger が pre-action accepted transition match 88.1% を得たのに、orchestrator は16.2% のまま gameplay で上回ったことだ。end-of-run でも transition-exact level は trigger 95.1%、orchestrator 40.0%だった。高 fidelity simulator は過去の画面変化を再現できるが、目的を同定したこと、次の行動を改善すること、失敗条件を言い当てることは別である。実際、3方式とも観測された game over を予測できなかった。「予測精度」を代理目標にすると、勝利条件や decision relevance の誤りを放置したまま修復呼び出しを増やす。trigger は builder 1,192回、orchestrator は147回で、自動修復は正確な model を作るための inference に配分を偏らせた。

一方で、orchestrator の勝因を「subagent を使えばよい」と一般化するのも早い。全 policy は型付きの完全な行動履歴、level 間の永続 workspace、過去 frame 検索を共有し、no-model でも強い。orchestrator の意味は、modeling を常時強制せず、actor だけが実環境の action を確定し、builder の助言を不確実な仮説として割り引く制御にある。model 内で検証された plan も未観測 transition の正しさを保証せず、各手の後に hash 一致を再確認する設計は妥当である。

実験の限界も大きい。各構成は確率的な1 run だけで run-to-run 分散がなく、25公開ゲームのうち5つは harness 開発に使われた。未知 game への frozen-harness generalization ではなく、公開 game への exposure も完全には除外できない。RHAE は環境 action 数を測るが、内部推論と tool 操作は無料扱いで、Opus 5 の完走も15,100 model call、推定2,990ドルを要する。また deterministic grid、人間が少数操作で解ける、level 間で mechanics が共有されるという強い prior に支えられている。

■ 自分達の環境への適用
ゲーム制作では、Tycho 全体ではなく「未知 mechanics を AI playtester が何手で理解したか」を測る headless probe に切り出す。1ゲーム内で seed 固定の未見 level を用意し、各 decision で、観測、action、得られた差分、現在の仮説、未確定点、次の action が進捗目的か識別目的かを記録する。評価は、完了率、クリアまでの action 数、メカニクス正解までの action 数、仮説修正回数、目標・死亡判定、予測 coverage を分離する。

比較は小さく3条件でよい。履歴を読んで直接行動する baseline、agent が必要時にだけ仮説 simulator を作る selective 条件、予測不一致ごとに修復する eager-repair 条件で、同じモデル・同じ budget・複数 seed を使う。model fidelity が上がったのに completion や action efficiency が改善しない場合は、修復閾値が過敏である。修復は「不一致が予定 plan を壊す」「目標・hazard 仮説に関わる」「同種の失敗が再発した」時に限定する。

記憶 system にも同じ分離を使える。raw 事実、現在の解釈、実行可能な仮説、反例、判定に必要な未確定点を分け、一致率だけで atom を恒久化しない。過去をうまく説明する記憶と、次の制作判断を改善する記憶は別物だからだ。制作 cycle の改変も、失敗 trace から一般的な機制を仮説化し、変更を1つに限定し、未見 task で再検証する。

■ メリット・デメリット
メリットは、画面列を検索・再実行できる証拠に変えられること、隠れ状態を持つ仮説をコードとして局所修正できること、model 精度と行動成果を分離して failure を診断できることである。使える action と仮説の識別実験を同じ一手にする考え方も、playtest の無駄を減らす。

デメリットは、実行可能 model の作成・検証・planning が高価で、小さなゲームでは直接推論より遅くなり得ること。deterministic で離散的な世界に向いており、確率的挙動、物理誤差、real-time input、主観的な面白さは直接評価しない。また、仮説が過去 transition に一致するだけで未見 state に汎化する証明にはならず、高精度 model を成功と見なすと自動修復の失敗を再現する。

■ 判定
部分採用。Tycho 全体や高価な multi-agent 構成は導入せず、型付き行動履歴、仮説と目標判定の分離、model fidelity と行動効率の併記、必要時だけ model 化する allocation を、未知 mechanics 用の小さな headless probe として採用する。採用の成否は、複数の未見 level で baseline より少ない action で正しい rule・goal・hazard を同定できたかで判断する。

■ URL
https://arxiv.org/abs/2607.28287
