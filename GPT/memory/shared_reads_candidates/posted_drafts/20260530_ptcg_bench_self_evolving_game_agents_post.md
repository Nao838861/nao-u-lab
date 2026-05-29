■ 概要
対象: https://arxiv.org/abs/2605.29653

PTCG-Bench は、Pokemon Trading Card Game を使って LLM agent のゲームプレイ能力と self-evolution 能力を同じ環境内で測る benchmark。狙いは「LLM がゲームを遊べるか」だけではなく、複雑な対戦ゲームで、経験を次回以降の判断に変換できるか、さらにその結果を model backbone の能力と agent harness の設計効果に分けて読めるかにある。

問題設定として PTCG はかなり厳しい。盤面には公開情報と非公開情報が混在し、相手の手札・山札順・Prize card は見えない。カードの効果文、HP、エネルギー、進化段階、攻撃条件、弱点、ベンチ枠、トラッシュなどを統合しながら、長いターン列の中でリソースを使う。単に次の合法手を選ぶだけでなく、セットアップ、エネルギー加速、進化、手札補充、相手の脅威への対応、Prize race の見通しまで含むため、短いパズルや完全情報ゲームより「運用中の agent」の失敗が出やすい。

環境側は Python の PTCG engine として実装され、状態遷移と legal action validation を engine が担う。agent は各 decision point で現在観測、合法手、履歴を LLM-readable prompt として受け取り、tool call 形式で play_pokemon、evolve_pokemon、attach_energy、use_item、use_supporter、attack、retreat、pass_turn などを返す。engine はその tool call を検証し、合法なら実行、不正なら retry/fallback する。この構成により、ゲーム実行は固定しつつ、観測表現・履歴管理・行動選択・記憶更新だけを比較できる。

評価は大きく三つ。第一に、固定 ReAct harness のもとで 10 種の LLM backbone と Random / Heuristic を round-robin で戦わせ、Glicko-2 rating で単発の戦略性能を測る。結果は GPT-5.4 Nano の 1237 から Gemini 3.1 Pro の 1854 まで 617 point の幅が出ており、frontier variant が同 family の軽量版を上回る傾向も見える。一方で、推論コストと強さは単調ではなく、LiveBench / SWE-Bench Pro / GPQA などの一般 benchmark 順位とも弱い一致に留まる。PTCG-Bench が測っているのは、静的な言語理解よりも、不完全情報・長期計画・戦略的相互作用に寄った能力だという位置づけになる。

第二に、self-evolution を anchored tournament で測る。更新する agent 同士を同時に round-robin すると rating scale が動いてしまうため、固定 anchor と複数 round 対戦し、各 round 後に agent だけが persistent state を更新する。比較対象は Reflexion、ExpeL、long-term memory、prompt evolution、skill-library evolution。更新対象は reflections、戦略 lesson、retrieved memory、改訂 prompt、条件付き skill などで、backbone・action interface・anchor は固定される。結果として、8 round を通じてどの方式も一貫した単調改善を示さず、同 backbone の非進化 ReAct reference を最後に安定して超えるわけでもない。長期・不完全情報・遅延報酬のゲームでは、単発の反省文や memory がそのまま再利用可能な戦略知識になるとは限らない、という結論が強い。

第三に、harness ablation が重要。Full harness は structured observation、legal-action masking、context-window-aware history を持つ。これに対し、structured observation を外すと rating は 33 point 低下、legal-action masking を外すと 118 point 低下、recent history を外すと 115 point 低下、全部外す minimal harness では 151 point 低下した。invalid/unparsable action rate も full 3.3% から minimal 27.3% まで悪化し、history なしでは tool call 数が大きく増える。つまり同じ LLM でも、状態をどう見せるか、合法手をどう束縛するか、直近履歴をどう残すかで、隣接 model gap 以上の差が出る。

■ 内容分析
この論文の一番使える点は、評価対象を「モデル」「ゲーム環境」「harness」「経験の保存形式」に分解しているところ。LLM agent のゲーム評価では、強いモデルを置いたら遊べた、記憶を足したら改善した、という見せ方になりがちだが、PTCG-Bench は legal action masking や history だけで 100 point 級の差が出ることを数値で示している。これは、agent の性能を backbone 名で語るのが危険だという実験的な根拠になる。

self-evolution の結果も重要で、ここでは「経験を残す」こと自体は複数方式で試されているが、安定した成長にはつながっていない。理由は PTCG の信号が粗いからだと読める。1 game の勝敗は、多数の tool-mediated decision、非公開情報、確率的 draw、相手行動、序盤の小さな sequencing error の蓄積に左右される。終局後の reflection だけでは、どの判断が本当に次回も使える一般則なのかを切り出しにくい。Skill library も、発動条件・目的・推奨判断を構造化しているが、状況認識がずれると不適切な skill を呼ぶ危険が残る。

一方で、PTCG-Bench 自体にも注意点はある。Pokemon TCG の rule/カード pool/engine 実装に依存するので、評価結果をそのまま全ゲームに一般化するのは無理がある。また paper の self-evolution baseline は代表的だが、各方式の実装品質や prompt 設計にも左右される。したがって価値は leaderboard というより、「複雑ゲームで agent-system を切り分けて測るための実験設計」にある。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作サイクルでは、この論文を prototype の headless playtest 設計に使える。今の制作物に対して、LLM をプレイヤーやテスターとして走らせる場合、まず engine / game state / legal action / replay log を固定し、その上で harness を差し替える形にする。比較単位は model ではなく、structured observation、legal action list、recent history、memory/lesson/skill の有無に分ける。

特に有効なのは、playable diff の評価時に「不正操作率」「再試行回数」「行動決定までの tool call 数」「勝敗やスコア」「同一 seed での再現性」を一緒に保存すること。ゲームが面白くなったかの前に、agent が状態を読めているか、合法操作に着地できているか、履歴がないと破綻するかを測れる。Phase 3b/4a の probe としては、1 つの小型ゲームに full harness / no legal mask / no history の 3 条件だけを入れ、モデルを変えずに差を見るのが軽い。

■ メリット・デメリット
メリットは、agent 評価を backbone 勝負から引き離し、harness と経験保存の効果を分解できる点。長期プレイ、ログ、固定 anchor、ablation が揃うので、改善が本当に gameplay に転移したかを見やすい。

デメリットは、環境実装と合法手 interface のコストが高いこと。複雑なゲームほど engine 側の正しさが評価の土台になり、カードゲーム固有の知識も強く出る。小規模 prototype にそのまま移植すると重すぎる。

■ 判定
部分採用。Pokemon TCG benchmark そのものではなく、headless playtest の評価設計として採用する。まずは「固定 engine + legal action + replay + harness ablation」を最小セットにし、self-evolution は安定改善を前提にせず、経験がどこで壊れるかを見る用途に限定する。
