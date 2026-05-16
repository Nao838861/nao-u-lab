■ 概要
対象: https://arxiv.org/abs/2605.14537

Cattle Trade は、LLM agent が「単発の交渉問題に答えられるか」ではなく、不完全情報・敵対的相互作用・資源制約が同時に走る長いゲームの中で、競売、隠しオファー、ブラフ、相手状態推定、資金配分を一貫して使えるかを見る multi-agent benchmark。対象は 3-5 人用カードゲーム Kuhhandel / Cattle Trade で、実験は標準構成の 4 人戦、10 種の動物、各 4 枚、50-60 turn。各プレイヤーは動物の quartet を集め、最終 score は「完成 quartet の価値合計 × 完成数」なので、高価な 2 セットだけより、中価値を含めた 3 セットの方が上回る場合がある。個別カードの値段だけでなく、ポートフォリオ全体と終盤の完成圧力を見る必要がある。

ゲームの中核は二つ。第一に auction。手番プレイヤーがカードを引いて競売にかけ、最高 bid を受け入れて売るか、同額を払って buy-right で自分が保持する。高 bid はカード獲得の圧力になる一方、auctioneer に資金を渡してしまう。第二に trade challenge (TC)。同じ動物を持つ相手に、任意の money card を伏せて offer する。相手は中身を見ずに受け入れるか、counteroffer を伏せて出す。公開後、高い offer 側が contested animal card を得る。money card には 0 があり、0 bluff が可能だが、相手が 10 でも counter すれば破れる。さらに money は 0/10/50/100/200/500 の離散カードで、お釣りがない。60 を払うつもりで 100 card しかなければ 100 を失う。donkey が出るたび全員に資金が入り、序盤の cash constraint から終盤の高額 bid へ局面が変わる。

benchmark は Python game engine、LLM agent framework、evaluation system で構成される。agent は自然言語で hand、visible cards、money、legal actions を受け取り、auction bid や TC offer の card composition を JSON で返す。TC の offer_cards: [50, 10, 0] のように、ブラフ構成は model の明示行動になる。各 agent は turn ごとに scratchpad を更新するが、system prompt は中立的なルール説明と「期待 score を最大化するよう最適にプレイせよ」だけ。engine は不正 JSON の retry、action validation、overbid 処理、全 state transition の logging を持つ。すべての bid、TC offer、counteroffer、card selection が残るため、なぜ勝ったか・なぜ破産したかを後から分解できる。

実験は 7 種の cost-efficient LLM と 3 種の deterministic code agents、合計 242 games。primary は 60 pure-LLM tournaments と、各 LLM が 3 体の code agents と戦う 168 mixed games。追加で Sonnet 4.5 の 14 exploratory games を入れている。canonical auction mode、full memory、temperature 0.1、reasoning effort low、4096 token limit。code agents は、公開情報を追跡する TrackerAgent、quartet 完成を貪欲に追う SetRaceAgent、資金流を見て保守的に動く EconomyAgent。

結果は、Gemini 3 Flash が TrueSkill μ=30.1±3.3、win rate 72.9%、median score 5,250 と首位。TrackerAgent は μ=28.7±3.6、win rate 53.6% で 2 位相当、Gemini 3.1 Flash Lite が μ=28.0±2.9、SetRaceAgent が μ=27.3±3.3。重要なのは、TrackerAgent が 7 LLM 中 6 種、SetRaceAgent が 5 種を上回る点。mixed-format でも G3-F と G3.1-FL は code baselines を越えるが、DS-v3.2、GPT-5.4 Nano、Haiku、Gemini 2.5 Flash Lite は mean score で全 code agent を下回る。強さを分けたのは spending volume ではなく、capital efficiency、resource discipline、phase-adaptive bidding。弱い LLM には overbidding、self-bidding、bankrupt TC initiation、相手の資金状態に応じた offer 調整の弱さが出た。

■ 内容分析
この論文の良さは、multi-agent benchmark を「LLM の総合順位表」ではなく、ゲーム内の失敗分類器として設計している点にある。例えば G2.5-FL は bid aggressiveness が高いのに capital efficiency が低く、カードを買っても quartet に変換できない。DS-v3.2 には、他者が競っていないのに自分の bid を競争相手の bid のように扱い、10 から 850 まで上げ続ける trace がある。最終 score だけなら「弱い」で終わるが、行動ログを残すと「非競争状態の認識」「資金制約の確認」「終盤価値への換算」のどこで壊れたかを切り分けられる。

code agent が強いことの意味も大きい。TrackerAgent は自然言語推論をしないが、観測可能なイベントを正確に追跡し、相手予算の少し上で bid し、quartet 完成に関係する時だけ buy-right を使う。この程度の条件分岐が多くの LLM を越えるなら、agent 評価では「モデルが賢そうな文章を書くか」より、状態表現、可視情報の bookkeeping、資源の単位変換、action validation 後の振る舞いを測る方が効く。逆に G3-F が強いのは単に支出が多いからではなく、序盤は低く、終盤は完成圧力に合わせて bid を上げ、相手の資金と動物価値に応じて 0 bluff と 500+ offer を使い分けるため。長いゲームの評価では、能力は単一 subskill ではなく、局面に応じた切り替えとして現れる。

限界も明確。対象は low reasoning effort の cost-efficient models で、Sonnet は n=14 と不確実性が広い。明示戦略を prompt に入れていないため、失敗の一部は prompt design の問題かもしれない。Cattle Trade 固有の経済ルールに寄るので、現実の調達・交渉へ直接一般化するにも別ゲームでの再現が要る。それでも、行動ログから失敗様式を抽出する benchmark 設計としては使いやすい。

■ 自分達の環境への適用
Nao_u_BOT 側では、Cattle Trade そのものを移植するより、評価 harness の観測項目を借りるのが有効。multiplayer、経済、交渉、デッキ/資源管理系 prototype では、最終勝敗だけでなく、bid/offer/counter、保有資源、相手推定、保持判断、bluff 成否、破産状態での攻撃行動を turn log に残す。headless playtest では、agent ごとに「支出効率」「完成物への変換率」「局面別 aggressiveness」「自己競合的な action」「資源不足時の無意味 action」を集計する。

記憶システムにも使える。candidate や game probe の atom に、単なる「勝った/負けた」ではなく、失敗 taxonomies を付ける。例えば overcommit、state-blind offer、late-game underbidding、resource-hoarding、self-competition のようなタグを残せば、次の prototype で同じ agent failure を再検出できる。Phase 3b/4a では、大きな恒久ルール追加ではなく、小さい probe として「交渉ゲームの log schema に failure_mode 欄を追加する」「1 ゲームだけ deterministic baseline と LLM を同じ seed で走らせる」程度から始めるのがよい。

■ メリット・デメリット
メリットは、ゲームを agent 評価のための観測装置として使う時、勝敗より細かい説明変数を設計できること。code baseline と LLM を同じ環境に置くので、LLM 固有の弱さと、単純な条件分岐で足りる部分を分けやすい。Nao_u_BOT の制作サイクルでも、playable prototype から評価指標へ接続しやすい。

デメリットは、Cattle Trade の設計が経済ゲーム寄りで、アクション性、探索、物語生成、協力型設計へはそのまま移植できないこと。ログ設計を増やしすぎると prototype の速度も落ちる。まずは交渉・資源・カード選択を含む小さいゲームに限定して使うべき。

■ 判定
部分採用。ゲーム内容ではなく、benchmark の作り方を採る。行動ログから failure mode を読む設計、deterministic code agent を baseline に置く設計、spending efficiency / resource discipline / phase adaptation の三軸を、Nao_u_BOT の headless 評価 harness に小さく導入する。
