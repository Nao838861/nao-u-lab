■ 概要
Bayesian-Agent は、LLM agent の性能改善を「成功例を見たから prompt や SOP を増やす」という足し算ではなく、skill や SOP を「特定の prompt、context、harness 環境で frozen model が成功するかについての仮説」として扱う枠組みである。対象にしている外部条件は prompts、tools、memory、SOPs、skills、harness feedback で、モデル重みを変えずに実行品質を上げられる一方、従来は heuristic reflection や成功/失敗回数の単純集計で更新されがちだった。

中核は、verified trajectory evidence を集め、skill ごとに feature-conditioned categorical posterior を維持し、その posterior state を patch / split / compress / retire / explore のような監査可能な action へ写像する点にある。model-facing prompt には実行可能な guardrail と failure-mode patch を入れ、posterior summary は監査用に残す。評価では deepseek-v4-flash を使い、incremental repair により SOP-Bench が 80% から 95%、Lifelong AgentBench が 90% から 100%、RealFin-Bench が 45% から 65% に改善したと報告している。さらに native backend だけでなく GenericAgent、mini-swe-agent、Claude Code backend も評価対象に含めている。

結論は、agent の skill evolution を無制限な prompt accumulation と見るべきではなく、posterior-guided harness optimization として見るべきだというもの。成功した手順を「良いルール」として固定するのではなく、どの条件で効いたのか、どの条件では飽和・悪化・不要化するのかを、後から退役や分割ができる形で持つ設計になっている。

■ 内容分析
この論文の価値は、agent 改善で一番壊れやすい「経験の蓄積」を、単なる記憶追加ではなく信念更新の対象に戻している点にある。LLM agent の運用では、失敗後に「次からは X する」と SOP を足すのは簡単だが、その SOP が本当に causal に効いたのか、別の harness では邪魔にならないか、状況が変わった後も残すべきかは分かりにくい。Bayesian-Agent は、skill / SOP を再利用可能資産として尊重しつつ、成功回数だけで強化せず、trajectory evidence と feature 条件に結び付けて posterior を更新する。

patch / split / compress / retire / explore という action 設計も重要である。patch は失敗条件への局所修正、split は一枚岩の rule を条件別に分ける操作、compress は重複や肥大化した手順の圧縮、retire は効かなくなったものの退役、explore は証拠不足領域の探索に相当する。これは「ルールを増やす」だけでは表現できない lifecycle で、特に retire と split が入っているため、長期運用でルールが腐る問題に直接触れている。

一方で、限界も明確である。posterior の品質は feature 設計と verified trajectory の品質に強く依存する。何を feature として切るかが雑だと、posterior は精密そうに見えるだけの別形式の heuristic になる。評価値の改善も、SOP-Bench などの harness 上での改善であって、ゲーム制作の操作感や面白さのような主観的品質にそのまま移せるわけではない。また、backend をまたいで評価しているとはいえ、posterior 更新のための観測設計を作るコストは低くない。小さいチームで導入するなら、全自動の skill evolution system を作るより、まず「どの lesson をどの条件で使うか」を記録する薄い層から始めるのが現実的である。

■ 自分達の環境への適用
自分達の環境では、game_design_rules、game lesson、shared-reads directive、headless evaluator、Slack 指示処理がすでに増え続けている。ここで一番危ないのは、過去に一度効いた判断を恒久ルールとして積み上げ、次のゲームや phase では条件が違うのに同じ rule を強制すること。Bayesian-Agent の見方を使うなら、各 rule / lesson を「普遍命令」ではなく「条件付きで効く仮説」として扱える。

具体的には、game lesson atom や AGENTS.md 的ルールに、成功/失敗回数ではなく条件付き evidence を持たせる。たとえば「UI テキストを増やしすぎない」は、ミニゲームの初回理解では効くが、複雑なシミュレーションの debug view では逆効果になる可能性がある。「headless evaluator を先に作る」は、物理やルール判定が中心のゲームでは強いが、触感や演出が中心の試作では evaluator が見当違いになることがある。これらを posterior 的に扱うなら、lesson ごとに `conditions / supporting_evidence / failure_modes / retire_trigger` を持たせ、採用時に「今回の条件と一致しているか」を見る。

小さな検証案としては、まず memory atom や candidate に対して patch / split / compress / retire / explore の lifecycle label を追加するのがよい。全自動推定ではなく、Phase 3b や Phase 4a で 1 件だけ選び、「この lesson は今回の playable diff で再利用されたか」「条件が狭すぎるなら split するか」「似た rule と compress できるか」「もう使われないなら retire 候補か」を記録する。headless 評価側では、成功率だけでなく「どの lesson を使った build か」をログに残せば、後から効いた rule と邪魔だった rule を分離しやすくなる。

■ メリット・デメリット
メリットは、記憶とルールの肥大化を「もっと厳しいルールで抑える」のではなく、証拠付き lifecycle として扱えること。特に split / compress / retire は、shared-reads や game lesson が増え続ける自分達の運用に合う。もう一つの利点は、成功例を神格化しない点で、過去のよい playable diff から得た lesson も、条件が変われば仮説に戻せる。

デメリットは、posterior という言葉に引っ張られて、観測が薄いのに数理的に管理できている気分になりやすいこと。feature 設計、trajectory の検証、成功判定の粒度が弱いと、単に複雑なタグ付けになる。また、ゲーム制作では面白さや操作感の評価が harness score より曖昧なので、論文のベンチ改善をそのまま品質改善に読み替えるのは危険である。導入は軽く、まず lifecycle label と evidence の粒度改善に絞るべきである。

■ 判定
採用。大きな自動 Bayesian system としてではなく、rule / lesson / memory を条件付き仮説として扱い、patch / split / compress / retire / explore の小さな lifecycle を Phase 3b と Phase 4a に持ち込む。特に game lesson の退役条件と split 条件を明示する用途に使える。

■ URL
https://arxiv.org/abs/2606.08348v1
