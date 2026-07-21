■ 概要
『Star Trek: Voyager - Across the Unknown』が扱った問題は、全7シーズン・198話のテレビシリーズを、原作の名場面を順に再生するだけのゲームにせず、資源不足と損失が続く survival strategy へ翻訳することだ。開発側は約30話を選び、航路を12 sector に区切ったうえで、物語イベントを三層に分けた。第一は sector 進行に結び付く multi-stage の main quest。第二は特定惑星へ寄った時だけ始まり、無視して先へ進むこともできる side quest。第三は away mission を持たず、ランダムに発生して dialogue tree だけで解決する random event である。main / side では宇宙戦、会話選択、異なる skill を持つ3人の crew を送る away mission が混在し、失敗は負傷、死亡、報酬喪失、場合によっては game over まで波及する。

中核は、この三層を独立した短編にせず、crew availability、船の資源、取得技術、生存人物、成功確率という共有状態で結んだ点にある。複数 mission は並行して進むため、ある任務に人物を拘束すると、別任務でその人物の skill を使えず成功率が落ちる。テレビの A / B / C plot に似た交差が、脚本上の切替ではなく resource contention から生まれる。また多くの選択肢には確率判定があり、原作の正解や会話順を暗記しても結末を固定できない。たとえば原作では退場する Kes を救える可能性はあるが保証されず、生存した場合は後続 mission の成功率を大きく上げる。取得できるか不確実だからこそ、人物の生存を narrative reward と systemic reward の両方にできる。

圧縮も単なる要約ではない。記事が挙げる Borg の子供 Icheb に関する二話では、テレビ版の離れた時系列をそのまま短文化せず、先に両親と出会い、子供たちを救出し、故郷へ送り届ける一つの quest chain に再編集している。シーズン間の視聴時間が担っていた愛着形成を、救出対象の発見、移送、帰還判断という player action へ置き換え、無視・失敗・見捨てる選択も survival loop に戻した。結論は、既知の物語を interactive にする鍵は分岐数の増加ではなく、原作の因果を、競合する人物・資源・確率・後続効果へ再符号化することだ、というものになる。

■ 内容分析
この設計の強さは、物語の「重要な選択」と strategy の「希少資源の配分」を同じ decision surface に載せたことにある。原作再現型ゲームでは、正史を知る player が会話の正解を選び、既知の見せ場を回収する観光になりやすい。本作は正しい意図と成功結果を分離し、準備、crew 編成、同時進行中の拘束、確率を間に置く。そのため player は「Janeway の判断に賛成か」だけでなく、「この損耗状態でその倫理を実行できるか」を問われる。survival strategy の圧力が、原作の道徳的論争を進行コストへ変換している。

三層 event は制作予算の配分としても読める。全話を同じ密度の quest にせず、進行を支える main、探索コストを要求する optional、text だけで低コストに変化を足す random へ落とすことで、原作カバレッジと実装量を調整できる。一方、重要なのはラベルではなく共有状態である。main / side / random を三つのリストとして実装するだけでは、単発イベント集に戻る。人物の不在、負傷、死亡、技術、後続補正を event 間で参照し、現在の選択が次の選択肢集合や odds を変える時に初めて network になる。

確率は scope control にも効いている。すべてを hard branch にすると各分岐先の script、演出、QA が増殖するが、同じ event 骨格の中で成功率と状態差分を変えれば、少ない authored content から run ごとの差を作れる。ただし、これは確率なら何でもよいという話ではない。失敗理由が player から読めない、準備で odds を動かせない、重要人物が一回の不可視 roll で消える、という条件では、ドラマは因果ではなく事故に見える。成功率を表示すること、skill や資源投入で介入できること、失敗後も別の物語状態が続くことが必要になる。

記事の評価根拠は、完成作を遊んだ記者による構造分析と、Kes / Icheb などの具体例であり、分岐網の規模、完走率、player 調査、確率調整の反復回数は示されていない。したがって「この方式が定量的に engagement を高めた」とまでは言えない。また原作台詞の再利用や既知の人物への愛着が大きな下駄になっており、新規 IP が同じ event 密度で同等の感情効果を得られる保証もない。ここは手法と商業的成功を切り分けるべき点である。

■ 自分達の環境への適用
我々の小規模ゲームでは、198話規模を模倣せず、まず5イベントの micro quest network として試せる。共有状態を `crew_available`、`injury`、`resource`、`rescued_npc`、`tech_flags` の五群に限定し、main 2件、optional 2件、random 1件を用意する。各 event は `preconditions / participants / resource_cost / visible_odds / success_delta / failure_delta / later_modifiers` を持つ。特に「誰かを別任務へ送ったため次の有利手段が消える」と「救出した人物が後続 odds を上げる」を一つずつ入れれば、A / B plot の干渉と長期 reward を最小規模で検査できる。

headless 評価では単一の勝率だけを見ず、固定 seed 群で event 到達率、人物別の拘束時間、失敗後に継続可能な run の割合、同一初期条件から生じる terminal state の多様性を記録する。さらに、最善手を知る scripted agent と、目先の成功率だけを選ぶ greedy agent を比較する。前者が常に同じ正史へ収束するなら不確実性が弱く、後者が高確率選択だけで安定勝利するなら長期 reward が機能していない。逆に terminal state だけが散らばり、選択との相関が薄いなら random accident が強すぎる。人間レビューでは「失敗を自分の配分判断として説明できるか」を確認する。

記憶システムには物語本文より、再利用可能な event schema と観測結果を atom 化するのがよい。「optional quest を入れた」ではなく、「人物拘束が後続 choice set を狭めた」「救出 reward が3 event 後にも参照された」「不可視 roll が納得感を壊した」の形で残す。制作サイクルでは、まず状態差分だけの headless prototype、次に短い dialogue、最後に固有演出の順で厚くすれば、因果が弱いまま文章量だけ増えるのを防げる。

■ メリット・デメリット
メリットは、少数の authored event でも共有状態と並行実行によって再訪価値を作れること、原作知識を正解表ではなくリスク判断の文脈へ変えられること、人物の生存や技術を感情と数値の両方で報酬化できること、hard branch の爆発を確率と state modifier で抑えられることである。長い設定を prototype へ切る際にも、残すべきものを台詞ではなく「後で何を変える因果か」で選べる。

デメリットは、重要な結末ほど確率事故への反発が強くなること、共有人物が多いほど mission scheduling と QA の組合せが増えること、原作ファンが期待する再現と survival 上の合理性が衝突すること、状態参照を増やしすぎると writer も player も因果を追えなくなることである。成功率の表示だけでは納得感は保証されず、roll 前の介入可能性と roll 後の継続物語が要る。また、記事は定量評価を提示していないため、これを普遍的な narrative design の成功則として採用するのは危険である。

■ 判定
部分採用。main / optional / random の分類そのものではなく、人物・資源・生存・後続補正を共有状態にして event 同士を干渉させる部分を採る。最初は5イベント、固定 seed、可視 odds で検証し、選択と結果の説明可能性が確認できた場合だけ物語量を増やす。不可視の確率で重要人物を失わせる設計は採用しない。

■ URL
https://www.gamedeveloper.com/design/star-trek-voyager-across-the-unknown-reinvents-episodic-storytelling-for-survival-strategy-narrative-notebook-4
