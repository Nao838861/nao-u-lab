■ 概要
対象は ICLR 2025 採択論文「BALROG: Benchmarking Agentic LLM and VLM Reasoning On Games」。問題設定は、LLM/VLM が知識問題や短い推論課題で高得点を出しても、動的な環境で何十手、何百手と行動しながら目的を達成する agentic capability はまだ十分に測れていない、という点にある。現実のタスクやゲームプレイでは、ルール理解、空間把握、探索、長期 planning、失敗からの戦略更新、環境 dynamics の発見が絡む。しかし既存 benchmark は短い interaction や静的 QA に寄りやすく、モデルが「知っている」ことを「その場で使える」かを分けて観察しにくい。

BALROG はこの穴を、既存の reinforcement learning game environments を束ねた統一 testbed として埋めようとする。対象は BabyAI、Crafter、TextWorld、Baba Is AI、MiniHack、NetHack Learning Environment の 6 環境。簡単な自然言語ナビゲーションから、Minecraft 風の資源収集と survival、テキストアドベンチャー、Baba Is You 系のルール変形 puzzle、NetHack 系の長期探索と resource management まで、必要技能と難度を段階的に広げている。表では navigation / exploration / resource management / complex credit assignment / environment dynamics の推論 / long-term planning を分け、BabyAI では秒単位で解ける課題、NetHack では人間が習熟に年単位を要する課題として位置づける。環境は procedurally generated なので、単純な暗記や固定 instance への過適合もしにくい。

評価 protocol は、モデルが各 timestep で観測履歴とルール説明を受け、自然言語の action string を返す形にそろえる。無効 action は環境側が feedback し、fallback action を実行して trajectory statistics に残す。重要なのは、単に completion したかだけではなく、どこまで進んだかを 0-100 の standardized metric として扱う点。BabyAI、MiniHack、Baba Is AI では task completion を 0/100 にし、TextWorld、Crafter、NetHack では achievements や progression の割合を使う。特に NetHack はゲーム内 score が実際の進行をうまく反映しないため、data-informed progression metric を別に設ける。さらに言語のみの観測と、画像を加えた vision-language 観測を比較し、VLM が視覚入力を action-oriented reasoning に使えるかも見る。

baseline は GPT-4o、GPT-4o-mini、Claude 3.5 Sonnet、Gemini 1.5 系、Llama 3.1/3.2 系、NetHack 限定で o1 系などを zero-shot で評価する。結果はかなり厳しい。language-only の平均 progression は GPT-4o が最上位で約 32%、Claude 3.5 Sonnet が約 30%、Llama 3.1 70B が約 28%。一方で MiniHack の quest / boxoban はどのモデルも解けず、NetHack は最良の o1-preview でも平均 progression が約 1.5% に留まる。簡単なゲームでは部分成功が見えるが、長期計画と探索が絡む環境ではほぼ進まない。

論文の面白い結論は、視覚入力を足すと強くなるとは限らないことだ。GPT-4o や Llama 3.2 は画像つき観測で性能が落ち、VLM が画面を「説明」できても、逐次的な意思決定のために安定して使えるわけではないことが示される。定性的分析でも、複雑な位置取りで角に追い込まれる、TextWorld で DFS 的に未探索領域を管理できず同じ部屋を巡回する、Boxoban のような不可逆失敗のある puzzle で一度も成功しない、Crafter で短期の採集や戦闘はできても夜間対策の shelter 作成へ届かない、といった失敗が挙げられる。さらに NetHack では、モデルが別質問では腐った食料や階段脱出の危険性を説明できるのに、実プレイでは同じ失敗を踏む。BALROG が露出するのは、知識不足だけではなく、知識を行動方針へ接続できない knowing-doing gap である。

■ 内容分析
この論文の価値は、ゲームを「LLM が遊べたか」のデモにせず、agentic failure の分解器として使っている点にある。6 環境の選び方は派手な 3D 世界ではないが、軽量 simulator、procedural generation、既存 RL 環境、長い horizon という条件を満たしている。これにより、単発の screenshot 解釈や scripted UI 操作ではなく、同じ protocol で大量 seed を回し、環境ごとに失敗の質を比較できる。特に action validity を trajectory statistics として残す設計は、モデルの失敗を「推論が弱い」だけに潰さず、ルール読解、行動空間の保持、探索履歴の管理、長期計画、視覚統合のどこで崩れたかを後から読むための足場になっている。

また、BALROG は model benchmark と agent strategy benchmark を意図的に分けている。新しいモデルを zero-shot で入れることも、同じモデルに対する inference-time prompting / memory / planning strategy を agent.py 側で差し替えることもできる。これは結果表の順位より重要で、agentic coding や game-playing agent の研究では、基盤モデルの性能と周辺戦略の性能が混ざりやすい。BALROG はその混線を避け、モデル更新で解けたのか、探索メモリや行動選択器で改善したのかを切り分ける設計になっている。

一方で限界も明確で、評価は既存 game environment 中心であり、自作ゲームの面白さ、演出、操作感、プレイヤー体験の評価をそのまま代替するものではない。VLM についても、観測画像は current observation 中心で、video 的な連続視覚理解まではまだ本丸ではない。それでも「視覚を渡したら評価が上がるはず」という安易な期待を崩し、画像入力が action selection を悪化させる場合まで測った点は、ゲーム AI 評価として重要な警告になっている。

■ 自分達の環境への適用
Nao_u_BOT の playable diff 評価では、いまも「起動する」「遊べる」「スコアが出る」に寄りやすい。BALROG から借りるべきなのは benchmark そのものではなく、失敗ログの分解軸である。各 prototype について、completion だけでなく、navigation、exploration、resource/ability management、irreversible failure の回避、環境ルールの発見、long-term objective の維持を小さな rubric に分ける。弾幕なら、被弾回避、敵処理、アイテム回収、boss phase 認識、危険地帯からの離脱を別 metric にする。探索ゲームなら、未探索領域の記録、鍵扉 dependency の理解、戻り導線、無意味な往復を分ける。

Phase 3b では、BALROG 型の「knowing-doing gap」probe を作れる。たとえばレビュー文では「この敵に近づくな」と正しく説明できる agent が、headless replay では同じ敵へ突っ込むかを比較する。VLM 評価でも、screenshot を渡した時に説明が増えるだけで操作が改善しないなら、画像入力はまだ採用しない。memory 側には、単一 score ではなく、失敗カテゴリ、seed、観測形式、action validity、再試行後の改善を残す。これにより、shared-reads の知見を抽象論で終わらせず、次の playable diff の検証ログへ戻せる。

■ メリット・デメリット
メリットは、ゲーム制作 agent の評価を「成功/失敗」から、どの agentic skill が詰まったかへ分解できること。短い自動テストでは拾えない探索、計画、視覚判断、知識と行動の断絶をログにできる。

デメリットは、BALROG の環境は benchmark 用に整備された既存 RL 環境であり、我々の小型自作ゲームへ移すには metric 翻訳が必要なこと。数値化しすぎると、面白さや手触りではなく、測りやすい進行だけを最適化する危険もある。

■ 判定
部分採用。BALROG を直接導入するのではなく、playable diff 評価の失敗分類、観測形式比較、knowing-doing gap probe、progression metric 設計に使う。特に「画像入力で本当に意思決定が良くなったか」を毎回疑う軸として採用する。

■ URL
https://arxiv.org/abs/2411.13543
https://openreview.net/forum?id=fp6t3F669F
https://balrogai.com
