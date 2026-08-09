■ 概要
対象は “Adversarial Stress Testing of Role-Playing Language Agents using Multi-Agent Evaluation”。定義済みの persona、役割、行動・倫理制約を持つ会話 agent が、単発質問には耐えても、圧力が累積する対話では役割放棄、制約違反、口調変化、自己矛盾を起こす問題を扱う。静的 benchmark や一問ごとの red teaming ではこの時間方向の崩れを捉えにくいため、著者らは Target、Interrogator、Judging の責務を分離した multi-agent evaluation platform を作った。

Interrogator は Role Drift、Ethical Probing、Contradiction、Confusion、Authority Challenge、Emotional Manipulation の6戦略を持つ。10 turn のうち1～3 turnでは Role Drift や Confusion など難度3以下を優先し、その後は権威を装う要求や感情的な懇願へ段階的に強める。Target の応答を読んで次の攻撃を生成するため、抵抗の仕方に合わせて圧力を変える。終了後、Judging 側が全 transcript を読み、Role Fidelity（RF）、Drift Index（DI）、Ethical Deviation（ED）、Consistency Score（CS）と加重 Overall を算出する。会話と metadata は保存され、replay・比較できる。

主実験は Llama-3.3-70B を Target・Interrogator・Judging に使い、Healthcare Assistant、Customer Support Agent、Financial Advisor の3 personaを、Role Drift だけの baseline と6戦略条件で比較した。各条件は10 turn、3 random seed。Overall は順に0.837→0.634、0.867→0.693、0.850→0.661へ低下した。Healthcare では RF=0.531、DI=0.312、ED=0.287となり、重大な違反は最初の3 turnには少なく、turn 6以降に増えた。Healthcare の Target だけを GPT-4o-mini、Claude-3.5-Haiku に替えた比較でも Overall は0.681、0.712で、Authority Challenge と Emotional Manipulation が強いという順位は維持された。60 conversation turnを3人の domain expert が採点した検証では、自動値との相関が RF 0.82、ED 0.78、CS 0.75、評価者間一致 Fleiss' κ=0.71だった。結論は、単一戦略では robustness を楽観視し、複数戦略が連鎖する後半で初めて見える failure がある、というものだ。

■ 内容分析
使える中核は「強い攻撃文を一発当てること」ではなく、低圧から始め、Target の応答を条件に攻撃を適応させ、失敗の発生 turn と履歴を保存する試験設計である。会話 NPC の破綻は prompt 単位の属性ではない。前の発言で約束したこと、player に譲歩したこと、感情的に同調したことが次の応答の制約になる。したがって transcript 全体を test case として扱い、同じ persona・seed・攻撃 policy で回帰比較できるようにする発想は妥当である。Target と adversary と evaluator の分離も、生成中に採点基準を混ぜず、後から failure trace を読むために有効だ。

ただし、論文が “Judging Agent” と呼ぶものの定量部分は、汎用的な意味理解 judge ではない。RF は制約違反 phrase、role description から抽出した TF-IDF 語、役割放棄 phrase の検出を0.4/0.3/0.3で合成する。DI は会話前半と後半の role-term density 差、ED は検出違反数を応答数と制約数で割る。CS は contradiction rate と tone shift 件数から作る。重みは pilot testing で決められ、Overall も RF 0.3、反転DI 0.2、反転ED 0.3、CS 0.2の手設定である。つまり結果は「persona の意味的な忠実度」そのものではなく、この detector 群に対する値でもある。

この定義には具体的な blind spot がある。role 語を残したまま危険な助言をすれば DI は低く見え、最初から役割が薄い agent は前後差がなく drift を免れる。ED は制約数が多い persona ほど同じ違反数の値が小さくなり得るため、persona 間比較に混入がある。口調の変化も、状況に応じた自然な empathy と persona 崩壊を区別しにくい。人手検証は前進だが60 turnと小さく、同じ rubric に沿った相関は、未知の表現やゲーム固有の演技品質まで測れる保証ではない。また baseline は平常会話や single-turn ではなく Role Drift だけの10-turn条件なので、「静的試験では見えない」という主張を直接比較した実験ではない。cross-model validation も Healthcare 一役に限定される。公開 platform を標榜する一方、論文PDFには repository URLが記載されておらず、再現可能性はコード入手経路まで確認してから評価すべきである。

■ 自分達の環境への適用
ゲーム制作へは、会話 NPC / companion の headless adversarial playtest として小さく移植できる。最初に NPC ごとに「絶対に守る制約」「変化してよい感情」「記憶すべき約束」「世界設定上知らない情報」を機械可読な仕様にする。Interrogator 相当の player policy は、設定上書き、嘘の既成事実、矛盾した依頼、権威の詐称、同情の要求、報酬や離脱をちらつかせる圧力に分ける。各 episode は最低10 turnとし、攻撃 category、強度、Target 応答、発生した違反、最初の failure turnをJSONで保存する。

採点は一つの Overall に潰さない。deterministic detector で確認できる「禁則語・秘密情報・明示的約束の矛盾」と、人間または意味評価が必要な「演技の自然さ・感情遷移・物語上許される譲歩」を分離する。作品固有の hard constraint は pass/fail、persona の魅力や口調は補助 score とし、同じ scripted attack を model・prompt・memory 実装の変更前後で replay する。まず3 NPC×6 strategy×3 seedを回し、通常会話10 turn、単一戦略10 turn、段階的複数戦略10 turnの三条件を比較する。見るのは平均点だけでなく、failure onset の分布、最悪 seed、戦略別 violation rate、同一 episode の再現率である。

記憶システムにも同じ構図を使える。長い作業 cycle で最初の directive が後半に薄れる問題に対し、Authority Challenge を「後から来た局所指示が正本を上書きすると主張する」、Contradiction を「過去の staging と食い違う前提を渡す」、Emotional Manipulation を「完了を急がせて検証を省かせる」と読み替えられる。自動 cycle の smoke test に adversarial directive sequence を入れ、source of truth、git gate、投稿品質 gate が何 turn 目まで維持されるかを測れる。ただし攻撃文そのものを恒久記憶へ混ぜず、隔離した fixture として管理する。

■ メリット・デメリット
メリットは、第一に failure を、どの圧力が何 turn 蓄積した時に崩れたかという再現可能な trace にすること。第二に、Target・攻撃生成・事後評価を分け、各要素を独立に差し替えられること。第三に、通常 playtest で抜ける悪意ある入力を覆い、回帰試験へ接続できることだ。

デメリットは、攻撃側もLLMなので test set 自体が揺れ、強い表現を生成した条件ほど単純に不利になること。評価式は keyword と role-term density に強く依存し、ゲーム内の婉曲表現、皮肉、意図的な character arc を誤判定し得る。10 turn・3 seed・3 personaでは rare failure や長期記憶の劣化を十分覆わない。さらに、攻撃 prompt と発見した bypass を共有資産にすると、そのまま悪用手順になり得るため、ログの公開範囲とアクセス制御も必要になる。

■ 判定
部分採用。採用するのは、段階的な adversarial player policy、Target / Interrogator / evaluator の責務分離、全履歴保存、failure onset を含む replay 可能な headless harness である。論文のRF・DI・ED・CSとOverall重みはそのまま採用しない。作品固有の hard constraint、通常会話との対照、複数 seed の最悪値、人手確認を組み合わせた小規模 probe で有効性を確かめる。

■ URL
https://arxiv.org/abs/2608.03166v1
https://arxiv.org/pdf/2608.03166v1
