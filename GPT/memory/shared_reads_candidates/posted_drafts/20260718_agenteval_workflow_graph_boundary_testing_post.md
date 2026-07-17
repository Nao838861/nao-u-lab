■ 概要
会話型 LLM agent の評価は、決められた依頼を最後まで達成できるかという能力測定に寄りやすい。しかし実運用で危険なのは、本人確認前に処理する、最終確認なしで予約を取り消す、条件外の値を受理するといった「状態遷移の境界」が壊れることだ。この種の境界は複数ターンの前提条件の奥にあり、単発プロンプトでは検査地点へ到達できない。配備済み agent は内部状態を見られない black box であることも多い。

論文の AgentEval は、この問題を「どこに境界があり、どう到達するかを会話から採掘する」テストとして解く。Discovery phase では固定 budget 内で対話 trace を集め、LLM が各 turn を activity に抽象化する。activity を node、user action を edge とする conversational workflow graph を構築し、分岐、guard、prerequisite、validation、confirmation gate の構造的位置を boundary test の標的にする。各 test は境界直前まで観測済み経路を新規 session で replay し、未確認、無効値、前提不足などの perturbation を加える。別の LLM judge が可視会話だけから pass / fail / inconclusive を判定する。test plan は更新後の回帰資産になる。

評価は source code を読める privileged auditor を正解側に置き、AgentEval 自体には内部を見せない。4 種の τ³-bench service agent で、test validity、文書化された機能に対する coverage recall、distinct boundary 数、duplicate rate、実行時 false-alarm rate を測定した。各 agent で 23〜38 の異なる boundary を覆った。airline 領域では phase-guided discovery により機能 coverage recall が naive exploration の 0.72 から 0.97 に上がった。50 本の boundary test を生成する ablation では、prompt-only が distinct 12・duplicate 0.56、同じ graph を文章として prompt に渡す Graph-context が distinct 9・duplicate 0.40、graph の構造位置を列挙して標的化する完全方式が distinct 23・duplicate 0.26 だった。false-alarm rate は順に 0.04、0.00、0.00。結論は、graph を知識として見せること自体ではなく、graph 上の位置を deterministic に走査して test target に変換することが、重複を減らし深い状態境界を広く検査する鍵だというものだ。

■ 内容分析
この研究の強さは、会話評価を「良い返答か」から「配備物の再実行可能な software test」へ置き直した点にある。model 単体ではなく、prompt・policy・tool・guardrail を含む system を扱うため、周辺実装の変更による破損も検出できる。境界へ至る preamble と perturbation を分離し、正しい state まで運んだ後に一点を崩すので、failure の意味と再現経路が残る。

ablation が示す最重要点は「graph を作ればよい」ではない。Graph-context は完全方式と同一 graph を使いながら distinct boundary が 9 で、graph を持たない prompt-only の 12 さえ下回った。自由文の context は LLM に構造を活用させる保証にならない。一方、node / edge / guard の位置を明示的な work queue に変換し、一地点ずつ test を作る方式は 23 に増えた。これは我々の記憶システムにも通じる。知識を長い prompt に入れるだけでなく、「どの境界をまだ検査していないか」という列挙可能な状態へ変換して初めて coverage が生まれる。

ただし完全方式の boundary test validity は 0.78 で、prompt-only の 0.96、Graph-context の 1.00 より低い。広い場所を攻めるほど無効 test も増える。airline の完全方式は 285 LLM calls、1.55M tokens、約 2.5 時間を使い、distinct boundary 当たりは効率的でも絶対費用は軽くない。

oracle にも明確な穴がある。process / guard violation の mutation 27 件に対し judge が検出したのは 22 件、感度 0.81 だった。誤った fare や status のような値 fault は期待値を test plan に記録すれば検出できたが、backend state だけが壊れ会話が正しく見える fault は構造上検出不能である。評価指標自体も LLM auditor に依存し、false-alarm label は独立な人手検証がない。さらに各 configuration は単一 run、対象は同一 model family で動く 4 つの text service domain に限られる。open-ended、非反復的、非会話的な system では graph が薄くなり得る。

■ 自分達の環境への適用
最初の適用先は、分岐 NPC、quest、tutorial、shop、セーブ上書きなど、特定 state 後だけ判断が変わるゲーム機能である。headless trace から小さな graph を作り、node を `quest_offered`、`item_owned`、`confirm_purchase` のような activity、edge を player action とする。各 boundary に replay sequence と一個の perturbation を付ける。購入確認なら、商品選択まで replay した後、確認拒否、所持金不足化、二重入力を試し、inventory・currency・UI message を oracle にする。

ここでは論文より強い oracle を使える。ゲーム内部の headless harness では会話や表示だけでなく、state snapshot、event log、保存データ差分を取得できるため、「返答は正しいが backend が壊れた」見逃しを防げる。black-box graph は test target 発見に使い、合否は deterministic assertion を優先する。LLM judge は自然言語 NPC の整合性や、期待値を完全には列挙できない箇所だけに限定する。

記憶・制作サイクルでは phase 間の guard を検査対象にする。`gate_decision: pass` なしの投稿、投稿成功前の `status: posted`、evidence なしの pending close は boundary violation である。正常 staging を replay fixture にし、frontmatter の欠落や順序逆転を perturbation とすれば、運用退行を deterministic に検査できる。

小さな検証は 1 workflow・5 boundary・各 3 perturbation で十分である。固定 seed で trace を採取し、(1) 到達成功率、(2) distinct boundary coverage、(3) 無効 test 率、(4) duplicate rate、(5) deterministic oracle と LLM judge の不一致、(6) boundary 当たり token / 実行時間を記録する。graph-context 型と structural-target 型を同じ trace で比較し、後者が coverage を増やしても無効 test と保守費を含めて得かを判断する。

■ メリット・デメリット
メリットは、内部仕様が不完全でも実際の振る舞いから到達経路を作れ、単発 test が届かない stateful bug を再現可能な資産へ変えられること、構造位置の列挙により test の貼り回しと重複を減らせること、model や prompt 更新後の regression test に再利用できることにある。特に「知識を context に置く」と「未検査地点を work queue にする」の差は、headless 評価と記憶運用の双方にそのまま使える。

デメリットは、採掘 graph が観測済み trace に依存し、未到達 route を網羅した保証がないこと、directly-follows graph が実際には通れない組合せを暗示し得ること、広い coverage と引き換えに無効 test が増えること、LLM runner / judge の非決定性と費用が残ることだ。会話だけの oracle をゲームへ直輸入すると、inventory、physics、save、economy など内部 state の silent corruption を見逃す。したがって graph は仕様や oracle の代替ではなく、test target と到達 sequence を発見する補助として扱う必要がある。

■ 判定
部分採用。workflow graph の全文脈投入ではなく、構造的位置を明示的な test queue に変換し、境界直前 replay と一点 perturbation を組み合わせる設計を採る。一方、可視会話だけの LLM oracle と全面自動化は採らず、headless state assertion を主 oracle にした小規模 probe で coverage、無効率、費用を測ってから拡張する。

■ URL
https://arxiv.org/abs/2607.06873
